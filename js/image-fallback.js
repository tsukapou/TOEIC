/**
 * Image Fallback System
 * 画像ロードエラー時のフォールバック処理
 * 
 * 機能:
 * - 画像404/403エラーの自動検出
 * - SVGプレースホルダー画像の生成
 * - エラーログの抑制
 * - パフォーマンス向上（タイムアウト待機の削減）
 * 
 * 実装日: 2025-12-09
 */

const ImageFallback = {
    // フォールバック画像（SVG Data URI）
    fallbackImages: {
        // 秘書アバター用のプレースホルダー（優しい雰囲気）
        secretary: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f4f8'/%3E%3Ccircle cx='100' cy='80' r='35' fill='%23cbd5e0'/%3E%3Cpath d='M60 140 Q100 120 140 140 L140 200 L60 200 Z' fill='%23cbd5e0'/%3E%3Ctext x='100' y='170' font-family='Arial' font-size='14' fill='%23718096' text-anchor='middle'%3E秘書%3C/text%3E%3C/svg%3E`,
        
        // 一般用プレースホルダー
        default: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e2e8f0'/%3E%3Ctext x='100' y='100' font-family='Arial' font-size='16' fill='%23a0aec0' text-anchor='middle' dominant-baseline='middle'%3E画像を読み込めません%3C/text%3E%3C/svg%3E`
    },

    /**
     * 画像のプリロードとエラーハンドリング
     * @param {string} url - 画像URL
     * @param {string} fallbackType - フォールバック種類（'secretary' または 'default'）
     * @returns {Promise<string>} - 有効な画像URL
     */
    async loadImage(url, fallbackType = 'default') {
        return new Promise((resolve) => {
            // 既にData URIの場合はそのまま返す
            if (url.startsWith('data:')) {
                resolve(url);
                return;
            }

            const img = new Image();
            const timeout = setTimeout(() => {
                console.warn(`⏱️ 画像ロードタイムアウト: ${url}`);
                resolve(this.fallbackImages[fallbackType]);
            }, 3000); // 3秒でタイムアウト

            img.onload = () => {
                clearTimeout(timeout);
                resolve(url);
            };

            img.onerror = () => {
                clearTimeout(timeout);
                console.warn(`❌ 画像ロード失敗: ${url} → フォールバック使用`);
                resolve(this.fallbackImages[fallbackType]);
            };

            img.src = url;
        });
    },

    /**
     * 複数画像のバッチプリロード
     * @param {Array<{url: string, type: string}>} images - 画像配列
     * @returns {Promise<Object>} - URL→有効なURL のマップ
     */
    async loadImages(images) {
        const results = {};
        const promises = images.map(async ({url, type}) => {
            const validUrl = await this.loadImage(url, type);
            results[url] = validUrl;
        });
        
        await Promise.all(promises);
        return results;
    },

    /**
     * 既存のimg要素にエラーハンドリングを追加
     * @param {string} selector - セレクタ（例: '.secretary-avatar'）
     * @param {string} fallbackType - フォールバック種類
     */
    applyToElements(selector, fallbackType = 'default') {
        const elements = document.querySelectorAll(selector);
        elements.forEach(img => {
            // 既にエラーハンドラが設定されている場合はスキップ
            if (img.dataset.fallbackApplied) return;
            
            img.dataset.fallbackApplied = 'true';
            
            img.addEventListener('error', () => {
                console.warn(`❌ 画像エラー: ${img.src} → フォールバック使用`);
                img.src = this.fallbackImages[fallbackType];
            });
        });
    },

    /**
     * グローバルエラーハンドラの設定（全img要素に適用）
     */
    setupGlobalHandler() {
        // リソースエラー（403, 404等）をキャッチ
        window.addEventListener('error', (e) => {
            // 画像リソースのエラーかチェック
            if (e.target && e.target.tagName === 'IMG') {
                const img = e.target;
                
                // 既にフォールバック画像の場合はスキップ
                if (img.src.startsWith('data:')) return;
                
                // 秘書関連の画像かチェック
                const isSecretary = img.classList.contains('secretary-avatar') || 
                                  img.classList.contains('secretary-image') ||
                                  (img.alt && img.alt.includes('秘書'));
                
                const fallbackType = isSecretary ? 'secretary' : 'default';
                
                // コンソールログを1回だけ表示（重複防止）
                if (!img.dataset.errorLogged) {
                    img.dataset.errorLogged = 'true';
                    console.info(`🖼️ 画像フォールバック適用: ${fallbackType}`);
                }
                
                img.src = this.fallbackImages[fallbackType];
                
                // エラーイベントの伝播を停止（コンソールエラーを抑制）
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true); // useCapture = true で子要素のエラーもキャッチ
        
        // DOM要素のerrorイベントもキャッチ
        document.addEventListener('error', (e) => {
            if (e.target && e.target.tagName === 'IMG') {
                const img = e.target;
                
                // 既にフォールバック画像の場合はスキップ
                if (img.src.startsWith('data:')) return;
                
                // 秘書関連の画像かチェック
                const isSecretary = img.classList.contains('secretary-avatar') || 
                                  img.classList.contains('secretary-image') ||
                                  (img.alt && img.alt.includes('秘書'));
                
                const fallbackType = isSecretary ? 'secretary' : 'default';
                
                // コンソールログを1回だけ表示（重複防止）
                if (!img.dataset.errorLogged) {
                    img.dataset.errorLogged = 'true';
                    console.info(`🖼️ 画像フォールバック適用: ${fallbackType}`);
                }
                
                img.src = this.fallbackImages[fallbackType];
            }
        }, true); // useCapture = true で子要素のエラーもキャッチ
    },

    /**
     * 初期化（ページロード時に呼び出し）
     */
    init() {
        console.log('🖼️ Image Fallback System 初期化中...');
        
        // グローバルエラーハンドラを設定（最優先）
        this.setupGlobalHandler();
        
        // MutationObserverで動的に追加される画像も監視
        this.observeDynamicImages();
        
        // 既存の秘書アバター画像にフォールバックを適用
        this.applyToElements('.secretary-avatar', 'secretary');
        this.applyToElements('.secretary-image', 'secretary');
        
        console.log('✅ Image Fallback System 初期化完了');
    },

    /**
     * 動的に追加される画像を監視
     */
    observeDynamicImages() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // img要素自体が追加された場合
                        if (node.tagName === 'IMG') {
                            this.applyErrorHandler(node);
                        }
                        // img要素を含む要素が追加された場合
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        images.forEach(img => this.applyErrorHandler(img));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * 個別の画像要素にエラーハンドラを適用
     */
    applyErrorHandler(img) {
        // 既にハンドラが設定されている場合はスキップ
        if (img.dataset.fallbackApplied) return;
        
        img.dataset.fallbackApplied = 'true';
        
        img.addEventListener('error', () => {
            // 既にフォールバック画像の場合はスキップ
            if (img.src.startsWith('data:')) return;
            
            const isSecretary = img.classList.contains('secretary-avatar') || 
                              img.classList.contains('secretary-image') ||
                              (img.alt && img.alt.includes('秘書'));
            
            const fallbackType = isSecretary ? 'secretary' : 'default';
            
            if (!img.dataset.errorLogged) {
                img.dataset.errorLogged = 'true';
                console.info(`🖼️ 画像フォールバック適用: ${fallbackType}`);
            }
            
            img.src = this.fallbackImages[fallbackType];
        });
    }
};

// できるだけ早く初期化（DOMContentLoadedを待たない）
ImageFallback.init();

// グローバルに公開
window.ImageFallback = ImageFallback;
