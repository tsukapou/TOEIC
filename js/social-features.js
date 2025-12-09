/**
 * TOEIC学習アプリ - ソーシャル機能システム (Social Features System)
 * Version: 1.0.0
 * Updated: 2025-12-09
 * 
 * 【システム概要】
 * バイラル成長を実現するソーシャル機能
 * - ランキングシステム（全国・友達）
 * - SNSシェア機能（Twitter/LINE）
 * - スコア/実績共有機能
 * - フレンド招待機能
 * 
 * 【期待効果】
 * - 月間900人の自然流入（DAU 10,000人想定）
 * - 口コミによる無料集客
 * - ユーザーエンゲージメント向上
 * - 学習モチベーション維持
 */

class SocialFeatures {
    constructor() {
        this.STORAGE_KEY = 'toeic_social_data';
        this.init();
    }
    
    init() {
        this.loadSocialData();
        console.log('🌐 ソーシャル機能システム初期化完了');
    }
    
    /**
     * ソーシャルデータを読み込み
     */
    loadSocialData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        
        if (!data) {
            this.socialData = {
                username: this.getUserNickname(),
                totalScore: 0,
                highScore: 0,
                totalTests: 0,
                achievements: [],
                friends: [],
                shareCount: 0,
                lastShareDate: null
            };
            this.saveSocialData();
        } else {
            this.socialData = JSON.parse(data);
        }
    }
    
    /**
     * ソーシャルデータを保存
     */
    saveSocialData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.socialData));
    }
    
    /**
     * スコアを更新
     */
    updateScore(score) {
        this.socialData.totalTests++;
        this.socialData.totalScore += score;
        
        if (score > this.socialData.highScore) {
            this.socialData.highScore = score;
        }
        
        this.saveSocialData();
    }
    
    /**
     * Twitter共有
     */
    shareToTwitter(shareType = 'score', data = {}) {
        let text = '';
        let hashtags = 'TOEIC,英語学習,PART5';
        
        switch(shareType) {
            case 'score':
                const accuracy = Math.round((data.score / data.total) * 100);
                text = `TOEIC PART5で${accuracy}%正解！スコア${data.score}/${data.total}を達成しました！🎉\\n\\nあなたもチャレンジしてみませんか？`;
                break;
            
            case 'highscore':
                text = `新記録達成！TOEIC PART5で${data.predictedScore}点レベルに到達しました！🏆\\n\\n毎日コツコツ学習した成果です💪`;
                break;
            
            case 'achievement':
                text = `実績解放「${data.achievementName}」！🎖️\\n\\nTOEIC学習を続けて新しい称号をゲット！`;
                break;
            
            case 'streak':
                text = `${data.streak}日連続学習達成！🔥\\n\\n継続は力なり！毎日の積み重ねでTOEICスコアアップを目指しています💪`;
                break;
        }
        
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${hashtags}`;
        window.open(url, '_blank', 'width=550,height=420');
        
        // シェアを記録
        this.recordShare('twitter', shareType);
    }
    
    /**
     * LINE共有
     */
    shareToLine(shareType = 'score', data = {}) {
        let text = '';
        
        switch(shareType) {
            case 'score':
                const accuracy = Math.round((data.score / data.total) * 100);
                text = `TOEIC PART5で${accuracy}%正解！\\nスコア${data.score}/${data.total}を達成しました！🎉`;
                break;
            
            case 'highscore':
                text = `新記録達成！\\nTOEIC PART5で${data.predictedScore}点レベルに到達！🏆`;
                break;
            
            case 'achievement':
                text = `実績「${data.achievementName}」解放！🎖️`;
                break;
            
            case 'streak':
                text = `${data.streak}日連続学習達成！🔥\\n継続は力なり！`;
                break;
        }
        
        const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        
        // シェアを記録
        this.recordShare('line', shareType);
    }
    
    /**
     * シェアを記録
     */
    recordShare(platform, shareType) {
        this.socialData.shareCount++;
        this.socialData.lastShareDate = Date.now();
        this.saveSocialData();
        
        // アナリティクスに記録
        if (window.adminAnalytics) {
            window.adminAnalytics.recordActivity('social_share', {
                platform: platform,
                shareType: shareType
            });
        }
        
        // トースト通知
        if (window.toastManager) {
            window.toastManager.show(
                `🎉 ${platform === 'twitter' ? 'Twitter' : 'LINE'}でシェアしました！`,
                'success',
                3000
            );
        }
    }
    
    /**
     * シェアボタンUIを表示
     */
    showShareButtons(shareType, data) {
        // 既存のボタンがあれば削除
        const existingButtons = document.getElementById('socialShareButtons');
        if (existingButtons) {
            existingButtons.remove();
        }
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.id = 'socialShareButtons';
        buttonsContainer.className = 'social-share-buttons';
        buttonsContainer.innerHTML = `
            <div class="share-buttons-content">
                <h3>🌐 シェアして友達に自慢しよう！</h3>
                <div class="share-buttons-row">
                    <button class="btn-share-twitter" onclick="window.socialFeatures.shareToTwitter('${shareType}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                        </svg>
                        Twitterでシェア
                    </button>
                    <button class="btn-share-line" onclick="window.socialFeatures.shareToLine('${shareType}', ${JSON.stringify(data).replace(/"/g, '&quot;')})">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"></path>
                        </svg>
                        LINEでシェア
                    </button>
                </div>
                <p class="share-note">※シェアすると友達も学習を始めやすくなります！</p>
            </div>
        `;
        
        return buttonsContainer;
    }
    
    /**
     * ランキングデータを取得（デモ版）
     */
    getRankingData() {
        // 実際にはサーバーから取得するが、デモ版ではローカルデータ+ダミーデータ
        const myScore = this.socialData.highScore;
        const myTests = this.socialData.totalTests;
        
        // ダミーランキングデータ
        const dummyUsers = [
            { username: '英語マスター太郎', highScore: 30, totalTests: 150 },
            { username: 'TOEIC900ホルダー', highScore: 29, totalTests: 200 },
            { username: '留学準備中', highScore: 28, totalTests: 120 },
            { username: '昇進目指す', highScore: 27, totalTests: 90 },
            { username: 'グローバル志向', highScore: 26, totalTests: 85 },
            { username: '英会話好き', highScore: 25, totalTests: 75 },
            { username: '転職活動中', highScore: 24, totalTests: 60 },
            { username: 'スキルアップ', highScore: 23, totalTests: 55 },
            { username: '自己啓発', highScore: 22, totalTests: 50 }
        ];
        
        // 自分のデータを追加
        const allUsers = [
            ...dummyUsers,
            { 
                username: this.socialData.username + ' (あなた)', 
                highScore: myScore, 
                totalTests: myTests,
                isMe: true
            }
        ];
        
        // スコア順にソート
        allUsers.sort((a, b) => {
            if (b.highScore !== a.highScore) {
                return b.highScore - a.highScore;
            }
            return b.totalTests - a.totalTests;
        });
        
        // 順位を付ける
        allUsers.forEach((user, index) => {
            user.rank = index + 1;
        });
        
        return allUsers;
    }
    
    /**
     * ヘルパー：ユーザーニックネームを取得
     */
    getUserNickname() {
        const userProfile = localStorage.getItem('toeic_user_profile');
        if (userProfile) {
            const profile = JSON.parse(userProfile);
            return profile.nickname || 'ゲスト';
        }
        return 'ゲスト';
    }
}

// グローバルインスタンス
window.socialFeatures = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.socialFeatures = new SocialFeatures();
});
