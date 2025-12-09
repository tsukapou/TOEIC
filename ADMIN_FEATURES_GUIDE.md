# 🔧 管理者機能ガイド
**作成日**: 2025-12-09  
**対象**: 開発者・管理者

---

## 📋 概要

TOEIC学習アプリの管理者専用機能をまとめたガイドです。テスト、分析、デバッグに役立つ機能が集約されています。

---

## 🚀 アクセス方法

### 管理者メニュー
すべての管理者機能にアクセスできる統合メニューです。

**URL**: `admin-menu.html`

**主な機能**:
- 📊 アナリティクスダッシュボード
- 🔓 全秘書解放
- 🏆 ランキング
- 🎓 オンボーディングテスト
- 💾 データバックアップ
- 🔄 全データリセット

---

## 🔓 全秘書解放機能

### URL
`admin-secretary-unlock.html`

### 機能説明
全23人の秘書を一括で解放できる管理者専用機能です。

### 使い方

#### 1. 現在の解放状況を確認
- **解放済み秘書数**: 上部に「○ / 23」と表示
- **秘書リスト**: スクロール可能なリストで全秘書の状態を確認

#### 2. 全秘書を解放
```
1. 「🚀 全秘書を解放する（23人）」ボタンをクリック
2. 確認ダイアログで「OK」を選択
3. 成功メッセージが表示される
4. 解放状況が自動更新される
```

#### 3. 解放状態をリセット
```
1. 「🔄 解放状態をリセット（初期状態に戻す）」ボタンをクリック
2. 確認ダイアログで「OK」を選択
3. 初期状態（山田さん、田中さん、佐藤さんのみ）に戻る
```

### 解放される秘書一覧（全23人）

#### Tier 1（初期3人）
- 山田さん
- 田中さん
- 佐藤さん

#### Tier 2（5人）
- 鈴木さん
- 高橋さん
- 伊藤さん
- 渡辺さん
- 中村さん

#### Tier 3（7人）
- 小林さん
- 加藤さん
- 吉田さん
- 山本さん
- 井上さん
- 木村さん
- 林さん

#### Tier 4（7人 + 特別秘書）
- 清水さん
- 山口さん
- 松本さん
- 井上さん
- 中島さん
- **リオさん**（特別秘書）
- **ミオさん**（特別秘書）

#### Tier 5（管理者専用）
- 管理者専用秘書

### データの保存場所
解放状態は `localStorage` の以下のキーに保存されます：
```
toeic_unlocked_secretaries
```

保存形式：
```json
["yamada", "tanaka", "sato", "suzuki", ...]
```

### 注意事項
⚠️ この機能はテスト・開発用です。実績システムの進行状況には影響しません。

---

## 📊 アナリティクスダッシュボード

### URL
`admin-dashboard.html`

### 機能説明
アプリの利用状況をリアルタイムで分析するダッシュボードです。

### 表示データ

#### KPIメトリクス（6項目）
1. **平均DAU（7日間）**: デイリーアクティブユーザー数
2. **総テスト実施数**: 累計テスト回数
3. **平均正答率**: 全ユーザーの平均スコア
4. **Premium転換率**: 有料プラン購入率
5. **累計売上**: 総売上金額
6. **Day 7継続率**: 7日後も利用しているユーザーの割合

#### グラフ（2種類）
1. **DAUチャート**: 過去7日間の日次アクティブユーザー推移
2. **テスト実施数チャート**: 過去7日間のテスト回数推移

#### 問題分析（2種類）
1. **難問トップ10**: 正答率が低い問題ランキング
2. **簡問トップ10**: 正答率が高い問題ランキング

### 使い方
```
1. ページを開くと自動的にデータが読み込まれる
2. 「🔄 データ更新」ボタンでリアルタイム更新
3. グラフをホバーすると詳細データが表示される
```

### データ更新間隔
- 手動更新: 「🔄 データ更新」ボタン
- 自動更新: ページリロード時

---

## 💾 データバックアップ機能

### 使い方
```
1. admin-menu.html を開く
2. 「💾 データバックアップ」カードをクリック
3. 確認ダイアログで「OK」を選択
4. JSON形式でダウンロードされる
```

### バックアップファイル
- **ファイル名**: `toeic_backup_YYYY-MM-DD.json`
- **形式**: JSON
- **内容**: 全てのlocalStorageデータ

### バックアップされるデータ
- ユーザープロフィール
- 学習履歴
- 実績・アチーブメント
- ストリーク記録
- 復習データ
- 秘書解放状態
- Premium購入状態
- アナリティクスデータ

---

## 🔄 全データリセット機能

### ⚠️ 重要な注意事項
**この操作は取り消せません！**

必ず事前にデータバックアップを取得してください。

