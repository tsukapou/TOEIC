# 📊 学習プランカード表示ロジック完全ガイド

**作成日**: 2025-12-08  
**対象**: 「つかささんの今」「成長サマリー」の表示ロジック調査

---

## 🎯 概要

学習プランカード内の以下2つのパネルについて、どのようなロジックで表示されるのかを完全に解明しました：

1. **📊 つかささんの今**（リアルタイム状態パネル）
2. **📈 成長サマリー**（成長分析パネル）

---

## 📂 関連ファイル

| ファイル | 役割 |
|---------|------|
| `js/personalized-dashboard.js` | UI生成（HTMLレンダリング） |
| `js/personalized-learning-nav.js` | データ分析・計算エンジン |
| `localStorage` | データソース（テスト履歴、プロフィール等） |

---

## 🔄 全体のデータフロー

```
[LocalStorage]
  ├─ progress (テスト履歴)
  ├─ reviewHistory (復習履歴)
  ├─ userProfile (ユーザー情報)
  └─ streakData (連続学習日数)
      ↓
[PersonalizedLearningNav.analyzeAllData()]
  ├─ getTestHistory() ← progress + reviewHistory を統合
  ├─ getStreak() ← StreakSystem
  ├─ getTodayProgress() ← 今日のテスト抽出
  ├─ analyzePerformanceTrend() ← 最近5回vs過去5回
  ├─ analyzeCategories() ← WeaknessAnalysis
  └─ getCurrentStatus() ← スコア予測・目標計算
      ↓
[analysis オブジェクト]
  ├─ currentStatus
  ├─ performanceTrend
  ├─ categoryAnalysis
  ├─ timeSlotAnalysis
  └─ sessionAnalysis
      ↓
[PersonalizedDashboard.generateStatusPanel(analysis)]
[PersonalizedDashboard.generateGrowthSummary(analysis)]
      ↓
[HTML レンダリング]
```

---

## 📊 1. 「つかささんの今」の表示ロジック

### 📍 実装場所
- **ファイル**: `js/personalized-dashboard.js`
- **関数**: `generateStatusPanel(analysis)`
- **行番号**: 322-391

### 📥 入力データ（analysis.currentStatus）

| フィールド | 取得元 | 計算方法 |
|-----------|--------|---------|
| `currentStreak` | `StreakSystem.getStreak()` | 連続学習日数（最終学習日 + 1 == 今日） |
| `todayCompleted` | `getTodayProgress()` | 今日のテスト回数（`timestamp`が今日） |
| `todayAccuracy` | `getTodayProgress()` | 今日の正答率（今日のscore合計 / questions合計） |
| `estimatedScore` | `estimateCurrentScore()` | 最近5回の平均から予測: `400 + (平均正答率 * 400)` |
| `targetScore` | `userProfile.targetScore` | ユーザー設定値（デフォルト: 800点） |

### 🎨 表示項目と条件分岐

#### 1️⃣ 今日の調子（condition）

```javascript
if (todayCompleted > 0) {
  if (todayAccuracy >= 80) {
    condition = "🔥 絶好調";  // 80%以上
  } else if (todayAccuracy >= 70) {
    condition = "😊 好調";    // 70-79%
  } else if (todayAccuracy < 60) {
    condition = "😅 要休憩";  // 60%未満
  }
} else {
  condition = "😊 通常";      // 今日まだ学習していない
}
```

**判定基準**:
- **🔥 絶好調**: 今日学習済み & 正答率 ≥ 80%
- **😊 好調**: 今日学習済み & 正答率 70-79%
- **😊 通常**: 今日未学習（デフォルト）
- **😅 要休憩**: 今日学習済み & 正答率 < 60%

#### 2️⃣ 連続学習

```javascript
<div class="status-value highlight">${currentStreak}日</div>
```

- `StreakSystem.getStreak().current` の値をそのまま表示

#### 3️⃣ 今日の学習

```javascript
<div class="status-value">${todayCompleted}回</div>
```

- 今日のテスト実施回数（通常テスト + 復習テスト）

#### 4️⃣ 今日の正答率

```javascript
${todayCompleted > 0 ? `
  <div class="status-item">
    <div class="status-label">今日の正答率</div>
    <div class="status-value">${todayAccuracy}%</div>
  </div>
