# 🐛 バグ修正：2番目・3番目の秘書挨拶が表示されない問題

## 📖 問題の概要

全秘書順番挨拶機能で、1番目の秘書の挨拶は正常に表示されるが、2番目・3番目の秘書の挨拶が表示されない問題が発生していました。

---

## 🔍 原因分析

### 問題の原因

`showMessage()` 関数内で、メッセージ表示後に自動非表示タイマー（`setTimeout`）が設定されていました。

```javascript
// 問題のあったコード
showMessage: function(message, mood = 'normal', duration = 3000) {
  // ... メッセージ表示 ...
  
  if (duration > 0) {
    setTimeout(() => {
      this.hideMessage();  // ← これが問題
    }, duration);
  }
}
```

### 発生していた動作

```
秘書1の挨拶（4秒）
  ↓
  タイマー設定：4秒後に非表示
  ↓
秘書2の挨拶（4秒）← 表示される
  ↓
  タイマー設定：4秒後に非表示
  ↓
**秘書1のタイマー発火**（4秒経過）
  ↓
  メッセージ非表示 ← 秘書2のメッセージが消える！
  ↓
秘書3の挨拶 ← 表示されない
```

### 根本原因

- 複数の `setTimeout` タイマーが同時に動作
- 前の秘書のタイマーが残っていて、次の秘書のメッセージを消してしまう
- タイマーIDが保存されていないため、クリアできない

---

## ✅ 修正内容

### 1. メッセージタイマーIDの管理

```javascript
// メッセージタイマー
messageTimerId: null,
```

### 2. `showMessage()` 関数の改善

#### 修正前
```javascript
showMessage: function(message, mood = 'normal', duration = 3000) {
  // メッセージ表示
  content.innerHTML = message;
  balloon.classList.remove('hidden');
  balloon.classList.add('secretary-fade-in');
  
  if (duration > 0) {
    setTimeout(() => {
      this.hideMessage();
    }, duration);
  }
}
```

#### 修正後
```javascript
showMessage: function(message, mood = 'normal', duration = 3000) {
  // 前のメッセージタイマーをクリア
  if (this.messageTimerId) {
    clearTimeout(this.messageTimerId);
    this.messageTimerId = null;
  }
  
  // メッセージ表示
  content.innerHTML = message;
  balloon.classList.remove('hidden', 'secretary-fade-out');
  balloon.classList.add('secretary-fade-in');
  
  // 挨拶中は自動非表示タイマーを設定しない
  if (duration > 0 && !this.greetingState.isPlaying) {
    this.messageTimerId = setTimeout(() => {
      this.hideMessage();
    }, duration);
  }
}
```

### 3. 挨拶メッセージの表示制御

#### 修正前
```javascript
// メッセージ表示
this.showMessage(messageWithName, 'normal', greetingDuration);
```

#### 修正後
```javascript
// メッセージ表示（挨拶中は自動非表示しない）
this.showMessage(messageWithName, 'normal', 0);
```

### 4. 挨拶終了時のメッセージ非表示

```javascript
finishGreeting: function() {
  this.greetingState.isPlaying = false;
  this.updateAvatarImage(this.currentSecretary);
  this.hideSkipButton();
  
  // タイマーをクリア
  if (this.greetingState.timerId) {
    clearTimeout(this.greetingState.timerId);
    this.greetingState.timerId = null;
  }
  
  // メッセージを非表示（追加）
  setTimeout(() => {
    this.hideMessage();
  }, 500);
}
```

---

## 🎯 修正のポイント

### 1. タイマーの一元管理
- `messageTimerId` でタイマーIDを保存
- 新しいメッセージ表示時に前のタイマーをクリア

### 2. 挨拶中の自動非表示を無効化
- `greetingState.isPlaying` フラグで挨拶中かチェック
- 挨拶中は `duration = 0` で自動非表示を抑制

### 3. 明示的な制御
- 挨拶システム側でメッセージの表示時間を制御
- 挨拶終了時に明示的にメッセージを非表示

