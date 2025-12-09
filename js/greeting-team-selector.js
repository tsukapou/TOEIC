/**
 * 🌅 グリーティングチーム選択システム
 * 
 * 起動時の挨拶を担当する秘書を3人まで選択できる機能
 */

const GreetingTeamSelector = {
  
  // LocalStorageキー
  STORAGE_KEY: 'greetingTeamMembers',
  
  // 最大選択可能人数
  MAX_MEMBERS: 3,
  
  // ==================== 初期化 ====================
  
  init() {
    console.log('🌅 グリーティングチーム選択システム初期化中...');
    
    // 初期設定を確認（デフォルトは設定しない）
    const currentTeam = this.getGreetingTeam();
    
    console.log(`✅ グリーティングチーム: ${currentTeam.length}人`);
  },
  
  // ==================== グリーティングチーム取得 ====================
  
  /**
   * 現在のグリーティングチームを取得
   * @returns {Array<string>} 秘書IDの配列（最大3人）
   */
  getGreetingTeam() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('❌ グリーティングチーム読み込みエラー:', e);
        return [];
      }
    }
    return [];
  },
  
  /**
   * デフォルトチームを設定（初回起動時）
   */
  setDefaultTeam() {
    // 解除済みの秘書から最初の3人を自動選択
    if (typeof SecretaryTeam !== 'undefined' && typeof SecretaryTeam.getUnlockedSecretaries === 'function') {
      try {
        const unlockedSecretaries = SecretaryTeam.getUnlockedSecretaries();
        console.log('📋 解除済み秘書:', unlockedSecretaries);
        
        // 配列形式に変換（オブジェクトの場合もある）
        let secretaryArray = Array.isArray(unlockedSecretaries) 
          ? unlockedSecretaries 
          : Object.values(unlockedSecretaries);
        
        // IDを抽出
        const defaultTeam = secretaryArray
          .slice(0, this.MAX_MEMBERS)
          .map(s => s.id || s)
          .filter(id => id != null);
        
        if (defaultTeam.length > 0) {
          this.saveGreetingTeam(defaultTeam);
          console.log('🎯 デフォルトグリーティングチームを設定:', defaultTeam);
          return;
        }
      } catch (e) {
        console.error('❌ デフォルトチーム設定エラー:', e);
      }
    }
    
    // フォールバック: 初期3人
    this.saveGreetingTeam(['sakura', 'reina', 'yui']);
    console.log('🎯 フォールバックグリーティングチーム: sakura, reina, yui');
  },
  
  // ==================== グリーティングチーム設定 ====================
  
  /**
   * グリーティングチームを保存
   * @param {Array<string>} secretaryIds - 秘書IDの配列
   */
  saveGreetingTeam(secretaryIds) {
    // 最大3人まで
    const team = secretaryIds.slice(0, this.MAX_MEMBERS);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(team));
    console.log('💾 グリーティングチーム保存:', team);
  },
  
  /**
   * 秘書をグリーティングチームに追加
   * @param {string} secretaryId - 秘書ID
   * @returns {boolean} 成功した場合true
   */
  addToGreetingTeam(secretaryId) {
    const currentTeam = this.getGreetingTeam();
    
    // 既に含まれている場合は何もしない
    if (currentTeam.includes(secretaryId)) {
      console.log(`⚠️ ${secretaryId} は既にグリーティングチームに含まれています`);
      return false;
    }
    
    // 最大人数チェック
    if (currentTeam.length >= this.MAX_MEMBERS) {
      console.log(`⚠️ グリーティングチームは既に${this.MAX_MEMBERS}人です`);
      return false;
    }
    
    // 追加
    currentTeam.push(secretaryId);
    this.saveGreetingTeam(currentTeam);
    console.log(`✅ ${secretaryId} をグリーティングチームに追加`);
    return true;
  },
  
  /**
   * 秘書をグリーティングチームから削除
   * @param {string} secretaryId - 秘書ID
   * @returns {boolean} 成功した場合true
   */
  removeFromGreetingTeam(secretaryId) {
    const currentTeam = this.getGreetingTeam();
    const index = currentTeam.indexOf(secretaryId);
    
    if (index === -1) {
      console.log(`⚠️ ${secretaryId} はグリーティングチームに含まれていません`);
      return false;
    }
    
    // 削除
    currentTeam.splice(index, 1);
    this.saveGreetingTeam(currentTeam);
    console.log(`✅ ${secretaryId} をグリーティングチームから削除`);
    return true;
  },
  
  /**
   * グリーティングチームに含まれているか確認
   * @param {string} secretaryId - 秘書ID
   * @returns {boolean}
   */
  isInGreetingTeam(secretaryId) {
    const currentTeam = this.getGreetingTeam();
    return currentTeam.includes(secretaryId);
  },
  
  /**
   * グリーティングチームのトグル（追加/削除を切り替え）
   * @param {string} secretaryId - 秘書ID
   * @returns {boolean} 追加された場合true、削除された場合false
   */
  toggleGreetingTeam(secretaryId) {
    if (this.isInGreetingTeam(secretaryId)) {
      this.removeFromGreetingTeam(secretaryId);
      return false;
    } else {
      const success = this.addToGreetingTeam(secretaryId);
      return success;
    }
  },
  
  // ==================== グリーティング実行用 ====================
  
  /**
   * グリーティングチームの秘書情報を取得
   * @returns {Array<Object>} 秘書オブジェクトの配列
   */
  getGreetingTeamSecretaries() {
    const team = this.getGreetingTeam();
    
    if (typeof SecretaryTeam === 'undefined') {
      console.warn('⚠️ SecretaryTeamが未定義です');
      return [];
    }
    
    const allSecretaries = SecretaryTeam.getAllSecretaries();
    const teamSecretaries = [];
    
    for (const secretaryId of team) {
      const secretary = allSecretaries.find(s => s.id === secretaryId);
      if (secretary) {
        teamSecretaries.push(secretary);
      }
    }
    
    return teamSecretaries;
  },
  
  /**
   * グリーティングチームが有効か確認
   * @returns {boolean}
   */
  isTeamValid() {
    const team = this.getGreetingTeam();
    return team.length > 0 && team.length <= this.MAX_MEMBERS;
  },
  
  /**
   * グリーティングチームの統計情報を取得
   * @returns {Object}
   */
  getTeamStats() {
    const team = this.getGreetingTeam();
    const teamSecretaries = this.getGreetingTeamSecretaries();
    
    return {
      memberCount: team.length,
      maxMembers: this.MAX_MEMBERS,
      remainingSlots: this.MAX_MEMBERS - team.length,
      members: teamSecretaries.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type
      }))
    };
  }
};

// グローバルに公開
window.GreetingTeamSelector = GreetingTeamSelector;

console.log('✅ GreetingTeamSelector module loaded');
