/**
 * 成長ダッシュボードシステム
 * ユーザーの学習進捗と成長を可視化
 */

class GrowthDashboard {
  constructor() {
    console.log('📈 成長ダッシュボードシステム初期化中...');
    this.init();
  }
  
  init() {
    const stats = this.calculateGrowthStats();
    console.log(`  総マスター: ${stats.totalMastered}問`);
    console.log(`  目標スコア: ${stats.targetScore}点`);
    console.log(`  現在の予測: ${stats.currentScore}点`);
    console.log(`  進捗率: ${stats.progressPercentage}%`);
  }
  
  /**
   * 成長統計を計算
   */
  calculateGrowthStats() {
    // ユーザープロフィール
    const userProfile = this.getUserProfile();
    const targetScore = userProfile.targetScore || 800;
    const currentScore = this.getCurrentPredictedScore();
    const progressPercentage = Math.min(100, Math.round((currentScore / targetScore) * 100));
    const remainingPoints = Math.max(0, targetScore - currentScore);
    
    // マスター進捗
    const masteryStats = this.calculateMasteryProgress();
    
    // カテゴリ別習熟度
    const categoryProficiency = this.calculateCategoryProficiency();
    
    // 学習推奨
    const recommendations = this.generateRecommendations(categoryProficiency, remainingPoints);
    
    return {
      targetScore: targetScore,
      currentScore: currentScore,
      progressPercentage: progressPercentage,
      remainingPoints: remainingPoints,
      totalMastered: masteryStats.totalMastered,
      masteryByLevel: masteryStats, // 全体のmasteryStatsオブジェクトを返す
      categoryProficiency: categoryProficiency,
      recommendations: recommendations
    };
  }
  
  /**
   * ユーザープロフィールを取得
   */
  getUserProfile() {
    if (typeof UserProfile !== 'undefined' && UserProfile.getData) {
      return UserProfile.getData();
    }
    return {
      targetScore: 800
    };
  }
  
  /**
   * 現在の予測スコアを取得
   */
  getCurrentPredictedScore() {
    if (typeof LearningInsights === 'undefined') return 500;
    
    const insights = LearningInsights.generateInsights();
    return insights.predictedScore || 500;
  }
  
  /**
   * マスター進捗を計算
   */
  calculateMasteryProgress() {
    const byLevel = {
      perfect: 0,    // 完全マスター（スペースドリピティションLv5）
      expert: 0,     // エキスパート（Lv4）
      advanced: 0,   // 上級（Lv3）
      intermediate: 0, // 中級（Lv2）
      beginner: 0,   // 初級（Lv1）
      new: 0         // 新規（Lv0）
    };
    
    if (typeof SpacedRepetition !== 'undefined') {
      const stats = SpacedRepetition.getStatistics();
      
      if (stats.levelDistribution) {
        byLevel.perfect = stats.levelDistribution[5] || 0;
        byLevel.expert = stats.levelDistribution[4] || 0;
        byLevel.advanced = stats.levelDistribution[3] || 0;
        byLevel.intermediate = stats.levelDistribution[2] || 0;
        byLevel.beginner = stats.levelDistribution[1] || 0;
        byLevel.new = stats.levelDistribution[0] || 0;
      }
    }
    
    const totalMastered = byLevel.perfect + byLevel.expert + byLevel.advanced;
    const totalQuestions = 450;
    const masteryPercentage = Math.round((totalMastered / totalQuestions) * 100);
    
    return {
      totalMastered: totalMastered,
      totalQuestions: totalQuestions,
      masteryPercentage: masteryPercentage,
      byLevel: byLevel
    };
  }
  
  /**
   * カテゴリ別習熟度を計算
   */
  calculateCategoryProficiency() {
    // ✅ WeaknessAnalysisのカテゴリ名に合わせる（「〜問題」形式）
    const categories = [
      { key: '品詞問題', label: '品詞', icon: '📝' },
      { key: '動詞問題', label: '動詞', icon: '⚡' },
      { key: '前置詞問題', label: '前置詞', icon: '🎯' },
      { key: '接続詞問題', label: '接続詞', icon: '🔗' },
      { key: '代名詞問題', label: '代名詞', icon: '👤' },
      { key: '関係詞問題', label: '関係詞', icon: '🔗' },
      { key: '数量詞問題', label: '数量詞', icon: '🔢' },
      { key: '語彙問題', label: '語彙', icon: '📖' }
    ];
    
    const proficiency = categories.map(category => {
      const data = this.getCategoryData(category.key);
      return {
        ...category,
        accuracy: data.accuracy,
        totalQuestions: data.totalQuestions,
        status: this.getStatusLabel(data.accuracy)
      };
    });
    
    return proficiency.sort((a, b) => a.accuracy - b.accuracy);
  }
  
  /**
   * カテゴリのデータを取得
   */
  getCategoryData(category) {
    if (typeof WeaknessAnalysis === 'undefined') {
      return { accuracy: 0, totalQuestions: 0 };
    }
    
    try {
      const report = WeaknessAnalysis.generateReport();
      
      // report.byCategoryが存在しない、またはundefinedの場合の処理
      if (!report || !report.byCategory) {
        console.warn(`⚠️ WeaknessAnalysis report.byCategory が存在しません`);
        return { accuracy: 0, totalQuestions: 0 };
      }
      
      const categoryData = report.byCategory[category];
      
      if (categoryData) {
        return {
          accuracy: categoryData.accuracy || 0,
          totalQuestions: categoryData.totalQuestions || 0
        };
      }
      
      return { accuracy: 0, totalQuestions: 0 };
    } catch (error) {
      console.error(`❌ getCategoryData エラー (カテゴリ: ${category}):`, error);
      return { accuracy: 0, totalQuestions: 0 };
    }
  }
  