### 使い方
```
1. admin-menu.html を開く
2. 「🔄 全データリセット」カードをクリック
3. 確認ダイアログに「RESET」と入力
4. 全データが削除され、初期状態に戻る
5. 3秒後に自動的にリロードされる
```

### リセットされるデータ
- ✅ ユーザープロフィール
- ✅ 学習履歴
- ✅ 実績・アチーブメント
- ✅ ストリーク記録
- ✅ 復習データ
- ✅ 秘書解放状態
- ✅ Premium購入状態
- ✅ アナリティクスデータ
- ✅ ソーシャルデータ

### リセット後の状態
- 初回ユーザーとして扱われる
- オンボーディングが表示される
- 秘書は3人（山田さん、田中さん、佐藤さん）のみ
- Freeプラン
- 学習データなし

---

## 🏆 ランキング

### URL
`ranking.html`

### 機能説明
全国ランキングとフレンドランキングを表示します。

### タブ
1. **全国ランキング**: ダミーデータを含む全ユーザーランキング
2. **フレンドランキング**: 友達のみのランキング（デモ版では未実装）

### 友達招待機能
- 「📤 招待リンクをシェア」ボタン
- Twitter/LINE でシェア可能
- Web Share API 対応ブラウザでは標準シェアダイアログ

---

## 🎓 オンボーディングテスト

### URL
`test-onboarding-full.html`

### 機能説明
初回ユーザー体験をテストするための完全版オンボーディングページです。

### テスト項目
1. **Step 1: ようこそ画面**
2. **Step 2: レベル診断テスト**（5問）
3. **Step 3: 推奨学習プラン**
4. **Step 4: 秘書の部屋へ誘導**

### コントロールパネル
- 各ステップから開始可能
- データリセット機能
- リアルタイムログ表示

---

## 🛠️ 開発者向け情報

### localStorage キー一覧

#### ユーザーデータ
- `toeic_user_profile` - ユーザープロフィール
- `toeic_user_id` - ユーザーID
- `toeic_user_plan` - プラン情報（Free/Premium）

#### 学習データ
- `toeic_test_history` - テスト履歴
- `toeic_review_questions` - 復習問題
- `toeic_streak_data` - ストリーク記録
- `toeic_learning_sessions` - 学習セッション

#### 実績・ポイント
- `toeic_achievements` - 実績解放状態
- `toeic_achievement_progress` - 実績進捗
- `toeic_daily_missions` - デイリーミッション
- `toeic_points` - ポイント残高

#### 秘書システム
- `toeic_unlocked_secretaries` - 解放済み秘書
- `toeic_selected_secretary` - 選択中の秘書
- `toeic_greeting_team` - グリーティングチーム

#### ソーシャル
- `toeic_social_data` - SNSシェア履歴
- `toeic_ranking_data` - ランキングデータ

#### 分析
- `toeic_admin_analytics` - アナリティクスデータ

### デバッグコマンド（ブラウザコンソール）

#### 秘書を手動で解放
```javascript
// 特定の秘書を解放
const unlocked = JSON.parse(localStorage.getItem('toeic_unlocked_secretaries'));
unlocked.push('rio');
localStorage.setItem('toeic_unlocked_secretaries', JSON.stringify(unlocked));
```

#### Premiumプランを有効化
```javascript
const plan = JSON.parse(localStorage.getItem('toeic_user_plan'));
plan.type = 'premium';
plan.expiryDate = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1年後
localStorage.setItem('toeic_user_plan', JSON.stringify(plan));
```

#### 実績を手動で解放
```javascript
const achievements = JSON.parse(localStorage.getItem('toeic_achievements')) || {};
achievements['first_test'] = { unlocked: true, timestamp: Date.now() };
localStorage.setItem('toeic_achievements', JSON.stringify(achievements));
```

---

## 🔗 関連ファイル

### 管理者機能ファイル
- `admin-menu.html` - 管理者メニュー（統合画面）
- `admin-secretary-unlock.html` - 全秘書解放
- `admin-dashboard.html` - アナリティクスダッシュボード

### JavaScript
- `js/monetization-system.js` - 収益化システム
- `js/admin-analytics.js` - アナリティクスエンジン
- `js/social-features.js` - ソーシャル機能

### ドキュメント
- `MONETIZATION_COMPLETE_REPORT.md` - 収益化実装レポート
- `README.md` - プロジェクト概要

---

## 💡 Tips

### テスト環境の構築
```
1. データバックアップを取得
2. 全データリセットで初期化
3. 全秘書解放で機能確認
4. テスト完了後、バックアップから復元
```

### 本番環境へのデプロイ時
- `admin-*` ファイルは削除またはアクセス制限
- アナリティクスデータは定期的にバックアップ
- Premium購入データは別途管理

---

**作成日**: 2025-12-09  
**最終更新**: 2025-12-09  
**作成者**: AI Assistant
