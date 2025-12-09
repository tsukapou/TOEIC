/**
 * TOEIC学習アプリ - 管理者用アナリティクスシステム (Admin Analytics System)
 * Version: 1.0.0
 * Updated: 2025-12-09
 * 
 * 【システム概要】
 * 開発者がデータに基づいてPDCAを回すための分析基盤
 * - KPIトラッキング（DAU, 継続率, コンバージョン率）
 * - 問題難易度分析
 * - ユーザージャーニー分析
 * - A/Bテスト機能
 * 
 * 【期待効果】
 * - データドリブンな改善サイクルの実現
 * - 問題コンテンツの最適化
 * - ユーザー体験の継続的改善
 * - コンバージョン率の向上
 */

class AdminAnalytics {
    constructor() {
        this.STORAGE_KEY = 'toeic_admin_analytics';
        this.init();
    }
    
    init() {
        this.loadAnalyticsData();
        console.log('📊 管理者用アナリティクス初期化完了');
    }
    
    /**
     * 分析データを読み込み
     */
    loadAnalyticsData() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        
        if (!data) {
            this.analytics = {
                // デイリーKPI
                dailyMetrics: {},
                
                // ユーザーアクティビティ
                userActivities: [],
                
                // 問題別統計
                questionStats: {},
                
                // A/Bテスト
                abTests: [],
                
                // コンバージョントラッキング
                conversions: [],
                
                // システム開始日
                startDate: Date.now()
            };
            this.saveAnalyticsData();
        } else {
            this.analytics = JSON.parse(data);
        }
    }
    
    /**
     * 分析データを保存
     */
    saveAnalyticsData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.analytics));
    }
    
    /**
     * ユーザーアクティビティを記録
     */
    recordActivity(activityType, metadata = {}) {
        const activity = {
            type: activityType,
            timestamp: Date.now(),
            userId: this.getUserId(),
            metadata: metadata
        };
        
        this.analytics.userActivities.push(activity);
        
        // 最新1000件のみ保持
        if (this.analytics.userActivities.length > 1000) {
            this.analytics.userActivities = this.analytics.userActivities.slice(-1000);
        }
        
        this.saveAnalyticsData();
    }
    
    /**
     * デイリーKPIを更新
     */
    updateDailyMetrics() {
        const today = this.getTodayString();
        
        if (!this.analytics.dailyMetrics[today]) {
            this.analytics.dailyMetrics[today] = {
                dau: 0,
                testsTaken: 0,
                avgScore: 0,
                avgTimeSpent: 0,
                newUsers: 0,
                premiumConversions: 0,
                revenue: 0
            };
        }
        
        // DAU（今日アクセスしたユーザー数）を計算
        const todayActivities = this.analytics.userActivities.filter(a => {
            const activityDate = new Date(a.timestamp).toDateString();
            const todayDate = new Date().toDateString();
            return activityDate === todayDate;
        });
        
        const uniqueUsers = new Set(todayActivities.map(a => a.userId));
        this.analytics.dailyMetrics[today].dau = uniqueUsers.size;
        
        this.saveAnalyticsData();
    }
    
    /**
     * テスト完了を記録
     */
    recordTestCompletion(testResult) {
        const today = this.getTodayString();
        
        // デイリーメトリクスを更新
        if (!this.analytics.dailyMetrics[today]) {
            this.updateDailyMetrics();
        }
        
        this.analytics.dailyMetrics[today].testsTaken++;
        
        // 平均スコアを更新
        const currentAvg = this.analytics.dailyMetrics[today].avgScore || 0;
        const currentCount = this.analytics.dailyMetrics[today].testsTaken;
        this.analytics.dailyMetrics[today].avgScore = 
            (currentAvg * (currentCount - 1) + testResult.accuracy) / currentCount;
        
        // 平均時間を更新
        const currentTimeAvg = this.analytics.dailyMetrics[today].avgTimeSpent || 0;
        this.analytics.dailyMetrics[today].avgTimeSpent = 
            (currentTimeAvg * (currentCount - 1) + testResult.timeSpent) / currentCount;
        
        // 問題別統計を更新
        if (testResult.questionDetails) {
            testResult.questionDetails.forEach(q => {
                if (!this.analytics.questionStats[q.questionId]) {
                    this.analytics.questionStats[q.questionId] = {
                        totalAttempts: 0,
                        correctAttempts: 0,
                        avgTimeSpent: 0,
                        difficulty: q.difficulty
                    };
                }
                
                const stat = this.analytics.questionStats[q.questionId];
                stat.totalAttempts++;
                if (q.isCorrect) {
                    stat.correctAttempts++;
                }
            });
        }
        
        this.recordActivity('test_completed', testResult);
        this.saveAnalyticsData();
    }
    
    /**
     * Premium購入を記録
     */
    recordPremiumPurchase(purchaseData) {
        const today = this.getTodayString();
        
        if (!this.analytics.dailyMetrics[today]) {
            this.updateDailyMetrics();
        }
        
        this.analytics.dailyMetrics[today].premiumConversions++;
        this.analytics.dailyMetrics[today].revenue += 980;
        
        this.analytics.conversions.push({
            timestamp: Date.now(),
            userId: this.getUserId(),
            type: 'premium_purchase',
            amount: 980,
            metadata: purchaseData
        });
        
        this.recordActivity('premium_purchase', purchaseData);
        this.saveAnalyticsData();
    }
    
    /**
     * KPIレポートを取得
     */
    getKPIReport(days = 7) {
        const report = {
            period: days,
            metrics: {
                totalDAU: 0,
                avgDAU: 0,
                totalTests: 0,
                avgTests: 0,
                avgScore: 0,
                avgTimeSpent: 0,
                premiumConversions: 0,
                conversionRate: 0,
                totalRevenue: 0
            },
            daily: []
        };
        
        const dates = this.getRecentDates(days);
        let totalScore = 0;
        let totalTime = 0;
        let daysWithData = 0;
        
        dates.forEach(date => {
            const metrics = this.analytics.dailyMetrics[date];
            
            if (metrics) {
                report.metrics.totalDAU += metrics.dau || 0;
                report.metrics.totalTests += metrics.testsTaken || 0;
                report.metrics.premiumConversions += metrics.premiumConversions || 0;
                report.metrics.totalRevenue += metrics.revenue || 0;
                
                if (metrics.avgScore > 0) {
                    totalScore += metrics.avgScore;
                    totalTime += metrics.avgTimeSpent;
                    daysWithData++;
                }
                
                report.daily.push({
                    date: date,
                    ...metrics
                });
            } else {
                report.daily.push({
                    date: date,
                    dau: 0,
                    testsTaken: 0
                });
            }
        });
        
        // 平均値を計算
        if (daysWithData > 0) {
            report.metrics.avgDAU = Math.round(report.metrics.totalDAU / days);
            report.metrics.avgTests = Math.round(report.metrics.totalTests / days);
            report.metrics.avgScore = Math.round(totalScore / daysWithData);
            report.metrics.avgTimeSpent = Math.round(totalTime / daysWithData);
        }
        
        // コンバージョン率（テスト実施ユーザーに対するPremium購入率）
        if (report.metrics.totalDAU > 0) {
            report.metrics.conversionRate = 
                (report.metrics.premiumConversions / report.metrics.totalDAU * 100).toFixed(2);
        }
        
        return report;
    }
    
    /**
     * 難問トップ10を取得
     */
    getHardestQuestions(limit = 10) {
        const questions = Object.entries(this.analytics.questionStats)
            .map(([id, stats]) => ({
                questionId: id,
                accuracy: stats.totalAttempts > 0 ? 
                    (stats.correctAttempts / stats.totalAttempts * 100).toFixed(1) : 0,
                totalAttempts: stats.totalAttempts,
                difficulty: stats.difficulty
            }))
            .filter(q => q.totalAttempts >= 5) // 最低5回試行された問題のみ
            .sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy))
            .slice(0, limit);
        
        return questions;
    }
    
    /**
     * 簡問トップ10を取得
     */
    getEasiestQuestions(limit = 10) {
        const questions = Object.entries(this.analytics.questionStats)
            .map(([id, stats]) => ({
                questionId: id,
                accuracy: stats.totalAttempts > 0 ? 
                    (stats.correctAttempts / stats.totalAttempts * 100).toFixed(1) : 0,
                totalAttempts: stats.totalAttempts,
                difficulty: stats.difficulty
            }))
            .filter(q => q.totalAttempts >= 5)
            .sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy))
            .slice(0, limit);
        
        return questions;
    }
    
    /**
     * ユーザージャーニー分析
     */
    getUserJourney(userId = null) {
        const targetUserId = userId || this.getUserId();
        
        const journey = this.analytics.userActivities
            .filter(a => a.userId === targetUserId)
            .sort((a, b) => a.timestamp - b.timestamp);
        
        return journey;
    }
    
    /**
     * 継続率を計算（Day 1, Day 7, Day 30）
     */
    getRetentionRate() {
        // 簡易実装：初回アクセスから今日までアクセスしているかをチェック
        const users = new Map();
        
        this.analytics.userActivities.forEach(activity => {
            if (!users.has(activity.userId)) {
                users.set(activity.userId, {
                    firstAccess: activity.timestamp,
                    lastAccess: activity.timestamp,
                    totalAccesses: 1
                });
            } else {
                const user = users.get(activity.userId);
                user.lastAccess = Math.max(user.lastAccess, activity.timestamp);
                user.totalAccesses++;
            }
        });
        
        const now = Date.now();
        const day1Retained = Array.from(users.values()).filter(u => 
            now - u.firstAccess >= 24 * 60 * 60 * 1000 && u.totalAccesses > 1
        ).length;
        
        const day7Retained = Array.from(users.values()).filter(u => 
            now - u.firstAccess >= 7 * 24 * 60 * 60 * 1000 && u.totalAccesses > 5
        ).length;
        
        const totalUsers = users.size;
        
        return {
            day1: totalUsers > 0 ? (day1Retained / totalUsers * 100).toFixed(1) : 0,
            day7: totalUsers > 0 ? (day7Retained / totalUsers * 100).toFixed(1) : 0,
            totalUsers: totalUsers
        };
    }
    
    /**
     * ヘルパー：ユーザーIDを取得
     */
    getUserId() {
        let userId = localStorage.getItem('toeic_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('toeic_user_id', userId);
        }
        return userId;
    }
    
    /**
     * ヘルパー：今日の日付（YYYY-MM-DD）
     */
    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }
    
    /**
     * ヘルパー：過去N日の日付リスト
     */
    getRecentDates(days) {
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            dates.push(dateString);
        }
        return dates;
    }
}

// グローバルインスタンス
window.adminAnalytics = null;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    window.adminAnalytics = new AdminAnalytics();
    window.adminAnalytics.updateDailyMetrics();
});
