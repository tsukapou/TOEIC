/**
 * 統合復習ハブシステム
 * 複数の復習機能を統合し、ユーザーに最適な学習プランを提示
 */

class UnifiedReviewHub {
  constructor() {
    console.log('🎯 統合復習ハブシステム初期化中...');
    this.init();
  }
  
  init() {
    const stats = this.getUnifiedStatistics();
    console.log(`  統合問題数: ${stats.totalProblems}問`);
    console.log(`  緊急: ${stats.urgent}問`);
    console.log(`  重要: ${stats.important}問`);
    console.log(`  推奨: ${stats.recommended}問`);
  }
  
  /**
   * 全ての復習ソースからデータを統合
   * @returns {Object} 統合された復習問題リスト
   */
  getUnifiedReviewData() {
    const allProblems = [];
    
    // 1. スペースドリピティションからの問題
    if (typeof SpacedRepetition !== 'undefined') {
      const dueQuestions = SpacedRepetition.getDueQuestions();
      const spacedProblems = this.mapSpacedRepetitionProblems(dueQuestions);
      allProblems.push(...spacedProblems);
    }
    
    // 2. 復習システムからの問題
    if (typeof ReviewSystem !== 'undefined') {
      const wrongAnswers = ReviewSystem.getWrongAnswers();
      const reviewProblems = this.mapReviewSystemProblems(wrongAnswers);
      allProblems.push(...reviewProblems);
    }
    
    // 3. 弱点分析からの問題
    if (typeof WeaknessAnalysis !== 'undefined') {
      const weakCategories = this.getWeakCategories();
      const weaknessProblems = this.mapWeaknessCategoryProblems(weakCategories);
      allProblems.push(...weaknessProblems);
    }
    
    // 重複を削除し、優先度でソート
    const uniqueProblems = this.deduplicateAndPrioritize(allProblems);
    
    return uniqueProblems;
  }
  
  /**
   * スペースドリピティションの問題をマッピング
   */
  mapSpacedRepetitionProblems(dueQuestions) {
    // ReviewSystemが存在しない場合は空配列を返す
    if (typeof ReviewSystem === 'undefined') {
      return [];
    }
    
    const wrongAnswers = ReviewSystem.getWrongAnswers() || [];
    
    return dueQuestions.map(questionId => {
      // SpacedRepetitionが存在しない場合
      if (typeof SpacedRepetition === 'undefined') return null;
      
      const scheduleInfo = SpacedRepetition.getScheduleInfo(questionId);
      const wrongAnswer = wrongAnswers.find(w => w.questionId === questionId);
      
      if (!wrongAnswer || !scheduleInfo) return null;
      
      // 期限切れ日数を計算
      const now = Date.now();
      const overdueDays = Math.max(0, Math.ceil((now - scheduleInfo.nextReviewDate) / (24 * 60 * 60 * 1000)));
      
      return {
        questionId: questionId,
        source: 'spaced-repetition',
        priority: this.calculatePriority({
          overdueDays: overdueDays,
          wrongCount: wrongAnswer.wrongCount,
          retentionRate: scheduleInfo.retentionRate,
          forgettingRisk: scheduleInfo.forgettingRisk,
          level: scheduleInfo.level
        }),
        overdueDays: overdueDays,
        wrongCount: wrongAnswer.wrongCount,
        retentionRate: scheduleInfo.retentionRate,
        forgettingRisk: scheduleInfo.forgettingRisk,
        category: wrongAnswer.category,
        lastWrongDate: wrongAnswer.lastWrong,
        reviewLevel: scheduleInfo.level,
        questionData: wrongAnswer
      };
    }).filter(Boolean);
  }
  
