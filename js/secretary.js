// TOEIC PART5 学習サポート秘書システム
// 専属女性秘書「さくら」があなたの学習をサポートします！

const Secretary = {
  name: "さくら",
  state: {
    currentMood: "normal", // normal, happy, excited, encouraging, thoughtful
    lastMessage: "",
    messageHistory: [],
    interactionCount: 0
  },
  
  // 秘書の画像URL
  avatarUrl: "https://sspark.genspark.ai/cfimages?u1=dPnUkbgg6mCbmisyxqk7W62kxexoOYu3gCZqEL80fMi4XW8FYUOKA3ET00mi6jKr2j%2FoyYHFWaqw67RRzQXGcic%2FKysvj%2BL%2Bk82c9%2FzU5pMvJHY926Equ6HNlccnI01%2FpLZBc7ymQsva3Tf9nd4b14AFXlDZPJEncVR%2BJef3Kq2torJZIKe9jyhLAP8XrInY6q%2BrBTlhGP%2B32a6NAuFqgC2MWkNH6r7pbinkFeI6SPQ%3D&u2=GRnKvzVI%2B1Lhgp%2BZ&width=2560",
  
  // 初期化
  init: function() {
    this.createSecretaryUI();
    this.showWelcomeMessage();
    this.attachEventListeners();
  },
  
  // 秘書UIの作成
  createSecretaryUI: function() {
    const secretaryHTML = `
      <div id="secretary-container" class="secretary-container">
        <!-- 秘書のアバター -->
        <div class="secretary-avatar" id="secretaryAvatar">
          <img src="${this.avatarUrl}" alt="${this.name}">
          <div class="secretary-status-indicator"></div>
        </div>
        
        <!-- メッセージバルーン -->
        <div class="secretary-message-balloon hidden" id="secretaryBalloon">
          <div class="secretary-message-content" id="secretaryMessageContent">
            こんにちは！私は${this.name}です。あなたのTOEIC学習をサポートします！💼
          </div>
          <button class="secretary-close-btn" onclick="Secretary.hideMessage()">×</button>
        </div>
        
        <!-- アドバイスパネル -->
        <div class="secretary-advice-panel hidden" id="secretaryAdvicePanel">
          <div class="advice-header">
            <span>📋 ${this.name}からのアドバイス</span>
            <button onclick="Secretary.closeAdvicePanel()">×</button>
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
    }
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
    
    // アバターにアニメーション
    const avatar = document.getElementById('secretaryAvatar');
    avatar.classList.add('secretary-bounce');
    setTimeout(() => avatar.classList.remove('secretary-bounce'), 600);
  },
  
  // 現在の画面を取得
  getCurrentScreen: function() {
    if (document.getElementById('homeScreen').classList.contains('active')) {
      return 'home';
    } else if (document.getElementById('questionScreen').classList.contains('active')) {
      return 'question';
    } else if (document.getElementById('resultScreen').classList.contains('active')) {
      return 'result';
    }
    return 'home';
  },
  
  // ウェルカムメッセージ
  showWelcomeMessage: function() {
    setTimeout(() => {
      this.showMessage(
        `こんにちは！私は${this.name}です✨<br>` +
        `あなたのTOEIC PART5学習を全力でサポートします！💼`,
        'normal',
        5000
      );
    }, 1000);
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
    
    const balloon = document.getElementById('secretaryBalloon');
    const content = document.getElementById('secretaryMessageContent');
    
    if (content) {
      content.innerHTML = message;
      balloon.classList.remove('hidden');
      balloon.classList.add('secretary-fade-in');
      
      // 一定時間後に自動的に消える
      if (duration > 0) {
        setTimeout(() => {
          this.hideMessage();
        }, duration);
      }
    }
  },
  
  // メッセージを隠す
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
    
    if (content) {
      content.innerHTML = advice;
      panel.classList.remove('hidden');
      panel.classList.add('secretary-slide-in');
    }
  },
  
  // アドバイスパネルを閉じる
  closeAdvicePanel: function() {
    const panel = document.getElementById('secretaryAdvicePanel');
    panel.classList.add('secretary-slide-out');
    setTimeout(() => {
      panel.classList.add('hidden');
      panel.classList.remove('secretary-slide-in', 'secretary-slide-out');
    }, 300);
  },
  
  // ホーム画面のアドバイス
  getHomeAdvice: function() {
    const progress = typeof getProgress === 'function' ? getProgress() : { tests: {} };
    const completedTests = Object.keys(progress.tests || {}).length;
    
    if (completedTests === 0) {
      return `
        <h3>🌟 学習を始めましょう！</h3>
        <p>まずはTest 1から始めることをおすすめします！</p>
        <ul>
          <li>📝 <strong>30問×5回</strong>の実践形式</li>
          <li>🎲 毎回<strong>ランダム出題</strong>で新鮮</li>
          <li>💡 詳しい解説で理解を深める</li>
          <li>📊 スコア予測で実力を把握</li>
        </ul>
        <p>自分のペースで進めてくださいね！😊</p>
      `;
    } else if (completedTests < 3) {
      return `
        <h3>👏 順調です！</h3>
        <p>すでに<strong>${completedTests}回</strong>のテストを完了しましたね！素晴らしい継続力です！</p>
        <ul>
          <li>✨ 間違えた問題の解説を復習しましょう</li>
          <li>🎯 正答率<strong>80%以上</strong>を目指しましょう</li>
          <li>⏱️ 時間配分も意識してみてください（1問30秒）</li>
        </ul>
        <p>この調子で頑張りましょう！応援しています！💪</p>
      `;
    } else {
      return `
        <h3>🎊 素晴らしい！</h3>
        <p><strong>${completedTests}回</strong>も完了！あなたの努力は必ず実を結びます！</p>
        <ul>
          <li>🌟 苦手な問題タイプを確認しましょう</li>
          <li>📈 スコアの推移をチェック</li>
          <li>🔄 再挑戦でベストスコアを更新</li>
          <li>💡 出題意図を理解して応用力UP</li>
        </ul>
        <p>目標達成まであと少しです！一緒に頑張りましょう！🌈</p>
      `;
    }
  },
  
  // 問題画面のアドバイス
  getQuestionAdvice: function() {
    return `
      <h3>💡 問題を解くコツ</h3>
      <p>焦らず、落ち着いて問題を読みましょう！</p>
      <ul>
        <li>📖 <strong>問題文を丁寧に読む</strong><br>
          主語、動詞、空欄の位置を確認</li>
        <li>🔍 <strong>文法ポイントを見つける</strong><br>
          品詞？時制？前置詞？</li>
        <li>✅ <strong>選択肢を比較する</strong><br>
          何が違うのかを意識</li>
        <li>💭 <strong>意味を考える</strong><br>
          文全体の意味が通るかチェック</li>
      </ul>
      <p><strong>解説をしっかり読む</strong>ことで、次から同じパターンの問題が解けるようになりますよ！📚</p>
      <p>私はいつもあなたを応援しています！頑張ってください！😊✨</p>
    `;
  },
  
  // 結果画面のアドバイス
  getResultAdvice: function() {
    const score = typeof AppState !== 'undefined' ? AppState.score : 0;
    const percentage = Math.round((score / 30) * 100);
    
    if (percentage >= 90) {
      return `
        <h3>🎉 素晴らしい成績です！</h3>
        <p><strong>${percentage}%</strong>の正答率！完璧に近いです！</p>
        <ul>
          <li>🌟 あなたの実力は本物です！</li>
          <li>📊 この調子なら高スコアが期待できます</li>
          <li>💪 さらに上を目指して次のテストへ</li>
          <li>📝 間違えた問題も必ず復習を</li>
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
          <li>💡 出題意図を理解して応用力UP</li>
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
          <li>📝 間違えた問題は必ず復習</li>
        </ul>
        <p>焦らず、一歩ずつ確実に進んでいきましょう！私が付いています！💪</p>
      `;
    } else {
      return `
        <h3>🌱 これから伸びていきます！</h3>
        <p><strong>${percentage}%</strong>の正答率。大丈夫、これからです！</p>
        <ul>
          <li>📖 まずは基礎をしっかり固めましょう</li>
          <li>💡 解説を丁寧に読むことが大切</li>
          <li>🎯 一つ一つの文法ポイントを理解</li>
          <li>🔄 復習を重ねて定着させる</li>
          <li>⏰ 焦らず自分のペースで</li>
        </ul>
        <p>最初は誰でも苦労します。諦めずに続ければ、必ず成果が出ます！<br>私も全力でサポートしますから、一緒に頑張りましょう！😊✨</p>
      `;
    }
  },
  
  // 正解時のリアクション
  onCorrectAnswer: function() {
    const messages = [
      "正解です！素晴らしい！✨",
      "その調子です！完璧ですね！🎉",
      "やりましたね！よく理解しています！👏",
      "すごい！正解です！😊",
      "完璧な解答です！その調子！💯"
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showMessage(message, 'happy', 2000);
    
    // ステータスインジケーターを緑に
    this.setStatusIndicator('success');
  },
  
  // 不正解時のリアクション
  onIncorrectAnswer: function() {
    const messages = [
      "大丈夫！解説を読んで理解を深めましょう！📚",
      "間違いから学べます！次は正解できますよ！💪",
      "落ち込まないで！復習すれば必ずできます！😊",
      "解説をしっかり読めば大丈夫！応援しています！✨",
      "こういう問題は要復習ですね！頑張りましょう！📝"
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showMessage(message, 'encouraging', 2500);
    
    // ステータスインジケーターをオレンジに
    this.setStatusIndicator('warning');
  },
  
  // テスト開始時
  onTestStart: function() {
    this.showMessage(
      "テスト開始です！一問一問丁寧に解いていきましょう！<br>私も一緒に応援しています！頑張ってください！💪✨",
      'excited',
      3000
    );
    this.setStatusIndicator('active');
  },
  
  // テスト終了時
  onTestFinish: function(score, total) {
    const percentage = Math.round((score / total) * 100);
    let message = "";
    
    if (percentage >= 90) {
      message = `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>素晴らしい成績です！本当によく頑張りました！🎉✨`;
    } else if (percentage >= 75) {
      message = `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>良い成績です！この調子で続けましょう！👏😊`;
    } else if (percentage >= 60) {
      message = `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>着実に成長しています！復習して次に活かしましょう！📚✨`;
    } else {
      message = `お疲れ様でした！<br><strong>${score}/${total}問正解</strong>（${percentage}%）！<br>まだまだこれから！解説をしっかり読んで、次に繋げましょう！💪😊`;
    }
    
    this.showMessage(message, 'thoughtful', 4000);
    this.setStatusIndicator('normal');
  },
  
  // 進捗更新時
  onProgressUpdate: function(completedTests) {
    if (completedTests === 1) {
      this.showMessage(
        "初めてのテスト完了、おめでとうございます！🎉<br>この調子で続けていきましょう！",
        'happy',
        3000
      );
    } else if (completedTests === 3) {
      this.showMessage(
        "3回も完了！素晴らしい継続力です！💪<br>着実に実力がついていますよ！",
        'excited',
        3000
      );
    } else if (completedTests === 5) {
      this.showMessage(
        "全5回完了！本当にお疲れ様でした！🎊<br>あなたの努力は必ず実を結びます！最高です！✨",
        'excited',
        4000
      );
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
  
  // 励ましメッセージ（長時間経過時）
  showEncouragementMessage: function() {
    const messages = [
      "問題を解くのに時間がかかっていますね。焦らず、じっくり考えて大丈夫ですよ！😊",
      "難しい問題ですか？解説を読めば必ず理解できます！頑張りましょう！💪",
      "集中が切れていませんか？深呼吸して、落ち着いて取り組みましょう！✨"
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showMessage(message, 'encouraging', 3000);
  },
  
  // ホーム画面に戻った時
  onReturnHome: function() {
    this.setStatusIndicator('normal');
  }
};

// DOMContentLoaded時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    Secretary.init();
  });
} else {
  Secretary.init();
}

// グローバルにエクスポート
window.Secretary = Secretary;
