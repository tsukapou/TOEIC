// TOEIC PART5 学習サポート - 間違えた問題の復習システム
// 間違えた問題を保存・管理し、効率的な復習を支援

const ReviewSystem = {
  
  // 間違えた問題を保存
  saveWrongAnswer: function(questionId, questionText, options, correctAnswer, userAnswer, category) {
    const wrongAnswers = this.getWrongAnswers();
    
    // 既存の記録を探す
    const existing = wrongAnswers.find(item => item.questionId === questionId);
    
    if (existing) {
      // 既に間違えた問題の場合、カウントを増やす
      existing.wrongCount++;
      existing.lastWrong = Date.now();
      existing.masteredCount = 0; // 間違えたらマスターカウントをリセット
      existing.attempts.push({
        date: Date.now(),
        userAnswer: userAnswer
      });
    } else {
      // 新しい間違い
      wrongAnswers.push({
        questionId: questionId,
        questionText: questionText,
        options: options,
        correctAnswer: correctAnswer,
        category: category,
        wrongCount: 1,
        masteredCount: 0,  // 連続正解回数
        firstWrong: Date.now(),
        lastWrong: Date.now(),
        lastReview: null,
        attempts: [{
          date: Date.now(),
          userAnswer: userAnswer
        }]
      });
    }
    
    // スペースドリピティションに記録
    if (typeof SpacedRepetition !== 'undefined') {
      SpacedRepetition.recordReview(questionId, false);
    }
    
    localStorage.setItem('toeic_wrong_answers', JSON.stringify(wrongAnswers));
    console.log(`❌ 間違えた問題を保存: ${questionId} (${wrongAnswers.length}問)`);
  },
  
  // 正解した問題を記録（マスター進捗）
  saveCorrectAnswer: function(questionId) {
    const wrongAnswers = this.getWrongAnswers();
    const item = wrongAnswers.find(q => q.questionId === questionId);
    
    if (item) {
      item.masteredCount++;
      item.lastReview = Date.now();
      
      // スペースドリピティションに記録
      if (typeof SpacedRepetition !== 'undefined') {
        SpacedRepetition.recordReview(questionId, true);
      }
      
      // 3回連続正解で「完全マスター」
      if (item.masteredCount >= 3) {
        console.log(`✅ 完全マスター: ${questionId}`);
        // マスターした問題は削除（または別リストに移動）
        const index = wrongAnswers.indexOf(item);
        wrongAnswers.splice(index, 1);
        
        // 実績システムに復習完了を通知（NEW! 2025-12-09）
        if (typeof AchievementIntegration !== 'undefined' && typeof AchievementIntegration.onReviewComplete === 'function') {
          // 累計復習完了数を取得（localStorage内で管理）
          let reviewCount = parseInt(localStorage.getItem('toeic_total_review_completed') || '0');
          reviewCount++;
          localStorage.setItem('toeic_total_review_completed', reviewCount.toString());
          AchievementIntegration.onReviewComplete(reviewCount);
        }
      }
      
      localStorage.setItem('toeic_wrong_answers', JSON.stringify(wrongAnswers));
    }
  },
  
  // 間違えた問題リストを取得
  getWrongAnswers: function() {
    const data = localStorage.getItem('toeic_wrong_answers');
    return data ? JSON.parse(data) : [];
  },
  
  // 復習が必要な問題を取得（優先度順）
  getReviewQuestions: function(limit = 30) {
    const wrongAnswers = this.getWrongAnswers();
    
    if (wrongAnswers.length === 0) return [];
    
    // スペースドリピティションシステムを使って優先度付き
    if (typeof SpacedRepetition !== 'undefined') {
      const prioritized = SpacedRepetition.getPrioritizedReviewList(
        wrongAnswers.map(item => ({
          id: item.questionId,
          wrongCount: item.wrongCount,
          lastWrongDate: item.lastWrong
        }))
      );
      
      // 優先度順の問題IDリストを作成
      const priorityIds = prioritized.slice(0, limit).map(p => p.id);
      
      // 元のwrongAnswersから該当する問題を取得（順序を維持）
      return priorityIds.map(id => wrongAnswers.find(w => w.questionId === id)).filter(Boolean);
    }
    
    // スペースドリピティションが利用できない場合は従来のロジック
    const sorted = wrongAnswers.sort((a, b) => {
      // 間違い回数が多い順
      if (b.wrongCount !== a.wrongCount) {
        return b.wrongCount - a.wrongCount;
      }
      // 最近間違えた順
      return b.lastWrong - a.lastWrong;
    });
    
    return sorted.slice(0, limit);
  },
  
  // カテゴリ別の間違い統計
  getWrongAnswerStats: function() {
    const wrongAnswers = this.getWrongAnswers();
    const stats = {};
    
    wrongAnswers.forEach(item => {
      const category = item.category || '不明';
      if (!stats[category]) {
        stats[category] = {
          count: 0,
          questions: []
        };
      }
      stats[category].count++;
      stats[category].questions.push(item);
    });
    
    return stats;
  },
  
  // 復習モード用の問題データを生成
  generateReviewTest: function(count = 30) {
    const reviewQuestions = this.getReviewQuestions(count);
    
    if (reviewQuestions.length === 0) {
      return null;
    }
    
    // 元の問題データベースから完全な情報を取得
    const allQuestions = (typeof QUESTIONS_DATABASE !== 'undefined' && QUESTIONS_DATABASE.allQuestions) 
      ? QUESTIONS_DATABASE.allQuestions 
      : [];
    
    // 問題形式に変換（元のデータベースから explanation を取得）
    return reviewQuestions.map(item => {
      // 元の問題データを検索
      const originalQuestion = allQuestions.find(q => q.id === item.questionId);
      
      // 元の問題が見つかった場合は、explanation を含む完全なデータを返す
      if (originalQuestion) {
        return {
          ...originalQuestion,
          isReview: true,
          wrongCount: item.wrongCount
        };
      }
      
      // 元の問題が見つからない場合は、保存されているデータのみを返す
      return {
        id: item.questionId,
        text: item.questionText,
        options: item.options,
        answer: item.correctAnswer,
        category: item.category,
        questionType: item.category,
        isReview: true,
        wrongCount: item.wrongCount,
        explanation: {
          ja: '（解説データなし）',
          point: '問題データベースから元の問題を取得できませんでした。',
          reason: 'この問題の詳細な解説は利用できません。'
        }
      };
    });
  },
  
  // 復習進捗の取得
  getReviewProgress: function() {
    const wrongAnswers = this.getWrongAnswers();
    const masteredCount = this.getMasteredCount();
    
    return {
      totalWrong: wrongAnswers.length,
      needReview: wrongAnswers.filter(q => q.masteredCount < 3).length,
      mastered: masteredCount,
      averageWrongCount: wrongAnswers.length > 0 
        ? wrongAnswers.reduce((sum, q) => sum + q.wrongCount, 0) / wrongAnswers.length 
        : 0
    };
  },
  
  // マスターした問題数を取得
  getMasteredCount: function() {
    const data = localStorage.getItem('toeic_mastered_questions');
    return data ? JSON.parse(data).length : 0;
  },
  
  // 統計情報の表示
  showReviewStats: function() {
    const stats = this.getWrongAnswerStats();
    const progress = this.getReviewProgress();
    
    console.log('📊 復習システム統計:');
    console.log(`  間違えた問題: ${progress.totalWrong}問`);
    console.log(`  復習が必要: ${progress.needReview}問`);
    console.log(`  完全マスター: ${progress.mastered}問`);
    console.log(`  平均間違い回数: ${progress.averageWrongCount.toFixed(1)}回`);
    
    console.log('\n📋 カテゴリ別:');
    Object.keys(stats).forEach(category => {
      console.log(`  ${category}: ${stats[category].count}問`);
    });
  },
  
  // 初期化
  init: function() {
    console.log('📝 復習システム初期化中...');
    this.showReviewStats();
  }
};

// グローバルにエクスポート
window.ReviewSystem = ReviewSystem;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ReviewSystem.init();
  });
} else {
  ReviewSystem.init();
}
