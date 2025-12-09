// TOEIC PART5 学習サポート - ポイント報酬システム
// デイリーミッションで獲得したポイントを特典と交換

const PointRewards = {
  STORAGE_KEY: 'toeic_point_rewards',
  
  // 報酬アイテム定義
  rewards: [
    {
      id: 'reward_001',
      name: '秘書からの応援メッセージ',
      description: '選択中の秘書から特別な応援メッセージをもらえます',
      icon: '💌',
      cost: 50,
      type: 'message',
      rarity: 'common'
    },
    {
      id: 'reward_002',
      name: '3人からの合同メッセージ',
      description: 'さくら、レイナ、ユイの3人から特別なメッセージ',
      icon: '💕',
      cost: 100,
      type: 'message',
      rarity: 'rare'
    },
    {
      id: 'reward_003',
      name: '復習問題5問スキップ',
      description: '復習リストから5問を削除できます',
      icon: '⏭️',
      cost: 80,
      type: 'skip',
      rarity: 'common'
    },
    {
      id: 'reward_004',
      name: 'ストリーク復活チケット',
      description: 'ストリークが途切れた時に1日分復活できます（1回のみ使用可能）',
      icon: '🔥',
      cost: 150,
      type: 'streak_recovery',
      rarity: 'rare',
      singleUse: true
    },
    {
      id: 'reward_005',
      name: '秘書の特別表情解放',
      description: '秘書の「loving（ラブリー）」表情を解放します',
      icon: '😍',
      cost: 200,
      type: 'expression',
      rarity: 'epic',
      permanent: true
    },
    {
      id: 'reward_006',
      name: 'パーフェクト演出再生',
      description: 'パーフェクト達成時の特別演出をもう一度見られます',
      icon: '🎊',
      cost: 120,
      type: 'replay',
      rarity: 'rare'
    },
    {
      id: 'reward_007',
      name: 'デイリーミッション追加',
      description: '今日のデイリーミッションを1つ追加します',
      icon: '🎯',
      cost: 100,
      type: 'mission',
      rarity: 'rare'
    },

    {
      id: 'reward_009',
      name: '称号「努力の天才」獲得',
      description: '特別な称号を獲得し、プロフィールに表示されます',
      icon: '👑',
      cost: 300,
      type: 'title',
      rarity: 'legendary',
      permanent: true
    },
    {
      id: 'reward_010',
      name: '全秘書のプレミアムメッセージ',
      description: '3人の秘書から超特別なメッセージと演出',
      icon: '✨',
      cost: 500,
      type: 'premium',
      rarity: 'legendary'
    },
    {
      id: 'reward_011',
      name: '第4の秘書ミオ解放',
      description: 'データ分析と戦略的アドバイスが得意な、知的な秘書ミオを解放します',
      icon: '💼',
      cost: 800,
      type: 'secretary_unlock',
      rarity: 'legendary',
      permanent: true,
      secretaryId: 'mio'
    }
  ],
  
  // 購入履歴データを取得
  getPurchaseData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        purchased: [],
        totalSpent: 0,
        history: []
      };
    }
    return JSON.parse(data);
  },
  
  // データを保存
  savePurchaseData: function(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // 報酬を購入
  purchaseReward: function(rewardId) {
    const reward = this.rewards.find(r => r.id === rewardId);
    if (!reward) {
      console.error('報酬が見つかりません:', rewardId);
      return { success: false, message: '報酬が見つかりません' };
    }
    
    // ポイント確認
    if (typeof DailyMissions === 'undefined') {
      return { success: false, message: 'デイリーミッションシステムが利用できません' };
    }
    
    const stats = DailyMissions.getMissionStats();
    const currentPoints = stats.totalPoints;
    
    if (currentPoints < reward.cost) {
      return { 
        success: false, 
        message: `ポイントが不足しています（必要: ${reward.cost}pt / 現在: ${currentPoints}pt）` 
      };
    }
    
    // 購入履歴確認（1回のみ使用可能なアイテム）
    const purchaseData = this.getPurchaseData();
    if (reward.singleUse && purchaseData.purchased.includes(rewardId)) {
      return { 
        success: false, 
        message: 'この報酬は既に購入済みです（1回のみ使用可能）' 
      };
    }
    
    // ポイント消費
    const missionsData = DailyMissions.getMissionsData();
    missionsData.totalPoints -= reward.cost;
    DailyMissions.saveMissionsData(missionsData);
    
    // 購入記録
    purchaseData.purchased.push(rewardId);
    purchaseData.totalSpent += reward.cost;
    purchaseData.history.push({
      rewardId: rewardId,
      name: reward.name,
      cost: reward.cost,
      date: Date.now()
    });
    
    this.savePurchaseData(purchaseData);
    
    console.log(`🎁 報酬購入成功: ${reward.name} (-${reward.cost}pt)`);
    
    // 報酬を実行
    this.executeReward(reward);
    
    return { 
      success: true, 
      message: `「${reward.name}」を購入しました！`,
      remainingPoints: missionsData.totalPoints
    };
  },
  
  // 報酬を実行
  executeReward: function(reward) {
    switch (reward.type) {
      case 'message':
        this.showSecretaryMessage(reward);
        break;
      case 'skip':
        this.skipReviewQuestions(5);
        break;
      case 'streak_recovery':
        this.recoverStreak();
        break;
      case 'expression':
        this.unlockExpression();
        break;
      case 'replay':
        this.replayPerfectCelebration();
        break;
      case 'mission':
        this.addDailyMission();
        break;
      case 'secretary_unlock':
        this.unlockSecretary(reward);
        break;
      case 'title':
        this.unlockTitle(reward.name);
        break;
      case 'premium':
        this.showPremiumMessage();
        break;
    }
  },
  
  // 秘書からのメッセージを表示
  showSecretaryMessage: function(reward) {
    const messages = {
      'reward_001': {
        sakura: 'いつも頑張っているあなたを、心から応援しています！💕 一緒に目標達成しましょうね！',
        reina: '…あなたの努力、認めているわ。この調子で継続しなさい。期待しているわよ💼',
        yui: 'お兄ちゃん/お姉ちゃん、いつも頑張ってて本当にすごい！ユイも全力で応援してるよ！🎀'
      },
      'reward_002': {
        message: '3人からの特別メッセージです！',
        all: true
      }
    };
    
    if (typeof Secretary !== 'undefined' && Secretary.showMessage) {
      const currentSecretary = SecretaryTeam?.currentSecretary || 'sakura';
      const message = messages[reward.id]?.all 
        ? '✨ さくら、レイナ、ユイ全員があなたを応援しています！\n\nさくら: 「一緒に頑張りましょう！」💕\nレイナ: 「その調子よ」💼\nユイ: 「大好き！」🎀'
        : messages[reward.id]?.[currentSecretary] || 'いつも応援しています！';
      
      Secretary.showMessage(message, 'celebration', 5000);
    }
  },
  
  // 復習問題をスキップ
  skipReviewQuestions: function(count) {
    if (typeof ReviewSystem === 'undefined') return;
    
    const wrongAnswers = ReviewSystem.getWrongAnswers();
    if (wrongAnswers.length === 0) {
      if (window.ToastSystem) {
        window.ToastSystem.info('復習する問題がありません！');
      } else {
        alert('復習する問題がありません！');
      }
      return;
    }
    
    const skipCount = Math.min(count, wrongAnswers.length);
    const skipped = wrongAnswers.splice(0, skipCount);
    
    localStorage.setItem('toeic_wrong_answers', JSON.stringify(wrongAnswers));
    
    if (window.ToastSystem) {
      window.ToastSystem.success(`${skipCount}問の復習をスキップしました！`);
    } else {
      alert(`${skipCount}問の復習をスキップしました！`);
    }
    
    if (typeof updateReviewModeCard === 'function') {
      updateReviewModeCard();
    }
  },
  
  // ストリーク復活
  recoverStreak: function() {
    if (typeof StreakSystem === 'undefined') return;
    
    alert('🔥 ストリーク復活チケットを使用しました！\n次回ストリークが途切れた時に自動的に1日分復活します。');
  },
  
  // 表情解放
  unlockExpression: function() {
    alert('😍 秘書の特別表情「loving（ラブリー）」を解放しました！\n高得点達成時に見られるかも…？');
  },
  
  // パーフェクト演出再生
  replayPerfectCelebration: function() {
    if (typeof SecretaryRewards !== 'undefined' && SecretaryRewards.showReward) {
      SecretaryRewards.showReward('perfect', 30, 30);
    } else {
      alert('🎊 パーフェクト達成おめでとうございます！\n（演出システムが利用できません）');
    }
  },
  
  // デイリーミッション追加
  addDailyMission: function() {
    alert('🎯 特別ミッション「ボーナスチャレンジ」が追加されました！\n内容: 今日中にもう1回テストを完了する（+20pt）');
  },
  
  // 秘書解放
  unlockSecretary: function(secretaryId) {
    if (typeof SecretaryTeam === 'undefined') {
      alert('秘書システムが利用できません');
      return false;
    }
    
    const secretary = SecretaryTeam.secretaries[secretaryId];
    if (!secretary) {
      alert('秘書が見つかりません');
      return false;
    }
    
    const result = SecretaryTeam.unlockSecretary(secretaryId);
    
    if (result) {
      // 解放演出
      if (typeof showSecretaryUnlockAnimation === 'function') {
        showSecretaryUnlockAnimation(secretary);
      } else {
        alert(
          `🎊 新しい秘書「${secretary.name}」が解放されました！\n\n` +
          `${secretary.background}\n\n` +
          `${secretary.encouragementStyle}`
        );
      }
      
      // UI更新
      setTimeout(() => {
        if (typeof updateSecretaryPanel === 'function') {
          updateSecretaryPanel();
        }
      }, 500);
      
      return true;
    }
    
    return false;
  },
  
  // 称号解放
  unlockTitle: function(titleName) {
    alert(`👑 称号「努力の天才」を獲得しました！\nあなたの継続的な努力が認められました。プロフィールに表示されます。`);
  },
  
  // プレミアムメッセージ
  showPremiumMessage: function() {
    if (typeof SecretaryRewards !== 'undefined') {
      alert('✨ プレミアムメッセージ演出を開始します！');
      
      setTimeout(() => {
        alert('💕 さくら:\n「ツカサさん、いつも本当に頑張っていますね。あなたの努力を見ていると、私も勇気をもらえます。これからもずっと、一緒に歩んでいきましょう」');
      }, 500);
      
      setTimeout(() => {
        alert('💼 レイナ:\n「…正直に言うわ。あなたの継続力と向上心は、私が今まで見てきた中でも最高レベルよ。このまま突き進みなさい。私も全力でサポートするわ」');
      }, 2000);
      
      setTimeout(() => {
        alert('🎀 ユイ:\n「お兄ちゃん/お姉ちゃん…本当に、本当に大好き！💕 いつも一生懸命な姿を見て、ユイも頑張ろうって思えるの。これからもずっと、ずっと一緒だからね！」');
      }, 3500);
    }
  },
  
  // 利用可能な報酬を取得
  getAvailableRewards: function() {
    if (typeof DailyMissions === 'undefined') {
      return [];
    }
    
    const stats = DailyMissions.getMissionStats();
    const currentPoints = stats.totalPoints;
    const purchaseData = this.getPurchaseData();
    
    return this.rewards.map(reward => {
      const canAfford = currentPoints >= reward.cost;
      const alreadyPurchased = reward.singleUse && purchaseData.purchased.includes(reward.id);
      
      return {
        ...reward,
        canAfford: canAfford,
        alreadyPurchased: alreadyPurchased,
        available: canAfford && !alreadyPurchased
      };
    });
  },
  
  // レアリティ別に分類
  getRewardsByRarity: function() {
    const rewards = this.getAvailableRewards();
    
    return {
      common: rewards.filter(r => r.rarity === 'common'),
      rare: rewards.filter(r => r.rarity === 'rare'),
      epic: rewards.filter(r => r.rarity === 'epic'),
      legendary: rewards.filter(r => r.rarity === 'legendary')
    };
  },
  
  // 統計情報
  getStats: function() {
    const purchaseData = this.getPurchaseData();
    
    return {
      totalPurchased: purchaseData.purchased.length,
      totalSpent: purchaseData.totalSpent,
      availableRewards: this.rewards.length - purchaseData.purchased.filter(id => {
        const reward = this.rewards.find(r => r.id === id);
        return reward?.singleUse;
      }).length
    };
  },
  
  // ショップUIを表示
  showShop: function() {
    const currentPoints = DailyMissions.getMissionStats().totalPoints;
    const rewards = this.getAvailableRewards();
    
    // ショップモーダルHTML生成
    const shopHTML = `
      <div id="pointShopModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
        <div style="background: white; border-radius: 1rem; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3);">
          
          <!-- ヘッダー -->
          <div style="padding: 2rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 1rem 1rem 0 0; position: sticky; top: 0; z-index: 100;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h2 style="margin: 0; color: white; font-size: 1.75rem; font-weight: 700;">🎁 ポイントショップ</h2>
                <p style="margin: 0.5rem 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 1.125rem;">
                  所持ポイント: <strong style="font-size: 1.5rem;">${currentPoints}pt</strong>
                </p>
              </div>
              <button onclick="closePointShop()" style="background: rgba(255, 255, 255, 0.2); border: 2px solid white; color: white; width: 2.5rem; height: 2.5rem; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
                ×
              </button>
            </div>
          </div>
          
          <!-- 報酬リスト -->
          <div style="padding: 2rem;">
            ${this.generateRewardsList(rewards, currentPoints)}
          </div>
          
        </div>
      </div>
    `;
    
    // モーダルを表示
    const existingModal = document.getElementById('pointShopModal');
    if (existingModal) {
      existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', shopHTML);
  },
  
  // 報酬リストHTMLを生成
  generateRewardsList: function(rewards, currentPoints) {
    const rarityLabels = {
      'common': { label: 'コモン', color: '#9ca3af' },
      'rare': { label: 'レア', color: '#3b82f6' },
      'epic': { label: 'エピック', color: '#8b5cf6' },
      'legendary': { label: 'レジェンダリー', color: '#f59e0b' }
    };
    
    return rewards.map(reward => {
      const rarity = rarityLabels[reward.rarity];
      const canPurchase = reward.canAfford && !reward.alreadyPurchased;
      const isPurchased = reward.alreadyPurchased;
      
      return `
        <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: ${canPurchase ? '#f0fdf4' : isPurchased ? '#f3f4f6' : '#fff'}; border: 2px solid ${canPurchase ? '#86efac' : isPurchased ? '#d1d5db' : '#e5e7eb'}; border-radius: 0.75rem; transition: all 0.2s;">
          
          <div style="display: flex; gap: 1rem; align-items: start;">
            
            <!-- アイコン -->
            <div style="font-size: 3rem; flex-shrink: 0;">
              ${reward.icon}
            </div>
            
            <!-- 情報 -->
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: #1f2937;">
                  ${reward.name}
                </h3>
                <span style="padding: 0.25rem 0.5rem; background: ${rarity.color}; color: white; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">
                  ${rarity.label}
                </span>
                ${reward.permanent ? '<span style="padding: 0.25rem 0.5rem; background: #10b981; color: white; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">永続</span>' : ''}
              </div>
              
              <p style="margin: 0.5rem 0; color: #6b7280; line-height: 1.6;">
                ${reward.description}
              </p>
              
              <div style="display: flex; align-items: center; gap: 1rem; margin-top: 1rem;">
                <div style="font-size: 1.25rem; font-weight: 700; color: #f59e0b;">
                  ${reward.cost} pt
                </div>
                
                ${isPurchased ? 
                  '<span style="padding: 0.5rem 1rem; background: #d1d5db; color: #6b7280; border-radius: 0.5rem; font-weight: 600;">購入済み</span>' :
                  canPurchase ? 
                    `<button onclick="purchaseReward('${reward.id}')" style="padding: 0.5rem 1.5rem; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 8px -1px rgb(0 0 0 / 0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgb(0 0 0 / 0.1)'">
                      購入する
                    </button>` :
                    `<span style="padding: 0.5rem 1rem; background: #fee2e2; color: #dc2626; border-radius: 0.5rem; font-weight: 600;">ポイント不足 (残り ${reward.cost - currentPoints}pt)</span>`
                }
              </div>
            </div>
            
          </div>
          
        </div>
      `;
    }).join('');
  },
  
  // ポイントに応じて秘書を自動解除
  checkAndUnlockSecretaries: function() {
    if (typeof SecretaryTeam === 'undefined' || typeof DailyMissions === 'undefined') {
      return [];
    }
    
    const stats = DailyMissions.getMissionStats();
    const currentPoints = stats.totalPoints;
    const newlyUnlocked = [];
    
    // 解除可能な秘書をチェック
    const availableSecretaries = SecretaryTeam.getAvailableToUnlock(currentPoints);
    
    for (const secretary of availableSecretaries) {
      const result = SecretaryTeam.unlockSecretary(secretary.id);
      if (result) {
        newlyUnlocked.push(secretary);
        console.log(`✨ 新秘書解除: ${secretary.name} (Tier ${secretary.tier}, ${secretary.requiredPoints}pt)`);
      }
    }
    
    return newlyUnlocked;
  },
  
  // 初期化
  init: function() {
    console.log('🎁 ポイント報酬システム初期化中...');
    const stats = this.getStats();
    console.log(`  利用可能な報酬: ${stats.availableRewards}個`);
    console.log(`  購入済み: ${stats.totalPurchased}個`);
    console.log(`  使用ポイント: ${stats.totalSpent}pt`);
    
    // ポイントに応じて秘書を自動解除
    const newlyUnlocked = this.checkAndUnlockSecretaries();
    if (newlyUnlocked.length > 0) {
      console.log(`✨ ${newlyUnlocked.length}人の新しい秘書が解除されました！`);
    }
  }
};

// グローバルにエクスポート
window.PointRewards = PointRewards;

// グローバル関数: ショップを表示
window.showPointShop = function() {
  PointRewards.showShop();
};

// グローバル関数: ショップを閉じる
window.closePointShop = function() {
  const modal = document.getElementById('pointShopModal');
  if (modal) {
    modal.remove();
  }
};

// グローバル関数: 報酬を購入
window.purchaseReward = function(rewardId) {
  const result = PointRewards.purchaseReward(rewardId);
  
  if (result.success) {
    alert(`✨ ${result.message}\n\n残りポイント: ${result.remainingPoints}pt`);
    
    // ショップUIを更新
    closePointShop();
    showPointShop();
    
    // 他のUIも更新
    if (typeof updateStats === 'function') {
      updateStats();
    }
    if (typeof updatePointsDisplay === 'function') {
      updatePointsDisplay();
    }
  } else {
    alert(`❌ ${result.message}`);
  }
};

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PointRewards.init();
  });
} else {
  PointRewards.init();
}
