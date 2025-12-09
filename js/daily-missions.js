// TOEIC PART5 学習サポート - デイリーミッションシステム
// 毎日の学習目標を設定し、モチベーションを維持

const DailyMissions = {
  STORAGE_KEY: 'toeic_daily_missions',
  
  // ミッション定義
  missions: [
    {
      id: 'test_complete',
      title: '1回テストを完了する',
      description: '30問のテストを最後まで解く',
      icon: '📝',
      target: 1,
      reward: 10,
      category: 'basic'
    },
    {
      id: 'high_accuracy',
      title: '正答率80%以上を達成',
      description: 'テストで24問以上正解する',
      icon: '🎯',
      target: 1,
      reward: 15,
      category: 'performance'
    },
    {
      id: 'perfect_score',
      title: '満点を獲得',
      description: 'テストで全問正解する',
      icon: '🏆',
      target: 1,
      reward: 30,
      category: 'excellence'
    },
    {
      id: 'review_5_questions',
      title: '復習5問クリア',
      description: '間違えた問題を5問復習する',
      icon: '📚',
      target: 5,
      reward: 10,
      category: 'review'
    },
    {
      id: 'quick_completion',
      title: 'スピードクリア',
      description: 'テストを10分以内に完了',
      icon: '⚡',
      target: 1,
      reward: 15,
      category: 'speed'
    },
    {
      id: 'login',
      title: 'ログインボーナス',
      description: '今日アプリを開く（自動達成）',
      icon: '🎁',
      target: 1,
      reward: 5,
      category: 'daily',
      autoComplete: true
    }
  ],
  
  // 今日の日付を取得
  getTodayString: function() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },
  
  // デイリーミッションデータを取得
  getMissionsData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        date: null,
        missions: {},
        totalPoints: 0,
        history: []
      };
    }
    return JSON.parse(data);
  },
  
  // データを保存
  saveMissionsData: function(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 今日のミッションをリセット（日付が変わった場合）
  checkAndResetDaily: function() {
    const today = this.getTodayString();
    const data = this.getMissionsData();
    
    if (data.date !== today) {
      console.log('📅 新しい日のミッションを開始！');
      
      // 前日のデータを履歴に保存
      if (data.date) {
        const completedCount = Object.values(data.missions).filter(m => m.completed).length;
        const totalReward = Object.values(data.missions)
          .filter(m => m.completed)
          .reduce((sum, m) => sum + (this.missions.find(mission => mission.id === m.id)?.reward || 0), 0);
        
        data.history.push({
          date: data.date,
          completedCount: completedCount,
          totalReward: totalReward,
          missions: { ...data.missions }
        });
        
        // 履歴は最大30日分保持
        if (data.history.length > 30) {
          data.history = data.history.slice(-30);
        }
      }
      
      // 新しい日のミッションを初期化
      data.date = today;
      data.missions = {};
      
      // すべてのミッションを未完了状態でリセット
      this.missions.forEach(mission => {
        data.missions[mission.id] = {
          id: mission.id,
          progress: 0,
          completed: false,
          rewarded: false
        };
      });
      
      this.saveMissionsData(data);
      
      // ログインボーナスを自動達成
      this.completeMission('login');
    }
    
    return data;
  },
  
  // ミッションの進捗を更新
  updateProgress: function(missionId, increment = 1) {
    const data = this.checkAndResetDaily();
    const mission = this.missions.find(m => m.id === missionId);
    
    if (!mission || !data.missions[missionId]) {
      console.warn(`❌ ミッション ${missionId} が見つかりません`);
      return;
    }
    
    const missionData = data.missions[missionId];
    
    // すでに完了している場合はスキップ
    if (missionData.completed) {
      return;
    }
    
    // 進捗を更新
    missionData.progress = Math.min(missionData.progress + increment, mission.target);
    
    // 目標達成チェック
    if (missionData.progress >= mission.target) {
      missionData.completed = true;
      console.log(`✅ ミッション達成！ ${mission.title}`);
      
      // 報酬を付与
      if (!missionData.rewarded) {
        // VIPボーナスを適用
        let finalReward = mission.reward;
        const vipBonus = this.getVIPBonus();
        if (vipBonus > 1.0) {
          finalReward = Math.floor(mission.reward * vipBonus);
          console.log(`💍 VIPボーナス適用: ${mission.reward}pt × ${vipBonus} = ${finalReward}pt`);
        }
        
        data.totalPoints += finalReward;
        missionData.rewarded = true;
        console.log(`🎁 報酬 +${finalReward}pt (合計: ${data.totalPoints}pt)`);
        
        // ミッション達成の通知
        this.showMissionComplete(mission, finalReward);
        
        // 実績システムにポイント獲得を通知（NEW! 2025-12-09）
        if (typeof AchievementIntegration !== 'undefined' && typeof AchievementIntegration.onPointsEarned === 'function') {
          AchievementIntegration.onPointsEarned(data.totalPoints);
        }
      }
    }
    
    this.saveMissionsData(data);
    return missionData;
  },
  
  // ミッションを完了
  completeMission: function(missionId) {
    const mission = this.missions.find(m => m.id === missionId);
    if (mission) {
      this.updateProgress(missionId, mission.target);
    }
  },
  
  // ミッション達成の通知
  showMissionComplete: function(mission, finalReward) {
    // finalRewardが指定されていない場合はmission.rewardを使用
    const reward = finalReward !== undefined ? finalReward : mission.reward;
    const vipBonus = this.getVIPBonus();
    const bonusText = vipBonus > 1.0 ? ` (VIP×${vipBonus})💍` : '';
    
    // 秘書に通知
    if (typeof Secretary !== 'undefined' && Secretary.showMessage) {
      Secretary.showMessage(
        `ミッション達成！「${mission.title}」\n+${reward}ポイント獲得！${bonusText}`,
        'celebration',
        4000
      );
    }
    
    // UIを更新
    if (typeof updateDailyMissionsDisplay === 'function') {
      updateDailyMissionsDisplay();
    }
    
    // ポイントバッジを更新
    if (typeof updatePointsBadge === 'function') {
      updatePointsBadge();
    }
  },
  
  // 今日のミッション一覧を取得
  getTodayMissions: function() {
    const data = this.checkAndResetDaily();
    
    return this.missions.map(mission => {
      const missionData = data.missions[mission.id] || {
        id: mission.id,
        progress: 0,
        completed: false,
        rewarded: false
      };
      
      return {
        ...mission,
        progress: missionData.progress,
        completed: missionData.completed,
        rewarded: missionData.rewarded,
        progressPercentage: Math.round((missionData.progress / mission.target) * 100)
      };
    });
  },
  
  // ミッション統計を取得
  getMissionStats: function() {
    const data = this.checkAndResetDaily();
    const todayMissions = this.getTodayMissions();
    
    const completedCount = todayMissions.filter(m => m.completed).length;
    const totalCount = todayMissions.length;
    const todayPoints = todayMissions
      .filter(m => m.completed)
      .reduce((sum, m) => sum + m.reward, 0);
    
    return {
      completedCount: completedCount,
      totalCount: totalCount,
      completionRate: Math.round((completedCount / totalCount) * 100),
      todayPoints: todayPoints,
      totalPoints: data.totalPoints,
      history: data.history
    };
  },
  
  // 週間統計を取得
  getWeeklyStats: function() {
    const data = this.getMissionsData();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekHistory = data.history.filter(h => {
      const date = new Date(h.date);
      return date >= weekAgo;
    });
    
    const totalCompleted = weekHistory.reduce((sum, h) => sum + h.completedCount, 0);
    const totalReward = weekHistory.reduce((sum, h) => sum + h.totalReward, 0);
    
    return {
      daysActive: weekHistory.length,
      totalCompleted: totalCompleted,
      totalReward: totalReward,
      averagePerDay: weekHistory.length > 0 ? (totalCompleted / weekHistory.length).toFixed(1) : 0
    };
  },
  
  // テスト完了時の処理
  onTestComplete: function(score, totalQuestions, timeInSeconds) {
    // テスト完了ミッション
    this.updateProgress('test_complete', 1);
    
    // 高正答率ミッション（80%以上）
    const accuracy = score / totalQuestions;
    if (accuracy >= 0.8) {
      this.completeMission('high_accuracy');
    }
    
    // 満点ミッション
    if (score === totalQuestions) {
      this.completeMission('perfect_score');
    }
    
    // スピードクリアミッション（10分以内）
    if (timeInSeconds <= 600) {
      this.completeMission('quick_completion');
    }
  },
  
  // 復習完了時の処理
  onReviewComplete: function(count = 1) {
    this.updateProgress('review_5_questions', count);
  },
  
  // VIPボーナスを取得（Phase E: 約束リング連動）
  getVIPBonus: function() {
    try {
      const ringStatus = JSON.parse(localStorage.getItem('secretary_promise_ring') || 'null');
      if (ringStatus && ringStatus.activated && ringStatus.bonuses && ringStatus.bonuses.pointBonus) {
        return ringStatus.bonuses.pointBonus; // 1.1 (10%ボーナス)
      }
    } catch (e) {
      console.error('VIPボーナス取得エラー:', e);
    }
    return 1.0; // デフォルト(ボーナスなし)
  },
  
  // 総ポイント数を取得（Phase E: リワードシステム用）
  getTotalPoints: function() {
    const data = this.getMissionsData();
    return data.totalPoints || 0;
  },
  
  // ポイントを消費（Phase E: リワードシステム用）
  spendPoints: function(amount) {
    const data = this.getMissionsData();
    if (data.totalPoints < amount) {
      return false; // ポイント不足
    }
    data.totalPoints -= amount;
    this.saveMissionsData(data);
    
    // ポイントバッジを更新
    if (typeof updatePointsBadge === 'function') {
      updatePointsBadge();
    }
    
    console.log(`💰 ポイント消費: -${amount}pt (残り: ${data.totalPoints}pt)`);
    return true;
  },
  
  // 初期化
  init: function() {
    console.log('🎯 デイリーミッションシステム初期化中...');
    
    // VIPステータス確認
    const vipBonus = this.getVIPBonus();
    if (vipBonus > 1.0) {
      console.log(`💍 VIPボーナス有効: ポイント×${vipBonus}`);
    }
    
    // 日付チェックとリセット
    this.checkAndResetDaily();
    
    const stats = this.getMissionStats();
    console.log(`  今日の達成: ${stats.completedCount}/${stats.totalCount}`);
    console.log(`  今日のポイント: ${stats.todayPoints}pt`);
    console.log(`  累計ポイント: ${stats.totalPoints}pt`);
  }
};

// グローバルにエクスポート
window.DailyMissions = DailyMissions;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    DailyMissions.init();
  });
} else {
  DailyMissions.init();
}
