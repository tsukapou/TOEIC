// TOEIC PART5 学習サポート - データ同期システム
// 端末間での学習履歴の引継ぎ（エクスポート/インポート/クリップボード）

const DataSync = {
  
  VERSION: '1.0.0',
  CLIPBOARD_PREFIX: 'TOEIC_DATA_V1:',
  
  // エクスポート対象のローカルストレージキー
  STORAGE_KEYS: [
    'toeic_part5_progress',           // テスト進捗（app.js）
    'toeic_part5_scores',             // スコア履歴（app.js）
    'toeic_selected_secretary',       // 選択中の秘書
    'toeic_unlocked_secretaries',     // 解放済み秘書
    'toeic_wrong_answers',            // 間違えた問題（review-system.js）
    'toeic_review_progress',          // 復習進捗
    'toeic_streak_data',              // 学習ストリーク
    'toeic_daily_missions',           // デイリーミッション
    'toeic_point_rewards',            // ポイント報酬
    'toeic_weakness_analysis',        // 弱点分析データ（weakness-analysis.js）
    'toeic_pattern_progress',         // 解法パターン進捗
    'toeic_secretary_daily_last',     // 秘書デイリー会話
    'toeic_reward_achievements',      // 達成記録
    'toeic_user_profile'              // ユーザープロフィール
  ],
  
  // 全データをエクスポート
  exportAllData: function() {
    console.log('📤 データエクスポート開始...');
    
    const exportData = {
      version: this.VERSION,
      exportDate: new Date().toISOString(),
      exportTimestamp: Date.now(),
      data: {}
    };
    
    // 各キーのデータを収集
    this.STORAGE_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          // JSON形式で保存されているデータはパース
          exportData.data[key] = JSON.parse(value);
        } catch (e) {
          // 文字列データはそのまま
          exportData.data[key] = value;
        }
      }
    });
    
    console.log('✅ エクスポート完了:', Object.keys(exportData.data).length + '件');
    return exportData;
  },
  
  // JSON文字列としてエクスポート
  exportToJSON: function() {
    const data = this.exportAllData();
    return JSON.stringify(data, null, 2);
  },
  
  // ファイルとしてダウンロード
  downloadAsFile: function() {
    const jsonData = this.exportToJSON();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `toeic_learning_data_${currentDate}.json`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
    
    console.log('💾 ファイルをダウンロードしました:', filename);
    return filename;
  },
  
  // データをインポート
  importData: function(importData, options = {}) {
    console.log('📥 データインポート開始...');
    
    const {
      overwrite = false,      // 既存データを上書き
      merge = true,           // データをマージ
      validate = true         // データ検証
    } = options;
    
    // バージョン確認
    if (validate && importData.version !== this.VERSION) {
      console.warn('⚠️ バージョンが異なります:', importData.version, '→', this.VERSION);
      if (!confirm(`データのバージョンが異なります（${importData.version}）。インポートを続行しますか？`)) {
        return { success: false, message: 'ユーザーによりキャンセルされました' };
      }
    }
    
    // データ検証
    if (validate) {
      const validation = this.validateImportData(importData);
      if (!validation.valid) {
        console.error('❌ データ検証エラー:', validation.errors);
        return { success: false, message: 'データが不正です', errors: validation.errors };
      }
    }
    
    let importCount = 0;
    let skipCount = 0;
    const errors = [];
    
    // 各キーのデータをインポート
    Object.keys(importData.data).forEach(key => {
      try {
        const value = importData.data[key];
        const existingValue = localStorage.getItem(key);
        
        // 上書き確認
        if (existingValue && !overwrite && !merge) {
          console.log(`⏭️ スキップ: ${key}（既存データあり）`);
          skipCount++;
          return;
        }
        
        // マージロジック
        if (merge && existingValue) {
          const mergedValue = this.mergeData(key, existingValue, value);
          localStorage.setItem(key, typeof mergedValue === 'string' ? mergedValue : JSON.stringify(mergedValue));
        } else {
          // 単純な上書き
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        }
        
        importCount++;
        console.log(`✅ インポート: ${key}`);
        
      } catch (error) {
        console.error(`❌ インポートエラー: ${key}`, error);
        errors.push({ key, error: error.message });
      }
    });
    
    console.log('✅ インポート完了:', importCount + '件', '/ スキップ:', skipCount + '件');
    
    return {
      success: true,
      message: `${importCount}件のデータをインポートしました`,
      importCount,
      skipCount,
      errors: errors.length > 0 ? errors : null
    };
  },
  
  // ファイルからインポート
  importFromFile: function(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          const result = this.importData(jsonData, options);
          resolve(result);
        } catch (error) {
          console.error('❌ ファイル読み込みエラー:', error);
          reject({ success: false, message: 'ファイルの読み込みに失敗しました', error: error.message });
        }
      };
      
      reader.onerror = () => {
        reject({ success: false, message: 'ファイルの読み込みに失敗しました' });
      };
      
      reader.readAsText(file);
    });
  },
  
  // データのマージロジック
  mergeData: function(key, existingValue, newValue) {
    try {
      const existing = typeof existingValue === 'string' ? JSON.parse(existingValue) : existingValue;
      const newData = typeof newValue === 'string' ? JSON.parse(newValue) : newValue;
      
      // キーごとのマージロジック
      switch (key) {
        case 'toeic_part5_progress':
          // テスト進捗：より良いスコアを保持
          return this.mergeTestProgress(existing, newData);
        
        case 'toeic_streak_data':
          // ストリーク：最長記録を保持、学習日を統合
          return this.mergeStreakData(existing, newData);
        
        case 'toeic_daily_missions':
          // デイリーミッション：累計ポイントを合算
          return this.mergeDailyMissions(existing, newData);
        
        case 'toeic_wrong_answers':
          // 間違えた問題：統合（重複排除）
          return this.mergeWrongAnswers(existing, newData);
        
        case 'toeic_unlocked_secretaries':
          // 解放済み秘書：統合
          if (Array.isArray(existing) && Array.isArray(newData)) {
            return [...new Set([...existing, ...newData])];
          } else {
            return newData;
          }
        
        default:
          // その他：新しいデータを優先
          return newData;
      }
    } catch (error) {
      console.error('マージエラー:', key, error);
      return newValue;
    }
  },
  
  // テスト進捗のマージ
  mergeTestProgress: function(existing, newData) {
    // { tests: { testNum: { score, predictedScore, ... } } } 形式
    const merged = { tests: {} };
    
    // 既存データの統合
    if (existing && existing.tests) {
      merged.tests = { ...existing.tests };
    }
    
    // 新データの統合（より良いスコアを保持）
    if (newData && newData.tests) {
      Object.keys(newData.tests).forEach(testNum => {
        if (!merged.tests[testNum] || (newData.tests[testNum].score > merged.tests[testNum].score)) {
          merged.tests[testNum] = newData.tests[testNum];
        }
      });
    }
    
    return merged;
  },
  
  // ストリークデータのマージ
  mergeStreakData: function(existing, newData) {
    // 学習日履歴の統合（重複排除）
    const mergedHistory = [...new Set([
      ...(existing.studyHistory || existing.studyDates || []),
      ...(newData.studyHistory || newData.studyDates || [])
    ])];
    
    // 日付ごとの勉強時間を統合（より長い時間を保持）
    const mergedTimeHistory = {};
    const existingTimeHistory = existing.studyTimeHistory || {};
    const newTimeHistory = newData.studyTimeHistory || {};
    
    // 既存の時間を追加
    Object.keys(existingTimeHistory).forEach(date => {
      mergedTimeHistory[date] = existingTimeHistory[date];
    });
    
    // 新しい時間を追加（より長い時間を優先）
    Object.keys(newTimeHistory).forEach(date => {
      if (!mergedTimeHistory[date] || newTimeHistory[date] > mergedTimeHistory[date]) {
        mergedTimeHistory[date] = newTimeHistory[date];
      }
    });
    
    // 総勉強時間の計算（マージされた時間履歴から算出）
    const totalStudyTime = Object.values(mergedTimeHistory).reduce((sum, time) => sum + time, 0);
    
    return {
      currentStreak: Math.max(existing.currentStreak || 0, newData.currentStreak || 0),
      longestStreak: Math.max(existing.longestStreak || 0, newData.longestStreak || 0),
      totalStudyDays: mergedHistory.length,
      lastStudyDate: this.getLatestDate(existing.lastStudyDate, newData.lastStudyDate),
      studyHistory: mergedHistory,
      totalStudyTime: totalStudyTime,  // ★ 総勉強時間を含める
      studyTimeHistory: mergedTimeHistory  // ★ 日付ごとの時間履歴を含める
    };
  },
  
  // 最新の日付を取得
  getLatestDate: function(date1, date2) {
    if (!date1) return date2;
    if (!date2) return date1;
    // YYYY-MM-DD形式の文字列比較
    return date1 > date2 ? date1 : date2;
  },
  
  // デイリーミッションのマージ
  mergeDailyMissions: function(existing, newData) {
    return {
      ...newData,
      totalPoints: (existing.totalPoints || 0) + (newData.totalPoints || 0),
      history: [...(existing.history || []), ...(newData.history || [])]
    };
  },
  
  // 間違えた問題のマージ
  mergeWrongAnswers: function(existing, newData) {
    if (!Array.isArray(existing)) existing = [];
    if (!Array.isArray(newData)) newData = [];
    
    const merged = [...existing];
    
    newData.forEach(newAnswer => {
      const existingIndex = merged.findIndex(a => a.questionId === newAnswer.questionId);
      if (existingIndex === -1) {
        // 新しい問題を追加
        merged.push(newAnswer);
      } else {
        // 間違い回数が多い方を保持、または最新データを優先
        const existingWrongCount = merged[existingIndex].mistakeCount || merged[existingIndex].wrongCount || 0;
        const newWrongCount = newAnswer.mistakeCount || newAnswer.wrongCount || 0;
        
        if (newWrongCount > existingWrongCount) {
          merged[existingIndex] = newAnswer;
        }
      }
    });
    
    return merged;
  },
  
  // データ検証
  validateImportData: function(data) {
    const errors = [];
    
    // 基本構造の確認
    if (!data.version) {
      errors.push('バージョン情報がありません');
    }
    
    if (!data.data || typeof data.data !== 'object') {
      errors.push('データ形式が不正です');
    }
    
    // 各キーの検証
    if (data.data) {
      Object.keys(data.data).forEach(key => {
        if (!this.STORAGE_KEYS.includes(key)) {
          console.warn('⚠️ 未知のキー:', key);
        }
      });
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  },
  
  // データサマリーを表示
  getDataSummary: function(data) {
    const summary = {
      version: data.version,
      exportDate: data.exportDate,
      itemCount: Object.keys(data.data).length,
      items: []
    };
    
    // 各データの詳細
    if (data.data.toeic_part5_progress) {
      const progress = data.data.toeic_part5_progress;
      const testCount = progress.tests ? Object.keys(progress.tests).length : 0;
      summary.items.push({
        name: 'テスト進捗',
        value: `${testCount}テスト完了`
      });
    }
    
    if (data.data.toeic_streak_data) {
      const streak = data.data.toeic_streak_data;
      summary.items.push({
        name: '学習ストリーク',
        value: `最長${streak.longestStreak}日 / 総${streak.totalDays}日`
      });
    }
    
    if (data.data.toeic_daily_missions) {
      const missions = data.data.toeic_daily_missions;
      summary.items.push({
        name: 'デイリーポイント',
        value: `${missions.totalPoints}pt`
      });
    }
    
    if (data.data.toeic_wrong_answers) {
      summary.items.push({
        name: '復習問題',
        value: `${data.data.toeic_wrong_answers.length}問`
      });
    }
    
    if (data.data.toeic_unlocked_secretaries) {
      summary.items.push({
        name: '解放済み秘書',
        value: data.data.toeic_unlocked_secretaries.join('、')
      });
    }
    
    return summary;
  },
  
  // データクリア（確認付き）
  clearAllData: function() {
    if (!confirm('⚠️ 全ての学習データを削除します。この操作は取り消せません。\n\n本当に削除しますか？')) {
      return { success: false, message: 'キャンセルされました' };
    }
    
    if (!confirm('⚠️ 最終確認：全データを削除します。よろしいですか？')) {
      return { success: false, message: 'キャンセルされました' };
    }
    
    this.STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('🗑️ 全データを削除しました');
    return { success: true, message: '全データを削除しました' };
  },
  
  // クリップボードにコピー
  copyToClipboard: async function() {
    try {
      console.log('📋 クリップボードにコピー開始...');
      
      // データをエクスポート
      const data = this.exportAllData();
      const jsonString = JSON.stringify(data);
      
      // データを圧縮（Base64エンコード）
      let compressed;
      if (typeof LZString !== 'undefined') {
        compressed = LZString.compressToBase64(jsonString);
        console.log(`  圧縮率: ${jsonString.length} → ${compressed.length} (${Math.round((1 - compressed.length / jsonString.length) * 100)}%削減)`);
      } else {
        // LZ-Stringが利用できない場合は通常のBase64
        compressed = btoa(unescape(encodeURIComponent(jsonString)));
        console.warn('⚠️ LZ-Stringが利用できません。通常のBase64を使用します。');
      }
      
      // プレフィックスを追加
      const clipboardText = this.CLIPBOARD_PREFIX + compressed;
      
      // クリップボードにコピー
      await navigator.clipboard.writeText(clipboardText);
      
      console.log('✅ クリップボードにコピーしました');
      return { 
        success: true, 
        message: 'クリップボードにコピーしました',
        size: clipboardText.length
      };
      
    } catch (error) {
      console.error('❌ クリップボードコピーエラー:', error);
      return { 
        success: false, 
        message: 'クリップボードへのコピーに失敗しました: ' + error.message 
      };
    }
  },
  
  // クリップボードから貼り付け
  pasteFromClipboard: async function(options = {}) {
    try {
      console.log('📋 クリップボードから読み込み開始...');
      
      // クリップボードから読み取り
      const clipboardText = await navigator.clipboard.readText();
      
      // プレフィックスチェック
      if (!clipboardText.startsWith(this.CLIPBOARD_PREFIX)) {
        throw new Error('TOEICデータではありません。正しいデータをコピーしてください。');
      }
      
      // プレフィックスを除去
      const compressed = clipboardText.substring(this.CLIPBOARD_PREFIX.length);
      
      // 解凍
      let jsonString;
      if (typeof LZString !== 'undefined') {
        jsonString = LZString.decompressFromBase64(compressed);
        if (!jsonString) {
          throw new Error('データの解凍に失敗しました');
        }
      } else {
        // LZ-Stringが利用できない場合は通常のBase64
        jsonString = decodeURIComponent(escape(atob(compressed)));
      }
      
      // JSONパース
      const data = JSON.parse(jsonString);
      
      console.log('✅ データを読み込みました');
      
      // インポート実行
      const result = this.importData(data, options);
      
      return result;
      
    } catch (error) {
      console.error('❌ クリップボード読み込みエラー:', error);
      return { 
        success: false, 
        message: 'クリップボードからの読み込みに失敗しました: ' + error.message 
      };
    }
  },
  
  // テキストエリアから読み込み（手動ペースト用）
  importFromText: function(text, options = {}) {
    try {
      console.log('📝 テキストからデータ読み込み開始...');
      
      // プレフィックスチェック
      if (!text.startsWith(this.CLIPBOARD_PREFIX)) {
        throw new Error('TOEICデータではありません。正しいデータを貼り付けてください。');
      }
      
      // プレフィックスを除去
      const compressed = text.substring(this.CLIPBOARD_PREFIX.length);
      
      // 解凍
      let jsonString;
      if (typeof LZString !== 'undefined') {
        jsonString = LZString.decompressFromBase64(compressed);
        if (!jsonString) {
          throw new Error('データの解凍に失敗しました');
        }
      } else {
        jsonString = decodeURIComponent(escape(atob(compressed)));
      }
      
      // JSONパース
      const data = JSON.parse(jsonString);
      
      console.log('✅ テキストからデータを読み込みました');
      
      // インポート実行
      const result = this.importData(data, options);
      
      return result;
      
    } catch (error) {
      console.error('❌ テキスト読み込みエラー:', error);
      return { 
        success: false, 
        message: 'テキストからの読み込みに失敗しました: ' + error.message 
      };
    }
  },
  
  // 初期化
  init: function() {
    console.log('🔄 データ同期システム初期化中...');
    console.log(`  バージョン: ${this.VERSION}`);
    console.log(`  管理キー数: ${this.STORAGE_KEYS.length}個`);
    console.log(`  クリップボード機能: ${navigator.clipboard ? '利用可能' : '利用不可'}`);
  }
};

// グローバルにエクスポート
window.DataSync = DataSync;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    DataSync.init();
  });
} else {
  DataSync.init();
}
