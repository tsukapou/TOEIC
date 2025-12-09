/**
 * TOEIC Part 5 Secretary Unlock Animation
 * 新しい秘書解除時の特別演出システム
 */

// 秘書解除アニメーションを表示
function showSecretaryUnlockAnimation(secretary) {
    const animationHTML = `
        <div id="secretaryUnlockAnimation" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 20000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.5s ease;">
            
            <!-- 背景エフェクト -->
            <div class="unlock-bg-effect" style="position: absolute; width: 100%; height: 100%; overflow: hidden;">
                <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%); animation: rotate 20s linear infinite;"></div>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%); animation: pulse 3s ease-in-out infinite;"></div>
            </div>
            
            <!-- メインコンテンツ -->
            <div style="position: relative; z-index: 1; text-align: center; max-width: 600px; padding: 2rem; animation: slideUp 0.8s ease;">
                
                <!-- タイトル -->
                <h2 style="color: white; font-size: 3rem; font-weight: 700; margin: 0 0 1rem 0; text-shadow: 0 4px 8px rgba(0,0,0,0.3); animation: glow 2s ease-in-out infinite;">
                    🎊 新しい秘書解除！
                </h2>
                
                <!-- 秘書画像 -->
                <div style="width: 300px; height: 300px; margin: 2rem auto; border-radius: 50%; overflow: hidden; border: 6px solid #fbbf24; box-shadow: 0 0 60px rgba(251, 191, 36, 0.6), 0 20px 40px rgba(0,0,0,0.5); animation: scaleIn 0.6s ease 0.3s backwards;">
                    <img src="${secretary.imageUrl}" alt="${secretary.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                
                <!-- 秘書情報 -->
                <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 1rem; padding: 2rem; margin: 2rem 0; border: 2px solid rgba(255, 255, 255, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: fadeIn 1s ease 0.5s backwards;">
                    <h3 style="color: #fbbf24; font-size: 2.5rem; margin: 0 0 0.5rem 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${secretary.name}</h3>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 1.125rem; margin: 0.5rem 0; line-height: 1.6;">${secretary.personality}</p>
                    <div style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1.5rem; background: linear-gradient(135deg, ${getTierGradient(secretary.tier)}); border-radius: 9999px; color: white; font-weight: 700; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
                        ${secretary.type} | Tier ${secretary.tier}
                    </div>
                </div>
                
                <!-- 秘書の挨拶 -->
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(5px); border-radius: 1rem; padding: 1.5rem; margin: 1.5rem 0; border: 1px solid rgba(255, 255, 255, 0.1); animation: fadeIn 1.2s ease 0.8s backwards;">
                    <p style="color: white; font-size: 1.125rem; line-height: 1.8; margin: 0; font-style: italic;">
                        「${getUnlockGreeting(secretary)}」
                    </p>
                </div>
                
                <!-- 閉じるボタン -->
                <button onclick="closeUnlockAnimation()" style="margin-top: 2rem; padding: 1rem 3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.75rem; font-size: 1.25rem; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.3); transition: all 0.2s; animation: fadeIn 1.5s ease 1s backwards;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 15px 30px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.3)'">
                    よろしくお願いします！ ✨
                </button>
                
            </div>
            
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            @keyframes pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
            }
            @keyframes glow {
                0%, 100% { text-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(251, 191, 36, 0.5); }
                50% { text-shadow: 0 4px 8px rgba(0,0,0,0.3), 0 0 40px rgba(251, 191, 36, 0.8); }
            }
        </style>
    `;

    // モーダルを表示
    const existingAnimation = document.getElementById('secretaryUnlockAnimation');
    if (existingAnimation) {
        existingAnimation.remove();
    }

    document.body.insertAdjacentHTML('beforeend', animationHTML);

    // 紙吹雪エフェクト
    setTimeout(() => {
        createConfetti();
    }, 500);

    // BGM再生（オプション）
    playUnlockSound();
}

// Tier別グラデーション取得
function getTierGradient(tier) {
    const gradients = {
        0: '#6b7280, #4b5563',
        1: '#10b981, #059669',
        2: '#3b82f6, #2563eb',
        3: '#8b5cf6, #7c3aed',
        4: '#ec4899, #db2777',
        5: '#f59e0b, #d97706',
        6: '#ef4444, #dc2626',
        7: '#fbbf24, #f59e0b'
    };
    return gradients[tier] || '#6b7280, #4b5563';
}

