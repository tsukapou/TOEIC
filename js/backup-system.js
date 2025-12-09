/**
 * 🔐 自動バックアップシステム (Backup System)
 * Phase C-2: 緊急改善
 * 
 * Version: 1.0.0
 * Updated: 2025-12-08
 * 
 * 【目的】
 * データ損失リスクを-99%にする完全バックアップ・復元システム
 * 
 * 【主な機能】
 * 1. LocalStorage全データの自動バックアップ
 * 2. JSON形式でのエクスポート・ダウンロード
 * 3. JSONファイルからのインポート・復元
 * 4. データ検証と安全な復元
 * 5. 定期バックアップリマインダー（7日/30日）
 */

class BackupSystem {
  constructor() {
    console.log('🔐 バックアップシステム初期化中...');
    this.BACKUP_REMINDER_KEY = 'toeic_backup_reminder';
    this.BACKUP_PREFIX = 'toeic_';
    this.init();
  }
  
  init() {
    // 最終バックアップ日時をチェック
    this.checkBackupReminder();
    console.log('✅ バックアップシステム初期化完了');
  }
  
  /**
   * LocalStorage全データを取得
   */
  getAllData() {
    const data = {};
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      // toeic_ プレフィックスのキーのみ
      if (key.startsWith(this.BACKUP_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
          data[key] = JSON.parse(value);
        } catch (e) {
          // JSON以外の場合はそのまま保存
          data[key] = localStorage.getItem(key);
        }
      }
    });
    
    return data;
  }
  
  /**
   * バックアップファイルを作成してダウンロード
   */
  createBackup() {
    try {
      // 全データを取得
      const data = this.getAllData();
      
      // メタデータを追加
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        app: 'TOEIC PART5 WEB App',
        dataCount: Object.keys(data).length,
        data: data
      };
      
      // JSON文字列に変換
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // ファイル名を生成（TOEIC_Backup_2025-12-08_14-30-00.json）
      const now = new Date();
      const filename = `TOEIC_Backup_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}.json`;
      
      // ダウンロード
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // 最終バックアップ日時を記録
      this.updateBackupTimestamp();
      
      console.log(`✅ バックアップ作成完了: ${filename}`);
      console.log(`📊 バックアップサイズ: ${(jsonString.length / 1024).toFixed(2)} KB`);
      console.log(`📦 データ項目数: ${Object.keys(data).length}`);
      
      return {
        success: true,
        filename: filename,
        size: jsonString.length,
        dataCount: Object.keys(data).length,
        timestamp: backup.timestamp
      };
    } catch (error) {
      console.error('❌ バックアップ作成エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * バックアップファイルから復元
   */
  async restoreBackup(file, mode = 'overwrite') {
    try {
      // ファイルを読み込む
      const text = await file.text();
      const backup = JSON.parse(text);
      
      // バージョンチェック
      if (!backup.version || !backup.data) {
        throw new Error('無効なバックアップファイルです');
      }
      
      console.log('📥 バックアップファイル検証完了');
      console.log(`📅 バックアップ日時: ${backup.timestamp}`);
      console.log(`📦 データ項目数: ${backup.dataCount}`);
      
      // データを復元
      const restoredKeys = [];
      const skippedKeys = [];
      
      Object.entries(backup.data).forEach(([key, value]) => {
        try {
          if (mode === 'merge') {
            // マージモード: 既存データがある場合はスキップ
            if (localStorage.getItem(key) !== null) {
              skippedKeys.push(key);
              return;
            }
          }
          
          // データを復元
          const valueString = typeof value === 'string' ? value : JSON.stringify(value);
          localStorage.setItem(key, valueString);
          restoredKeys.push(key);
        } catch (e) {
          console.warn(`⚠️ データ復元スキップ: ${key}`, e);
        }
      });
      
      console.log(`✅ バックアップ復元完了`);
      console.log(`📥 復元: ${restoredKeys.length}件`);
      if (skippedKeys.length > 0) {
        console.log(`⏭️ スキップ: ${skippedKeys.length}件（既存データ保護）`);
      }
      
      return {
        success: true,
        restored: restoredKeys.length,
        skipped: skippedKeys.length,
        timestamp: backup.timestamp,
        mode: mode
      };
    } catch (error) {
      console.error('❌ バックアップ復元エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * 最終バックアップ日時を記録
   */
  updateBackupTimestamp() {
    const timestamp = Date.now();
    localStorage.setItem(this.BACKUP_REMINDER_KEY, JSON.stringify({
      lastBackup: timestamp,
      lastReminder: timestamp
    }));
  }
  
  /**
   * バックアップリマインダーをチェック
   */
  checkBackupReminder() {
    try {
      const reminderData = localStorage.getItem(this.BACKUP_REMINDER_KEY);
      
      if (!reminderData) {
        // 初回起動
        this.updateBackupTimestamp();
        return null;
      }
      
      const data = JSON.parse(reminderData);
      const now = Date.now();
      const lastBackup = data.lastBackup || 0;
      const lastReminder = data.lastReminder || 0;
      
      const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
      const daysSinceReminder = Math.floor((now - lastReminder) / (1000 * 60 * 60 * 24));
      
      // 7日以上バックアップなし & 1日以上リマインダーなし
      if (daysSinceBackup >= 7 && daysSinceReminder >= 1) {
        console.log(`⚠️ バックアップリマインダー: 最終バックアップから${daysSinceBackup}日経過`);
        return {
          shouldRemind: true,
          daysSinceBackup: daysSinceBackup,
          urgency: daysSinceBackup >= 30 ? 'high' : 'normal'
        };
      }
      
      return {
        shouldRemind: false,
        daysSinceBackup: daysSinceBackup
      };
    } catch (e) {
      console.error('バックアップリマインダーチェックエラー:', e);
      return null;
    }
  }
  
  /**
   * リマインダーを表示済みとしてマーク
   */
  markReminderShown() {
    try {
      const reminderData = localStorage.getItem(this.BACKUP_REMINDER_KEY);
      const data = reminderData ? JSON.parse(reminderData) : {};
      data.lastReminder = Date.now();
      localStorage.setItem(this.BACKUP_REMINDER_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('リマインダーマークエラー:', e);
    }
  }
  
  /**
   * バックアップ統計を取得
   */
  getBackupStats() {
    try {
      const reminderData = localStorage.getItem(this.BACKUP_REMINDER_KEY);
      
      if (!reminderData) {
        return {
          hasBackup: false,
          lastBackup: null,
          daysSinceBackup: null
        };
      }
      
      const data = JSON.parse(reminderData);
      const lastBackup = data.lastBackup || 0;
      const now = Date.now();
      const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
      
      return {
        hasBackup: true,
        lastBackup: new Date(lastBackup).toLocaleString('ja-JP'),
        daysSinceBackup: daysSinceBackup,
        timestamp: lastBackup
      };
    } catch (e) {
      return {
        hasBackup: false,
        lastBackup: null,
        daysSinceBackup: null
      };
    }
  }
  
  /**
   * データサイズを取得（概算）
   */
  getDataSize() {
    try {
      const data = this.getAllData();
      const jsonString = JSON.stringify(data);
      return {
        bytes: jsonString.length,
        kilobytes: (jsonString.length / 1024).toFixed(2),
        megabytes: (jsonString.length / (1024 * 1024)).toFixed(2),
        dataCount: Object.keys(data).length
      };
    } catch (e) {
      return {
        bytes: 0,
        kilobytes: '0.00',
        megabytes: '0.00',
        dataCount: 0
      };
    }
  }
}

// グローバルインスタンス
const BackupSystemInstance = new BackupSystem();

// グローバルに公開
if (typeof window !== 'undefined') {
  window.BackupSystem = BackupSystemInstance;
}

console.log('✅ BackupSystem module loaded');
