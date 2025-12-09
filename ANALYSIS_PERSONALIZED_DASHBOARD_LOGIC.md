# 📊 分析レポート: 学習プランカードのロジック

**分析日**: 2025-12-08  
**対象**: 「つかささんの今」と「成長サマリー」の表示ロジック  
**ステータス**: ✅ 分析完了

---

## 🎯 概要

学習プランカード内の2つのパネルは、LocalStorageに保存された学習履歴データを分析して、リアルタイムでユーザーの状態を表示します。

### **データフロー**
```
LocalStorage（学習履歴）
    ↓
PersonalizedLearningNav.analyzeAllData()
    ↓
5つの分析結果を生成
    ↓
PersonalizedDashboard.render()
    ↓
2つのパネルを表示
```

---

## 📊 1. 「つかささんの今」のロジック

### **表示される情報**
1. **今日の調子** - 今日の正答率に基づく
2. **連続学習** - StreakSystemから取得
3. **今日の学習** - 今日完了したテスト数
4. **今日の正答率** - 今日の全テストの平均
5. **目標まで** - 推定スコアと目標スコアの差

---

### **📈 1-1. 今日の調子（コンディション判定）**

#### **ロジック**
```javascript
// js/personalized-dashboard.js - Line 327-342

let condition = "😊 通常";
let conditionClass = "normal";

if (todayCompleted > 0) {
  if (todayAccuracy >= 80) {
    condition = "🔥 絶好調";
    conditionClass = "excellent";
  } else if (todayAccuracy >= 70) {
    condition = "😊 好調";
    conditionClass = "good";
  } else if (todayAccuracy < 60) {
    condition = "😅 要休憩";
    conditionClass = "tired";
  }
}
```

#### **判定基準**
| 今日の正答率 | コンディション | クラス | 意味 |
|------------|--------------|--------|------|
| **データなし** | 😊 通常 | normal | 今日まだテストしていない |
| **80%以上** | 🔥 絶好調 | excellent | 最高の調子！ |
| **70-79%** | 😊 好調 | good | 良い調子 |
| **60-69%** | 😊 通常 | normal | 普通の調子 |
| **60%未満** | 😅 要休憩 | tired | 休憩が必要 |

#### **データソース**
- `todayCompleted`: 今日完了したテスト数
- `todayAccuracy`: 今日の全テストの平均正答率

---

### **🔥 1-2. 連続学習（ストリーク）**

#### **ロジック**
```javascript
// js/personalized-learning-nav.js - Line 385-390

getStreak() {
  if (typeof StreakSystem !== 'undefined' && 
      typeof StreakSystem.getStreak === 'function') {
    return StreakSystem.getStreak();
  }
  return { current: 0, longest: 0 };
}
```

#### **データソース**
- `StreakSystem.getStreak()` から取得
- LocalStorage: `toeic_streak_data`
- 毎日の学習記録を追跡

#### **表示例**
```
連続学習: 3日
連続学習: 0日（途切れている場合）
```

---

### **📝 1-3. 今日の学習（完了テスト数）**

#### **ロジック**
```javascript
// js/personalized-learning-nav.js - Line 392-412

getTodayProgress() {
  const today = new Date().toDateString();
  const history = this.getTestHistory();
  
  const todayTests = history.filter(test => {
    const testDate = new Date(test.timestamp).toDateString();
    return testDate === today;
  });
  
  if (todayTests.length === 0) {
    return { completed: 0, accuracy: 0 };
  }
  
  const totalCorrect = todayTests.reduce((sum, test) => sum + test.score, 0);
  const totalQuestions = todayTests.reduce((sum, test) => sum + test.totalQuestions, 0);
  
  return {
    completed: todayTests.length,
    accuracy: totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0
  };
}
```

#### **データソース**
- LocalStorage: `progress`（通常テスト）
- LocalStorage: `reviewHistory`（復習テスト）
- 今日のタイムスタンプと一致するテストをカウント

#### **表示例**
```
今日の学習: 0回（まだテストしていない）
今日の学習: 1回
今日の学習: 3回
```

---

### **🎯 1-4. 今日の正答率**

