/**
 * スペースドリピティション（間隔反復）システム
 * エビングハウスの忘却曲線理論に基づいた復習スケジューリング
 */

class SpacedRepetitionSystem {
  constructor() {
    this.STORAGE_KEY = 'spacedRepetition_schedule';
    
    // 復習間隔の定義（日数）
    this.REVIEW_INTERVALS = {
      0: 1,      // 1日後
      1: 3,      // 3日後
      2: 7,      // 7日後
      3: 14,     // 14日後
      4: 30,     // 30日後
      5: 60      // 60日後（完全マスター）
    };
    
    // 復習レベルの最大値
    this.MAX_LEVEL = 5;
    
    this.schedule = this.loadSchedule();
    console.log('📅 スペースドリピティションシステム初期化中...');
    this.logStatistics();
  }
  
  /**
   * スケジュールデータの読み込み
   */
  loadSchedule() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('スケジュールデータの読み込みエラー:', error);
      return {};
    }
  }
  
  /**
   * スケジュールデータの保存
   */
  saveSchedule() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.schedule));
    } catch (error) {
      console.error('スケジュールデータの保存エラー:', error);
    }
  }
  
  /**
   * 問題の学習記録を追加
   * @param {string} questionId - 問題ID
   * @param {boolean} isCorrect - 正解したかどうか
   */
  recordReview(questionId, isCorrect) {
    const now = Date.now();
    
    // 既存のスケジュールを取得または新規作成
    if (!this.schedule[questionId]) {
      this.schedule[questionId] = {
        level: 0,
        lastReviewDate: null,
        lastCorrectDate: null,
        nextReviewDate: null,
        reviewHistory: [],
        retentionRate: 100,
        forgettingRisk: 0
      };
    }
    
    const item = this.schedule[questionId];
    
    // 復習履歴に追加
    item.reviewHistory.push({
      date: now,
      isCorrect: isCorrect
    });
    
    // 最終復習日を更新
    item.lastReviewDate = now;
    
    if (isCorrect) {
      // 正解の場合：レベルアップして次の復習日を設定
      item.lastCorrectDate = now;
      item.level = Math.min(item.level + 1, this.MAX_LEVEL);
      item.retentionRate = 100;
      item.forgettingRisk = 0;
      
      // 次の復習日を計算
      const intervalDays = this.REVIEW_INTERVALS[item.level];
      item.nextReviewDate = now + (intervalDays * 24 * 60 * 60 * 1000);
      
    } else {
      // 不正解の場合：レベルをリセット
      item.level = 0;
      item.retentionRate = 50; // 記憶が曖昧
      item.forgettingRisk = 80; // 高リスク
      
      // すぐに復習が必要
      item.nextReviewDate = now + (1 * 24 * 60 * 60 * 1000); // 1日後
    }
    
    this.saveSchedule();
  }
  
  /**
   * 記憶定着率を計算（エビングハウスの忘却曲線）
   * @param {number} daysSinceReview - 最後の復習からの経過日数
   * @param {number} reviewLevel - 復習レベル（0-5）
   * @returns {number} 記憶定着率（0-100%）
   */
  calculateRetentionRate(daysSinceReview, reviewLevel) {
    // 復習レベルが高いほど忘却が遅くなる
    const decayRate = 1.84 / (reviewLevel + 1);
    const retention = 100 / (1 + decayRate * Math.log(daysSinceReview + 1));
    return Math.max(0, Math.min(100, retention));
  }
  
  /**
   * 忘却リスクを計算
   * @param {number} retentionRate - 記憶定着率
   * @param {number} wrongCount - 間違い回数
   * @returns {number} 忘却リスクスコア（0-100）
   */
  calculateForgettingRisk(retentionRate, wrongCount) {
    const baseRisk = 100 - retentionRate;
    const wrongPenalty = Math.min(wrongCount * 10, 50);
    return Math.min(100, baseRisk + wrongPenalty);
  }
  
  /**
   * 現在の記憶定着率と忘却リスクを更新
   * @param {string} questionId - 問題ID
   * @param {number} wrongCount - 間違い回数
   */
  updateRetentionMetrics(questionId, wrongCount = 0) {
    const item = this.schedule[questionId];
    if (!item || !item.lastCorrectDate) return;
    
    const now = Date.now();
    const daysSinceReview = (now - item.lastCorrectDate) / (24 * 60 * 60 * 1000);
    
    item.retentionRate = this.calculateRetentionRate(daysSinceReview, item.level);
    item.forgettingRisk = this.calculateForgettingRisk(item.retentionRate, wrongCount);
    
    this.saveSchedule();
  }
  
  /**
   * 今日復習すべき問題を取得
   * @returns {Array<string>} 問題IDの配列
   */
  getDueQuestions() {
    const now = Date.now();
    const dueQuestions = [];
    
    for (const [questionId, item] of Object.entries(this.schedule)) {
      if (item.nextReviewDate && item.nextReviewDate <= now) {
        dueQuestions.push(questionId);
      }
    }
    
    return dueQuestions;
  }
  
  /**
   * 優先度付き復習リストを取得
   * @param {Array} wrongAnswers - ReviewSystemからの間違い問題リスト
   * @returns {Array} 優先度順にソートされた問題リスト
   */
  getPrioritizedReviewList(wrongAnswers) {
    const now = Date.now();
    
    // 各問題に優先度スコアを計算
    const prioritizedList = wrongAnswers.map(question => {
      const schedule = this.schedule[question.id];
      let priorityScore = 0;
      
      // 1. 復習期限が来ている問題は最優先
      if (schedule && schedule.nextReviewDate && schedule.nextReviewDate <= now) {
        priorityScore += 1000;
        const overdueDays = (now - schedule.nextReviewDate) / (24 * 60 * 60 * 1000);
        priorityScore += overdueDays * 10;
      }
      
      // 2. 間違い回数が多い問題を優先
      priorityScore += question.wrongCount * 50;
      
      // 3. 最近間違えた問題を優先
      const daysSinceWrong = (now - question.lastWrongDate) / (24 * 60 * 60 * 1000);
      if (daysSinceWrong < 1) priorityScore += 100;
      else if (daysSinceWrong < 3) priorityScore += 50;
      
      // 4. 忘却リスクが高い問題を優先
      if (schedule) {
        this.updateRetentionMetrics(question.id, question.wrongCount);
        priorityScore += schedule.forgettingRisk;
      }
      
      // 5. 復習レベルが低い問題を優先（まだ定着していない）
      if (schedule) {
        priorityScore += (this.MAX_LEVEL - schedule.level) * 20;
      } else {
        priorityScore += 100; // 未学習の問題
      }
      
      return {
        ...question,
        priorityScore: Math.round(priorityScore),
        scheduleInfo: schedule || null
      };
    });
    
    // 優先度スコアの降順でソート
    return prioritizedList.sort((a, b) => b.priorityScore - a.priorityScore);
  }
  
  /**
   * 次の復習日までの残り日数を取得
   * @param {string} questionId - 問題ID
   * @returns {number|null} 残り日数（負の値は期限切れ）
   */
  getDaysUntilNextReview(questionId) {
    const item = this.schedule[questionId];
    if (!item || !item.nextReviewDate) return null;
    
    const now = Date.now();
    const daysRemaining = (item.nextReviewDate - now) / (24 * 60 * 60 * 1000);
    return Math.ceil(daysRemaining);
  }
  
  /**
   * 復習進捗の統計を取得
   * @returns {Object} 統計情報
   */
  getStatistics() {
    const now = Date.now();
    const stats = {
      totalQuestions: Object.keys(this.schedule).length,
      dueToday: 0,
      overdue: 0,
      upcoming: 0,
      mastered: 0, // レベル5の問題
      levelDistribution: {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      },
      averageRetention: 0,
      highRiskCount: 0 // 忘却リスク70%以上
    };
    
    let totalRetention = 0;
    
    for (const item of Object.values(this.schedule)) {
      // レベル分布
      stats.levelDistribution[item.level]++;
      
      // マスター済み
      if (item.level === this.MAX_LEVEL) {
        stats.mastered++;
      }
      
      // 復習期限
      if (item.nextReviewDate) {
        const daysUntil = (item.nextReviewDate - now) / (24 * 60 * 60 * 1000);
        if (daysUntil <= 0) {
          stats.overdue++;
          stats.dueToday++;
        } else if (daysUntil <= 1) {
          stats.dueToday++;
        } else {
          stats.upcoming++;
        }
      }
      
      // 記憶定着率
      totalRetention += item.retentionRate;
      
      // 高リスク問題
      if (item.forgettingRisk >= 70) {
        stats.highRiskCount++;
      }
    }
    
    if (stats.totalQuestions > 0) {
      stats.averageRetention = Math.round(totalRetention / stats.totalQuestions);
    }
    
    return stats;
  }
  
  /**
   * 統計情報をコンソールに出力
   */
  logStatistics() {
    const stats = this.getStatistics();
    console.log(`  登録問題数: ${stats.totalQuestions}問`);
    console.log(`  今日の復習: ${stats.dueToday}問`);
    console.log(`  期限切れ: ${stats.overdue}問`);
    console.log(`  今後の予定: ${stats.upcoming}問`);
    console.log(`  完全マスター: ${stats.mastered}問`);
    console.log(`  平均記憶定着率: ${stats.averageRetention}%`);
    console.log(`  高リスク問題: ${stats.highRiskCount}問`);
  }
  
  /**
   * 問題のスケジュール情報を取得
   * @param {string} questionId - 問題ID
   * @returns {Object|null} スケジュール情報
   */
  getScheduleInfo(questionId) {
    return this.schedule[questionId] || null;
  }
  
  /**
   * 復習レベルのラベルを取得
   * @param {number} level - 復習レベル（0-5）
   * @returns {string} レベルラベル
   */
  getLevelLabel(level) {
    const labels = {
      0: '🆕 新規',
      1: '📝 初級',
      2: '📚 中級',
      3: '🎯 上級',
      4: '⭐ エキスパート',
      5: '👑 マスター'
    };
    return labels[level] || '❓ 不明';
  }
  
  /**
   * 次の復習日の表示テキストを取得
   * @param {string} questionId - 問題ID
   * @returns {string} 表示テキスト
   */
  getNextReviewText(questionId) {
    const days = this.getDaysUntilNextReview(questionId);
    if (days === null) return '未設定';
    
    if (days < 0) {
      return `⚠️ ${Math.abs(days)}日遅れ`;
    } else if (days === 0) {
      return '🔔 今日';
    } else if (days === 1) {
      return '📅 明日';
    } else if (days <= 7) {
      return `📅 ${days}日後`;
    } else if (days <= 30) {
      const weeks = Math.ceil(days / 7);
      return `📅 約${weeks}週間後`;
    } else {
      const months = Math.ceil(days / 30);
      return `📅 約${months}ヶ月後`;
    }
  }
  
  /**
   * データのリセット
   */
  reset() {
    this.schedule = {};
    this.saveSchedule();
    console.log('📅 スペースドリピティションデータをリセットしました');
  }
}

// グローバルインスタンスの作成
const SpacedRepetition = new SpacedRepetitionSystem();

// グローバルに公開
if (typeof window !== 'undefined') {
  window.SpacedRepetition = SpacedRepetition;
}
