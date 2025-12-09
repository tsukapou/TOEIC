// TOEIC PART5 学習サポート - 弱点克服特訓システム
// 苦手な問題を集中的に出題し、克服をサポート

const WeaknessTraining = {
  STORAGE_KEY: 'toeic_weakness_training',
  
  // 弱点レベルの定義
  WEAKNESS_LEVELS: {
    CRITICAL: { level: 'critical', name: '超弱点', threshold: 50, icon: '🔥', color: '#ef4444' },
    WEAK: { level: 'weak', name: '弱点', threshold: 70, icon: '⚠️', color: '#f59e0b' },
    NEEDS_REVIEW: { level: 'needs_review', name: '要復習', threshold: 85, icon: '📌', color: '#3b82f6' }
  },
  
  // 弱点データを取得
  getWeaknessData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        weaknessQuestions: {},  // { questionId: { attempts, correct, consecutiveCorrect, lastAttempt, mastered } }
        masteredQuestions: [],
        lastUpdate: null
      };
    }
    return JSON.parse(data);
  },
  
  // データを保存
  saveWeaknessData: function(data) {
    data.lastUpdate = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 問題の解答を記録
  recordAnswer: function(questionId, isCorrect) {
    const data = this.getWeaknessData();
    
    // 問題データが存在しない場合は初期化
    if (!data.weaknessQuestions[questionId]) {
      data.weaknessQuestions[questionId] = {
        attempts: 0,
        correct: 0,
        consecutiveCorrect: 0,
        lastAttempt: null,
        mastered: false,
        firstAttemptDate: Date.now()
      };
    }
    
    const question = data.weaknessQuestions[questionId];
    
    // 記録更新
    question.attempts++;
    question.lastAttempt = Date.now();
    
    if (isCorrect) {
      question.correct++;
      question.consecutiveCorrect++;
      
      // 3回連続正解で克服判定
      if (question.consecutiveCorrect >= 3 && !question.mastered) {
        question.mastered = true;
        data.masteredQuestions.push({
          questionId: questionId,
          masteredDate: Date.now()
        });
        console.log(`🎉 問題${questionId}を克服しました！（3回連続正解）`);
        return { mastered: true, questionId: questionId };
      }
    } else {
      // 不正解の場合、連続正解カウントをリセット
      question.consecutiveCorrect = 0;
    }
    
    this.saveWeaknessData(data);
    
    return { mastered: false };
  },
  
  // 正答率を計算
  calculateAccuracy: function(question) {
    if (question.attempts === 0) return 0;
    return Math.round((question.correct / question.attempts) * 100);
  },
  
  // 弱点レベルを判定
  getWeaknessLevel: function(accuracy) {
    if (accuracy < this.WEAKNESS_LEVELS.CRITICAL.threshold) {
      return this.WEAKNESS_LEVELS.CRITICAL;
    } else if (accuracy < this.WEAKNESS_LEVELS.WEAK.threshold) {
      return this.WEAKNESS_LEVELS.WEAK;
    } else if (accuracy < this.WEAKNESS_LEVELS.NEEDS_REVIEW.threshold) {
      return this.WEAKNESS_LEVELS.NEEDS_REVIEW;
    }
    return null; // 弱点ではない
  },
  
  // 弱点問題を取得（レベル別）
  getWeaknessQuestionsByLevel: function(level = null) {
    const data = this.getWeaknessData();
    const weaknessQuestions = [];
    
    Object.keys(data.weaknessQuestions).forEach(questionId => {
      const question = data.weaknessQuestions[questionId];
      
      // 既に克服済みの問題はスキップ
      if (question.mastered) return;
      
      const accuracy = this.calculateAccuracy(question);
      const weaknessLevel = this.getWeaknessLevel(accuracy);
      
      // レベルフィルター
      if (level && weaknessLevel && weaknessLevel.level !== level) return;
      if (!level && !weaknessLevel) return; // レベル指定なしの場合は弱点問題のみ
      
      weaknessQuestions.push({
        questionId: parseInt(questionId),
        attempts: question.attempts,
        correct: question.correct,
        accuracy: accuracy,
        consecutiveCorrect: question.consecutiveCorrect,
        lastAttempt: question.lastAttempt,
        weaknessLevel: weaknessLevel
      });
    });
    
    // 正答率の低い順（弱点順）にソート
    weaknessQuestions.sort((a, b) => a.accuracy - b.accuracy);
    
    return weaknessQuestions;
  },
  
  // 弱点問題の統計を取得
  getWeaknessStats: function() {
    const data = this.getWeaknessData();
    const allQuestions = Object.keys(data.weaknessQuestions);
    
    let criticalCount = 0;
    let weakCount = 0;
    let needsReviewCount = 0;
    let masteredCount = data.masteredQuestions.length;
    
    allQuestions.forEach(questionId => {
      const question = data.weaknessQuestions[questionId];
      if (question.mastered) return;
      
      const accuracy = this.calculateAccuracy(question);
      const level = this.getWeaknessLevel(accuracy);
      
      if (!level) return;
      
      if (level.level === 'critical') criticalCount++;
      else if (level.level === 'weak') weakCount++;
      else if (level.level === 'needs_review') needsReviewCount++;
    });
    
    return {
      critical: criticalCount,
      weak: weakCount,
      needsReview: needsReviewCount,
      total: criticalCount + weakCount + needsReviewCount,
      mastered: masteredCount
    };
  },
  
  // 弱点問題IDの配列を取得
  getWeaknessQuestionIds: function(count = 20, level = null) {
    const weaknessQuestions = this.getWeaknessQuestionsByLevel(level);
    
    // 指定された数だけ取得
    const questionIds = weaknessQuestions
      .slice(0, count)
      .map(q => q.questionId);
    
    return questionIds;
  },
  
  // 弱点問題をリセット（克服済みを除く）
  resetWeaknessProgress: function() {
    const data = this.getWeaknessData();
    const newData = {
      weaknessQuestions: {},
      masteredQuestions: data.masteredQuestions, // 克服済みは保持
      lastUpdate: Date.now()
    };
    this.saveWeaknessData(newData);
    console.log('🔄 弱点問題の進捗をリセットしました（克服済みを除く）');
  },
  
  // カテゴリ別の苦手分析（WeaknessAnalysisと連携）
  getWeakCategories: function() {
    if (typeof WeaknessAnalysis === 'undefined') return [];
    
    const report = WeaknessAnalysis.generateReport();
    const weakCategories = [];
    
    report.categories.forEach(cat => {
      if (cat.total > 0 && cat.accuracy < 50) {
        weakCategories.push({
          category: cat.name,
          accuracy: cat.accuracy,
          total: cat.total,
          correct: cat.correct
        });
      }
    });
    
    // 正答率の低い順にソート
    weakCategories.sort((a, b) => a.accuracy - b.accuracy);
    
    return weakCategories;
  },
  
  // 特訓用の問題を生成
  generateTrainingQuestions: function(maxQuestions = 30) {
    const weakCategories = this.getWeakCategories();
    
    if (weakCategories.length === 0) {
      return [];
    }
    
    // 全450問のデータベースから弱点カテゴリの問題を抽出
    if (typeof QUESTIONS_DATABASE === 'undefined' || !QUESTIONS_DATABASE.allQuestions) {
      return [];
    }
    
    const allQuestions = QUESTIONS_DATABASE.allQuestions;
    const trainingQuestions = [];
    
    // 弱点カテゴリごとに問題を収集
    weakCategories.forEach(weakCat => {
      const categoryQuestions = allQuestions.filter(q => {
        const category = WeaknessAnalysis.mapQuestionTypeToCategory(q.questionType);
        return category === weakCat.category;
      });
      
      // ランダムにシャッフルして問題を追加
      const shuffled = this.shuffleArray([...categoryQuestions]);
      trainingQuestions.push(...shuffled.slice(0, Math.ceil(maxQuestions / weakCategories.length)));
    });
    
    // 最大問題数に制限
    const finalQuestions = trainingQuestions.slice(0, maxQuestions);
    
    return this.shuffleArray(finalQuestions);
  },
  
  // Fisher-Yatesシャッフル
  shuffleArray: function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  
  // 特訓セッション管理
  trainingSession: null,
  
  // 特訓を開始
  startTraining: function() {
    const trainingQuestions = this.generateTrainingQuestions(30);
    
    if (trainingQuestions.length === 0) {
      return false;
    }
    
    // 特訓セッションを初期化
    this.trainingSession = {
      trainingQuestions: trainingQuestions,
      currentQuestionIndex: 0,
      answers: [],
      categoryProgress: {}, // { category: { correct: 0, total: 0 } }
      consecutiveCorrect: 0, // カテゴリ内連続正解数
      currentCategory: null,
      masteredCategories: [], // 習熟したカテゴリ
      startTime: Date.now()
    };
    
    // 最初の問題のカテゴリを設定
    const firstQuestion = trainingQuestions[0];
    this.trainingSession.currentCategory = WeaknessAnalysis.mapQuestionTypeToCategory(firstQuestion.questionType);
    
    return true;
  },
  
  // 現在の特訓状態を取得
  getCurrentState: function() {
    if (!this.trainingSession) return null;
    
    const session = this.trainingSession;
    const currentQuestion = session.trainingQuestions[session.currentQuestionIndex];
    
    return {
      currentQuestion: currentQuestion,
      currentQuestionIndex: session.currentQuestionIndex,
      trainingQuestions: session.trainingQuestions,
      categoryProgress: session.categoryProgress,
      consecutiveCorrect: session.consecutiveCorrect,
      currentCategory: session.currentCategory,
      masteredCategories: session.masteredCategories
    };
  },
  
  // 解答を送信
  submitAnswer: function(selectedIndex, isCorrect) {
    if (!this.trainingSession) return;
    
    const session = this.trainingSession;
    const currentQuestion = session.trainingQuestions[session.currentQuestionIndex];
    const category = WeaknessAnalysis.mapQuestionTypeToCategory(currentQuestion.questionType);
    
    // カテゴリ進捗を初期化
    if (!session.categoryProgress[category]) {
      session.categoryProgress[category] = { correct: 0, total: 0 };
    }
    
    // 進捗を更新
    session.categoryProgress[category].total++;
    if (isCorrect) {
      session.categoryProgress[category].correct++;
      session.consecutiveCorrect++;
      
      // 同じカテゴリで3問連続正解で習熟判定
      if (session.consecutiveCorrect >= 3 && !session.masteredCategories.includes(category)) {
        session.masteredCategories.push(category);
        console.log(`🎉 ${category}カテゴリを習熟しました！（3問連続正解）`);
      }
    } else {
      session.consecutiveCorrect = 0;
    }
    
    // WeaknessAnalysisに記録
    if (typeof WeaknessAnalysis !== 'undefined') {
      WeaknessAnalysis.recordAnswer(category, isCorrect);
    }
    
    // 解答を記録
    session.answers.push({
      questionId: currentQuestion.id,
      category: category,
      isCorrect: isCorrect,
      timestamp: Date.now()
    });
  },
  
  // 次の問題へ
  moveToNextQuestion: function() {
    if (!this.trainingSession) return false;
    
    const session = this.trainingSession;
    
    if (session.currentQuestionIndex < session.trainingQuestions.length - 1) {
      session.currentQuestionIndex++;
      
      // 次の問題のカテゴリを取得
      const nextQuestion = session.trainingQuestions[session.currentQuestionIndex];
      const nextCategory = WeaknessAnalysis.mapQuestionTypeToCategory(nextQuestion.questionType);
      
      // カテゴリが変わったら連続正解数をリセット
      if (nextCategory !== session.currentCategory) {
        session.consecutiveCorrect = 0;
        session.currentCategory = nextCategory;
      }
      
      return true;
    }
    
    return false;
  },
  
  // 前の問題へ
  moveToPreviousQuestion: function() {
    if (!this.trainingSession) return false;
    
    const session = this.trainingSession;
    
    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex--;
      
      // 前の問題のカテゴリを取得
      const prevQuestion = session.trainingQuestions[session.currentQuestionIndex];
      session.currentCategory = WeaknessAnalysis.mapQuestionTypeToCategory(prevQuestion.questionType);
      
      return true;
    }
    
    return false;
  },
  
  // 特訓を終了
  finishTraining: function() {
    if (!this.trainingSession) return null;
    
    const session = this.trainingSession;
    const totalQuestions = session.answers.length;
    const correctCount = session.answers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    
    const result = {
      totalQuestions: totalQuestions,
      score: correctCount,
      accuracy: accuracy,
      categoryProgress: session.categoryProgress,
      masteredCategories: session.masteredCategories,
      elapsedTime: Date.now() - session.startTime
    };
    
    // セッションをクリア
    this.trainingSession = null;
    
    return result;
  },
  
  // システム初期化
  init: function() {
    console.log('🔥 弱点克服特訓システム初期化中...');
    
    const stats = this.getWeaknessStats();
    
    console.log(`  超弱点（正答率50%未満）: ${stats.critical}問`);
    console.log(`  弱点（正答率50-70%）: ${stats.weak}問`);
    console.log(`  要復習（正答率70-85%）: ${stats.needsReview}問`);
    console.log(`  合計弱点問題: ${stats.total}問`);
    console.log(`  克服済み: ${stats.mastered}問`);
    
    return stats;
  }
};

// グローバルに公開
window.WeaknessTraining = WeaknessTraining;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  WeaknessTraining.init();
});
