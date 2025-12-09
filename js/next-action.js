/**
 * 次にやることシステム (Next Action System)
 * Phase C: 緊急改善
 */

class NextActionSystem {
  constructor() {
    console.log('🎯 次にやることシステム初期化中...');
    this.init();
  }
  
  init() {
    console.log('✅ 次にやることシステム初期化完了');
  }
  
  getNextAction() {
    // 1. 試験日が近い場合の今日の目標
    const dailyGoal = this.checkDailyGoal();
    if (dailyGoal) return dailyGoal;
    
    // 2. 緊急の復習（期限切れ問題）
    const urgentReview = this.checkUrgentReview();
    if (urgentReview) return urgentReview;
    
    // 3. 重要な復習（今日が期限）
    const importantReview = this.checkImportantReview();
    if (importantReview) return importantReview;
    
    // 4. 苦手問題集中特訓
    const weaknessTraining = this.checkWeaknessTraining();
    if (weaknessTraining) return weaknessTraining;
    
    // 5. デイリーミッション未達成
    const dailyMissions = this.checkDailyMissions();
    if (dailyMissions) return dailyMissions;
    
    // 6. デフォルト: 通常テスト
    return this.getDefaultAction();
  }
  
  checkDailyGoal() {
    try {
      const profile = JSON.parse(localStorage.getItem('toeic_user_profile') || '{}');
      if (!profile.examDate) return null;
      
      const examDate = new Date(profile.examDate);
      const now = new Date();
      const daysLeft = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && daysLeft <= 60) {
        const stats = JSON.parse(localStorage.getItem('toeic_learning_stats') || '{}');
        const todayTests = this.getTodayTestCount();
        
        const totalQuestions = 450;
        const studiedQuestions = stats.totalQuestions || 0;
        const remainingQuestions = totalQuestions - studiedQuestions;
        const questionsPerDay = Math.ceil(remainingQuestions / Math.max(daysLeft, 1));
        const testsPerDay = Math.ceil(questionsPerDay / 30);
        
        if (todayTests < testsPerDay) {
          return {
            priority: 'critical',
            action: 'startTest',
            emoji: '🎯',
            title: `今日の目標テスト（あと${testsPerDay - todayTests}回）`,
            description: `試験まであと${daysLeft}日！計画通りに学習するために、今日は${testsPerDay}回のテストを完了させましょう。下のテスト一覧から選んでスタート！`,
            buttonText: '今すぐ始める →',
            priorityText: '緊急',
            color: '#ef4444'
          };
        }
      }
    } catch (e) {
      console.error('Daily goal check error:', e);
    }
    return null;
  }
  
  getTodayTestCount() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stats = JSON.parse(localStorage.getItem('toeic_learning_stats') || '{}');
      const lastTestDate = stats.lastTestDate ? new Date(stats.lastTestDate).toISOString().split('T')[0] : null;
      return lastTestDate === today ? (stats.todayTestCount || 0) : 0;
    } catch (e) {
      return 0;
    }
  }
  
  checkUrgentReview() {
    if (typeof UnifiedReview === 'undefined') return null;
    try {
      const categorized = UnifiedReview.categorizeProblems();
      if (categorized.urgent.length > 0) {
        return {
          priority: 'urgent',
          action: 'startUnifiedReview',
          actionParam: 'urgent',
          emoji: '🔥',
          title: `緊急の復習（${categorized.urgent.length}問）`,
          description: '復習期限が過ぎた問題があります。記憶が薄れる前に、今すぐ復習しましょう！ボタンを押すと復習画面に移動します。',
          buttonText: '今すぐ復習する →',
          priorityText: '緊急',
          color: '#dc2626'
        };
      }
    } catch (e) {
      console.error('Urgent review check error:', e);
    }
    return null;
  }
  
  checkImportantReview() {
    if (typeof UnifiedReview === 'undefined') return null;
    try {
      const categorized = UnifiedReview.categorizeProblems();
      if (categorized.important.length > 0) {
        return {
          priority: 'important',
          action: 'startUnifiedReview',
          actionParam: 'important',
          emoji: '⚠️',
          title: `今日の復習（${categorized.important.length}問）`,
          description: '今日が復習期限の問題があります。忘れないうちに復習して、しっかり記憶に定着させましょう！',
          buttonText: '今すぐ復習する →',
          priorityText: '重要',
          color: '#f59e0b'
        };
      }
    } catch (e) {
      console.error('Important review check error:', e);
    }
    return null;
  }
  
  checkWeaknessTraining() {
    if (typeof WeaknessAnalysis === 'undefined') return null;
    try {
      const report = WeaknessAnalysis.generateReport();
      if (report && report.byCategory) {
        const weakCategories = Object.entries(report.byCategory)
          .filter(([cat, data]) => data && data.accuracy < 50 && data.totalQuestions >= 3);
        if (weakCategories.length > 0) {
          return {
            priority: 'recommended',
            action: 'startWeaknessTraining',
            emoji: '💪',
            title: `苦手問題集中特訓（${weakCategories.length}カテゴリ）`,
            description: `正答率が50%未満のカテゴリが見つかりました。苦手な問題を集中的にトレーニングして、弱点を克服しましょう！`,
            buttonText: '今すぐ特訓する →',
            priorityText: '推奨',
            color: '#3b82f6'
          };
        }
      }
    } catch (e) {
      console.error('Weakness training check error:', e);
    }
    return null;
  }
  
  checkDailyMissions() {
    if (typeof DailyMissions === 'undefined') return null;
    try {
      const todayMissions = DailyMissions.getTodayMissions();
      if (todayMissions && todayMissions.length > 0) {
        const completed = todayMissions.filter(m => m.completed).length;
        const remaining = todayMissions.length - completed;
        if (remaining > 0 && remaining < todayMissions.length) {
          return {
            priority: 'normal',
            action: 'showDailyMissions',
            emoji: '📋',
            title: `デイリーミッション（残り${remaining}個）`,
            description: `今日のミッションがあと${remaining}個残っています。全て達成してポイントをゲットしましょう！`,
            buttonText: 'ミッションを見る →',
            priorityText: '推奨',
            color: '#8b5cf6'
          };
        }
      }
    } catch (e) {
      console.error('Daily missions check error:', e);
    }
    return null;
  }
  
  getDefaultAction() {
    return {
      priority: 'normal',
      action: 'startTest',
      emoji: '📝',
      title: 'テストを受ける',
      description: '新しい問題にチャレンジして実力を伸ばしましょう！下のテスト一覧から好きなテストを選んでください。',
      buttonText: '今すぐ始める →',
      priorityText: '推奨',
      color: '#667eea'
    };
  }
  
  executeAction(actionData) {
    console.log('🎯 アクション実行:', actionData);
    
    switch (actionData.action) {
      case 'startTest':
        const testGrid = document.getElementById('testSetsGrid');
        if (testGrid) {
          testGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            const firstTest = testGrid.querySelector('.set-card');
            if (firstTest) {
              firstTest.style.transform = 'scale(1.05)';
              firstTest.style.boxShadow = '0 10px 40px rgba(102, 126, 234, 0.4)';
              setTimeout(() => {
                firstTest.style.transform = '';
                firstTest.style.boxShadow = '';
              }, 1000);
            }
          }, 500);
        }
        break;
      case 'startUnifiedReview':
        console.log('🎯 統合復習を開始:', actionData.actionParam);
        if (typeof window.startUnifiedReview === 'function') {
          window.startUnifiedReview(actionData.actionParam || 'all');
        } else {
          console.error('❌ startUnifiedReview関数が見つかりません');
          console.error('  window.startUnifiedReview:', typeof window.startUnifiedReview);
          console.error('  利用可能な関数:', Object.keys(window).filter(k => typeof window[k] === 'function' && k.includes('Review')));
          alert('復習システムが読み込まれていません。ページを再読み込みしてください。');
        }
        break;
      case 'startWeaknessTraining':
        if (typeof startWeaknessTraining === 'function') {
          startWeaknessTraining();
        }
        break;
      case 'showDailyMissions':
        if (typeof toggleMissionsPanel === 'function') {
          toggleMissionsPanel();
        }
        break;
      default:
        console.warn('Unknown action:', actionData.action);
    }
  }
}

const NextAction = new NextActionSystem();
if (typeof window !== 'undefined') {
  window.NextAction = NextAction;
  
  // 初期化完了後、次にやることカードを更新
  if (typeof updateNextActionCard === 'function') {
    updateNextActionCard();
  }
}
console.log('✅ NextActionSystem module loaded');