---

## 🔧 修正後の動作フロー

```
秘書1の挨拶開始
  ↓
  メッセージ表示（duration=0）
  ↓
  4秒待機（挨拶システムのタイマー）
  ↓
秘書2の挨拶開始
  ↓
  前のタイマーをクリア
  ↓
  メッセージ表示（duration=0）← 正常に表示
  ↓
  4秒待機
  ↓
秘書3の挨拶開始
  ↓
  前のタイマーをクリア
  ↓
  メッセージ表示（duration=0）← 正常に表示
  ↓
  4秒待機
  ↓
挨拶終了
  ↓
  メッセージを非表示
  ↓
  元の秘書に戻る
```

---

## 📊 テスト結果

### Before（修正前）
- ❌ 1番目の秘書：表示される
- ❌ 2番目の秘書：表示されるが途中で消える
- ❌ 3番目の秘書：表示されない

### After（修正後）
- ✅ 1番目の秘書：正常に4秒間表示
- ✅ 2番目の秘書：正常に4秒間表示
- ✅ 3番目の秘書：正常に4秒間表示
- ✅ 挨拶終了後：メッセージが適切に非表示

---

## 🛠️ 技術詳細

### タイマー管理のベストプラクティス

#### 問題のあるコード
```javascript
setTimeout(() => {
  doSomething();
}, 1000);
// タイマーIDが保存されない → キャンセルできない
```

#### 改善されたコード
```javascript
this.timerId = setTimeout(() => {
  doSomething();
}, 1000);

// 必要に応じてキャンセル
if (this.timerId) {
  clearTimeout(this.timerId);
  this.timerId = null;
}
```

### 複数タイマーの制御

#### 競合を避ける方法
1. **タイマーIDを保存**してキャンセル可能にする
2. **フラグで状態を管理**して不要なタイマーを起動しない
3. **明示的な制御**でタイマーに依存しない

---

## 📝 影響範囲

### 修正したファイル
- `js/secretary-multi.js`

### 修正した関数
1. `messageTimerId` プロパティ追加
2. `showMessage()` - タイマー管理とフラグチェック追加
3. `showAllSecretariesGreeting()` - duration=0で呼び出し
4. `finishGreeting()` - 明示的なメッセージ非表示追加

### 影響を受ける機能
- ✅ 全秘書順番挨拶機能 - **修正完了**
- ✅ スキップボタン - 正常動作
- ✅ もう一度見るボタン - 正常動作
- ✅ 通常のメッセージ表示 - 影響なし

---

## 🚀 今後の改善案

### 1. メッセージキューシステム
複数のメッセージを順番に表示する専用システムを実装することで、より堅牢な制御が可能。

```javascript
messageQueue: [],
isProcessingQueue: false,

addToQueue: function(message, duration) {
  this.messageQueue.push({ message, duration });
  this.processQueue();
},

processQueue: function() {
  if (this.isProcessingQueue || this.messageQueue.length === 0) return;
  
  this.isProcessingQueue = true;
  const { message, duration } = this.messageQueue.shift();
  
  this.showMessage(message, 'normal', 0);
  setTimeout(() => {
    this.isProcessingQueue = false;
    this.processQueue();
  }, duration);
}
```

### 2. イベント駆動型
挨拶の各ステップをイベントとして発行し、リスナーで処理する設計。

### 3. Promise/async-awaitベース
非同期処理を Promise で制御し、より読みやすいコードに。

---

## 🎓 学んだ教訓

1. **複数のタイマーを使う場合は必ずIDを保存**してキャンセル可能にする
2. **状態フラグで動作モードを管理**する
3. **自動処理と手動処理を混在させない**（どちらか一方で制御）
4. **タイミング問題は再現が難しい**ため、ログを活用する

---

**修正日**: 2025-12-08  
**バージョン**: 2.0.1（バグ修正版）  
**Status**: ✅ 修正完了・テスト済み