#### **計算式**
```javascript
// 今日の全テストの合計
const totalCorrect = todayTests.reduce((sum, test) => sum + test.score, 0);
const totalQuestions = todayTests.reduce((sum, test) => sum + test.totalQuestions, 0);

// 正答率
accuracy = Math.round((totalCorrect / totalQuestions) * 100)
```

#### **例**
```
テスト1: 21/30問正解（70%）
テスト2: 24/30問正解（80%）

合計: 45/60問正解
正答率: 75%
```

#### **表示条件**
- `todayCompleted > 0` の場合のみ表示
- まだテストしていない場合は非表示

---

### **🎯 1-5. 目標まで（スコア予測）**

#### **ロジック**
```javascript
// js/personalized-learning-nav.js - Line 282-296

estimateCurrentScore() {
  const history = this.getTestHistory();
  if (history.length === 0) return 500;
  
  // 最近5回の平均から予測
  const recent = history.slice(-5);
  const avgAccuracy = recent.reduce((sum, test) => 
    sum + (test.score / test.totalQuestions), 0) / recent.length;
  
  // PART5の正答率からTOEICスコアを予測
  // 簡易的な換算式
  let estimatedScore = 400 + (avgAccuracy * 400);
  
  return Math.round(estimatedScore);
}
```

#### **換算式**
```
推定スコア = 400 + (平均正答率 × 400)

例:
- 0問正解（0%）: 400点
- 15問正解（50%）: 600点
- 21問正解（70%）: 680点
- 24問正解（80%）: 720点
- 30問正解（100%）: 800点
```

#### **データソース**
- 最近5回のテスト結果の平均正答率
- LocalStorage: `progress`

#### **表示例**
```
現在の推定スコア: 680点
目標スコア: 800点
あと: 120点
```

---

## 📈 2. 「成長サマリー」のロジック

### **表示される情報**
1. **最近のトレンド** - 上昇/下降/安定
2. **最近の正答率** - 直近5回の平均
3. **得意分野** - 最も正答率が高いカテゴリ
4. **強化中** - 最も正答率が低いカテゴリ
5. **目標達成予測** - あと何日で目標達成か

---

### **📊 2-1. 最近のトレンド**

#### **ロジック**
```javascript
// js/personalized-learning-nav.js - Line 231-261

analyzePerformanceTrend() {
  const history = this.getTestHistory();
  if (history.length < 2) {
    return {
      trend: "データ不足",
      improvement: 0,
      recentAccuracy: 0,
      pastAccuracy: 0
    };
  }
  
  // 最近5回と過去5回を比較
  const recent = history.slice(-5);
  const past = history.slice(-10, -5);
  
  const recentAvg = recent.reduce((sum, test) => 
    sum + (test.score / test.totalQuestions * 100), 0) / recent.length;
    
  const pastAvg = past.length > 0
    ? past.reduce((sum, test) => sum + (test.score / test.totalQuestions * 100), 0) / past.length
    : recentAvg;
  
  const improvement = recentAvg - pastAvg;
  
  return {
    trend: improvement > 5 ? "上昇" : improvement < -5 ? "下降" : "安定",
    improvement: Math.round(improvement),
    recentAccuracy: Math.round(recentAvg),
    pastAccuracy: Math.round(pastAvg)
  };
}
```

#### **判定基準**
| 改善度 | トレンド | アイコン | 表示 |
|-------|---------|---------|------|
| **+5%以上** | 上昇 | 📈 | 上昇中 (+10%) |
| **-5%以下** | 下降 | 📉 | 調整中 (-8%) |
| **-5%〜+5%** | 安定 | 📊 | 安定 |

#### **計算例**
```
過去5回（6-10回目）: 平均65%
最近5回（11-15回目）: 平均73%

改善度: +8%
トレンド: 上昇（📈 上昇中 (+8%)）
```

#### **データソース**
- 最近5回のテスト結果
- 過去5回のテスト結果（6-10回目）
- LocalStorage: `progress`

---

### **🎯 2-2. 最近の正答率**

#### **ロジック**
```javascript
// 最近5回の平均正答率
const recent = history.slice(-5);
const recentAvg = recent.reduce((sum, test) => 
  sum + (test.score / test.totalQuestions * 100), 0) / recent.length;
```

#### **データソース**
- 最近5回のテスト結果
- 復習テストも含む

