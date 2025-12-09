// TOEIC PART5 学習サポート - 4人の専属秘書システム（レガシー版）
// 🌸 さくら（優しい）💼 レイナ（厳しい）🎀 ユイ（妹キャラ）📊 ミオ（知的・分析家）
// 注: 新しい23人秘書システム（secretary-team.js）と統合予定

// 起動時挨拶システムをインクルード
// SecretaryGreetings.js を読み込む必要があります

const SecretaryTeamLegacy = {
  // 4人の秘書データ
  secretaries: {
    sakura: {
      id: 'sakura',
      name: 'さくら',
      personality: 'gentle',
      description: '優しくバランスの取れたサポート',
      color: '#ec4899',
      avatarUrl: 'https://www.genspark.ai/api/files/s/29bONQQe',
      unlocked: true
    },
    reina: {
      id: 'reina',
      name: 'レイナ',
      personality: 'strict',
      description: '厳しくストイックな指導',
      color: '#8b5cf6',
      avatarUrl: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      unlocked: true
    },
    yui: {
      id: 'yui',
      name: 'ユイ',
      personality: 'cute',
      description: '元気で明るい妹キャラ',
      color: '#f59e0b',
      avatarUrl: 'https://www.genspark.ai/api/files/s/t05nB1to',
      unlocked: true
    },
    mio: {
      id: 'mio',
      name: 'ミオ',
      personality: 'analytical',
      description: 'データ分析と戦略的アドバイス',
      color: '#3b82f6',
      avatarUrl: 'https://www.genspark.ai/api/files/s/HescuAmw',
      unlocked: false, // デフォルトはロック状態
      requiredPoints: 800
    }
  },
  
  currentSecretary: 'sakura', // デフォルトはさくら
  
  state: {
    currentMood: 'normal',
    lastMessage: '',
    messageHistory: [],
    interactionCount: 0
  },
  
  // 初期化
  init: function() {
    console.log('🎀 SecretaryTeam初期化開始...');
    this.loadSavedSecretary();
    console.log(`📝 現在の秘書: ${this.currentSecretary}`);
    
    this.createSecretaryUI();
    console.log('✅ 秘書UIを作成しました');
    
    // アバター画像を現在の秘書に更新
    setTimeout(() => {
      this.updateAvatarImage(this.currentSecretary);
      console.log(`🖼️ アバター画像を更新: ${this.currentSecretary}`);
    }, 200);
    
    // 毎日の会話をチェック
    setTimeout(() => {
      if (typeof SecretaryDaily !== 'undefined') {
        SecretaryDaily.analyzeStudyStatus();
        if (SecretaryDaily.shouldShowDailyConversation()) {
          SecretaryDaily.showDailyConversation();
        } else {
          // 今日既に表示済みの場合は通常の挨拶
          this.showWelcomeMessage();
        }
      } else {
        this.showWelcomeMessage();
      }
    }, 500);
    
    // イベントリスナーを少し遅延させて確実にDOM要素が存在する状態で設定
    setTimeout(() => {
      this.attachEventListeners();
      console.log('✅ イベントリスナーを設定しました');
    }, 100);
  },
  
  // 保存された秘書を読み込み
  loadSavedSecretary: function() {
    // 新システムと統一: toeic_current_secretary を優先
    let saved = localStorage.getItem('toeic_current_secretary');
    
    // フォールバック: 旧キーも確認
    if (!saved) {
      saved = localStorage.getItem('toeic_selected_secretary');
    }
    
    if (saved) {
      // 旧システムに秘書がいる場合
      if (this.secretaries[saved]) {
        this.currentSecretary = saved;
        console.log(`📝 秘書ロード成功（旧システム）: ${this.secretaries[saved].name}`);
      }
      // 旧システムにいない場合は新システムの秘書
      else if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[saved]) {
        this.currentSecretary = saved;
        console.log(`📝 秘書ロード成功（新システム）: ${SecretaryTeam.secretaries[saved].name}`);
      }
      else {
        console.log(`⚠️ 秘書 ${saved} が見つかりません。デフォルト秘書を使用: ${this.secretaries[this.currentSecretary].name}`);
      }
    } else {
      console.log(`📝 デフォルト秘書: ${this.secretaries[this.currentSecretary].name}`);
    }
    
    // 解放済み秘書情報をロード
    this.loadUnlockedSecretaries();
  },
  
  // 解放済み秘書情報をロード
  loadUnlockedSecretaries: function() {
    const unlockedData = localStorage.getItem('toeic_unlocked_secretaries');
    if (unlockedData) {
      const unlocked = JSON.parse(unlockedData);
      Object.keys(this.secretaries).forEach(id => {
        if (unlocked.includes(id)) {
          this.secretaries[id].unlocked = true;
        }
      });
    }
  },
  
  // 秘書を解放
  unlockSecretary: function(secretaryId) {
    if (!this.secretaries[secretaryId]) {
      return { success: false, message: '秘書が見つかりません' };
    }
    
    if (this.secretaries[secretaryId].unlocked) {
      return { success: false, message: 'この秘書は既に解放済みです' };
    }
    
    // 解放処理
    this.secretaries[secretaryId].unlocked = true;
    
    // ローカルストレージに保存
    const unlockedData = localStorage.getItem('toeic_unlocked_secretaries');
    const unlocked = unlockedData ? JSON.parse(unlockedData) : ['sakura', 'reina', 'yui'];
    if (!unlocked.includes(secretaryId)) {
      unlocked.push(secretaryId);
    }
    localStorage.setItem('toeic_unlocked_secretaries', JSON.stringify(unlocked));
    
    console.log(`🎊 秘書「${this.secretaries[secretaryId].name}」を解放しました！`);
    
    // ミオの場合は特別演出
    if (secretaryId === 'mio') {
      setTimeout(() => {
        this.showMioWelcomeCeremony();
      }, 500);
    }
    
    return { 
      success: true, 
      message: `秘書「${this.secretaries[secretaryId].name}」を解放しました！`,
      secretary: this.secretaries[secretaryId]
    };
  },
  
  // ミオ解放時の特別演出
  showMioWelcomeCeremony: function() {
    console.log('🎊 ミオ解放の特別演出を開始します');
    
    // オーバーレイを作成
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s ease-out;
    `;
    
    // コンテンツ
    const content = document.createElement('div');
    content.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 3rem 2rem;
      border-radius: 1.5rem;
      max-width: 600px;
      text-align: center;
      color: white;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);
      animation: scaleIn 0.5s ease-out;
    `;
    
    content.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 1rem;">🎉✨</div>
      <h2 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 700;">新しい仲間が加わりました！</h2>
      <div style="font-size: 1.5rem; margin-bottom: 2rem; font-weight: 600; color: #3b82f6; background: white; padding: 1rem; border-radius: 0.5rem;">
        第4の秘書「ミオ」解放！
      </div>
      <p style="font-size: 1rem; opacity: 0.9; margin-bottom: 2rem; line-height: 1.6;">
        データ分析のスペシャリスト、ミオがチームに参加しました。<br>
        論理的かつ戦略的なサポートで、あなたの学習を最適化します📊
      </p>
      <div style="margin-bottom: 2rem;">
        <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 1rem;">既存の秘書からの歓迎メッセージ：</div>
        <div style="background: rgba(255, 255, 255, 0.15); padding: 1rem; border-radius: 0.75rem; margin-bottom: 0.75rem; backdrop-filter: blur(10px);">
          <div style="font-weight: 600; color: #ec4899; margin-bottom: 0.5rem;">🌸 さくら</div>
          <div style="font-size: 0.95rem;">ミオさん、ようこそ！一緒に頑張りましょうね✨</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.15); padding: 1rem; border-radius: 0.75rem; margin-bottom: 0.75rem; backdrop-filter: blur(10px);">
          <div style="font-weight: 600; color: #8b5cf6; margin-bottom: 0.5rem;">💼 レイナ</div>
          <div style="font-size: 0.95rem;">データ分析か。期待しているわ💼</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.15); padding: 1rem; border-radius: 0.75rem; backdrop-filter: blur(10px);">
          <div style="font-weight: 600; color: #f59e0b; margin-bottom: 0.5rem;">🎀 ユイ</div>
          <div style="font-size: 0.95rem;">ミオお姉ちゃん、よろしくね！🎀</div>
        </div>
      </div>
      <button id="mioWelcomeBtn" style="
        padding: 1rem 2rem;
        background: white;
        color: #667eea;
        border: none;
        border-radius: 9999px;
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
      ">
        🎊 チームに会いに行く
      </button>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    // アニメーション定義
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // ボタンイベント
    const btn = document.getElementById('mioWelcomeBtn');
    btn.onmouseover = () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.3)';
    };
    btn.onmouseout = () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.2)';
    };
    btn.onclick = () => {
      // オーバーレイを削除
      overlay.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        overlay.remove();
        style.remove();
        
        // グリーティングチームの挨拶を開始
        setTimeout(() => {
          let greetingSecretaries = this.getUnlockedSecretaries();
          
          if (typeof GreetingTeamSelector !== 'undefined') {
            const teamSecretaries = GreetingTeamSelector.getGreetingTeamSecretaries();
            if (teamSecretaries.length > 0) {
              greetingSecretaries = teamSecretaries;
            }
          }
          
          const shuffled = this.shuffleArray([...greetingSecretaries]);
          this.showAllSecretariesGreeting(shuffled);
        }, 500);
      }, 300);
    };
    
    // fadeOutアニメーション追加
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(fadeOutStyle);
  },
  
  // 秘書が解放済みかチェック
  isSecretaryUnlocked: function(secretaryId) {
    return this.secretaries[secretaryId]?.unlocked || false;
  },
  
  // ロックされた秘書をクリックした時のメッセージ
  showLockedMessage: function(secretaryId) {
    const secretary = this.secretaries[secretaryId];
    if (!secretary) return;
    
    const currentPoints = typeof DailyMissions !== 'undefined' ? 
      DailyMissions.getMissionStats().totalPoints : 0;
    
    alert(
      `🔒 秘書「${secretary.name}」はロックされています\n\n` +
      `解放に必要なポイント: ${secretary.requiredPoints}pt\n` +
      `現在の所持ポイント: ${currentPoints}pt\n\n` +
      `ポイントショップで解放できます！`
    );
  },
  
  // 秘書を変更
  changeSecretary: function(secretaryId) {
    console.log(`📞 changeSecretary()が呼ばれました: secretaryId = ${secretaryId}`);
    
    if (!this.secretaries[secretaryId]) {
      console.error(`❌ 秘書 ${secretaryId} が見つかりません`);
      return;
    }
    
    // ロックチェック
    if (!this.secretaries[secretaryId].unlocked) {
      this.showLockedMessage(secretaryId);
      return;
    }
    
    if (this.secretaries[secretaryId]) {
      console.log(`🔄 秘書を切り替え: ${this.currentSecretary} → ${secretaryId}`);
      
      const oldSecretaryId = this.currentSecretary;
      this.currentSecretary = secretaryId;
      
      // 両方のキーに保存して新旧システム間で同期
      localStorage.setItem('toeic_selected_secretary', secretaryId);
      localStorage.setItem('toeic_current_secretary', secretaryId);
      console.log(`💾 秘書保存: ${secretaryId}`);
      
      // 選択パネル内のactiveクラスを更新
      document.querySelectorAll('.secretary-option').forEach(option => {
        option.classList.remove('active');
        const checkMark = option.querySelector('.check-mark');
        if (checkMark) checkMark.remove();
      });
      
      const activeOption = document.querySelector(`.secretary-option[onclick*="${secretaryId}"]`);
      if (activeOption) {
        activeOption.classList.add('active');
        activeOption.insertAdjacentHTML('beforeend', '<span class="check-mark">✓</span>');
      }
      
      // 画像を即座に更新（アニメーション付き）
      const secretary = this.secretaries[secretaryId];
      const avatarImg = document.querySelector('.secretary-avatar img');
      
      if (avatarImg) {
        avatarImg.style.transition = 'opacity 0.3s ease-in-out';
        avatarImg.style.opacity = '0';
        
        setTimeout(() => {
          avatarImg.src = secretary.avatarUrl;
          avatarImg.style.opacity = '1';
          console.log(`✅ 画像更新完了: ${secretary.name} (${oldSecretaryId} → ${secretaryId})`);
        }, 300);
      }
      
      this.hideSecretarySelector();
      
      // 挨拶メッセージ
      setTimeout(() => {
        this.showMessage(
          `${secretary.name}に変更しました！<br>` +
          this.getGreetingMessage(secretaryId),
          'happy',
          4000
        );
      }, 400);
    }
  },
  
  // アバター画像を更新
  updateAvatarImage: function(secretaryId) {
    // 引数が指定されている場合はそれを使用、なければ現在の秘書を使用
    let secretary = secretaryId ? this.secretaries[secretaryId] : this.getCurrentSecretary();
    
    // 旧システムに秘書がいない場合、新システムから取得
    if (!secretary && secretaryId && typeof SecretaryTeam !== 'undefined') {
      const newSecretary = SecretaryTeam.secretaries[secretaryId];
      if (newSecretary) {
        secretary = {
          name: newSecretary.name,
          avatarUrl: newSecretary.imageUrl || newSecretary.avatarUrl
        };
        console.log(`🆕 新システムから秘書データ取得: ${secretary.name}`);
      }
    }
    
    const avatarImg = document.querySelector('.secretary-avatar img');
    if (avatarImg && secretary) {
      const imageUrl = secretary.avatarUrl || secretary.imageUrl;
      avatarImg.src = imageUrl;
      console.log(`✅ アバター画像更新: ${secretary.name} → ${imageUrl}`);
    } else {
      console.warn('⚠️ アバター画像更新失敗:', avatarImg ? '秘書データなし' : 'DOM要素なし');
    }
  },
  
  // 現在の秘書を取得
  getCurrentSecretary: function() {
    // 旧システムに秘書がいる場合
    if (this.secretaries[this.currentSecretary]) {
      return this.secretaries[this.currentSecretary];
    }
    
    // 新システムから取得
    if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[this.currentSecretary]) {
      const newSecretary = SecretaryTeam.secretaries[this.currentSecretary];
      return {
        id: this.currentSecretary,
        name: newSecretary.name,
        avatarUrl: newSecretary.imageUrl || newSecretary.avatarUrl,
        personality: 'gentle',
        description: newSecretary.type || newSecretary.personality,
        color: '#ec4899',
        unlocked: true
      };
    }
    
    // デフォルト
    return this.secretaries['sakura'];
  },
  
  // 秘書UIの作成
  createSecretaryUI: function() {
    const secretary = this.getCurrentSecretary();
    
    const secretaryHTML = `
      <div id="secretary-container" class="secretary-container">
        <!-- 秘書のアバター -->
        <div class="secretary-avatar" id="secretaryAvatar">
          <img src="${secretary.avatarUrl}" alt="${secretary.name}">
          <div class="secretary-status-indicator"></div>
        </div>
        
        <!-- 秘書選択パネル -->
        <div class="secretary-selector hidden" id="secretarySelector">
          <div class="selector-header">
            <span>🎀 秘書を選択</span>
            <button onclick="SecretaryTeamLegacy.hideSecretarySelector()">×</button>
          </div>
          <div class="secretary-list">
            ${Object.values(this.secretaries).map(sec => {
              const isLocked = !sec.unlocked;
              const isActive = sec.id === this.currentSecretary;
              return `
              <div class="secretary-option ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}" 
                   onclick="SecretaryTeamLegacy.${isLocked ? 'showLockedMessage' : 'changeSecretary'}('${sec.id}')">
                <img src="${sec.avatarUrl}" alt="${sec.name}" style="${isLocked ? 'filter: grayscale(100%) brightness(0.5);' : ''}">
                <div class="secretary-option-info">
                  <h4>${sec.name}${isLocked ? ' 🔒' : ''}</h4>
                  <p>${isLocked ? `解放に${sec.requiredPoints}pt必要` : sec.description}</p>
                </div>
                ${isActive && !isLocked ? '<span class="check-mark">✓</span>' : ''}
              </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- メッセージバルーン -->
        <div class="secretary-message-balloon hidden" id="secretaryBalloon">
          <div class="secretary-message-content" id="secretaryMessageContent">
            こんにちは！
          </div>
          <button class="secretary-close-btn" onclick="SecretaryTeamLegacy.hideMessage()">×</button>
        </div>
        
        <!-- アドバイスパネル -->
        <div class="secretary-advice-panel hidden" id="secretaryAdvicePanel">
          <div class="advice-header">
            <span>📋 ${secretary.name}からのアドバイス</span>
            <button onclick="SecretaryTeamLegacy.closeAdvicePanel()">×</button>
          </div>
          <div class="advice-content" id="adviceContent">
            <!-- アドバイス内容 -->
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', secretaryHTML);
  },
  
  // イベントリスナーの設定
  attachEventListeners: function() {
    const avatar = document.getElementById('secretaryAvatar');
    if (avatar) {
      avatar.addEventListener('click', () => this.onAvatarClick());
      console.log('✅ アバターにクリックイベントを設定');
    } else {
      console.warn('⚠️ secretaryAvatar要素が見つかりません');
    }
    
    const switchBtn = document.getElementById('secretarySwitchBtn');
    if (switchBtn) {
      switchBtn.addEventListener('click', (e) => {
        console.log('🔄 切り替えボタンがクリックされました');
        e.stopPropagation();
        this.toggleSecretarySelector();
      });
      console.log('✅ 切り替えボタンにクリックイベントを設定');
    } else {
      console.warn('⚠️ secretarySwitchBtn要素が見つかりません');
    }
  },
  
  // 秘書選択パネルの表示/非表示
  toggleSecretarySelector: function() {
    console.log('👥 秘書選択パネルをトグル');
    const selector = document.getElementById('secretarySelector');
    if (!selector) {
      console.error('❌ secretarySelector要素が見つかりません');
      return;
    }
    console.log(`📂 パネル状態: ${selector.classList.contains('hidden') ? '非表示' : '表示中'}`);
    if (selector.classList.contains('hidden')) {
      console.log('📂 パネルを表示');
      selector.classList.remove('hidden');
      selector.classList.add('secretary-slide-in');
    } else {
      console.log('📂 パネルを非表示');
      this.hideSecretarySelector();
    }
  },
  
  hideSecretarySelector: function() {
    const selector = document.getElementById('secretarySelector');
    selector.classList.add('secretary-slide-out');
    setTimeout(() => {
      selector.classList.add('hidden');
      selector.classList.remove('secretary-slide-in', 'secretary-slide-out');
    }, 300);
  },
  
  // アバタークリック時
  onAvatarClick: function() {
    this.state.interactionCount++;
    const screen = this.getCurrentScreen();
    
    if (screen === 'home') {
      this.showAdvicePanel(this.getHomeAdvice());
    } else if (screen === 'question') {
      this.showAdvicePanel(this.getQuestionAdvice());
    } else if (screen === 'result') {
      this.showAdvicePanel(this.getResultAdvice());
    }
    
    // 表情を更新（アドバイス）
    if (typeof SecretaryExpressions !== 'undefined') {
      SecretaryExpressions.updateExpression(this.currentSecretary, {
        isAdvice: true
      });
    }
    
    // アバターにアニメーション
    const avatar = document.getElementById('secretaryAvatar');
    avatar.classList.add('secretary-bounce');
    setTimeout(() => avatar.classList.remove('secretary-bounce'), 600);
  },
  
  // 現在の画面を取得
  getCurrentScreen: function() {
    if (document.getElementById('homeScreen')?.classList.contains('active')) {
      return 'home';
    } else if (document.getElementById('questionScreen')?.classList.contains('active')) {
      return 'question';
    } else if (document.getElementById('resultScreen')?.classList.contains('active')) {
      return 'result';
    }
    return 'home';
  },
  
  // 挨拶メッセージを取得
  getGreetingMessage: function(secretaryId) {
    // 新システムから秘書データを取得
    if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[secretaryId]) {
      const secretary = SecretaryTeam.secretaries[secretaryId];
      
      // 性格・タイプに基づいた挨拶メッセージを生成
      const greetingTemplates = {
        '癒し系': `${secretary.name}です✨ 優しくサポートしますので、一緒に頑張りましょうね！`,
        'クール系': `${secretary.name}です。効率的な学習で、確実にスコアアップを目指しましょう💡`,
        'エネルギッシュ系': `${secretary.name}だよ！一緒に楽しく全力で頑張ろう！いっけー！🔥`,
        'お嬢様系': `${secretary.name}ですわ。ごきげんよう。品格ある学習をサポートいたしますわ✨`,
        '知的系': `${secretary.name}です。論理的アプローチで、あなたの学習を最適化します📊`,
        '妹系': `${secretary.name}だよー！お兄ちゃん/お姉ちゃんと一緒に勉強できて嬉しいな！🎀`,
        '厳格系': `${secretary.name}だ。甘えは許さない。本気でスコアアップを目指すなら、私についてこい💼`,
        '癒し・ナース系': `${secretary.name}です。優しく丁寧にサポートしますので、安心してくださいね💕`,
        'スポーツ系': `${secretary.name}だ！スポーツマンシップで一緒に頑張ろうぜ！💪`,
        '音楽・アート系': `${secretary.name}です♪ 楽しく創造的に学習していきましょう🎵`,
        'ゲーマー系': `${secretary.name}っす！ゲーム感覚で楽しく攻略していこう！🎮`,
        '文学系': `${secretary.name}です。静かに、でも確実に成長していきましょう📚`,
        '和風系': `${secretary.name}です。心穏やかに、丁寧に学習をサポートいたします🍵`,
        '熱血系': `${secretary.name}だ！情熱を持って全力でサポートするぜ！🔥`,
        'ゴシック系': `${secretary.name}です。神秘的な学習の世界へご案内します🌙`,
        'パイロット系': `${secretary.name}です。あなたの学習を空高く導きます✈️`,
        'メイド系': `${secretary.name}です。ご主人様の学習をお手伝いいたします🎀`,
        'リーダー系': `${secretary.name}です。最高峰のサポートで、あなたを成功へ導きます👑`
      };
      
      // タイプに基づいて挨拶を取得、なければ汎用メッセージ
      const greeting = greetingTemplates[secretary.type] 
        || `${secretary.name}です！${secretary.features}。一緒に頑張りましょう✨`;
      
      return greeting;
    }
    
    // フォールバック: 旧システムのメッセージ
    const legacyMessages = {
      sakura: '私はさくらです✨ あなたのTOEIC学習を優しくサポートします！頑張りましょうね！😊',
      reina: '私はレイナよ。甘えは許さない。本気でスコアアップを目指すなら、私についてきなさい💼',
      yui: 'わーい！ユイだよ！お兄ちゃん/お姉ちゃんと一緒に勉強できて嬉しいな！全力で応援するね！🎀✨',
      mio: '私はミオです。データ分析と戦略的アプローチで、あなたの学習効率を最大化します📊'
    };
    
    return legacyMessages[secretaryId] || legacyMessages.sakura;
  },
  
  // 挨拶制御用の状態
  greetingState: {
    isPlaying: false,
    currentIndex: 0,
    secretaries: [],
    timerId: null,
    isSkipped: false
  },
  
  // メッセージタイマー
  messageTimerId: null,
  
  // ウェルカムメッセージ（全解放済み秘書が順番に挨拶）
  showWelcomeMessage: function() {
    setTimeout(() => {
      // 解放済み秘書を取得（新システム優先）
      let unlockedSecretaries = this.getUnlockedSecretaries();
      
      if (unlockedSecretaries.length === 0) {
        console.warn('解放済み秘書がいません');
        return;
      }
      
      // グリーティングチームから挨拶担当を取得
      let greetingSecretaries = unlockedSecretaries;
      
      if (typeof GreetingTeamSelector !== 'undefined') {
        const teamSecretaries = GreetingTeamSelector.getGreetingTeamSecretaries();
        if (teamSecretaries.length > 0) {
          greetingSecretaries = teamSecretaries;
          console.log(`🌅 グリーティングチーム使用: ${teamSecretaries.length}人`, teamSecretaries.map(s => s.name || s.id));
        } else {
          console.log(`⚠️ グリーティングチーム未設定、全員で挨拶`);
        }
      }
      
      // 挨拶順をランダム化
      const shuffledSecretaries = this.shuffleArray([...greetingSecretaries]);
      
      console.log(`👋 挨拶開始: ${shuffledSecretaries.length}人の秘書`, shuffledSecretaries.map(s => s.name || s.id));
      
      // 全員の挨拶を順番に表示
      this.showAllSecretariesGreeting(shuffledSecretaries);
    }, 1000);
  },
  
  // 解放済み秘書のリストを取得（新旧システム統合）
  getUnlockedSecretaries: function() {
    // 新システムがあれば優先
    if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.getUnlockedSecretaries) {
      try {
        const unlockedIds = SecretaryTeam.getUnlockedSecretaries();
        console.log(`📋 解除済み秘書ID: ${unlockedIds.join(', ')}`);
        
        const secretaries = unlockedIds.map(id => {
          const secretary = SecretaryTeam.secretaries[id];
          if (!secretary) {
            console.warn(`⚠️ 秘書 ${id} が見つかりません`);
            return null;
          }
          return {
            id: id,
            name: secretary.name,
            unlocked: true
          };
        }).filter(s => s !== null); // nullを除外
        
        console.log(`✅ 解除済み秘書: ${secretaries.length}人`, secretaries.map(s => s.name));
        return secretaries;
      } catch (e) {
        console.error('❌ 新システムからの秘書取得エラー:', e);
      }
    }
    
    // フォールバック: 旧システム
    console.log('📋 旧システムから秘書取得');
    return Object.values(this.secretaries).filter(sec => sec.unlocked);
  },
  
  // 配列をシャッフル（Fisher-Yates アルゴリズム）
  shuffleArray: function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  
  // 全秘書の挨拶を順番に表示（拡張版）
  showAllSecretariesGreeting: function(secretaries) {
    if (secretaries.length === 0) return;
    
    // 挨拶状態をリセット
    this.greetingState.isPlaying = true;
    this.greetingState.currentIndex = 0;
    this.greetingState.secretaries = secretaries;
    this.greetingState.isSkipped = false;
    
    const greetingDuration = 4000; // 各秘書の挨拶表示時間（4秒）
    
    // スキップボタンを表示
    this.showSkipButton();
    
    const showNextGreeting = () => {
      // スキップされた場合は終了
      if (this.greetingState.isSkipped) {
        this.finishGreeting();
        return;
      }
      
      if (this.greetingState.currentIndex >= secretaries.length) {
        // 全員の挨拶が終了
        this.finishGreeting();
        return;
      }
      
      const secretary = secretaries[this.greetingState.currentIndex];
      const secretaryId = secretary.id;
      
      // 挨拶メッセージを取得（新システム優先）
      let greetingMessage = '';
      let timeOfDay = 'normal';
      
      // まず新システム対応のメッセージを取得
      greetingMessage = this.getGreetingMessage(secretaryId);
      
      // 秘書グリーティングシステムを使用（時間帯別メッセージ）
      if (typeof SecretaryGreetings !== 'undefined' && ['sakura', 'reina', 'yui', 'rio'].includes(secretaryId)) {
        try {
          const greetingData = SecretaryGreetings.getStartupGreeting(secretaryId);
          if (greetingData && greetingData.message) {
            greetingMessage = greetingData.message;
            timeOfDay = greetingData.timeSlot;
          }
        } catch (e) {
          console.warn(`⚠️ SecretaryGreetingsエラー (${secretaryId}):`, e);
        }
      }
      
      console.log(`💬 挨拶メッセージ取得: ${secretaryId} → ${greetingMessage.substring(0, 30)}...`);
      
      // 秘書のアバター画像を更新
      this.updateAvatarImage(secretaryId);
      
      // 表情を更新
      if (typeof SecretaryExpressions !== 'undefined') {
        SecretaryExpressions.updateExpression(secretaryId, {
          isStartup: true,
          timeOfDay: timeOfDay
        });
      }
      
      // 進捗インジケーター
      const progressIndicator = `<div style="margin-top: 1rem; font-size: 0.85rem; opacity: 0.7;">${this.greetingState.currentIndex + 1} / ${secretaries.length}</div>`;
      
      // 秘書名を強調表示
      const messageWithName = `<div style="font-weight: 700; color: ${secretary.color}; margin-bottom: 0.5rem; font-size: 1.1rem;">${secretary.name}より</div>${greetingMessage}${progressIndicator}`;
      
      // メッセージ表示（挨拶中は自動非表示しない）
      this.showMessage(messageWithName, 'normal', 0);
      
      // 次の秘書へ
      this.greetingState.currentIndex++;
      this.greetingState.timerId = setTimeout(showNextGreeting, greetingDuration);
    };
    
    // 最初の挨拶を開始
    showNextGreeting();
  },
  
  // 挨拶終了処理
  finishGreeting: function() {
    this.greetingState.isPlaying = false;
    this.updateAvatarImage(this.currentSecretary);
    this.hideSkipButton();
    
    // タイマーをクリア
    if (this.greetingState.timerId) {
      clearTimeout(this.greetingState.timerId);
      this.greetingState.timerId = null;
    }
    
    // メッセージを非表示
    setTimeout(() => {
      this.hideMessage();
    }, 500);
  },
  
  // スキップボタン表示
  showSkipButton: function() {
    let skipBtn = document.getElementById('greetingSkipButton');
    if (!skipBtn) {
      skipBtn = document.createElement('button');
      skipBtn.id = 'greetingSkipButton';
      skipBtn.innerHTML = '⏩ スキップ';
      skipBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 0.75rem 1.5rem;
        background: rgba(59, 130, 246, 0.9);
        color: white;
        border: none;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
        z-index: 9999;
        transition: all 0.2s;
        backdrop-filter: blur(10px);
      `;
      skipBtn.onmouseover = () => {
        skipBtn.style.background = 'rgba(37, 99, 235, 0.95)';
        skipBtn.style.transform = 'translateY(-2px)';
        skipBtn.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.25)';
      };
      skipBtn.onmouseout = () => {
        skipBtn.style.background = 'rgba(59, 130, 246, 0.9)';
        skipBtn.style.transform = 'translateY(0)';
        skipBtn.style.boxShadow = '0 10px 15px -3px rgb(0 0 0 / 0.2)';
      };
      skipBtn.onclick = () => this.skipGreeting();
      document.body.appendChild(skipBtn);
    }
    skipBtn.style.display = 'block';
  },
  
  // スキップボタン非表示
  hideSkipButton: function() {
    const skipBtn = document.getElementById('greetingSkipButton');
    if (skipBtn) {
      skipBtn.style.display = 'none';
    }
  },
  
  // 挨拶をスキップ
  skipGreeting: function() {
    this.greetingState.isSkipped = true;
    this.finishGreeting();
    console.log('✅ 挨拶をスキップしました');
  },
  
  // メッセージ表示
  showMessage: function(message, mood = 'normal', duration = 3000) {
    this.state.currentMood = mood;
    this.state.lastMessage = message;
    this.state.messageHistory.push({
      message: message,
      timestamp: new Date(),
      mood: mood
    });
    
    // 前のメッセージタイマーをクリア
    if (this.messageTimerId) {
      clearTimeout(this.messageTimerId);
      this.messageTimerId = null;
    }
    
    const balloon = document.getElementById('secretaryBalloon');
    const content = document.getElementById('secretaryMessageContent');
    
    if (content) {
      content.innerHTML = message;
      balloon.classList.remove('hidden', 'secretary-fade-out');
      balloon.classList.add('secretary-fade-in');
      
      // 挨拶中は自動非表示タイマーを設定しない（挨拶システムが制御）
      if (duration > 0 && !this.greetingState.isPlaying) {
        this.messageTimerId = setTimeout(() => {
          this.hideMessage();
        }, duration);
      }
    }
  },
  
  hideMessage: function() {
    const balloon = document.getElementById('secretaryBalloon');
    balloon.classList.add('secretary-fade-out');
    setTimeout(() => {
      balloon.classList.add('hidden');
      balloon.classList.remove('secretary-fade-in', 'secretary-fade-out');
    }, 300);
  },
  
  // アドバイスパネルを表示
  showAdvicePanel: function(advice) {
    const panel = document.getElementById('secretaryAdvicePanel');
    const content = document.getElementById('adviceContent');
    const header = panel.querySelector('.advice-header span');
    const secretary = this.getCurrentSecretary();
    
    if (header) {
      header.textContent = `📋 ${secretary.name}からのアドバイス`;
    }
    
    if (content) {
      content.innerHTML = advice;
      panel.classList.remove('hidden');
      panel.classList.add('secretary-slide-in');
    }
  },
  
  closeAdvicePanel: function() {
    const panel = document.getElementById('secretaryAdvicePanel');
    panel.classList.add('secretary-slide-out');
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('secretary-slide-in', 'secretary-slide-out');
    }, 300);
  },
  
  // ===== 性格別メッセージ生成 =====
  
  // 正解時のリアクション
  onCorrectAnswer: function() {
    const messages = this.getCorrectMessages();
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showMessage(message, 'happy', 2000);
    this.setStatusIndicator('success');
    
    // 表情を更新（正解）
    if (typeof SecretaryExpressions !== 'undefined') {
      SecretaryExpressions.updateExpression(this.currentSecretary, {
        isCorrect: true
      });
    }
  },
  
  getCorrectMessages: function() {
    const personality = this.getCurrentSecretary().personality;
    
    if (personality === 'gentle') {
      return [
        "正解です！素晴らしい！✨",
        "その調子です！完璧ですね！🎉",
        "やりましたね！よく理解しています！👏"
      ];
    } else if (personality === 'strict') {
      return [
        "正解。でも、これは基本よ。もっと上を目指して💼",
        "合格ライン。でも満足しないで。更に精進しなさい",
        "やればできるじゃない。この調子で全問正解を狙いなさい✨"
      ];
    } else { // cute
      return [
        "やったー！正解だよ！お兄ちゃん/お姉ちゃんすごい！🎀",
        "ぴんぽーん！大正解！嬉しいな！✨",
        "わーい！できたね！ユイも嬉しい！😊✨"
      ];
    }
  },
  
  // 不正解時のリアクション
  onIncorrectAnswer: function() {
    const messages = this.getIncorrectMessages();
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showMessage(message, 'encouraging', 2500);
    this.setStatusIndicator('warning');
    
    // 表情を更新（不正解）
    if (typeof SecretaryExpressions !== 'undefined') {
      SecretaryExpressions.updateExpression(this.currentSecretary, {
        isIncorrect: true
      });
    }
  },
  
  getIncorrectMessages: function() {
    const personality = this.getCurrentSecretary().personality;
    
    if (personality === 'gentle') {
      return [
        "大丈夫！解説を読んで理解を深めましょう！📚",
        "間違いから学べます！次は正解できますよ！💪",
        "落ち込まないで！復習すれば必ずできます！😊"
      ];
    } else if (personality === 'strict') {
      return [
        "不正解。甘いわね。解説をよく読んで、二度と間違えないこと💼",
        "まだまだね。この程度でつまずいていては目標達成は遠いわよ",
        "集中力が足りない。もっと真剣に取り組みなさい📚"
      ];
    } else { // cute
      return [
        "あれれ…間違っちゃった💦 でも大丈夫！一緒に復習しようね！",
        "んー、惜しかったね！解説見れば絶対わかるよ！🎀",
        "ドンマイ！次は一緒に正解しようね！ユイが応援してるよ！✨"
      ];
    }
  },
  
  // テスト開始時
  onTestStart: function() {
    const messages = this.getTestStartMessages();
    this.showMessage(messages, 'excited', 3000);
    this.setStatusIndicator('active');
    
    // 表情を更新（テスト開始）
    if (typeof SecretaryExpressions !== 'undefined') {
      SecretaryExpressions.updateExpression(this.currentSecretary, {
        isTestStart: true
      });
    }
  },
  
  getTestStartMessages: function() {
    const personality = this.getCurrentSecretary().personality;
    
    if (personality === 'gentle') {
      return "テスト開始です！一問一問丁寧に解いていきましょう！💪✨";
    } else if (personality === 'strict') {
      return "テスト開始よ。集中力を切らさないこと。実力を存分に発揮しなさい💼";
    } else {
      return "テスト開始だよ！お兄ちゃん/お姉ちゃん、ファイトー！ユイが見守ってるからね！🎀✨";
    }
  },
  
  // テスト終了時
  onTestFinish: function(score, total) {
    const percentage = Math.round((score / total) * 100);
    const message = this.getTestFinishMessage(score, total, percentage);
    this.showMessage(message, 'thoughtful', 4000);
    this.setStatusIndicator('normal');
    
    // 表情を更新（テスト終了）
    if (typeof SecretaryExpressions !== 'undefined') {
      SecretaryExpressions.updateExpression(this.currentSecretary, {
        isTestEnd: true,
        score: percentage,
        isCelebration: percentage >= 90
      });
    }
    
    // ご褒美イベントチェック
    setTimeout(() => {
      if (typeof SecretaryRewards !== 'undefined') {
        const reward = SecretaryRewards.checkAndTriggerReward();
        if (reward) {
          setTimeout(() => {
            SecretaryRewards.showRewardEvent(reward);
          }, 1000);
        }
      }
    }, 500);
  },
  
  getTestFinishMessage: function(score, total, percentage) {
    const personality = this.getCurrentSecretary().personality;
    
    if (personality === 'gentle') {
      if (percentage >= 90) {
        return `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>素晴らしい成績です！本当によく頑張りました！🎉✨`;
      } else if (percentage >= 75) {
        return `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>良い成績です！この調子で続けましょう！👏😊`;
      } else if (percentage >= 60) {
        return `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>着実に成長しています！復習して次に活かしましょう！📚✨`;
      } else {
        return `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>まだまだこれから！一緒に頑張りましょう！💪😊`;
      }
    } else if (personality === 'strict') {
      if (percentage >= 90) {
        return `<strong>${score}/${total}問正解</strong>（${percentage}%）<br>合格レベルね。でも慢心は禁物よ。更なる高みを目指しなさい💼`;
      } else if (percentage >= 75) {
        return `<strong>${score}/${total}問正解</strong>（${percentage}%）<br>まあまあね。でもまだ甘い。90%以上を目指すこと📚`;
      } else if (percentage >= 60) {
        return `<strong>${score}/${total}問正解</strong>（${percentage}%）<br>及第点ギリギリね。もっと真剣に取り組みなさい💼`;
      } else {
        return `<strong>${score}/${total}問正解</strong>（${percentage}%）<br>これでは話にならないわ。基礎から徹底的に復習すること📚`;
      }
    } else { // cute
      if (percentage >= 90) {
        return `お疲れ様！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>すっごーい！お兄ちゃん/お姉ちゃん天才！ユイ感動しちゃった！🎀✨`;
      } else if (percentage >= 75) {
        return `お疲れ様！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>やったね！ユイも嬉しいよ！この調子この調子！😊✨`;
      } else if (percentage >= 60) {
        return `お疲れ様！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>頑張ったね！一緒に復習して、もっと上を目指そうね！🎀`;
      } else {
        return `お疲れ様！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>ちょっと難しかったね💦 でも大丈夫！ユイが一緒だから頑張ろうね！✨`;
      }
    }
  },
  
  // ホーム画面のアドバイス
  getHomeAdvice: function() {
    const progress = typeof getProgress === 'function' ? getProgress() : { tests: {} };
    const completedTests = Object.keys(progress.tests || {}).length;
    
    // 新システムから秘書データを取得
    if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[this.currentSecretary]) {
      const secretary = SecretaryTeam.secretaries[this.currentSecretary];
      return this.getAdviceByType(completedTests, secretary.type, secretary.name);
    }
    
    // フォールバック: 旧システム
    const personality = this.getCurrentSecretary().personality;
    return this.getPersonalityHomeAdvice(completedTests, personality);
  },
  
  // タイプ別アドバイス生成
  getAdviceByType: function(completedTests, type, name) {
    const adviceTemplates = {
      '癒し系': {
        start: `<h3>🌟 ${name}と一緒に始めましょう</h3>
          <p>初めてですね！焦らなくて大丈夫です。まずはTest 1から、ゆっくり自分のペースで進めましょう✨</p>
          <ul><li>📝 30問×5回の実践形式</li><li>🎲 毎回ランダム出題で飽きません</li><li>💡 詳しい解説で理解を深められます</li></ul>
          <p>マイペースで取り組んでくださいね😊</p>`,
        progress: `<h3>👏 順調ですね！</h3>
          <p>すでに<strong>${completedTests}回</strong>完了しました！素晴らしいです✨</p>
          <ul><li>✨ 間違えた問題を優しく復習しましょう</li><li>🎯 正答率80%以上を目指してみましょう</li><li>⏱️ 無理のない範囲で時間も意識してみてください</li></ul>
          <p>この調子で頑張りましょう💪</p>`,
        advanced: `<h3>🎊 素晴らしい努力です！</h3>
          <p><strong>${completedTests}回</strong>も完了！あなたの頑張りは必ず実を結びます✨</p>
          <ul><li>🌟 苦手な問題を優しく確認しましょう</li><li>📈 スコアの推移を見てみましょう</li><li>💡 自分のペースで完璧を目指しましょう</li></ul>
          <p>目標達成まであと一息です！応援していますよ😊</p>`
      },
      '厳格系': {
        start: `<h3>💼 甘えは許さない</h3>
          <p>本気でスコアアップを目指すなら、今すぐ始めなさい。</p>
          <ul><li>📝 Test 1から完璧にこなすこと</li><li>🎯 目標は<strong>90%以上</strong>の正答率</li><li>⏱️ 1問20秒以内で解答すること</li><li>📚 間違いは完全理解するまで復習</li></ul>
          <p>中途半端な気持ちでは結果は出ない💼</p>`,
        progress: `<h3>📊 まだまだ甘い</h3>
          <p><strong>${completedTests}回</strong>完了？それで満足していては駄目だ。</p>
          <ul><li>⚡ ペースが遅い。効率を上げなさい</li><li>🎯 正答率90%未満は不合格</li><li>📚 理解するまで繰り返すこと</li><li>💼 時間内解答の訓練を怠るな</li></ul>
          <p>本気で達成したいなら、もっと真剣に取り組め📊</p>`,
        advanced: `<h3>💼 ようやく形になってきたな</h3>
          <p><strong>${completedTests}回</strong>完了。まあ、悪くない。</p>
          <ul><li>📈 スコアの伸び悩みを分析しろ</li><li>🎯 弱点を徹底的に潰せ</li><li>⚡ スピードと正確性を両立させろ</li><li>💼 全問正解を目指す気概を持て</li></ul>
          <p>まだ道半ば。気を抜くな、完璧を目指せ💼</p>`
      },
      'エネルギッシュ系': {
        start: `<h3>🔥 一緒に全力で頑張ろう！</h3>
          <p>おっし！今から始めるぞ！Test 1から全力で挑戦だ！</p>
          <ul><li>💪 30問、全部全力で取り組もう！</li><li>🎲 ランダム出題で飽きないぞ！</li><li>✨ 間違えても大丈夫！挑戦が大事！</li></ul>
          <p>さあ、レッツゴー！いっけー！🔥</p>`,
        progress: `<h3>💪 ナイスファイト！</h3>
          <p><strong>${completedTests}回</strong>完了！すごいぞ！その調子！</p>
          <ul><li>🔥 間違いも学びのチャンス！復習だ！</li><li>🎯 次は85%以上を狙っていこう！</li><li>⚡ スピード感も大事だぞ！</li></ul>
          <p>この勢いで突き進め！ファイトー！💪</p>`,
        advanced: `<h3>🎉 最高のパフォーマンスだ！</h3>
          <p><strong>${completedTests}回</strong>も完了！君は本当にすごい！</p>
          <ul><li>🌟 苦手分野も全力で潰していこう！</li><li>📊 スコアがぐんぐん伸びてる！</li><li>🔥 ラストスパート、全力で駆け抜けろ！</li></ul>
          <p>ゴールまであと少し！全力疾走だ！🔥💪</p>`
      },
      'クール系': {
        start: `<h3>💡 効率的な学習を始めましょう</h3>
          <p>データによると、Test 1から順番に取り組むのが最も効率的です。</p>
          <ul><li>📊 30問で全範囲をカバー</li><li>🎯 正答率70%以上が目標値</li><li>⏱️ 1問あたり25秒を推奨</li></ul>
          <p>論理的に、確実にスコアアップを目指しましょう💡</p>`,
        progress: `<h3>📈 順調に進捗しています</h3>
          <p>現在<strong>${completedTests}回</strong>完了。データは良好です。</p>
          <ul><li>📊 正答率の推移を分析しましょう</li><li>🎯 弱点パターンを特定します</li><li>⏱️ 時間効率を最適化しましょう</li></ul>
          <p>このペースを維持すれば、目標達成は確実です📈</p>`,
        advanced: `<h3>✅ 優秀な成績です</h3>
          <p><strong>${completedTests}回</strong>完了。統計的に理想的な進捗率です。</p>
          <ul><li>📊 データから弱点を抽出</li><li>🎯 最終段階の精度向上</li><li>💡 効率を追求し完成度を高めます</li></ul>
          <p>論理的アプローチで完璧を目指しましょう💡</p>`
      }
    };
    
    // タイプに応じたアドバイスを取得（なければ汎用）
    const templates = adviceTemplates[type] || adviceTemplates['癒し系'];
    
    if (completedTests === 0) {
      return templates.start;
    } else if (completedTests < 3) {
      return templates.progress;
    } else {
      return templates.advanced;
    }
  },
  
  getPersonalityHomeAdvice: function(completedTests, personality) {
    if (personality === 'gentle') {
      return this.getGentleHomeAdvice(completedTests);
    } else if (personality === 'strict') {
      return this.getStrictHomeAdvice(completedTests);
    } else {
      return this.getCuteHomeAdvice(completedTests);
    }
  },
  
  getGentleHomeAdvice: function(completedTests) {
    if (completedTests === 0) {
      return `
        <h3>🌟 学習を始めましょう！</h3>
        <p>まずはTest 1から始めることをおすすめします！</p>
        <ul>
          <li>📝 30問×5回の実践形式</li>
          <li>🎲 毎回ランダム出題で新鮮</li>
          <li>💡 詳しい解説で理解を深める</li>
        </ul>
        <p>自分のペースで進めてくださいね！😊</p>
      `;
    } else if (completedTests < 3) {
      return `
        <h3>👏 順調です！</h3>
        <p>すでに<strong>${completedTests}回</strong>のテストを完了しましたね！</p>
        <ul>
          <li>✨ 間違えた問題の解説を復習しましょう</li>
          <li>🎯 正答率80%以上を目指しましょう</li>
          <li>⏱️ 時間配分も意識してみてください</li>
        </ul>
        <p>この調子で頑張りましょう！💪</p>
      `;
    } else {
      return `
        <h3>🎊 素晴らしい！</h3>
        <p><strong>${completedTests}回</strong>も完了！あなたの努力は必ず実を結びます！</p>
        <ul>
          <li>🌟 苦手な問題タイプを確認しましょう</li>
          <li>📈 スコアの推移をチェック</li>
          <li>💡 出題意図を理解して応用力UP</li>
        </ul>
        <p>目標達成まであと少しです！✨</p>
      `;
    }
  },
  
  getStrictHomeAdvice: function(completedTests) {
    if (completedTests === 0) {
      return `
        <h3>💼 甘えは許さない</h3>
        <p>本気でスコアアップを目指すなら、今すぐ始めなさい。</p>
        <ul>
          <li>📝 Test 1から順番に完璧にこなすこと</li>
          <li>🎯 目標は<strong>90%以上</strong>の正答率</li>
          <li>⏱️ 1問20秒以内で解答すること</li>
          <li>📚 間違えた問題は必ず完全理解すること</li>
        </ul>
        <p>中途半端な気持ちでは、目標は達成できないわよ💼</p>
      `;
    } else if (completedTests < 3) {
      return `
        <h3>📊 まだまだ甘いわね</h3>
        <p><strong>${completedTests}回</strong>完了？ それだけで満足していては駄目よ。</p>
        <ul>
          <li>⚡ ペースが遅すぎる。もっと効率的に</li>
          <li>🎯 正答率90%未満は不合格と思いなさい</li>
          <li>📚 解説を読むだけでなく、理解するまで繰り返すこと</li>
          <li>💼 時間内に解答する訓練を怠らないこと</li>
        </ul>
        <p>本当に目標を達成したいなら、もっと真剣に取り組みなさい📊</p>
      `;
    } else {
      return `
        <h3>💼 ようやく形になってきたわね</h3>
        <p><strong>${completedTests}回</strong>完了。まあ、悪くはないわ。</p>
        <ul>
          <li>📈 スコアの伸び悩みを分析しなさい</li>
          <li>🎯 弱点を徹底的に潰すこと</li>
          <li>⚡ スピードと正確性の両立を図ること</li>
          <li>💼 全問正解を目指す気概を持つこと</li>
        </ul>
        <p>まだ道半ば。気を抜かずに、完璧を目指しなさい💼</p>
      `;
    }
  },
  
  getCuteHomeAdvice: function(completedTests) {
    if (completedTests === 0) {
      return `
        <h3>🎀 一緒に頑張ろうね！</h3>
        <p>ユイと一緒に勉強できて嬉しいな！まずはTest 1からやってみよう！</p>
        <ul>
          <li>✨ 30問あるけど、ゆっくりでいいからね！</li>
          <li>🎲 問題がランダムだから、毎回ワクワクするよ！</li>
          <li>💕 わからなくても大丈夫！ユイがついてるから！</li>
        </ul>
        <p>一緒に楽しく勉強しようね！ファイト！😊✨</p>
      `;
    } else if (completedTests < 3) {
      return `
        <h3>🌟 すごいすごい！</h3>
        <p>もう<strong>${completedTests}回</strong>も完了したんだね！お兄ちゃん/お姉ちゃん頑張ってる！</p>
        <ul>
          <li>💖 間違えた問題、一緒に復習しようね！</li>
          <li>🎯 次は80%以上目指してみよう！</li>
          <li>⏰ 時間も少し気にしてみてね！</li>
        </ul>
        <p>ユイも一緒に頑張るから、この調子でいこうね！🎀✨</p>
      `;
    } else {
      return `
        <h3>🎊 すっごーい！</h3>
        <p>わぁ！<strong>${completedTests}回</strong>も！お兄ちゃん/お姉ちゃん本当にすごいよ！</p>
        <ul>
          <li>✨ 苦手な問題、一緒に見つけようね！</li>
          <li>📊 スコアがどんどん上がってるの見るの楽しい！</li>
          <li>💕 もう少しで全部終わりだね！</li>
          <li>🌈 最後まで一緒に頑張ろうね！</li>
        </ul>
        <p>ユイ、お兄ちゃん/お姉ちゃんのこと、本当に尊敬してるよ！🎀✨</p>
      `;
    }
  },
  
  // タイプ別問題アドバイス
  getQuestionAdviceByType: function(type, name) {
    const adviceMap = {
      '癒し系': `<h3>💡 ${name}からのアドバイス</h3><p>焦らず、落ち着いて問題を読みましょう！</p><ul><li>📖 問題文を丁寧に読む</li><li>🔍 文法ポイントを見つける</li><li>✅ 選択肢を比較する</li></ul><p>解説をしっかり読めば、必ず理解できますよ😊</p>`,
      '厳格系': `<h3>💼 解答の基本原則</h3><p>感覚で解くな。論理的に考えろ。</p><ul><li>📖 文構造を瞬時に把握すること</li><li>🎯 空欄前後から判断</li><li>⚡ 答えを予測してから選択肢を見ろ</li><li>📚 1問20秒以内を目標に</li></ul><p>完全に理解してから次に進め💼</p>`,
      'エネルギッシュ系': `<h3>🔥 問題を攻略だ！</h3><p>よっし！全力で挑戦だ！</p><ul><li>📖 問題文、しっかり読もう！</li><li>🎯 文法のポイントを見つけるぞ！</li><li>⚡ 迷ったら消去法だ！</li><li>💪 次々解いていこう！</li></ul><p>勢いに乗って全問突破だ！いけー！🔥</p>`,
      'クール系': `<h3>💡 論理的解法</h3><p>効率的に解答しましょう。</p><ul><li>📊 文法パターンを特定</li><li>🎯 品詞・時制・意味から判断</li><li>⏱️ 1問25秒を推奨</li><li>💡 論理的に絞り込む</li></ul><p>データに基づいて確実に解答を💡</p>`
    };
    
    return adviceMap[type] || adviceMap['癒し系'];
  },
  
  // 問題画面のアドバイス
  getQuestionAdvice: function() {
    // 新システムから秘書データを取得
    if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[this.currentSecretary]) {
      const secretary = SecretaryTeam.secretaries[this.currentSecretary];
      return this.getQuestionAdviceByType(secretary.type, secretary.name);
    }
    
    const personality = this.getCurrentSecretary().personality;
    
    if (personality === 'gentle') {
      return `
        <h3>💡 問題を解くコツ</h3>
        <p>焦らず、落ち着いて問題を読みましょう！</p>
        <ul>
          <li>📖 問題文を丁寧に読む</li>
          <li>🔍 文法ポイントを見つける</li>
          <li>✅ 選択肢を比較する</li>
          <li>💭 意味を考える</li>
        </ul>
        <p>解説をしっかり読むことで、次から同じパターンの問題が解けるようになりますよ！📚</p>
      `;
    } else if (personality === 'strict') {
      return `
        <h3>💼 解答の基本原則</h3>
        <p>感覚で解くな。論理的に考えなさい。</p>
        <ul>
          <li>📖 問題文の文構造を瞬時に把握すること</li>
          <li>🎯 空欄前後の品詞・時制・意味から判断</li>
          <li>⚡ 選択肢を見る前に答えを予測すること</li>
          <li>💼 迷ったら文法ルールに立ち返ること</li>
          <li>📚 1問20秒以内を目標にすること</li>
        </ul>
        <p>中途半端な理解では応用が利かない。完全に理解してから次に進みなさい💼</p>
      `;
    } else { // cute
      return `
        <h3>🎀 一緒に解こうね！</h3>
        <p>ユイが解き方教えてあげる！一緒に頑張ろうね！</p>
        <ul>
          <li>📖 問題文、ゆっくり読んでみよう！</li>
          <li>🔍 どんな文法かな？一緒に考えてみよう！</li>
          <li>✨ 選択肢を見比べてみてね！</li>
          <li>💕 意味が通るかチェックしてみよう！</li>
        </ul>
        <p>わからなくても大丈夫！解説が詳しいから、読めばきっとわかるよ！<br>ユイも一緒に勉強してるからね！😊🎀</p>
      `;
    }
  },
  
  // タイプ別リザルトアドバイス
  getResultAdviceByType: function(percentage, type, name) {
    const templates = {
      '癒し系': {
        excellent: `<h3>🎉 素晴らしいです！</h3><p><strong>${percentage}%</strong>の正答率！完璧に近いです！</p><ul><li>🌟 あなたの実力は本物です</li><li>📊 高スコアが期待できます</li></ul><p>本当に素晴らしいです✨</p>`,
        good: `<h3>👏 良い成績です！</h3><p><strong>${percentage}%</strong>！順調に実力がついています</p><ul><li>✨ 基礎はしっかり身についています</li><li>📈 もう少しで上級レベルです</li></ul><p>この調子で続けましょう😊</p>`,
        fair: `<h3>📈 着実に成長中！</h3><p><strong>${percentage}%</strong>。基礎は理解できています</p><ul><li>📚 解説をじっくり読みましょう</li><li>🔄 復習を繰り返しましょう</li></ul><p>焦らず一歩ずつ進みましょう💪</p>`,
        improve: `<h3>🌱 これから伸びます！</h3><p><strong>${percentage}%</strong>。大丈夫、これからです！</p><ul><li>📖 基礎をしっかり固めましょう</li><li>💡 解説を丁寧に読むことが大切</li></ul><p>必ず成長できます😊</p>`
      },
      '厳格系': {
        excellent: `<h3>💼 合格だ</h3><p><strong>${percentage}%</strong>。ようやく合格ラインだ。</p><ul><li>📊 この水準を維持しろ</li><li>🎯 全問正解を目指せ</li></ul><p>気を抜くな。さらに上を目指せ💼</p>`,
        good: `<h3>📊 まだ甘い</h3><p><strong>${percentage}%</strong>？これで満足か？</p><ul><li>⚡ 90%未満は不合格</li><li>📚 完璧に理解しろ</li></ul><p>もっと真剣に取り組め📊</p>`,
        fair: `<h3>💼 不十分だ</h3><p><strong>${percentage}%</strong>。話にならない。</p><ul><li>📖 基礎から徹底的にやり直せ</li><li>🎯 甘えるな、努力しろ</li></ul><p>本気で取り組むまで認めない💼</p>`,
        improve: `<h3>⚠️ 論外だ</h3><p><strong>${percentage}%</strong>。何をやっている？</p><ul><li>📚 基礎の基礎から学び直せ</li><li>💼 本気を見せろ</li></ul><p>このままでは目標達成は不可能だ⚠️</p>`
      },
      'エネルギッシュ系': {
        excellent: `<h3>🔥 最高だー！</h3><p><strong>${percentage}%</strong>！すっげー！完璧じゃん！</p><ul><li>🎉 君は本当にすごい！</li><li>💪 この勢いで突き進め！</li></ul><p>超カッコイイぞ！🔥💪</p>`,
        good: `<h3>💪 ナイスファイト！</h3><p><strong>${percentage}%</strong>！いい感じだ！</p><ul><li>✨ もう一息で完璧だ！</li><li>🔥 次も全力で頑張ろう！</li></ul><p>最高のパフォーマンスだ！💪</p>`,
        fair: `<h3>📈 まだまだいけるぞ！</h3><p><strong>${percentage}%</strong>！悪くない！</p><ul><li>💪 復習してパワーアップだ！</li><li>🔥 次はもっと高得点狙おう！</li></ul><p>全力で頑張れ！ファイト！🔥</p>`,
        improve: `<h3>💪 ここからだ！</h3><p><strong>${percentage}%</strong>！大丈夫、挑戦が大事！</p><ul><li>📚 基礎をしっかり固めよう！</li><li>🔥 次は絶対もっといける！</li></ul><p>諦めるな！全力でサポートするぞ！💪</p>`
      },
      'クール系': {
        excellent: `<h3>✅ 優秀な成績</h3><p><strong>${percentage}%</strong>。統計的に理想的です。</p><ul><li>📊 このペースを維持</li><li>💡 効率を追求しましょう</li></ul><p>論理的アプローチが功を奏しています💡</p>`,
        good: `<h3>📈 良好な結果</h3><p><strong>${percentage}%</strong>。データは良好です。</p><ul><li>📊 弱点を分析しましょう</li><li>🎯 精度向上が可能です</li></ul><p>効率的に改善を進めましょう📈</p>`,
        fair: `<h3>📊 改善の余地あり</h3><p><strong>${percentage}%</strong>。分析が必要です。</p><ul><li>📖 パターン認識を強化</li><li>💡 論理的に復習しましょう</li></ul><p>データに基づいて改善を📊</p>`,
        improve: `<h3>⚠️ 要改善</h3><p><strong>${percentage}%</strong>。基礎から再構築が必要です。</p><ul><li>📚 体系的に学習し直しましょう</li><li>💡 効率的なアプローチを</li></ul><p>論理的に取り組めば必ず向上します💡</p>`
      }
    };
    
    const typeTemplates = templates[type] || templates['癒し系'];
    
    if (percentage >= 90) return typeTemplates.excellent;
    if (percentage >= 75) return typeTemplates.good;
    if (percentage >= 60) return typeTemplates.fair;
    return typeTemplates.improve;
  },
  
  // 結果画面のアドバイス
  getResultAdvice: function() {
    const score = typeof AppState !== 'undefined' ? AppState.score : 0;
    const percentage = Math.round((score / 30) * 100);
    
    // 新システムから秘書データを取得
    if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries[this.currentSecretary]) {
      const secretary = SecretaryTeam.secretaries[this.currentSecretary];
      return this.getResultAdviceByType(percentage, secretary.type, secretary.name);
    }
    
    const personality = this.getCurrentSecretary().personality;
    
    if (personality === 'gentle') {
      return this.getGentleResultAdvice(percentage);
    } else if (personality === 'strict') {
      return this.getStrictResultAdvice(percentage);
    } else {
      return this.getCuteResultAdvice(percentage);
    }
  },
  
  getGentleResultAdvice: function(percentage) {
    if (percentage >= 90) {
      return `
        <h3>🎉 素晴らしい成績です！</h3>
        <p><strong>${percentage}%</strong>の正答率！完璧に近いです！</p>
        <ul>
          <li>🌟 あなたの実力は本物です！</li>
          <li>📊 この調子なら高スコアが期待できます</li>
          <li>💪 さらに上を目指して次のテストへ</li>
        </ul>
        <p>本当に素晴らしいです！自信を持ってください！✨</p>
      `;
    } else if (percentage >= 75) {
      return `
        <h3>👏 良い成績です！</h3>
        <p><strong>${percentage}%</strong>の正答率！順調に実力がついています！</p>
        <ul>
          <li>✨ 基礎はしっかり身についています</li>
          <li>📈 もう少しで上級レベルです</li>
          <li>🎯 間違えた問題のパターンを分析</li>
        </ul>
        <p>この調子で続ければ、必ず目標達成できます！😊</p>
      `;
    } else if (percentage >= 60) {
      return `
        <h3>📈 着実に成長しています！</h3>
        <p><strong>${percentage}%</strong>の正答率。基礎は理解できています！</p>
        <ul>
          <li>📚 解説をじっくり読みましょう</li>
          <li>🔄 同じパターンの問題を繰り返し</li>
          <li>💡 文法ポイントを整理</li>
        </ul>
        <p>焦らず、一歩ずつ確実に進んでいきましょう！💪</p>
      `;
    } else {
      return `
        <h3>🌱 これから伸びていきます！</h3>
        <p><strong>${percentage}%</strong>の正答率。大丈夫、これからです！</p>
        <ul>
          <li>📖 まずは基礎をしっかり固めましょう</li>
          <li>💡 解説を丁寧に読むことが大切</li>
          <li>🎯 一つ一つの文法ポイントを理解</li>
        </ul>
        <p>諦めずに続ければ、必ず成果が出ます！一緒に頑張りましょう！😊✨</p>
      `;
    }
  },
  
  getStrictResultAdvice: function(percentage) {
    if (percentage >= 90) {
      return `
        <h3>💼 合格ライン</h3>
        <p><strong>${percentage}%</strong>。ようやく合格レベルね。</p>
        <ul>
          <li>⚠️ でも、まだ満点ではない</li>
          <li>📊 間違えた問題を完全に理解すること</li>
          <li>🎯 次は満点を目指しなさい</li>
          <li>💼 慢心は失敗の元よ</li>
        </ul>
        <p>これで満足していては、本当の目標は達成できないわ💼</p>
      `;
    } else if (percentage >= 75) {
      return `
        <h3>📊 まだまだね</h3>
        <p><strong>${percentage}%</strong>。基本はできているけど、それだけよ。</p>
        <ul>
          <li>⚡ このレベルで満足していては駄目</li>
          <li>📚 間違えた問題は二度と間違えないこと</li>
          <li>🎯 90%以上を目指すこと</li>
          <li>💼 もっと真剣に取り組みなさい</li>
        </ul>
        <p>本気で目標を達成したいなら、もっと努力が必要よ📊</p>
      `;
    } else if (percentage >= 60) {
      return `
        <h3>💼 話にならないわね</h3>
        <p><strong>${percentage}%</strong>？ この程度では及第点にも届かない。</p>
        <ul>
          <li>📖 基礎が全く足りていない</li>
          <li>🎯 解説を読むだけでなく、完全に理解すること</li>
          <li>📚 同じ問題を何度も繰り返しなさい</li>
          <li>💼 このままでは目標達成は不可能よ</li>
        </ul>
        <p>本気で変わりたいなら、今すぐ真剣に取り組むこと💼</p>
      `;
    } else {
      return `
        <h3>⚠️ 基礎から徹底的にやり直しなさい</h3>
        <p><strong>${percentage}%</strong>。これでは何も始まらない。</p>
        <ul>
          <li>📖 基礎文法を一から学び直すこと</li>
          <li>📚 解説を完全に理解するまで次に進まないこと</li>
          <li>🎯 焦らず、確実に一問ずつ理解すること</li>
          <li>💼 甘えを捨てて、本気で取り組みなさい</li>
        </ul>
        <p>厳しいことを言うけど、これがあなたのためよ。本気で頑張りなさい💼</p>
      `;
    }
  },
  
  getCuteResultAdvice: function(percentage) {
    if (percentage >= 90) {
      return `
        <h3>🎊 すっごーい！</h3>
        <p><strong>${percentage}%</strong>！お兄ちゃん/お姉ちゃん天才！</p>
        <ul>
          <li>✨ ユイ、感動しちゃった！</li>
          <li>🌟 このまま続ければ絶対大丈夫！</li>
          <li>💕 ユイも一緒に喜んでるよ！</li>
          <li>🎀 次も頑張ろうね！</li>
        </ul>
        <p>お兄ちゃん/お姉ちゃん、本当にすごいよ！ユイ、誇らしいな！🎀✨</p>
      `;
    } else if (percentage >= 75) {
      return `
        <h3>👏 やったね！</h3>
        <p><strong>${percentage}%</strong>！すごく頑張ったね！</p>
        <ul>
          <li>✨ この調子この調子！</li>
          <li>📈 どんどん上手になってるよ！</li>
          <li>🎯 次は90%目指そうね！</li>
          <li>💕 ユイも嬉しいよ！</li>
        </ul>
        <p>一緒に勉強できて、ユイ本当に楽しいな！😊✨</p>
      `;
    } else if (percentage >= 60) {
      return `
        <h3>💪 頑張ったね！</h3>
        <p><strong>${percentage}%</strong>！まあまあだね！</p>
        <ul>
          <li>📚 間違えた問題、一緒に復習しようね！</li>
          <li>🎀 解説読めば絶対わかるよ！</li>
          <li>✨ 次はもっと上を目指そうね！</li>
          <li>💕 ユイが全力で応援するから！</li>
        </ul>
        <p>ちょっとずつでいいから、一緒に成長していこうね！🎀</p>
      `;
    } else {
      return `
        <h3>💦 ちょっと難しかったね</h3>
        <p><strong>${percentage}%</strong>…うーん、ちょっと難しかったかな？</p>
        <ul>
          <li>📖 でも大丈夫！基礎から一緒に勉強しようね！</li>
          <li>💕 解説をゆっくり読んでみよう！</li>
          <li>🎀 わからないところ、ユイに聞いてね！</li>
          <li>✨ 焦らなくていいからね！</li>
        </ul>
        <p>ユイがずっと一緒にいるから安心してね！一緒に頑張ろうね！😊🎀✨</p>
      `;
    }
  },
  
  // 進捗更新時
  onProgressUpdate: function(completedTests) {
    const messages = {
      1: {
        gentle: "初めてのテスト完了、おめでとうございます！🎉",
        strict: "1回完了したわね。でも、これはスタートラインに過ぎない💼",
        cute: "やったー！初めてのテスト完了！お兄ちゃん/お姉ちゃんすごいよ！🎀"
      },
      3: {
        gentle: "3回も完了！素晴らしい継続力です！💪",
        strict: "3回完了。ペースは悪くないわ。でも満足は禁物よ💼",
        cute: "もう3回も！すっごーい！ユイも嬉しいな！✨"
      },
      5: {
        gentle: "全5回完了！本当にお疲れ様でした！🎊",
        strict: "全て完了したわね。よくやったわ。これで終わりではないけどね💼",
        cute: "全部完了！！！お兄ちゃん/お姉ちゃん最高！ユイ、超嬉しい！🎊✨"
      }
    };
    
    const personality = this.getCurrentSecretary().personality;
    const message = messages[completedTests]?.[personality];
    
    if (message) {
      this.showMessage(message, 'excited', 3000);
    }
  },
  
  // ステータスインジケーターの設定
  setStatusIndicator: function(status) {
    const indicator = document.querySelector('.secretary-status-indicator');
    if (indicator) {
      indicator.className = 'secretary-status-indicator';
      indicator.classList.add(`status-${status}`);
    }
  },
  
  // ホーム画面に戻った時
  onReturnHome: function() {
    this.setStatusIndicator('normal');
  },
  
  // ===== 3人全員の評価機能 =====
  
  // 3人全員の評価を取得
  getAllSecretariesEvaluation: function(score, total) {
    const percentage = Math.round((score / total) * 100);
    
    return {
      sakura: this.getSecretaryEvaluation('sakura', score, total, percentage),
      reina: this.getSecretaryEvaluation('reina', score, total, percentage),
      yui: this.getSecretaryEvaluation('yui', score, total, percentage)
    };
  },
  
  // 各秘書の評価を取得
  getSecretaryEvaluation: function(secretaryId, score, total, percentage) {
    const secretary = this.secretaries[secretaryId];
    const personality = secretary.personality;
    
    return {
      name: secretary.name,
      avatarUrl: secretary.avatarUrl,
      color: secretary.color,
      grade: this.getGrade(percentage, personality),
      comment: this.getEvaluationComment(percentage, personality),
      detailedAdvice: this.getDetailedEvaluation(score, total, percentage, personality)
    };
  },
  
  // 評価グレードを取得
  getGrade: function(percentage, personality) {
    if (personality === 'gentle') {
      if (percentage >= 90) return { grade: 'S', label: '優秀', color: '#10b981' };
      if (percentage >= 80) return { grade: 'A', label: '良好', color: '#3b82f6' };
      if (percentage >= 70) return { grade: 'B', label: '合格', color: '#8b5cf6' };
      if (percentage >= 60) return { grade: 'C', label: '要努力', color: '#f59e0b' };
      return { grade: 'D', label: '要復習', color: '#ef4444' };
    } else if (personality === 'strict') {
      if (percentage >= 95) return { grade: 'S', label: '合格', color: '#10b981' };
      if (percentage >= 90) return { grade: 'A', label: '及第点', color: '#3b82f6' };
      if (percentage >= 80) return { grade: 'B', label: '不十分', color: '#8b5cf6' };
      if (percentage >= 70) return { grade: 'C', label: '不合格', color: '#f59e0b' };
      return { grade: 'D', label: '論外', color: '#ef4444' };
    } else { // cute
      if (percentage >= 90) return { grade: 'S', label: 'すごい！', color: '#10b981' };
      if (percentage >= 80) return { grade: 'A', label: 'がんばった！', color: '#3b82f6' };
      if (percentage >= 70) return { grade: 'B', label: 'いいね！', color: '#8b5cf6' };
      if (percentage >= 60) return { grade: 'C', label: 'もう少し！', color: '#f59e0b' };
      return { grade: 'D', label: '一緒に頑張ろう！', color: '#ef4444' };
    }
  },
  
  // 評価コメントを取得
  getEvaluationComment: function(percentage, personality) {
    if (personality === 'gentle') {
      if (percentage >= 90) return "素晴らしい成績です！あなたの努力が実を結んでいます。この調子で頑張りましょう！✨";
      if (percentage >= 80) return "とても良い成績です！基礎がしっかり身についています。さらに上を目指せますよ！😊";
      if (percentage >= 70) return "合格ラインです！着実に成長しています。復習を重ねて、さらに伸ばしていきましょう！📚";
      if (percentage >= 60) return "もう少しです！基礎は理解できています。解説を丁寧に読んで、理解を深めましょう！💪";
      return "これからです！焦らず、一歩ずつ確実に。基礎からしっかり固めていきましょう！😊";
    } else if (personality === 'strict') {
      if (percentage >= 95) return "合格ライン。ようやく認められるレベルに到達したわね。でも、これで満足しないこと💼";
      if (percentage >= 90) return "及第点ね。基本はできている。でも、まだ伸びしろがある。95%以上を目指しなさい📊";
      if (percentage >= 80) return "不十分よ。このレベルでは本番で通用しない。90%以上を確実に取れるようになりなさい💼";
      if (percentage >= 70) return "不合格。基礎が足りていない。解説を完全に理解するまで、次に進まないこと📚";
      return "論外ね。このままでは目標達成は不可能。基礎から徹底的にやり直しなさい💼";
    } else { // cute
      if (percentage >= 90) return "すっごーい！お兄ちゃん/お姉ちゃん本当にすごいよ！ユイ、感動しちゃった！🎀✨";
      if (percentage >= 80) return "やったね！すごく頑張ったね！ユイも一緒に嬉しいよ！この調子でいこうね！😊✨";
      if (percentage >= 70) return "いいね！頑張ってるのが伝わってくるよ！一緒にもっと上を目指そうね！🎀";
      if (percentage >= 60) return "もう少しだね！でも大丈夫！ユイが全力でサポートするから、一緒に頑張ろうね！💕";
      return "ちょっと難しかったね💦 でもユイがずっと一緒にいるから安心してね！一緒に頑張ろう！🎀";
    }
  },
  
  // 詳細評価を取得
  getDetailedEvaluation: function(score, total, percentage, personality) {
    const wrongCount = total - score;
    
    if (personality === 'gentle') {
      return {
        strengths: this.getStrengths(percentage, 'gentle'),
        improvements: this.getImprovements(wrongCount, 'gentle'),
        nextSteps: this.getNextSteps(percentage, 'gentle')
      };
    } else if (personality === 'strict') {
      return {
        strengths: this.getStrengths(percentage, 'strict'),
        improvements: this.getImprovements(wrongCount, 'strict'),
        nextSteps: this.getNextSteps(percentage, 'strict')
      };
    } else {
      return {
        strengths: this.getStrengths(percentage, 'cute'),
        improvements: this.getImprovements(wrongCount, 'cute'),
        nextSteps: this.getNextSteps(percentage, 'cute')
      };
    }
  },
  
  // 強み
  getStrengths: function(percentage, personality) {
    if (personality === 'gentle') {
      if (percentage >= 90) return ["高い正答率を維持", "文法の理解が深い", "安定した実力"];
      if (percentage >= 80) return ["基礎がしっかり", "着実な成長", "継続力がある"];
      if (percentage >= 70) return ["基本は理解できている", "伸びしろがある"];
      return ["挑戦する姿勢", "学習意欲がある"];
    } else if (personality === 'strict') {
      if (percentage >= 90) return ["基本的な文法は理解している", "ある程度の実力はある"];
      if (percentage >= 80) return ["最低限の基礎はある"];
      return ["まだ評価できる段階ではない"];
    } else {
      if (percentage >= 90) return ["すごく頑張ってる！", "理解力バッチリ！", "集中力もすごい！"];
      if (percentage >= 80) return ["よく頑張ってる！", "成長してる！"];
      if (percentage >= 70) return ["頑張ってるの伝わる！", "諦めないところ！"];
      return ["一生懸命なところ！", "ユイと一緒に学んでくれてる！"];
    }
  },
  
  // 改善点
  getImprovements: function(wrongCount, personality) {
    if (personality === 'gentle') {
      if (wrongCount === 0) return ["完璧です！"];
      if (wrongCount <= 3) return ["細かいミスを減らす", "時間配分の最適化"];
      if (wrongCount <= 6) return ["間違えた問題の復習", "文法ポイントの整理"];
      if (wrongCount <= 9) return ["基礎文法の見直し", "解説の精読"];
      return ["基礎から丁寧に学習", "一問一問確実に理解"];
    } else if (personality === 'strict') {
      if (wrongCount === 0) return ["完璧。次も同じレベルを維持すること"];
      if (wrongCount <= 2) return ["ミスを完全にゼロにすること"];
      if (wrongCount <= 5) return ["不正解が多すぎる。徹底的に復習"];
      if (wrongCount <= 10) return ["基礎が不足。一から学び直すこと"];
      return ["すべてが不十分。根本的に見直すこと"];
    } else {
      if (wrongCount === 0) return ["もう完璧だね！"];
      if (wrongCount <= 3) return ["ちょっとしたミスを減らそう！"];
      if (wrongCount <= 6) return ["間違えた問題、一緒に復習しようね！"];
      if (wrongCount <= 9) return ["基礎をもう一度確認しよう！"];
      return ["一緒に基礎から勉強し直そうね！"];
    }
  },
  
  // 次のステップ
  getNextSteps: function(percentage, personality) {
    if (personality === 'gentle') {
      if (percentage >= 90) return ["より高度な問題に挑戦", "制限時間内での完答を目指す"];
      if (percentage >= 80) return ["90%以上を目標に", "弱点分野の強化"];
      if (percentage >= 70) return ["80%を目指す", "解説の理解を深める"];
      return ["まず70%を目指す", "基礎文法の復習"];
    } else if (personality === 'strict') {
      if (percentage >= 90) return ["満点を目指すこと", "1問20秒以内で解答"];
      if (percentage >= 80) return ["90%以上を確実に", "スピードアップ"];
      if (percentage >= 70) return ["80%まで引き上げること", "基礎の徹底"];
      return ["70%を最低ラインとすること", "基礎から完全にやり直し"];
    } else {
      if (percentage >= 90) return ["次も頑張ろうね！", "満点目指してみる？"];
      if (percentage >= 80) return ["90%目指して一緒に頑張ろう！"];
      if (percentage >= 70) return ["80%目指そうね！"];
      return ["一緒に少しずつ上げていこうね！"];
    }
  },
  
  // 3人の評価パネルを表示
  showAllEvaluations: function(score, total) {
    const evaluations = this.getAllSecretariesEvaluation(score, total);
    const percentage = Math.round((score / total) * 100);
    
    // 結果画面に評価パネルを追加
    const resultScreen = document.getElementById('resultScreen');
    let evalSection = document.getElementById('allSecretariesEvaluation');
    
    if (!evalSection) {
      evalSection = document.createElement('div');
      evalSection.id = 'allSecretariesEvaluation';
      evalSection.className = 'all-secretaries-evaluation';
      
      // 分析結果の後に挿入
      const analysisSection = document.querySelector('.result-analysis');
      if (analysisSection) {
        analysisSection.insertAdjacentElement('afterend', evalSection);
      } else {
        resultScreen.querySelector('.container').appendChild(evalSection);
      }
    }
    
    evalSection.innerHTML = `
      <h3 style="text-align: center; margin-bottom: 1.5rem; font-size: 1.5rem;">
        📋 3人の秘書からの評価
      </h3>
      <p style="text-align: center; color: #6b7280; margin-bottom: 2rem;">
        それぞれの視点から、あなたのパフォーマンスを評価します
      </p>
      
      <div class="secretaries-evaluation-grid">
        ${this.renderSecretaryEvaluation(evaluations.sakura, 'sakura')}
        ${this.renderSecretaryEvaluation(evaluations.reina, 'reina')}
        ${this.renderSecretaryEvaluation(evaluations.yui, 'yui')}
      </div>
    `;
  },
  
  // 各秘書の評価カードをレンダリング
  renderSecretaryEvaluation: function(evaluation, secretaryId) {
    const isCurrentSecretary = this.currentSecretary === secretaryId;
    
    return `
      <div class="secretary-evaluation-card ${isCurrentSecretary ? 'current-secretary' : ''}">
        <div class="evaluation-header">
          <img src="${evaluation.avatarUrl}" alt="${evaluation.name}">
          <div class="evaluation-header-info">
            <h4>${evaluation.name}</h4>
            ${isCurrentSecretary ? '<span class="current-badge">現在の秘書</span>' : ''}
          </div>
        </div>
        
        <div class="evaluation-grade" style="background: ${evaluation.grade.color};">
          <div class="grade-letter">${evaluation.grade.grade}</div>
          <div class="grade-label">${evaluation.grade.label}</div>
        </div>
        
        <div class="evaluation-comment">
          ${evaluation.comment}
        </div>
        
        <div class="evaluation-details">
          <div class="evaluation-section">
            <h5>✨ 良い点</h5>
            <ul>
              ${evaluation.detailedAdvice.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
          </div>
          
          <div class="evaluation-section">
            <h5>📝 改善点</h5>
            <ul>
              ${evaluation.detailedAdvice.improvements.map(i => `<li>${i}</li>`).join('')}
            </ul>
          </div>
          
          <div class="evaluation-section">
            <h5>🎯 次のステップ</h5>
            <ul>
              ${evaluation.detailedAdvice.nextSteps.map(n => `<li>${n}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  }
};

// グローバルにエクスポート（レガシー版として保持）
window.SecretaryTeamLegacy = SecretaryTeamLegacy;
// 後方互換性のため（新しいSecretaryTeamがない場合のフォールバック）
if (typeof window.SecretaryTeam === 'undefined') {
  window.SecretaryTeam = SecretaryTeamLegacy;
  window.Secretary = SecretaryTeamLegacy;
  console.log('🌐 SecretaryTeamLegacy をグローバルに公開（フォールバック）');
} else {
  console.log('✅ 新SecretaryTeamが存在するため、Legacyは補助機能として動作');
}

// DOMContentLoaded時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    SecretaryTeamLegacy.init();
  });
} else {
  SecretaryTeamLegacy.init();
}