` : ''}
```

- **表示条件**: `todayCompleted > 0`（今日学習済みの場合のみ）
- 今日解いた全問題の正答率

#### 5️⃣ 目標まで（スコア予測）

```javascript
<div class="score-prediction">
  <h4>🎯 目標まで</h4>
  <div class="score-info">
    <div class="score-row">
      <span>現在の推定スコア</span>
      <span class="score-value">${estimatedScore}点</span>
    </div>
    <div class="score-row">
      <span>目標スコア</span>
      <span class="score-value target">${targetScore}点</span>
    </div>
    <div class="score-row remaining">
      <span>あと</span>
      <span class="score-value">${Math.max(0, targetScore - estimatedScore)}点</span>
    </div>
  </div>
</div>
```

**スコア予測式**:
```javascript
function estimateCurrentScore() {
  const recent = getTestHistory().slice(-5);  // 最近5回
  const avgAccuracy = recent.reduce((sum, test) => 
    sum + (test.score / test.totalQuestions), 0) / recent.length;
  
  return Math.round(400 + (avgAccuracy * 400));
}
```

**換算ロジック**:
- 最近5回の平均正答率を算出
- PART5正答率からTOEICスコア予測: `400点 + (正答率 × 400点)`
- 例: 正答率75% → `400 + (0.75 * 400)` = **700点**

---

## 📈 2. 「成長サマリー」の表示ロジック

### 📍 実装場所
- **ファイル**: `js/personalized-dashboard.js`
- **関数**: `generateGrowthSummary(analysis)`
- **行番号**: 395-466

### 📥 入力データ

| カテゴリ | フィールド | 取得元 | 計算方法 |
|---------|-----------|--------|---------|
| **performanceTrend** | `trend` | `analyzePerformanceTrend()` | 最近5回vs過去5回の比較 |
| | `improvement` | 同上 | 改善率（%） |
| | `recentAccuracy` | 同上 | 最近5回の平均正答率 |
| **categoryAnalysis** | `weakest` | `WeaknessAnalysis.getWeakCategories()` | 正答率最低カテゴリ |
| | `strongest` | `getStrongCategories()` | 正答率最高カテゴリ |
| **currentStatus** | `daysToGoal` | `estimateDaysToGoal()` | 目標達成予測日数 |

### 🎨 表示項目と条件分岐

#### 1️⃣ 最近のトレンド（trend）

```javascript
// トレンド分析ロジック
function analyzePerformanceTrend() {
  const history = getTestHistory();
  const recent = history.slice(-5);    // 最近5回
  const past = history.slice(-10, -5); // 過去5回
  
  const recentAvg = recent.reduce((sum, test) => 
    sum + (test.score / test.totalQuestions * 100), 0) / recent.length;
  
  const pastAvg = past.reduce((sum, test) => 
    sum + (test.score / test.totalQuestions * 100), 0) / past.length;
  
  const improvement = recentAvg - pastAvg;
  
  return {
    trend: improvement > 5 ? "上昇" : improvement < -5 ? "下降" : "安定",
    improvement: Math.round(improvement),
    recentAccuracy: Math.round(recentAvg),
    pastAccuracy: Math.round(pastAvg)
  };
}
```

**判定基準**:
- **📈 上昇中**: `improvement > +5%` → 「上昇中 (+X%)」
- **📉 調整中**: `improvement < -5%` → 「調整中 (-X%)」
- **📊 安定**: `-5% ≤ improvement ≤ +5%` → 「安定」

**表示例**:
```
📈 最近のトレンド
   上昇中 (+12%)
```

#### 2️⃣ 最近の正答率（recentAccuracy）

```javascript
<div class="growth-item">
  <div class="growth-icon">🎯</div>
  <div class="growth-content">
    <div class="growth-label">最近の正答率</div>
    <div class="growth-value">${recentAccuracy}%</div>
  </div>
</div>
```

- 最近5回のテストの平均正答率を表示

#### 3️⃣ 得意分野（strongest）

```javascript
${strongest !== "データ不足" ? `
  <div class="growth-item">
    <div class="growth-icon">⭐</div>
    <div class="growth-content">
      <div class="growth-label">得意分野</div>
      <div class="growth-value">${strongest}</div>
    </div>
  </div>
` : ''}
```

