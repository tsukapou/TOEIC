/**
 * ユーザープロフィール管理システム
 * ユーザー登録・編集・表示機能
 */

const UserProfile = {
    STORAGE_KEY: 'toeic_user_profile',
    
    /**
     * プロフィールの取得
     */
    getProfile: function() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('プロフィール読み込みエラー:', error);
            return null;
        }
    },

    /**
     * プロフィールの保存
     */
    saveProfile: function(profile) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
            console.log('✅ プロフィールを保存しました:', profile);
            return true;
        } catch (error) {
            console.error('プロフィール保存エラー:', error);
            return false;
        }
    },

    /**
     * プロフィールの作成（初回登録）
     */
    createProfile: function(nickname, targetScore, purposes, examDate = null) {
        const profile = {
            nickname: nickname.trim(),
            targetScore: parseInt(targetScore),
            purposes: purposes,
            examDate: examDate || null,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        return this.saveProfile(profile);
    },

    /**
     * プロフィールの更新
     */
    updateProfile: function(updates) {
        const profile = this.getProfile();
        if (!profile) {
            console.error('プロフィールが存在しません');
            return false;
        }

        const updatedProfile = {
            ...profile,
            ...updates,
            updatedAt: Date.now()
        };

        return this.saveProfile(updatedProfile);
    },

    /**
     * 初回登録チェック
     */
    isFirstTime: function() {
        return this.getProfile() === null;
    },

    /**
     * 初期化
     */
    init: function() {
        console.log('🔧 ユーザープロフィールシステム初期化中...');
        
        // 初回登録の場合、モーダルを表示
        if (this.isFirstTime()) {
            this.showRegistrationModal();
        } else {
            // 既存ユーザーの場合、プロフィールカードを表示
            this.displayProfile();
        }

        // フォーム送信イベント
        const form = document.getElementById('userRegistrationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        console.log('✅ ユーザープロフィールシステム初期化完了');
    },

    /**
     * 登録モーダル表示
     */
    showRegistrationModal: function() {
        const modal = document.getElementById('userRegistrationModal');
        if (modal) {
            modal.style.display = 'flex';
            // 今日の日付をデフォルトに設定
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('userExamDate').setAttribute('min', today);
        }
    },

    /**
     * 登録モーダル非表示
     */
    hideRegistrationModal: function() {
        const modal = document.getElementById('userRegistrationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    /**
     * 登録処理
     */
    handleRegistration: function() {
        const nickname = document.getElementById('userNickname').value;
        const targetScore = document.getElementById('userTargetScore').value;
        const examDate = document.getElementById('userExamDate').value || null;
        
        // 目的の取得
        const purposeCheckboxes = document.querySelectorAll('input[name="purpose"]:checked');
        const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

        // バリデーション
        if (!nickname.trim()) {
            if (window.ToastSystem) {
                window.ToastSystem.warning('ニックネームを入力してください');
            } else {
                alert('ニックネームを入力してください');
            }
            return;
        }

        if (!targetScore) {
            if (window.ToastSystem) {
                window.ToastSystem.warning('目標スコアを選択してください');
            } else {
                alert('目標スコアを選択してください');
            }
            return;
        }

        // プロフィール作成
        const success = this.createProfile(nickname, targetScore, purposes, examDate);
        
        if (success) {
            // モーダルを閉じる
            this.hideRegistrationModal();
            
            // プロフィールカードを表示
            this.displayProfile();
            
            // 秘書システムに通知（存在する場合）
            if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.onProfileCreated) {
                SecretaryTeam.onProfileCreated();
            }

            // ウェルカムメッセージ
            this.showWelcomeMessage(nickname);
        } else {
            if (window.ToastSystem) {
                window.ToastSystem.error('プロフィールの保存に失敗しました');
            } else {
                alert('プロフィールの保存に失敗しました');
            }
        }
    },

    /**
     * ウェルカムメッセージ表示
     */
    showWelcomeMessage: function(nickname) {
        // アニメーション付きメッセージ（3秒後に消える）
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 3rem;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
            z-index: 99999;
            text-align: center;
            animation: fadeInOut 3s ease-in-out;
        `;
        message.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
            <h2 style="font-size: 1.75rem; margin-bottom: 0.5rem;">ようこそ、${nickname}さん！</h2>
            <p style="font-size: 1rem; opacity: 0.9;">一緒に目標を達成しましょう</p>
        `;

        // アニメーション定義
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(message);
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 3000);
    },

    /**
     * プロフィール表示
     */
    displayProfile: function() {
        const profile = this.getProfile();
        if (!profile) return;

        const card = document.getElementById('userProfileCard');
        if (!card) return;

        // カード表示
        card.style.display = 'block';

        // ニックネーム
        const nicknameEl = document.getElementById('profileNickname');
        if (nicknameEl) {
            nicknameEl.textContent = `${profile.nickname}さん`;
        }

        // 学習目的
        const purposeEl = document.getElementById('profilePurpose');
        if (purposeEl && profile.purposes && profile.purposes.length > 0) {
            const purposeLabels = {
                promotion: '昇進・昇格',
                job: '就職・転職',
                study_abroad: '留学準備',
                work: '仕事',
                self_growth: '自己成長',
                hobby: '趣味・教養'
            };
            const purposeTexts = profile.purposes.map(p => purposeLabels[p] || p);
            purposeEl.textContent = `学習目的：${purposeTexts.join('、')}`;
        }

        // 目標スコア
        const targetScoreEl = document.getElementById('profileTargetScore');
        if (targetScoreEl) {
            targetScoreEl.textContent = `${profile.targetScore}点`;
        }

        // 現在のスコアと進捗バー更新
        this.updateScoreProgress();

        // 試験日カウントダウン
        if (profile.examDate) {
            this.displayExamCountdown(profile.examDate);
        }
    },

    /**
     * スコア進捗更新
     */
    updateScoreProgress: function() {
        const profile = this.getProfile();
        if (!profile) return;

        const targetScore = profile.targetScore;

        // 予測スコアを取得（app.jsから）
        let predictedScore = 0;
        const predictedScoreEl = document.getElementById('predictedScore');
        if (predictedScoreEl && predictedScoreEl.textContent !== '---') {
            predictedScore = parseInt(predictedScoreEl.textContent) || 0;
        }

        // プロフィールカード内の表示更新
        const currentScoreEl = document.getElementById('profileCurrentScore');
        const progressBar = document.getElementById('profileProgressBar');
        const progressText = document.getElementById('profileProgressText');

        if (predictedScore > 0) {
            // 進捗率計算（0-100%）
            const progress = Math.min(100, (predictedScore / targetScore) * 100);
            
            if (currentScoreEl) {
                currentScoreEl.textContent = `${predictedScore}点`;
            }

            if (progressBar) {
                progressBar.style.width = `${progress}%;`;
            }

            if (progressText) {
                const diff = targetScore - predictedScore;
                if (diff > 0) {
                    progressText.textContent = `目標まであと${diff}点！`;
                } else if (diff === 0) {
                    progressText.textContent = `🎉 目標達成！`;
                } else {
                    progressText.textContent = `🎉 目標を${Math.abs(diff)}点上回っています！`;
                }
            }
        } else {
            if (currentScoreEl) {
                currentScoreEl.textContent = '---';
            }
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            if (progressText) {
                progressText.textContent = '学習を開始してスコアを予測します';
            }
        }
    },

    /**
     * 試験日カウントダウン表示
     */
    displayExamCountdown: function(examDateStr) {
        const countdownEl = document.getElementById('examCountdown');
        const dateEl = document.getElementById('examDate');
        const daysLeftEl = document.getElementById('examDaysLeft');

        if (!countdownEl || !examDateStr) return;

        const examDate = new Date(examDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);

        const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

        if (daysLeft >= 0) {
            countdownEl.style.display = 'block';

            if (dateEl) {
                const formatted = examDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                dateEl.textContent = formatted;
            }

            if (daysLeftEl) {
                if (daysLeft === 0) {
                    daysLeftEl.textContent = '今日！';
                    daysLeftEl.style.color = '#fbbf24';
                } else if (daysLeft <= 7) {
                    daysLeftEl.textContent = `あと${daysLeft}日`;
                    daysLeftEl.style.color = '#f87171';
                } else if (daysLeft <= 30) {
                    daysLeftEl.textContent = `あと${daysLeft}日`;
                    daysLeftEl.style.color = '#fbbf24';
                } else {
                    daysLeftEl.textContent = `あと${daysLeft}日`;
                }
            }
        }
    },

    /**
     * プロフィール編集モーダル表示
     */
    showEditModal: function() {
        const profile = this.getProfile();
        if (!profile) return;

        // 現在の値をフォームに設定
        document.getElementById('userNickname').value = profile.nickname;
        document.getElementById('userTargetScore').value = profile.targetScore;
        
        // 目的のチェックボックス設定
        const checkboxes = document.querySelectorAll('input[name="purpose"]');
        checkboxes.forEach(cb => {
            cb.checked = profile.purposes && profile.purposes.includes(cb.value);
            // チェック状態に応じてスタイル更新
            if (cb.checked) {
                cb.parentElement.style.borderColor = '#3b82f6';
                cb.parentElement.style.background = '#eff6ff';
            }
        });

        if (profile.examDate) {
            document.getElementById('userExamDate').value = profile.examDate;
        }

        // モーダル表示
        this.showRegistrationModal();

        // 送信ボタンのテキスト変更
        const submitBtn = document.querySelector('#userRegistrationForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = '💾 変更を保存';
        }

        // フォーム送信を更新モードに変更
        const form = document.getElementById('userRegistrationForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleUpdate();
        };
    },

    /**
     * プロフィール更新処理
     */
    handleUpdate: function() {
        const nickname = document.getElementById('userNickname').value;
        const targetScore = document.getElementById('userTargetScore').value;
        const examDate = document.getElementById('userExamDate').value || null;
        
        const purposeCheckboxes = document.querySelectorAll('input[name="purpose"]:checked');
        const purposes = Array.from(purposeCheckboxes).map(cb => cb.value);

        if (!nickname.trim() || !targetScore) {
            if (window.ToastSystem) {
                window.ToastSystem.warning('必須項目を入力してください');
            } else {
                alert('必須項目を入力してください');
            }
            return;
        }

        const success = this.updateProfile({
            nickname: nickname.trim(),
            targetScore: parseInt(targetScore),
            purposes: purposes,
            examDate: examDate
        });

        if (success) {
            this.hideRegistrationModal();
            this.displayProfile();
            
            // 完了メッセージ
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: #10b981;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
                z-index: 99999;
                animation: slideIn 0.3s ease-out;
            `;
            message.textContent = '✅ プロフィールを更新しました';

            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(message);
            setTimeout(() => {
                message.remove();
                style.remove();
            }, 2000);

            // フォームを登録モードに戻す
            const form = document.getElementById('userRegistrationForm');
            form.onsubmit = (e) => {
                e.preventDefault();
                this.handleRegistration();
            };
        } else {
            if (window.ToastSystem) {
                window.ToastSystem.error('更新に失敗しました');
            } else {
                alert('更新に失敗しました');
            }
        }
    }
};

/**
 * プロフィール編集ボタン（グローバル関数）
 */
function showProfileEdit() {
    UserProfile.showEditModal();
}

// 自動初期化（DOMContentLoaded後）
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        UserProfile.init();
    });
} else {
    UserProfile.init();
}