#### **表示例**
```
最近の正答率: 73%
最近の正答率: 0%（データ不足）
```

---

### **⭐ 2-3. 得意分野**

#### **ロジック**
```javascript
// js/personalized-learning-nav.js - Line 164-186

analyzeCategories() {
  const categoryStats = {};
  
  // WeaknessAnalysisのデータを取得
  if (typeof WeaknessAnalysis !== 'undefined' && 
      typeof WeaknessAnalysis.getWeakCategories === 'function') {
    const weakCategories = WeaknessAnalysis.getWeakCategories();
    const strongCategories = WeaknessAnalysis.getStrongCategories 
      ? WeaknessAnalysis.getStrongCategories() 
      : [];
    
    return {
      weakest: weakCategories.length > 0 
        ? weakCategories[0].category 
        : "データ不足",
      strongest: strongCategories.length > 0 
        ? strongCategories[0].category 
        : "データ不足",
      needsAttention: weakCategories.slice(0, 3).map(c => c.category),
      mastered: strongCategories.slice(0, 3).map(c => c.category)
    };
  }
  
  return {
    weakest: "データ不足",
    strongest: "データ不足",
    needsAttention: [],
    mastered: []
  };
}
```

#### **データソース**
- `WeaknessAnalysis.getStrongCategories()`
- 各カテゴリ別の正答率を集計
- 最も正答率が高いカテゴリを表示

#### **表示条件**
- `strongest !== "データ不足"` の場合のみ表示
- データがない場合は非表示

#### **表示例**
```
得意分野: 品詞
得意分野: 動詞
（データ不足の場合は非表示）
```

---

### **💪 2-4. 強化中（苦手分野）**

#### **ロジック**
```javascript
// WeaknessAnalysis.getWeakCategories() の最初の要素
weakest: weakCategories.length > 0 
  ? weakCategories[0].category 
  : "データ不足"
```

#### **データソース**
- `WeaknessAnalysis.getWeakCategories()`
- 各カテゴリ別の正答率を集計
- 最も正答率が低いカテゴリを表示

#### **表示条件**
- `weakest !== "データ不足"` の場合のみ表示
- データがない場合は非表示

#### **表示例**
```
強化中: 前置詞
強化中: 接続詞
（データ不足の場合は非表示）
```

---

### **🔮 2-5. 目標達成予測**

#### **ロジック**
```javascript
// js/personalized-learning-nav.js - Line 298-314

estimateDaysToGoal() {
  const profile = this.getUserProfile();
  const current = this.estimateCurrentScore();
  const target = profile.targetScore || 800;
  const trend = this.analyzePerformanceTrend();
  
  if (current >= target) return 0;
  if (trend.improvement <= 0) return 999; // 改善なし
  
  const remainingPoints = target - current;
  const weeklyImprovement = trend.improvement * 2; // 週2回学習と仮定
  
  if (weeklyImprovement <= 0) return 999;
  
  const weeksNeeded = remainingPoints / weeklyImprovement;
  return Math.ceil(weeksNeeded * 7); // 日数に変換
}
```

#### **計算式**
```
1. 残りポイント = 目標スコア - 現在の推定スコア
2. 週間改善度 = トレンド改善度 × 2（週2回学習と仮定）
3. 必要週数 = 残りポイント ÷ 週間改善度
4. 必要日数 = 必要週数 × 7
```

#### **計算例**
```
現在の推定スコア: 680点
目標スコア: 800点
トレンド改善度: +8%/回（≒ +16点/回）

残りポイント: 120点
週間改善度: 16 × 2 = 32点/週
必要週数: 120 ÷ 32 = 3.75週
必要日数: 3.75 × 7 = 27日

表示: 「このペースなら、27日後に目標達成予定！」
```

#### **表示条件**
- `daysToGoal < 999` の場合のみ表示
- 改善傾向がない場合（`improvement <= 0`）は非表示
- 既に目標達成している場合は非表示

---

## 📊 データソースの詳細

