/**
 * TOEIC Part 5 Secretary Panel UI
 * 23人の秘書選択パネル
 */

// 秘書選択パネルを表示
function showSecretaryPanel() {
    if (typeof SecretaryTeam === 'undefined') {
        alert('秘書システムが読み込まれていません');
        return;
    }

    const currentSecretary = SecretaryTeam.getCurrentSecretary();
    const unlockedSecretaries = SecretaryTeam.getUnlockedSecretaries();
    const allTiers = SecretaryTeam.getAllTiers();
    const currentPoints = typeof DailyMissions !== 'undefined' 
        ? DailyMissions.getMissionStats().totalPoints 
        : 0;

    // パネルHTML生成
    const panelHTML = `
        <div id="secretaryPanelModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); animation: fadeIn 0.3s ease;">
            <div style="background: white; border-radius: 1.5rem; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); animation: slideUp 0.3s ease;">
                
                <!-- ヘッダー -->
                <div style="padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1.5rem 1.5rem 0 0; position: sticky; top: 0; z-index: 100; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; color: white; font-size: 2rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🏠 秘書の部屋</h2>
                            <p style="margin: 0.5rem 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 1rem;">
                                現在のポイント: <strong style="font-size: 1.25rem;">${currentPoints}pt</strong>
                                <span style="margin-left: 1rem;">解除済み: <strong>${unlockedSecretaries.length}/22人</strong></span>
                            </p>
                        </div>
                        <button onclick="closeSecretaryPanel()" style="background: rgba(255, 255, 255, 0.2); border: 2px solid white; color: white; width: 3rem; height: 3rem; border-radius: 50%; font-size: 1.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; font-weight: 300;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='rotate(90deg)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='rotate(0deg)'">
                            ×
                        </button>
                    </div>
                </div>
                
                <!-- ナビゲーションボタン -->
                <div style="padding: 0 2rem 1rem 2rem; display: flex; gap: 0.75rem; border-bottom: 2px solid #e5e7eb;">
                    <button onclick="showSecretaryPanelTab('list')" id="panelTab-list" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem 0.5rem 0 0; font-weight: 600; cursor: pointer; transition: all 0.2s;">👥 秘書一覧</button>
                    <button onclick="showSecretaryPanelTab('greeting')" id="panelTab-greeting" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 0.5rem 0.5rem 0 0; font-weight: 600; cursor: pointer; transition: all 0.2s;">🌅 挨拶担当</button>
                    <button onclick="showSecretaryPanelTab('ranking')" id="panelTab-ranking" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 0.5rem 0.5rem 0 0; font-weight: 600; cursor: pointer; transition: all 0.2s;">🏆 ランキング</button>
                </div>
                
                <!-- 秘書リスト -->
                <div id="panelContent-list" style="padding: 2rem; display: block;">
                    ${generateSecretaryList(allTiers, unlockedSecretaries, currentSecretary, currentPoints)}
                </div>
                
                <!-- グリーティングチーム選択(初期非表示) -->
                <div id="panelContent-greeting" style="padding: 2rem; display: none;">
                    ${generateGreetingTeamSelector(unlockedSecretaries)}
                </div>
                
                <!-- ランキング(初期非表示) -->
                <div id="panelContent-ranking" style="padding: 2rem; display: none;">
                    <div style="text-align: center; padding: 3rem; color: #6b7280;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                        <p>秘書ランキングを読み込み中...</p>
                    </div>
                </div>
                
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    `;

    // モーダルを表示
    const existingModal = document.getElementById('secretaryPanelModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', panelHTML);
}

// 秘書リストHTMLを生成
function generateSecretaryList(allTiers, unlockedSecretaries, currentSecretary, currentPoints) {
    let html = '';

    for (const tierData of allTiers) {
        const tierLabel = tierData.tier === 0 ? '初期メンバー（無料）' : `Tier ${tierData.tier} - ${tierData.requiredPoints}pt`;
        const tierColor = getTierColor(tierData.tier);

        html += `
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 3px solid ${tierColor};">
                    <h3 style="margin: 0; font-size: 1.5rem; font-weight: 700; color: ${tierColor};">${tierLabel}</h3>
                    <span style="padding: 0.25rem 0.75rem; background: ${tierColor}; color: white; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">
                        ${tierData.secretaries.length}人
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
                    ${tierData.secretaries.map(secretary => generateSecretaryCard(secretary, unlockedSecretaries, currentSecretary, currentPoints)).join('')}
                </div>
            </div>
        `;
    }

    return html;
}

