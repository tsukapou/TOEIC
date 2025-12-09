/**
 * 🏆 Achievement System
 * 実績システム（アチーブメント）
 * 
 * 【機能】
 * 1. 42種類の実績管理
 * 2. 進捗追跡と解除判定
 * 3. 実績解除演出
 * 4. カテゴリ別表示
 * 
 * 【カテゴリ】
 * - 🎯 学習継続（7個）
 * - 📊 スコア達成（7個）
 * - 🔥 連続記録（7個）
 * - 📚 問題数（7個）
 * - 🎓 マスター（7個）
 * - 💎 特別（7個）
 * 
 * 実装日: 2025-12-09
 */

const AchievementSystem = {
    STORAGE_KEY: 'toeic_achievements',
    
    // 42種類の実績定義
    achievements: {
        // ============================================
        // 🎯 学習継続カテゴリ（7個）
        // ============================================
        first_test: {
            id: 'first_test',
            category: '学習継続',
            name: '第一歩',
            description: '初めてのテストを完了',
            icon: '👣',
            rarity: 'common',
            points: 10,
            condition: { type: 'test_count', value: 1 }
        },
        tests_5: {
            id: 'tests_5',
            category: '学習継続',
            name: '習慣の芽',
            description: '5回のテストを完了',
            icon: '🌱',
            rarity: 'common',
            points: 20,
            condition: { type: 'test_count', value: 5 }
        },
        tests_10: {
            id: 'tests_10',
            category: '学習継続',
            name: '学習の習慣',
            description: '10回のテストを完了',
            icon: '🌿',
            rarity: 'uncommon',
            points: 30,
            condition: { type: 'test_count', value: 10 }
        },
        tests_25: {
            id: 'tests_25',
            category: '学習継続',
            name: '熱心な学習者',
            description: '25回のテストを完了',
            icon: '🌳',
            rarity: 'rare',
            points: 50,
            condition: { type: 'test_count', value: 25 }
        },
        tests_50: {
            id: 'tests_50',
            category: '学習継続',
            name: '学習マスター',
            description: '50回のテストを完了',
            icon: '🏆',
            rarity: 'epic',
            points: 100,
            condition: { type: 'test_count', value: 50 }
        },
        tests_100: {
            id: 'tests_100',
            category: '学習継続',
            name: '百戦錬磨',
            description: '100回のテストを完了',
            icon: '💯',
            rarity: 'legendary',
            points: 200,
            condition: { type: 'test_count', value: 100 }
        },
        tests_200: {
            id: 'tests_200',
            category: '学習継続',
            name: '究極の継続力',
            description: '200回のテストを完了',
            icon: '👑',
            rarity: 'legendary',
            points: 500,
            condition: { type: 'test_count', value: 200 }
        },
        
        // ============================================
        // 📊 スコア達成カテゴリ（7個）
        // ============================================
        score_60: {
            id: 'score_60',
            category: 'スコア達成',
            name: '基礎力達成',
            description: '60%以上の正答率を達成',
            icon: '🎯',
            rarity: 'common',
            points: 15,
            condition: { type: 'accuracy', value: 60 }
        },
        score_70: {
            id: 'score_70',
            category: 'スコア達成',
            name: '中級レベル',
            description: '70%以上の正答率を達成',
            icon: '📈',
            rarity: 'uncommon',
            points: 25,
            condition: { type: 'accuracy', value: 70 }
        },
        score_80: {
            id: 'score_80',
            category: 'スコア達成',
            name: '上級レベル',
            description: '80%以上の正答率を達成',
            icon: '⭐',
            rarity: 'rare',
            points: 40,
            condition: { type: 'accuracy', value: 80 }
        },
        score_90: {
            id: 'score_90',
            category: 'スコア達成',
            name: 'エキスパート',
            description: '90%以上の正答率を達成',
            icon: '🌟',
            rarity: 'epic',
            points: 75,
            condition: { type: 'accuracy', value: 90 }
        },
        perfect_score: {
            id: 'perfect_score',
            category: 'スコア達成',
            name: 'パーフェクト',
            description: '100%の正答率を達成',
            icon: '💎',
            rarity: 'legendary',
            points: 150,
            condition: { type: 'accuracy', value: 100 }
        },
        perfect_score_3: {
            id: 'perfect_score_3',
            category: 'スコア達成',
            name: '完璧の連続',
            description: '3回連続でパーフェクト',
            icon: '💠',
            rarity: 'legendary',
            points: 300,
            condition: { type: 'perfect_streak', value: 3 }
        },
        toeic_900: {
            id: 'toeic_900',
            category: 'スコア達成',
            name: 'TOEIC 900+',
            description: '推定スコア900点以上を達成',
            icon: '🏅',
            rarity: 'legendary',
            points: 250,
            condition: { type: 'estimated_score', value: 900 }
        },
        
        // ============================================
        // 🔥 連続記録カテゴリ（7個）
        // ============================================
        streak_3: {
            id: 'streak_3',
            category: '連続記録',
            name: '3日連続',
            description: '3日連続で学習',
            icon: '🔥',
            rarity: 'common',
            points: 15,
            condition: { type: 'streak', value: 3 }
        },
        streak_7: {
            id: 'streak_7',
            category: '連続記録',
            name: '1週間連続',
            description: '7日連続で学習',
            icon: '🔥',
            rarity: 'uncommon',
            points: 30,
            condition: { type: 'streak', value: 7 }
        },
        streak_14: {
            id: 'streak_14',
            category: '連続記録',
            name: '2週間連続',
            description: '14日連続で学習',
            icon: '🔥',
            rarity: 'rare',
            points: 60,
            condition: { type: 'streak', value: 14 }
        },
        streak_30: {
            id: 'streak_30',
            category: '連続記録',
            name: '1ヶ月連続',
            description: '30日連続で学習',
            icon: '🔥',
            rarity: 'epic',
            points: 120,
            condition: { type: 'streak', value: 30 }
        },
        streak_60: {
            id: 'streak_60',
            category: '連続記録',
            name: '2ヶ月連続',
            description: '60日連続で学習',
            icon: '🔥',
            rarity: 'legendary',
            points: 250,
            condition: { type: 'streak', value: 60 }
        },
        streak_100: {
            id: 'streak_100',
            category: '連続記録',
            name: '100日連続',
            description: '100日連続で学習',
            icon: '🔥',
            rarity: 'legendary',
            points: 500,
            condition: { type: 'streak', value: 100 }
        },
        streak_365: {
            id: 'streak_365',
            category: '連続記録',
            name: '1年間連続',
            description: '365日連続で学習',
            icon: '👑',
            rarity: 'legendary',
            points: 1000,
            condition: { type: 'streak', value: 365 }
        },
        
        // ============================================
        // 📚 問題数カテゴリ（7個）
        // ============================================
        questions_100: {
            id: 'questions_100',
            category: '問題数',
            name: '百問突破',
            description: '100問を解答',
            icon: '📝',
            rarity: 'common',
            points: 10,
            condition: { type: 'total_questions', value: 100 }
        },
        questions_500: {
            id: 'questions_500',
            category: '問題数',
            name: '五百問突破',
            description: '500問を解答',
            icon: '📚',
            rarity: 'uncommon',
            points: 25,
            condition: { type: 'total_questions', value: 500 }
        },
        questions_1000: {
            id: 'questions_1000',
            category: '問題数',
            name: '千問突破',
            description: '1000問を解答',
            icon: '📖',
            rarity: 'rare',
            points: 50,
            condition: { type: 'total_questions', value: 1000 }
        },
        questions_2000: {
            id: 'questions_2000',
            category: '問題数',
            name: '二千問突破',
            description: '2000問を解答',
            icon: '📕',
            rarity: 'epic',
            points: 100,
            condition: { type: 'total_questions', value: 2000 }
        },
        questions_5000: {
            id: 'questions_5000',
            category: '問題数',
            name: '五千問突破',
            description: '5000問を解答',
            icon: '📗',
            rarity: 'legendary',
            points: 250,
            condition: { type: 'total_questions', value: 5000 }
        },
        questions_10000: {
            id: 'questions_10000',
            category: '問題数',
            name: '一万問突破',
            description: '10000問を解答',
            icon: '📘',
            rarity: 'legendary',
            points: 500,
            condition: { type: 'total_questions', value: 10000 }
        },
        all_questions: {
            id: 'all_questions',
            category: '問題数',
            name: '全問制覇',
            description: '全450問を最低1回解答',
            icon: '🎓',
            rarity: 'epic',
            points: 200,
            condition: { type: 'unique_questions', value: 450 }
        },
        
        // ============================================
        // 🎓 マスターカテゴリ（7個）
        // ============================================
        master_category_1: {
            id: 'master_category_1',
            category: 'マスター',
            name: 'カテゴリマスター',
            description: '1カテゴリで90%以上達成',
            icon: '🎯',
            rarity: 'uncommon',
            points: 30,
            condition: { type: 'category_master', value: 1 }
        },
        master_category_3: {
            id: 'master_category_3',
            category: 'マスター',
            name: '複数カテゴリマスター',
            description: '3カテゴリで90%以上達成',
            icon: '🎯',
            rarity: 'rare',
            points: 60,
            condition: { type: 'category_master', value: 3 }
        },
        master_all_categories: {
            id: 'master_all_categories',
            category: 'マスター',
            name: '全カテゴリマスター',
            description: '全8カテゴリで90%以上達成',
            icon: '🏆',
            rarity: 'legendary',
            points: 300,
            condition: { type: 'category_master', value: 8 }
        },
        speed_master: {
            id: 'speed_master',
            category: 'マスター',
            name: 'スピードマスター',
            description: '平均15秒以内で正答率80%以上',
            icon: '⚡',
            rarity: 'epic',
            points: 150,
            condition: { type: 'speed_master', avg_time: 15, accuracy: 80 }
        },
        no_mistakes: {
            id: 'no_mistakes',
            category: 'マスター',
            name: 'ノーミステイク',
            description: '30問ノーミステイク',
            icon: '💯',
            rarity: 'epic',
            points: 100,
            condition: { type: 'perfect_test', value: 1 }
        },
        comeback: {
            id: 'comeback',
            category: 'マスター',
            name: 'カムバック',
            description: '30日以上空けて再開',
            icon: '🔄',
            rarity: 'rare',
            points: 50,
            condition: { type: 'comeback', value: 30 }
        },
        early_bird: {
            id: 'early_bird',
            category: 'マスター',
            name: '早起き学習者',
            description: '朝5-7時に10回学習',
            icon: '🌅',
            rarity: 'uncommon',
            points: 40,
            condition: { type: 'time_slot', hours: [5, 6], count: 10 }
        },
        
        // ============================================
        // 💎 特別カテゴリ（7個）
        // ============================================
        first_perfect: {
            id: 'first_perfect',
            category: '特別',
            name: '初のパーフェクト',
            description: '初めて満点を達成',
            icon: '✨',
            rarity: 'epic',
            points: 100,
            condition: { type: 'first_perfect', value: 1 }
        },
        improvement_20: {
            id: 'improvement_20',
            category: '特別',
            name: '大きな成長',
            description: '1テストで前回比+20%改善',
            icon: '📈',
            rarity: 'rare',
            points: 50,
            condition: { type: 'improvement', value: 20 }
        },
        study_hours_10: {
            id: 'study_hours_10',
            category: '特別',
            name: '10時間学習',
            description: '累計10時間学習',
            icon: '⏰',
            rarity: 'uncommon',
            points: 30,
            condition: { type: 'study_hours', value: 10 }
        },
        study_hours_50: {
            id: 'study_hours_50',
            category: '特別',
            name: '50時間学習',
            description: '累計50時間学習',
            icon: '⏰',
            rarity: 'rare',
            points: 100,
            condition: { type: 'study_hours', value: 50 }
        },
        study_hours_100: {
            id: 'study_hours_100',
            category: '特別',
            name: '100時間学習',
            description: '累計100時間学習',
            icon: '⏰',
            rarity: 'epic',
            points: 200,
            condition: { type: 'study_hours', value: 100 }
        },
        new_year: {
            id: 'new_year',
            category: '特別',
            name: '新年の決意',
            description: '1月1日に学習',
            icon: '🎊',
            rarity: 'rare',
            points: 50,
            condition: { type: 'special_date', month: 1, day: 1 }
        },
        christmas: {
            id: 'christmas',
            category: '特別',
            name: 'クリスマス学習',
            description: '12月25日に学習',
            icon: '🎄',
            rarity: 'rare',
            points: 50,
            condition: { type: 'special_date', month: 12, day: 25 }
        }
    },

    /**
     * 初期化
     */
    init: function() {
        console.log('🏆 Achievement System 初期化中...');
        
        let data = this.loadData();
        if (!data) {
            data = this.createDefaultData();
            this.saveData(data);
        }
        
        const stats = this.getStatistics();
        console.log('✅ Achievement System 初期化完了');
        console.log(`  解除済み実績: ${stats.unlockedCount}/${stats.totalCount}`);
        console.log(`  進行中実績: ${stats.inProgressCount}`);
        console.log(`  完了率: ${stats.completionRate}%`);
        
        return data;
    },

    /**
     * デフォルトデータの作成
     */
    createDefaultData: function() {
        const data = {
            unlocked: {}, // 解除済み実績 { achievementId: unlockTimestamp }
            progress: {}, // 進捗 { achievementId: currentValue }
            notifications: [], // 未表示の通知
            lastCheck: Date.now()
        };
        
        // 全実績の進捗を0で初期化
        Object.keys(this.achievements).forEach(id => {
            data.progress[id] = 0;
        });
        
        return data;
    },

    /**
     * データの読み込み
     */
    loadData: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return null;
        
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error('❌ 実績データ読み込みエラー:', e);
            return null;
        }
    },

    /**
     * データの保存
     */
    saveData: function(data) {
        data.lastCheck = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    /**
     * 実績をチェック（テスト完了時などに呼び出し）
     */
    checkAchievements: function(eventData) {
        const data = this.loadData() || this.createDefaultData();
        const newlyUnlocked = [];
        
        Object.keys(this.achievements).forEach(id => {
            // 既に解除済みならスキップ
            if (data.unlocked[id]) return;
            
            const achievement = this.achievements[id];
            const currentProgress = this.calculateProgress(achievement, eventData);
            
            // 進捗を更新
            data.progress[id] = currentProgress;
            
            // 解除条件を満たしているかチェック
            if (this.isConditionMet(achievement, currentProgress, eventData)) {
                data.unlocked[id] = Date.now();
                newlyUnlocked.push(achievement);
                console.log(`🏆 実績解除: ${achievement.name}`);
            }
        });
        
        // 新しく解除された実績を通知リストに追加
        if (newlyUnlocked.length > 0) {
            data.notifications.push(...newlyUnlocked.map(a => a.id));
        }
        
        this.saveData(data);
        
        return newlyUnlocked;
    },

    /**
     * 進捗を計算
     */
    calculateProgress: function(achievement, eventData) {
        const condition = achievement.condition;
        
        switch (condition.type) {
            case 'test_count':
                return eventData.totalTests || 0;
            case 'accuracy':
                return eventData.lastAccuracy || 0;
            case 'perfect_streak':
                return eventData.perfectStreak || 0;
            case 'estimated_score':
                return eventData.estimatedScore || 0;
            case 'streak':
                return eventData.currentStreak || 0;
            case 'total_questions':
                return eventData.totalQuestions || 0;
            case 'unique_questions':
                return eventData.uniqueQuestions || 0;
            case 'category_master':
                return eventData.masteredCategories || 0;
            case 'study_hours':
                return eventData.totalStudyHours || 0;
            default:
                return 0;
        }
    },

    /**
     * 解除条件を満たしているかチェック
     */
    isConditionMet: function(achievement, currentProgress, eventData) {
        const condition = achievement.condition;
        
        // 基本的な数値比較
        if (condition.value !== undefined) {
            return currentProgress >= condition.value;
        }
        
        // 特殊条件
        if (condition.type === 'first_perfect') {
            return eventData.lastAccuracy === 100 && eventData.perfectCount === 1;
        }
        
        if (condition.type === 'improvement') {
            return eventData.improvement >= condition.value;
        }
        
        if (condition.type === 'speed_master') {
            return eventData.avgTime <= condition.avg_time && eventData.lastAccuracy >= condition.accuracy;
        }
        
        if (condition.type === 'perfect_test') {
            return eventData.lastAccuracy === 100;
        }
        
        if (condition.type === 'comeback') {
            return eventData.daysSinceLastTest >= condition.value;
        }
        
        if (condition.type === 'time_slot') {
            return eventData.timeSlotCount >= condition.count;
        }
        
        if (condition.type === 'special_date') {
            const now = new Date();
            return now.getMonth() + 1 === condition.month && now.getDate() === condition.day;
        }
        
        return false;
    },

    /**
     * 統計情報を取得
     */
    getStatistics: function() {
        const data = this.loadData() || this.createDefaultData();
        const totalCount = Object.keys(this.achievements).length;
        const unlockedCount = Object.keys(data.unlocked).length;
        const inProgressCount = Object.keys(data.progress).filter(id => 
            data.progress[id] > 0 && !data.unlocked[id]
        ).length;
        const completionRate = Math.round((unlockedCount / totalCount) * 100);
        
        return {
            totalCount,
            unlockedCount,
            inProgressCount,
            completionRate
        };
    },

    /**
     * カテゴリ別の実績リストを取得
     */
    getAchievementsByCategory: function(categoryName) {
        return Object.values(this.achievements).filter(a => a.category === categoryName);
    },

    /**
     * 全カテゴリ名を取得
     */
    getAllCategories: function() {
        const categories = new Set();
        Object.values(this.achievements).forEach(a => categories.add(a.category));
        return Array.from(categories);
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.AchievementSystem = AchievementSystem;
    
    // DOMContentLoaded後に初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AchievementSystem.init();
        });
    } else {
        AchievementSystem.init();
    }
}