**表示条件**: `strongest !== "データ不足"`

**取得ロジック**:
```javascript
function getStrongCategories() {
  const categories = WeaknessAnalysis.getWeakCategories();
  // 正答率が最も高いカテゴリを抽出
  return categories.sort((a, b) => b.accuracy - a.accuracy)[0].category;
}
```

#### 4️⃣ 強化中（weakest）

```javascript
${weakest !== "データ不足" ? `
  <div class="growth-item">
    <div class="growth-icon">💪</div>
    <div class="growth-content">
      <div class="growth-label">強化中</div>
      <div class="growth-value">${weakest}</div>
    </div>
  </div>
` : ''}
```

**表示条件**: `weakest !== "データ不足"`

**取得ロジック**:
```javascript
function analyzeCategories() {
  const weakCategories = WeaknessAnalysis.getWeakCategories();
  return {
    weakest: weakCategories[0]?.category || "データ不足",
    strongest: /* ... */
  };
}
```

#### 5️⃣ 目標達成予測（daysToGoal）

```javascript
${daysToGoal < 999 ? `
  <div class="goal-estimate">
    <div class="estimate-icon">🔮</div>
    <div class="estimate-text">
      このペースなら、<strong>${daysToGoal}日後</strong>に目標達成予定！
    </div>
  </div>
` : ''}
```

**表示条件**: `daysToGoal < 999`（改善傾向がある場合のみ）

**計算ロジック**:
```javascript
function estimateDaysToGoal() {
  const current = estimateCurrentScore();          // 現在のスコア
  const target = profile.targetScore || 800;       // 目標スコア
  const trend = analyzePerformanceTrend();         // パフォーマンストレンド
  
  if (current >= target) return 0;                 // 既に達成
  if (trend.improvement <= 0) return 999;          // 改善なし
  
  const remainingPoints = target - current;        // 残り点数
  const weeklyImprovement = trend.improvement * 2; // 週2回学習と仮定
  
  if (weeklyImprovement <= 0) return 999;
  
  const weeksNeeded = remainingPoints / weeklyImprovement;
  return Math.ceil(weeksNeeded * 7);               // 週→日に変換
}
```

**前提条件**:
- 週2回のペースで学習を継続
- 現在の改善率が維持される

**例**:
- 現在スコア: 600点
- 目標スコア: 800点
- 改善率: +10%/回
- 計算: `(800-600) / (10*2) = 10週間` → **70日後**

---

## 🗄️ データソース詳細

### LocalStorage キー一覧

| キー | データ型 | 内容 |
|-----|---------|------|
| `progress` | Object | テスト履歴（`tests: { "1": {...}, "2": {...} }`） |
| `reviewHistory` | Array | 復習履歴（`[{score, totalQuestions, timestamp}, ...]`） |
| `userProfile` | Object | ユーザー情報（`nickname, targetScore, examDate`） |
| `personalizedProfile` | Object | 学習分析用プロフィール |
| `streakData` | Object | 連続学習日数データ |

### progress（テスト履歴）の構造

```json
{
  "tests": {
    "1": {
      "score": 23,
      "totalQuestions": 30,
      "timestamp": 1733654400000,
      "timeInSeconds": 1200
    },
    "2": { /* ... */ }
  }
}
```

### reviewHistory（復習履歴）の構造

```json
[
  {
    "score": 8,
    "totalQuestions": 10,
    "timestamp": 1733740800000,
    "timeInSeconds": 300
  }
]
```

---

## 🔍 主要関数リファレンス

### PersonalizedLearningNav

| 関数名 | 戻り値 | 説明 |
|-------|-------|------|
| `analyzeAllData()` | Object | 全学習データを分析 |
| `getTestHistory()` | Array | テスト+復習履歴を統合して取得 |
| `getStreak()` | Object | 連続学習日数（current, longest） |
| `getTodayProgress()` | Object | 今日の学習状況（completed, accuracy） |
| `estimateCurrentScore()` | Number | 現在のスコア予測 |
| `estimateDaysToGoal()` | Number | 目標達成予測日数 |
| `analyzePerformanceTrend()` | Object | パフォーマンストレンド分析 |
| `analyzeCategories()` | Object | カテゴリ別分析（weakest, strongest） |

### PersonalizedDashboard

