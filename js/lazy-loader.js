/**
 * 🚀 Lazy Loading System
 * Version: 1.0.0
 * Updated: 2025-12-08
 * 
 * 【目的】
 * ページ読み込み時間を9-16秒から3秒以下に短縮
 * 
 * 【主な機能】
 * 1. 重要JSファイルの動的読み込み
 * 2. 画像・アセットの遅延読み込み
 * 3. コード分割による初期表示の高速化
 * 4. プログレス表示でUX向上
 */

class LazyLoader {
    constructor() {
        this.loadedScripts = new Set();
        this.loadedStyles = new Set();
        this.loadingPromises = new Map();
        
        // モジュールの優先度と依存関係を定義
        this.moduleConfig = {
            // 🔴 Critical: 初期表示に必須（即座に読み込む）
            critical: [
                'js/toast-notification.js', // 🔔 トースト通知システム（最優先 - エラーハンドリング）
                'js/image-lazy-loader.js', // 🖼️ 画像遅延読み込み（NEW! 2025-12-09, パフォーマンス最優先）
                'js/cloud-sync.js', // ☁️ クラウド同期システム（NEW! 2025-12-09, データ永続化）
                'js/onboarding-system.js', // 🎓 オンボーディングシステム（NEW! 2025-12-09, 初回UX）
                'js/monetization-system.js', // 💰 収益化システム（NEW! 2025-12-09, Freemium実装）
                'js/user-profile.js',
                'js/questions-database.js',
                'js/review-system.js',
                'js/streak-system.js',
                'js/app.js'
            ],
            
            // 🟡 High: ホーム画面で必要（少し遅延して読み込む）
            high: [
                'js/social-features.js', // 🌐 ソーシャル機能（NEW! 2025-12-09, SNSシェア・ランキング）
                'js/admin-analytics.js', // 📊 管理者用アナリティクス（NEW! 2025-12-09, データ分析基盤）
                'js/data-backup.js', // 🔒 データバックアップシステム（NEW! 最優先）
                'js/home-summary.js', // 🎯 ホーム画面サマリー統計（NEW! 情報整理）
                'js/learning-analytics.js', // 🧠 学習分析エンジン（NEW! 分析ダッシュボード）
                'js/analytics-dashboard.js', // 📊 分析ダッシュボードUI（NEW! 可視化）
                'js/adaptive-learning-engine.js', // 🧠 アダプティブ学習エンジン（NEW! 個別最適化）
                'js/adaptive-question-selector.js', // 🎯 アダプティブ問題選択（NEW! 最適出題）
                'js/adaptive-test-mode.js', // 🚀 アダプティブテストモード（NEW! UI制御）
                'js/achievement-system.js', // 🏆 実績システム（NEW! 2025-12-09, 自動読み込み）
                'js/achievement-ui.js', // 🎉 実績UI・演出（NEW! 2025-12-09, 自動読み込み）
                'js/achievement-integration.js', // 🔗 実績統合ヘルパー（NEW! 2025-12-09, 自動読み込み）
                'js/spaced-repetition.js',
                'js/adaptive-spaced-repetition.js',
                'js/unified-review-hub.js',
                'js/growth-dashboard.js',
                'js/daily-missions.js',
                'js/weakness-analysis.js',
                'js/personalized-learning-nav.js', // Phase 1: 超パーソナライズド学習ナビゲーション（分析）
                'js/personalized-dashboard.js', // Phase 1: 超パーソナライズド学習ナビゲーション（UI）
                'js/secretary-team.js', // Phase D: 秘書チームシステム（23人）
                'js/greeting-team-selector.js', // Phase 1: グリーティングチーム選択システム
                'js/secretary-panel.js', // Phase D: 秘書選択パネル
                'js/secretary-room-expansion.js', // Phase E: 秘書の部屋・拡張機能
                'js/secretary-motivation.js', // Phase A: モチベーションシステム
                'js/next-action.js', // Phase C: 次にやることシステム
                'js/backup-system.js' // Phase C-2: 自動バックアップシステム
            ],
            
            // 🟢 Medium: 機能利用時に読み込む（オンデマンド）
            medium: [
                'js/weakness-training.js',
                'js/mistake-notebook.js',
                'js/pattern-memorization.js',
                'js/point-rewards.js',
                'js/learning-insights.js',
                'js/learning-insights-ui.js',
                'js/secretary-unlock.js', // Phase D: 秘書解除演出
                'js/secretary-rewards-new.js' // Phase E: 秘書連動型リワードシステム
            ],
            
            // 🔵 Low: 秘書機能（ユーザーが選択した時に読み込む）
            low: [
                'js/secretary-expressions.js',
                'js/secretary-greetings.js',
                // 'js/secretary-rewards.js', // 旧版 - Phase Eでsecretary-rewards-new.jsに置き換え
                'js/secretary-daily.js',
                'js/secretary-multi.js',
                'js/greeting-team-selector.js' // グリーティング秘書選択機能
            ],
            
            // ⚪ Optional: その他（必要に応じて読み込む）
            optional: [
                'js/data-sync.js'
            ]
        };
        
        console.log('🚀 Lazy Loading System 初期化完了');
    }
    
