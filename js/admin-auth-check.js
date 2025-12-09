/**
 * 管理者認証チェックスクリプト
 * Version: 1.0.0
 * Updated: 2025-12-09
 * 
 * 【使い方】
 * 各管理者ページの<head>内で最初に読み込む：
 * <script src="js/admin-auth-check.js"></script>
 */

(function() {
    const SESSION_KEY = 'toeic_admin_session';
    
    /**
     * セッションをチェック
     */
    function checkAdminSession() {
        const session = localStorage.getItem(SESSION_KEY);
        
        if (!session) {
            // セッションがない場合は認証ページへリダイレクト
            redirectToAuth();
            return false;
        }
        
        try {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            
            // セッションが有効期限内かチェック
            if (now < sessionData.expiryTime) {
                // セッション有効
                return true;
            } else {
                // 期限切れ
                localStorage.removeItem(SESSION_KEY);
                redirectToAuth();
                return false;
            }
        } catch (error) {
            // セッションデータが壊れている
            localStorage.removeItem(SESSION_KEY);
            redirectToAuth();
            return false;
        }
    }
    
    /**
     * 認証ページにリダイレクト
     */
    function redirectToAuth() {
        const currentPage = window.location.pathname.split('/').pop();
        
        // 無限ループを防ぐため、認証ページ自体はチェックしない
        if (currentPage !== 'admin-auth.html') {
            alert('⚠️ 管理者権限が必要です。ログインしてください。');
            window.location.href = 'admin-auth.html';
        }
    }
    
    /**
     * ログアウト
     */
    function adminLogout() {
        if (confirm('ログアウトしますか？')) {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'admin-auth.html';
        }
    }
    
    /**
     * セッションを延長
     */
    function extendSession() {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
            const sessionData = JSON.parse(session);
            sessionData.expiryTime = Date.now() + (60 * 60 * 1000); // 1時間延長
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
    }
    
    /**
     * ページ操作時にセッションを延長
     */
    function setupSessionExtension() {
        // クリック・キー入力でセッション延長
        let lastActivity = Date.now();
        
        const resetTimer = () => {
            const now = Date.now();
            // 5分以上経過していたらセッション延長
            if (now - lastActivity > 5 * 60 * 1000) {
                extendSession();
            }
            lastActivity = now;
        };
        
        document.addEventListener('click', resetTimer);
        document.addEventListener('keypress', resetTimer);
    }
    
    // グローバルに公開
    window.adminAuth = {
        check: checkAdminSession,
        logout: adminLogout,
        extend: extendSession
    };
    
    // ページ読み込み時にチェック
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            checkAdminSession();
            setupSessionExtension();
        });
    } else {
        checkAdminSession();
        setupSessionExtension();
    }
})();
