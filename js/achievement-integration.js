/**
 * 実績システム統合モジュール (Achievement System Integration Module)
 * 
 * 目的: 既存システムと実績システムを連携
 * 
 * 統合ポイント:
 * 1. テスト完了時 - app.js finishTest()
 * 2. 学習記録時 - AdaptiveLearningEngine
 * 3. ポイント獲得時 - secretary-team.js, daily-missions.js
 * 4. ストリーク記録時 - streak-system.js
 * 5. 復習完了時 - review-system.js
 * 
 * @version 1.0.0
 * @date 2025-12-09
 */

class AchievementIntegration {
  constructor() {
    this.achievementSystem = null;
    this.achievementUI = null;
    this.initialized = false;
    
    console.log('[AchievementIntegration] モジュール初期化');
  }
  
  /**
   * 初期化
   */
  async initialize() {
    if (this.initialized) {
      console.log('[AchievementIntegration] 既に初期化済み');
      return;
    }
    
    // AchievementSystemとAchievementUIの読み込みを待つ
    await this.waitForDependencies();
    
    this.achievementSystem = window.AchievementSystem;
    this.achievementUI = window.AchievementUI;
    
    if (!this.achievementSystem || !this.achievementUI) {
      console.error('[AchievementIntegration] 依存モジュールが見つかりません');
      return;
    }
    
    this.initialized = true;
    console.log('[AchievementIntegration] 初期化完了');
  }
  
  /**
   * 依存モジュールの読み込み完了を待つ
   */
  async waitForDependencies() {
    const maxWaitTime = 10000; // 最大10秒待機
    const checkInterval = 100; // 100msごとにチェック
    let waited = 0;
    
    while (!window.AchievementSystem || !window.AchievementUI) {
      if (waited >= maxWaitTime) {
        console.error('[AchievementIntegration] 依存モジュールの読み込みタイムアウト');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waited += checkInterval;
    }
  }
  
  /**
   * テスト完了時の実績チェック
   * @param {Object} testResult - テスト結果データ
   */
  async onTestComplete(testResult) {
    if (!this.initialized) {
      console.warn('[AchievementIntegration] 未初期化状態でonTestComplete呼び出し');
      await this.initialize();
    }
    
    if (!this.achievementSystem) {
      console.error('[AchievementIntegration] AchievementSystemが利用できません');
      return;
    }
    
    const {
      score,           // 正答数
      accuracy,        // 正答率（小数）
      totalQuestions,  // 総問題数
      timeInSeconds,   // 所要時間（秒）
      questionsResults // 問題ごとの結果
    } = testResult;
    
    console.log(`[AchievementIntegration] テスト完了:`, {
      score,
      accuracy: `${(accuracy * 100).toFixed(1)}%`,
      totalQuestions,
      timeInSeconds
    });
    
    // 1. テスト完了回数
    const testCount = this.achievementSystem.incrementProgress('test_complete_1');
    this.achievementSystem.incrementProgress('test_complete_10');
    this.achievementSystem.incrementProgress('test_complete_50');
    this.achievementSystem.incrementProgress('test_complete_100');
    this.achievementSystem.incrementProgress('test_complete_500');
    
    // 2. 正答率ベースの実績
    const accuracyPercent = Math.round(accuracy * 100);
    if (accuracyPercent >= 100) {
      this.achievementSystem.unlockAchievement('perfect_score');
    }
    if (accuracyPercent >= 90) {
      this.achievementSystem.incrementProgress('high_score_10');
    }
    if (accuracyPercent >= 95) {
      this.achievementSystem.incrementProgress('excellent_score_5');
    }
    
    // 3. 速答実績（30問を10分以内）
    if (totalQuestions === 30 && timeInSeconds <= 600) {
      this.achievementSystem.incrementProgress('speed_master_3');
      this.achievementSystem.incrementProgress('speed_master_10');
    }
    
    // 4. カテゴリ別実績（問題結果から集計）
    if (questionsResults && Array.isArray(questionsResults)) {
      this.checkCategoryAchievements(questionsResults);
    }
    
    // 5. 総問題数の実績
    const totalAnswered = this.achievementSystem.incrementProgress('total_questions_100');
    this.achievementSystem.incrementProgress('total_questions_500');
    this.achievementSystem.incrementProgress('total_questions_1000');
    this.achievementSystem.incrementProgress('total_questions_3000');
    this.achievementSystem.incrementProgress('total_questions_5000');
    
    // 6. 新しくアンロックされた実績を表示
    await this.checkAndShowNewAchievements();
  }
  
  /**
   * カテゴリ別実績のチェック
   * @param {Array} questionsResults - 問題結果の配列
   */
  checkCategoryAchievements(questionsResults) {
    // カテゴリ別の正答数をカウント
    const categoryCorrect = {};
    
    questionsResults.forEach(result => {
      if (result.isCorrect && result.category) {
        const category = result.category;
        categoryCorrect[category] = (categoryCorrect[category] || 0) + 1;
      }
    });
    
    // 各カテゴリで5問以上正解していたら実績カウント
    Object.entries(categoryCorrect).forEach(([category, count]) => {
      if (count >= 5) {
        // カテゴリ名から実績IDを生成
        const achievementId = this.getCategoryAchievementId(category);
        if (achievementId) {
          this.achievementSystem.incrementProgress(achievementId);
        }
      }
    });
  }
  
  /**
   * カテゴリ名から実績IDを取得
   * @param {string} category - カテゴリ名
   * @returns {string|null} - 実績ID
   */
  getCategoryAchievementId(category) {
    const categoryMap = {
      '品詞': 'category_parts_of_speech',
      '動詞': 'category_verb',
      '前置詞': 'category_preposition',
      '接続詞': 'category_conjunction',
      '関係詞': 'category_relative',
      '語彙': 'category_vocabulary',
      '比較': 'category_comparison',
      '仮定法': 'category_subjunctive'
    };
    
    return categoryMap[category] || null;
  }
  
  /**
   * 学習セッション記録時の実績チェック
   * @param {Object} sessionData - セッションデータ
   */
  async onLearningSessionRecorded(sessionData) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.achievementSystem) return;
    
