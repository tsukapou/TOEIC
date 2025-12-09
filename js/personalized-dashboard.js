/**
 * 🎨 パーソナライズドダッシュボードUI
 * 
 * ツカサさん専用の学習ダッシュボードを表示
 */

const PersonalizedDashboard = {
  
  // ==================== ダッシュボード生成 ====================
  
  render() {
    console.log('🎨 パーソナライズドダッシュボード描画開始...');
    
    const container = document.getElementById('personalizedDashboard');
    if (!container) {
      console.warn('⚠️ personalizedDashboard要素が見つかりません');
      return;
    }
    
    const profile = PersonalizedLearningNav.getUserProfile();
    const analysis = PersonalizedLearningNav.analyzeAllData();
    
    container.innerHTML = this.generateDashboardHTML(profile, analysis);
    
    console.log('✅ パーソナライズドダッシュボード描画完了');
  },
  
  // ==================== HTMLマジェネ成 ====================
  
  generateDashboardHTML(profile, analysis) {
    const todayMenu = this.generateTodayMenu(profile, analysis);
    const statusPanel = this.generateStatusPanel(analysis);
    const growthSummary = this.generateGrowthSummary(analysis);
    
    return `
      <div class="personalized-dashboard">
        <!-- ヘッダー -->
        <div class="dashboard-header">
          <h2>🎯 今日のおすすめ学習（新規＋復習）</h2>
          <p class="dashboard-subtitle">あなたの学習状況を分析し、今日の最適な学習プランを提案</p>
        </div>
        
        <!-- メインコンテンツ -->
        <div class="dashboard-content">
          <!-- 今日の専用メニュー -->
          ${todayMenu}
          
          <!-- 2カラムレイアウト -->
          <div class="dashboard-columns">
            <!-- リアルタイム状態 -->
            ${statusPanel}
            
            <!-- 成長サマリー -->
            ${growthSummary}
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 今日の専用メニュー ====================
  
  generateTodayMenu(profile, analysis) {
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][new Date().getDay()];
    const date = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
    
    // 挨拶メッセージ
    const greeting = this.getPersonalizedGreeting(analysis);
    
    // 推奨学習時間
    const recommendedTime = this.getRecommendedTime(analysis);
    
    // 推奨問題
    const recommendedProblems = this.getRecommendedProblems(analysis);
    
    // 今日の目標
    const todayGoal = this.getTodayGoal(analysis);
    
    // 秘書からのアドバイス
    const advice = this.getPersonalizedAdvice(analysis);
    
    return `
      <div class="today-menu">
        <div class="menu-header">
          <div class="date-info">
            <span class="date">${date}（${dayOfWeek}）</span>
            <span class="menu-title">${profile.name}さんの学習プラン</span>
          </div>
        </div>
        
        <div class="menu-content">
          <!-- 機能説明 -->
          <div class="feature-description" style="background: rgba(74, 144, 226, 0.1); border-left: 3px solid #4a90e2; padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem;">
            <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem; line-height: 1.8; color: #2d3748;">
              <li style="margin-bottom: 0.5rem;"><strong>🔥 弱点克服</strong>: 苦手カテゴリを集中練習（10問）</li>
              <li style="margin-bottom: 0.5rem;"><strong>✨ 得意維持</strong>: 強みをキープ（5問）</li>
              <li><strong>🎲 総復習</strong>: バランスよく学習（5問）</li>
            </ul>
            <p style="margin: 0.75rem 0 0 0; font-size: 0.85rem; color: #4a5568; background: white; padding: 0.5rem; border-radius: 0.25rem;">
              💡 <strong>使い方</strong>: 初めての方や、バランス良く学習したい方におすすめ
            </p>
          </div>
          
          <!-- 挨拶 -->
          <div class="greeting-message">
            ${greeting}
          </div>
          
          <!-- 推奨時間 -->
          <div class="menu-section">
            <h4>⏰ 推奨学習時間</h4>
            <div class="recommendation">
              ${recommendedTime}
            </div>
          </div>
          
          <!-- 推奨問題 -->
          <div class="menu-section">
            <h4>📚 今日のおすすめ問題</h4>
            <div class="problem-recommendations">
              ${recommendedProblems}
            </div>
          </div>
          
          <!-- 今日の目標 -->
          <div class="menu-section">
            <h4>🎯 今日の目標</h4>
            <div class="goal">
              ${todayGoal}
            </div>
          </div>
          
          <!-- 秘書からのアドバイス -->
          <div class="secretary-advice">
            <div class="advice-icon">💬</div>
            <div class="advice-content">
              <strong>私からのアドバイス：</strong>
              <p>${advice}</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  getPersonalizedGreeting(analysis) {
    const hour = new Date().getHours();
    const { todayCompleted, todayAccuracy } = analysis.currentStatus;
    const { trend, improvement } = analysis.performanceTrend;
    const profile = PersonalizedLearningNav.getUserProfile();
    const userName = profile.name || "学習者さん";
    
    let timeGreeting = "";
    if (hour >= 5 && hour < 12) {
      timeGreeting = "おはようございます";
    } else if (hour >= 12 && hour < 18) {
      timeGreeting = "こんにちは";
    } else {
      timeGreeting = "こんばんは";
    }
    
    let message = `${timeGreeting}、${userName}！`;
    
    // 今日の進捗に応じたメッセージ
    if (todayCompleted > 0) {
      message += `<br>今日は既に${todayCompleted}回学習されていますね。素晴らしいです✨`;
      if (todayAccuracy > 0) {
        message += ` 正答率${todayAccuracy}%、`;
        if (todayAccuracy >= 80) {
          message += "絶好調です！🔥";
        } else if (todayAccuracy >= 70) {
          message += "良い調子ですね👍";
        } else {
          message += "この調子で頑張りましょう💪";
        }
      }
    } else {
      // トレンドに応じたメッセージ
      if (trend === "上昇" && improvement > 0) {
        message += `<br>最近の成長が素晴らしいです！${improvement}%もUPしています📈`;
      } else if (analysis.currentStatus.currentStreak > 0) {
        message += `<br>現在${analysis.currentStatus.currentStreak}日連続学習中です🔥 今日も継続しましょう！`;
      } else {
        message += `<br>今日も一緒に頑張りましょう！`;
      }
    }
    
    return message;
  },
  
  getRecommendedTime(analysis) {
    const { bestTime } = analysis.timeSlotAnalysis;
    const profile = PersonalizedLearningNav.getUserProfile();
    const avgLength = analysis.sessionAnalysis.averageLength || 20;
    
    const timeSlots = {
      morning: { range: "10:00-11:00", reason: "午前中は最も集中力が高い時間帯です" },
      afternoon: { range: "14:00-15:00", reason: "午後の時間帯で最もパフォーマンスが良いです" },
      evening: { range: "19:00-20:00", reason: "夜の時間帯で学習効率が最も高いです" }
    };
    
    const slot = timeSlots[bestTime] || timeSlots.morning;
    
    return `
      <div class="time-recommendation">
        <div class="time-slot">${slot.range} <span class="duration">(約${avgLength}分)</span></div>
        <div class="time-reason">💡 ${slot.reason}</div>
      </div>
    `;
  },
  
  getRecommendedProblems(analysis) {
    const { weakest, strongest } = analysis.categoryAnalysis;
    const hasData = weakest !== "データ不足";
    
    if (!hasData) {
      return `
        <div class="problem-item">
          <div class="problem-title">📝 Test 1-5からスタート</div>
          <div class="problem-desc">まずは30問テストで、あなたの傾向を分析させてください！</div>
          <button class="btn btn-primary btn-sm" onclick="startTest(1)">Test 1 を開始 →</button>
        </div>
      `;
    }
    
    return `
      <div class="problem-item priority-high">
        <div class="problem-badge">🔥 優先</div>
        <div class="problem-title">${weakest}問題 10問</div>
        <div class="problem-desc">苦手克服のチャンス！集中して取り組みましょう</div>
        <button class="btn btn-primary btn-sm" onclick="startTestByCategory('${weakest}', 10)" style="margin-top: 0.75rem;">
          🚀 開始する
        </button>
      </div>
      
      <div class="problem-item priority-medium">
        <div class="problem-badge">✨ 維持</div>
        <div class="problem-title">${strongest}問題 5問</div>
        <div class="problem-desc">得意分野をキープしましょう</div>
        <button class="btn btn-secondary btn-sm" onclick="startTestByCategory('${strongest}', 5)" style="margin-top: 0.75rem;">
          📝 復習する
        </button>
      </div>
      
      <div class="problem-item priority-low">
        <div class="problem-badge">🎲 復習</div>
        <div class="problem-title">ランダム 5問</div>
        <div class="problem-desc">全体的な総復習</div>
        <button class="btn btn-outline btn-sm" onclick="startRandomTest(5)" style="margin-top: 0.75rem;">
          🎯 始める
        </button>
      </div>
    `;
  },
  
  getTodayGoal(analysis) {
    const { todayCompleted } = analysis.currentStatus;
    const targetTests = 2;
    const remaining = Math.max(0, targetTests - todayCompleted);
    
    if (remaining === 0) {
      return `
        <div class="goal-achieved">
          <span class="goal-icon">🎉</span>
          <span class="goal-text">今日の目標達成済み！素晴らしいです✨</span>
        </div>
      `;
    }
    
    const { recentAccuracy } = analysis.performanceTrend;
    const targetAccuracy = 75;
    
    return `
      <div class="goal-items">
        <div class="goal-item">
          <span class="goal-icon">📝</span>
          <span class="goal-text">あと${remaining}回の学習</span>
        </div>
        <div class="goal-item">
          <span class="goal-icon">🎯</span>
          <span class="goal-text">正答率${targetAccuracy}%以上を目指そう</span>
        </div>
      </div>
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(todayCompleted / targetTests) * 100}%"></div>
        </div>
        <div class="progress-text">${todayCompleted}/${targetTests}回完了</div>
      </div>
    `;
  },
  
  getPersonalizedAdvice(analysis) {
    const { trend, improvement, recentAccuracy } = analysis.performanceTrend;
    const { todayCompleted } = analysis.currentStatus;
    const { weakest } = analysis.categoryAnalysis;
    
    // 今日既に学習済みの場合
    if (todayCompleted > 0 && recentAccuracy < 70) {
      return "正答率が少し下がっていますね。疲れているかもしれません。無理せず、軽めの問題から始めるのも良いですよ😊";
    }
    
    // トレンドに応じたアドバイス
    if (trend === "上昇" && improvement > 10) {
      return `素晴らしい成長です！${improvement}%もUPしています📈 この調子で頑張りましょう！`;
    }
    
    if (trend === "下降") {
      return "最近少し調子が落ちていますね。焦らず、基礎問題で自信を取り戻しましょう💪";
    }
    
    // 苦手分野がある場合
    if (weakest !== "データ不足") {
      return `${weakest}問題が苦手のようですね。1日10分でいいので、コツコツ克服していきましょう！私も全力でサポートします✨`;
    }
    
    return "今日も一歩ずつ、着実に成長していきましょう！私が全力でサポートします💕";
  },
  
  // ==================== リアルタイム状態パネル ====================
  
  generateStatusPanel(analysis) {
    const { currentStreak, todayCompleted, todayAccuracy, estimatedScore, targetScore } = analysis.currentStatus;
    const profile = PersonalizedLearningNav.getUserProfile();
    const userName = profile.name || "学習者さん";
    
    // 調子の判定
    let condition = "😊 通常";
    let conditionClass = "normal";
    
    if (todayCompleted > 0) {
      if (todayAccuracy >= 80) {
        condition = "🔥 絶好調";
        conditionClass = "excellent";
      } else if (todayAccuracy >= 70) {
        condition = "😊 好調";
        conditionClass = "good";
      } else if (todayAccuracy < 60) {
        condition = "😅 要休憩";
        conditionClass = "tired";
      }
    }
    
    return `
      <div class="status-panel">
        <h3 class="panel-title">📊 ${userName}の今</h3>
        
        <div class="status-items">
          <div class="status-item">
            <div class="status-label">今日の調子</div>
            <div class="status-value ${conditionClass}">${condition}</div>
          </div>
          
          <div class="status-item">
            <div class="status-label">連続学習</div>
            <div class="status-value highlight">${currentStreak}日</div>
          </div>
          
          <div class="status-item">
            <div class="status-label">今日の学習</div>
            <div class="status-value">${todayCompleted}回</div>
          </div>
          
          ${todayCompleted > 0 ? `
          <div class="status-item">
            <div class="status-label">今日の正答率</div>
            <div class="status-value">${todayAccuracy}%</div>
          </div>
          ` : ''}
        </div>
        
        <div class="score-prediction">
          <h4>🎯 目標まで</h4>
          <div class="score-info">
            <div class="score-row">
              <span>現在の推定スコア</span>
              <span class="score-value">${estimatedScore}点</span>
            </div>
            <div class="score-row">
              <span>目標スコア</span>
              <span class="score-value target">${targetScore}点</span>
            </div>
            <div class="score-row remaining">
              <span>あと</span>
              <span class="score-value">${Math.max(0, targetScore - estimatedScore)}点</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // ==================== 成長サマリー ====================
  
  generateGrowthSummary(analysis) {
    const { trend, improvement, recentAccuracy } = analysis.performanceTrend;
    const { weakest, strongest } = analysis.categoryAnalysis;
    const { daysToGoal } = analysis.currentStatus;
    
    let trendIcon = "📊";
    let trendText = "安定";
    let trendClass = "stable";
    
    if (trend === "上昇") {
      trendIcon = "📈";
      trendText = `上昇中 (+${improvement}%)`;
      trendClass = "rising";
    } else if (trend === "下降") {
      trendIcon = "📉";
      trendText = `調整中 (${improvement}%)`;
      trendClass = "falling";
    }
    
    return `
      <div class="growth-panel">
        <h3 class="panel-title">📈 成長サマリー</h3>
        
        <div class="growth-items">
          <div class="growth-item">
            <div class="growth-icon">${trendIcon}</div>
            <div class="growth-content">
              <div class="growth-label">最近のトレンド</div>
              <div class="growth-value ${trendClass}">${trendText}</div>
            </div>
          </div>
          
          <div class="growth-item">
            <div class="growth-icon">🎯</div>
            <div class="growth-content">
              <div class="growth-label">最近の正答率</div>
              <div class="growth-value">${recentAccuracy}%</div>
            </div>
          </div>
          
          ${strongest !== "データ不足" ? `
          <div class="growth-item">
            <div class="growth-icon">⭐</div>
            <div class="growth-content">
              <div class="growth-label">得意分野</div>
              <div class="growth-value">${strongest}</div>
            </div>
          </div>
          ` : ''}
          
          ${weakest !== "データ不足" ? `
          <div class="growth-item">
            <div class="growth-icon">💪</div>
            <div class="growth-content">
              <div class="growth-label">強化中</div>
              <div class="growth-value">${weakest}</div>
            </div>
          </div>
          ` : ''}
        </div>
        
        ${daysToGoal < 999 ? `
        <div class="goal-estimate">
          <div class="estimate-icon">🔮</div>
          <div class="estimate-text">
            このペースなら、<strong>${daysToGoal}日後</strong>に目標達成予定！
          </div>
        </div>
        ` : ''}
      </div>
    `;
  }
};

// グローバルに公開
window.PersonalizedDashboard = PersonalizedDashboard;

console.log('✅ PersonalizedDashboard module loaded');
