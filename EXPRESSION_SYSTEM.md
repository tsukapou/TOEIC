# 🎭 秘書表情システム - 完全ガイド

## 📋 概要

TOEIC PART5実践問題集アプリの秘書キャラクターが、**会話内容・時間帯・学習状況に応じて表情（アバター画像）を動的に変更**するシステムです。

## ✨ 主な特徴

### 🎨 3人の秘書 × 6種類の表情 = 18パターンの画像

各秘書が、状況に応じて以下の表情を使い分けます：

#### 🌸 さくら（優しいサポート型）の表情
1. **normal** - 通常・笑顔：デフォルト状態
2. **happy** - 嬉しい・笑顔：正解時
3. **encouraging** - 応援・励まし：テスト開始時、不正解時のサポート
4. **caring** - 優しい・思いやり：不正解時の励まし
5. **thinking** - 考え中・アドバイス：アドバイスパネル表示時
6. **celebration** - お祝い・達成：高得点達成時（90%以上）

#### 💼 レイナ（厳格・ストイック型）の表情
1. **normal** - 通常・クール：デフォルト状態
2. **strict** - 厳しい・ストイック：不正解時の叱咤
3. **satisfied** - 満足・認める：高得点達成時、早朝学習時
4. **professional** - プロフェッショナル：正解時の評価
5. **thinking** - 考え中・分析：アドバイス提供時
6. **demanding** - 要求・挑戦：テスト開始時、高い目標設定

#### 🎀 ユイ（妹系・元気型）の表情
1. **normal** - 通常・明るい笑顔：デフォルト状態
2. **excited** - 興奮・わくわく：正解時、午前中の起動時
3. **cheerful** - 元気・楽しい：通常の起動時、アドバイス時
4. **supporting** - 応援・サポート：テスト開始時
5. **celebration** - お祝い・やった！：高得点達成時（90%以上）
6. **caring** - 優しい・心配：不正解時、深夜の学習時

## 🎯 表情切り替えのタイミング

### 1. 起動時（isStartup）
アプリ起動時に、時間帯に応じた表情を表示：
- **早朝・午前**：happy/excited/satisfied
- **深夜**：caring/strict（疲労を気遣う）
- **その他**：normal

### 2. 正解時（isCorrect）
問題に正解した時：
- さくら → **happy**
- レイナ → **professional** or **satisfied**（90%以上）
- ユイ → **excited**

### 3. 不正解時（isIncorrect）
問題を間違えた時：
- さくら → **caring**（優しく励ます）
- レイナ → **strict**（厳しく指導）
- ユイ → **caring**（心配して励ます）

### 4. テスト開始時（isTestStart）
テストを開始した時：
- さくら → **encouraging**
- レイナ → **demanding**
- ユイ → **supporting**

### 5. テスト終了時（isTestEnd）
テスト終了後、スコアに応じて：
- **90%以上** → **celebration**（3人とも）
- **75-89%** → 通常の評価表情
- **60-74%** → 励まし系表情
- **60%未満** → サポート・叱咤表情

### 6. アドバイス時（isAdvice）
秘書アバターをクリックしてアドバイスを求めた時：
- さくら → **thinking**
- レイナ → **thinking**
- ユイ → **cheerful**

### 7. 秘書切り替え時
秘書を変更した時：
- 新しい秘書の **normal** 表情を表示

## 💻 技術実装

### システムアーキテクチャ

```
SecretaryExpressions システム
├── expressions データベース（18パターンの画像URL）
├── imageCache（プリロード済み画像キャッシュ）
├── getExpressionForContext()（状況判定ロジック）
├── getExpressionUrl()（画像URL取得）
└── updateExpression()（表情更新＋アニメーション）
```

### 主要関数

#### `SecretaryExpressions.updateExpression(secretaryId, context)`

秘書の表情を更新する核となる関数。

**引数**:
- `secretaryId`: 'sakura' | 'reina' | 'yui'
- `context`: 状況を示すオブジェクト
  ```javascript
  {
    timeOfDay: 'earlyMorning' | 'morning' | ... | 'lateNight',
    isCorrect: boolean,
    isIncorrect: boolean,
    isTestStart: boolean,
    isTestEnd: boolean,
    score: number,  // 正答率（0-100）
    isStartup: boolean,
    isCelebration: boolean,
    isAdvice: boolean
  }
  ```

**使用例**:
```javascript
// 正解時
SecretaryExpressions.updateExpression('sakura', {
  isCorrect: true
});

// テスト終了時（高得点）
SecretaryExpressions.updateExpression('reina', {
  isTestEnd: true,
  score: 95,
  isCelebration: true
});

// 起動時（早朝）
SecretaryExpressions.updateExpression('yui', {
  isStartup: true,
  timeOfDay: 'earlyMorning'
});
```

### 表情決定ロジック

各秘書の性格に応じて、状況から最適な表情を決定：

```javascript
// さくらの例
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
```

### 画像プリロード

