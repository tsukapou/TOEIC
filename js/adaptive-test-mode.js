/**
 * 🎯 Adaptive Test Mode
 * アダプティブテストモード - UI & 制御
 * 
 * 【機能】
 * 1. アダプティブテストの開始・実行
 * 2. リアルタイムフィードバック
 * 3. 進捗表示とモチベーション維持
 * 4. 結果分析と次のステップ提案
 * 
 * 実装日: 2025-12-09
 */

const AdaptiveTestMode = {
    currentSession: null,
    startTime: null,
    questionStartTime: null,

    /**
     * アダプティブテストを開始
     * @param {number} questionCount - 問題数
     */
    startAdaptiveTest: function(questionCount = 30) {
        console.log(`🎯 アダプティブテスト開始（${questionCount}問）`);
        
        // Toast通知
        if (window.ToastNotification) {
            ToastNotification.show('🧠 アダプティブテスト開始', 'あなた専用の問題を生成中...', 'info');
        }
        
        // 問題を選択
        const questions = AdaptiveQuestionSelector.selectQuestions(questionCount);
        
        if (questions.length === 0) {
            console.error('❌ 問題の選択に失敗しました');
            if (window.ToastNotification) {
                ToastNotification.show(
                    '❌ エラー',
                    '問題データが読み込まれていません。ページをリロードしてください。',
                    'error'
                );
            }
            return;
        }
        
        // セッション情報を初期化
        this.currentSession = {
            questions,
            currentIndex: 0,
            answers: [],
            startTime: Date.now(),
            questionTimes: []
        };
        
        this.startTime = Date.now();
        
        // AppStateを更新
        if (typeof window !== 'undefined' && window.AppState) {
            window.AppState.shuffledQuestions = questions;
            window.AppState.currentQuestionIndex = 0;
            window.AppState.testMode = 'adaptive';
        }
        
        // Toast通知
        if (window.ToastNotification) {
            ToastNotification.show(
                '✅ 準備完了',
                `あなた専用の${questions.length}問を生成しました！`,
                'success',
                3000
            );
        }
        
        // 問題画面に遷移
        if (typeof window !== 'undefined' && window.showQuestion) {
            setTimeout(() => {
                window.showQuestion();
                this.startQuestionTimer();
            }, 500);
        }
        
        console.log('✅ アダプティブテスト開始完了');
    },

    /**
     * 問題タイマーを開始
     */
    startQuestionTimer: function() {
        this.questionStartTime = Date.now();
    },

    /**
     * 解答を記録
     */
    recordAnswer: function(questionIndex, selectedAnswer, correctAnswer) {
        if (!this.currentSession) return;
        
        const timeSpent = Date.now() - this.questionStartTime;
        const isCorrect = selectedAnswer === correctAnswer;
        
        this.currentSession.answers.push({
            questionIndex,
            selectedAnswer,
            correctAnswer,
            isCorrect,
            timeSpent
        });
        
        this.currentSession.questionTimes.push(timeSpent);
        
        // 次の問題のタイマーを開始
        this.startQuestionTimer();
    },

    /**
     * テスト終了処理
     */
    finishTest: function() {
        if (!this.currentSession) {
            console.error('❌ アクティブなセッションがありません');
            return;
        }
        
        console.log('📊 アダプティブテスト終了処理開始...');
        
        const session = this.currentSession;
        const totalTime = Date.now() - session.startTime;
        
        // 結果を計算
        const result = this.calculateResult(session, totalTime);
        
        // 学習エンジンに記録
        AdaptiveLearningEngine.recordLearningSession(result);
        
        // 通常の結果画面を表示（既存システムを活用）
        if (typeof window !== 'undefined' && window.showResult) {
            window.showResult();
        }
        
        // アダプティブ専用の追加フィードバックを表示
        setTimeout(() => {
            this.showAdaptiveFeedback(result);
        }, 1000);
        
        // セッションをクリア
        this.currentSession = null;
        
        console.log('✅ アダプティブテスト終了処理完了');
    },

    /**
     * 結果を計算
     */
    calculateResult: function(session, totalTime) {
        const totalQuestions = session.questions.length;
        const correctCount = session.answers.filter(a => a.isCorrect).length;
        const accuracy = Math.round((correctCount / totalQuestions) * 100);
        const score = Math.round(accuracy * 2); // PART5は200点満点
        
        // 問題詳細を作成
        const questionDetails = session.questions.map((q, index) => {
            const answer = session.answers[index];
            return {
                questionId: q.id,
                questionType: q.questionType,
                difficulty: q.difficulty,
                isCorrect: answer ? answer.isCorrect : false,
                timeSpent: answer ? answer.timeSpent : 0,
                selectedAnswer: answer ? answer.selectedAnswer : null,
                correctAnswer: q.answer
            };
        });
        
        return {
            score,
            accuracy,
            totalQuestions,
            correctCount,
            timeSpent: totalTime,
            questionDetails,
            testMode: 'adaptive',
            timestamp: Date.now()
        };
    },

    /**
     * アダプティブ専用フィードバックを表示
     */
    showAdaptiveFeedback: function(result) {
        const profile = AdaptiveLearningEngine.getProfile();
        const stats = AdaptiveLearningEngine.getStatistics();
        
        // フィードバックメッセージを生成
        const messages = this.generateFeedbackMessages(result, profile, stats);
        
        // フィードバックカードを作成
        const feedbackHtml = this.createFeedbackCard(messages, stats);
        
        // 結果画面に挿入
        const resultScreen = document.getElementById('resultScreen');
        if (resultScreen) {
            const container = resultScreen.querySelector('.result-container');
            if (container) {
                // 既存のフィードバックカードを削除
                const existing = container.querySelector('.adaptive-feedback-card');
                if (existing) existing.remove();
                
                // 新しいフィードバックカードを挿入
                container.insertAdjacentHTML('beforeend', feedbackHtml);
            }
        }
        
        console.log('✅ アダプティブフィードバック表示完了');
    },

    /**
     * フィードバックメッセージを生成
     */
    generateFeedbackMessages: function(result, profile, stats) {
        const messages = [];
        
        // 1. 成長トレンド
        if (profile.learningPattern.recentTrend === 'improving') {
            messages.push({
                type: 'success',
                icon: '📈',
                title: '素晴らしい成長です！',
                text: '最近の学習で着実にスコアが向上しています。この調子で継続しましょう！'
            });
        } else if (profile.learningPattern.recentTrend === 'declining') {
            messages.push({
                type: 'warning',
                icon: '⚠️',
                title: '少し休憩しませんか？',
                text: '最近スコアが下降気味です。疲れが溜まっているかもしれません。適度な休憩を取りましょう。'
            });
        }
        
        // 2. レベル判定
        const levelMessages = {
            'beginner': { icon: '🌱', title: '基礎を固めています', text: 'まずは基礎問題を完璧にしましょう！' },
            'intermediate': { icon: '🌿', title: '中級レベルに到達', text: '順調に成長しています。応用問題にも挑戦してみましょう！' },
            'advanced': { icon: '🌳', title: '上級レベルです', text: '高いレベルに到達しています。さらに高みを目指しましょう！' },
            'expert': { icon: '🏆', title: 'エキスパートレベル', text: '素晴らしい！最高レベルに到達しています！' }
        };
        
        const levelMsg = levelMessages[profile.level];
        if (levelMsg) {
            messages.push({
                type: 'info',
                ...levelMsg
            });
        }
        
        // 3. 弱点カテゴリの提案
        if (stats.weakCategories.length > 0) {
            const weakest = stats.weakCategories[0];
            messages.push({
                type: 'warning',
                icon: '🎯',
                title: `${weakest.category}を強化しましょう`,
                text: `現在の正答率: ${weakest.accuracy}%。集中的に学習することで大きく改善できます！`
            });
        }
        
        // 4. 最適学習時間帯
        if (profile.learningPattern.bestTimeOfDay) {
            const timeMessages = {
                'morning': '朝（5-12時）',
                'afternoon': '午後（12-17時）',
                'evening': '夕方（17-21時）',
                'night': '夜（21時以降）'
            };
            const timeText = timeMessages[profile.learningPattern.bestTimeOfDay];
            messages.push({
                type: 'info',
                icon: '⏰',
                title: `最適な学習時間は${timeText}です`,
                text: 'この時間帯に学習すると、パフォーマンスが最も高くなる傾向があります。'
            });
        }
        
        return messages;
    },

    /**
     * フィードバックカードのHTMLを作成
     */
    createFeedbackCard: function(messages, stats) {
        const messagesHtml = messages.map(msg => `
            <div class="feedback-message feedback-${msg.type}">
                <div class="feedback-icon">${msg.icon}</div>
                <div class="feedback-content">
                    <div class="feedback-title">${msg.title}</div>
                    <div class="feedback-text">${msg.text}</div>
                </div>
            </div>
        `).join('');
        
        return `
            <div class="adaptive-feedback-card">
                <h3>🧠 アダプティブ学習分析</h3>
                <div class="feedback-messages">
                    ${messagesHtml}
                </div>
                <div class="next-steps">
                    <h4>📊 あなたの学習状況</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">推定レベル</span>
                            <span class="stat-value">${this.getLevelLabel(stats.level)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">推定スコア</span>
                            <span class="stat-value">${stats.estimatedScore}点</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">総合正答率</span>
                            <span class="stat-value">${stats.overallAccuracy}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">学習セッション</span>
                            <span class="stat-value">${stats.totalSessions}回</span>
                        </div>
                    </div>
                </div>
                <button onclick="AdaptiveTestMode.startAdaptiveTest(30)" class="btn-adaptive-retry">
                    🎯 もう一度アダプティブテスト
                </button>
            </div>
        `;
    },

    /**
     * レベルラベルを取得
     */
    getLevelLabel: function(level) {
        const labels = {
            'beginner': '🌱 初級',
            'intermediate': '🌿 中級',
            'advanced': '🌳 上級',
            'expert': '🏆 エキスパート'
        };
        return labels[level] || level;
    },

    /**
     * ホーム画面にボタンを追加
     */
    addToHomeScreen: function() {
        const homeScreen = document.getElementById('homeScreen');
        if (!homeScreen) return;
        
        // 既存のボタンを探す
        let adaptiveButton = document.getElementById('adaptiveTestButton');
        if (adaptiveButton) return; // 既に追加済み
        
        // ボタンを作成
        const buttonHtml = `
            <div class="adaptive-test-card" id="adaptiveTestCard" style="margin: 1rem 0;">
                <div class="card-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 12px 12px 0 0;">
                    <h3 style="margin: 0; font-size: 1.2rem;">🧠 アダプティブテスト</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">あなた専用に最適化された問題</p>
                </div>
                <div class="card-body" style="padding: 1rem; background: white; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <p style="margin: 0 0 1rem 0; color: #4b5563;">
                        あなたの弱点を重点的に強化し、得意分野も維持する、個別最適化されたテストです。
                    </p>
                    <button id="adaptiveTestButton" class="btn-adaptive-start" onclick="AdaptiveTestMode.startAdaptiveTest(30)" 
                            style="width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.2s;">
                        🚀 アダプティブテスト開始（30問）
                    </button>
                </div>
            </div>
        `;
        
        // テストセットグリッドの前に挿入
        const testSetsGrid = homeScreen.querySelector('#testSetsGrid');
        if (testSetsGrid && testSetsGrid.parentElement) {
            testSetsGrid.parentElement.insertAdjacentHTML('beforebegin', buttonHtml);
            
            // ホバーエフェクトを追加
            const button = document.getElementById('adaptiveTestButton');
            if (button) {
                button.addEventListener('mouseenter', () => {
                    button.style.transform = 'translateY(-2px)';
                    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.transform = 'translateY(0)';
                    button.style.boxShadow = 'none';
                });
            }
        }
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.AdaptiveTestMode = AdaptiveTestMode;
    
    // ホーム画面表示時にボタンを追加
    document.addEventListener('DOMContentLoaded', () => {
        // 少し遅延させて、他のシステムが初期化されるのを待つ
        setTimeout(() => {
            AdaptiveTestMode.addToHomeScreen();
        }, 1000);
    });
}