### **LocalStorage Keys**
```javascript
// 1. 通常テストの進捗
localStorage.getItem('progress')
// 構造:
{
  tests: {
    1: { score: 21, timestamp: 1733712000000, timeInSeconds: 900 },
    2: { score: 24, timestamp: 1733798400000, timeInSeconds: 850 },
    ...
  }
}

// 2. 復習テストの履歴
localStorage.getItem('reviewHistory')
// 構造:
[
  { score: 8, totalQuestions: 10, timestamp: 1733884800000, timeInSeconds: 300 },
  ...
]

// 3. 学習ストリーク
localStorage.getItem('toeic_streak_data')
// 構造:
{
  currentStreak: 3,
  longestStreak: 7,
  lastStudyDate: "2025-12-08",
  ...
}

// 4. ユーザープロフィール
localStorage.getItem('userProfile')
// 構造:
{
  name: "ツカサ",
  targetScore: 800,
  examDate: "2025-06-01",
  ...
}
```

---

## 🔄 更新タイミング

### **初回表示**
```javascript
// index.html - DOMContentLoaded
PersonalizedLearningNav.init();
PersonalizedDashboard.render();
```

### **テスト完了後**
```javascript
// app.js - finishTest()
finishTest() {
  // 1. テスト結果をLocalStorageに保存
  saveProgress();
  
  // 2. ダッシュボードを再レンダリング
  if (typeof PersonalizedDashboard !== 'undefined') {
    PersonalizedDashboard.render();
  }
}
```

### **ホームに戻る時**
```javascript
// app.js - showHome()
showHome() {
  // ダッシュボードを再レンダリング
  if (typeof PersonalizedLearningNav !== 'undefined' && 
      typeof PersonalizedDashboard !== 'undefined') {
    PersonalizedDashboard.render();
  }
}
```

---

## 💡 使用例

### **ケース1: 初めてのユーザー（データなし）**

**表示内容:**
```
📊 ツカサの今
- 今日の調子: 😊 通常
- 連続学習: 0日
- 今日の学習: 0回
- 今日の正答率: （非表示）

🎯 目標まで
- 現在の推定スコア: 500点
- 目標スコア: 800点
- あと: 300点

📈 成長サマリー
- 最近のトレンド: データ不足
- 最近の正答率: 0%
- 得意分野: （非表示）
- 強化中: （非表示）
- 目標達成予測: （非表示）
```

---

### **ケース2: Test 1完了後**

**テスト結果:**
- 21/30問正解（70%）

**表示内容:**
```
📊 ツカサの今
- 今日の調子: 😊 好調
- 連続学習: 1日
- 今日の学習: 1回
- 今日の正答率: 70%

🎯 目標まで
- 現在の推定スコア: 680点
- 目標スコア: 800点
- あと: 120点

📈 成長サマリー
- 最近のトレンド: データ不足（1回のみ）
- 最近の正答率: 70%
- 得意分野: （非表示）
- 強化中: （非表示）
- 目標達成予測: （非表示）
```

---

### **ケース3: Test 5完了後（5日連続）**

**テスト結果:**
- Test 1: 21/30（70%）
- Test 2: 24/30（80%）
- Test 3: 22/30（73%）
- Test 4: 25/30（83%）
- Test 5: 26/30（87%）

**表示内容:**
```
📊 ツカサの今
- 今日の調子: 🔥 絶好調
- 連続学習: 5日
- 今日の学習: 1回
- 今日の正答率: 87%

🎯 目標まで
- 現在の推定スコア: 758点
- 目標スコア: 800点
- あと: 42点

📈 成長サマリー
- 最近のトレンド: 📈 上昇中 (+17%)
- 最近の正答率: 79%
- 得意分野: 品詞
- 強化中: 前置詞
- 目標達成予測: このペースなら、5日後に目標達成予定！
```

---

## 📖 関連ファイル

- **[js/personalized-learning-nav.js](./js/personalized-learning-nav.js)** - データ分析ロジック
- **[js/personalized-dashboard.js](./js/personalized-dashboard.js)** - UI表示ロジック
- **[js/weakness-analysis.js](./js/weakness-analysis.js)** - カテゴリ別分析
- **[js/streak-system.js](./js/streak-system.js)** - 学習ストリーク管理

---

**分析完了日時**: 2025年12月8日  
**分析者**: AI Assistant  
**承認**: ツカサさん ✅

🎉 これで、学習プランカードのロジックが完全に理解できました！
