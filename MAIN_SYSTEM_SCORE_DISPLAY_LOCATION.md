# メインシステム予測スコアの表示場所 📍

## 調査日時
2025-12-08

## 表示場所

### 🎯 **テスト結果画面（`resultScreen`）**

メインシステムの予測スコアは、**テスト終了後の結果画面**にのみ表示されています。

---

## 📍 詳細な表示場所

### HTML構造
**ファイル**: `index.html` (行962-1004)
**画面ID**: `resultScreen`

```html
<div id="resultScreen" class="screen">
    <div class="container">
        <div class="result-header">
            <h2>テスト結果</h2>
            <!-- スコア円グラフ表示 -->
        </div>

        <div class="result-analysis">
            <h3>📊 分析結果</h3>
            <div class="analysis-grid" id="analysisGrid">
                <!-- ⭐ ここに予測スコアが動的に挿入される -->
            </div>
        </div>
    </div>
</div>
```

---

## 🎨 表示される内容

### JavaScript生成部分
**ファイル**: `js/app.js` (行950-1001)
**関数**: `renderAnalysis(prediction)`

**表示される6つの項目**:

#### 1️⃣ **PART5予測スコア** 💜
```javascript
<div class="analysis-item" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
  <p class="analysis-label">PART5予測スコア</p>
  <p class="analysis-value">${prediction.part5Score}</p>
  <p>/ 200点</p>
</div>
```
- **範囲**: 75～180点
- **背景**: 紫のグラデーション
- **例**: `150` / 200点

#### 2️⃣ **リーディング予測** 💗
```javascript
<div class="analysis-item" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
  <p class="analysis-label">リーディング予測</p>
  <p class="analysis-value">${prediction.readingScore}</p>
  <p>/ 495点</p>
</div>
```
- **計算式**: `PART5スコア × 2.75`
- **背景**: ピンクのグラデーション
- **例**: `413` / 495点

#### 3️⃣ **総合予測スコア** 💙
```javascript
<div class="analysis-item" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
  <p class="analysis-label">総合予測スコア</p>
  <p class="analysis-value">${prediction.minTotalScore}-${prediction.maxTotalScore}</p>
  <p>/ 990点</p>
</div>
```
- **範囲表示**: 最小値～最大値
- **背景**: 青のグラデーション
- **例**: `310-516` / 990点

#### 4️⃣ **正答率** ✅
```javascript
<div class="analysis-item">
  <p class="analysis-label">正答率</p>
  <p class="analysis-value">${percentage}%</p>
</div>
```
- **計算**: `(正解数 / 30) × 100`
- **例**: `80%`

#### 5️⃣ **レベル** 🏆
```javascript
<div class="analysis-item">
  <p class="analysis-label">レベル</p>
  <p class="analysis-value">${prediction.level}</p>
</div>
```
- **レベル判定**:
  - Aレベル（ハイスコア）
  - Bレベル（上級）
  - Cレベル（中上級）
  - Dレベル（中級）
  - Eレベル（初中級）
  - Fレベル（基礎）

#### 6️⃣ **所要時間** ⏱️
```javascript
<div class="analysis-item">
  <p class="analysis-label">所要時間</p>
  <p class="analysis-value">${getElapsedTime()}</p>
</div>
```
- **例**: `12:34`

---

## 🔄 表示までの流れ

### 1. テスト終了時
```javascript
// js/app.js (行796)
function finishTest() {
    // ... スコア計算 ...
    showResultScreen(); // ⭐ 結果画面を表示
}
```

### 2. 結果画面の表示
```javascript
// js/app.js (行923-948)
function showResultScreen() {
    const score = AppState.score;
    const total = 30;
    
    // ⭐ TOEICスコア予測を計算
    const prediction = predictTOEICScore(score, total);
    
    // スコア円グラフを更新
    document.getElementById('scorePercentage').textContent = percentage;
    document.getElementById('correctCount').textContent = score;
    
    // ⭐ 分析結果（予測スコア）を表示
    renderAnalysis(prediction);
    
    // 秘書の評価を表示
    SecretaryTeam.showAllEvaluations(score, total);
    
    // 間違えた問題を表示
    renderWrongQuestions();
    
    // 画面切り替え
    showScreen('resultScreen');
}
```

