/**
 * 🎉 Achievement UI & Unlock Animation
 * 実績UI・解除演出システム
 * 
 * 【機能】
 * 1. 実績解除演出（アニメーション・サウンド）
 * 2. 実績一覧画面
 * 3. プログレスバー表示
 * 4. フィルター機能
 * 
 * 実装日: 2025-12-09
 */

const AchievementUI = {
    /**
     * 実績解除演出を表示
     * @param {Object} achievement - 解除された実績
     */
    showUnlockAnimation: function(achievement) {
        console.log(`🎉 実績解除演出開始: ${achievement.name}`);
        
        // 既存の演出を削除
        const existing = document.getElementById('achievementUnlockOverlay');
        if (existing) existing.remove();
        
        // レアリティカラー
        const rarityColors = {
            'common': '#10b981',
            'uncommon': '#3b82f6',
            'rare': '#8b5cf6',
            'epic': '#ec4899',
            'legendary': '#f59e0b'
        };
        
        const color = rarityColors[achievement.rarity] || '#10b981';
        
        // オーバーレイを作成
        const overlay = document.createElement('div');
        overlay.id = 'achievementUnlockOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        `;
        
        // 実績カードを作成
        overlay.innerHTML = `
            <div class="achievement-unlock-card" style="
                background: white;
                border-radius: 20px;
                padding: 3rem;
                max-width: 500px;
                width: 90%;
                text-align: center;
                box-shadow: 0 25px 50px rgba(0,0,0,0.5);
                animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                position: relative;
                overflow: hidden;
            ">
                <!-- レアリティエフェクト -->
                <div style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, ${color}, ${color}AA, ${color});
                "></div>
                
                <!-- 紙吹雪エフェクト -->
                <div class="confetti-container"></div>
                
                <!-- 実績解除テキスト -->
                <div style="
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: ${color};
                    margin-bottom: 1.5rem;
                    animation: pulse 1s ease-in-out infinite;
                ">
                    🎉 実績解除！
                </div>
                
                <!-- アイコン -->
                <div style="
                    font-size: 5rem;
                    margin: 1rem 0;
                    animation: bounce 1s ease-in-out infinite;
                ">
                    ${achievement.icon}
                </div>
                
                <!-- 実績名 -->
                <div style="
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 1rem 0;
                ">
                    ${achievement.name}
                </div>
                
                <!-- 説明 -->
                <div style="
                    font-size: 1rem;
                    color: #6b7280;
                    margin: 1rem 0 1.5rem 0;
                ">
                    ${achievement.description}
                </div>
                
                <!-- レアリティ -->
                <div style="
                    display: inline-block;
                    padding: 0.5rem 1rem;
                    background: ${color}22;
                    color: ${color};
                    border-radius: 999px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                ">
                    ${this.getRarityLabel(achievement.rarity)}
                </div>
                
                <!-- ポイント -->
                <div style="
                    font-size: 1.2rem;
                    color: #f59e0b;
                    font-weight: 700;
                    margin: 1rem 0 1.5rem 0;
                ">
                    +${achievement.points}pt
                </div>
                
                <!-- 閉じるボタン -->
                <button onclick="AchievementUI.closeUnlockAnimation()" style="
                    background: ${color};
                    color: white;
                    border: none;
                    padding: 0.875rem 2rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    確認
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // 紙吹雪エフェクト
        this.createConfetti(overlay.querySelector('.confetti-container'), color);
        
        // Toast通知（オプション）
        if (window.ToastNotification) {
            setTimeout(() => {
                ToastNotification.show(
                    '🏆 実績解除',
                    `${achievement.name} (+${achievement.points}pt)`,
                    'success',
                    5000
                );
            }, 3000);
        }
        
        // 自動的に閉じる（10秒後）
        setTimeout(() => {
            this.closeUnlockAnimation();
        }, 10000);
    },

    /**
     * 紙吹雪エフェクトを作成
     */
    createConfetti: function(container, color) {
        const colors = [color, '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 3;
            const randomDuration = 2 + Math.random() * 2;
            
            confetti.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: ${randomColor};
                top: -10px;
                left: ${randomX}%;
                opacity: 0;
                animation: confettiFall ${randomDuration}s ease-out ${randomDelay}s infinite;
            `;
            
            container.appendChild(confetti);
        }
    },

    /**
     * 解除演出を閉じる
     */
    closeUnlockAnimation: function() {
        const overlay = document.getElementById('achievementUnlockOverlay');
        if (overlay) {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => overlay.remove(), 300);
        }
    },

    /**
     * レアリティラベルを取得
     */
    getRarityLabel: function(rarity) {
        const labels = {
            'common': '⚪ Common',
            'uncommon': '🟢 Uncommon',
            'rare': '🔵 Rare',
            'epic': '🟣 Epic',
            'legendary': '🟡 Legendary'
        };
        return labels[rarity] || rarity;
    },

    /**
     * 実績一覧画面を表示
     */
    showAchievementList: function() {
        console.log('🏆 実績一覧画面を表示');
        
        const data = AchievementSystem.loadData();
        const stats = AchievementSystem.getStatistics();
        const categories = AchievementSystem.getAllCategories();
        
        // 画面のHTML生成
        const html = `
            <div id="achievementListScreen" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                z-index: 99999;
                overflow-y: auto;
                padding: 2rem 1rem;
            ">
                <!-- ヘッダー -->
                <div style="max-width: 1200px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <h2 style="font-size: 1.8rem; font-weight: 700; color: #1f2937; margin: 0;">
                            🏆 実績
                        </h2>
                        <button onclick="AchievementUI.closeAchievementList()" style="
                            background: #e5e7eb;
                            border: none;
                            padding: 0.5rem 1rem;
                            border-radius: 8px;
                            font-size: 1rem;
                            cursor: pointer;
                        ">
                            ✕ 閉じる
                        </button>
                    </div>
                    
                    <!-- 統計サマリー -->
                    <div style="
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 2rem;
                        border-radius: 12px;
                        margin-bottom: 2rem;
                    ">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;">
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 700;">${stats.unlockedCount}</div>
                                <div style="opacity: 0.9;">解除済み</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 700;">${stats.totalCount}</div>
                                <div style="opacity: 0.9;">全実績</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 700;">${stats.completionRate}%</div>
                                <div style="opacity: 0.9;">達成率</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 2.5rem; font-weight: 700;">${stats.inProgressCount}</div>
                                <div style="opacity: 0.9;">進行中</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- カテゴリ別実績 -->
                    <div id="achievementCategoriesContainer">
                        ${this.renderAchievementCategories(categories, data)}
                    </div>
                </div>
            </div>
        `;
        
        // 既存の画面を削除して新しい画面を追加
        const existing = document.getElementById('achievementListScreen');
        if (existing) existing.remove();
        
        document.body.insertAdjacentHTML('beforeend', html);
    },

    /**
     * カテゴリ別実績をレンダリング
     */
    renderAchievementCategories: function(categories, data) {
        return categories.map(category => {
            const achievements = AchievementSystem.getAchievementsByCategory(category);
            const categoryIcon = this.getCategoryIcon(category);
            
            return `
                <div style="margin-bottom: 2rem;">
                    <h3 style="font-size: 1.3rem; font-weight: 700; color: #1f2937; margin-bottom: 1rem;">
                        ${categoryIcon} ${category}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                        ${achievements.map(achievement => this.renderAchievementCard(achievement, data)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * 実績カードをレンダリング
     */
    renderAchievementCard: function(achievement, data) {
        const isUnlocked = data.unlocked[achievement.id];
        const progress = data.progress[achievement.id] || 0;
        const condition = achievement.condition;
        const maxValue = condition.value || 100;
        const progressPercent = Math.min((progress / maxValue) * 100, 100);
        
        const rarityColors = {
            'common': '#10b981',
            'uncommon': '#3b82f6',
            'rare': '#8b5cf6',
            'epic': '#ec4899',
            'legendary': '#f59e0b'
        };
        
        const color = rarityColors[achievement.rarity] || '#10b981';
        
        return `
            <div style="
                background: ${isUnlocked ? 'white' : '#f9fafb'};
                border: 2px solid ${isUnlocked ? color : '#e5e7eb'};
                border-radius: 12px;
                padding: 1.5rem;
                opacity: ${isUnlocked ? '1' : '0.7'};
                transition: transform 0.2s, box-shadow 0.2s;
            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 16px rgba(0,0,0,0.1)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                <!-- アイコンとレアリティ -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="font-size: 2.5rem;">${achievement.icon}</div>
                    <div style="
                        font-size: 0.75rem;
                        color: ${color};
                        font-weight: 600;
                    ">
                        ${this.getRarityLabel(achievement.rarity).split(' ')[1]}
                    </div>
                </div>
                
                <!-- 名前 -->
                <div style="font-size: 1.1rem; font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">
                    ${achievement.name}
                    ${isUnlocked ? '<span style="margin-left: 0.5rem;">✓</span>' : ''}
                </div>
                
                <!-- 説明 -->
                <div style="font-size: 0.9rem; color: #6b7280; margin-bottom: 1rem;">
                    ${achievement.description}
                </div>
                
                <!-- プログレスバー -->
                ${!isUnlocked && maxValue > 1 ? `
                    <div style="margin-bottom: 0.5rem;">
                        <div style="
                            width: 100%;
                            height: 8px;
                            background: #e5e7eb;
                            border-radius: 999px;
                            overflow: hidden;
                        ">
                            <div style="
                                width: ${progressPercent}%;
                                height: 100%;
                                background: ${color};
                                transition: width 0.3s ease;
                            "></div>
                        </div>
                        <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem;">
                            ${progress} / ${maxValue}
                        </div>
                    </div>
                ` : ''}
                
                <!-- ポイント -->
                <div style="font-size: 0.9rem; color: #f59e0b; font-weight: 600;">
                    +${achievement.points}pt
                </div>
                
                <!-- 解除日時 -->
                ${isUnlocked ? `
                    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">
                        ${this.formatDate(data.unlocked[achievement.id])}
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * カテゴリアイコンを取得
     */
    getCategoryIcon: function(category) {
        const icons = {
            '学習継続': '🎯',
            'スコア達成': '📊',
            '連続記録': '🔥',
            '問題数': '📚',
            'マスター': '🎓',
            '特別': '💎'
        };
        return icons[category] || '🏆';
    },

    /**
     * 日時をフォーマット
     */
    formatDate: function(timestamp) {
        const date = new Date(timestamp);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    },

    /**
     * 実績一覧画面を閉じる
     */
    closeAchievementList: function() {
        const screen = document.getElementById('achievementListScreen');
        if (screen) {
            screen.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => screen.remove(), 300);
        }
    },

    /**
     * ホーム画面にボタンを追加
     */
    addToHomeScreen: function() {
        const homeScreen = document.getElementById('homeScreen');
        if (!homeScreen) return;
        
        // 既存のボタンを探す
        let achievementButton = document.getElementById('achievementButton');
        if (achievementButton) return; // 既に追加済み
        
        // 統計を取得
        const stats = AchievementSystem.getStatistics();
        
        // ボタンHTMLを作成
        const buttonHtml = `
            <button id="achievementButton" onclick="AchievementUI.showAchievementList()" 
                    style="
                        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                        color: white;
                        border: none;
                        padding: 1rem 1.5rem;
                        border-radius: 12px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        width: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin: 1rem 0;
                        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                        transition: transform 0.2s, box-shadow 0.2s;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(245, 158, 11, 0.4)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(245, 158, 11, 0.3)'">
                <span>🏆 実績</span>
                <span style="background: rgba(255,255,255,0.2); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.9rem;">
                    ${stats.unlockedCount}/${stats.totalCount}
                </span>
            </button>
        `;
        
        // ホーム画面のヘッダー部分に挿入
        const header = homeScreen.querySelector('.home-header') || homeScreen.querySelector('h2');
        if (header && header.parentElement) {
            header.parentElement.insertAdjacentHTML('afterend', buttonHtml);
        }
    }
};

// CSSアニメーションを追加
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        @keyframes confettiFall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.AchievementUI = AchievementUI;
    
    // ホーム画面表示時にボタンを追加
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            AchievementUI.addToHomeScreen();
        }, 1500);
    });
}