    /**
     * スクリプトを動的に読み込む
     */
    async loadScript(src) {
        // 既に読み込み済み
        if (this.loadedScripts.has(src)) {
            return Promise.resolve();
        }
        
        // 読み込み中の場合は、既存のPromiseを返す
        if (this.loadingPromises.has(src)) {
            return this.loadingPromises.get(src);
        }
        
        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            // キャッシュバスティング: タイムスタンプを追加
            script.src = src + '?v=' + Date.now();
            script.async = true;
            
            script.onload = () => {
                this.loadedScripts.add(src);
                this.loadingPromises.delete(src);
                console.log(`✅ Loaded: ${src}`);
                resolve();
            };
            
            script.onerror = () => {
                this.loadingPromises.delete(src);
                console.error(`❌ Failed to load: ${src}`);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });
        
        this.loadingPromises.set(src, promise);
        return promise;
    }
    
    /**
     * 複数のスクリプトを並行して読み込む
     */
    async loadScripts(scripts) {
        const promises = scripts.map(src => this.loadScript(src));
        return Promise.all(promises);
    }
    
    /**
     * CSSを動的に読み込む
     */
    async loadStyle(href) {
        if (this.loadedStyles.has(href)) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onload = () => {
                this.loadedStyles.add(href);
                console.log(`✅ Loaded CSS: ${href}`);
                resolve();
            };
            
            link.onerror = () => {
                console.error(`❌ Failed to load CSS: ${href}`);
                reject(new Error(`Failed to load stylesheet: ${href}`));
            };
            
            document.head.appendChild(link);
        });
    }
    
    /**
     * 画像の遅延読み込み（Intersection Observer使用）
     */
    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                            console.log(`✅ Lazy loaded image: ${img.src}`);
                        }
                    }
                });
            }, {
                rootMargin: '50px' // 画面に入る50px前から読み込み開始
            });
            
            // data-src属性を持つすべての画像を監視
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
            
            console.log('🖼️ Image Lazy Loading セットアップ完了');
        } else {
            // Intersection Observer非対応の場合は即座に読み込む
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    /**
     * 段階的な読み込み実行
     */
    async loadByPriority() {
        const startTime = performance.now();
        
        try {
            // プログレスバー表示
            this.showLoadingProgress(20);
            
            console.log('🔴 Phase 1: Critical modules loading...');
            await this.loadScripts(this.moduleConfig.critical);
            this.showLoadingProgress(50);
            
            // Critical読み込み後、少し待ってから次へ
            await this.delay(100);
            
            console.log('🟡 Phase 2: High priority modules loading...');
            await this.loadScripts(this.moduleConfig.high);
            this.showLoadingProgress(80);
            
            // グローバル関数の公開状況を確認
            this.checkGlobalFunctions();
            
            // High読み込み後、アプリを初期化
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
            
            this.showLoadingProgress(100);
            
            // プログレスバーを1秒後に非表示
            setTimeout(() => {
                const container = document.getElementById('lazyLoadProgressContainer');
                if (container) {
                    container.style.opacity = '0';
                    setTimeout(() => {
                        container.style.display = 'none';
                    }, 300);
                }
            }, 1000);
            
            // Medium以降はバックグラウンドで読み込む
            this.loadScriptsInBackground(this.moduleConfig.medium, '🟢 Phase 3: Medium');
            this.loadScriptsInBackground(this.moduleConfig.low, '🔵 Phase 4: Low');
            this.loadScriptsInBackground(this.moduleConfig.optional, '⚪ Phase 5: Optional');
            
            // 画像の遅延読み込みをセットアップ
            this.setupImageLazyLoading();
            
            const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ 初期読み込み完了！ (${loadTime}秒)`);
            
        } catch (error) {
            console.error('❌ Lazy Loading エラー:', error);
        }
    }
    
    /**
     * バックグラウンドでスクリプトを読み込む（UIブロックしない）
     */
    async loadScriptsInBackground(scripts, label) {
        // requestIdleCallbackがあれば使用、なければsetTimeoutで代用
        const scheduleLoad = (callback) => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(callback, { timeout: 2000 });
            } else {
                setTimeout(callback, 0);
            }
        };
        
        scheduleLoad(async () => {
            console.log(`${label}: Background loading...`);
            try {
                await this.loadScripts(scripts);
                console.log(`${label}: Complete`);
            } catch (error) {
                console.error(`${label}: Error`, error);
            }
        });
    }
    
    /**
     * オンデマンドでモジュールを読み込む
     */
    async loadModuleOnDemand(moduleName) {
        const moduleMap = {
            'weakness-training': ['js/weakness-training.js'],
            'mistake-notebook': ['js/mistake-notebook.js'],
            'pattern-memorization': ['js/pattern-memorization.js'],
            'data-sync': ['js/data-sync.js'],
            'secretary': [
                'js/secretary-expressions.js',
                'js/secretary-greetings.js',
                'js/secretary-rewards.js',
                'js/secretary-daily.js',
                'js/secretary-multi.js'
            ],
            'learning-insights': [
                'js/learning-insights.js',
                'js/learning-insights-ui.js'
            ]
        };
        
        const scripts = moduleMap[moduleName];
        if (scripts) {
            console.log(`📦 On-demand loading: ${moduleName}`);
            await this.loadScripts(scripts);
            return true;
        }
        return false;
    }
    
    /**
     * ユーティリティ：遅延実行
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * ローディングプログレスを表示
     */
    showLoadingProgress(percentage) {
        const progressBar = document.getElementById('lazyLoadProgress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }
    
    /**
     * グローバル関数の公開状況を確認（app.jsで直接公開されている）
     */
    checkGlobalFunctions() {
        console.log('🔍 グローバル関数の公開状況を確認中...');
        
        const criticalFunctions = [
            'startTest', 'nextQuestion', 'previousQuestion', 'showHome', 
            'showScreen', 'renderQuestion', 'startTimer', 'selectAnswer',
            'startUnifiedReview', 'finishTest', 'updateNavigationButtons'
        ];
        
        const status = {};
        let availableCount = 0;
        
        criticalFunctions.forEach(funcName => {
            const isAvailable = typeof window[funcName] === 'function';
            status[funcName] = isAvailable ? '✅' : '❌';
            if (isAvailable) availableCount++;
        });
        
        console.log('📊 グローバル関数状況:');
        criticalFunctions.forEach(funcName => {
            console.log(`  ${funcName}: ${status[funcName]}`);
        });
        console.log(`✅ ${availableCount}/${criticalFunctions.length}個の重要関数が利用可能`);
        
        if (availableCount < criticalFunctions.length) {
            const missing = criticalFunctions.filter(name => typeof window[name] !== 'function');
            console.error('❌ 未公開の関数:', missing.join(', '));
        }
    }
}

// グローバルインスタンスを作成
window.LazyLoader = new LazyLoader();

console.log('🚀 Lazy Loading System 準備完了');
