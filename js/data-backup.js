/**
 * 🔒 データバックアップ・リストアシステム
 * 
 * LocalStorageのデータを安全にエクスポート/インポートする機能
 * - ブラウザキャッシュクリアからの保護
 * - 複数デバイス間でのデータ移行
 * - バージョン管理による互換性確保
 */

const DataBackup = {
  
  VERSION: "1.0",
  
  // ==================== エクスポート機能 ====================
  
  /**
   * 全学習データをJSONファイルとしてエクスポート
   */
  exportAllData() {
    try {
      console.log('📥 データエクスポート開始...');
      
      // 全LocalStorageデータを収集
      const exportData = {
        version: this.VERSION,
        exportDate: new Date().toISOString(),
        appName: "TOEIC PART5 完全問題集",
        
        // 学習データ
        progress: localStorage.getItem('progress'),
        reviewHistory: localStorage.getItem('reviewHistory'),
        wrongAnswers: localStorage.getItem('wrongAnswers'),
        
        // ユーザー情報
        userProfile: localStorage.getItem('userProfile'),
        personalizedProfile: localStorage.getItem('personalizedProfile'),
        
        // 学習記録
        streakData: localStorage.getItem('streakData'),
        dailyMissions: localStorage.getItem('dailyMissions'),
        totalStudyTime: localStorage.getItem('totalStudyTime'),
        
        // 秘書システム
        currentSecretary: localStorage.getItem('currentSecretary'),
        unlockedSecretaries: localStorage.getItem('unlockedSecretaries'),
        secretaryBondLevels: localStorage.getItem('secretaryBondLevels'),
        userPoints: localStorage.getItem('userPoints'),
        purchasedRewards: localStorage.getItem('purchasedRewards'),
        greetingSecretaries: localStorage.getItem('greetingSecretaries'),
        
        // スペースドリピティション
        spacedRepetitionData: localStorage.getItem('spacedRepetitionData'),
        
        // その他の学習データ
        testResults: localStorage.getItem('testResults'),
        categoryStats: localStorage.getItem('categoryStats'),
      };
      
      // データサイズを計算
      const dataSize = new Blob([JSON.stringify(exportData)]).size;
      const dataSizeKB = (dataSize / 1024).toFixed(2);
      
      console.log(`📊 エクスポートデータサイズ: ${dataSizeKB} KB`);
      
      // JSONファイルとしてダウンロード
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `toeic_backup_${timestamp}.json`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // 最終バックアップ日時を記録
      localStorage.setItem('lastBackupDate', new Date().toISOString());
      
      console.log('✅ データエクスポート完了:', filename);
      
      // ユーザーに通知
      this.showNotification(
        '✅ バックアップ完了！',
        `学習データを安全にエクスポートしました。<br>ファイル名: ${filename}<br>サイズ: ${dataSizeKB} KB`,
        'success'
      );
      
      // バックアップ日時表示を更新
      this.updateBackupStatus();
      
      return true;
    } catch (error) {
      console.error('❌ エクスポートエラー:', error);
      this.showNotification(
        '❌ エクスポート失敗',
        'データのエクスポートに失敗しました。<br>エラー: ' + error.message,
        'error'
      );
      return false;
    }
  },
  
  // ==================== インポート機能 ====================
  
  /**
   * JSONファイルから学習データをインポート
   * @param {File} file - インポートするJSONファイル
   */
  importData(file) {
    if (!file) {
      this.showNotification('❌ エラー', 'ファイルが選択されていません。', 'error');
      return;
    }
    
    // ファイル形式チェック
    if (!file.name.endsWith('.json')) {
      this.showNotification('❌ エラー', 'JSONファイルのみインポート可能です。', 'error');
      return;
    }
    
    console.log('📤 データインポート開始:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonStr = e.target.result;
        const data = JSON.parse(jsonStr);
        
        // バージョンチェック
        if (!data.version) {
          throw new Error('バックアップファイルのバージョン情報がありません。');
        }
        
        if (data.version !== this.VERSION) {
          console.warn('⚠️ バージョンが異なります:', data.version, '!=', this.VERSION);
          // 将来的にバージョン変換処理を追加
        }
        
        // アプリ名チェック
        if (data.appName !== "TOEIC PART5 完全問題集") {
          if (!confirm('⚠️ 異なるアプリのバックアップファイルの可能性があります。\n\nインポートを続行しますか？')) {
            return;
          }
        }
        
        // 確認ダイアログ
        const exportDate = new Date(data.exportDate).toLocaleString('ja-JP');
        const confirmMessage = `📥 データをインポートします\n\n` +
          `エクスポート日時: ${exportDate}\n` +
          `バージョン: ${data.version}\n\n` +
          `⚠️ 現在の学習データは上書きされます。\n\n` +
          `インポートを実行しますか？`;
        
        if (!confirm(confirmMessage)) {
          console.log('❌ ユーザーがインポートをキャンセルしました');
          return;
        }
        
        // データ復元
        let restoredCount = 0;
        const dataKeys = [
          'progress', 'reviewHistory', 'wrongAnswers',
          'userProfile', 'personalizedProfile',
          'streakData', 'dailyMissions', 'totalStudyTime',
          'currentSecretary', 'unlockedSecretaries', 'secretaryBondLevels',
          'userPoints', 'purchasedRewards', 'greetingSecretaries',
          'spacedRepetitionData', 'testResults', 'categoryStats'
        ];
        
        dataKeys.forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            localStorage.setItem(key, data[key]);
            restoredCount++;
          }
        });
        
        // インポート完了記録
        localStorage.setItem('lastImportDate', new Date().toISOString());
        localStorage.setItem('lastImportSource', file.name);
        
        console.log(`✅ データインポート完了: ${restoredCount}件のデータを復元`);
        
        // ユーザーに通知
        this.showNotification(
          '✅ インポート完了！',
          `${restoredCount}件のデータを復元しました。<br><br>` +
          `ページをリロードして変更を反映します。`,
          'success',
          5000
        );
        
        // 2秒後にリロード
        setTimeout(() => {
          location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('❌ インポートエラー:', error);
        this.showNotification(
          '❌ インポート失敗',
          'データの読み込みに失敗しました。<br><br>' +
          'エラー: ' + error.message + '<br><br>' +
          'ファイルが破損している可能性があります。',
          'error',
          8000
        );
      }
    };
    
    reader.onerror = (error) => {
      console.error('❌ ファイル読み込みエラー:', error);
      this.showNotification(
        '❌ ファイル読み込み失敗',
        'ファイルの読み込みに失敗しました。',
        'error'
      );
    };
    
    reader.readAsText(file);
  },
  
  // ==================== バックアップ状態管理 ====================
  
  /**
   * 最終バックアップ日時を更新
   */
  updateBackupStatus() {
    const lastBackup = localStorage.getItem('lastBackupDate');
    const statusElement = document.getElementById('lastBackupStatus');
    
    if (!statusElement) return;
    
    if (lastBackup) {
      const date = new Date(lastBackup);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      let statusText = '';
      let statusClass = '';
      
      if (diffDays === 0) {
        statusText = `✅ 最終バックアップ: 今日 ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
        statusClass = 'backup-status-recent';
      } else if (diffDays === 1) {
        statusText = `⚠️ 最終バックアップ: 昨日`;
        statusClass = 'backup-status-warning';
      } else if (diffDays <= 7) {
        statusText = `⚠️ 最終バックアップ: ${diffDays}日前`;
        statusClass = 'backup-status-warning';
      } else {
        statusText = `🔴 最終バックアップ: ${diffDays}日前（要バックアップ）`;
        statusClass = 'backup-status-danger';
      }
      
      statusElement.textContent = statusText;
      statusElement.className = `backup-status ${statusClass}`;
    } else {
      statusElement.textContent = '🔴 バックアップ未実施（今すぐバックアップを推奨）';
      statusElement.className = 'backup-status backup-status-danger';
    }
  },
  
  /**
   * バックアップが必要かチェック
   * @returns {boolean} バックアップが必要ならtrue
   */
  needsBackup() {
    const lastBackup = localStorage.getItem('lastBackupDate');
    const progress = JSON.parse(localStorage.getItem('progress') || '{}');
    const testCount = progress.tests ? Object.keys(progress.tests).length : 0;
    
    // テストを3回以上実施してバックアップ未実施
    if (!lastBackup && testCount >= 3) {
      return true;
    }
    
    // 最終バックアップから7日以上経過
    if (lastBackup) {
      const daysSinceBackup = (Date.now() - new Date(lastBackup)) / (1000 * 60 * 60 * 24);
      if (daysSinceBackup > 7 && testCount >= 5) {
        return true;
      }
    }
    
    return false;
  },
  
  // ==================== 通知システム ====================
  
  /**
   * ユーザーに通知を表示
   * @param {string} title - タイトル
   * @param {string} message - メッセージ
   * @param {string} type - 通知タイプ (success, error, warning, info)
   * @param {number} duration - 表示時間（ミリ秒）
   */
  showNotification(title, message, type = 'info', duration = 4000) {
    // 既存の通知を削除
    const existing = document.getElementById('backup-notification');
    if (existing) {
      existing.remove();
    }
    
    // 通知要素を作成
    const notification = document.createElement('div');
    notification.id = 'backup-notification';
    notification.className = `backup-notification backup-notification-${type}`;
    
    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    notification.innerHTML = `
      <div class="backup-notification-content">
        <div class="backup-notification-icon">${iconMap[type]}</div>
        <div class="backup-notification-body">
          <div class="backup-notification-title">${title}</div>
          <div class="backup-notification-message">${message}</div>
        </div>
        <button class="backup-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 自動削除
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },
  
  // ==================== 自動バックアップ警告 ====================
  
  /**
   * バックアップが必要な場合に警告を表示
   */
  checkAndShowBackupWarning() {
    // 警告を表示済みの場合はスキップ
    if (sessionStorage.getItem('backupWarningShown')) {
      return;
    }
    
    if (this.needsBackup()) {
      const lastBackup = localStorage.getItem('lastBackupDate');
      const progress = JSON.parse(localStorage.getItem('progress') || '{}');
      const testCount = progress.tests ? Object.keys(progress.tests).length : 0;
      
      let warningMessage = '';
      
      if (!lastBackup && testCount >= 3) {
        warningMessage = `まだ一度もバックアップしていません！<br>` +
                        `${testCount}回のテスト結果が保存されています。<br>` +
                        `ブラウザのキャッシュクリアでデータが消失する可能性があります。`;
      } else if (lastBackup) {
        const daysSinceBackup = Math.floor((Date.now() - new Date(lastBackup)) / (1000 * 60 * 60 * 24));
        warningMessage = `最後のバックアップから${daysSinceBackup}日経過しています。<br>` +
                        `定期的なバックアップをお勧めします。`;
      }
      
      this.showBackupWarningBanner(warningMessage);
      
      // セッション中に一度だけ表示
      sessionStorage.setItem('backupWarningShown', 'true');
    }
  },
  
  /**
   * バックアップ警告バナーを表示
   * @param {string} message - 警告メッセージ
   */
  showBackupWarningBanner(message) {
    // 既存の警告を削除
    const existing = document.getElementById('backup-warning-banner');
    if (existing) {
      existing.remove();
    }
    
    // 警告バナーを作成
    const banner = document.createElement('div');
    banner.id = 'backup-warning-banner';
    banner.className = 'backup-warning-banner';
    banner.innerHTML = `
      <div class="warning-content">
        <span class="warning-icon">⚠️</span>
        <div class="warning-text">${message}</div>
        <button onclick="DataBackup.exportAllData(); document.getElementById('backup-warning-banner').remove();">
          今すぐバックアップ
        </button>
        <button class="dismiss-btn" onclick="document.getElementById('backup-warning-banner').remove();">
          閉じる
        </button>
      </div>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    console.log('⚠️ バックアップ警告を表示しました');
  },
  
  // ==================== 初期化 ====================
  
  /**
   * システム初期化
   */
  init() {
    console.log('🔒 データバックアップシステム初期化');
    
    // バックアップ状態を更新
    this.updateBackupStatus();
    
    // 定期的にバックアップ状態をチェック（5分ごと）
    setInterval(() => {
      this.updateBackupStatus();
    }, 5 * 60 * 1000);
    
    // ページロード後3秒後にバックアップ警告をチェック
    setTimeout(() => {
      this.checkAndShowBackupWarning();
    }, 3000);
  }
};

// グローバルに公開
window.DataBackup = DataBackup;

// ページロード時に初期化
window.addEventListener('DOMContentLoaded', () => {
  DataBackup.init();
});

console.log('✅ DataBackup module loaded');
