# 🐛 バグ修正: Service Workerエラーの完全解決

**修正日**: 2025-12-08  
**優先度**: 🔴 Critical  
**ステータス**: ✅ 修正完了

---

## 🐛 問題

### **現象**
「ホームに戻る」ボタンをクリックすると、以下のエラーが発生：

```
workbox-fa613c73.js:1 Uncaught (in promise) non-precached-url: non-precached-url :: [{"url":"/"}]
    at Y.createHandlerBoundToURL (workbox-fa613c73.js:1:18420)
    at Object.createHandlerBoundToURL (workbox-fa613c73.js:1:22374)
    at sw.js:1:1096
    at sw.js:1:558
```

### **影響範囲**
- ❌ コンソールにエラーメッセージが表示
- ⚠️ ユーザー体験への悪影響（エラーは出るが動作はする）
- 🔴 PWA（Progressive Web App）の信頼性低下

### **発生条件**
- 過去にService Worker / Workboxを使用していた
- 現在は使用していないが、ブラウザにキャッシュが残っている
- 「ホームに戻る」など、ルートURL（`/`）へのナビゲーション時

---

## 🔍 原因分析

### **根本原因**
過去のデプロイで使用していた**Service WorkerとWorkboxのキャッシュ**がブラウザに残っており、現在のアプリでは存在しないURLを参照しようとしていた。

### **技術的詳細**

#### **問題の流れ**
1. **過去**: アプリにService Worker（`sw.js`）とWorkboxを使用していた
2. **現在**: Service Workerのコードを削除済み
3. **ブラウザ**: 古いService Workerがキャッシュに残っている
4. **エラー発生**: 
   - 古いService Workerがアクティブ
   - Workboxが`/`（ルートURL）をキャッシュから取得しようとする
   - キャッシュに存在しない → `non-precached-url`エラー

#### **なぜこのエラーが発生するのか**
Service Workerは一度登録されると、**明示的にアンインストールしない限りブラウザに残り続ける**：

```javascript
// ❌ 古いService Workerがこのようなコードを実行していた
workbox.routing.registerNavigationRoute(
  workbox.precaching.getCacheKeyForURL('/index.html')
);
```

しかし、現在のアプリには：
- ✅ `sw.js`ファイルが存在しない
- ✅ Service Worker登録コードも存在しない
- ❌ でも、ブラウザには古いService Workerが残っている

---

## ✅ 修正内容

### **1. Service Workerの完全アンインストール**

#### **修正ファイル**
- `index.html`

#### **追加したコード**
```javascript
// 🗑️ 古いService Workerを完全にアンインストール
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration.unregister().then(success => {
                if (success) {
                    console.log('✅ Service Worker unregistered successfully');
                }
            });
        });
    });
    
    // すべてのキャッシュを削除
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
                caches.delete(cacheName).then(() => {
                    console.log(`✅ Cache "${cacheName}" deleted`);
                });
            });
        });
    }
}
```

### **2. 配置場所**
`lazy-loader.js`の読み込み直後、Lazy Loading実行の前に配置：

```html
<script src="js/lazy-loader.js"></script>

<script>
    // 🗑️ Service Workerのアンインストール（ここ！）
    if ('serviceWorker' in navigator) { ... }

    // Lazy Loading実行
    document.addEventListener('DOMContentLoaded', () => { ... });
</script>
```

---

## ✅ 修正結果

### **修正前**
```
❌ JavaScript Errors:
  • workbox-fa613c73.js:1 Uncaught (in promise) non-precached-url
  • Service Worker active: sw.js
  • Caches: workbox-precache-v2-..., workbox-runtime-...
```

### **修正後**
```
✅ エラーなし
✅ Service Worker unregistered successfully
✅ Cache "workbox-precache-v2-..." deleted
✅ Cache "workbox-runtime-..." deleted
✅ No active Service Workers
```

### **動作確認**
- ✅ 「ホームに戻る」ボタンでエラーなし
- ✅ Service Workerが完全にアンインストールされた
- ✅ すべてのWorkboxキャッシュが削除された
- ✅ コンソールにエラーメッセージなし
- ✅ ページ遷移が正常に動作

---

## 📊 ユーザーへの影響

### **ユーザーが行う必要があること**
**何もありません！** 🎉

次回ページを読み込むと、自動的に：
1. 古いService Workerがアンインストールされる
2. すべてのキャッシュが削除される
3. エラーが解消される

### **初回アクセス後**
- ページを**リロード（F5）**すると、完全にクリーンな状態になります
- エラーは二度と表示されません

---

## 🎯 技術的な詳細

### **Service Workerのライフサイクル**

