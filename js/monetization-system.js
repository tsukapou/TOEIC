/**
 * TOEIC学習アプリ - 収益化システム (Monetization System)
 * Version: 1.0.0
 * Updated: 2025-12-09
 * 
 * 【システム概要】
 * Freemiumモデルによる収益化を実現
 * - Free Plan: 基本機能、1日5回テスト制限
 * - Premium Plan: 全機能解放、¥980/月
 * 
 * 【購入トリガー】
 * 1. 5回テスト完了後
 * 2. スコア800点到達時
 * 3. 秘書解放時（4人目以降）
 * 4. 7日連続学習達成時
 * 5. 弱点分析機能使用時
 * 
 * 【期待効果】
 * - 月間売上: ¥490,000 (DAU 1,000人、コンバージョン率5%)
 * - 年間売上: ¥5,880,000 (保守的シナリオ)
 * - 年間売上: ¥58,800,000 (楽観的シナリオ、DAU 10,000人)
 */

class MonetizationSystem {
    constructor() {
        // プランタイプ
        this.PLAN_TYPE = {
            FREE: 'free',
            PREMIUM: 'premium'
        };
        
        // 料金設定
        this.PRICING = {
            MONTHLY: 980,
            CURRENCY: 'JPY'
        };
        
        // 無料プラン制限
        this.FREE_LIMITS = {
            DAILY_TESTS: 5,
            MAX_SECRETARIES: 3,
            ANALYTICS_HISTORY: 7 // days
        };
        
        this.init();
    }
    
    init() {
        this.loadUserPlan();
        this.setupPurchaseTriggers();
        console.log('💰 収益化システム初期化完了');
    }
    
    /**
     * ユーザープラン情報を読み込み
     */
    loadUserPlan() {
        const userPlan = localStorage.getItem('toeic_user_plan');
        
        if (!userPlan) {
            // 初回ユーザーはFreeプラン
            this.currentPlan = {
                type: this.PLAN_TYPE.FREE,
                startDate: Date.now(),
                expiryDate: null,
                testCount: 0,
                dailyTestCount: 0,
                lastTestDate: null
            };
            this.saveUserPlan();
        } else {
            this.currentPlan = JSON.parse(userPlan);
        }
        
        // 日付が変わったらdailyTestCountをリセット
        const today = new Date().toDateString();
        const lastTestDate = this.currentPlan.lastTestDate ? new Date(this.currentPlan.lastTestDate).toDateString() : null;
        
        if (today !== lastTestDate) {
            this.currentPlan.dailyTestCount = 0;
            this.currentPlan.lastTestDate = Date.now();
            this.saveUserPlan();
        }
    }
    
    /**
     * プラン情報を保存
     */
    saveUserPlan() {
        localStorage.setItem('toeic_user_plan', JSON.stringify(this.currentPlan));
    }
    
    /**
     * Premiumユーザーかチェック
     */
    isPremium() {
        if (this.currentPlan.type === this.PLAN_TYPE.PREMIUM) {
            // 有効期限チェック
            if (this.currentPlan.expiryDate && Date.now() > this.currentPlan.expiryDate) {
                // 期限切れ
                this.downgradeToPlan();
                return false;
            }
            return true;
        }
        return false;
    }
    
    /**
     * 本日のテスト実施可能かチェック
     */
    canTakeTest() {
        if (this.isPremium()) {
            return true; // Premium は無制限
        }
        
        return this.currentPlan.dailyTestCount < this.FREE_LIMITS.DAILY_TESTS;
    }
    
    /**
     * テスト実施記録
     */
    recordTest() {
        this.currentPlan.testCount++;
        this.currentPlan.dailyTestCount++;
        this.currentPlan.lastTestDate = Date.now();
        this.saveUserPlan();
        
        // 購入トリガーチェック
        this.checkPurchaseTriggers();
    }
    
    /**
     * 秘書解放チェック
     */
    canUnlockSecretary(secretaryCount) {
        if (this.isPremium()) {
            return true;
        }
        
        return secretaryCount < this.FREE_LIMITS.MAX_SECRETARIES;
    }
    
    /**
     * 購入トリガーセットアップ
     */
    setupPurchaseTriggers() {
        this.triggers = {
            // トリガー1: 5回テスト完了後
            AFTER_5_TESTS: {
                condition: () => this.currentPlan.testCount >= 5,
                message: '🎉 おめでとうございます！5回のテストを完了しました！\n\nPremiumプランでさらに学習を加速させませんか？',
                title: '学習習慣が身につきました！'
            },
            
            // トリガー2: スコア800点到達
            SCORE_800: {
                condition: (score) => score >= 800,
                message: '🏆 素晴らしい！スコア800点到達！\n\nPremiumプランで全秘書を解放して、さらに高みを目指しましょう！',
                title: 'ハイスコア達成！'
            },
            
            // トリガー3: 4人目の秘書解放試行時
            SECRETARY_UNLOCK: {
                condition: (count) => count >= this.FREE_LIMITS.MAX_SECRETARIES,
                message: '💼 無料プランでは3人まで秘書を選べます。\n\nPremiumプランで全23人の秘書を解放しませんか？',
                title: '秘書を追加解放'
            },
            
            // トリガー4: 7日連続学習達成
            STREAK_7: {
                condition: (streak) => streak >= 7,
                message: '🔥 7日連続学習達成！素晴らしい努力です！\n\nPremiumプランで詳細な学習分析を活用しましょう！',
                title: '継続学習の達人！'
            },
            
            // トリガー5: 弱点分析機能使用試行
            WEAKNESS_ANALYSIS: {
                condition: () => !this.isPremium(),
                message: '📊 弱点分析はPremium機能です。\n\nあなたの弱点を徹底分析して、効率的に学習を進めませんか？',
                title: 'さらに効率的な学習を'
            }
        };
    }
    
