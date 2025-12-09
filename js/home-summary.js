/**
 * 🎯 ホーム画面サマリー統計システム
 * 
 * 第2階層の3つの重要指標を自動更新
 * - 連続学習日数
 * - 予測スコア
 * - 今週の正答率
 */

const HomeSummary = {
  
  /**
   * サマリー統計を更新
   */
  updateSummary() {
    console.log('📊 ホームサマリー更新開始...');
    
    try {
      // 連続学習日数を更新
      this.updateStreakSummary();
      
      // 予測スコアを更新
      this.updateScoreSummary();
      
      // 今週の正答率を更新
      this.updateWeeklyAccuracy();
      
      console.log('✅ ホームサマリー更新完了');
    } catch (error) {
      console.error('❌ ホームサマリー更新エラー:', error);
    }
  },
  
  /**
   * 連続学習日数を更新
   */
  updateStreakSummary() {
    const streakElement = document.getElementById('summaryStreak');
    if (!streakElement) return;
    
    try {
      // StreakSystemから取得
      if (typeof StreakSystem !== 'undefined' && typeof StreakSystem.getStreak === 'function') {
        const streak = StreakSystem.getStreak();
        const currentStreak = streak.current || 0;
        
        streakElement.textContent = currentStreak;
        
        // アニメーション効果
        this.animateValue(streakElement, 0, currentStreak, 800);
        
        console.log(`🔥 連続学習: ${currentStreak}日`);
      }
    } catch (error) {
      console.warn('⚠️ Streak取得エラー:', error);
      streakElement.textContent = '0';
    }
  },
  
  /**
   * 予測スコアを更新
   */
  updateScoreSummary() {
    const scoreElement = document.getElementById('summaryScore');
    if (!scoreElement) return;
    
    try {
      // PersonalizedLearningNavから取得
      if (typeof PersonalizedLearningNav !== 'undefined' && 
          typeof PersonalizedLearningNav.estimateCurrentScore === 'function') {
        const estimatedScore = PersonalizedLearningNav.estimateCurrentScore();
        
        scoreElement.textContent = estimatedScore;
        
        // アニメーション効果
        this.animateValue(scoreElement, 500, estimatedScore, 1000);
        
        console.log(`📈 予測スコア: ${estimatedScore}点`);
      } else {
        // フォールバック: 手動計算
        const score = this.calculateEstimatedScore();
        scoreElement.textContent = score;
        this.animateValue(scoreElement, 500, score, 1000);
      }
    } catch (error) {
      console.warn('⚠️ スコア取得エラー:', error);
      scoreElement.textContent = '500';
    }
  },
  
  /**
   * 今週の正答率を更新
   */
  updateWeeklyAccuracy() {
    const accuracyElement = document.getElementById('summaryAccuracy');
    if (!accuracyElement) return;
    
    try {
      const accuracy = this.calculateWeeklyAccuracy();
      
      if (accuracy === null) {
        accuracyElement.textContent = '--%';
      } else {
        accuracyElement.textContent = accuracy + '%';
        
        // アニメーション効果
        this.animateValue(accuracyElement, 0, accuracy, 800, '%');
      }
      
      console.log(`✅ 今週の正答率: ${accuracy}%`);
    } catch (error) {
      console.warn('⚠️ 正答率取得エラー:', error);
      accuracyElement.textContent = '--%';
    }
  },
  
  /**
   * 推定スコアを計算（フォールバック用）
   * @returns {number} 推定スコア
   */
  calculateEstimatedScore() {
    try {
      const progress = JSON.parse(localStorage.getItem('progress') || '{}');
      const tests = progress.tests || {};
      const testKeys = Object.keys(tests);
      
      if (testKeys.length === 0) return 500;
      
      // 最近5回の平均
      const recentTests = testKeys.slice(-5);
      let totalAccuracy = 0;
      
      recentTests.forEach(key => {
        const test = tests[key];
        if (test && test.score && test.totalQuestions) {
          const accuracy = test.score / test.totalQuestions;
          totalAccuracy += accuracy;
        }
      });
      
      const avgAccuracy = totalAccuracy / recentTests.length;
      const estimatedScore = 400 + (avgAccuracy * 400);
      
      return Math.round(estimatedScore);
    } catch (error) {
      console.error('スコア計算エラー:', error);
      return 500;
    }
  },
  
  /**
   * 今週の正答率を計算
   * @returns {number|null} 正答率（%）またはnull（データなし）
   */
  calculateWeeklyAccuracy() {
    try {
      const progress = JSON.parse(localStorage.getItem('progress') || '{}');
      const reviewHistory = JSON.parse(localStorage.getItem('reviewHistory') || '[]');
      
      const now = Date.now();
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
      
      let totalCorrect = 0;
      let totalQuestions = 0;
      
      // 通常テストから
      if (progress.tests) {
        Object.values(progress.tests).forEach(test => {
          if (test.timestamp && test.timestamp >= oneWeekAgo) {
            totalCorrect += test.score || 0;
            totalQuestions += test.totalQuestions || 30;
          }
        });
      }
      
      // 復習から
      reviewHistory.forEach(review => {
        if (review.timestamp && review.timestamp >= oneWeekAgo) {
          totalCorrect += review.score || 0;
          totalQuestions += review.totalQuestions || 0;
        }
      });
      
      if (totalQuestions === 0) return null;
      
      const accuracy = (totalCorrect / totalQuestions) * 100;
      return Math.round(accuracy);
    } catch (error) {
      console.error('正答率計算エラー:', error);
      return null;
    }
  },
  
  /**
   * 数値アニメーション
   * @param {HTMLElement} element - 対象要素
   * @param {number} start - 開始値
   * @param {number} end - 終了値
   * @param {number} duration - アニメーション時間（ミリ秒）
   * @param {string} suffix - 接尾辞（デフォルト: ''）
   */
  animateValue(element, start, end, duration, suffix = '') {
    if (start === end) return;
    
    const range = end - start;
    const increment = range / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      
      element.textContent = Math.round(current) + suffix;
    }, 16);
  },
  
  /**
   * 詳細コンテンツエリアに既存のカードを移動
   */
  moveDetailedContent() {
    const detailedArea = document.getElementById('detailedContentArea');
    if (!detailedArea) return;
    
    try {
      // 移動対象のIDリスト
      const itemsToMove = [
        'latestScorePrediction',
        'testSetsGrid',
        'nextActionCard',
        'streakCard',
        'dailyMissionsCard',
        'personalizedDashboard',
        'unifiedReviewHub',
        'growthDashboard'
      ];
      
      itemsToMove.forEach(id => {
        const element = document.getElementById(id);
        if (element && element.parentNode) {
          // 表示状態を確認して移動
          if (element.style.display !== 'none' || id === 'personalizedDashboard') {
            detailedArea.appendChild(element);
          }
        }
      });
      
      console.log('📦 詳細コンテンツを折りたたみエリアに移動完了');
    } catch (error) {
      console.error('❌ コンテンツ移動エラー:', error);
    }
  },
  
  /**
   * 初期化
   */
  init() {
    console.log('🎯 ホームサマリーシステム初期化');
    
    // 初回更新
    setTimeout(() => {
      this.updateSummary();
    }, 500);
    
    // 詳細コンテンツを移動
    setTimeout(() => {
      this.moveDetailedContent();
    }, 1000);
    
    // 定期更新（30秒ごと）
    setInterval(() => {
      this.updateSummary();
    }, 30000);
    
    console.log('✅ ホームサマリーシステム初期化完了');
  }
};

// グローバルに公開
window.HomeSummary = HomeSummary;

// DOMContentLoaded時に初期化
window.addEventListener('DOMContentLoaded', () => {
  HomeSummary.init();
});

console.log('✅ HomeSummary module loaded');