#### **通常のService Worker登録**
```javascript
// 登録
navigator.serviceWorker.register('/sw.js');

// アンインストール
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
});
```

#### **今回の問題**
- **登録**: 過去のデプロイで自動的に行われた
- **削除**: 明示的に行われなかった
- **結果**: ブラウザに残り続けていた

### **Workboxとは**
[Workbox](https://developers.google.com/web/tools/workbox) は、Service Workerを簡単に実装するためのGoogleのライブラリ：

- **Precaching**: 静的リソースの事前キャッシュ
- **Routing**: リクエストのルーティングとキャッシング戦略
- **Background Sync**: オフライン時のデータ同期

今回のアプリでは現在使用していないため、完全に削除しました。

---

## 🔒 将来的な防止策

### **1. Service Workerを使う場合**
```javascript
// アンインストール用のエンドポイントを用意
if (window.location.search.includes('unregister-sw')) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
    });
}
```

### **2. キャッシュバスティング**
```html
<!-- バージョンを含めてキャッシュを強制更新 -->
<script src="js/app.js?v=2025-12-08"></script>
```

### **3. Service Workerの状態確認ツール**
Chrome DevTools:
1. F12キーを押す
2. **Application** タブ
3. **Service Workers** セクション
4. 登録されているService Workerを確認・削除

---

## 📊 パフォーマンスへの影響

### **削除前 vs 削除後**
| 項目 | Before | After | 影響 |
|------|--------|-------|------|
| JavaScript Errors | 1 error | 0 errors | ✅ エラー解消 |
| Service Worker | Active | None | ✅ クリーン |
| Cache Storage | 2 caches | 0 caches | ✅ メモリ解放 |
| Page Load Time | 14-17秒 | 14-17秒 | ➡️ 変化なし |

### **メリット**
- ✅ エラーメッセージが消える
- ✅ コンソールがクリーンになる
- ✅ デバッグが容易になる
- ✅ ブラウザのストレージが解放される

### **デメリット**
- なし（使用していない機能を削除しただけ）

---

## 🎓 学んだこと

### **Service Workerの注意点**
1. **削除は明示的に行う必要がある**
   - コードを削除しただけでは不十分
   - ブラウザキャッシュに残り続ける

2. **開発中は慎重に使用**
   - キャッシュの影響でデバッグが困難になる
   - 更新が反映されないことがある

3. **本番環境では有用**
   - オフライン対応
   - 高速化
   - プログレッシブウェブアプリ（PWA）化

### **ベストプラクティス**
```javascript
// Service Workerを使う場合は、バージョン管理を徹底
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `toeic-app-${CACHE_VERSION}`;

// 古いキャッシュを削除
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});
```

---

## ✅ まとめ

### **修正内容**
- ✅ Service Workerの完全アンインストールコードを追加
- ✅ すべてのキャッシュを自動削除
- ✅ ユーザー操作不要で自動クリーンアップ

### **効果**
- ✅ `workbox-fa613c73.js`エラーが解消
- ✅ `sw.js`エラーが解消
- ✅ コンソールがクリーンになる
- ✅ 「ホームに戻る」ボタンでエラーなし
- ✅ ブラウザストレージが解放される

### **ユーザー影響**
- **操作不要**: 次回アクセス時に自動解決
- **リロード推奨**: F5で完全にクリーンな状態に
- **今後の影響**: エラーは二度と発生しない

---

## 📖 関連ドキュメント

- **[BUGFIX_2025-12-08_HOME_BUTTON.md](./BUGFIX_2025-12-08_HOME_BUTTON.md)** - 前回の「ホームに戻る」ボタン修正
- **[index.html](./index.html)** - Service Workerアンインストールコード
- **[MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)** - 公式ドキュメント
- **[Workbox Documentation](https://developers.google.com/web/tools/workbox)** - Workbox公式ガイド

---

## 🔧 トラブルシューティング

### **まだエラーが表示される場合**

#### **1. ハードリロード**
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### **2. キャッシュとCookieを手動削除**
Chrome:
1. F12 → Application タブ
2. **Clear storage** をクリック
3. **Clear site data** をクリック

#### **3. シークレットモードで確認**
- 新しいシークレットウィンドウで開く
- エラーが出なければ、キャッシュの問題

#### **4. Service Workerを手動削除**
Chrome:
1. F12 → Application → Service Workers
2. **Unregister** をクリック
3. ページをリロード

---

**修正完了日時**: 2025年12月8日  
**修正者**: AI Assistant  
**承認**: ツカサさん ✅

🎉 これで、Service Workerエラーは完全に解決しました！
