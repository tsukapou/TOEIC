/**
 * 🧠 適応型分散復習システム (Adaptive Spaced Repetition)
 * Version: 1.0.0
 * Updated: 2025-12-08
 * 
 * 【目的】
 * ユーザーの記憶力を分析し、個人に最適化された復習間隔を自動調整
 * 
 * 【主な機能】
 * 1. ユーザーの記憶力プロファイル作成
 * 2. 問題ごとの定着度を追跡
 * 3. 動的な復習間隔調整
 * 4. 学習効率の可視化
 * 
 * 【従来との違い】
 * - 従来: 固定間隔（1日、3日、7日、14日、30日、60日）
 * - 適応型: ユーザーの記憶力に合わせて間隔を調整
 */

class AdaptiveSpacedRepetition {
    constructor() {
        this.STORAGE_KEY = 'adaptive_sr_data';
        this.PROFILE_KEY = 'adaptive_sr_profile';
        
        // ユーザーの記憶力プロファイル
        this.memoryProfile = this.loadMemoryProfile();
        
        // 問題ごとの学習データ
        this.learningData = this.loadLearningData();
        
        console.log('🧠 適応型分散復習システム初期化完了');
        this.logProfile();
    }
    
    /**
     * 記憶力プロファイルを読み込み
     */
    loadMemoryProfile() {
        try {
            const data = localStorage.getItem(this.PROFILE_KEY);
            return data ? JSON.parse(data) : this.createDefaultProfile();
        } catch (error) {
            console.error('記憶力プロファイルの読み込みエラー:', error);
            return this.createDefaultProfile();
        }
    }
    
    /**
     * デフォルトの記憶力プロファイルを作成
     */
    createDefaultProfile() {
        return {
            // 記憶力係数（1.0が平均、大きいほど記憶力が良い）
            memoryCoefficient: 1.0,
            
            // カテゴリ別の習熟度
            categoryProficiency: {},
            
            // 全体的な学習統計
            totalReviews: 0,
            successfulReviews: 0,
            averageRetentionDays: 0,
            
            // 最適化された基準間隔（日数）
            baseIntervals: {
                0: 1,    // 初回復習
                1: 3,    // 2回目
                2: 7,    // 3回目
                3: 14,   // 4回目
                4: 30,   // 5回目
                5: 60    // 6回目以降
            },
            
            // 更新日時
            lastUpdated: Date.now()
        };
    }
    