| 関数名 | 引数 | 戻り値 | 説明 |
|-------|-----|-------|------|
| `generateStatusPanel(analysis)` | analysis | String (HTML) | 「つかささんの今」生成 |
| `generateGrowthSummary(analysis)` | analysis | String (HTML) | 「成長サマリー」生成 |
| `render()` | - | - | ダッシュボード全体をレンダリング |

---

## 🎯 実際の動作例

### ケース1: 初回起動（データなし）

**状態**:
- テスト履歴: 0件
- 復習履歴: 0件

**「つかささんの今」表示**:
```
📊 つかささんの今

今日の調子: 😊 通常
連続学習: 0日
今日の学習: 0回

🎯 目標まで
現在の推定スコア: 500点
目標スコア: 800点
あと: 300点
```

**「成長サマリー」表示**:
```
📈 成長サマリー

📊 最近のトレンド: データ不足
🎯 最近の正答率: 0%
```

---

### ケース2: 通常利用（10回テスト実施済み）

**状態**:
- テスト履歴: 10件（最近5回の平均正答率: 75%）
- 過去5回の平均正答率: 65%
- 今日のテスト: 2回（正答率: 80%）
- 連続学習: 7日

**「つかささんの今」表示**:
```
📊 つかささんの今

今日の調子: 🔥 絶好調
連続学習: 7日
今日の学習: 2回
今日の正答率: 80%

🎯 目標まで
現在の推定スコア: 700点
目標スコア: 800点
あと: 100点
```

**「成長サマリー」表示**:
```
📈 成長サマリー

📈 最近のトレンド: 上昇中 (+10%)
🎯 最近の正答率: 75%
⭐ 得意分野: 動詞の形
💪 強化中: 前置詞

🔮 このペースなら、35日後に目標達成予定！
```

---

## 🐛 デバッグTips

### ブラウザコンソールでデータ確認

```javascript
// 1. テスト履歴確認
const history = PersonalizedLearningNav.getTestHistory();
console.table(history);

// 2. 今日の学習状況
const todayProgress = PersonalizedLearningNav.getTodayProgress();
console.log('今日の学習:', todayProgress);

// 3. 全分析データ確認
const analysis = PersonalizedLearningNav.analyzeAllData();
console.log('分析データ:', analysis);

// 4. スコア予測確認
const score = PersonalizedLearningNav.estimateCurrentScore();
console.log('推定スコア:', score);

// 5. LocalStorageのデータ確認
console.log('progress:', JSON.parse(localStorage.getItem('progress')));
console.log('reviewHistory:', JSON.parse(localStorage.getItem('reviewHistory')));
console.log('userProfile:', JSON.parse(localStorage.getItem('userProfile')));
```

### 自動完了機能でテストデータ生成

```javascript
// index.htmlの🔧自動完了ボタンを使用
// 1クリックで30問のテストデータを自動生成（正答率約70%）
```

---

## 📝 まとめ

### 「つかささんの今」のロジック

1. **データ収集**: LocalStorageから今日のテスト履歴、連続日数を取得
2. **正答率計算**: 今日のscore合計 ÷ questions合計
3. **調子判定**: 正答率に応じて4段階（絶好調/好調/通常/要休憩）
4. **スコア予測**: 最近5回の平均から`400 + (正答率 * 400)`で計算
5. **HTML生成**: 条件分岐を含むテンプレート文字列で表示

### 「成長サマリー」のロジック

1. **トレンド分析**: 最近5回 vs 過去5回の正答率を比較
2. **改善率計算**: 差分が+5%以上で「上昇」、-5%以下で「下降」
3. **カテゴリ分析**: WeaknessAnalysisから最弱・最強カテゴリを取得
4. **目標予測**: 改善率と残り点数から週2回学習ペースで日数計算
5. **HTML生成**: 条件付き表示（データ不足時は非表示）

### データフロー

```
LocalStorage → PersonalizedLearningNav → analysis → PersonalizedDashboard → HTML
```

すべてクライアントサイド（JavaScript + LocalStorage）で完結しており、サーバー通信は一切不要です。

---

**調査完了日**: 2025-12-08  
**調査者**: AI Assistant  
**対象ユーザー**: ツカサさん  
**調査目的**: 学習プランカード表示ロジックの完全解明
