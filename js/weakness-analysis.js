// TOEIC PART5 学習サポート - 弱点分析システム
// カテゴリ別の正答率を分析し、弱点を特定

const WeaknessAnalysis = {
  STORAGE_KEY: 'toeic_weakness_analysis',
  
  // カテゴリ定義（8カテゴリ）
  categories: {
    '品詞問題': { icon: '📝', color: '#3b82f6', description: '動詞・名詞・形容詞・副詞の識別' },
    '動詞問題': { icon: '⚡', color: '#10b981', description: '時制・完了形・受動態・助動詞' },
    '前置詞問題': { icon: '🎯', color: '#f59e0b', description: '時間・場所・慣用表現' },
    '接続詞問題': { icon: '🔗', color: '#8b5cf6', description: '条件・理由・対比' },
    '代名詞問題': { icon: '👤', color: '#ec4899', description: '人称代名詞・所有格・再帰代名詞' },
    '関係詞問題': { icon: '🔗', color: '#f43f5e', description: '関係代名詞・関係副詞' },
    '数量詞問題': { icon: '🔢', color: '#14b8a6', description: 'much/many/few/little' },
    '語彙問題': { icon: '📖', color: '#6366f1', description: '単語の意味・類義語・慣用表現' }
  },
  
  // 詳細な問題タイプを8つの大カテゴリにマッピング
  mapToCategory: function(questionType) {
    if (!questionType) return '語彙問題'; // デフォルト
    
    const type = questionType.toLowerCase();
    
    // 品詞問題
    if (type.includes('品詞')) {
      return '品詞問題';
    }
    
    // 動詞問題（時制・完了形・受動態・助動詞）
    if (type.includes('時制') || 
        type.includes('完了') || 
        type.includes('受動態') || 
        type.includes('助動詞') ||
        type.includes('動詞') && !type.includes('品詞')) {
      return '動詞問題';
    }
    
    // 前置詞問題
    if (type.includes('前置詞')) {
      return '前置詞問題';
    }
    
    // 接続詞問題
    if (type.includes('接続詞')) {
      return '接続詞問題';
    }
    
    // 代名詞問題
    if (type.includes('代名詞')) {
      return '代名詞問題';
    }
    
    // 関係詞問題
    if (type.includes('関係詞') || type.includes('関係代名詞') || type.includes('関係副詞')) {
      return '関係詞問題';
    }
    
    // 数量詞問題
    if (type.includes('数量') || type.includes('much') || type.includes('many') || 
        type.includes('few') || type.includes('little')) {
      return '数量詞問題';
    }
    
    // 語彙問題（その他）
    return '語彙問題';
  },
  
  // 分析データを取得
  getAnalysisData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        categories: {},
        totalQuestions: 0,
        totalCorrect: 0,
        lastUpdate: null,
        history: []
      };
    }
    return JSON.parse(data);
  },
  
  // データを保存
  saveAnalysisData: function(data) {
    data.lastUpdate = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 問題の解答を記録
  recordAnswer: function(questionCategory, isCorrect) {
    const data = this.getAnalysisData();
    
    // 詳細な問題タイプを8つの大カテゴリにマッピング
    const mappedCategory = this.mapToCategory(questionCategory);
    
    // カテゴリが存在しない場合は初期化
    if (!data.categories[mappedCategory]) {
      data.categories[mappedCategory] = {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        trend: [] // 最近10回の結果
      };
    }
    
    const category = data.categories[mappedCategory];
    
    // カウント更新
    category.total++;
    if (isCorrect) {
      category.correct++;
      data.totalCorrect++;
    } else {
      category.incorrect++;
    }
    
    // 正答率計算
    category.accuracy = Math.round((category.correct / category.total) * 100);
    
    // トレンド記録（最近10回）
    category.trend.push(isCorrect ? 1 : 0);
    if (category.trend.length > 10) {
      category.trend.shift();
    }
    
    // 全体統計更新
    data.totalQuestions++;
    
    this.saveAnalysisData(data);
    
    console.log(`📊 弱点分析記録: ${mappedCategory} - ${isCorrect ? '正解' : '不正解'} (正答率: ${category.accuracy}%)`);
    
    return category;
  },
  
  // カテゴリ別統計を取得
  getCategoryStats: function() {
    const data = this.getAnalysisData();
    const stats = [];
    
    Object.keys(this.categories).forEach(categoryName => {
      const categoryData = data.categories[categoryName] || {
        total: 0,
        correct: 0,
        incorrect: 0,
        accuracy: 0,
        trend: []
      };
      
      const categoryInfo = this.categories[categoryName];
      
      stats.push({
        name: categoryName,
        icon: categoryInfo.icon,
        color: categoryInfo.color,
        description: categoryInfo.description,
        total: categoryData.total,
        correct: categoryData.correct,
        incorrect: categoryData.incorrect,
        accuracy: categoryData.accuracy,
        trend: categoryData.trend,
        // 最近の調子（最近5回の正答率）
        recentAccuracy: this.calculateRecentAccuracy(categoryData.trend)
      });
    });
    
    // 正答率の低い順（弱点順）にソート
    stats.sort((a, b) => {
      if (a.total === 0) return 1;
      if (b.total === 0) return -1;
      return a.accuracy - b.accuracy;
    });
    
    return stats;
  },
  
  // 最近の調子を計算（最近5回の正答率）
  calculateRecentAccuracy: function(trend) {
    if (trend.length === 0) return 0;
    const recent = trend.slice(-5);
    const correct = recent.filter(r => r === 1).length;
    return Math.round((correct / recent.length) * 100);
  },
  
  // 弱点カテゴリを特定（正答率70%未満）
  getWeakCategories: function() {
    const stats = this.getCategoryStats();
    return stats.filter(stat => stat.total > 0 && stat.accuracy < 70);
  },
  
  // 得意カテゴリを特定（正答率85%以上）
  getStrongCategories: function() {
    const stats = this.getCategoryStats();
    return stats.filter(stat => stat.total > 0 && stat.accuracy >= 85);
  },
  
  // 改善が必要なカテゴリを特定（正答率70-84%）
  getNeedsImprovementCategories: function() {
    const stats = this.getCategoryStats();
    return stats.filter(stat => stat.total > 0 && stat.accuracy >= 70 && stat.accuracy < 85);
  },
  
  // トレンド分析（上昇傾向・下降傾向）
  analyzeTrend: function(trend) {
    if (trend.length < 3) return 'insufficient'; // データ不足
    
    const recent3 = trend.slice(-3);
    const earlier3 = trend.slice(-6, -3);
    
    if (earlier3.length === 0) return 'insufficient';
    
    const recentAvg = recent3.reduce((sum, val) => sum + val, 0) / recent3.length;
    const earlierAvg = earlier3.reduce((sum, val) => sum + val, 0) / earlier3.length;
    
    const diff = recentAvg - earlierAvg;
    
    if (diff > 0.2) return 'improving'; // 改善傾向
    if (diff < -0.2) return 'declining'; // 悪化傾向
    return 'stable'; // 安定
  },
  
  // 全体レポートを生成
  generateReport: function() {
    const data = this.getAnalysisData();
    const stats = this.getCategoryStats();
    const weak = this.getWeakCategories();
    const strong = this.getStrongCategories();
    const needsImprovement = this.getNeedsImprovementCategories();
    
    // 全体正答率
    const overallAccuracy = data.totalQuestions > 0 
      ? Math.round((data.totalCorrect / data.totalQuestions) * 100) 
      : 0;
    
    // 最弱カテゴリ
    const weakestCategory = stats.find(s => s.total > 0) || null;
    
    // 最強カテゴリ
    const strongestCategory = [...stats].reverse().find(s => s.total > 0) || null;
    
    // byCategoryオブジェクトを生成（GrowthDashboard用）
    const byCategory = {};
    stats.forEach(stat => {
      byCategory[stat.name] = {
        accuracy: stat.accuracy,
        totalQuestions: stat.total,
        correct: stat.correct
      };
    });
    
    return {
      overall: {
        totalQuestions: data.totalQuestions,
        totalCorrect: data.totalCorrect,
        accuracy: overallAccuracy
      },
      categories: stats,
      byCategory: byCategory, // ✅ 追加: GrowthDashboard互換性のため
      weakCategories: weak,
      strongCategories: strong,
      needsImprovementCategories: needsImprovement,
      weakestCategory: weakestCategory,
      strongestCategory: strongestCategory,
      recommendations: this.generateRecommendations(weak, needsImprovement)
    };
  },
  
  // 学習推奨を生成
  generateRecommendations: function(weak, needsImprovement) {
    const recommendations = [];
    
    if (weak.length > 0) {
      recommendations.push({
        priority: 'high',
        icon: '🔥',
        title: '弱点を集中的に克服しましょう',
        categories: weak.map(w => w.name),
        message: `${weak.map(w => w.name).join('、')}の正答率が70%未満です。復習モードで重点的に学習することをお勧めします。`
      });
    }
    
    if (needsImprovement.length > 0) {
      recommendations.push({
        priority: 'medium',
        icon: '📈',
        title: 'さらなる向上を目指しましょう',
        categories: needsImprovement.map(n => n.name),
        message: `${needsImprovement.map(n => n.name).join('、')}はあと一歩です。85%以上を目指して継続学習しましょう。`
      });
    }
    
    if (weak.length === 0 && needsImprovement.length === 0) {
      recommendations.push({
        priority: 'low',
        icon: '🎉',
        title: '素晴らしい！全カテゴリで高得点です',
        categories: [],
        message: 'すべてのカテゴリで85%以上の正答率を達成しています。この調子でさらなる高みを目指しましょう！'
      });
    }
    
    return recommendations;
  },
  
  // チャートデータを生成（Chart.js用）
  getChartData: function() {
    const stats = this.getCategoryStats();
    
    return {
      labels: stats.map(s => s.name),
      datasets: [{
        label: '正答率 (%)',
        data: stats.map(s => s.accuracy),
        backgroundColor: stats.map(s => s.color),
        borderColor: stats.map(s => s.color),
        borderWidth: 2
      }]
    };
  },
  
  // レーダーチャートデータを生成
  getRadarChartData: function() {
    const stats = this.getCategoryStats();
    
    return {
      labels: stats.map(s => s.name),
      datasets: [{
        label: '正答率',
        data: stats.map(s => s.accuracy),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      }]
    };
  },
  
  // データをリセット
  resetData: function() {
    if (confirm('弱点分析データをすべてリセットしますか？')) {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('📊 弱点分析データをリセットしました');
      return true;
    }
    return false;
  },
  
  // 初期化
  init: function() {
    console.log('📊 弱点分析システム初期化中...');
    const report = this.generateReport();
    console.log(`  総問題数: ${report.overall.totalQuestions}問`);
    console.log(`  全体正答率: ${report.overall.accuracy}%`);
    console.log(`  弱点カテゴリ: ${report.weakCategories.length}個`);
    console.log(`  得意カテゴリ: ${report.strongCategories.length}個`);
  }
};

// グローバルにエクスポート
window.WeaknessAnalysis = WeaknessAnalysis;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    WeaknessAnalysis.init();
  });
} else {
  WeaknessAnalysis.init();
}