    const { totalStudyTime } = sessionData;
    
    // 累計学習時間の実績
    if (totalStudyTime) {
      const hours = Math.floor(totalStudyTime / 3600);
      
      if (hours >= 1) {
        this.achievementSystem.checkAchievement('study_time_1h');
      }
      if (hours >= 10) {
        this.achievementSystem.checkAchievement('study_time_10h');
      }
      if (hours >= 50) {
        this.achievementSystem.checkAchievement('study_time_50h');
      }
      if (hours >= 100) {
        this.achievementSystem.checkAchievement('study_time_100h');
      }
    }
    
    await this.checkAndShowNewAchievements();
  }
  
  /**
   * ポイント獲得時の実績チェック
   * @param {number} totalPoints - 累計ポイント
   */
  async onPointsEarned(totalPoints) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.achievementSystem) return;
    
    // ポイント累計実績
    if (totalPoints >= 100) {
      this.achievementSystem.checkAchievement('points_100');
    }
    if (totalPoints >= 500) {
      this.achievementSystem.checkAchievement('points_500');
    }
    if (totalPoints >= 1000) {
      this.achievementSystem.checkAchievement('points_1000');
    }
    if (totalPoints >= 3000) {
      this.achievementSystem.checkAchievement('points_3000');
    }
    
    await this.checkAndShowNewAchievements();
  }
  
  /**
   * ストリーク更新時の実績チェック
   * @param {number} currentStreak - 現在のストリーク
   * @param {number} longestStreak - 最長ストリーク
   */
  async onStreakUpdated(currentStreak, longestStreak) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.achievementSystem) return;
    
    // 連続学習日数の実績
    if (currentStreak >= 3) {
      this.achievementSystem.checkAchievement('streak_3');
    }
    if (currentStreak >= 7) {
      this.achievementSystem.checkAchievement('streak_7');
    }
    if (currentStreak >= 14) {
      this.achievementSystem.checkAchievement('streak_14');
    }
    if (currentStreak >= 30) {
      this.achievementSystem.checkAchievement('streak_30');
    }
    if (currentStreak >= 100) {
      this.achievementSystem.checkAchievement('streak_100');
    }
    
    await this.checkAndShowNewAchievements();
  }
  
  /**
   * 復習完了時の実績チェック
   * @param {number} reviewCount - 復習完了回数
   */
  async onReviewComplete(reviewCount) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.achievementSystem) return;
    
    // 復習回数の実績
    this.achievementSystem.incrementProgress('review_10');
    this.achievementSystem.incrementProgress('review_50');
    this.achievementSystem.incrementProgress('review_100');
    
    await this.checkAndShowNewAchievements();
  }
  
  /**
   * 秘書アンロック時の実績チェック
   * @param {number} unlockedCount - アンロック済み秘書数
   */
  async onSecretaryUnlocked(unlockedCount) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.achievementSystem) return;
    
    // 秘書アンロック実績
    if (unlockedCount >= 5) {
      this.achievementSystem.checkAchievement('secretary_5');
    }
    if (unlockedCount >= 10) {
      this.achievementSystem.checkAchievement('secretary_10');
    }
    if (unlockedCount >= 15) {
      this.achievementSystem.checkAchievement('secretary_15');
    }
    
    await this.checkAndShowNewAchievements();
  }
  
  /**
   * 早朝学習の実績チェック（朝6-8時）
   */
  async checkMorningStudy() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    if (!this.achievementSystem) return;
    
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 8) {
      this.achievementSystem.incrementProgress('morning_study_7');
      await this.checkAndShowNewAchievements();
    }
  }
  
  /**
   * 新しくアンロックされた実績を確認して表示
   */
  async checkAndShowNewAchievements() {
    if (!this.achievementUI) return;
    
    const newAchievements = this.achievementSystem.getNewlyUnlocked();
    
    if (newAchievements.length > 0) {
      console.log(`[AchievementIntegration] 新規アンロック: ${newAchievements.length}件`);
      
      // 連続して表示（0.5秒間隔）
      for (let i = 0; i < newAchievements.length; i++) {
        await new Promise(resolve => setTimeout(resolve, i * 500));
        this.achievementUI.showUnlockAnimation(newAchievements[i].id);
      }
      
      // 表示済みにマーク
      this.achievementSystem.markAchievementsAsShown(newAchievements.map(a => a.id));
    }
  }
  
  /**
   * 実績リスト画面を開く
   */
  openAchievementList() {
    if (!this.achievementUI) {
      console.error('[AchievementIntegration] AchievementUIが利用できません');
      return;
    }
    
    this.achievementUI.showAchievementList();
  }
}

// グローバルインスタンスを作成
window.AchievementIntegration = new AchievementIntegration();

console.log('[AchievementIntegration] モジュール読み込み完了');
