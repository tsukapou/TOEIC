/**
 * TOEIC Part 5 - Secretary Room Expansion
 * 秘書の部屋・拡張機能
 * Version: 2.0.0
 * Updated: 2025-12-08
 * 
 * 新機能:
 * 1. 秘書個別プロフィール画面
 * 2. 思い出アルバム
 * 3. 会話ログ
 * 4. 今日の気分ステータス
 * 5. 秘書ランキング
 * 6. プレゼントシステム
 */

const SecretaryRoomExpansion = {
    
    // ===============================
    // 1. 秘書個別プロフィール画面
    // ===============================
    
    /**
     * 秘書の詳細プロフィールを表示
     */
    showSecretaryProfile(secretaryId) {
        const secretary = SecretaryTeam?.secretaries[secretaryId];
        if (!secretary) {
            console.error('秘書が見つかりません:', secretaryId);
            return;
        }
        
        const bondLevel = this.getBondLevel(secretaryId);
        const messageHistory = this.getMessageHistory(secretaryId, 10);
        const memories = this.getMemories(secretaryId);
        const mood = this.getTodayMood(secretaryId);
        const stats = this.getSecretaryStats(secretaryId);
        
        const profileHTML = `
            <div id="secretaryProfileModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 10001; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); animation: fadeIn 0.3s ease;">
                <div style="background: white; border-radius: 1.5rem; max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); animation: slideUp 0.3s ease;">
                    
                    <!-- ヘッダー -->
                    <div style="padding: 2rem; background: linear-gradient(135deg, ${this.getSecretaryColor(secretary)} 0%, ${this.getSecretaryColor(secretary)}dd 100%); border-radius: 1.5rem 1.5rem 0 0; position: relative;">
                        <button onclick="SecretaryRoomExpansion.closeProfile()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255, 255, 255, 0.2); border: 2px solid white; color: white; width: 2.5rem; height: 2.5rem; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">×</button>
                        
                        <div style="display: flex; gap: 2rem; align-items: center;">
                            <!-- 画像 -->
                            <div style="width: 150px; height: 150px; border-radius: 1rem; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3); border: 4px solid white;">
                                <img src="${secretary.imageUrl}" alt="${secretary.name}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            
                            <!-- 基本情報 -->
                            <div style="flex: 1; color: white;">
                                <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${secretary.name}</h2>
                                <p style="margin: 0 0 1rem 0; font-size: 1rem; opacity: 0.95;">${secretary.personality}</p>
                                
                                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                                    <span style="padding: 0.375rem 0.75rem; background: rgba(255, 255, 255, 0.25); border-radius: 9999px; font-size: 0.875rem; font-weight: 600; backdrop-filter: blur(10px);">${secretary.type}</span>
                                    <span style="padding: 0.375rem 0.75rem; background: rgba(255, 255, 255, 0.25); border-radius: 9999px; font-size: 0.875rem; font-weight: 600; backdrop-filter: blur(10px);">Tier ${secretary.tier}</span>
                                    ${mood ? `<span style="padding: 0.375rem 0.75rem; background: rgba(255, 255, 255, 0.25); border-radius: 9999px; font-size: 0.875rem; font-weight: 600; backdrop-filter: blur(10px);">${mood.emoji} ${mood.name}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- コンテンツ -->
                    <div style="padding: 2rem;">
                        
                        <!-- 絆レベル -->
                        <div style="margin-bottom: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 1rem; border: 2px solid #fbbf24;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #78350f;">💕 絆レベル</h3>
                                <span style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;">Lv.${bondLevel.level}</span>
                            </div>
                            <div style="width: 100%; height: 1.5rem; background: rgba(0, 0, 0, 0.1); border-radius: 9999px; overflow: hidden; margin-bottom: 0.5rem;">
                                <div style="width: ${bondLevel.progress}%; height: 100%; background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%); transition: width 0.5s ease; display: flex; align-items: center; justify-content: center;">
                                    <span style="font-size: 0.75rem; font-weight: 700; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${bondLevel.progress}%</span>
                                </div>
                            </div>
                            <p style="margin: 0; font-size: 0.875rem; color: #78350f;">
                                学習時間: <strong>${bondLevel.hours}時間</strong> | 
                                次のレベルまで: <strong>${bondLevel.nextLevelHours}時間</strong>
                            </p>
                        </div>
                        
                        <!-- 統計情報 -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                            <div style="padding: 1rem; background: #f3f4f6; border-radius: 0.75rem; text-align: center;">
                                <div style="font-size: 1.75rem; font-weight: 700; color: #3b82f6; margin-bottom: 0.25rem;">${stats.totalMessages}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">メッセージ数</div>
                            </div>
                            <div style="padding: 1rem; background: #f3f4f6; border-radius: 0.75rem; text-align: center;">
                                <div style="font-size: 1.75rem; font-weight: 700; color: #10b981; margin-bottom: 0.25rem;">${stats.rewardsPurchased}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">リワード購入</div>
                            </div>
                            <div style="padding: 1rem; background: #f3f4f6; border-radius: 0.75rem; text-align: center;">
                                <div style="font-size: 1.75rem; font-weight: 700; color: #f59e0b; margin-bottom: 0.25rem;">${stats.memories}</div>
                                <div style="font-size: 0.875rem; color: #6b7280;">思い出の数</div>
                            </div>
                        </div>
                        
                        <!-- タブナビゲーション -->
                        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">
                            <button onclick="SecretaryRoomExpansion.switchTab('messages')" id="tab-messages" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">💬 メッセージ</button>
                            <button onclick="SecretaryRoomExpansion.switchTab('memories')" id="tab-memories" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">📸 思い出</button>
                            <button onclick="SecretaryRoomExpansion.switchTab('rewards')" id="tab-rewards" style="padding: 0.75rem 1.5rem; background: #f3f4f6; color: #6b7280; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">🎁 専用リワード</button>
                        </div>
                        
                        <!-- タブコンテンツ: メッセージ -->
                        <div id="tab-content-messages" style="display: block;">
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">💬 最近のメッセージ</h3>
                            ${this.renderMessageHistory(messageHistory)}
                        </div>
                        
                        <!-- タブコンテンツ: 思い出 -->
                        <div id="tab-content-memories" style="display: none;">
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">📸 思い出アルバム</h3>
                            ${this.renderMemories(memories)}
                        </div>
                        
                        <!-- タブコンテンツ: 専用リワード -->
                        <div id="tab-content-rewards" style="display: none;">
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">🎁 ${secretary.name}専用リワード</h3>
                            ${this.renderSecretaryRewards(secretaryId)}
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', profileHTML);
    },
    
    /**
     * プロフィールを閉じる
     */
    closeProfile() {
        const modal = document.getElementById('secretaryProfileModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    /**
     * タブ切り替え
     */
    switchTab(tabName) {
        // すべてのタブボタンをリセット
        ['messages', 'memories', 'rewards'].forEach(tab => {
            const btn = document.getElementById(`tab-${tab}`);
            const content = document.getElementById(`tab-content-${tab}`);
            
            if (tab === tabName) {
                btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                btn.style.color = 'white';
                content.style.display = 'block';
            } else {
                btn.style.background = '#f3f4f6';
                btn.style.color = '#6b7280';
                content.style.display = 'none';
            }
        });
    },
    
    /**
     * 絆レベルを取得
     */
    getBondLevel(secretaryId) {
        const data = JSON.parse(localStorage.getItem('secretary_bond_levels') || '{}');
        const hours = data[secretaryId] || 0;
        
        // レベル計算: 10時間で1レベル
        const level = Math.floor(hours / 10) + 1;
        const currentLevelHours = hours % 10;
        const progress = (currentLevelHours / 10) * 100;
        const nextLevelHours = 10 - currentLevelHours;
        
        return {
            level,
            hours: Math.round(hours * 10) / 10,
            progress: Math.round(progress),
            nextLevelHours: Math.round(nextLevelHours * 10) / 10
        };
    },
    
    /**
     * 絆レベルを更新(学習時間を追加)
     */
    updateBondLevel(secretaryId, minutesStudied) {
        const data = JSON.parse(localStorage.getItem('secretary_bond_levels') || '{}');
        data[secretaryId] = (data[secretaryId] || 0) + (minutesStudied / 60);
        localStorage.setItem('secretary_bond_levels', JSON.stringify(data));
        
        console.log(`💕 絆レベル更新: ${secretaryId} +${minutesStudied}分`);
    },
    
    // ===============================
    // 2. 思い出アルバム
    // ===============================
    
    /**
     * 思い出を追加
     */
    addMemory(secretaryId, memoryData) {
        const memories = JSON.parse(localStorage.getItem('secretary_memories') || '{}');
        
        if (!memories[secretaryId]) {
            memories[secretaryId] = [];
        }
        
        const memory = {
            id: Date.now(),
            secretaryId,
            timestamp: new Date().toISOString(),
            ...memoryData
        };
        
        memories[secretaryId].push(memory);
        localStorage.setItem('secretary_memories', JSON.stringify(memories));
        
        console.log(`📸 思い出を追加: ${secretaryId}`, memory);
        return memory;
    },
    
    /**
     * 思い出を取得
     */
    getMemories(secretaryId) {
        const memories = JSON.parse(localStorage.getItem('secretary_memories') || '{}');
        return memories[secretaryId] || [];
    },
    
    /**
     * 思い出をレンダリング
     */
    renderMemories(memories) {
        if (memories.length === 0) {
            return `
                <div style="padding: 3rem; text-align: center; background: #f9fafb; border-radius: 0.75rem; border: 2px dashed #d1d5db;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📸</div>
                    <p style="margin: 0; color: #6b7280; font-size: 1rem;">まだ思い出がありません</p>
                    <p style="margin: 0.5rem 0 0 0; color: #9ca3af; font-size: 0.875rem;">リワードを購入すると思い出が増えます</p>
                </div>
            `;
        }
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${memories.map(memory => `
                    <div onclick="SecretaryRoomExpansion.viewMemory(${memory.id})" style="cursor: pointer; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.2)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.1)'">
                        <div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                            ${memory.icon || '📸'}
                        </div>
                        <div style="padding: 1rem; background: white;">
                            <div style="font-size: 0.875rem; font-weight: 600; color: #1f2937; margin-bottom: 0.25rem;">${memory.title}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">${new Date(memory.timestamp).toLocaleDateString('ja-JP')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * 思い出を詳細表示
     */
    viewMemory(memoryId) {
        const allMemories = JSON.parse(localStorage.getItem('secretary_memories') || '{}');
        let memory = null;
        
        for (const secretaryId in allMemories) {
            const found = allMemories[secretaryId].find(m => m.id === memoryId);
            if (found) {
                memory = found;
                break;
            }
        }
        
        if (!memory) return;
        
        const modalHTML = `
            <div id="memoryViewModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 10002; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); animation: fadeIn 0.3s ease;" onclick="if(event.target.id==='memoryViewModal') document.getElementById('memoryViewModal').remove()">
                <div style="background: white; border-radius: 1rem; max-width: 600px; width: 90%; padding: 2rem; animation: zoomIn 0.3s ease;">
                    <div style="text-align: center; font-size: 4rem; margin-bottom: 1rem;">${memory.icon || '📸'}</div>
                    <h3 style="margin: 0 0 0.5rem 0; text-align: center; font-size: 1.5rem; font-weight: 700; color: #1f2937;">${memory.title}</h3>
                    <p style="margin: 0 0 1rem 0; text-align: center; color: #6b7280; font-size: 0.875rem;">${new Date(memory.timestamp).toLocaleString('ja-JP')}</p>
                    <p style="margin: 0; color: #374151; line-height: 1.6;">${memory.description}</p>
                    <button onclick="document.getElementById('memoryViewModal').remove()" style="width: 100%; margin-top: 1.5rem; padding: 0.75rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer;">閉じる</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    // ===============================
    // 3. 会話ログ
    // ===============================
    
    /**
     * メッセージを記録
     */
    logMessage(secretaryId, message, category = 'general') {
        const logs = JSON.parse(localStorage.getItem('secretary_message_logs') || '{}');
        
        if (!logs[secretaryId]) {
            logs[secretaryId] = [];
        }
        
        logs[secretaryId].push({
            id: Date.now(),
            message,
            category, // 'praise', 'encourage', 'advice', 'special'
            timestamp: new Date().toISOString()
        });
        
        // 最大500件まで保存
        if (logs[secretaryId].length > 500) {
            logs[secretaryId] = logs[secretaryId].slice(-500);
        }
        
        localStorage.setItem('secretary_message_logs', JSON.stringify(logs));
    },
    
    /**
     * メッセージ履歴を取得
     */
    getMessageHistory(secretaryId, limit = 10) {
        const logs = JSON.parse(localStorage.getItem('secretary_message_logs') || '{}');
        const messages = logs[secretaryId] || [];
        return messages.slice(-limit).reverse();
    },
    
    /**
     * メッセージ履歴をレンダリング
     */
    renderMessageHistory(messages) {
        if (messages.length === 0) {
            return `
                <div style="padding: 2rem; text-align: center; background: #f9fafb; border-radius: 0.75rem; border: 2px dashed #d1d5db;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💬</div>
                    <p style="margin: 0; color: #6b7280;">まだメッセージがありません</p>
                </div>
            `;
        }
        
        return `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${messages.map(msg => {
                    const categoryColors = {
                        praise: { bg: '#dcfce7', border: '#10b981', icon: '👏' },
                        encourage: { bg: '#dbeafe', border: '#3b82f6', icon: '💪' },
                        advice: { bg: '#fef3c7', border: '#f59e0b', icon: '💡' },
                        special: { bg: '#fce7f3', border: '#ec4899', icon: '✨' },
                        general: { bg: '#f3f4f6', border: '#6b7280', icon: '💬' }
                    };
                    
                    const color = categoryColors[msg.category] || categoryColors.general;
                    
                    return `
                        <div style="padding: 1rem; background: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.25rem;">${color.icon}</span>
                                <span style="font-size: 0.75rem; color: #6b7280;">${new Date(msg.timestamp).toLocaleString('ja-JP')}</span>
                            </div>
                            <p style="margin: 0; color: #1f2937; line-height: 1.5;">${msg.message}</p>
                        </div>
                    `;
                }).join('')}
            </div>
            <button onclick="SecretaryRoomExpansion.showAllMessages('${messages[0]?.id ? JSON.parse(localStorage.getItem('secretary_message_logs') || '{}')[Object.keys(JSON.parse(localStorage.getItem('secretary_message_logs') || '{}')).find(id => JSON.parse(localStorage.getItem('secretary_message_logs') || '{}')[id].some(m => m.id === messages[0].id))] ? Object.keys(JSON.parse(localStorage.getItem('secretary_message_logs') || '{}')).find(id => JSON.parse(localStorage.getItem('secretary_message_logs') || '{}')[id].some(m => m.id === messages[0].id)) : '' : ''}')" style="width: 100%; margin-top: 1rem; padding: 0.75rem; background: white; border: 2px solid #e5e7eb; border-radius: 0.5rem; color: #6b7280; font-weight: 600; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">すべてのメッセージを見る</button>
        `;
    },
    
    // ===============================
    // 4. 今日の気分ステータス
    // ===============================
    
    /**
     * 今日の気分を取得(日替わりランダム)
     */
    getTodayMood(secretaryId) {
        const today = new Date().toDateString();
        const savedMoods = JSON.parse(localStorage.getItem('secretary_daily_moods') || '{}');
        
        // 日付が変わったらリセット
        if (savedMoods.date !== today) {
            savedMoods.date = today;
            savedMoods.moods = {};
        }
        
        // すでに今日の気分が決まっている場合
        if (savedMoods.moods && savedMoods.moods[secretaryId]) {
            return savedMoods.moods[secretaryId];
        }
        
        // ランダムで気分を決定
        const moods = [
            { id: 'happy', name: 'ご機嫌', emoji: '😊', effect: 'ポイント+5%', bonus: 1.05 },
            { id: 'thinking', name: '考え事中', emoji: '🤔', effect: 'アドバイス増加', bonus: 1.0 },
            { id: 'sleepy', name: '少し眠い', emoji: '😴', effect: '癒し系メッセージ', bonus: 1.0 },
            { id: 'energetic', name: 'やる気満々', emoji: '🔥', effect: '激励メッセージ増加', bonus: 1.0 },
            { id: 'calm', name: '穏やか', emoji: '😌', effect: '優しいメッセージ', bonus: 1.0 },
            { id: 'excited', name: 'ワクワク', emoji: '✨', effect: '特別メッセージ', bonus: 1.0 }
        ];
        
        const randomMood = moods[Math.floor(Math.random() * moods.length)];
        
        // 保存
        if (!savedMoods.moods) savedMoods.moods = {};
        savedMoods.moods[secretaryId] = randomMood;
        localStorage.setItem('secretary_daily_moods', JSON.stringify(savedMoods));
        
        return randomMood;
    },
    
    /**
     * 気分ボーナスを取得
     */
    getMoodBonus(secretaryId) {
        const mood = this.getTodayMood(secretaryId);
        return mood ? mood.bonus : 1.0;
    },
    
    // ===============================
    // 5. 秘書ランキング
    // ===============================
    
    /**
     * 秘書ランキングを表示
     */
    showRanking() {
        const rankings = this.calculateRankings();
        
        const modalHTML = `
            <div id="secretaryRankingModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 10001; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); animation: fadeIn 0.3s ease;">
                <div style="background: white; border-radius: 1.5rem; max-width: 800px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5); animation: slideUp 0.3s ease;">
                    
                    <!-- ヘッダー -->
                    <div style="padding: 2rem; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 1.5rem 1.5rem 0 0; position: relative;">
                        <button onclick="document.getElementById('secretaryRankingModal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255, 255, 255, 0.2); border: 2px solid white; color: white; width: 2.5rem; height: 2.5rem; border-radius: 50%; font-size: 1.5rem; cursor: pointer;">×</button>
                        <h2 style="margin: 0; color: white; font-size: 2rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">🏆 秘書ランキング</h2>
                        <p style="margin: 0.5rem 0 0 0; color: rgba(255, 255, 255, 0.9);">あなたの秘書チームの統計</p>
                    </div>
                    
                    <!-- ランキングコンテンツ -->
                    <div style="padding: 2rem;">
                        
                        <!-- 人気ランキング -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">👥 人気ランキング (選択回数)</h3>
                            ${this.renderRankingList(rankings.popularity, '回')}
                        </div>
                        
                        <!-- 絆ランキング -->
                        <div style="margin-bottom: 2rem;">
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">💕 絆ランキング (学習時間)</h3>
                            ${this.renderRankingList(rankings.bond, '時間')}
                        </div>
                        
                        <!-- リワード使用率ランキング -->
                        <div>
                            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 700; color: #1f2937;">🎁 リワード使用率</h3>
                            ${this.renderRankingList(rankings.rewards, '個')}
                        </div>
                        
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    /**
     * ランキングを計算
     */
    calculateRankings() {
        const secretaries = SecretaryTeam?.secretaries || {};
        const unlocked = SecretaryTeam?.getUnlockedSecretaries() || [];
        
        // 人気ランキング
        const selectionCounts = JSON.parse(localStorage.getItem('secretary_selection_counts') || '{}');
        const popularity = unlocked.map(id => ({
            id,
            name: secretaries[id]?.name || 'Unknown',
            value: selectionCounts[id] || 0
        })).sort((a, b) => b.value - a.value).slice(0, 5);
        
        // 絆ランキング
        const bondLevels = JSON.parse(localStorage.getItem('secretary_bond_levels') || '{}');
        const bond = unlocked.map(id => ({
            id,
            name: secretaries[id]?.name || 'Unknown',
            value: Math.round((bondLevels[id] || 0) * 10) / 10
        })).sort((a, b) => b.value - a.value).slice(0, 5);
        
        // リワード使用率
        const rewardCounts = JSON.parse(localStorage.getItem('secretary_reward_counts') || '{}');
        const rewards = unlocked.map(id => ({
            id,
            name: secretaries[id]?.name || 'Unknown',
            value: rewardCounts[id] || 0
        })).sort((a, b) => b.value - a.value).slice(0, 5);
        
        return { popularity, bond, rewards };
    },
    
    /**
     * ランキングリストをレンダリング
     */
    renderRankingList(ranking, unit) {
        if (ranking.length === 0) {
            return '<p style="color: #6b7280; text-align: center; padding: 2rem; background: #f9fafb; border-radius: 0.5rem;">データがありません</p>';
        }
        
        return `
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${ranking.map((item, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const medal = medals[index] || `${index + 1}位`;
                    
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: ${index < 3 ? '#fef3c7' : '#f9fafb'}; border-radius: 0.5rem; border: 2px solid ${index < 3 ? '#fbbf24' : '#e5e7eb'};">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="font-size: 1.5rem; min-width: 3rem;">${medal}</span>
                                <span style="font-weight: 600; color: #1f2937;">${item.name}</span>
                            </div>
                            <span style="font-size: 1.25rem; font-weight: 700; color: ${index < 3 ? '#f59e0b' : '#6b7280'};">${item.value}${unit}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    /**
     * 秘書選択をカウント
     */
    incrementSelectionCount(secretaryId) {
        const counts = JSON.parse(localStorage.getItem('secretary_selection_counts') || '{}');
        counts[secretaryId] = (counts[secretaryId] || 0) + 1;
        localStorage.setItem('secretary_selection_counts', JSON.stringify(counts));
    },
    
    // ===============================
    // 6. プレゼントシステム
    // ===============================
    
    /**
     * プレゼントを配信
     */
    sendGift(secretaryId, giftData) {
        const gifts = JSON.parse(localStorage.getItem('secretary_gifts') || '{}');
        
        if (!gifts[secretaryId]) {
            gifts[secretaryId] = [];
        }
        
        const gift = {
            id: Date.now(),
            secretaryId,
            timestamp: new Date().toISOString(),
            read: false,
            ...giftData
        };
        
        gifts[secretaryId].push(gift);
        localStorage.setItem('secretary_gifts', JSON.stringify(gifts));
        
        // 未読バッジを更新
        this.updateGiftBadge();
        
        console.log(`🎁 プレゼント配信: ${secretaryId}`, gift);
        return gift;
    },
    
    /**
     * 未読プレゼント数を取得
     */
    getUnreadGiftCount() {
        const gifts = JSON.parse(localStorage.getItem('secretary_gifts') || '{}');
        let count = 0;
        
        for (const secretaryId in gifts) {
            count += gifts[secretaryId].filter(g => !g.read).length;
        }
        
        return count;
    },
    
    /**
     * 未読バッジを更新
     */
    updateGiftBadge() {
        const count = this.getUnreadGiftCount();
        const badge = document.getElementById('secretaryGiftBadge');
        
        if (count > 0) {
            if (!badge) {
                // バッジを作成
                const secretaryBtn = document.querySelector('[onclick="showSecretaryPanel()"]');
                if (secretaryBtn) {
                    const badgeHTML = `<span id="secretaryGiftBadge" style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${count}</span>`;
                    secretaryBtn.style.position = 'relative';
                    secretaryBtn.insertAdjacentHTML('beforeend', badgeHTML);
                }
            } else {
                badge.textContent = count;
            }
        } else if (badge) {
            badge.remove();
        }
    },
    
    /**
     * 条件チェック: 連続学習日数
     */
    checkStreakGift(days) {
        if (days === 7) {
            const currentSecretary = SecretaryTeam?.getCurrentSecretary();
            if (currentSecretary) {
                this.sendGift(currentSecretary.id, {
                    type: 'streak_7',
                    title: '7日連続達成おめでとう!',
                    message: `${days}日連続で学習を続けるなんてすごいです!この調子で頑張ってください!`,
                    icon: '🔥'
                });
            }
        }
    },
    
    /**
     * 条件チェック: 目標達成
     */
    checkGoalGift(achievedGoal) {
        const currentSecretary = SecretaryTeam?.getCurrentSecretary();
        if (currentSecretary) {
            this.sendGift(currentSecretary.id, {
                type: 'goal_achieved',
                title: '目標達成おめでとうございます!',
                message: `${achievedGoal}を達成しました!本当によく頑張りましたね!これからも一緒に頑張りましょう!`,
                icon: '🎉'
            });
        }
    },
    
    // ===============================
    // ユーティリティ
    // ===============================
    
    /**
     * 秘書のテーマカラーを取得
     */
    getSecretaryColor(secretary) {
        const colors = {
            '優しい': '#ec4899',
            '知的': '#3b82f6',
            '元気': '#f59e0b',
            '落ち着いた': '#8b5cf6',
            'クール': '#06b6d4',
            '明るい': '#fbbf24'
        };
        
        return colors[secretary.type] || '#667eea';
    },
    
    /**
     * 秘書の統計を取得
     */
    getSecretaryStats(secretaryId) {
        const messages = this.getMessageHistory(secretaryId, 999999).length;
        const memories = this.getMemories(secretaryId).length;
        const rewardCounts = JSON.parse(localStorage.getItem('secretary_reward_counts') || '{}');
        
        return {
            totalMessages: messages,
            memories: memories,
            rewardsPurchased: rewardCounts[secretaryId] || 0
        };
    },
    
    /**
     * 秘書専用リワードをレンダリング
     */
    renderSecretaryRewards(secretaryId) {
        const secretary = SecretaryTeam?.secretaries[secretaryId];
        if (!secretary) return '<p>秘書が見つかりません</p>';
        
        const currentPoints = typeof DailyMissions !== 'undefined' ? DailyMissions.getTotalPoints() : 0;
        
        // 秘書専用リワード
        const specificRewards = [
            {
                id: `counseling_${secretaryId}`,
                name: `${secretary.name}との個別カウンセリング`,
                cost: 500,
                description: `${secretary.name}があなた専用の学習プランを作成します`,
                icon: '📋'
            },
            {
                id: `date_${secretaryId}`,
                name: `${secretary.name}との特別デート`,
                cost: 900,
                description: `${secretary.name}と3つのシーンから選んでデートできます`,
                icon: '💝'
            },
            {
                id: `letter_${secretaryId}`,
                name: `${secretary.name}からの手紙`,
                cost: 800,
                description: `${secretary.name}があなたに800文字の感謝の手紙を書きます`,
                icon: '✉️'
            }
        ];
        
        return `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${specificRewards.map(reward => {
                    const canBuy = currentPoints >= reward.cost;
                    const purchased = localStorage.getItem(`reward_purchased_${reward.id}`) === 'true';
                    
                    return `
                        <div style="padding: 1.5rem; background: ${purchased ? '#dcfce7' : canBuy ? '#dbeafe' : '#f9fafb'}; border: 2px solid ${purchased ? '#10b981' : canBuy ? '#3b82f6' : '#e5e7eb'}; border-radius: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <span style="font-size: 2.5rem;">${reward.icon}</span>
                                    <div>
                                        <h4 style="margin: 0 0 0.25rem 0; font-size: 1.125rem; font-weight: 700; color: #1f2937;">${reward.name}</h4>
                                        <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">${reward.description}</p>
                                    </div>
                                </div>
                                <span style="font-size: 1.25rem; font-weight: 700; color: #f59e0b; white-space: nowrap;">${reward.cost}pt</span>
                            </div>
                            ${purchased 
                                ? `<div style="padding: 0.75rem; background: rgba(16, 185, 129, 0.1); text-align: center; border-radius: 0.5rem; font-weight: 600; color: #10b981;">購入済み ✓</div>`
                                : canBuy
                                    ? `<button onclick="SecretaryRewards.buyReward('${reward.id}')" style="width: 100%; padding: 0.875rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">購入する</button>`
                                    : `<div style="padding: 0.75rem; background: #fee2e2; text-align: center; border-radius: 0.5rem; font-weight: 600; color: #dc2626;">あと${reward.cost - currentPoints}pt必要</div>`
                            }
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    /**
     * 初期化
     */
    init() {
        console.log('🏠 Secretary Room Expansion initialized');
        
        // 未読ギフトバッジを更新
        this.updateGiftBadge();
        
        // 定期的にギフト条件をチェック(5分ごと)
        setInterval(() => {
            this.checkAutoGifts();
        }, 5 * 60 * 1000);
    },
    
    /**
     * 自動ギフトチェック
     */
    checkAutoGifts() {
        // 連続学習日数チェック
        if (typeof StreakSystem !== 'undefined') {
            const streak = StreakSystem.getCurrentStreak();
            if (streak === 7 || streak === 30 || streak === 100) {
                this.checkStreakGift(streak);
            }
        }
    }
};

// グローバルに公開
window.SecretaryRoomExpansion = SecretaryRoomExpansion;

// CSS追加
if (!document.getElementById('secretary-room-expansion-styles')) {
    const roomStyle = document.createElement('style');
    roomStyle.id = 'secretary-room-expansion-styles';
    roomStyle.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(roomStyle);
}

console.log('🏠 Secretary Room Expansion loaded');