// 秘書カードHTMLを生成
function generateSecretaryCard(secretary, unlockedSecretaries, currentSecretary, currentPoints) {
    const isUnlocked = unlockedSecretaries.includes(secretary.id);
    const isCurrent = currentSecretary.id === secretary.id;
    const canUnlock = !isUnlocked && currentPoints >= secretary.requiredPoints;
    
    // 今日の気分を取得
    const mood = isUnlocked && typeof SecretaryRoomExpansion !== 'undefined' 
        ? SecretaryRoomExpansion.getTodayMood(secretary.id) 
        : null;

    let cardStyle = 'background: #f9fafb; border: 2px solid #e5e7eb;';
    let statusBadge = '';
    let actionButton = '';

    if (isCurrent) {
        cardStyle = 'background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); border: 3px solid #f59e0b; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);';
        statusBadge = '<div style="position: absolute; top: 0.75rem; right: 0.75rem; background: #f59e0b; color: white; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">現在選択中</div>';
        actionButton = `<button onclick="SecretaryRoomExpansion.showSecretaryProfile('${secretary.id}')" style="width: 100%; margin-top: 1rem; padding: 0.875rem; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1)'">👤 プロフィールを見る</button>`;
    } else if (isUnlocked) {
        cardStyle = 'background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); border: 2px solid #3b82f6;';
        statusBadge = '<div style="position: absolute; top: 0.75rem; right: 0.75rem; background: #3b82f6; color: white; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">解除済み</div>';
        actionButton = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 1rem;">
                <button onclick="selectSecretary('${secretary.id}')" style="padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.875rem;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">選択</button>
                <button onclick="SecretaryRoomExpansion.showSecretaryProfile('${secretary.id}')" style="padding: 0.75rem; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; font-size: 0.875rem;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">👤</button>
            </div>
        `;
    } else if (canUnlock) {
        cardStyle = 'background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%); border: 2px solid #10b981;';
        statusBadge = '<div style="position: absolute; top: 0.75rem; right: 0.75rem; background: #10b981; color: white; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; animation: pulse 2s infinite;">解除可能！</div>';
        actionButton = `<button onclick="unlockAndSelectSecretary('${secretary.id}')" style="width: 100%; margin-top: 1rem; padding: 0.875rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1)'">解除して選択する</button>`;
    } else {
        cardStyle = 'background: #f3f4f6; border: 2px solid #d1d5db; opacity: 0.7;';
        statusBadge = `<div style="position: absolute; top: 0.75rem; right: 0.75rem; background: #6b7280; color: white; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700;">🔒 ${secretary.requiredPoints}pt</div>`;
        actionButton = `<div style="margin-top: 1rem; padding: 0.75rem; background: #fee2e2; text-align: center; border-radius: 0.5rem; font-weight: 600; color: #dc2626; font-size: 0.875rem;">あと${secretary.requiredPoints - currentPoints}pt必要</div>`;
    }

    return `
        <div style="${cardStyle} border-radius: 1rem; padding: 1.25rem; position: relative; transition: all 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 15px 30px -5px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            
            ${statusBadge}
            
            <!-- 画像 -->
            <div style="width: 100%; aspect-ratio: 1; border-radius: 0.75rem; overflow: hidden; margin-bottom: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); ${!isUnlocked ? 'filter: grayscale(100%) blur(2px);' : ''}">
                <img src="${secretary.imageUrl}" alt="${secretary.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            
            <!-- 情報 -->
            <div>
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937; ${!isUnlocked ? 'filter: blur(4px);' : ''}">${isUnlocked ? secretary.name : '???'}</h4>
                <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #6b7280; line-height: 1.4;">${isUnlocked ? secretary.personality : '解除すると詳細が表示されます'}</p>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
                    <span style="padding: 0.25rem 0.5rem; background: ${getTierColor(secretary.tier)}20; color: ${getTierColor(secretary.tier)}; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">
                        ${secretary.type}
                    </span>
                    ${secretary.tier > 0 ? `<span style="padding: 0.25rem 0.5rem; background: #f3f4f6; color: #6b7280; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">Tier ${secretary.tier}</span>` : ''}
                    ${mood ? `<span style="padding: 0.25rem 0.5rem; background: rgba(251, 191, 36, 0.2); color: #f59e0b; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 600;">${mood.emoji} ${mood.name}</span>` : ''}
                </div>
            </div>
            
            ${actionButton}
            
        </div>
    `;
}

// Tier別カラーを取得
function getTierColor(tier) {
    const colors = {
        0: '#6b7280',  // 初期: グレー
        1: '#10b981',  // Tier 1: グリーン
        2: '#3b82f6',  // Tier 2: ブルー
        3: '#8b5cf6',  // Tier 3: パープル
        4: '#ec4899',  // Tier 4: ピンク
        5: '#f59e0b',  // Tier 5: オレンジ
        6: '#ef4444',  // Tier 6: レッド
        7: '#fbbf24'   // Tier 7: ゴールド
    };
    return colors[tier] || '#6b7280';
}

// 秘書を選択
function selectSecretary(secretaryId) {
    if (typeof SecretaryTeam === 'undefined') return;

    const result = SecretaryTeam.setCurrentSecretary(secretaryId);
    
    if (result) {
        const secretary = SecretaryTeam.secretaries[secretaryId];
        
        // 選択カウントを増やす
        if (typeof SecretaryRoomExpansion !== 'undefined') {
            SecretaryRoomExpansion.incrementSelectionCount(secretaryId);
        }
        
        // 旧システムにも反映
        if (typeof SecretaryTeamLegacy !== 'undefined' && SecretaryTeamLegacy.secretaries[secretaryId]) {
            SecretaryTeamLegacy.currentSecretary = secretaryId;
            SecretaryTeamLegacy.updateAvatarImage(secretaryId);
            console.log(`✅ 旧システムにも反映: ${secretaryId}`);
        }
        
        // 成功通知
        if (typeof showNotification === 'function') {
            showNotification(`✨ ${secretary.name}を選択しました！`, 'success');
        } else {
            alert(`✨ ${secretary.name}を選択しました！`);
        }
        
        // パネルを閉じる
        closeSecretaryPanel();
        
        // UIを更新
        setTimeout(() => {
            if (typeof updateBondLevelDisplay === 'function') {
                updateBondLevelDisplay();
            }
            if (typeof location !== 'undefined') {
                location.reload();
            }
        }, 300);
    }
}

// 秘書を解除して選択
function unlockAndSelectSecretary(secretaryId) {
    if (typeof SecretaryTeam === 'undefined') return;

    const secretary = SecretaryTeam.secretaries[secretaryId];
    const unlockResult = SecretaryTeam.unlockSecretary(secretaryId);
    
    if (unlockResult) {
        // 解除成功演出
        if (typeof showSecretaryUnlockAnimation === 'function') {
            showSecretaryUnlockAnimation(secretary);
        } else {
            alert(
                `🎊 新しい秘書「${secretary.name}」が解除されました！\n\n` +
                `${secretary.background}\n\n` +
                `よろしくお願いします！`
            );
        }
        
        // 自動的に選択
        selectSecretary(secretaryId);
    }
}

// パネルを閉じる
function closeSecretaryPanel() {
    const modal = document.getElementById('secretaryPanelModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// 秘書のアバター絵文字を取得
function getSecretaryAvatar(secretaryId) {
    const avatarMap = {
        'sakura': '🌸', 'reina': '💼', 'rio': '⚡', 'yui': '🎀',
        'airi': '🎨', 'haruka': '💎', 'nana': '🍀', 'mei': '🌙',
        'saki': '🔥', 'misaki': '💪', 'yuki': '❄️', 'kaori': '🌺',
        'eri': '📚', 'ami': '🎵', 'kana': '🌟', 'rina': '🦋',
        'shiori': '🌹', 'ayaka': '🎭', 'yuka': '🔮', 'mami': '💫',
        'mio': '👑', 'ayane': '🌈'
    };
    return avatarMap[secretaryId] || '👤';
}

// CSSアニメーション追加
if (!document.getElementById('secretary-panel-styles')) {
    const panelStyle = document.createElement('style');
    panelStyle.id = 'secretary-panel-styles';
    panelStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(panelStyle);
}

// 秘書パネルのタブ切り替え
function showSecretaryPanelTab(tabName) {
    // タブボタン更新
    ['list', 'greeting', 'ranking'].forEach(tab => {
        const btn = document.getElementById(`panelTab-${tab}`);
        const content = document.getElementById(`panelContent-${tab}`);
        
        if (btn && content) {
            if (tab === tabName) {
                btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                btn.style.color = 'white';
                content.style.display = 'block';
                
                // ランキングタブの場合はデータを読み込む
                if (tab === 'ranking' && typeof SecretaryRoomExpansion !== 'undefined') {
                    loadRankingContent();
                }
                
                // グリーティングタブの場合はUIを再生成
                if (tab === 'greeting') {
                    refreshGreetingTeamUI();
                }
            } else {
                btn.style.background = '#f3f4f6';
                btn.style.color = '#6b7280';
                content.style.display = 'none';
            }
        }
    });
}

// ランキングコンテンツを読み込む
function loadRankingContent() {
    const container = document.getElementById('panelContent-ranking');
    if (!container || typeof SecretaryRoomExpansion === 'undefined') return;
    
    const rankings = SecretaryRoomExpansion.calculateRankings();
    
    container.innerHTML = `
        <!-- 人気ランキング -->
        <div style="margin-bottom: 2rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">👥 人気ランキング (選択回数)</h3>
            ${SecretaryRoomExpansion.renderRankingList(rankings.popularity, '回')}
        </div>
        
        <!-- 絆ランキング -->
        <div style="margin-bottom: 2rem;">
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">💕 絆ランキング (学習時間)</h3>
            ${SecretaryRoomExpansion.renderRankingList(rankings.bond, '時間')}
        </div>
        
        <!-- リワード使用率ランキング -->
        <div>
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">🎁 リワード使用率</h3>
            ${SecretaryRoomExpansion.renderRankingList(rankings.rewards, '個')}
        </div>
    `;
}

// グリーティングチーム選択UIを生成
function generateGreetingTeamSelector(unlockedSecretaryIds) {
    console.log('📝 generateGreetingTeamSelector 開始:', unlockedSecretaryIds);
    
    // 秘書IDから秘書オブジェクトに変換
    const unlockedSecretaries = unlockedSecretaryIds.map(id => {
        const secretary = SecretaryTeam.secretaries[id];
        if (!secretary) return null;
        return {
            id: secretary.id,
            name: secretary.name,
            avatar: getSecretaryAvatar(secretary.id),
            type: secretary.type
        };
    }).filter(s => s !== null);
    
    const greetingTeam = typeof GreetingTeamSelector !== 'undefined' 
        ? GreetingTeamSelector.getGreetingTeam() 
        : [];
    
    console.log('✅ 変換後の秘書:', unlockedSecretaries.map(s => s.name));
    console.log('🎯 現在のチーム:', greetingTeam);
    
    const maxMembers = 3;
    const remainingSlots = maxMembers - greetingTeam.length;
    
    return `
        <!-- 説明ヘッダー -->
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; align-items: start; gap: 1rem;">
                <div style="font-size: 2.5rem;">🌅</div>
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #92400e; font-size: 1.5rem; font-weight: 700;">挨拶担当の秘書を選択</h3>
                    <p style="margin: 0; color: #78350f; line-height: 1.6;">
                        アプリ起動時に挨拶をする秘書を<strong>最大3人</strong>まで選択できます。<br>
                        選択した秘書が順番に挨拶してくれます。
                    </p>
                </div>
            </div>
        </div>
        
        <!-- 現在の選択状況 -->
        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h4 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">
                    👥 現在の挨拶担当 (${greetingTeam.length}/${maxMembers}人)
                </h4>
                ${remainingSlots > 0 ? `
                <span style="padding: 0.5rem 1rem; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">
                    あと${remainingSlots}人選択できます
                </span>
                ` : `
                <span style="padding: 0.5rem 1rem; background: #fee2e2; color: #991b1b; border-radius: 9999px; font-size: 0.875rem; font-weight: 600;">
                    選択上限に達しています
                </span>
                `}
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${greetingTeam.length === 0 ? `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6b7280;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">😴</div>
                        <p style="margin: 0;">まだ挨拶担当が選択されていません</p>
                    </div>
                ` : greetingTeam.map((secretaryId, index) => {
                    const secretary = unlockedSecretaries.find(s => s.id === secretaryId);
                    if (!secretary) return '';
                    
                    return `
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 2px solid #3b82f6; border-radius: 0.75rem; padding: 1rem; position: relative;">
                            <div style="position: absolute; top: -0.75rem; left: -0.75rem; width: 2rem; height: 2rem; background: #3b82f6; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem;">
                                ${index + 1}
                            </div>
                            <div style="text-align: center; margin-bottom: 0.75rem;">
                                <div style="font-size: 3rem; margin-bottom: 0.5rem;">
                                    ${secretary.avatar || '👤'}
                                </div>
                                <div style="font-weight: 700; color: #1f2937; margin-bottom: 0.25rem;">
                                    ${secretary.name}
                                </div>
                                <div style="font-size: 0.75rem; color: #6b7280;">
                                    ${secretary.type || '秘書'}
                                </div>
                            </div>
                            <button onclick="toggleGreetingTeamMember('${secretaryId}')" style="width: 100%; padding: 0.5rem; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.875rem; transition: all 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                                ❌ 削除
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <!-- 秘書選択リスト -->
        <div>
            <h4 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">
                📋 解除済みの秘書から選択
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem;">
                ${unlockedSecretaries.map(secretary => {
                    const isSelected = greetingTeam.includes(secretary.id);
                    
                    return `
                        <div style="background: ${isSelected ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'white'}; border: 2px solid ${isSelected ? '#10b981' : '#e5e7eb'}; border-radius: 0.75rem; padding: 1rem; text-align: center; transition: all 0.2s; cursor: pointer; position: relative;" onclick="toggleGreetingTeamMember('${secretary.id}')" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 6px -1px rgb(0 0 0 / 0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            ${isSelected ? `
                                <div style="position: absolute; top: 0.5rem; right: 0.5rem; width: 1.5rem; height: 1.5rem; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">
                                    ✓
                                </div>
                            ` : ''}
                            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">
                                ${secretary.avatar || '👤'}
                            </div>
                            <div style="font-weight: 700; color: #1f2937; margin-bottom: 0.25rem; font-size: 0.95rem;">
                                ${secretary.name}
                            </div>
                            <div style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.75rem;">
                                ${secretary.type || '秘書'}
                            </div>
                            <div style="padding: 0.375rem 0.75rem; background: ${isSelected ? '#10b981' : '#3b82f6'}; color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; display: inline-block;">
                                ${isSelected ? '✓ 選択中' : '+ 選択'}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        
        <!-- 保存ボタン -->
        <div style="margin-top: 2rem; text-align: center;">
            <button onclick="closeSecretaryPanel()" style="padding: 1rem 3rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.75rem; font-size: 1.125rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgb(0 0 0 / 0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgb(0 0 0 / 0.1)'">
                ✅ 完了
            </button>
        </div>
    `;
}

// グリーティングチームUIを再生成
function refreshGreetingTeamUI() {
    const container = document.getElementById('panelContent-greeting');
    if (!container || typeof SecretaryTeam === 'undefined') return;
    
    const unlockedSecretaryIds = SecretaryTeam.getUnlockedSecretaries();
    const currentTeam = typeof GreetingTeamSelector !== 'undefined' 
        ? GreetingTeamSelector.getGreetingTeam() 
        : [];
    
    console.log('🔄 UIを再生成:', {
        解除済み秘書: unlockedSecretaryIds,
        現在のチーム: currentTeam
    });
    
    container.innerHTML = generateGreetingTeamSelector(unlockedSecretaryIds);
}

// グリーティングチームメンバーのトグル
function toggleGreetingTeamMember(secretaryId) {
    if (typeof GreetingTeamSelector === 'undefined') {
        alert('グリーティングチーム選択システムが読み込まれていません');
        return;
    }
    
    const result = GreetingTeamSelector.toggleGreetingTeam(secretaryId);
    
    if (result === null) {
        // 最大人数に達している
        alert('挨拶担当は最大3人までです。\n他の秘書を削除してから追加してください。');
        return;
    }
    
    // UIを再描画
    refreshGreetingTeamUI();
}

// グローバルに公開
window.showSecretaryPanel = showSecretaryPanel;
window.closeSecretaryPanel = closeSecretaryPanel;
window.selectSecretary = selectSecretary;
window.unlockAndSelectSecretary = unlockAndSelectSecretary;
window.showSecretaryPanelTab = showSecretaryPanelTab;
window.toggleGreetingTeamMember = toggleGreetingTeamMember;

console.log('👥 Secretary Panel UI loaded');