起動時に全18パターンの画像を事前読み込み：

```javascript
SecretaryExpressions.preloadAllExpressions();
// → 画像をキャッシュに保存
// → スムーズな切り替えを実現
```

### アニメーション

表情切り替え時にフェードイン/アウトアニメーション：

```javascript
// フェードアウト（0.3秒）
avatarImg.style.opacity = '0';

setTimeout(() => {
  // 画像変更
  avatarImg.src = newImageUrl;
  // フェードイン
  avatarImg.style.opacity = '1';
}, 300);
```

## 🔧 統合ポイント

### secretary-multi.js との連携

以下の関数で表情更新を呼び出し：

1. **showWelcomeMessage()**
   ```javascript
   SecretaryExpressions.updateExpression(this.currentSecretary, {
     isStartup: true,
     timeOfDay: timeOfDay
   });
   ```

2. **onCorrectAnswer()**
   ```javascript
   SecretaryExpressions.updateExpression(this.currentSecretary, {
     isCorrect: true
   });
   ```

3. **onIncorrectAnswer()**
   ```javascript
   SecretaryExpressions.updateExpression(this.currentSecretary, {
     isIncorrect: true
   });
   ```

4. **onTestStart()**
   ```javascript
   SecretaryExpressions.updateExpression(this.currentSecretary, {
     isTestStart: true
   });
   ```

5. **onTestFinish()**
   ```javascript
   SecretaryExpressions.updateExpression(this.currentSecretary, {
     isTestEnd: true,
     score: percentage,
     isCelebration: percentage >= 90
   });
   ```

6. **onAvatarClick()**（アドバイス時）
   ```javascript
   SecretaryExpressions.updateExpression(this.currentSecretary, {
     isAdvice: true
   });
   ```

7. **changeSecretary()**
   ```javascript
   SecretaryExpressions.updateExpression(secretaryId, {
     isStartup: true,
     timeOfDay: 'normal'
   });
   ```

## 📁 ファイル構成

```
js/
├── secretary-expressions.js   # 表情管理システム本体（10KB）
├── secretary-multi.js          # 秘書チームシステム（統合済み）
└── secretary-greetings.js      # 起動時挨拶システム
```

## 🎨 表情パターン一覧表

| 秘書 | 状況 | 表情 | タイミング |
|------|------|------|-----------|
| 🌸さくら | 起動 | happy | 早朝・午前 |
| 🌸さくら | 起動 | caring | 深夜 |
| 🌸さくら | 正解 | happy | 問題正解時 |
| 🌸さくら | 不正解 | caring | 問題不正解時 |
| 🌸さくら | テスト開始 | encouraging | テスト開始時 |
| 🌸さくら | 高得点 | celebration | 90%以上達成 |
| 🌸さくら | アドバイス | thinking | アバタークリック |
| 💼レイナ | 起動 | satisfied | 早朝 |
| 💼レイナ | 起動 | strict | 深夜 |
| 💼レイナ | 正解 | professional | 通常正解時 |
| 💼レイナ | 正解（高得点） | satisfied | 90%以上で正解 |
| 💼レイナ | 不正解 | strict | 問題不正解時 |
| 💼レイナ | テスト開始 | demanding | テスト開始時 |
| 💼レイナ | 高得点 | satisfied | 95%以上達成 |
| 💼レイナ | アドバイス | thinking | アバタークリック |
| 🎀ユイ | 起動 | excited | 早朝・午前 |
| 🎀ユイ | 起動 | caring | 深夜 |
| 🎀ユイ | 起動 | cheerful | その他時間帯 |
| 🎀ユイ | 正解 | excited | 問題正解時 |
| 🎀ユイ | 不正解 | caring | 問題不正解時 |
| 🎀ユイ | テスト開始 | supporting | テスト開始時 |
| 🎀ユイ | 高得点 | celebration | 90%以上達成 |
| 🎀ユイ | アドバイス | cheerful | アバタークリック |

## 🎯 効果と期待される成果

1. **感情的な共感**: ユーザーの状況に合った表情で共感を生む
2. **学習意欲の向上**: 正解時の喜び、不正解時の励ましで継続意欲UP
3. **キャラクター愛着**: 生き生きとした表情でキャラクターへの愛着が増す
4. **没入感の向上**: 表情変化により学習体験の没入感が高まる
5. **個性の際立ち**: 3人の秘書の個性がより明確に表現される

## 🚀 今後の拡張案

1. **アニメーション強化**: より滑らかな表情遷移
2. **追加表情**: 「驚き」「困惑」「笑い」など更に細かい表情
3. **音声対応**: 表情変化に合わせた効果音
4. **学習パターン認識**: ユーザーの学習傾向に応じた表情調整
5. **季節イベント表情**: クリスマス、お正月などイベント専用表情

---

**最終更新**: 2025-12-07  
**バージョン**: 1.0.0  
**作成者**: TOEIC PART5実践問題集開発チーム
