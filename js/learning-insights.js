// TOEIC PART5 学習サポート - 学習インサイトシステム
// スコア推移、成長トラッキング、パターン分析、レベル判定

const LearningInsights = {
  STORAGE_KEY: 'toeic_learning_insights',
  
  // レベル定義
  LEVELS: {
    beginner: { 
      name: '初級', 
      minScore: 0, 
      maxScore: 399, 
      color: '#94a3b8',
      icon: '🌱',
      avgAccuracy: 50,
      description: '基礎を固める段階'
    },
    intermediate: { 
      name: '中級', 
      minScore: 400, 
      maxScore: 599, 
      color: '#3b82f6',
      icon: '📘',
      avgAccuracy: 65,
      description: '実力を伸ばす段階'
    },
    upperIntermediate: { 
      name: '中上級', 
      minScore: 600, 
      maxScore: 799, 
      color: '#8b5cf6',
      icon: '📗',
      avgAccuracy: 80,
      description: '高得点を目指す段階'
    },
    advanced: { 
      name: '上級', 
      minScore: 800, 
      maxScore: 899, 
      color: '#f59e0b',
      icon: '🏆',
      avgAccuracy: 90,
      description: 'エキスパートレベル'
    },
    expert: { 
      name: 'エキスパート', 
      minScore: 900, 
      maxScore: 990, 
      color: '#ef4444',
      icon: '👑',
      avgAccuracy: 95,
      description: '最高峰のレベル'
    }
  },
  
  // ==================== 1. スコア推移分析 ====================
  
  // スコア履歴を取得
  getScoreHistory: function() {
    const progress = this.getProgress();
    const history = [];
    
    if (!progress.tests) return history;
    
    Object.keys(progress.tests).forEach(testNum => {
      const test = progress.tests[testNum];
      if (test && test.score !== undefined) {
        history.push({
          testNumber: parseInt(testNum),
          score: test.score,
          predictedScore: test.predictedScore || 0,
          accuracy: ((test.score / 30) * 100).toFixed(1),
          date: test.date || test.completedAt || new Date().toISOString(),
          time: test.time || '00:00'
        });
      }
    });
    
    // 日付順にソート
    history.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return history;
  },
  
  // スコア推移統計を計算
  getScoreProgressStats: function() {
    const history = this.getScoreHistory();
    
    if (history.length === 0) {
      return {
        count: 0,
        avgScore: 0,
        avgPredicted: 0,
        avgAccuracy: 0,
        trend: 'none',
        improvement: 0,
        bestScore: 0,
        bestPredicted: 0
      };
    }
    
    // 平均値計算
    const totalScore = history.reduce((sum, h) => sum + h.score, 0);
    const totalPredicted = history.reduce((sum, h) => sum + h.predictedScore, 0);
    const totalAccuracy = history.reduce((sum, h) => sum + parseFloat(h.accuracy), 0);
    
    // トレンド分析（最初と最後を比較）
    let trend = 'stable';
    let improvement = 0;
    
    if (history.length >= 2) {
      const firstScore = history[0].predictedScore;
      const lastScore = history[history.length - 1].predictedScore;
      improvement = lastScore - firstScore;
      
      if (improvement > 20) {
        trend = 'rising';
      } else if (improvement < -20) {
        trend = 'falling';
      }
    }
    
    // ベストスコア
    const bestScore = Math.max(...history.map(h => h.score));
    const bestPredicted = Math.max(...history.map(h => h.predictedScore));
    
    return {
      count: history.length,
      avgScore: (totalScore / history.length).toFixed(1),
      avgPredicted: Math.round(totalPredicted / history.length),
      avgAccuracy: (totalAccuracy / history.length).toFixed(1),
      trend: trend,
      improvement: improvement,
      bestScore: bestScore,
      bestPredicted: bestPredicted,
      history: history
    };
  },
  
  // ==================== 2. カテゴリ別成長トラッキング ====================
  
  // カテゴリ別の成長率を計算
  getCategoryGrowthAnalysis: function() {
    if (typeof WeaknessAnalysis === 'undefined') {
      return [];
    }
    
    const data = WeaknessAnalysis.getAnalysisData();
    const growth = [];
    
    Object.keys(data.categories).forEach(categoryName => {
      const cat = data.categories[categoryName];
      
      if (cat.total >= 10 && cat.trend && cat.trend.length >= 10) {
        // 最初の10問の正答率
        const first10 = cat.trend.slice(0, 10);
        const firstCorrect = first10.filter(x => x === 1).length;
        const initialAccuracy = (firstCorrect / 10) * 100;
        
        // 最近の10問の正答率
        const last10 = cat.trend.slice(-10);
        const lastCorrect = last10.filter(x => x === 1).length;
        const currentAccuracy = (lastCorrect / 10) * 100;
        
        // 改善度（パーセントポイント）
        const improvement = currentAccuracy - initialAccuracy;
        
        // 改善率（%）
        const improvementRate = initialAccuracy > 0 
          ? ((improvement / initialAccuracy) * 100).toFixed(1)
          : 0;
        
        // トレンド判定
        let trendIcon = '→';
        if (improvement > 10) trendIcon = '↗️';
        else if (improvement < -10) trendIcon = '↘️';
        
        growth.push({
          category: categoryName,
          initialAccuracy: initialAccuracy.toFixed(1),
          currentAccuracy: currentAccuracy.toFixed(1),
          improvement: improvement.toFixed(1),
          improvementRate: improvementRate,
          trendIcon: trendIcon,
          totalQuestions: cat.total,
          overallAccuracy: cat.accuracy
        });
      } else if (cat.total > 0) {
        // データが少ない場合は全体の正答率のみ表示
        growth.push({
          category: categoryName,
          initialAccuracy: cat.accuracy.toFixed(1),
          currentAccuracy: cat.accuracy.toFixed(1),
          improvement: 0,
          improvementRate: 0,
          trendIcon: '→',
          totalQuestions: cat.total,
          overallAccuracy: cat.accuracy,
          insufficient: true
        });
      }
    });
    
    // 改善度の高い順にソート
    growth.sort((a, b) => parseFloat(b.improvement) - parseFloat(a.improvement));
    
    return growth;
  },
  
  // トップ3の改善カテゴリを取得
  getTopImprovements: function() {
    const growth = this.getCategoryGrowthAnalysis();
    return growth
      .filter(g => !g.insufficient && parseFloat(g.improvement) > 0)
      .slice(0, 3);
  },
  
  // ==================== 3. 間違えやすい問題パターン分析 ====================
  
  // エラーパターンを分析
  analyzeErrorPatterns: function() {
    if (typeof ReviewSystem === 'undefined') {
      return {
        repeatMistakes: [],
        categoryMistakes: {},
        totalErrors: 0,
        mostDifficultCategory: null
      };
    }
    
    const wrongAnswers = ReviewSystem.getWrongAnswers();
    const patterns = {
      repeatMistakes: [],
      categoryMistakes: {},
      totalErrors: wrongAnswers.length,
      mostDifficultCategory: null
    };
    
    wrongAnswers.forEach(item => {
      // カテゴリ別の間違い回数をカウント
      const category = item.category || 'その他';
      if (!patterns.categoryMistakes[category]) {
        patterns.categoryMistakes[category] = {
          count: 0,
          questions: []
        };
      }
      patterns.categoryMistakes[category].count++;
      patterns.categoryMistakes[category].questions.push(item);
      
      // 繰り返しミスの特定（2回以上）
      if (item.mistakeCount && item.mistakeCount >= 2) {
        patterns.repeatMistakes.push({
          questionId: item.questionId,
          category: category,
          mistakeCount: item.mistakeCount,
          question: item.question
        });
      }
    });
    
    // 最も間違いが多いカテゴリを特定
    let maxCount = 0;
    let maxCategory = null;
    Object.keys(patterns.categoryMistakes).forEach(category => {
      const count = patterns.categoryMistakes[category].count;
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    });
    
    patterns.mostDifficultCategory = maxCategory;
    
    // 繰り返しミスを回数順にソート
    patterns.repeatMistakes.sort((a, b) => b.mistakeCount - a.mistakeCount);
    
    return patterns;
  },
  
  // カテゴリ別エラー率ランキング
  getCategoryErrorRanking: function() {
    const patterns = this.analyzeErrorPatterns();
    const ranking = [];
    
    Object.keys(patterns.categoryMistakes).forEach(category => {
      const data = patterns.categoryMistakes[category];
      ranking.push({
        category: category,
        errorCount: data.count,
        questions: data.questions.length
      });
    });
    
    // エラー数の多い順にソート
    ranking.sort((a, b) => b.errorCount - a.errorCount);
    
    return ranking;
  },
  
  // ==================== 4. レベル判定 ====================
  
  // 現在のレベルを判定
  getCurrentLevel: function() {
    const stats = this.getScoreProgressStats();
    const currentScore = stats.avgPredicted;
    
    for (const [key, level] of Object.entries(this.LEVELS)) {
      if (currentScore >= level.minScore && currentScore <= level.maxScore) {
        return {
          key: key,
          ...level,
          currentScore: currentScore,
          progress: this.calculateLevelProgress(currentScore, level)
        };
      }
    }
    
    return {
      key: 'beginner',
      ...this.LEVELS.beginner,
      currentScore: currentScore,
      progress: 0
    };
  },
  
  // レベル内の進捗を計算（0-100%）
  calculateLevelProgress: function(score, level) {
    const range = level.maxScore - level.minScore;
    const progress = ((score - level.minScore) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  },
  
  // 次のレベルまでの情報を取得
  getNextLevelInfo: function() {
    const currentLevel = this.getCurrentLevel();
    const levelKeys = Object.keys(this.LEVELS);
    const currentIndex = levelKeys.indexOf(currentLevel.key);
    
    if (currentIndex >= levelKeys.length - 1) {
      // すでに最高レベル
      return {
        isMaxLevel: true,
        message: '最高レベル到達！おめでとうございます！🎉'
      };
    }
    
    const nextLevelKey = levelKeys[currentIndex + 1];
    const nextLevel = this.LEVELS[nextLevelKey];
    const pointsNeeded = nextLevel.minScore - currentLevel.currentScore;
    
    return {
      isMaxLevel: false,
      nextLevel: nextLevel,
      pointsNeeded: pointsNeeded,
      accuracyNeeded: nextLevel.avgAccuracy - parseFloat(this.getScoreProgressStats().avgAccuracy),
      message: `${nextLevel.name}まであと${pointsNeeded}点！`
    };
  },
  
  // ランキング位置を計算（仮想的な全体比較）
  getRankingPosition: function() {
    const currentLevel = this.getCurrentLevel();
    const stats = this.getScoreProgressStats();
    const accuracy = parseFloat(stats.avgAccuracy);
    
    // レベル内での相対位置を計算
    let percentile = 50; // デフォルトは中央
    
    // 正答率で判定
    if (accuracy >= currentLevel.avgAccuracy + 10) {
      percentile = 90; // トップ10%
    } else if (accuracy >= currentLevel.avgAccuracy + 5) {
      percentile = 75; // トップ25%
    } else if (accuracy >= currentLevel.avgAccuracy) {
      percentile = 60; // 平均以上
    } else if (accuracy >= currentLevel.avgAccuracy - 5) {
      percentile = 40; // 平均以下
    } else {
      percentile = 20; // 下位
    }
    
    return {
      percentile: percentile,
      message: this.getPercentileMessage(percentile, currentLevel.name)
    };
  },
  
  // パーセンタイルメッセージを生成
  getPercentileMessage: function(percentile, levelName) {
    if (percentile >= 90) {
      return `${levelName}のトップ10%です！素晴らしい！🏆`;
    } else if (percentile >= 75) {
      return `${levelName}のトップ25%です！優秀です！✨`;
    } else if (percentile >= 60) {
      return `${levelName}の平均以上です！良好です！👍`;
    } else if (percentile >= 40) {
      return `${levelName}の平均レベルです。もう一息！💪`;
    } else {
      return `まだまだ伸びしろがあります！頑張りましょう！🌱`;
    }
  },
  
  // ==================== 総合レポート ====================
  
  // 総合インサイトレポートを生成
  generateComprehensiveReport: function() {
    return {
      scoreProgress: this.getScoreProgressStats(),
      categoryGrowth: this.getCategoryGrowthAnalysis(),
      topImprovements: this.getTopImprovements(),
      errorPatterns: this.analyzeErrorPatterns(),
      errorRanking: this.getCategoryErrorRanking(),
      currentLevel: this.getCurrentLevel(),
      nextLevel: this.getNextLevelInfo(),
      ranking: this.getRankingPosition()
    };
  },
  
  // ==================== ユーティリティ ====================
  
  // 進捗データを取得
  getProgress: function() {
    const stored = localStorage.getItem('toeic_part5_progress');
    return stored ? JSON.parse(stored) : { tests: {} };
  },
  
  // 初期化
  init: function() {
    console.log('📊 学習インサイトシステム初期化中...');
    const report = this.generateComprehensiveReport();
    console.log(`  テスト実施回数: ${report.scoreProgress.count}回`);
    console.log(`  平均予測スコア: ${report.scoreProgress.avgPredicted}点`);
    console.log(`  現在のレベル: ${report.currentLevel.name} ${report.currentLevel.icon}`);
    console.log(`  成長トラッキング: ${report.categoryGrowth.length}カテゴリ`);
    console.log(`  エラーパターン: ${report.errorPatterns.totalErrors}件の間違い`);
  }
};

// グローバルにエクスポート
window.LearningInsights = LearningInsights;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    LearningInsights.init();
  });
} else {
  LearningInsights.init();
}