  /**
   * 復習システムの問題をマッピング
   */
  mapReviewSystemProblems(wrongAnswers) {
    return wrongAnswers.map(wrongAnswer => {
      const scheduleInfo = SpacedRepetition ? SpacedRepetition.getScheduleInfo(wrongAnswer.questionId) : null;
      
      return {
        questionId: wrongAnswer.questionId,
        source: 'review-system',
        priority: this.calculatePriority({
          wrongCount: wrongAnswer.wrongCount,
          daysSinceWrong: (Date.now() - wrongAnswer.lastWrong) / (24 * 60 * 60 * 1000),
          retentionRate: scheduleInfo ? scheduleInfo.retentionRate : 50,
          forgettingRisk: scheduleInfo ? scheduleInfo.forgettingRisk : 50
        }),
        wrongCount: wrongAnswer.wrongCount,
        retentionRate: scheduleInfo ? scheduleInfo.retentionRate : 50,
        forgettingRisk: scheduleInfo ? scheduleInfo.forgettingRisk : 50,
        category: wrongAnswer.category,
        lastWrongDate: wrongAnswer.lastWrong,
        questionData: wrongAnswer
      };
    });
  }
  
  /**
   * 弱点カテゴリの問題をマッピング
   */
  mapWeaknessCategoryProblems(weakCategories) {
    const problems = [];
    
    weakCategories.forEach(category => {
      // 各カテゴリから代表的な問題を取得
      const categoryProblems = this.getProblemsForCategory(category.name, 5);
      problems.push(...categoryProblems);
    });
    
    return problems;
  }
  
  /**
   * 弱点カテゴリを取得
   */
  getWeakCategories() {
    if (typeof WeaknessAnalysis === 'undefined') return [];
    
    const report = WeaknessAnalysis.generateReport();
    if (!report || !report.byCategory) return [];
    
    const weakCategories = [];
    
    Object.entries(report.byCategory).forEach(([category, data]) => {
      if (data && data.accuracy < 50 && data.totalQuestions >= 3) {
        weakCategories.push({
          name: category,
          accuracy: data.accuracy,
          totalQuestions: data.totalQuestions
        });
      }
    });
    
    return weakCategories.sort((a, b) => a.accuracy - b.accuracy);
  }
  
  /**
   * カテゴリの問題を取得
   */
  getProblemsForCategory(category, limit = 5) {
    if (typeof ReviewSystem === 'undefined') return [];
    
    const wrongAnswers = ReviewSystem.getWrongAnswers();
    if (!wrongAnswers || wrongAnswers.length === 0) return [];
    
    const categoryProblems = wrongAnswers.filter(w => w && w.category === category);
    
    return categoryProblems.slice(0, limit).map(wrongAnswer => ({
      questionId: wrongAnswer.questionId,
      source: 'weakness-category',
      priority: this.calculatePriority({
        wrongCount: wrongAnswer.wrongCount,
        categoryWeakness: true
      }),
      wrongCount: wrongAnswer.wrongCount,
      category: wrongAnswer.category,
      lastWrongDate: wrongAnswer.lastWrong,
      questionData: wrongAnswer
    }));
  }
  
  /**
   * 優先度を計算
   */
  calculatePriority(factors) {
    let score = 0;
    
    // 期限切れ（最優先）
    if (factors.overdueDays) {
      score += 1000 + (factors.overdueDays * 50);
    }
    
    // 忘却リスク
    if (factors.forgettingRisk) {
      score += factors.forgettingRisk * 5;
    }
    
    // 記憶定着率（低いほど優先）
    if (factors.retentionRate !== undefined) {
      score += (100 - factors.retentionRate) * 3;
    }
    
    // 間違い回数
    if (factors.wrongCount) {
      score += factors.wrongCount * 30;
    }
    
    // 最近の間違い
    if (factors.daysSinceWrong !== undefined) {
      if (factors.daysSinceWrong < 1) score += 100;
      else if (factors.daysSinceWrong < 3) score += 50;
    }
    
    // 復習レベル（低いほど優先）
    if (factors.level !== undefined) {
      score += (5 - factors.level) * 20;
    }
    
    // カテゴリ弱点
    if (factors.categoryWeakness) {
      score += 200;
    }
    
    return Math.round(score);
  }
  
