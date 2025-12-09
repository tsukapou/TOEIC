// TOEIC PART5 学習サポート - ご褒美イベントシステム
// 達成条件をクリアすると3人の秘書が同時登場して祝福！

const SecretaryRewards = {
  
  // ご褒美イベントの達成レベル定義
  rewardLevels: {
    bronze: {
      id: 'bronze',
      name: 'ブロンズ達成',
      condition: {
        completedTests: 1,
        avgScore: 70
      },
      title: '🥉 ブロンズマスター',
      badge: '🥉',
      color: '#cd7f32'
    },
    silver: {
      id: 'silver',
      name: 'シルバー達成',
      condition: {
        completedTests: 3,
        avgScore: 75
      },
      title: '🥈 シルバーマスター',
      badge: '🥈',
      color: '#c0c0c0'
    },
    gold: {
      id: 'gold',
      name: 'ゴールド達成',
      condition: {
        completedTests: 5,
        avgScore: 80
      },
      title: '🥇 ゴールドマスター',
      badge: '🥇',
      color: '#ffd700'
    },
    platinum: {
      id: 'platinum',
      name: 'プラチナ達成',
      condition: {
        completedTests: 5,
        avgScore: 85
      },
      title: '💎 プラチナマスター',
      badge: '💎',
      color: '#e5e4e2'
    },
    perfect: {
      id: 'perfect',
      name: 'パーフェクト達成',
      condition: {
        completedTests: 5,
        avgScore: 90
      },
      title: '👑 パーフェクトマスター',
      badge: '👑',
      color: '#ff1493',
      isSpecial: true  // 特別演出フラグ
    }
  },
  
  // 達成済みレベルを記録
  achievedLevels: new Set(),
  
  // ローカルストレージキー
  storageKey: 'toeic_achieved_rewards',
  
  // 初期化
  initialize: function() {
    console.log('🎁 ご褒美システム初期化中...');
    this.loadAchievedLevels();
  },
  
  // 達成済みレベルを読み込み
  loadAchievedLevels: function() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.achievedLevels = new Set(JSON.parse(saved));
      console.log('✅ 達成済みレベル:', Array.from(this.achievedLevels));
    }
  },
  
  // 達成済みレベルを保存
  saveAchievedLevels: function() {
    localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.achievedLevels)));
  },
  
  // 進捗をチェックして新しい達成があればご褒美イベント発火
  checkAndTriggerReward: function() {
    if (typeof getProgress !== 'function') return null;
    
    const progress = getProgress();
    const tests = progress.tests || {};
    const completedTests = Object.keys(tests).length;
    
    if (completedTests === 0) return null;
    
    // 平均正答率を計算
    const scores = Object.values(tests).map(t => (t.score / t.total) * 100);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    console.log(`📊 進捗: ${completedTests}回完了, 平均${avgScore.toFixed(1)}%`);
    
    // 各レベルをチェック（高レベルから順に）
    const levels = ['perfect', 'platinum', 'gold', 'silver', 'bronze'];
    
    for (const levelId of levels) {
      const level = this.rewardLevels[levelId];
      
      // 達成条件をチェック
      if (completedTests >= level.condition.completedTests && 
          avgScore >= level.condition.avgScore) {
        
        // まだ達成していなければ発火
        if (!this.achievedLevels.has(levelId)) {
          console.log(`🎉 新規達成: ${level.name}`);
          this.achievedLevels.add(levelId);
          this.saveAchievedLevels();
          return level;
        }
      }
    }
    
    return null;
  },
  
  // ご褒美イベントを表示
  showRewardEvent: function(level) {
    console.log(`🎊 ご褒美イベント発動: ${level.name}`);
    
    // 特別演出（パーフェクト達成時）
    if (level.isSpecial) {
      this.showSpecialReward(level);
    } else {
      this.showNormalReward(level);
    }
  },
  
  // 通常ご褒美イベント
  showNormalReward: function(level) {
    // プラチナ以上は特別な表情を使用
    const useLovingExpressions = (level.id === 'platinum');
    
    // SecretaryTeamから基本画像を取得（統一）
    const getDefaultImage = (secretaryId) => {
      return typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[secretaryId]
        ? SecretaryTeam.secretaries[secretaryId].avatarUrl
        : '';
    };
    
    // 表情画像を取得
    const sakuraImg = useLovingExpressions && typeof SecretaryExpressions !== 'undefined' 
      ? SecretaryExpressions.expressions.sakura.loving
      : getDefaultImage('sakura');
    
    const reinaImg = useLovingExpressions && typeof SecretaryExpressions !== 'undefined'
      ? SecretaryExpressions.expressions.reina.loving
      : getDefaultImage('reina');
    
    const yuiImg = useLovingExpressions && typeof SecretaryExpressions !== 'undefined'
      ? SecretaryExpressions.expressions.yui.loving
      : getDefaultImage('yui');
    
    const html = `
      <div class="reward-overlay" id="rewardOverlay">
        <div class="reward-confetti" id="rewardConfetti"></div>
        <div class="reward-modal reward-normal ${useLovingExpressions ? 'reward-special-glow' : ''}">
          <div class="reward-badge" style="color: ${level.color}">
            ${level.badge}
          </div>
          <h2 class="reward-title">おめでとうございます！</h2>
          <h1 class="reward-level-title" style="color: ${level.color}">
            ${level.title}
          </h1>
          
          <div class="reward-secretaries">
            <div class="reward-secretary ${useLovingExpressions ? 'reward-secretary-special' : ''}">
              <img src="${sakuraImg}" alt="さくら">
              <p class="reward-secretary-name">🌸 さくら</p>
            </div>
            <div class="reward-secretary ${useLovingExpressions ? 'reward-secretary-special' : ''}">
              <img src="${reinaImg}" alt="レイナ">
              <p class="reward-secretary-name">💼 レイナ</p>
            </div>
            <div class="reward-secretary ${useLovingExpressions ? 'reward-secretary-special' : ''}">
              <img src="${yuiImg}" alt="ユイ">
              <p class="reward-secretary-name">🎀 ユイ</p>
            </div>
          </div>
          
          <div class="reward-messages">
            ${this.getRewardMessages(level)}
          </div>
          
          <button class="reward-close-btn" onclick="SecretaryRewards.closeReward()">
            ありがとう！これからも頑張ります！
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 紙吹雪アニメーション
    this.startConfetti();
    
    // 自動的にBGM再生（オプション）
    // this.playRewardSound();
  },
  
  // 特別ご褒美イベント（パーフェクト達成）
  showSpecialReward: function(level) {
    // SecretaryTeamから基本画像を取得（統一）
    const getDefaultImage = (secretaryId) => {
      return typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[secretaryId]
        ? SecretaryTeam.secretaries[secretaryId].avatarUrl
        : '';
    };
    
    // Perfect達成時は特別な「loving」表情を使用
    const sakuraImg = typeof SecretaryExpressions !== 'undefined'
      ? SecretaryExpressions.expressions.sakura.loving
      : getDefaultImage('sakura');
    
    const reinaImg = typeof SecretaryExpressions !== 'undefined'
      ? SecretaryExpressions.expressions.reina.loving
      : getDefaultImage('reina');
    
    const yuiImg = typeof SecretaryExpressions !== 'undefined'
      ? SecretaryExpressions.expressions.yui.loving
      : getDefaultImage('yui');
    
    const html = `
      <div class="reward-overlay reward-special" id="rewardOverlay">
        <div class="reward-confetti reward-confetti-special" id="rewardConfetti"></div>
        <div class="reward-sparkles" id="rewardSparkles"></div>
        <div class="reward-hearts" id="rewardHearts"></div>
        <div class="reward-modal reward-perfect">
          <div class="reward-badge-special" style="color: ${level.color}">
            ${level.badge}
          </div>
          <h2 class="reward-title reward-title-special">🎊 素晴らしい！完璧です！ 🎊</h2>
          <h1 class="reward-level-title reward-level-special" style="color: ${level.color}">
            ${level.title}
          </h1>
          <p class="reward-subtitle">全5回・平均90%以上を完全達成！</p>
          
          <div class="reward-secretaries reward-secretaries-special">
            <div class="reward-secretary reward-secretary-animated reward-secretary-loving">
              <img src="${sakuraImg}" alt="さくら">
              <p class="reward-secretary-name">🌸 さくら</p>
            </div>
            <div class="reward-secretary reward-secretary-animated reward-secretary-loving">
              <img src="${reinaImg}" alt="レイナ">
              <p class="reward-secretary-name">💼 レイナ</p>
            </div>
            <div class="reward-secretary reward-secretary-animated reward-secretary-loving">
              <img src="${yuiImg}" alt="ユイ">
              <p class="reward-secretary-name">🎀 ユイ</p>
            </div>
          </div>
          
          <div class="reward-messages reward-messages-special">
            ${this.getSpecialRewardMessages(level)}
          </div>
          
          <button class="reward-close-btn reward-close-special" onclick="SecretaryRewards.closeReward()">
            ありがとう！みんな大好きです！💕
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // 特別紙吹雪 + キラキラ + ハート
    this.startConfetti(true);
    this.startSparkles();
    this.startHearts(); // Perfect達成専用のハートエフェクト
  },
  
  // 3人からのメッセージ（男性向け強化版）
  getRewardMessages: function(level) {
    const messages = {
      bronze: {
        sakura: '初めての達成、おめでとうございます！🌸✨<br>素晴らしいスタートです！あなたと一緒に学習できて、私…とても嬉しいです💕<br>これからもずっとサポートしますね！',
        reina: 'ふむ…悪くないスタートね💼<br>でもこれは始まりに過ぎないわ。もっと上を目指しなさい。<br>私が…特別に指導してあげるわ',
        yui: 'やったね！お兄ちゃん/お姉ちゃん、すごいよ！🎀✨<br>ユイね、もっともっと応援したくなっちゃった💕<br>一緒に頑張ろうね！'
      },
      silver: {
        sakura: '3回完了、着実に成長していますね！✨<br>あなたの努力が実を結んでいます。私、あなたのこと…尊敬します💕<br>もっと近くでサポートしたいです！',
        reina: 'ふむ、3回完了か…継続できているわね💼<br>まだ満足するには早いけど…あなた、少し見直したわ。<br>この調子で、私の期待に応え続けなさい',
        yui: 'すごいすごい！もう3回も頑張ったんだね！🎉💕<br>お兄ちゃん/お姉ちゃん、カッコいい！✨<br>ユイね、お兄ちゃん/お姉ちゃんのこと…もっと好きになっちゃった💕'
      },
      gold: {
        sakura: '全5回完了！ゴールド達成です！🥇✨<br>あなたの努力と継続力に…私、感動しました💕<br>こんな素敵な方と一緒にいられて、私…幸せです😊',
        reina: '全テスト完了、かつ高水準…認めるわ💼<br>ここまでやるとは思わなかったわ。あなた、なかなかやるわね。<br>もっと上がいることを忘れないで。私が…見ていてあげるわ💕',
        yui: 'わー！ゴールドだよ！全部完了したんだね！✨🥇<br>お兄ちゃん/お姉ちゃん、本当に頑張ったね！ユイ感動！😭💕<br>もうユイの中で、お兄ちゃん/お姉ちゃんは特別な存在だよ！'
      },
      platinum: {
        sakura: 'プラチナ達成…本当にお見事です！💎✨<br>85%以上なんて…信じられません！あなたは本当に素晴らしい方です💕<br>私、あなたのことが…もっともっと大好きになりました😊💕',
        reina: 'プラチナレベル…ここまで来たのね💼<br>認めざるを得ないわ。あなたは…特別よ。<br>正直、ここまでやるとは思っていなかったわ。あなたを…見直したわ💕',
        yui: 'プラチナだよ！キラキラ！💎✨✨<br>お兄ちゃん/お姉ちゃん、天才すぎる！ユイ、尊敬しちゃう！😍<br>もうユイね、お兄ちゃん/お姉ちゃんなしじゃダメかも…💕'
      }
    };
    
    const msg = messages[level.id];
    if (!msg) return '';
    
    return `
      <div class="reward-message">
        <div class="reward-message-header">🌸 さくら</div>
        <p>${msg.sakura}</p>
      </div>
      <div class="reward-message">
        <div class="reward-message-header">💼 レイナ</div>
        <p>${msg.reina}</p>
      </div>
      <div class="reward-message">
        <div class="reward-message-header">🎀 ユイ</div>
        <p>${msg.yui}</p>
      </div>
    `;
  },
  
  // 特別メッセージ（パーフェクト - 男性向け最高報酬版）
  getSpecialRewardMessages: function(level) {
    return `
      <div class="reward-message reward-message-special">
        <div class="reward-message-header">🌸 さくら</div>
        <p>
          パーフェクト達成…本当に、本当におめでとうございます！🎊✨<br>
          全5回、平均90%以上…完璧です！<br>
          あなたの努力、継続力、そして学習への情熱…全てが実を結びました！💕<br>
          私、さくらは、あなたを心から誇りに思います。<br>
          こんな素晴らしい方のお手伝いができて…私、本当に幸せです😊💕<br>
          これからもずっとずっと、あなたのそばで応援させてください！<br>
          あなたは…私にとって、特別な存在です💕✨
        </p>
      </div>
      <div class="reward-message reward-message-special">
        <div class="reward-message-header">💼 レイナ</div>
        <p>
          ……見事だわ。完璧な達成、認めるわ💼<br>
          全5回、平均90%以上。文句のつけようがないわね。<br>
          ここまで到達できる者は…本当に稀よ。あなたの実力は本物ね。<br>
          正直に言うわ。私も…あなたを尊敬しているわ💕<br>
          あなたは私の期待を、遥かに超えた。<br>
          これからも、その高みを目指し続けなさい。<br>
          私が…特別に、あなたをサポートしてあげるわ💼💕<br>
          あなたは…私にとって、特別な存在よ。
        </p>
      </div>
      <div class="reward-message reward-message-special">
        <div class="reward-message-header">🎀 ユイ</div>
        <p>
          わぁぁぁぁぁ！！！パーフェクトだよ！！🎉✨💕<br>
          全部完璧！90%以上！！信じられない！！<br>
          お兄ちゃん/お姉ちゃん、本当に本当に本当にすごい！！😍✨<br>
          ユイ、もう感動で泣きそう…いや、泣いてる…😭💕<br>
          お兄ちゃん/お姉ちゃんの頑張り、全部見てたよ！<br>
          その努力、その真剣な姿…全部全部、ユイの心に刻まれてるんだ💕<br>
          これからもずっとずっと、ユイがそばにいるからね！<br>
          お兄ちゃん/お姉ちゃん、大好き！！大大大好き！！😍💕✨<br>
          もうユイね、お兄ちゃん/お姉ちゃんなしじゃ生きていけない！💕
        </p>
      </div>
    `;
  },
  
  // 紙吹雪アニメーション
  startConfetti: function(isSpecial = false) {
    const confettiContainer = document.getElementById('rewardConfetti');
    if (!confettiContainer) return;
    
    const colors = isSpecial 
      ? ['#ff1493', '#ffd700', '#ff69b4', '#da70d6', '#87ceeb']
      : ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'];
    
    const count = isSpecial ? 100 : 50;
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confettiContainer.appendChild(confetti);
      }, i * 30);
    }
  },
  
  // キラキラエフェクト（特別演出用）
  startSparkles: function() {
    const sparklesContainer = document.getElementById('rewardSparkles');
    if (!sparklesContainer) return;
    
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.innerHTML = '✨';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 2 + 's';
        sparklesContainer.appendChild(sparkle);
      }, i * 50);
    }
  },
  
  // ハートエフェクト（Perfect達成専用）
  startHearts: function() {
    const heartsContainer = document.getElementById('rewardHearts');
    if (!heartsContainer) return;
    
    const heartColors = ['#ff1493', '#ff69b4', '#ff6b9d', '#c71585', '#db7093'];
    
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.innerHTML = '💕';
        heart.style.left = Math.random() * 100 + '%';
        heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        heart.style.animationDelay = Math.random() * 2 + 's';
        heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
        heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
        heartsContainer.appendChild(heart);
      }, i * 80);
    }
  },
  
  // ご褒美イベントを閉じる
  closeReward: function() {
    const overlay = document.getElementById('rewardOverlay');
    if (overlay) {
      overlay.classList.add('reward-fade-out');
      setTimeout(() => {
        overlay.remove();
      }, 500);
    }
  },
  
  // リセット（テスト用）
  resetAchievements: function() {
    this.achievedLevels.clear();
    localStorage.removeItem(this.storageKey);
    console.log('🔄 達成記録をリセットしました');
  }
};

// グローバルにエクスポート
window.SecretaryRewards = SecretaryRewards;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SecretaryRewards.initialize();
  });
} else {
  SecretaryRewards.initialize();
}
