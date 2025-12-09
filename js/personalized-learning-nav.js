/**
 * 🎯 パーソナライズド学習ナビゲーションシステム
 * 
 * ツカサさん専用の学習分析・サポートシステム
 * "あなただけ"を見て、"あなただけ"のためにサポート
 */

const PersonalizedLearningNav = {
  
  // ==================== 初期化 ====================
  
  init() {
    console.log('🎯 パーソナライズド学習ナビゲーション初期化中...');
    
    // 初回起動時のプロフィール設定
    this.initializeUserProfile();
    
    // 学習データの分析
    this.analyzeAllData();
    
    console.log('✅ パーソナライズド学習ナビゲーション初期化完了');
  },
  
  // ==================== ユーザープロフィール管理 ====================
  
  initializeUserProfile() {
    let profile = this.getUserProfile();
    
    if (!profile.startDate) {
      // 初回起動
      profile.startDate = new Date().toISOString();
      this.saveUserProfile(profile);
      console.log(`🎉 ${profile.name}のプロフィール作成完了`);
    }
  },
  
  getUserProfile() {
    // UserProfileシステムからニックネームを取得
    let userProfile = null;
    if (typeof UserProfile !== 'undefined' && typeof UserProfile.getProfile === 'function') {
      userProfile = UserProfile.getProfile();
    } else {
      // フォールバック: 直接LocalStorageから取得
      const stored = localStorage.getItem('userProfile');
      if (stored) {
        userProfile = JSON.parse(stored);
      }
    }
    
    // 学習分析用プロフィールを取得または作成
    const stored = localStorage.getItem('personalizedProfile');
    let profile = stored ? JSON.parse(stored) : {
      startDate: null,
      targetScore: 800,
      bestTimeSlot: null,
      averageSessionLength: null,
      learningStyle: "分析中",
      weakestCategory: null,
      strongestCategory: null
    };
    
    // ユーザープロフィールからニックネームと目標スコアを取得
    if (userProfile) {
      // ニックネームに「さん」を付けて統一
      const nickname = userProfile.nickname || "学習者";
      profile.name = nickname.endsWith('さん') ? nickname : `${nickname}さん`;
      if (userProfile.targetScore) {
        profile.targetScore = userProfile.targetScore;
      }
    } else {
      profile.name = "学習者さん";
    }
    
    return profile;
  },
  
  saveUserProfile(profile) {
    localStorage.setItem('personalizedProfile', JSON.stringify(profile));
  },
  
  // ==================== 学習データ分析 ====================
  
  analyzeAllData() {
    console.log('📊 学習データ分析開始...');
    
    const analysis = {
      timeSlotAnalysis: this.analyzeTimeSlots(),
      categoryAnalysis: this.analyzeCategories(),
      sessionAnalysis: this.analyzeSessions(),
      performanceTrend: this.analyzePerformanceTrend(),
      currentStatus: this.getCurrentStatus()
    };
    
    // プロフィールを更新
    this.updateProfileFromAnalysis(analysis);
    
    return analysis;
  },
  
  // ==================== 時間帯別分析 ====================
  
  analyzeTimeSlots() {
    const history = this.getTestHistory();
    if (history.length === 0) {
      return {
        morning: { accuracy: 0, count: 0, energy: "unknown" },
        afternoon: { accuracy: 0, count: 0, energy: "unknown" },
        evening: { accuracy: 0, count: 0, energy: "unknown" },
        bestTime: "データ不足"
      };
    }
    
    const slots = { morning: [], afternoon: [], evening: [] };
    
    history.forEach(test => {
      if (!test.timestamp) return;
      
      const hour = new Date(test.timestamp).getHours();
      const accuracy = (test.score / test.totalQuestions) * 100;
      
      if (hour >= 5 && hour < 12) {
        slots.morning.push(accuracy);
      } else if (hour >= 12 && hour < 18) {
        slots.afternoon.push(accuracy);
      } else {
        slots.evening.push(accuracy);
      }
    });
    
    const result = {};
    ['morning', 'afternoon', 'evening'].forEach(slot => {
      const data = slots[slot];
      if (data.length > 0) {
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        result[slot] = {
          accuracy: Math.round(avg),
          count: data.length,
          energy: avg >= 75 ? "high" : avg >= 60 ? "medium" : "low"
        };
      } else {
        result[slot] = { accuracy: 0, count: 0, energy: "unknown" };
      }
    });
    
    // 最適時間帯を判定
    let bestTime = "morning";
    let bestAccuracy = result.morning.accuracy;
    
    if (result.afternoon.accuracy > bestAccuracy && result.afternoon.count > 0) {
      bestTime = "afternoon";
      bestAccuracy = result.afternoon.accuracy;
    }
    if (result.evening.accuracy > bestAccuracy && result.evening.count > 0) {
      bestTime = "evening";
    }
    
    result.bestTime = bestTime;
    
    return result;
  },
  
  // ==================== カテゴリ別分析 ====================
  
  analyzeCategories() {
    const categoryStats = {};
    
    // WeaknessAnalysisのデータを取得
    if (typeof WeaknessAnalysis !== 'undefined' && typeof WeaknessAnalysis.getWeakCategories === 'function') {
      const weakCategories = WeaknessAnalysis.getWeakCategories();
      const strongCategories = WeaknessAnalysis.getStrongCategories ? WeaknessAnalysis.getStrongCategories() : [];
      
      return {
        weakest: weakCategories.length > 0 ? weakCategories[0].category : "データ不足",
        strongest: strongCategories.length > 0 ? strongCategories[0].category : "データ不足",
        needsAttention: weakCategories.slice(0, 3).map(c => c.category),
        mastered: strongCategories.slice(0, 3).map(c => c.category)
      };
    }
    
    return {
      weakest: "データ不足",
      strongest: "データ不足",
      needsAttention: [],
      mastered: []
    };
  },
  
  // ==================== セッション分析 ====================
  
  analyzeSessions() {
    const history = this.getTestHistory();
    if (history.length === 0) {
      return {
        averageLength: 0,
        totalSessions: 0,
        averageQuestionsPerSession: 0,
        preferredPace: "データ不足"
      };
    }
    
    const lengths = [];
    const questionCounts = [];
    
    history.forEach(test => {
      if (test.timeInSeconds) {
        lengths.push(test.timeInSeconds / 60); // 分に変換
      }
      if (test.totalQuestions) {
        questionCounts.push(test.totalQuestions);
      }
    });
    
    const avgLength = lengths.length > 0 
      ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
      : 0;
      
    const avgQuestions = questionCounts.length > 0
      ? Math.round(questionCounts.reduce((a, b) => a + b, 0) / questionCounts.length)
      : 0;
    
    return {
      averageLength: avgLength,
      totalSessions: history.length,
      averageQuestionsPerSession: avgQuestions,
      preferredPace: `${avgQuestions}問/セッション`
    };
  },
  
  // ==================== パフォーマンストレンド分析 ====================
  
  analyzePerformanceTrend() {
    const history = this.getTestHistory();
    if (history.length < 2) {
      return {
        trend: "データ不足",
        improvement: 0,
        recentAccuracy: 0,
        pastAccuracy: 0
      };
    }
    
    // 最近5回と過去5回を比較
    const recent = history.slice(-5);
    const past = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, test) => 
      sum + (test.score / test.totalQuestions * 100), 0) / recent.length;
      
    const pastAvg = past.length > 0
      ? past.reduce((sum, test) => sum + (test.score / test.totalQuestions * 100), 0) / past.length
      : recentAvg;
    
    const improvement = recentAvg - pastAvg;
    
    return {
      trend: improvement > 5 ? "上昇" : improvement < -5 ? "下降" : "安定",
      improvement: Math.round(improvement),
      recentAccuracy: Math.round(recentAvg),
      pastAccuracy: Math.round(pastAvg)
    };
  },
  
  // ==================== 現在の状態分析 ====================
  
  getCurrentStatus() {
    const profile = this.getUserProfile();
    const streak = this.getStreak();
    const todayProgress = this.getTodayProgress();
    
    return {
      currentStreak: streak.current,
      todayCompleted: todayProgress.completed,
      todayAccuracy: todayProgress.accuracy,
      estimatedScore: this.estimateCurrentScore(),
      targetScore: profile.targetScore || 800,
      daysToGoal: this.estimateDaysToGoal()
    };
  },
  
  // ==================== スコア予測 ====================
  
  estimateCurrentScore() {
    const history = this.getTestHistory();
    if (history.length === 0) return 500;
    
    // 最近5回の平均から予測
    const recent = history.slice(-5);
    const avgAccuracy = recent.reduce((sum, test) => 
      sum + (test.score / test.totalQuestions), 0) / recent.length;
    
    // PART5の正答率からTOEICスコアを予測
    // 簡易的な換算式
    let estimatedScore = 400 + (avgAccuracy * 400);
    
    return Math.round(estimatedScore);
  },
  
  estimateDaysToGoal() {
    const profile = this.getUserProfile();
    const current = this.estimateCurrentScore();
    const target = profile.targetScore || 800;
    const trend = this.analyzePerformanceTrend();
    
    if (current >= target) return 0;
    if (trend.improvement <= 0) return 999; // 改善なし
    
    const remainingPoints = target - current;
    const weeklyImprovement = trend.improvement * 2; // 週2回学習と仮定
    
    if (weeklyImprovement <= 0) return 999;
    
    const weeksNeeded = remainingPoints / weeklyImprovement;
    return Math.ceil(weeksNeeded * 7); // 日数に変換
  },
  
  // ==================== プロフィール更新 ====================
  
  updateProfileFromAnalysis(analysis) {
    const profile = this.getUserProfile();
    
    // 最適時間帯
    const timeSlots = {
      morning: "午前（5-12時）",
      afternoon: "午後（12-18時）", 
      evening: "夜（18時以降）"
    };
    profile.bestTimeSlot = timeSlots[analysis.timeSlotAnalysis.bestTime] || "データ不足";
    
    // 平均学習時間
    profile.averageSessionLength = `${analysis.sessionAnalysis.averageLength}分`;
    
    // 苦手・得意カテゴリ
    profile.weakestCategory = analysis.categoryAnalysis.weakest;
    profile.strongestCategory = analysis.categoryAnalysis.strongest;
    
    // 改善率
    if (analysis.performanceTrend.improvement !== 0) {
      profile.improvementRate = `${analysis.performanceTrend.improvement > 0 ? '+' : ''}${analysis.performanceTrend.improvement}%`;
    }
    
    this.saveUserProfile(profile);
  },
  
  // ==================== ヘルパー関数 ====================
  
  getTestHistory() {
    const progress = JSON.parse(localStorage.getItem('progress') || '{}');
    const history = [];
    
    // 通常テストの履歴
    if (progress.tests) {
      Object.keys(progress.tests).forEach(testNum => {
        const test = progress.tests[testNum];
        if (test) {
          history.push({
            type: 'test',
            testNumber: testNum,
            score: test.score || 0,
            totalQuestions: 30,
            timestamp: test.timestamp || Date.now(),
            timeInSeconds: test.timeInSeconds
          });
        }
      });
    }
    
    // 復習の履歴（ReviewSystemから取得）
    const reviewHistory = JSON.parse(localStorage.getItem('reviewHistory') || '[]');
    reviewHistory.forEach(review => {
      history.push({
        type: 'review',
        score: review.score || 0,
        totalQuestions: review.totalQuestions || 0,
        timestamp: review.timestamp || Date.now(),
        timeInSeconds: review.timeInSeconds
      });
    });
    
    // タイムスタンプでソート
    history.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    
    return history;
  },
  
  getStreak() {
    if (typeof StreakSystem !== 'undefined' && typeof StreakSystem.getStreak === 'function') {
      return StreakSystem.getStreak();
    }
    return { current: 0, longest: 0 };
  },
  
  getTodayProgress() {
    const today = new Date().toDateString();
    const history = this.getTestHistory();
    
    const todayTests = history.filter(test => {
      const testDate = new Date(test.timestamp).toDateString();
      return testDate === today;
    });
    
    if (todayTests.length === 0) {
      return { completed: 0, accuracy: 0 };
    }
    
    const totalCorrect = todayTests.reduce((sum, test) => sum + test.score, 0);
    const totalQuestions = todayTests.reduce((sum, test) => sum + test.totalQuestions, 0);
    
    return {
      completed: todayTests.length,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    };
  }
};

// グローバルに公開
window.PersonalizedLearningNav = PersonalizedLearningNav;

console.log('✅ PersonalizedLearningNav module loaded');