  /**
   * 習熟度のステータスラベルを取得
   */
  getStatusLabel(accuracy) {
    if (accuracy >= 85) return { text: '得意', color: '#22c55e', emoji: '✨' };
    if (accuracy >= 70) return { text: '良好', color: '#3b82f6', emoji: '👍' };
    if (accuracy >= 50) return { text: '要改善', color: '#f59e0b', emoji: '📚' };
    return { text: '苦手', color: '#ef4444', emoji: '⚠️' };
  }
  
  /**
   * 学習推奨を生成
   */
  generateRecommendations(categoryProficiency, remainingPoints) {
    const recommendations = [];
    
    // 最も苦手なカテゴリを特定
    const weakestCategory = categoryProficiency.find(c => c.totalQuestions >= 3);
    
    if (weakestCategory && weakestCategory.accuracy < 70) {
      const potentialGain = this.estimateScoreGain(weakestCategory);
      
      recommendations.push({
        type: 'category-focus',
        icon: weakestCategory.icon,
        title: `${weakestCategory.label}を集中的に学習`,
        description: `現在の正答率: ${weakestCategory.accuracy}% → 目標: 85%`,
        impact: `予測スコア +${potentialGain}点`,
        action: '苦手問題集中特訓を開始',
        actionFunction: 'startWeaknessTrainingMode',
        priority: 'high'
      });
    }
    
    // 復習が必要な問題
    if (typeof SpacedRepetition !== 'undefined') {
      const stats = SpacedRepetition.getStatistics();
      
      if (stats.overdue > 0) {
        recommendations.push({
          type: 'review-overdue',
          icon: '🔥',
          title: `期限切れ問題を優先復習`,
          description: `${stats.overdue}問の復習期限が過ぎています`,
          impact: '記憶定着率を回復',
          action: '今すぐ復習',
          actionFunction: 'startUnifiedReview',
          actionParam: 'urgent',
          priority: 'critical'
        });
      } else if (stats.dueToday > 0) {
        recommendations.push({
          type: 'review-today',
          icon: '📅',
          title: `今日の復習を実行`,
          description: `${stats.dueToday}問の復習タイミングです`,
          impact: '記憶の長期定着',
          action: '復習を開始',
          actionFunction: 'startUnifiedReview',
          actionParam: 'important',
          priority: 'high'
        });
      }
    }
    
    // 連続学習の推奨
    if (typeof StreakSystem !== 'undefined') {
      const streakStats = StreakSystem.getStreakStats();
      
      if (streakStats.currentStreak === 0) {
        recommendations.push({
          type: 'streak-start',
          icon: '🔥',
          title: '学習習慣を再スタート',
          description: '連続学習でスコアが大幅アップ',
          impact: '学習効率 +200%',
          action: 'テストを開始',
          actionFunction: 'showHome',
          priority: 'medium'
        });
      }
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
  
  /**
   * スコアアップの見積もり
   */
  estimateScoreGain(category) {
    const currentAccuracy = category.accuracy;
    const targetAccuracy = 85;
    const improvement = targetAccuracy - currentAccuracy;
    
    // 1%の改善 ≈ 1.5点のスコアアップと仮定
    return Math.round(improvement * 1.5);
  }
  
  /**
   * 次にすべきアクションを取得
   */
  getNextAction() {
    const recommendations = this.generateRecommendations(
      this.calculateCategoryProficiency(),
      0
    );
    
    return recommendations.length > 0 ? recommendations[0] : null;
  }
  
  /**
   * 🧠 適応型分散復習の統計を更新 (Phase 2 NEW!)
   */
  updateAdaptiveSRStats() {
    // AdaptiveSpacedRepetitionが読み込まれているか確認
    if (typeof window.AdaptiveSpacedRepetition === 'undefined') {
      console.log('⏳ 適応型分散復習システムはまだ読み込まれていません');
      return;
    }
    
    try {
      const stats = window.AdaptiveSpacedRepetition.getStatistics();
      
      // 記憶力レベル
      const memoryLevelEl = document.getElementById('memoryLevel');
      if (memoryLevelEl) {
        memoryLevelEl.textContent = stats.memoryLevel;
      }
      
      // 記憶力係数
      const memoryCoefficientEl = document.getElementById('memoryCoefficient');
      if (memoryCoefficientEl) {
        memoryCoefficientEl.textContent = stats.memoryCoefficient.toFixed(2);
      }
      
      // 復習成功率
      const successRateEl = document.getElementById('adaptiveSRSuccessRate');
      if (successRateEl) {
        successRateEl.textContent = `${stats.overallSuccessRate}%`;
      }
      
      // 今日の復習
      const todayReviewsEl = document.getElementById('adaptiveSRTodayReviews');
      if (todayReviewsEl) {
        todayReviewsEl.textContent = `${stats.todayReviews}問`;
      }
      
      // 復習間隔
      for (let i = 0; i <= 5; i++) {
        const intervalEl = document.getElementById(`interval${i}`);
        if (intervalEl && stats.baseIntervals[i]) {
          intervalEl.textContent = `${stats.baseIntervals[i]}日`;
        }
      }
      
      console.log('✅ 適応型分散復習統計を更新しました');
    } catch (error) {
      console.error('❌ 適応型分散復習統計の更新エラー:', error);
    }
  }
}

// グローバルインスタンスの作成
const GrowthDashboardInstance = new GrowthDashboard();

// グローバルに公開
if (typeof window !== 'undefined') {
  window.GrowthDashboard = GrowthDashboardInstance;
}