    /**
     * 購入トリガーチェック
     */
    checkPurchaseTriggers() {
        if (this.isPremium()) {
            return; // Premium ユーザーには不要
        }
        
        // トリガー1: 5回テスト完了
        if (this.triggers.AFTER_5_TESTS.condition()) {
            this.showPurchasePrompt('AFTER_5_TESTS');
        }
    }
    
    /**
     * 購入促進モーダル表示
     */
    showPurchasePrompt(triggerKey) {
        const trigger = this.triggers[triggerKey];
        
        // 同じトリガーは1日1回まで
        const lastShown = localStorage.getItem(`purchase_prompt_${triggerKey}`);
        const today = new Date().toDateString();
        
        if (lastShown === today) {
            return;
        }
        
        // モーダルを表示
        this.displayPurchaseModal(trigger.title, trigger.message);
        
        // 表示記録
        localStorage.setItem(`purchase_prompt_${triggerKey}`, today);
    }
    
    /**
     * 購入モーダルUI表示
     */
    displayPurchaseModal(title, message) {
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('premiumPurchaseModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'premiumPurchaseModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content premium-modal">
                <div class="premium-header">
                    <h2>✨ ${title}</h2>
                    <button class="modal-close" onclick="window.monetizationSystem.closePurchaseModal()">&times;</button>
                </div>
                
                <div class="premium-body">
                    <p class="premium-message">${message}</p>
                    
                    <div class="premium-plan-box">
                        <div class="plan-badge">Premium Plan</div>
                        <div class="plan-price">
                            <span class="price-amount">¥980</span>
                            <span class="price-period">/月</span>
                        </div>
                        
                        <div class="plan-features">
                            <h3>🎁 Premium機能</h3>
                            <ul>
                                <li>✅ 無制限テスト実施</li>
                                <li>✅ 全23人の秘書解放</li>
                                <li>✅ 詳細な学習分析</li>
                                <li>✅ 弱点トレーニング</li>
                                <li>✅ アダプティブ学習エンジン</li>
                                <li>✅ 過去30日の学習履歴</li>
                                <li>✅ オフライン学習対応</li>
                                <li>✅ 広告非表示</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="premium-actions">
                        <button class="btn-premium-purchase" onclick="window.monetizationSystem.handlePurchase()">
                            🚀 Premiumプランを購入
                        </button>
                        <button class="btn-premium-later" onclick="window.monetizationSystem.closePurchaseModal()">
                            後で
                        </button>
                    </div>
                    
                    <p class="premium-note">
                        ※ 本アプリはデモ版のため、実際の課金は行われません
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // フェードイン
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    /**
     * モーダルを閉じる
     */
    closePurchaseModal() {
        const modal = document.getElementById('premiumPurchaseModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    /**
     * 購入処理（デモ版）
     */
    handlePurchase() {
        // デモ版では即座にPremiumへアップグレード
        this.upgradeToPremium();
        
        // 📊 アナリティクスに購入を記録（NEW! 2025-12-09）
        if (window.adminAnalytics) {
            window.adminAnalytics.recordPremiumPurchase({
                plan: 'premium',
                amount: this.PRICING.MONTHLY,
                currency: this.PRICING.CURRENCY
            });
        }
        
        this.closePurchaseModal();
        
        // 成功通知
        if (window.toastManager) {
            window.toastManager.show(
                '🎉 Premiumプラン有効化完了！全機能をお楽しみください！',
                'success',
                5000
            );
        }
    }
    
    /**
     * Premiumへアップグレード
     */
    upgradeToPremium() {
        this.currentPlan.type = this.PLAN_TYPE.PREMIUM;
        this.currentPlan.startDate = Date.now();
        this.currentPlan.expiryDate = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30日後
        this.saveUserPlan();
        
        console.log('✅ Premiumプランへアップグレード完了');
    }
    
    /**
     * Freeプランへダウングレード
     */
    downgradeToPlan() {
        this.currentPlan.type = this.PLAN_TYPE.FREE;
        this.currentPlan.expiryDate = null;
        this.saveUserPlan();
        
        console.log('⚠️ Freeプランへダウングレード');
    }
    
    /**
     * プラン状態を取得
     */
    getPlanStatus() {
        return {
            isPremium: this.isPremium(),
            planType: this.currentPlan.type,
            testCount: this.currentPlan.testCount,
            dailyTestCount: this.currentPlan.dailyTestCount,
            remainingTests: this.isPremium() ? '無制限' : (this.FREE_LIMITS.DAILY_TESTS - this.currentPlan.dailyTestCount),
            expiryDate: this.currentPlan.expiryDate
        };
    }
}

// グローバルインスタンス
window.monetizationSystem = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.monetizationSystem = new MonetizationSystem();
});