// 秘書別解除挨拶メッセージ
function getUnlockGreeting(secretary) {
    const greetings = {
        // Tier 1
        airi: 'はじめまして！私、アイリです。あなたの学習を、美しいアート作品に仕上げるお手伝いをします。一緒に素敵な成長の軌跡を描きましょう！',
        yuki: '...ユキです。データと戦略で、あなたを最短ルートで目標達成へ導きます。無駄のない学習を、始めましょう。',
        
        // Tier 2
        nanami: '運命の糸が、私たちを繋ぎました...ナナミです。星々が教えてくれています。あなたは必ず成功する、と。',
        kaede: 'お初にお目にかかります、カエデと申します。日本の心、一期一会の精神で、あなたの学習をお支えさせていただきます。',
        haruka: 'わぁ！はじめまして、春香です！一緒に頑張れるなんて、とっても嬉しいです！全力で応援します！',
        reina: 'ごきげんよう。麗奈ですわ。あなたの努力、わたくしがしっかりと見守らせていただきますわ。',
        
        // Tier 3
        ema: 'Yo! エマだよ。あなたの脳みそ、最新テクノロジーで最適化してあげる。学習効率、爆上げしよう！',
        kanna: 'やっほー！カンナです！体と心が元気じゃないと、勉強も頑張れないよね！一緒に健康的に成長しよう！',
        momoka: 'こんにちは、桃香です。無理は禁物ですよ。心と体を大切にしながら、一緒にゆっくり頑張りましょうね。',
        
        // Tier 4
        chihiro: 'よっす！千尋だよ！学習もゲームみたいに楽しくやろうぜ！レベルアップ目指して、一緒にプレイしよう！',
        kotone: 'こんにちは、琴音です。音楽のように、美しいリズムで学習を進めましょう。ハーモニーを奏でましょう。',
        suzuha: 'やあ！涼葉だよ！学習は登山と同じ。一歩ずつ、確実に頂上を目指そう。新しい景色が待ってるよ！',
        
        // Tier 5
        nozomi: 'は、はじめまして...望美です。本の中にある知恵を、あなたに伝えられたら...嬉しいです。',
        shizuka: '静香と申します。お茶を点てるように、心を落ち着けて学習いたしましょう。一期一会の精神で。',
        yua: '結愛だ！よろしくな！熱い情熱で、お前の学習を全力サポートするぜ！限界突破だ！',
        
        // Tier 6
        sena: 'セナよ...闇の中にも、光は必ず存在する。あなたの運命、私が導きましょう。',
        tsubasa: '翼です。大空のように、自由に高く飛びましょう。あなたの視野を、私が広げます。',
        misaki: 'お帰りなさいませ、ご主人様！美咲と申します。最高のおもてなしで、あなたの学習をサポートいたします！',
        
        // Tier 7
        mio: 'ミオです。あなたの学習データを徹底分析し、最適な戦略を提案します。効率的な学習で、確実に目標達成しましょう。',
        ayane: 'アヤネです。私が保証します。あなたは必ず成功する。共に頂点を目指しましょう。私が、全力であなたを導きます。'
    };
    
    return greetings[secretary.id] || `${secretary.name}です。よろしくお願いします！`;
}

// 紙吹雪エフェクト
function createConfetti() {
    const colors = ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            top: -10px;
            left: ${Math.random() * 100}%;
            width: ${Math.random() * 10 + 5}px;
            height: ${Math.random() * 10 + 5}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            opacity: ${Math.random() * 0.7 + 0.3};
            z-index: 20001;
            pointer-events: none;
            animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// 紙吹雪アニメーション追加
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// 解除サウンド再生（オプション）
function playUnlockSound() {
    // Web Audio APIで簡単なサウンドを生成
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // 和音追加
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.type = 'sine';
            oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
        }, 150);
        
    } catch (e) {
        // サウンド再生に失敗しても無視
        console.log('Audio not available');
    }
}

// アニメーションを閉じる
function closeUnlockAnimation() {
    const animation = document.getElementById('secretaryUnlockAnimation');
    if (animation) {
        animation.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            animation.remove();
        }, 500);
    }
}

// fadeOutアニメーション追加
const fadeOutStyle = document.createElement('style');
fadeOutStyle.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(fadeOutStyle);

// グローバルに公開
window.showSecretaryUnlockAnimation = showSecretaryUnlockAnimation;
window.closeUnlockAnimation = closeUnlockAnimation;

console.log('✨ Secretary Unlock Animation System loaded');
