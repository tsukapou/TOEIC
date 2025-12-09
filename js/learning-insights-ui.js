// TOEIC PART5 学習サポート - 学習インサイトUI制御

const LearningInsightsUI = {
  currentTab: 'score',
  charts: {},
  
  // タブ切り替え
  switchTab: function(tabName) {
    this.currentTab = tabName;
    
    // タブボタンのスタイル更新
    document.querySelectorAll('.insight-tab').forEach(btn => {
      const btnId = btn.id.replace('tab-', '');
      if (btnId === tabName) {
        btn.style.borderBottomColor = '#667eea';
        btn.style.color = '#667eea';
      } else {
        btn.style.borderBottomColor = 'transparent';
        btn.style.color = '#6b7280';
      }
    });
    
    // コンテンツの表示/非表示
    document.querySelectorAll('.insight-content').forEach(content => {
      const contentId = content.id.replace('insight-', '');
      content.style.display = contentId === tabName ? 'block' : 'none';
    });
    
    // タブに応じたデータ更新
    this.refreshTabContent(tabName);
  },
  
  // タブコンテンツを更新
  refreshTabContent: function(tabName) {
    switch(tabName) {
      case 'score':
        this.updateScoreProgressTab();
        break;
      case 'growth':
        this.updateGrowthTrackingTab();
        break;
      case 'errors':
        this.updateErrorPatternsTab();
        break;
      case 'level':
        this.updateLevelTab();
        break;
    }
  },
  
  // ==================== スコア推移タブ ====================
  
  updateScoreProgressTab: function() {
    if (typeof LearningInsights === 'undefined') return;
    
    const report = LearningInsights.generateComprehensiveReport();
    const stats = report.scoreProgress;
    const level = report.currentLevel;
    
    // レベルカード
    const levelCard = document.getElementById('currentLevelName');
    if (levelCard) {
      levelCard.textContent = `${level.icon} ${level.name}`;
    }
    
    // 平均予測スコア
    const avgScore = document.getElementById('avgPredictedScore');
    if (avgScore) {
      avgScore.textContent = `${stats.avgPredicted}点`;
    }
    
    // ベストスコア
    const bestScore = document.getElementById('bestScore');
    if (bestScore) {
      bestScore.textContent = `${stats.bestPredicted}点`;
    }
    
    // スコア変化
    const trendCard = document.getElementById('scoreTrend');
    const trendCardEl = document.getElementById('trendCard');
    if (trendCard && trendCardEl) {
      if (stats.trend === 'rising') {
        trendCard.textContent = `+${stats.improvement}点 ↗️`;
        trendCardEl.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      } else if (stats.trend === 'falling') {
        trendCard.textContent = `${stats.improvement}点 ↘️`;
        trendCardEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      } else {
        trendCard.textContent = '横ばい →';
        trendCardEl.style.background = 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
      }
    }
    
    // スコア推移グラフを描画
    this.drawScoreProgressChart(stats.history);
    
    // 正答率推移グラフを描画
    this.drawAccuracyProgressChart(stats.history);
  },
  
  // スコア推移グラフを描画
  drawScoreProgressChart: function(history) {
    const canvas = document.getElementById('scoreProgressChart');
    if (!canvas || history.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    // 既存のチャートを破棄
    if (this.charts.scoreProgress) {
      this.charts.scoreProgress.destroy();
    }
    
    // 目標スコアを取得
    let targetScore = 800;
    if (typeof UserProfile !== 'undefined') {
      const profile = UserProfile.getProfile();
      if (profile.targetScore) {
        targetScore = parseInt(profile.targetScore);
      }
    }
    
    const labels = history.map((h, i) => `Test ${h.testNumber}`);
    const scores = history.map(h => h.predictedScore);
    
    this.charts.scoreProgress = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '予測スコア',
            data: scores,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: '目標スコア',
            data: new Array(labels.length).fill(targetScore),
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + '点';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 400,
            max: 990,
            ticks: {
              stepSize: 50
            }
          }
        }
      }
    });
  },
  
  // 正答率推移グラフを描画
  drawAccuracyProgressChart: function(history) {
    const canvas = document.getElementById('accuracyProgressChart');
    if (!canvas || history.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    
    // 既存のチャートを破棄
    if (this.charts.accuracyProgress) {
      this.charts.accuracyProgress.destroy();
    }
    
    const labels = history.map((h, i) => `Test ${h.testNumber}`);
    const accuracies = history.map(h => parseFloat(h.accuracy));
    
    this.charts.accuracyProgress = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '正答率',
            data: accuracies,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.3,
            fill: true,
            pointRadius: 6,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: '平均正答率',
            data: new Array(labels.length).fill(
              accuracies.reduce((a, b) => a + b, 0) / accuracies.length
            ),
            borderColor: '#6b7280',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y.toFixed(1) + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  },
  
  // ==================== 成長トラッキングタブ ====================
  
  updateGrowthTrackingTab: function() {
    if (typeof LearningInsights === 'undefined') return;
    
    const report = LearningInsights.generateComprehensiveReport();
    const topImprovements = report.topImprovements;
    const allGrowth = report.categoryGrowth;
    
    // トップ3改善カテゴリ
    this.renderTopImprovements(topImprovements);
    
    // 全カテゴリの成長リスト
    this.renderCategoryGrowthList(allGrowth);
  },
  
  // トップ3改善カテゴリを表示
  renderTopImprovements: function(topImprovements) {
    const container = document.getElementById('topImprovements');
    if (!container) return;
    
    if (topImprovements.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <p>まだデータが不足しています。もう少し問題を解いてください。</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">🏆 トップ3改善カテゴリ</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
        ${topImprovements.map((item, index) => {
          const medals = ['🥇', '🥈', '🥉'];
          const colors = [
            'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
            'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
          ];
          return `
            <div style="background: ${colors[index]}; border-radius: 0.75rem; padding: 1.5rem; color: white;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">${medals[index]}</div>
              <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${item.category}</div>
              <div style="font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem;">
                ${item.initialAccuracy}% → ${item.currentAccuracy}%
              </div>
              <div style="font-size: 1rem; opacity: 0.9;">
                改善度: +${item.improvement}% ${item.trendIcon}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },
  
  // 全カテゴリの成長リストを表示
  renderCategoryGrowthList: function(allGrowth) {
    const container = document.getElementById('categoryGrowthList');
    if (!container) return;
    
    if (allGrowth.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <p>カテゴリ別のデータがまだありません。</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">📊 全カテゴリの成長状況</h3>
      ${allGrowth.map(item => {
        const improvementColor = parseFloat(item.improvement) > 0 ? '#10b981' : 
                                 parseFloat(item.improvement) < 0 ? '#ef4444' : '#6b7280';
        return `
          <div style="background: white; border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h4 style="margin: 0; font-size: 1.125rem; color: #1f2937;">${item.category}</h4>
              <span style="font-size: 1.5rem;">${item.trendIcon}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div>
                <div style="font-size: 0.875rem; color: #6b7280;">最初の10問</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${item.initialAccuracy}%</div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #6b7280;">最近の10問</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #8b5cf6;">${item.currentAccuracy}%</div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #6b7280;">改善度</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: ${improvementColor};">
                  ${parseFloat(item.improvement) > 0 ? '+' : ''}${item.improvement}%
                </div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #6b7280;">総問題数</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: #1f2937;">${item.totalQuestions}問</div>
              </div>
            </div>
            ${item.insufficient ? `
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 0.75rem; border-radius: 0.25rem;">
                <p style="margin: 0; color: #92400e; font-size: 0.875rem;">
                  💡 データが不足しています。あと${Math.max(0, 10 - item.totalQuestions)}問解くと成長が分析できます。
                </p>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    `;
  },
  
  // ==================== 間違いパターンタブ ====================
  
  updateErrorPatternsTab: function() {
    if (typeof LearningInsights === 'undefined') return;
    
    const report = LearningInsights.generateComprehensiveReport();
    const patterns = report.errorPatterns;
    const ranking = report.errorRanking;
    
    // エラー統計
    document.getElementById('totalErrors').textContent = `${patterns.totalErrors}件`;
    document.getElementById('repeatMistakes').textContent = `${patterns.repeatMistakes.length}件`;
    document.getElementById('mostDifficult').textContent = patterns.mostDifficultCategory || '-';
    
    // 繰り返しミストップ5
    this.renderRepeatMistakes(patterns.repeatMistakes);
    
    // カテゴリ別エラーランキング
    this.renderCategoryErrorRanking(ranking);
  },
  
  // 繰り返しミスリストを表示
  renderRepeatMistakes: function(repeatMistakes) {
    const container = document.getElementById('repeatMistakesList');
    if (!container) return;
    
    if (repeatMistakes.length === 0) {
      container.innerHTML = `
        <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 1rem; border-radius: 0.5rem;">
          <p style="margin: 0; color: #065f46; font-weight: 600;">
            🎉 繰り返しミスがありません！素晴らしい！
          </p>
        </div>
      `;
      return;
    }
    
    const top5 = repeatMistakes.slice(0, 5);
    
    container.innerHTML = `
      <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">🔄 繰り返しミス トップ5</h3>
      <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
        <p style="margin: 0; color: #991b1b; font-weight: 600;">
          ⚠️ これらの問題を優先的に復習しましょう
        </p>
      </div>
      ${top5.map((item, index) => `
        <div style="background: white; border: 2px solid #fee2e2; border-radius: 0.75rem; padding: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <span style="background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-weight: 700; margin-right: 0.5rem;">
                ${index + 1}位
              </span>
              <span style="font-weight: 600; color: #1f2937;">${item.category}</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;">
                ${item.mistakeCount}回
              </div>
              <div style="font-size: 0.875rem; color: #6b7280;">ミス</div>
            </div>
          </div>
        </div>
      `).join('')}
    `;
  },
  
  // カテゴリ別エラーランキングを表示
  renderCategoryErrorRanking: function(ranking) {
    const container = document.getElementById('categoryErrorRanking');
    if (!container) return;
    
    if (ranking.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          <p>エラーデータがまだありません。</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">📊 カテゴリ別エラーランキング</h3>
      ${ranking.map((item, index) => {
        const barWidth = ranking.length > 0 ? (item.errorCount / ranking[0].errorCount) * 100 : 0;
        const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'];
        const color = colors[index % colors.length];
        
        return `
          <div style="background: white; border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 600; color: #1f2937;">${index + 1}. ${item.category}</span>
              <span style="font-weight: 700; color: ${color};">${item.errorCount}件</span>
            </div>
            <div style="background: #e5e7eb; height: 12px; border-radius: 6px; overflow: hidden;">
              <div style="background: ${color}; height: 100%; width: ${barWidth}%; transition: width 0.5s ease;"></div>
            </div>
          </div>
        `;
      }).join('')}
    `;
  },
  
  // ==================== レベル判定タブ ====================
  
  updateLevelTab: function() {
    if (typeof LearningInsights === 'undefined') return;
    
    const report = LearningInsights.generateComprehensiveReport();
    const level = report.currentLevel;
    const nextLevel = report.nextLevel;
    const ranking = report.ranking;
    
    // レベル詳細カード
    document.getElementById('levelIcon').textContent = level.icon;
    document.getElementById('levelName').textContent = level.name;
    document.getElementById('levelDescription').textContent = level.description;
    document.getElementById('currentScore').textContent = `${level.currentScore}点`;
    document.getElementById('scoreRange').textContent = `${level.minScore}-${level.maxScore}点`;
    
    // レベル進捗バー
    const progressPercent = level.progress.toFixed(1);
    document.getElementById('levelProgressPercent').textContent = `${progressPercent}%`;
    document.getElementById('levelProgressBar').style.width = `${progressPercent}%`;
    
    // 次のレベル情報
    this.renderNextLevelInfo(nextLevel);
    
    // ランキング位置
    this.renderRankingPosition(ranking, level.name);
  },
  
  // 次のレベル情報を表示
  renderNextLevelInfo: function(nextLevel) {
    const container = document.getElementById('nextLevelInfo');
    if (!container) return;
    
    if (nextLevel.isMaxLevel) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">👑</div>
          <h3 style="color: #1f2937; margin-bottom: 0.5rem; font-size: 1.5rem;">最高レベル到達！</h3>
          <p style="color: #6b7280; margin: 0;">おめでとうございます！エキスパートレベルです！🎉</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <h3 style="color: #1f2937; margin-bottom: 1rem; font-size: 1.25rem;">🎯 次のレベルまで</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
        <div style="text-align: center; padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 0.75rem;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">${nextLevel.nextLevel.icon}</div>
          <div style="font-size: 1.125rem; font-weight: 700; color: #1f2937;">${nextLevel.nextLevel.name}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">${nextLevel.nextLevel.minScore}点〜</div>
        </div>
        <div style="text-align: center; padding: 1rem; background: white; border: 2px solid #e5e7eb; border-radius: 0.75rem;">
          <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">必要ポイント</div>
          <div style="font-size: 2rem; font-weight: 700; color: #f59e0b;">+${nextLevel.pointsNeeded}</div>
          <div style="font-size: 0.875rem; color: #6b7280;">点</div>
        </div>
      </div>
      <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem;">
        <p style="margin: 0; color: #1e40af; font-weight: 600;">
          💡 ${nextLevel.message}
        </p>
      </div>
    `;
  },
  
  // ランキング位置を表示
  renderRankingPosition: function(ranking, levelName) {
    const container = document.getElementById('rankingPosition');
    if (!container) return;
    
    container.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
      <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">
        ${levelName}レベル内ランキング
      </div>
      <div style="font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">
        トップ ${ranking.percentile}%
      </div>
      <div style="font-size: 1.125rem; opacity: 0.9;">
        ${ranking.message}
      </div>
    `;
  },
  
  // ==================== メインパネル表示 ====================
  
  showPanel: function() {
    // 全タブのデータを更新
    this.updateScoreProgressTab();
    this.updateGrowthTrackingTab();
    this.updateErrorPatternsTab();
    this.updateLevelTab();
    
    // デフォルトでスコアタブを表示
    this.switchTab('score');
  }
};

// グローバル関数としてエクスポート
window.switchInsightTab = function(tabName) {
  LearningInsightsUI.switchTab(tabName);
};

// 弱点分析パネルの表示切り替え（既存関数を拡張）
const originalToggleWeaknessPanel = window.toggleWeaknessPanel;
window.toggleWeaknessPanel = function() {
  const panel = document.getElementById('weaknessDetailPanel');
  if (!panel) return;
  
  if (panel.style.display === 'flex') {
    panel.style.display = 'none';
  } else {
    panel.style.display = 'flex';
    // パネルを開く時にデータを更新
    LearningInsightsUI.showPanel();
  }
};

// showWeaknessAnalysis関数も拡張
window.showWeaknessAnalysis = function() {
  window.toggleWeaknessPanel();
};

console.log('📊 学習インサイトUI初期化完了');
