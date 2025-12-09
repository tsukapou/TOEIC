/**
 * Onboarding System
 * 初回ユーザー向けのインタラクティブガイドシステム
 * 
 * 機能:
 * - 4ステップのガイド（ようこそ → レベル診断 → 推奨プラン → 秘書選択）
 * - 5問の簡単なレベル診断テスト
 * - パーソナライズされた学習プラン提示
 * - 離脱率の大幅削減
 * 
 * 実装日: 2025-12-09
 * 目標: 初回離脱率 70% → 20%
 */

const OnboardingSystem = {
    // オンボーディングの状態
    state: {
        currentStep: 0,
        totalSteps: 4,
        diagnosticAnswers: [],
        userLevel: null,
        isCompleted: false
    },

    // レベル診断用の簡単な問題（5問）
    diagnosticQuestions: [
        {
            id: 'diag_1',
            text: 'The company will ------- a new product next month.',
            options: [
                { id: 'A', text: 'launch', isCorrect: true },
                { id: 'B', text: 'launched', isCorrect: false },
                { id: 'C', text: 'launching', isCorrect: false },
                { id: 'D', text: 'launches', isCorrect: false }
            ],
            difficulty: 'easy',
            category: '動詞'
        },
        {
            id: 'diag_2',
            text: 'All employees must ------- the safety regulations.',
            options: [
                { id: 'A', text: 'follow', isCorrect: true },
                { id: 'B', text: 'following', isCorrect: false },
                { id: 'C', text: 'followed', isCorrect: false },
                { id: 'D', text: 'follows', isCorrect: false }
            ],
            difficulty: 'easy',
            category: '動詞'
        },
        {
            id: 'diag_3',
            text: 'The manager was ------- with the team\'s performance.',
            options: [
                { id: 'A', text: 'satisfy', isCorrect: false },
                { id: 'B', text: 'satisfied', isCorrect: true },
                { id: 'C', text: 'satisfying', isCorrect: false },
                { id: 'D', text: 'satisfaction', isCorrect: false }
            ],
            difficulty: 'medium',
            category: '形容詞'
        },
        {
            id: 'diag_4',
            text: '------- the meeting, please review the agenda.',
            options: [
                { id: 'A', text: 'During', isCorrect: false },
                { id: 'B', text: 'While', isCorrect: false },
                { id: 'C', text: 'Before', isCorrect: true },
                { id: 'D', text: 'After', isCorrect: false }
            ],
            difficulty: 'medium',
            category: '前置詞・接続詞'
        },
        {
            id: 'diag_5',
            text: 'The report must be submitted ------- Friday.',
            options: [
                { id: 'A', text: 'by', isCorrect: true },
                { id: 'B', text: 'until', isCorrect: false },
                { id: 'C', text: 'at', isCorrect: false },
                { id: 'D', text: 'in', isCorrect: false }
            ],
            difficulty: 'hard',
            category: '前置詞・接続詞'
        }
    ],

    /**
     * 初期化
     */
    init() {
        console.log('🎓 Onboarding System 初期化中...');

        // オンボーディング完了済みかチェック
        const hasCompleted = localStorage.getItem('toeic_onboarding_completed');
        
        if (hasCompleted === 'true') {
            console.log('✅ オンボーディング完了済み');
            this.state.isCompleted = true;
            return;
        }

        // 初回訪問: オンボーディングを開始
        console.log('🆕 初回訪問検知 → オンボーディング開始');
        
        // 少し遅延してからオンボーディングを表示（ユーザー体験向上）
        setTimeout(() => {
            this.startOnboarding();
        }, 500);
    },

    /**
     * オンボーディングを開始
     */
    startOnboarding() {
        this.state.currentStep = 0;
        this.showStep(0);
    },

    /**
     * ステップを表示
     */
    showStep(stepIndex) {
        this.state.currentStep = stepIndex;

        switch (stepIndex) {
            case 0:
                this.showWelcomeScreen();
                break;
            case 1:
                this.showDiagnosticTest();
                break;
            case 2:
                this.showRecommendation();
                break;
            case 3:
                this.showSecretarySelection();
                break;
            default:
                this.completeOnboarding();
        }
    },

    /**
     * Step 1: ようこそ画面
     */
    showWelcomeScreen() {
        const html = `
            <div class="onboarding-overlay" id="onboardingOverlay">
                <div class="onboarding-modal">
                    <div class="onboarding-header">
                        <span class="onboarding-step-indicator">ステップ 1 / ${this.state.totalSteps}</span>
                        <button class="onboarding-skip" onclick="OnboardingSystem.skipOnboarding()">スキップ</button>
                    </div>
                    
                    <div class="onboarding-content">
                        <div class="onboarding-icon">🎉</div>
                        <h2 class="onboarding-title">TOEIC PART5 完全攻略へようこそ！</h2>
                        <p class="onboarding-description">
                            このアプリで、あなたのTOEICスコアを<br>
                            <strong class="highlight">+150点UP</strong>させましょう！
                        </p>
                        
                        <div class="onboarding-features">
                            <div class="feature-item">
                                <span class="feature-icon">🤖</span>
                                <span class="feature-text">AIアダプティブ学習</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">📊</span>
                                <span class="feature-text">詳細な分析レポート</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-icon">🏆</span>
                                <span class="feature-text">42種類の実績システム</span>
                            </div>
                        </div>

                        <p class="onboarding-time-estimate">
                            所要時間: <strong>約2分</strong>
                        </p>
                    </div>
                    
                    <div class="onboarding-footer">
                        <button class="btn-onboarding-primary" onclick="OnboardingSystem.nextStep()">
                            始める 🚀
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderOnboarding(html);
    },

    /**
     * Step 2: レベル診断テスト
     */
    showDiagnosticTest() {
        const currentQuestionIndex = this.state.diagnosticAnswers.length;
        
        if (currentQuestionIndex >= this.diagnosticQuestions.length) {
            // 全問回答済み → 次のステップへ
            this.calculateUserLevel();
            this.nextStep();
            return;
        }

        const question = this.diagnosticQuestions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / this.diagnosticQuestions.length) * 100;

        const html = `
            <div class="onboarding-overlay" id="onboardingOverlay">
                <div class="onboarding-modal onboarding-diagnostic">
                    <div class="onboarding-header">
                        <span class="onboarding-step-indicator">ステップ 2 / ${this.state.totalSteps}</span>
                        <button class="onboarding-skip" onclick="OnboardingSystem.skipOnboarding()">スキップ</button>
                    </div>
                    
                    <div class="diagnostic-progress-bar">
                        <div class="diagnostic-progress-fill" style="width: ${progress}%"></div>
                    </div>

                    <div class="onboarding-content">
                        <h3 class="diagnostic-title">📊 レベル診断</h3>
                        <p class="diagnostic-question-number">問題 ${currentQuestionIndex + 1} / ${this.diagnosticQuestions.length}</p>
                        
                        <div class="diagnostic-question">
                            <p class="question-text">${question.text}</p>
                            
                            <div class="diagnostic-options">
                                ${question.options.map(option => `
                                    <button class="diagnostic-option" 
                                            data-option-id="${option.id}"
                                            data-is-correct="${option.isCorrect}"
                                            onclick="OnboardingSystem.selectDiagnosticAnswer('${option.id}', ${option.isCorrect})">
                                        <span class="option-id">${option.id}</span>
                                        <span class="option-text">${option.text}</span>
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderOnboarding(html);
    },

    /**
     * 診断テストの回答を選択
     */
    selectDiagnosticAnswer(optionId, isCorrect) {
        // 回答を記録
        this.state.diagnosticAnswers.push({
            questionId: this.diagnosticQuestions[this.state.diagnosticAnswers.length].id,
            selectedOption: optionId,
            isCorrect: isCorrect
        });

        // 正解/不正解のフィードバック（0.5秒）
        const selectedButton = document.querySelector(`[data-option-id="${optionId}"]`);
        if (selectedButton) {
            selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');
        }

        // 次の問題へ（0.8秒後）
        setTimeout(() => {
            this.showDiagnosticTest();
        }, 800);
    },

    /**
     * ユーザーレベルを計算
     */
    calculateUserLevel() {
        const correctCount = this.state.diagnosticAnswers.filter(a => a.isCorrect).length;
        const accuracy = (correctCount / this.diagnosticQuestions.length) * 100;

        let level, estimatedScore, recommendation;

        if (accuracy >= 80) {
            level = 'advanced';
            estimatedScore = '600-730';
            recommendation = '実践問題で高難易度問題に挑戦しましょう！';
        } else if (accuracy >= 60) {
            level = 'intermediate';
            estimatedScore = '450-600';
            recommendation = '文法の応用力を鍛えましょう！';
        } else {
            level = 'beginner';
            estimatedScore = '300-450';
            recommendation = '基礎文法からしっかり学びましょう！';
        }

        this.state.userLevel = {
            level: level,
            accuracy: accuracy,
            correctCount: correctCount,
            estimatedScore: estimatedScore,
            recommendation: recommendation
        };

        // ユーザープロフィールに保存
        const userProfile = JSON.parse(localStorage.getItem('toeic_user_profile') || '{}');
        userProfile.diagnosticResult = this.state.userLevel;
        userProfile.initialLevel = level;
        userProfile.lastUpdated = Date.now();
        localStorage.setItem('toeic_user_profile', JSON.stringify(userProfile));

        console.log('📊 レベル診断結果:', this.state.userLevel);
    },

    /**
     * Step 3: おすすめプラン提示
     */
    showRecommendation() {
        const level = this.state.userLevel;
        
        const html = `
            <div class="onboarding-overlay" id="onboardingOverlay">
                <div class="onboarding-modal">
                    <div class="onboarding-header">
                        <span class="onboarding-step-indicator">ステップ 3 / ${this.state.totalSteps}</span>
                    </div>
                    
                    <div class="onboarding-content">
                        <div class="onboarding-icon">🎯</div>
                        <h2 class="onboarding-title">あなたの診断結果</h2>
                        
                        <div class="level-result-card">
                            <div class="level-badge level-${level.level}">
                                ${this.getLevelLabel(level.level)}
                            </div>
                            
                            <div class="level-stats">
                                <div class="stat-item">
                                    <span class="stat-label">正答率</span>
                                    <span class="stat-value">${level.accuracy.toFixed(0)}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">推定スコア</span>
                                    <span class="stat-value">${level.estimatedScore}</span>
                                </div>
                            </div>
                        </div>

                        <div class="recommendation-card">
                            <h3 class="recommendation-title">🌟 おすすめの学習プラン</h3>
                            <p class="recommendation-text">${level.recommendation}</p>
                            
                            <div class="recommendation-features">
                                ${this.getRecommendationFeatures(level.level)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="onboarding-footer">
                        <button class="btn-onboarding-primary" onclick="OnboardingSystem.nextStep()">
                            次へ進む →
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderOnboarding(html);
    },

    /**
     * レベルのラベルを取得
     */
    getLevelLabel(level) {
        const labels = {
            'beginner': '初級レベル',
            'intermediate': '中級レベル',
            'advanced': '上級レベル'
        };
        return labels[level] || 'レベル不明';
    },

    /**
     * レベルに応じたおすすめ機能
     */
    getRecommendationFeatures(level) {
        const features = {
            'beginner': [
                '基礎文法カテゴリから学習',
                '復習システムで苦手を克服',
                '秘書のサポートで楽しく継続'
            ],
            'intermediate': [
                'アダプティブ学習で弱点強化',
                '分析ダッシュボードで進捗確認',
                '実績システムでモチベーション維持'
            ],
            'advanced': [
                '高難易度問題に挑戦',
                '速答トレーニングで時間短縮',
                '完璧主義者実績を目指す'
            ]
        };

        return features[level].map(f => `
            <div class="recommendation-feature">
                <span class="feature-check">✓</span>
                <span>${f}</span>
            </div>
        `).join('');
    },

    /**
     * Step 4: 秘書の部屋へ誘導
     */
    showSecretarySelection() {
        const html = `
            <div class="onboarding-overlay" id="onboardingOverlay">
                <div class="onboarding-modal">
                    <div class="onboarding-header">
                        <span class="onboarding-step-indicator">ステップ 4 / ${this.state.totalSteps}</span>
                    </div>
                    
                    <div class="onboarding-content">
                        <div class="onboarding-icon">🏢</div>
                        <h2 class="onboarding-title">秘書の部屋へようこそ！</h2>
                        <p class="onboarding-description">
                            あなたの学習をサポートする<strong>23人の個性豊かな秘書</strong>があなたを待っています！<br>
                            秘書の部屋で、お気に入りの秘書を選びましょう。
                        </p>
                        
                        <div class="secretary-room-preview">
                            <div class="preview-feature">
                                <span class="preview-icon">👥</span>
                                <div class="preview-text">
                                    <strong>23人の秘書キャラクター</strong>
                                    <p>それぞれ個性的な性格とサポートスタイル</p>
                                </div>
                            </div>
                            
                            <div class="preview-feature">
                                <span class="preview-icon">💬</span>
                                <div class="preview-text">
                                    <strong>時間帯別グリーティング</strong>
                                    <p>朝・昼・夕・夜で変わる挨拶と励まし</p>
                                </div>
                            </div>
                            
                            <div class="preview-feature">
                                <span class="preview-icon">🎁</span>
                                <div class="preview-text">
                                    <strong>実績解除で新秘書登場</strong>
                                    <p>学習を続けて全員をアンロック！</p>
                                </div>
                            </div>
                        </div>

                        <div class="secretary-cta-box">
                            <p class="cta-message">
                                💡 <strong>最初は3人の秘書が利用可能</strong>です。<br>
                                学習を進めると、さらに多くの秘書が登場します！
                            </p>
                        </div>
                    </div>
                    
                    <div class="onboarding-footer">
                        <button class="btn-onboarding-primary" onclick="OnboardingSystem.goToSecretaryRoom()">
                            秘書の部屋へ 🚀
                        </button>
                        <button class="btn-onboarding-secondary" onclick="OnboardingSystem.skipSecretarySelection()">
                            後で選ぶ
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.renderOnboarding(html);
    },

    /**
     * 秘書の部屋へ移動
     */
    goToSecretaryRoom() {
        console.log('🏢 秘書の部屋へ移動');
        
        // オンボーディング完了フラグを保存
        localStorage.setItem('toeic_onboarding_completed', 'true');
        this.state.isCompleted = true;

        // オンボーディング画面を非表示
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                
                // 秘書の部屋へ遷移
                if (typeof showSecretaryRoom === 'function') {
                    showSecretaryRoom();
                } else if (typeof showScreen === 'function') {
                    showScreen('secretary-room');
                } else {
                    console.warn('⚠️ showSecretaryRoom関数が見つかりません');
                    // フォールバック: ホーム画面へ
                    if (typeof showScreen === 'function') {
                        showScreen('home');
                    }
                }
                
                // トースト通知
                if (window.ToastNotification) {
                    ToastNotification.show('秘書の部屋へようこそ！お気に入りの秘書を選びましょう 🏢', 'info', 4000);
                }
            }, 500);
        }
    },

    /**
     * 秘書選択をスキップ（後で選ぶ）
     */
    skipSecretarySelection() {
        console.log('⏭️ 秘書選択スキップ（後で選ぶ）');
        this.completeOnboarding();
    },

    /**
     * オンボーディング完了
     */
    completeOnboarding() {
        console.log('✅ オンボーディング完了');

        // 完了フラグを保存
        localStorage.setItem('toeic_onboarding_completed', 'true');
        this.state.isCompleted = true;

        // オンボーディング画面を非表示
        const overlay = document.getElementById('onboardingOverlay');
        if (overlay) {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
            }, 500);
        }

        // 完了メッセージ
        if (window.ToastNotification) {
            ToastNotification.show('セットアップ完了！学習を始めましょう 🎉', 'success', 3000);
        }

        // ホーム画面を表示
        if (typeof showScreen === 'function') {
            showScreen('home');
        }
    },

    /**
     * 次のステップへ
     */
    nextStep() {
        this.showStep(this.state.currentStep + 1);
    },

    /**
     * オンボーディングをスキップ
     */
    skipOnboarding() {
        if (confirm('オンボーディングをスキップしますか？\n（後からヘルプで確認できます）')) {
            console.log('⏭️ オンボーディングスキップ');
            this.completeOnboarding();
        }
    },

    /**
     * HTMLをレンダリング
     */
    renderOnboarding(html) {
        // 既存のオンボーディング画面を削除
        const existingOverlay = document.getElementById('onboardingOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // 新しい画面を挿入
        document.body.insertAdjacentHTML('beforeend', html);
    },

    /**
     * オンボーディングを再表示（デバッグ用）
     */
    reset() {
        localStorage.removeItem('toeic_onboarding_completed');
        this.state = {
            currentStep: 0,
            totalSteps: 4,
            diagnosticAnswers: [],
            userLevel: null,
            isCompleted: false
        };
        console.log('🔄 オンボーディングをリセット');
        this.startOnboarding();
    }
};

// DOMContentLoaded 後に初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => OnboardingSystem.init());
} else {
    OnboardingSystem.init();
}

// グローバルに公開
window.OnboardingSystem = OnboardingSystem;