### 3. スコア予測の計算
```javascript
// js/app.js (行837-920)
function predictTOEICScore(correctCount, totalQuestions) {
    const accuracy = correctCount / totalQuestions;
    
    // 15段階の精密な予測テーブル
    let predictedPart5Score;
    if (accuracy >= 0.95) predictedPart5Score = 180;
    else if (accuracy >= 0.90) predictedPart5Score = 170;
    // ... (中略) ...
    else predictedPart5Score = Math.round(accuracy * 180);
    
    // リーディング予測
    const estimatedReadingScore = Math.round(predictedPart5Score * 2.75);
    
    // 総合スコア範囲
    const minTotalScore = Math.max(10, Math.round(estimatedReadingScore * 0.75));
    const maxTotalScore = Math.min(990, Math.round(estimatedReadingScore * 1.25));
    
    // レベル判定
    const level = getScoreLevel(estimatedReadingScore);
    
    return {
        part5Score: predictedPart5Score,
        readingScore: estimatedReadingScore,
        minTotalScore: minTotalScore,
        maxTotalScore: maxTotalScore,
        level: level
    };
}
```

### 4. 分析結果の描画
```javascript
// js/app.js (行950-1001)
function renderAnalysis(prediction) {
    const analysisGrid = document.getElementById('analysisGrid');
    
    // 6つの分析項目をHTMLとして生成
    analysisGrid.innerHTML = `
        <!-- PART5予測スコア -->
        <!-- リーディング予測 -->
        <!-- 総合予測スコア -->
        <!-- 正答率 -->
        <!-- レベル -->
        <!-- 所要時間 -->
    `;
}
```

---

## 📊 表示例（実際の画面イメージ）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
           📊 分析結果
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┏━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━┓
┃ 💜 PART5予測  ┃ ┃ 💗 リーディング┃ ┃ 💙 総合予測   ┃
┃              ┃ ┃   予測       ┃ ┃   スコア     ┃
┃    150       ┃ ┃    413       ┃ ┃  310-516     ┃
┃  / 200点     ┃ ┃  / 495点     ┃ ┃  / 990点     ┃
┗━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━┛

┏━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━┓ ┏━━━━━━━━━━━━━┓
┃   正答率     ┃ ┃   レベル     ┃ ┃  所要時間    ┃
┃              ┃ ┃              ┃ ┃              ┃
┃    80%       ┃ ┃ Dレベル(中級)┃ ┃   12:34      ┃
┗━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━┛ ┗━━━━━━━━━━━━━┛
```

---

## 🔍 重要な発見

### ✅ **表示されている場所**
- **唯一の表示場所**: テスト結果画面（`resultScreen`）
- **タイミング**: テスト終了直後
- **表示方法**: 動的にHTMLを生成して挿入

### ❌ **表示されていない場所**
- ❌ ホーム画面（`homeScreen`）
- ❌ ダッシュボード（`personalizedDashboard`）
- ❌ 学習ナビゲーション（`learningNavigation`）
- ❌ 秘書の部屋（`secretaryPanel`）
- ❌ 成長ダッシュボード（`growthDashboard`）

---

## 💡 改善提案

### 1️⃣ **ホーム画面にも表示**
現在、メインシステムの精密なスコアは結果画面でしか見られません。
ホーム画面に「最新のスコア予測」として表示すると便利です。

```html
<!-- ホーム画面に追加する例 -->
<div class="latest-score-prediction">
    <h3>📊 最新のスコア予測</h3>
    <div class="score-cards">
        <div class="score-card">
            <p>PART5予測</p>
            <p class="big-number">150点</p>
        </div>
        <div class="score-card">
            <p>総合予測</p>
            <p class="big-number">310-516点</p>
        </div>
    </div>
</div>
```

### 2️⃣ **学習履歴グラフ**
複数回のテスト結果を折れ線グラフで表示し、スコアの推移を可視化

### 3️⃣ **目標達成までの距離**
```
現在の予測スコア: 516点（最高値）
目標スコア: 800点
あと: 284点（進捗率 64.5%）
```

---

## 📌 まとめ

**メインシステムの予測スコアは**:
- ✅ **テスト結果画面（`resultScreen`）にのみ表示**
- ✅ **最も精密な15段階の予測アルゴリズムを使用**
- ✅ **PART5/リーディング/総合の3種類のスコアを表示**
- ⚠️ **ホーム画面やダッシュボードには表示されていない**

→ **せっかくの精密なスコア予測が、結果画面でしか見られない状態です！**

---

**作成者**: AI Assistant  
**調査対象**: TOEIC Part5 学習アプリ  
**調査ファイル**: `index.html`, `js/app.js`  
**調査完了日**: 2025-12-08