    /**
     * 学習データを読み込み
     */
    loadLearningData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('学習データの読み込みエラー:', error);
            return {};
        }
    }
    
    /**
     * データを保存
     */
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.learningData));
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(this.memoryProfile));
        } catch (error) {
            console.error('データの保存エラー:', error);
        }
    }
    
    /**
     * 問題の学習記録を追加
     */
    recordReview(questionId, isCorrect, category = 'general') {
        const now = Date.now();
        
        // 問題データを初期化または取得
        if (!this.learningData[questionId]) {
            this.learningData[questionId] = {
                questionId,
                category,
                level: 0,
                reviewHistory: [],
                lastReviewDate: null,
                nextReviewDate: null,
                easeFactor: 2.5, // 難易度係数（SM-2アルゴリズム）
                interval: 0
            };
        }
        
        const item = this.learningData[questionId];
        
        // 復習履歴に追加
        item.reviewHistory.push({
            date: now,
            isCorrect,
            interval: item.interval
        });
        
        item.lastReviewDate = now;
        
        // 正解/不正解に応じて処理
        if (isCorrect) {
            this.handleCorrectAnswer(item);
        } else {
            this.handleIncorrectAnswer(item);
        }
        
        // 記憶力プロファイルを更新
        this.updateMemoryProfile(item, isCorrect);
        
        // 保存
        this.save();
        
        console.log(`📝 記録: Q${questionId} ${isCorrect ? '✅' : '❌'} 次回: ${this.formatNextReview(item.nextReviewDate)}`);
    }
    
    /**
     * 正解時の処理（SM-2アルゴリズムベース）
     */
    handleCorrectAnswer(item) {
        // レベルアップ
        item.level = Math.min(item.level + 1, 5);
        
        // 間隔を計算
        if (item.level === 1) {
            item.interval = this.getAdaptiveInterval(0); // 初回
        } else if (item.level === 2) {
            item.interval = this.getAdaptiveInterval(1); // 2回目
        } else {
            // 3回目以降は前回の間隔 × 難易度係数
            item.interval = Math.round(item.interval * item.easeFactor);
        }
        
        // 難易度係数を上げる（記憶しやすい）
        item.easeFactor = Math.min(item.easeFactor + 0.1, 3.0);
        
        // 次回復習日を設定
        item.nextReviewDate = Date.now() + item.interval * 24 * 60 * 60 * 1000;
    }
    
    /**
     * 不正解時の処理
     */
    handleIncorrectAnswer(item) {
        // レベルをリセット
        item.level = 0;
        
        // 難易度係数を下げる（記憶しにくい）
        item.easeFactor = Math.max(item.easeFactor - 0.2, 1.3);
        
        // 初回の間隔に戻す
        item.interval = this.getAdaptiveInterval(0);
        
        // 次回復習日を設定（すぐに復習）
        item.nextReviewDate = Date.now() + item.interval * 24 * 60 * 60 * 1000;
    }
    
    /**
     * 記憶力プロファイルを更新
     */
    updateMemoryProfile(item, isCorrect) {
        const profile = this.memoryProfile;
        
        // 全体統計を更新
        profile.totalReviews++;
        if (isCorrect) {
            profile.successfulReviews++;
        }
        
        // カテゴリ別の習熟度を更新
        if (!profile.categoryProficiency[item.category]) {
            profile.categoryProficiency[item.category] = {
                total: 0,
                correct: 0,
                avgInterval: 0
            };
        }
        
        const catProf = profile.categoryProficiency[item.category];
        catProf.total++;
        if (isCorrect) {
            catProf.correct++;
        }
        
        // 記憶力係数を更新（正答率に基づく）
        const overallSuccessRate = profile.successfulReviews / profile.totalReviews;
        
        if (profile.totalReviews >= 10) {
            // 10回以上の復習データがあれば記憶力係数を調整
            if (overallSuccessRate > 0.85) {
                // 高い正答率 → 記憶力が良い → 間隔を伸ばす
                profile.memoryCoefficient = Math.min(profile.memoryCoefficient + 0.05, 2.0);
            } else if (overallSuccessRate < 0.65) {
                // 低い正答率 → もっと頻繁に復習
                profile.memoryCoefficient = Math.max(profile.memoryCoefficient - 0.05, 0.5);
            }
        }
        
        // 基準間隔を調整
        this.adjustBaseIntervals();
        
        profile.lastUpdated = Date.now();
    }
    
    /**
     * 基準間隔を調整
     */
    adjustBaseIntervals() {
        const coeff = this.memoryProfile.memoryCoefficient;
        const base = {
            0: 1,
            1: 3,
            2: 7,
            3: 14,
            4: 30,
            5: 60
        };
        
        // 記憶力係数に基づいて間隔を調整
        for (let level in base) {
            this.memoryProfile.baseIntervals[level] = Math.round(base[level] * coeff);
        }
    }
    
    /**
     * 適応的な復習間隔を取得
     */
    getAdaptiveInterval(level) {
        return this.memoryProfile.baseIntervals[level] || 1;
    }
    
    /**
     * 今日の復習が必要な問題を取得
     */
    getTodayReviews() {
        const now = Date.now();
        const reviews = [];
        
        for (let questionId in this.learningData) {
            const item = this.learningData[questionId];
            if (item.nextReviewDate && item.nextReviewDate <= now) {
                reviews.push({
                    ...item,
                    priority: this.calculatePriority(item)
                });
            }
        }
        
        // 優先度順にソート
        reviews.sort((a, b) => b.priority - a.priority);
        
        return reviews;
    }
    
    /**
     * 優先度を計算
     */
    calculatePriority(item) {
        const now = Date.now();
        const overdueDays = (now - item.nextReviewDate) / (24 * 60 * 60 * 1000);
        
        // 期限超過日数が多いほど優先度が高い
        let priority = overdueDays * 10;
        
        // 難易度係数が低い（記憶しにくい）ほど優先度が高い
        priority += (3.0 - item.easeFactor) * 5;
        
        return priority;
    }
    
    /**
     * 学習効率の統計を取得
     */
    getStatistics() {
        const profile = this.memoryProfile;
        const totalQuestions = Object.keys(this.learningData).length;
        const todayReviews = this.getTodayReviews();
        
        return {
            totalQuestions,
            todayReviews: todayReviews.length,
            memoryCoefficient: profile.memoryCoefficient,
            overallSuccessRate: profile.totalReviews > 0 
                ? (profile.successfulReviews / profile.totalReviews * 100).toFixed(1)
                : 0,
            totalReviews: profile.totalReviews,
            baseIntervals: profile.baseIntervals,
            memoryLevel: this.getMemoryLevel()
        };
    }
    
    /**
     * 記憶力レベルを取得
     */
    getMemoryLevel() {
        const coeff = this.memoryProfile.memoryCoefficient;
        
        if (coeff >= 1.5) return '優秀';
        if (coeff >= 1.2) return '良好';
        if (coeff >= 0.8) return '標準';
        return '要強化';
    }
    
    /**
     * 次回復習日をフォーマット
     */
    formatNextReview(timestamp) {
        if (!timestamp) return '未設定';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (24 * 60 * 60 * 1000));
        
        if (diffDays < 0) return `${Math.abs(diffDays)}日前（期限切れ）`;
        if (diffDays === 0) return '今日';
        if (diffDays === 1) return '明日';
        return `${diffDays}日後`;
    }
    
    /**
     * プロファイルをログ出力
     */
    logProfile() {
        const stats = this.getStatistics();
        console.log(`🧠 記憶力係数: ${stats.memoryCoefficient.toFixed(2)} (${stats.memoryLevel})`);
        console.log(`📊 全体正答率: ${stats.overallSuccessRate}%`);
        console.log(`📝 総復習回数: ${stats.totalReviews}回`);
        console.log(`📅 今日の復習: ${stats.todayReviews}問`);
        console.log(`⏰ 現在の基準間隔:`, stats.baseIntervals);
    }
}

// グローバルインスタンスを作成
window.AdaptiveSpacedRepetition = new AdaptiveSpacedRepetition();

console.log('🧠 適応型分散復習システム 準備完了');
