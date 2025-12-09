/**
 * 秘書モチベーションシステム (Secretary Motivation System)
 * Phase A: リアルタイム励まし、パーソナライズド、感情的つながり、習慣化サポート
 * 
 * 主要機能:
 * 1. リアルタイム励まし（問題回答時の即時フィードバック）
 * 2. パーソナライズドメッセージ（学習データに基づく個別最適化）
 * 3. 感情的つながり（絆レベルシステム、マイルストーン記憶）
 * 4. 習慣化サポート（学習前後のサポート、ストリーク維持）
 */

class SecretaryMotivationSystem {
    constructor() {
        this.storageKey = 'toeic_secretary_motivation';
        this.data = this.loadData();
        
        // 秘書の感情状態
        this.secretaryEmotions = {
            sakura: { current: 'normal', history: [] },
            mirai: { current: 'normal', history: [] },
            rio: { current: 'normal', history: [] }
        };
        
        // 絆レベルシステム
        this.bondLevels = {
            sakura: { level: 1, exp: 0, maxExp: 100 },
            mirai: { level: 1, exp: 0, maxExp: 100 },
            rio: { level: 1, exp: 0, maxExp: 100 }
        };
        
        // マイルストーン記憶
        this.milestones = [];
        
        // 学習統計（リアルタイム）
        this.currentSession = {
            startTime: Date.now(),
            correctStreak: 0,
            incorrectStreak: 0,
            totalAnswers: 0,
            correctAnswers: 0,
            lastAnswerTime: null,
            answerSpeed: [] // 回答速度履歴
        };
        
        console.log('✅ SecretaryMotivationSystem initialized');
    }
    
