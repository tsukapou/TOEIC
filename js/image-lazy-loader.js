/**
 * Image Lazy Loader System (Enhanced)
 * 画像の遅延読み込みシステム + IntersectionObserver
 * 
 * 機能:
 * - スクロール時に画像を遅延読み込み
 * - 初期ページロード時間を劇的に短縮
 * - 403エラーの自動フォールバック
 * - プログレッシブ画像読み込み
 * 
 * 実装日: 2025-12-09
 * 目標: ページロード時間 20秒 → 3秒以下
 */

const ImageLazyLoader = {
    // 読み込み済み画像のキャッシュ
    loadedImages: new Set(),
    
    // IntersectionObserver インスタンス
    observer: null,

    /**
     * 初期化
     */
    init() {
        console.log('🚀 Image Lazy Loader 初期化中...');
        
        // IntersectionObserver をサポートしているかチェック
        if (!('IntersectionObserver' in window)) {
            console.warn('⚠️ IntersectionObserver 非対応ブラウザ → 全画像即座に読み込み');
            this.loadAllImagesImmediately();
            return;
        }

        // オブザーバーを作成
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                // ビューポートに入る100px前に読み込み開始
                rootMargin: '100px',
                threshold: 0.01
            }
        );

        // 既存の画像要素に適用
        this.observeImages();

        // 動的に追加される画像も監視
        this.observeDynamicContent();

        console.log('✅ Image Lazy Loader 初期化完了');
    },

    /**
     * 既存の画像要素を監視対象に追加
     */
    observeImages() {
        const images = document.querySelectorAll('img[data-src], img[data-lazy]');
        
        images.forEach(img => {
            // 既に読み込み済みならスキップ
            if (this.loadedImages.has(img)) return;
            
            // オブザーバーに追加
            this.observer.observe(img);
        });

        console.log(`📸 ${images.length} 個の画像を遅延読み込み対象に設定`);
    },

    /**
     * IntersectionObserver のコールバック
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            // ビューポートに入った画像のみ処理
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    },

    /**
     * 画像を実際に読み込む
     */
    async loadImage(img) {
        // 既に読み込み済みならスキップ
        if (this.loadedImages.has(img)) return;

        const src = img.dataset.src || img.dataset.lazy;
        if (!src) return;

        // ローディング表示
        img.classList.add('lazy-loading');

        try {
            // プリロードで画像を読み込む
            const imageUrl = await ImageFallback.loadImage(src, this.getImageType(img));
            
            // 画像を適用
            img.src = imageUrl;
            img.removeAttribute('data-src');
            img.removeAttribute('data-lazy');
            
            // フェードイン効果
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-loaded');
            
            // キャッシュに追加
            this.loadedImages.add(img);

            console.log(`✅ 画像読み込み成功: ${src.substring(0, 50)}...`);
        } catch (error) {
            console.error(`❌ 画像読み込み失敗: ${src}`, error);
            
            // フォールバック画像を適用
            const fallbackType = this.getImageType(img);
            img.src = ImageFallback.fallbackImages[fallbackType];
            img.classList.remove('lazy-loading');
            img.classList.add('lazy-error');
        }
    },

    /**
     * 画像タイプを判定（secretary or default）
     */
    getImageType(img) {
        if (img.classList.contains('secretary-avatar') || 
            img.classList.contains('secretary-image') ||
            (img.alt && img.alt.includes('秘書'))) {
            return 'secretary';
        }
        return 'default';
    },

    /**
     * 動的に追加されるコンテンツを監視
     */
    observeDynamicContent() {
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // img要素自体が追加された場合
                        if (node.tagName === 'IMG' && (node.dataset.src || node.dataset.lazy)) {
                            this.observer.observe(node);
                        }
                        // img要素を含む要素が追加された場合
                        const images = node.querySelectorAll ? 
                            node.querySelectorAll('img[data-src], img[data-lazy]') : [];
                        images.forEach(img => this.observer.observe(img));
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * 全画像を即座に読み込む（IE11など古いブラウザ用）
     */
    loadAllImagesImmediately() {
        const images = document.querySelectorAll('img[data-src], img[data-lazy]');
        images.forEach(img => {
            const src = img.dataset.src || img.dataset.lazy;
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
                img.removeAttribute('data-lazy');
            }
        });
    },

    /**
     * 特定の画像を強制的に読み込む（プリロード用）
     */
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error(`Failed to load: ${url}`));
            img.src = url;
        });
    },

    /**
     * 重要な画像を優先的にプリロード
     */
    async preloadCriticalImages() {
        // 優先度の高い画像（ファーストビューに表示される画像）
        const criticalImages = document.querySelectorAll('img[data-priority="high"]');
        
        const promises = Array.from(criticalImages).map(img => {
            const src = img.dataset.src || img.dataset.lazy;
            if (src) {
                return this.loadImage(img);
            }
        });

        await Promise.all(promises);
        console.log('✅ 重要画像のプリロード完了');
    }
};

// CSS スタイルを動的に追加
const lazyLoaderStyles = document.createElement('style');
lazyLoaderStyles.textContent = `
    /* 遅延読み込み中の画像 */
    img.lazy-loading {
        opacity: 0.5;
        filter: blur(5px);
        transition: opacity 0.3s ease, filter 0.3s ease;
    }

    /* 読み込み完了後の画像 */
    img.lazy-loaded {
        opacity: 1;
        filter: blur(0);
        animation: fadeIn 0.5s ease;
    }

    /* 読み込みエラー時の画像 */
    img.lazy-error {
        opacity: 0.7;
        border: 2px dashed #e53e3e;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* プレースホルダー画像のスタイル */
    img[data-src], img[data-lazy] {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
`;
document.head.appendChild(lazyLoaderStyles);

// DOMContentLoaded 後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ImageLazyLoader.init());
} else {
    ImageLazyLoader.init();
}

// グローバルに公開
window.ImageLazyLoader = ImageLazyLoader;