  /**
   * 重複を削除し、優先度でソート
   */
  deduplicateAndPrioritize(problems) {
    const uniqueMap = new Map();
    
    problems.forEach(problem => {
      const existing = uniqueMap.get(problem.questionId);
      
      if (!existing || problem.priority > existing.priority) {
        uniqueMap.set(problem.questionId, problem);
      }
    });
    
    const uniqueProblems = Array.from(uniqueMap.values());
    return uniqueProblems.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * 統合された問題を緊急・重要・推奨に分類
   */
  categorizeProblems() {
    const allProblems = this.getUnifiedReviewData();
    
    const urgent = [];      // 優先度1000以上（期限切れ・超高リスク）
    const important = [];   // 優先度500-999（今日の復習期限）
    const recommended = []; // 優先度500未満（苦手カテゴリ等）
    
    allProblems.forEach(problem => {
      if (problem.priority >= 1000) {
        urgent.push(problem);
      } else if (problem.priority >= 500) {
        important.push(problem);
      } else {
        recommended.push(problem);
      }
    });
    
    return {
      urgent: urgent,
      important: important,
      recommended: recommended,
      all: allProblems
    };
  }
  
  /**
   * 統計情報を取得
   */
  getUnifiedStatistics() {
    const categorized = this.categorizeProblems();
    
    return {
      totalProblems: categorized.all.length,
      urgent: categorized.urgent.length,
      important: categorized.important.length,
      recommended: categorized.recommended.length,
      avgPriority: categorized.all.length > 0 
        ? Math.round(categorized.all.reduce((sum, p) => sum + p.priority, 0) / categorized.all.length)
        : 0
    };
  }
  
  /**
   * カテゴリ別の問題数を取得
   */
  getCategoryStats() {
    const allProblems = this.getUnifiedReviewData();
    const categoryMap = new Map();
    
    allProblems.forEach(problem => {
      const category = problem.category || '不明';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + 1);
    });
    
    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }
  
  /**
   * 優先度の理由を生成
   */
  generatePriorityReason(problem) {
    const reasons = [];
    
    // 期限切れ
    if (problem.overdueDays && problem.overdueDays > 0) {
      reasons.push({
        icon: '📅',
        text: `復習期限が<strong>${problem.overdueDays}日遅れ</strong>ています`,
        weight: 'critical'
      });
    }
    
    // 間違い回数
    if (problem.wrongCount && problem.wrongCount >= 3) {
      reasons.push({
        icon: '❌',
        text: `これまでに<strong>${problem.wrongCount}回</strong>間違えています`,
        weight: 'high'
      });
    }
    
    // 記憶定着率
    if (problem.retentionRate !== undefined && problem.retentionRate < 30) {
      reasons.push({
        icon: '🧠',
        text: `記憶定着率が<strong>${problem.retentionRate}%</strong>（危険水準）`,
        weight: 'critical'
      });
    } else if (problem.retentionRate !== undefined && problem.retentionRate < 50) {
      reasons.push({
        icon: '🧠',
        text: `記憶定着率が<strong>${problem.retentionRate}%</strong>（要注意）`,
        weight: 'medium'
      });
    }
    
    // 忘却リスク
    if (problem.forgettingRisk && problem.forgettingRisk >= 70) {
      reasons.push({
        icon: '⚠️',
        text: `忘却リスク<strong>${problem.forgettingRisk}点</strong>（超高リスク）`,
        weight: 'critical'
      });
    }
    
    // カテゴリ弱点
    if (problem.source === 'weakness-category') {
      reasons.push({
        icon: '📊',
        text: `${problem.category}カテゴリは苦手分野です`,
        weight: 'medium'
      });
    }
    
    // 復習効果の予測
    const effect = this.predictReviewEffect(problem);
    
    return {
      reasons: reasons,
      effect: effect
    };
  }
  