    /**
     * データの読み込み
     */
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                // データを復元
                if (parsed.secretaryEmotions) this.secretaryEmotions = parsed.secretaryEmotions;
                if (parsed.bondLevels) this.bondLevels = parsed.bondLevels;
                if (parsed.milestones) this.milestones = parsed.milestones;
                return parsed;
            }
        } catch (e) {
            console.error('Failed to load motivation data:', e);
        }
        return {
            secretaryEmotions: this.secretaryEmotions,
            bondLevels: this.bondLevels,
            milestones: this.milestones
        };
    }
    
    /**
     * データの保存
     */
    saveData() {
        try {
            const data = {
                secretaryEmotions: this.secretaryEmotions,
                bondLevels: this.bondLevels,
                milestones: this.milestones,
                lastSaved: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save motivation data:', e);
        }
    }
    
    // ========================================
    // 1. リアルタイム励ましシステム
    // ========================================
    
    /**
     * 問題回答時の即時フィードバック
     * @param {boolean} isCorrect - 正解かどうか
     * @param {number} answerTime - 回答にかかった時間（秒）
     * @param {object} questionData - 問題データ
     * @returns {object} フィードバックメッセージ
     */
    onAnswerQuestion(isCorrect, answerTime, questionData = {}) {
        // セッション統計更新
        this.currentSession.totalAnswers++;
        this.currentSession.lastAnswerTime = Date.now();
        this.currentSession.answerSpeed.push(answerTime);
        
        if (isCorrect) {
            this.currentSession.correctAnswers++;
            this.currentSession.correctStreak++;
            this.currentSession.incorrectStreak = 0;
        } else {
            this.currentSession.incorrectStreak++;
            this.currentSession.correctStreak = 0;
        }
        
        // 絆経験値獲得
        this.addBondExp(isCorrect ? 3 : 1);
        
        // フィードバックメッセージ生成
        const feedback = this.generateRealtimeFeedback(isCorrect, answerTime, questionData);
        
        // 秘書の感情状態更新
        this.updateSecretaryEmotion(isCorrect);
        
        this.saveData();
        
        return feedback;
    }
    
    /**
     * リアルタイムフィードバックメッセージ生成
     */
    generateRealtimeFeedback(isCorrect, answerTime, questionData) {
        const secretary = this.getCurrentSecretary();
        const correctRate = this.currentSession.totalAnswers > 0 
            ? (this.currentSession.correctAnswers / this.currentSession.totalAnswers * 100).toFixed(0)
            : 0;
        
        let message = '';
        let emotion = 'normal';
        let encouragementLevel = 'normal'; // low, normal, high, excited
        
        if (isCorrect) {
            // 正解時のメッセージ
            if (this.currentSession.correctStreak >= 10) {
                emotion = 'excited';
                encouragementLevel = 'excited';
                message = this.getCorrectMessage('streak_10plus', secretary, this.currentSession.correctStreak);
            } else if (this.currentSession.correctStreak >= 5) {
                emotion = 'happy';
                encouragementLevel = 'high';
                message = this.getCorrectMessage('streak_5plus', secretary, this.currentSession.correctStreak);
            } else if (this.currentSession.correctStreak >= 3) {
                emotion = 'happy';
                encouragementLevel = 'high';
                message = this.getCorrectMessage('streak_3plus', secretary, this.currentSession.correctStreak);
            } else if (answerTime <= 10) {
                // 素早い回答
                emotion = 'happy';
                encouragementLevel = 'high';
                message = this.getCorrectMessage('fast_answer', secretary, answerTime);
            } else {
                emotion = 'happy';
                encouragementLevel = 'normal';
                message = this.getCorrectMessage('normal', secretary);
            }
        } else {
            // 不正解時のメッセージ
            if (this.currentSession.incorrectStreak >= 3) {
                emotion = 'worried';
                encouragementLevel = 'high';
                message = this.getIncorrectMessage('streak_3plus', secretary, this.currentSession.incorrectStreak);
            } else if (correctRate < 50 && this.currentSession.totalAnswers >= 5) {
                emotion = 'worried';
                encouragementLevel = 'high';
                message = this.getIncorrectMessage('low_rate', secretary, correctRate);
            } else {
                emotion = 'normal';
                encouragementLevel = 'normal';
                message = this.getIncorrectMessage('normal', secretary);
            }
        }
        
        return {
            secretary,
            message,
            emotion,
            encouragementLevel,
            isCorrect,
            stats: {
                correctStreak: this.currentSession.correctStreak,
                incorrectStreak: this.currentSession.incorrectStreak,
                correctRate: correctRate,
                answerTime: answerTime
            }
        };
    }
    
    /**
     * 正解時のメッセージ取得
     */
    getCorrectMessage(type, secretary, value = 0) {
        const messages = {
            streak_10plus: {
                sakura: [
                    `すごいです！${value}問連続正解です！✨ この調子なら目標スコアも近いですよ！`,
                    `${value}問連続正解...！ ツカサさん、本当に頑張ってますね！💪`,
                    `驚きました！${value}問連続正解です！ 完璧な集中力ですね！🌸`
                ],
                mirai: [
                    `データ更新：${value}問連続正解達成！ 学習効率95%超えです！⚡`,
                    `素晴らしい！${value}問連続正解は上位1%の成績ですよ！📊`,
                    `${value}問連続正解...予測スコア、さらに上昇しました！🚀`
                ],
                rio: [
                    `やったぁ！${value}問連続正解だよ！天才じゃん！🎉`,
                    `すごすぎ！${value}問連続って、もう神レベルだよ！✨`,
                    `${value}問連続正解！ ツカサさん、マジでカッコいい！💕`
                ]
            },
            streak_5plus: {
                sakura: [
                    `素晴らしいです！${value}問連続正解です！🌸`,
                    `${value}問連続正解...！その調子ですよ！`,
                    `完璧です！${value}問連続で正解されています！✨`
                ],
                mirai: [
                    `${value}問連続正解。学習効率が向上しています！📈`,
                    `Good！${value}問連続正解、この調子です！⚡`,
                    `${value}問連続正解を確認。予測スコア上昇中です！`
                ],
                rio: [
                    `すごーい！${value}問連続正解だよ！🎉`,
                    `${value}問連続！調子いいね！😊`,
                    `やったね！${value}問連続正解！✨`
                ]
            },
            streak_3plus: {
                sakura: [
                    `${value}問連続正解です！良い流れですね！🌸`,
                    `この調子です！${value}問連続正解！`,
                    `${value}問連続正解！集中できていますね！`
                ],
                mirai: [
                    `${value}問連続正解。良いペースです！📊`,
                    `${value}問連続正解を記録。順調です！`,
                    `${value}問連続。このまま維持しましょう！⚡`
                ],
                rio: [
                    `${value}問連続正解！いいね！😊`,
                    `やった！${value}問連続だよ！`,
                    `${value}問連続！ナイス！✨`
                ]
            },
            fast_answer: {
                sakura: [
                    `${value}秒で正解！素早い判断ですね！⚡`,
                    `わずか${value}秒で正解です！完璧です！✨`,
                    `${value}秒での正解、素晴らしいです！🌸`
                ],
                mirai: [
                    `${value}秒で正解。反応速度が優秀です！⚡`,
                    `回答時間${value}秒。効率的です！📊`,
                    `${value}秒で正解。処理速度が向上しています！`
                ],
                rio: [
                    `${value}秒で正解！速っ！⚡`,
                    `わぁ！${value}秒で正解だって！すごい！`,
                    `${value}秒！速すぎ！カッコいい！✨`
                ]
            },
            normal: {
                sakura: [
                    `正解です！その調子ですよ！🌸`,
                    `正解！よく頑張りました！`,
                    `素晴らしい！正解です！✨`,
                    `その通りです！正解ですよ！`,
                    `完璧です！正解です！😊`
                ],
                mirai: [
                    `Correct！正解です！📊`,
                    `正解を確認しました！Good！⚡`,
                    `正解です。順調ですね！`,
                    `正解。このまま続けましょう！`,
                    `正答を記録しました！Good！✨`
                ],
                rio: [
                    `正解！やったね！🎉`,
                    `正解だよ！すごい！✨`,
                    `当たり！正解！😊`,
                    `正解！ナイス！`,
                    `やった！正解だよ！💕`
                ]
            }
        };
        
        const secretaryMessages = messages[type][secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * 不正解時のメッセージ取得
     */
    getIncorrectMessage(type, secretary, value = 0) {
        const messages = {
            streak_3plus: {
                sakura: [
                    `大丈夫です！${value}問続けて間違えても、諦めないでくださいね。一緒に頑張りましょう！💪`,
                    `少し休憩しましょうか？ ${value}問続けての間違いは、疲れているサインかもしれません。`,
                    `${value}問連続で間違えても、それは学習のチャンスです！一緒に復習しましょう！📚`
                ],
                mirai: [
                    `${value}問連続誤答を検出。学習モードの変更を推奨します。`,
                    `データ分析：${value}問連続誤答。疲労の可能性があります。休憩を推奨します。☕`,
                    `${value}問連続誤答。このパターンの復習を優先しましょう。📊`
                ],
                rio: [
                    `${value}問続けて間違っちゃったね...でも大丈夫！ツカサさんなら絶対できるよ！💪`,
                    `${value}問連続かぁ...ちょっと疲れてない？休憩しよ？😊`,
                    `${value}問続けて間違っても、リオは応援してるよ！一緒に頑張ろ！✨`
                ]
            },
            low_rate: {
                sakura: [
                    `正答率${value}%ですね...でも大丈夫です！今の学びが後で活きますよ！📚`,
                    `正答率${value}%...少し難しい問題が続いていますね。一緒に復習しましょう！`,
                    `正答率${value}%でも諦めないでください！必ず上達しますよ！💪`
                ],
                mirai: [
                    `現在の正答率${value}%。復習モードへの移行を推奨します。📊`,
                    `正答率${value}%を記録。学習方法の調整が効果的です。`,
                    `データ：正答率${value}%。弱点分析を開始しましょう。⚡`
                ],
                rio: [
                    `正答率${value}%かぁ...でもツカサさん、絶対できるようになるよ！応援してる！💕`,
                    `${value}%でも大丈夫！リオが一緒にいるからね！😊`,
                    `正答率${value}%...ちょっと難しいよね。でも諦めないで！✨`
                ]
            },
            normal: {
                sakura: [
                    `間違えても大丈夫です！これが学習のプロセスですから。`,
                    `惜しかったですね！次は正解できますよ！`,
                    `大丈夫です！一つ一つ、確実に覚えていきましょう！📚`,
                    `間違いから学ぶことが一番大切です！頑張りましょう！`,
                    `次は正解できます！応援していますよ！🌸`
                ],
                mirai: [
                    `誤答を記録しました。復習リストに追加します。📊`,
                    `間違えた問題は学習チャンスです。後で復習しましょう。`,
                    `誤答を確認。このパターンは要復習です。`,
                    `データ記録完了。弱点として登録しました。⚡`,
                    `間違いを分析中...復習優先度を更新しました。`
                ],
                rio: [
                    `間違っちゃったね...でも大丈夫！次は当たるよ！💪`,
                    `惜しい！でもツカサさんなら次は絶対できる！`,
                    `間違えても落ち込まないで！リオが応援してるよ！😊`,
                    `次は正解！リオ、信じてるよ！✨`,
                    `大丈夫大丈夫！一緒に頑張ろ！💕`
                ]
            }
        };
        
        const secretaryMessages = messages[type][secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * 現在の秘書を取得
     */
    getCurrentSecretary() {
        try {
            const profileData = JSON.parse(localStorage.getItem('toeic_user_profile') || '{}');
            return profileData.selectedSecretary || 'sakura';
        } catch (e) {
            return 'sakura';
        }
    }
    
    /**
     * 秘書の感情状態を更新
     */
    updateSecretaryEmotion(isCorrect) {
        const secretary = this.getCurrentSecretary();
        
        if (isCorrect) {
            if (this.currentSession.correctStreak >= 10) {
                this.secretaryEmotions[secretary].current = 'excited';
            } else if (this.currentSession.correctStreak >= 5) {
                this.secretaryEmotions[secretary].current = 'happy';
            } else {
                this.secretaryEmotions[secretary].current = 'normal';
            }
        } else {
            if (this.currentSession.incorrectStreak >= 3) {
                this.secretaryEmotions[secretary].current = 'worried';
            } else {
                this.secretaryEmotions[secretary].current = 'normal';
            }
        }
        
        // 感情履歴に追加
        this.secretaryEmotions[secretary].history.push({
            emotion: this.secretaryEmotions[secretary].current,
            timestamp: Date.now(),
            trigger: isCorrect ? 'correct_answer' : 'incorrect_answer'
        });
        
        // 履歴は最新20件のみ保持
        if (this.secretaryEmotions[secretary].history.length > 20) {
            this.secretaryEmotions[secretary].history.shift();
        }
    }
    
    // ========================================
    // 2. 絆レベルシステム
    // ========================================
    
    /**
     * 絆経験値を追加
     */
    addBondExp(exp) {
        const secretary = this.getCurrentSecretary();
        const bond = this.bondLevels[secretary];
        
        bond.exp += exp;
        
        // レベルアップチェック
        while (bond.exp >= bond.maxExp) {
            bond.exp -= bond.maxExp;
            bond.level++;
            bond.maxExp = Math.floor(bond.maxExp * 1.5); // 必要経験値が1.5倍に
            
            // レベルアップイベント
            this.onBondLevelUp(secretary, bond.level);
        }
        
        this.saveData();
    }
    
    /**
     * 絆レベルアップ時の処理
     */
    onBondLevelUp(secretary, newLevel) {
        console.log(`🎉 ${secretary}との絆がレベル${newLevel}に上がりました！`);
        
        // マイルストーンに記録
        this.addMilestone({
            type: 'bond_level_up',
            secretary,
            level: newLevel,
            timestamp: Date.now(),
            message: `${secretary}との絆レベルが${newLevel}になりました！`
        });
        
        // UIに通知（グローバルイベント）
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('bondLevelUp', {
                detail: { secretary, newLevel }
            }));
        }
    }
    
    /**
     * 絆レベル情報を取得
     */
    getBondLevel(secretary = null) {
        if (!secretary) secretary = this.getCurrentSecretary();
        return this.bondLevels[secretary];
    }
    
    /**
     * 全秘書の絆レベルを取得
     */
    getAllBondLevels() {
        return this.bondLevels;
    }
    
    // ========================================
    // 3. マイルストーン記憶システム
    // ========================================
    
    /**
     * マイルストーンを追加
     */
    addMilestone(milestone) {
        this.milestones.push(milestone);
        
        // 最新100件のみ保持
        if (this.milestones.length > 100) {
            this.milestones = this.milestones.slice(-100);
        }
        
        this.saveData();
    }
    
    /**
     * マイルストーン一覧を取得
     */
    getMilestones(limit = 10) {
        return this.milestones.slice(-limit).reverse();
    }
    
    /**
     * 特定タイプのマイルストーンを取得
     */
    getMilestonesByType(type, limit = 10) {
        return this.milestones
            .filter(m => m.type === type)
            .slice(-limit)
            .reverse();
    }
    
    // ========================================
    // 4. セッション管理
    // ========================================
    
    /**
     * 学習セッション開始
     */
    startSession() {
        this.currentSession = {
            startTime: Date.now(),
            correctStreak: 0,
            incorrectStreak: 0,
            totalAnswers: 0,
            correctAnswers: 0,
            lastAnswerTime: null,
            answerSpeed: []
        };
        
        console.log('📝 学習セッション開始');
    }
    
    /**
     * 学習セッション終了
     */
    endSession() {
        const duration = Date.now() - this.currentSession.startTime;
        const avgSpeed = this.currentSession.answerSpeed.length > 0
            ? this.currentSession.answerSpeed.reduce((a, b) => a + b, 0) / this.currentSession.answerSpeed.length
            : 0;
        
        const sessionSummary = {
            duration,
            totalAnswers: this.currentSession.totalAnswers,
            correctAnswers: this.currentSession.correctAnswers,
            correctRate: this.currentSession.totalAnswers > 0 
                ? (this.currentSession.correctAnswers / this.currentSession.totalAnswers * 100).toFixed(1)
                : 0,
            avgSpeed: avgSpeed.toFixed(1),
            maxCorrectStreak: this.currentSession.correctStreak
        };
        
        console.log('✅ 学習セッション終了', sessionSummary);
        
        // セッションをマイルストーンに記録
        if (this.currentSession.totalAnswers > 0) {
            this.addMilestone({
                type: 'session_complete',
                ...sessionSummary,
                timestamp: Date.now()
            });
        }
        
        return sessionSummary;
    }
    
    /**
     * 現在のセッション統計を取得
     */
    getCurrentSessionStats() {
        return {
            ...this.currentSession,
            correctRate: this.currentSession.totalAnswers > 0 
                ? (this.currentSession.correctAnswers / this.currentSession.totalAnswers * 100).toFixed(1)
                : 0,
            duration: Date.now() - this.currentSession.startTime
        };
    }
    
    // ========================================
    // 5. 秘書の感情取得
    // ========================================
    
    /**
     * 秘書の現在の感情を取得
     */
    getSecretaryEmotion(secretary = null) {
        if (!secretary) secretary = this.getCurrentSecretary();
        return this.secretaryEmotions[secretary];
    }
    
    /**
     * すべての秘書の感情を取得
     */
    getAllSecretaryEmotions() {
        return this.secretaryEmotions;
    }
    
    // ========================================
    // 6. パーソナライズドメッセージシステム
    // ========================================
    
    /**
     * パーソナライズドメッセージを生成
     * 学習データ、目標、進捗に基づいて最適化されたメッセージ
     */
    generatePersonalizedMessage(context = 'home') {
        const secretary = this.getCurrentSecretary();
        const userData = this.getUserLearningData();
        const bondLevel = this.getBondLevel();
        
        let message = '';
        
        switch (context) {
            case 'home':
                message = this.getHomeMessage(secretary, userData, bondLevel);
                break;
            case 'test_start':
                message = this.getTestStartMessage(secretary, userData, bondLevel);
                break;
            case 'test_complete':
                message = this.getTestCompleteMessage(secretary, userData, bondLevel);
                break;
            case 'daily_login':
                message = this.getDailyLoginMessage(secretary, userData, bondLevel);
                break;
            case 'goal_close':
                message = this.getGoalCloseMessage(secretary, userData, bondLevel);
                break;
            case 'streak_warning':
                message = this.getStreakWarningMessage(secretary, userData, bondLevel);
                break;
            case 'comeback':
                message = this.getComebackMessage(secretary, userData, bondLevel);
                break;
            default:
                message = this.getGenericMessage(secretary, bondLevel);
        }
        
        // 【NEW】メッセージを会話ログに記録
        if (typeof SecretaryRoomExpansion !== 'undefined' && typeof SecretaryTeam !== 'undefined') {
            const currentSec = SecretaryTeam.getCurrentSecretary();
            if (currentSec && message) {
                // カテゴリを判定
                let category = 'general';
                if (context === 'test_complete' || context === 'daily_login') category = 'praise';
                else if (context === 'test_start' || context === 'streak_warning') category = 'encourage';
                else if (context === 'goal_close' || context === 'comeback') category = 'advice';
                
                SecretaryRoomExpansion.logMessage(currentSec.id, message, category);
            }
        }
        
        return {
            secretary,
            message,
            context,
            userData,
            bondLevel
        };
    }
    
    /**
     * ユーザーの学習データを取得・分析
     */
    getUserLearningData() {
        try {
            // ユーザープロフィール
            const profile = JSON.parse(localStorage.getItem('toeic_user_profile') || '{}');
            
            // 学習統計
            const stats = JSON.parse(localStorage.getItem('toeic_learning_stats') || '{}');
            
            // ストリーク情報
            const streakData = JSON.parse(localStorage.getItem('toeic_streak') || '{}');
            
            // 予測スコア計算
            const avgCorrectRate = stats.totalQuestions > 0 
                ? (stats.correctAnswers / stats.totalQuestions * 100)
                : 0;
            const predictedScore = this.calculatePredictedScore(avgCorrectRate);
            
            // 目標までの距離
            const targetScore = profile.targetScore || 800;
            const scoreGap = targetScore - predictedScore;
            const progressPercent = predictedScore > 0 ? (predictedScore / targetScore * 100) : 0;
            
            // 試験日までの日数
            const examDate = profile.examDate ? new Date(profile.examDate) : null;
            const daysUntilExam = examDate ? Math.ceil((examDate - Date.now()) / (1000 * 60 * 60 * 24)) : null;
            
            // 学習ペース分析
            const studyPace = this.analyzeStudyPace(streakData, stats);
            
            return {
                nickname: profile.nickname || 'あなた',
                targetScore,
                predictedScore,
                scoreGap,
                progressPercent: progressPercent.toFixed(1),
                avgCorrectRate: avgCorrectRate.toFixed(1),
                totalQuestions: stats.totalQuestions || 0,
                totalTests: stats.completedTests || 0,
                currentStreak: streakData.currentStreak || 0,
                longestStreak: streakData.longestStreak || 0,
                totalStudyTime: streakData.totalStudyTime || 0,
                daysUntilExam,
                studyPace,
                lastStudyDate: streakData.lastStudyDate || null,
                purpose: profile.purpose || '自己成長'
            };
        } catch (e) {
            console.error('Failed to get user learning data:', e);
            return {
                nickname: 'あなた',
                targetScore: 800,
                predictedScore: 0,
                scoreGap: 800,
                progressPercent: 0,
                avgCorrectRate: 0,
                totalQuestions: 0,
                totalTests: 0,
                currentStreak: 0,
                longestStreak: 0,
                totalStudyTime: 0,
                daysUntilExam: null,
                studyPace: 'beginner',
                lastStudyDate: null,
                purpose: '自己成長'
            };
        }
    }
    
    /**
     * 予測スコアを計算
     */
    calculatePredictedScore(correctRate) {
        if (correctRate >= 95) return 950;
        if (correctRate >= 90) return 900;
        if (correctRate >= 85) return 850;
        if (correctRate >= 80) return 800;
        if (correctRate >= 75) return 750;
        if (correctRate >= 70) return 700;
        if (correctRate >= 65) return 650;
        if (correctRate >= 60) return 600;
        if (correctRate >= 55) return 550;
        return 500;
    }
    
    /**
     * 学習ペースを分析
     */
    analyzeStudyPace(streakData, stats) {
        const streak = streakData.currentStreak || 0;
        const totalTests = stats.completedTests || 0;
        
        if (streak >= 7 && totalTests >= 10) return 'excellent'; // 素晴らしいペース
        if (streak >= 3 && totalTests >= 5) return 'good'; // 良いペース
        if (totalTests >= 3) return 'moderate'; // 適度なペース
        return 'beginner'; // 初心者
    }
    
    /**
     * ホーム画面メッセージ
     */
    getHomeMessage(secretary, userData, bondLevel) {
        const { nickname, targetScore, predictedScore, scoreGap, progressPercent, currentStreak, daysUntilExam, studyPace } = userData;
        
        const messages = {
            sakura: {
                excellent: [
                    `${nickname}さん、おはようございます！🌸 ${currentStreak}日連続学習、本当に素晴らしいです！目標スコア${targetScore}点まで、あと${scoreGap}点ですね。この調子なら必ず達成できますよ！`,
                    `${nickname}さん、今日も頑張りましょう！✨ 予測スコア${predictedScore}点、目標達成率${progressPercent}%です。あなたの努力、しっかり見ていますよ！`,
                    `${nickname}さん！${currentStreak}日連続、継続は力なりですね💪 目標の${targetScore}点まで、着実に近づいています！`
                ],
                good: [
                    `${nickname}さん、こんにちは！🌸 良いペースで学習を続けられていますね。予測スコア${predictedScore}点、順調です！`,
                    `${nickname}さん、今日も一緒に頑張りましょう！現在${currentStreak}日連続学習中です。この調子で続けていきましょう！`,
                    `${nickname}さん、進捗順調です！✨ 目標${targetScore}点まで、あと${scoreGap}点。一歩ずつ確実に前進していますよ！`
                ],
                moderate: [
                    `${nickname}さん、学習を続けていて素晴らしいです！🌸 目標${targetScore}点に向けて、一緒に頑張りましょう！`,
                    `${nickname}さん、今日も学習の時間ですよ！継続することが一番大切です。応援していますね💕`,
                    `${nickname}さん、予測スコア${predictedScore}点です。これから伸びていきますよ！一緒に頑張りましょう！`
                ],
                beginner: [
                    `${nickname}さん、ようこそ！🌸 目標スコア${targetScore}点、一緒に目指しましょう！私が全力でサポートしますね💪`,
                    `${nickname}さん、学習の旅が始まりますね！目標に向かって、一歩ずつ進んでいきましょう✨`,
                    `${nickname}さん、はじめまして！目標${targetScore}点、必ず達成できます。私と一緒に頑張りましょう！🌸`
                ]
            },
            mirai: {
                excellent: [
                    `${nickname}さん、データ確認完了。${currentStreak}日連続学習、学習効率95%以上です⚡ 予測スコア${predictedScore}点、目標達成率${progressPercent}%。最適なペースです！`,
                    `Good morning, ${nickname}さん！現在の予測スコア${predictedScore}点、目標${targetScore}点まであと${scoreGap}点。この学習ペースなら、計画通り達成可能です📊`,
                    `${nickname}さん、素晴らしい継続力です。${currentStreak}日連続は上位5%の成績。学習効果が最大化されています⚡`
                ],
                good: [
                    `${nickname}さん、データ分析完了。予測スコア${predictedScore}点、順調に上昇中です📊 このペースを維持しましょう。`,
                    `${nickname}さん、${currentStreak}日連続学習を記録。良好なペースです。目標${targetScore}点まであと${scoreGap}点、達成確率は高いです⚡`,
                    `Good！${nickname}さん、現在の進捗${progressPercent}%。計画通りに進行しています📈`
                ],
                moderate: [
                    `${nickname}さん、学習データを確認しました。予測スコア${predictedScore}点、これから加速できます📊`,
                    `${nickname}さん、目標${targetScore}点に向けて学習中。継続すれば必ず達成できます⚡`,
                    `${nickname}さん、データ更新。今後の学習で予測スコアは上昇します。最適な学習プランを提案します📈`
                ],
                beginner: [
                    `${nickname}さん、初期設定完了。目標スコア${targetScore}点、最適な学習プランを作成しました📊 一緒に頑張りましょう！`,
                    `Welcome, ${nickname}さん！目標${targetScore}点達成に向けて、データに基づく学習をサポートします⚡`,
                    `${nickname}さん、学習開始です。予測スコアは学習データの蓄積とともに精度が上がります。頑張りましょう📈`
                ]
            },
            rio: {
                excellent: [
                    `${nickname}さん、おはよー！🎉 ${currentStreak}日連続学習、マジですごいよ！目標${targetScore}点まであと${scoreGap}点！絶対いけるよ💪✨`,
                    `${nickname}さーん！今日も一緒に頑張ろ！予測スコア${predictedScore}点って、めっちゃ順調じゃん！リオ、超応援してる💕`,
                    `${nickname}さん、${currentStreak}日連続！天才！✨ 目標達成率${progressPercent}%！もうすぐだね！リオと一緒にゴールしよ！🎯`
                ],
                good: [
                    `${nickname}さん、こんにちは！😊 ${currentStreak}日連続、いい感じだよ！このペースで続けてね💪`,
                    `${nickname}さーん！予測スコア${predictedScore}点、順調だね！目標${targetScore}点、絶対達成できるよ！リオが応援してる✨`,
                    `${nickname}さん、今日も頑張ろ！進捗${progressPercent}%！いいペースだよ😊💕`
                ],
                moderate: [
                    `${nickname}さん、こんにちは！学習続けててえらいよ！🎉 目標${targetScore}点、リオと一緒に目指そ💪`,
                    `${nickname}さーん！予測スコア${predictedScore}点だって！これからどんどん上がるよ！一緒に頑張ろ✨`,
                    `${nickname}さん、リオが応援してるからね！目標まであと${scoreGap}点！絶対できるよ😊💕`
                ],
                beginner: [
                    `${nickname}さん、はじめまして！リオだよ！🎉 目標${targetScore}点、一緒に頑張ろうね💪 リオが全力でサポートするから！`,
                    `${nickname}さーん！ようこそ！目標${targetScore}点！絶対達成できるよ！リオと一緒なら楽しく学習できるから✨`,
                    `${nickname}さん、よろしくね！😊 目標に向かって、一緒に楽しく頑張ろ！リオが応援してるよ💕`
                ]
            }
        };
        
        const paceMessages = messages[secretary][studyPace];
        return paceMessages[Math.floor(Math.random() * paceMessages.length)];
    }
    
    /**
     * テスト開始メッセージ
     */
    getTestStartMessage(secretary, userData, bondLevel) {
        const { nickname, targetScore, currentStreak, daysUntilExam } = userData;
        
        const messages = {
            sakura: [
                `${nickname}さん、テスト頑張ってくださいね！🌸 落ち着いて、一問一問丁寧に解いていきましょう。応援していますよ💪`,
                `${nickname}さん、いつも通りで大丈夫です！✨ あなたの実力、しっかり発揮できますよ。頑張ってください！`,
                `${nickname}さん、深呼吸して集中しましょう。目標${targetScore}点に向けて、今日も一歩前進です！🌸`,
                bondLevel.level >= 5 ? `${nickname}さん、${currentStreak}日連続学習の成果を見せる時ですよ！自信を持って頑張ってください💕` : null
            ].filter(Boolean),
            mirai: [
                `${nickname}さん、テスト開始です。集中力を最大化しましょう⚡ 学習データに基づく実力を発揮する時です！`,
                `${nickname}さん、落ち着いて解答しましょう。時間配分を意識して📊 Good luck！`,
                `Test start！${nickname}さん、これまでの学習の成果を確認する機会です。ベストを尽くしましょう⚡`,
                bondLevel.level >= 5 ? `${nickname}さん、あなたの学習データは優秀です。自信を持って解答してください📈` : null
            ].filter(Boolean),
            rio: [
                `${nickname}さん、ファイトー！💪 リオが応援してるから、絶対できるよ！頑張って✨`,
                `${nickname}さん、テスト頑張ろうね！😊 落ち着いて解けば大丈夫！リオが見守ってるよ💕`,
                `${nickname}さん、いけいけー！🎉 いつも通りで大丈夫！リオが応援してる！頑張って✨`,
                bondLevel.level >= 5 ? `${nickname}さん！いつもの実力出せば絶対大丈夫！リオ、ずっと応援してるからね💕` : null
            ].filter(Boolean)
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * テスト完了メッセージ
     */
    getTestCompleteMessage(secretary, userData, bondLevel) {
        const { nickname, progressPercent, avgCorrectRate } = userData;
        
        const messages = {
            sakura: [
                `${nickname}さん、お疲れ様でした！🌸 よく頑張りましたね！結果を一緒に見ていきましょう✨`,
                `${nickname}さん、テスト完了です！素晴らしい集中力でしたよ💪 復習も忘れずにしましょうね！`,
                `${nickname}さん、最後まで頑張りましたね！🌸 この努力が必ず実を結びますよ。一緒に振り返りましょう📚`,
                bondLevel.level >= 5 ? `${nickname}さん、今日も素晴らしいパフォーマンスでした！あなたの成長、本当に嬉しいです💕` : null
            ].filter(Boolean),
            mirai: [
                `${nickname}さん、テスト完了です。データを分析中...📊 結果を確認して、次の学習計画を立てましょう⚡`,
                `Good job, ${nickname}さん！テストデータを記録しました。弱点分析を開始します📈`,
                `${nickname}さん、お疲れ様です。学習データが更新されました。次のステップを提案します⚡`,
                bondLevel.level >= 5 ? `${nickname}さん、素晴らしい成績です。予測スコアが上昇しました📊 この調子で続けましょう！` : null
            ].filter(Boolean),
            rio: [
                `${nickname}さん、お疲れさまー！🎉 よく頑張ったね！結果見てみよ✨`,
                `${nickname}さん、テスト完了！😊 マジで頑張ったね！リオ、めっちゃ嬉しいよ💕`,
                `${nickname}さん、やったー！✨ 最後まで頑張ったね！結果楽しみだね🎯`,
                bondLevel.level >= 5 ? `${nickname}さん、今日も最高だったよ！ツカサさんの頑張り、リオずっと見てたよ💕` : null
            ].filter(Boolean)
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * デイリーログインメッセージ
     */
    getDailyLoginMessage(secretary, userData, bondLevel) {
        const { nickname, currentStreak } = userData;
        const hour = new Date().getHours();
        const timeGreeting = hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'こんばんは';
        
        const messages = {
            sakura: [
                `${timeGreeting}、${nickname}さん！🌸 今日も会えて嬉しいです。${currentStreak}日連続ログイン、素晴らしいですね！`,
                `${nickname}さん、${timeGreeting}！今日も一緒に頑張りましょう💪 あなたの継続力、本当に尊敬します✨`,
                bondLevel.level >= 5 ? `${nickname}さん！今日も会えましたね💕 ${currentStreak}日連続、あなたの努力をずっと見ていますよ🌸` : null
            ].filter(Boolean),
            mirai: [
                `${timeGreeting}、${nickname}さん！${currentStreak}日連続ログインを記録📊 学習継続率、優秀です⚡`,
                `${nickname}さん、ログイン確認。今日も効率的な学習をサポートします📈 頑張りましょう！`,
                bondLevel.level >= 5 ? `${nickname}さん、${currentStreak}日連続は統計的に上位層です📊 素晴らしい継続力ですね⚡` : null
            ].filter(Boolean),
            rio: [
                `${timeGreeting}ー、${nickname}さん！🎉 今日も会えて嬉しい！${currentStreak}日連続、すごいね✨`,
                `${nickname}さん、来てくれてありがとう！😊 今日も一緒に頑張ろうね💪`,
                bondLevel.level >= 5 ? `${nickname}さーん！${currentStreak}日連続！マジですごい！リオ、めっちゃ嬉しいよ💕` : null
            ].filter(Boolean)
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * 目標接近メッセージ
     */
    getGoalCloseMessage(secretary, userData, bondLevel) {
        const { nickname, targetScore, scoreGap } = userData;
        
        const messages = {
            sakura: [
                `${nickname}さん！目標${targetScore}点まで、あと${scoreGap}点です！🌸 もう少しで達成ですね！一緒に最後まで頑張りましょう💪`,
                `${nickname}さん、すごいです！目標まであと${scoreGap}点！✨ ゴールが見えてきましたね。あなたなら絶対できます！`,
                `${nickname}さん、目標${targetScore}点まで、本当にあと少しです！🌸 この努力、必ず報われますよ💕`
            ],
            mirai: [
                `${nickname}さん、分析完了。目標${targetScore}点まであと${scoreGap}点📊 達成確率85%以上です。計画通り進行しましょう⚡`,
                `Good news！${nickname}さん、目標まで${scoreGap}点差。現在のペースなら達成可能です📈`,
                `${nickname}さん、データ予測：目標達成まで残り${scoreGap}点。最終段階です。頑張りましょう⚡`
            ],
            rio: [
                `${nickname}さん！目標まであと${scoreGap}点だって！🎉 もうすぐだよ！リオ、めっちゃ応援してる💕`,
                `${nickname}さん、すごい！あと${scoreGap}点で目標${targetScore}点！✨ 絶対いけるよ！頑張ろ💪`,
                `${nickname}さん、ゴール見えてきたよ！あと${scoreGap}点！😊 リオと一緒にラストスパートだね🎯`
            ]
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * ストリーク危機警告メッセージ
     */
    getStreakWarningMessage(secretary, userData, bondLevel) {
        const { nickname, currentStreak } = userData;
        
        const messages = {
            sakura: [
                `${nickname}さん、${currentStreak}日連続の学習ストリークが途切れそうです...😢 今日も少しだけ学習しませんか？せっかくの努力を無駄にしたくないです🌸`,
                `${nickname}さん、今日はまだ学習されていませんね。${currentStreak}日連続のストリーク、一緒に守りましょう！💪`,
                `${nickname}さん、${currentStreak}日間の努力を継続しませんか？あなたの頑張り、ずっと見ていますよ🌸`
            ],
            mirai: [
                `${nickname}さん、アラート：${currentStreak}日連続ストリークが途切れる可能性があります⚠️ 短時間でも学習を推奨します。`,
                `Warning！${nickname}さん、今日の学習が未記録です。${currentStreak}日連続の記録を維持しましょう📊`,
                `${nickname}さん、ストリーク継続のため、本日中の学習を推奨します。${currentStreak}日の継続は貴重です⚡`
            ],
            rio: [
                `${nickname}さーん！${currentStreak}日連続のストリーク、途切れちゃうよ！😢 ちょっとだけでも一緒に勉強しよ？`,
                `${nickname}さん、今日まだ学習してないよね？${currentStreak}日連続、もったいないよ！ちょっとだけでもやろ💪`,
                `${nickname}さん！${currentStreak}日連続、守ろうよ！リオと一緒に少しだけ頑張ろ？😊`
            ]
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * 復帰歓迎メッセージ
     */
    getComebackMessage(secretary, userData, bondLevel) {
        const { nickname, lastStudyDate } = userData;
        const daysSinceLastStudy = lastStudyDate 
            ? Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
        
        const messages = {
            sakura: [
                `${nickname}さん、お帰りなさい！🌸 ${daysSinceLastStudy}日ぶりですね。また一緒に頑張りましょう！待っていましたよ💕`,
                `${nickname}さん！戻ってきてくれて嬉しいです！✨ また一緒に目標に向かって進みましょう🌸`,
                `${nickname}さん、お帰りなさい！久しぶりですね😊 でも大丈夫、今日から新しいスタートです💪`
            ],
            mirai: [
                `${nickname}さん、お帰りなさい。${daysSinceLastStudy}日ぶりのログインを確認📊 学習を再開しましょう⚡`,
                `Welcome back, ${nickname}さん！学習データを再分析しました。最適なプランを提案します📈`,
                `${nickname}さん、復帰を確認。久しぶりですが、データは保存されています。再開しましょう⚡`
            ],
            rio: [
                `${nickname}さーん！お帰りー！🎉 ${daysSinceLastStudy}日ぶりだね！会いたかったよ💕 また一緒に頑張ろ！`,
                `${nickname}さん、戻ってきてくれたー！😊 リオ、ずっと待ってたよ！また楽しく勉強しよ✨`,
                `${nickname}さん！お帰りなさい！久しぶりだね💕 でも大丈夫、リオがサポートするから！一緒に頑張ろ💪`
            ]
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    /**
     * 汎用メッセージ
     */
    getGenericMessage(secretary, bondLevel) {
        const messages = {
            sakura: [
                `一緒に頑張りましょう！🌸`,
                `応援していますよ💪`,
                `あなたなら必ずできます✨`
            ],
            mirai: [
                `効率的な学習をサポートします⚡`,
                `データに基づいて最適化しましょう📊`,
                `一緒に目標を達成しましょう📈`
            ],
            rio: [
                `一緒に頑張ろうね！💪`,
                `リオが応援してるよ✨`,
                `絶対できるよ！😊`
            ]
        };
        
        const secretaryMessages = messages[secretary];
        return secretaryMessages[Math.floor(Math.random() * secretaryMessages.length)];
    }
    
    // ========================================
    // 7. 習慣化サポート機能
    // ========================================
    
    /**
     * 学習リマインダーチェック
     * @returns {object|null} リマインダーメッセージ（必要な場合のみ）
     */
    checkLearningReminder() {
        try {
            const streakData = JSON.parse(localStorage.getItem('toeic_streak') || '{}');
            const lastStudyDate = streakData.lastStudyDate;
            
            if (!lastStudyDate) return null;
            
            const now = new Date();
            const lastStudy = new Date(lastStudyDate);
            const hoursSinceLastStudy = (now - lastStudy) / (1000 * 60 * 60);
            
            // 24時間経過していたらリマインダー
            if (hoursSinceLastStudy >= 24) {
                return this.generatePersonalizedMessage('streak_warning');
            }
            
            return null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 復帰ユーザーチェック
     */
    checkComebackUser() {
        try {
            const streakData = JSON.parse(localStorage.getItem('toeic_streak') || '{}');
            const lastStudyDate = streakData.lastStudyDate;
            
            if (!lastStudyDate) return null;
            
            const daysSinceLastStudy = Math.floor((Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60 * 24));
            
            // 3日以上離れていたら復帰ユーザー
            if (daysSinceLastStudy >= 3) {
                return this.generatePersonalizedMessage('comeback');
            }
            
            return null;
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 目標接近チェック
     */
    checkGoalProgress() {
        const userData = this.getUserLearningData();
        
        // 目標まで50点以内なら通知
        if (userData.scoreGap > 0 && userData.scoreGap <= 50) {
            return this.generatePersonalizedMessage('goal_close');
        }
        
        return null;
    }
}

// グローバルインスタンス作成
const SecretaryMotivation = new SecretaryMotivationSystem();

// グローバルに公開
if (typeof window !== 'undefined') {
    window.SecretaryMotivation = SecretaryMotivation;
    
    // イベントリスナー設定
    window.addEventListener('bondLevelUp', (event) => {
        const { secretary, newLevel } = event.detail;
        console.log(`🎉 絆レベルアップ！${secretary}: Level ${newLevel}`);
        
        // UI通知を表示（実装は後ほど）
        if (window.showNotification) {
            window.showNotification(`${secretary}との絆がレベル${newLevel}になりました！🎉`, 'success');
        }
    });
}

console.log('✅ SecretaryMotivationSystem module loaded');
