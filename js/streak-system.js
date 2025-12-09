// TOEIC PART5 学習サポート - 学習ストリーク（連続日数）システム
// 学習の継続をサポートし、モチベーションを維持

const StreakSystem = {
  STORAGE_KEY: 'toeic_streak_data',
  
  // ストリークデータを取得
  getStreakData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        totalStudyDays: 0,
        totalStudyTime: 0,        // 総勉強時間（秒）
        studyHistory: [],         // 学習した日付の配列
        studyTimeHistory: {}      // 日付ごとの勉強時間 { 'YYYY-MM-DD': seconds }
      };
    }
    return JSON.parse(data);
  },
  
  // ストリークデータを保存
  saveStreakData: function(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 今日の日付を取得（YYYY-MM-DD形式）
  getTodayString: function() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  },
  
  // 昨日の日付を取得（YYYY-MM-DD形式）
  getYesterdayString: function() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  },
  
  // 学習記録を更新（勉強時間も記録）
  recordStudy: function(studyTimeInSeconds = 0) {
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();
    const data = this.getStreakData();
    
    // 勉強時間を加算（今日が初めてでも、2回目以降でも累積）
    if (studyTimeInSeconds > 0) {
      data.totalStudyTime = (data.totalStudyTime || 0) + studyTimeInSeconds;
      
      // 日付ごとの勉強時間記録
      if (!data.studyTimeHistory) {
        data.studyTimeHistory = {};
      }
      data.studyTimeHistory[today] = (data.studyTimeHistory[today] || 0) + studyTimeInSeconds;
      
      console.log(`⏱️ 勉強時間を記録: +${studyTimeInSeconds}秒 (今日の合計: ${data.studyTimeHistory[today]}秒)`);
    }
    
    // 今日すでに記録済みの場合は時間だけ加算して終了
    if (data.lastStudyDate === today) {
      this.saveStreakData(data);
      console.log('🔥 今日はすでに学習記録済みです（勉強時間のみ更新）');
      return data;
    }
    
    // 昨日学習していた場合、ストリーク継続
    if (data.lastStudyDate === yesterday) {
      data.currentStreak++;
      console.log(`🔥 ストリーク継続！ ${data.currentStreak}日連続！`);
    } 
    // 昨日学習していなかった場合、ストリークリセット
    else if (data.lastStudyDate !== null && data.lastStudyDate !== today) {
      console.log(`💔 ストリークが途切れました... 再スタート！`);
      data.currentStreak = 1;
    }
    // 初めての学習
    else {
      data.currentStreak = 1;
      console.log(`🎉 学習スタート！ストリーク開始！`);
    }
    
    // 最長ストリークを更新
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
      console.log(`🏆 最長ストリーク更新！ ${data.longestStreak}日！`);
    }
    
    // 学習履歴に追加
    if (!data.studyHistory.includes(today)) {
      data.studyHistory.push(today);
      data.totalStudyDays++;
    }
    
    // 最終学習日を更新
    data.lastStudyDate = today;
    
    // 保存
    this.saveStreakData(data);
    
    // ストリーク達成の通知
    this.checkStreakMilestone(data.currentStreak);
    
    // 実績システムにストリーク更新を通知（NEW! 2025-12-09）
    if (typeof AchievementIntegration !== 'undefined' && typeof AchievementIntegration.onStreakUpdated === 'function') {
      AchievementIntegration.onStreakUpdated(data.currentStreak, data.longestStreak);
    }
    
    // 💰 7日連続学習達成時にPremium提案（NEW! 2025-12-09）
    if (data.currentStreak === 7 && window.monetizationSystem) {
      setTimeout(() => {
        window.monetizationSystem.showPurchasePrompt('STREAK_7');
      }, 3000);
    }
    
    return data;
  },
  
  // ストリーク状態をチェック
  checkStreakStatus: function() {
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();
    const data = this.getStreakData();
    
    // 今日学習していない場合
    if (data.lastStudyDate !== today) {
      // 昨日も学習していない場合、ストリークは途切れている
      if (data.lastStudyDate !== yesterday) {
        return {
          status: 'broken',
          currentStreak: 0,
          longestStreak: data.longestStreak,
          message: 'ストリークが途切れています。今日から再スタートしましょう！'
        };
      }
      // 昨日まで学習していた場合、今日学習すればストリーク継続
      return {
        status: 'active',
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        message: '今日も学習してストリークを継続しましょう！'
      };
    }
    
    // 今日学習済み
    return {
      status: 'completed_today',
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      message: `素晴らしい！${data.currentStreak}日連続学習中！`
    };
  },
  
  // ストリークのマイルストーンをチェック
  checkStreakMilestone: function(streak) {
    const milestones = [
      { days: 3, message: '🎉 3日連続達成！習慣化の第一歩です！', reward: 'bronze' },
      { days: 7, message: '🎊 1週間連続達成！素晴らしい継続力です！', reward: 'silver' },
      { days: 14, message: '🌟 2週間連続達成！もう習慣になってきましたね！', reward: 'gold' },
      { days: 30, message: '🏆 1ヶ月連続達成！あなたは本物です！', reward: 'platinum' },
      { days: 50, message: '💎 50日連続達成！驚異的な継続力！', reward: 'diamond' },
      { days: 100, message: '👑 100日連続達成！伝説の領域です！', reward: 'legend' }
    ];
    
    const milestone = milestones.find(m => m.days === streak);
    if (milestone) {
      console.log(milestone.message);
      this.showStreakCelebration(milestone);
      return milestone;
    }
    
    return null;
  },
  
  // ストリーク達成の祝福を表示
  showStreakCelebration: function(milestone) {
    // 秘書にストリーク達成を通知
    if (typeof Secretary !== 'undefined' && Secretary.showMessage) {
      Secretary.showMessage(milestone.message, 'celebration', 5000);
    }
    
    // ご褒美システムと連携
    if (typeof SecretaryRewards !== 'undefined' && SecretaryRewards.showStreakReward) {
      setTimeout(() => {
        SecretaryRewards.showStreakReward(milestone.days, milestone.reward);
      }, 1000);
    }
  },
  
  // 勉強時間を追加（秒単位）
  addStudyTime: function(seconds) {
    const today = this.getTodayString();
    const data = this.getStreakData();
    
    // 総勉強時間に加算
    data.totalStudyTime = (data.totalStudyTime || 0) + seconds;
    
    // 日付ごとの勉強時間に加算
    if (!data.studyTimeHistory) {
      data.studyTimeHistory = {};
    }
    data.studyTimeHistory[today] = (data.studyTimeHistory[today] || 0) + seconds;
    
    // 保存
    this.saveStreakData(data);
    
    console.log(`⏱️ 勉強時間を記録: +${seconds}秒 (総: ${data.totalStudyTime}秒 = ${this.formatStudyTime(data.totalStudyTime)})`);
    
    return data;
  },
  
  // 勉強時間をフォーマット（時間:分:秒）
  formatStudyTime: function(totalSeconds) {
    if (!totalSeconds || totalSeconds === 0) {
      return '0時間0分';
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    } else if (minutes > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  },
  
  // 今日の勉強時間を取得
  getTodayStudyTime: function() {
    const today = this.getTodayString();
    const data = this.getStreakData();
    
    if (!data.studyTimeHistory || !data.studyTimeHistory[today]) {
      return 0;
    }
    
    return data.studyTimeHistory[today];
  },
  
  // ストリーク統計を取得
  getStreakStats: function() {
    const data = this.getStreakData();
    const status = this.checkStreakStatus();
    
    return {
      currentStreak: status.status === 'broken' ? 0 : data.currentStreak,
      longestStreak: data.longestStreak,
      totalStudyDays: data.totalStudyDays,
      totalStudyTime: data.totalStudyTime || 0,
      totalStudyTimeFormatted: this.formatStudyTime(data.totalStudyTime || 0),
      todayStudyTime: this.getTodayStudyTime(),
      todayStudyTimeFormatted: this.formatStudyTime(this.getTodayStudyTime()),
      status: status.status,
      message: status.message,
      lastStudyDate: data.lastStudyDate,
      studyHistory: data.studyHistory
    };
  },
  
  // 週間カレンダーを取得（過去7日間の学習状況）
  getWeeklyCalendar: function() {
    const data = this.getStreakData();
    const calendar = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayName = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
      
      calendar.push({
        date: dateString,
        dayName: dayName,
        month: date.getMonth() + 1,
        day: date.getDate(),
        studied: data.studyHistory.includes(dateString),
        isToday: dateString === this.getTodayString()
      });
    }
    
    return calendar;
  },
  
  // 初期化
  init: function() {
    console.log('🔥 学習ストリークシステム初期化中...');
    const stats = this.getStreakStats();
    console.log(`  現在のストリーク: ${stats.currentStreak}日`);
    console.log(`  最長ストリーク: ${stats.longestStreak}日`);
    console.log(`  総学習日数: ${stats.totalStudyDays}日`);
    console.log(`  総勉強時間: ${stats.totalStudyTimeFormatted}`);
    console.log(`  状態: ${stats.message}`);
  }
};

// グローバルにエクスポート
window.StreakSystem = StreakSystem;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    StreakSystem.init();
  });
} else {
  StreakSystem.init();
}
