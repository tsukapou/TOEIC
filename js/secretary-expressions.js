// TOEIC PART5 学習サポート - 秘書の表情管理システム
// 会話内容・時間帯・状況に応じて表情画像を動的に切り替え

const SecretaryExpressions = {
  
  // 4人の秘書の表情パターンデータベース（全て基本画像に統一）
  expressions: {
    sakura: {
      // さくら（優しいサポート型）の表情パターン - 全て統一画像
      normal: 'https://www.genspark.ai/api/files/s/29bONQQe',
      happy: 'https://www.genspark.ai/api/files/s/29bONQQe',
      encouraging: 'https://www.genspark.ai/api/files/s/29bONQQe',
      caring: 'https://www.genspark.ai/api/files/s/29bONQQe',
      thinking: 'https://www.genspark.ai/api/files/s/29bONQQe',
      celebration: 'https://www.genspark.ai/api/files/s/29bONQQe',
      loving: 'https://www.genspark.ai/api/files/s/29bONQQe'
    },
    reina: {
      // レイナ（厳格・ストイック型）の表情パターン - 全て統一画像
      normal: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      strict: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      satisfied: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      professional: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      thinking: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      demanding: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
      loving: 'https://www.genspark.ai/api/files/s/U1NyyUEN'
    },
    yui: {
      // ユイ（妹系・元気型）の表情パターン - 全て統一画像
      normal: 'https://www.genspark.ai/api/files/s/t05nB1to',
      excited: 'https://www.genspark.ai/api/files/s/t05nB1to',
      cheerful: 'https://www.genspark.ai/api/files/s/t05nB1to',
      supporting: 'https://www.genspark.ai/api/files/s/t05nB1to',
      celebration: 'https://www.genspark.ai/api/files/s/t05nB1to',
      caring: 'https://www.genspark.ai/api/files/s/t05nB1to',
      loving: 'https://www.genspark.ai/api/files/s/t05nB1to'
    },
    mio: {
      // ミオ（知的・分析家型）の表情パターン - 全て統一画像
      normal: 'https://www.genspark.ai/api/files/s/HescuAmw',
      analytical: 'https://www.genspark.ai/api/files/s/HescuAmw',
      satisfied: 'https://www.genspark.ai/api/files/s/HescuAmw',
      professional: 'https://www.genspark.ai/api/files/s/HescuAmw',
      thinking: 'https://www.genspark.ai/api/files/s/HescuAmw',
      strategic: 'https://www.genspark.ai/api/files/s/HescuAmw'
    }
  },
  
  // 画像プリロード用キャッシュ
  imageCache: {},
  
  // 全ての表情画像をプリロード
  preloadAllExpressions: function() {
    console.log('🎨 秘書の表情画像をプリロード中...');
    
    Object.keys(this.expressions).forEach(secretaryId => {
      const secretary = this.expressions[secretaryId];
      this.imageCache[secretaryId] = {};
      
      Object.keys(secretary).forEach(expression => {
        const img = new Image();
        img.src = secretary[expression];
        this.imageCache[secretaryId][expression] = img;
        
        img.onload = () => {
          console.log(`✅ ${secretaryId} - ${expression} 読み込み完了`);
        };
        
        img.onerror = () => {
          console.warn(`⚠️ ${secretaryId} - ${expression} 読み込み失敗`);
        };
      });
    });
  },
  
  // 状況に応じた表情を決定
  getExpressionForContext: function(secretaryId, context) {
    const { 
      timeOfDay, 
      isCorrect, 
      isIncorrect, 
      isTestStart, 
      isTestEnd, 
      score, 
      isStartup,
      isCelebration,
      isAdvice
    } = context;
    
    // さくら（優しいサポート型）の表情ロジック
    if (secretaryId === 'sakura') {
      if (isCelebration || (isTestEnd && score >= 90)) return 'celebration';
      if (isCorrect) return 'happy';
      if (isIncorrect) return 'caring';
      if (isTestStart) return 'encouraging';
      if (isAdvice) return 'thinking';
      if (isStartup) {
        if (timeOfDay === 'earlyMorning' || timeOfDay === 'morning') return 'happy';
        if (timeOfDay === 'lateNight') return 'caring';
        return 'normal';
      }
      return 'normal';
    }
    
    // レイナ（厳格・ストイック型）の表情ロジック
    if (secretaryId === 'reina') {
      if (isCelebration || (isTestEnd && score >= 95)) return 'satisfied';
      if (isCorrect && score >= 90) return 'satisfied';
      if (isCorrect) return 'professional';
      if (isIncorrect) return 'strict';
      if (isTestStart) return 'demanding';
      if (isAdvice) return 'thinking';
      if (isStartup) {
        if (timeOfDay === 'earlyMorning') return 'satisfied';
        if (timeOfDay === 'lateNight') return 'strict';
        return 'normal';
      }
      return 'normal';
    }
    
    // ユイ（妹系・元気型）の表情ロジック
    if (secretaryId === 'yui') {
      if (isCelebration || (isTestEnd && score >= 90)) return 'celebration';
      if (isCorrect) return 'excited';
      if (isIncorrect) return 'caring';
      if (isTestStart) return 'supporting';
      if (isAdvice) return 'cheerful';
      if (isStartup) {
        if (timeOfDay === 'earlyMorning' || timeOfDay === 'morning') return 'excited';
        if (timeOfDay === 'lateNight') return 'caring';
        return 'cheerful';
      }
      return 'normal';
    }
    
    return 'normal';
  },
  
  // 表情画像を取得
  getExpressionUrl: function(secretaryId, expression) {
    if (!this.expressions[secretaryId]) {
      console.warn(`秘書 ${secretaryId} が見つかりません`);
      return null;
    }
    
    if (!this.expressions[secretaryId][expression]) {
      console.warn(`表情 ${expression} が見つかりません。normalを返します`);
      return this.expressions[secretaryId].normal;
    }
    
    return this.expressions[secretaryId][expression];
  },
  
  // 秘書の表情を更新（アニメーション付き）
  // ⚠️ 画像は統一されているため、実際の画像変更は行わず、
  // 表情の判定ログのみを出力します
  updateExpression: function(secretaryId, context) {
    const expression = this.getExpressionForContext(secretaryId, context);
    
    // SecretaryTeam（新）とSecretaryTeamLegacy（旧）の両方に対応
    let baseImageUrl = null;
    let secretaryData = null;
    
    // 旧システム（4人版）を優先 - 初期4人は旧システムを使用
    if (typeof SecretaryTeamLegacy !== 'undefined' && SecretaryTeamLegacy.secretaries && SecretaryTeamLegacy.secretaries[secretaryId]) {
      secretaryData = SecretaryTeamLegacy.secretaries[secretaryId];
      baseImageUrl = secretaryData.avatarUrl;
    }
    // フォールバック：新システム（23人版）
    else if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.secretaries && SecretaryTeam.secretaries[secretaryId]) {
      secretaryData = SecretaryTeam.secretaries[secretaryId];
      baseImageUrl = secretaryData.imageUrl || secretaryData.avatarUrl;
    }
    
    if (!baseImageUrl || !secretaryData) {
      console.warn(`⚠️ 秘書データが見つかりません: ${secretaryId}`);
      return;
    }
    
    const avatarImg = document.querySelector('.secretary-avatar img');
    if (!avatarImg) {
      console.warn('⚠️ アバター画像DOMが見つかりません');
      return;
    }
    
    // 現在表示されている画像と異なる秘書の画像の場合は更新
    const currentSrc = avatarImg.src.split('?')[0]; // クエリパラメータを除去して比較
    const newSrc = baseImageUrl.split('?')[0];
    
    if (!currentSrc.includes(newSrc.split('/').pop())) {
      avatarImg.style.transition = 'opacity 0.3s ease-in-out';
      avatarImg.style.opacity = '0';
      
      setTimeout(() => {
        avatarImg.src = baseImageUrl;
        avatarImg.style.opacity = '1';
        console.log(`🎭 秘書画像を更新: ${secretaryId} (表情: ${expression}) → ${baseImageUrl}`);
      }, 300);
    } else {
      console.log(`🎭 表情判定: ${secretaryId} → ${expression} (画像は既に正しい秘書のもの)`);
    }
  },
  
  // 画像読み込みエラー時のフォールバック処理
  handleImageError: function(img, secretaryId) {
    console.error(`❌ 画像読み込み失敗: ${img.src}`);
    
    // プレースホルダー画像（SVGデータURL）
    const placeholderSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='24' fill='%236b7280'%3E${secretaryId || '秘書'}%3C/text%3E%3C/svg%3E`;
    
    img.src = placeholderSVG;
    img.onerror = null; // 無限ループ防止
    
    // ユーザーに通知（トースト的な表示）
    this.showImageErrorNotification(secretaryId);
  },
  
  // 画像エラー通知を表示
  showImageErrorNotification: function(secretaryId) {
    // 既に通知が表示されている場合はスキップ
    if (document.getElementById('imageErrorNotification')) return;
    
    const notification = document.createElement('div');
    notification.id = 'imageErrorNotification';
    notification.style.cssText = `
      position: fixed;
      top: 4rem;
      right: 1rem;
      background: rgba(239, 68, 68, 0.95);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-size: 0.875rem;
      max-width: 300px;
      backdrop-filter: blur(10px);
    `;
    notification.innerHTML = `
      <strong>⚠️ 画像読み込みエラー</strong><br>
      秘書の画像を読み込めませんでした。<br>
      <small>ページを再読み込みしてください。</small>
    `;
    
    document.body.appendChild(notification);
    
    // 5秒後に自動消去
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s ease';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  },
  
  // グローバルな画像エラーハンドラーを設定
  setupGlobalImageErrorHandler: function() {
    // 秘書アバター画像のエラーハンドリング
    const avatarImg = document.querySelector('.secretary-avatar img');
    if (avatarImg) {
      avatarImg.addEventListener('error', (e) => {
        console.error('❌ 秘書アバター画像読み込み失敗:', e.target.src);
        this.handleImageError(e.target, 'アバター');
      });
    }
    
    // 全ての秘書画像にエラーハンドラーを設定
    document.addEventListener('DOMContentLoaded', () => {
      const allSecretaryImages = document.querySelectorAll('img[src*="genspark.ai"]');
      allSecretaryImages.forEach(img => {
        img.addEventListener('error', (e) => {
          console.error('❌ 秘書画像読み込み失敗:', e.target.src);
          this.handleImageError(e.target, '秘書');
        });
      });
    });
  },
  
  // 初期化
  initialize: function() {
    console.log('🎨 秘書表情システム初期化中...');
    this.preloadAllExpressions();
    this.setupGlobalImageErrorHandler();
  }
};

// グローバルにエクスポート
window.SecretaryExpressions = SecretaryExpressions;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    SecretaryExpressions.initialize();
  });
} else {
  SecretaryExpressions.initialize();
}