  /**
   * 復習効果を予測
   */
  predictReviewEffect(problem) {
    let retentionIncrease = 0;
    
    if (problem.retentionRate !== undefined) {
      // 記憶定着率が低いほど、復習の効果が大きい
      retentionIncrease = Math.min(95 - problem.retentionRate, 75);
    } else {
      retentionIncrease = 50;
    }
    
    return {
      retentionIncrease: retentionIncrease,
      targetRetention: Math.min(95, (problem.retentionRate || 30) + retentionIncrease),
      message: `この問題を今復習すれば、記憶定着率が<strong>${Math.min(95, (problem.retentionRate || 30) + retentionIncrease)}%</strong>に回復します！`
    };
  }
  
  /**
   * 復習を開始
   */
  startReview(category) {
    console.log('🔄 統合復習開始:', category);
    const categorized = this.categorizeProblems();
    let problems = [];
    
    if (category === 'urgent') {
      problems = categorized.urgent;
    } else if (category === 'important') {
      problems = categorized.important;
    } else if (category === 'recommended') {
      problems = categorized.recommended;
    } else {
      problems = categorized.all;
    }
    
    console.log(`📊 復習問題数: ${problems.length}問`);
    
    if (problems.length === 0) {
      alert('この優先度の復習問題はありません！');
      return;
    }
    
    // 復習モードを開始（最大30問）
    const questionIds = problems.slice(0, 30).map(p => p.questionId);
    console.log(`🎯 選択された問題ID: ${questionIds.length}個`);
    
    // QUESTIONS_DATABASEから実際の問題オブジェクトを取得
    if (typeof QUESTIONS_DATABASE === 'undefined' || !QUESTIONS_DATABASE.allQuestions) {
      alert('問題データが読み込まれていません。');
      return;
    }
    
    const reviewQuestions = QUESTIONS_DATABASE.allQuestions.filter(q => 
      questionIds.includes(q.id)
    );
    
    console.log(`✅ 復習問題取得完了: ${reviewQuestions.length}問`);
    
    if (reviewQuestions.length === 0) {
      alert('復習問題の読み込みに失敗しました。');
      return;
    }
    
    // AppStateに復習問題を設定
    if (typeof AppState !== 'undefined') {
      AppState.currentTestNumber = null; // 復習モード
      AppState.currentQuestionIndex = 0;
      AppState.userAnswers = [];
      AppState.startTime = Date.now();
      AppState.shuffledQuestions = reviewQuestions;
      
      // 問題画面に遷移
      console.log('🎬 問題画面への遷移を開始...');
      console.log('  window.startTimer:', typeof window.startTimer);
      console.log('  window.renderQuestion:', typeof window.renderQuestion);
      console.log('  window.showScreen:', typeof window.showScreen);
      
      if (typeof window.startTimer === 'function') {
        window.startTimer();
        console.log('✅ タイマー開始');
      } else {
        console.error('❌ startTimer関数が見つかりません');
        console.error('  利用可能な関数:', Object.keys(window).filter(k => typeof window[k] === 'function' && k.includes('start')));
      }
      
      if (typeof window.renderQuestion === 'function') {
        window.renderQuestion();
        console.log('✅ 問題レンダリング完了');
      } else {
        console.error('❌ renderQuestion関数が見つかりません');
        console.error('  利用可能な関数:', Object.keys(window).filter(k => typeof window[k] === 'function' && k.includes('render')));
      }
      
      if (typeof window.showScreen === 'function') {
        window.showScreen('questionScreen');
        console.log('✅ 問題画面表示');
      } else {
        console.error('❌ showScreen関数が見つかりません');
        console.error('  利用可能な関数:', Object.keys(window).filter(k => typeof window[k] === 'function' && k.includes('show')));
      }
      
      console.log('✅ 統合復習モード開始完了');
    } else {
      alert('アプリケーションが初期化されていません。');
    }
  }
}

// グローバルインスタンスの作成
const UnifiedReview = new UnifiedReviewHub();

// グローバルに公開
if (typeof window !== 'undefined') {
  window.UnifiedReview = UnifiedReview;
}
