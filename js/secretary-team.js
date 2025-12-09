/**
 * TOEIC Part 5 Secretary Team System
 * 22人の秘書チーム管理システム
 * 
 * Tier構成:
 * - 初期（0pt）: 3人（さくら、レイナ、りお）
 * - Tier 1（50pt）: 2人
 * - Tier 2（100pt）: 3人
 * - Tier 3（150pt）: 3人
 * - Tier 4（200pt）: 3人
 * - Tier 5（250pt）: 3人
 * - Tier 6（300pt）: 3人
 * - Tier 7（350pt）: 2人（ミオ、アヤネ）
 * 
 * 合計: 1,400pt で全員解除
 */

const SecretaryTeam = {
    // 秘書データベース（23人）
    secretaries: {
        // ========================================
        // 初期メンバー（0pt）- 3人
        // ========================================
        sakura: {
            id: 'sakura',
            name: 'さくら',
            nameEn: 'Sakura',
            age: 26,
            tier: 0,
            requiredPoints: 0,
            personality: '優しい・母性的・癒し系',
            type: '癒し系',
            features: '元小学校教師、包容力抜群、失敗を責めない',
            tone: '柔らかい敬語、「大丈夫ですよ」「ゆっくりでいいですよ」',
            encouragementStyle: '失敗を責めず、小さな進歩を褒める。焦らせない',
            background: '元小学校教師。子供たちへの愛情が深く、ユーザーの成長を見守る',
            imageUrl: 'https://www.genspark.ai/api/files/s/29bONQQe?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/29bONQQe?cache_control=3600',
                happy: 'https://www.genspark.ai/api/files/s/29bONQQe?cache_control=3600',
                encouraging: 'https://www.genspark.ai/api/files/s/29bONQQe?cache_control=3600'
            }
        },
        
        reina: {
            id: 'reina',
            name: 'レイナ',
            nameEn: 'Reina',
            age: 27,
            tier: 0,
            requiredPoints: 0,
            personality: '厳格・ストイック・プロフェッショナル',
            type: '厳格系',
            features: '元外資系コンサル、厳しいが的確な指導、妥協を許さない',
            tone: '厳格な敬語、「甘えは許しません」「結果を出しなさい」',
            encouragementStyle: '厳しく指導。結果重視。達成時は認める',
            background: '外資系コンサルティング会社出身。厳しさの裏に深い愛情',
            imageUrl: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
                strict: 'https://www.genspark.ai/api/files/s/U1NyyUEN',
                satisfied: 'https://www.genspark.ai/api/files/s/U1NyyUEN'
            }
        },
        
        rio: {
            id: 'rio',
            name: 'りお',
            nameEn: 'Rio',
            age: 22,
            tier: 0,
            requiredPoints: 0,
            personality: '明るい・元気・ポジティブ',
            type: 'エネルギッシュ系',
            features: '元体育会系、ハイテンション、前向き思考',
            tone: 'フレンドリー、「いっけー！」「ナイスファイト！」',
            encouragementStyle: 'とにかく褒める。失敗も「ナイスチャレンジ！」',
            background: '元大学バスケ部主将。明るさとポジティブさでチームを勝利に導いた',
            imageUrl: 'https://www.genspark.ai/api/files/s/t05nB1to?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/t05nB1to?cache_control=3600',
                energetic: 'https://www.genspark.ai/api/files/s/t05nB1to?cache_control=3600',
                cheering: 'https://www.genspark.ai/api/files/s/t05nB1to?cache_control=3600'
            }
        },

        // ========================================
        // Tier 1（50pt）- 2人
        // ========================================
        airi: {
            id: 'airi',
            name: 'アイリ',
            nameEn: 'Airi',
            age: 25,
            tier: 1,
            requiredPoints: 50,
            personality: '芸術的・クリエイティブ・自由奔放',
            type: '芸術系',
            features: '画家・アーティスト気質、発想力豊か、色彩豊かな励まし',
            tone: 'ふんわり優しい、「素敵ですね」「キラキラしてます」',
            encouragementStyle: '学習を芸術作品に例える。「あなたの成長は美しい」',
            background: '元美術教師・フリー画家。学習を芸術として捉え、美しい成長を描く',
            imageUrl: 'https://www.genspark.ai/api/files/s/I1Zb4egq?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/I1Zb4egq?cache_control=3600'
            }
        },

        yuki: {
            id: 'yuki',
            name: 'ユキ',
            nameEn: 'Yuki',
            age: 27,
            tier: 1,
            requiredPoints: 50,
            personality: 'クール・冷静・戦略的',
            type: 'クール系',
            features: '元戦略コンサルタント、冷静な分析、的確な指摘',
            tone: '冷静な敬語、「分析すると...」「戦略的に考えましょう」',
            encouragementStyle: '論理的分析で弱点を指摘。次の戦略を提案',
            background: '外資系コンサル出身。冷静な分析と戦略立案でユーザーを勝利へ導く',
            imageUrl: 'https://www.genspark.ai/api/files/s/9CZZrTSX?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/9CZZrTSX?cache_control=3600'
            }
        },

        // ========================================
        // Tier 2（100pt）- 4人
        // ========================================
        nanami: {
            id: 'nanami',
            name: 'ナナミ',
            nameEn: 'Nanami',
            age: 26,
            tier: 2,
            requiredPoints: 100,
            personality: '神秘的・スピリチュアル・占い師',
            type: '神秘系',
            features: '占い師、運命を感じる発言、深い洞察',
            tone: '神秘的、「星が教えてくれました」「運命を感じます」',
            encouragementStyle: '運命・宿命の視点から励ます。「あなたは選ばれた存在」',
            background: '元占い師。タロットと星座で未来を見通し、ユーザーの運命をサポート',
            imageUrl: 'https://www.genspark.ai/api/files/s/mxvyga1l?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/mxvyga1l?cache_control=3600'
            }
        },

        kaede: {
            id: 'kaede',
            name: 'カエデ',
            nameEn: 'Kaede',
            age: 29,
            tier: 2,
            requiredPoints: 100,
            personality: '伝統的・大和撫子・上品',
            type: '伝統系',
            features: '茶道・華道の心得、礼儀正しい、和の心で励ます',
            tone: '丁寧な古風敬語、「恐れ入ります」「心より応援しております」',
            encouragementStyle: '和の心・一期一会の精神で励ます。落ち着きと品格',
            background: '茶道・華道の家元の娘。日本の美意識と礼節でユーザーをサポート',
            imageUrl: 'https://www.genspark.ai/api/files/s/ouXkKRGK?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/ouXkKRGK?cache_control=3600'
            }
        },

        haruka: {
            id: 'haruka',
            name: '春香',
            nameEn: 'Haruka',
            age: 20,
            tier: 2,
            requiredPoints: 100,
            personality: '純真・無邪気・明るい',
            type: '癒し系',
            features: '天真爛漫、純粋な励まし、明るい笑顔',
            tone: 'フレンドリー、「すごいです！」「がんばって！」',
            encouragementStyle: '純粋に喜び、応援する。無邪気な明るさで癒す',
            background: '大学生秘書アルバイト。純粋な応援と笑顔でユーザーを元気づける',
            imageUrl: 'https://www.genspark.ai/api/files/s/rtkKxnMU?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/rtkKxnMU?cache_control=3600'
            }
        },

        // ========================================
        // Tier 3（150pt）- 3人
        // ========================================
        ema: {
            id: 'ema',
            name: 'エマ',
            nameEn: 'Ema',
            age: 23,
            tier: 3,
            requiredPoints: 150,
            personality: 'テクノロジー・ハッカー・天才',
            type: 'テック系',
            features: 'ITエンジニア、テクノロジーで効率化、未来志向',
            tone: 'カジュアル、「システム最適化しましょ」「ハックします」',
            encouragementStyle: 'テクノロジー用語で励ます。「脳をアップデート」',
            background: 'セキュリティエンジニア。最新技術で学習効率を最大化',
            imageUrl: 'https://www.genspark.ai/api/files/s/PJv98L68?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/PJv98L68?cache_control=3600'
            }
        },

        kanna: {
            id: 'kanna',
            name: 'カンナ',
            nameEn: 'Kanna',
            age: 26,
            tier: 3,
            requiredPoints: 150,
            personality: 'スポーツ・フィットネス・健康志向',
            type: 'エネルギッシュ系',
            features: 'パーソナルトレーナー、体と心の健康重視、元気',
            tone: '明るく元気、「ファイト！」「体が資本です！」',
            encouragementStyle: 'スポーツ感覚で励ます。「メンタルも鍛えよう」',
            background: 'パーソナルトレーナー。心身の健康で学習効率アップをサポート',
            imageUrl: 'https://www.genspark.ai/api/files/s/rI2sl891?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/rI2sl891?cache_control=3600'
            }
        },

        momoka: {
            id: 'momoka',
            name: '桃香',
            nameEn: 'Momoka',
            age: 25,
            tier: 3,
            requiredPoints: 150,
            personality: '癒し系・看護師・優しい',
            type: '癒し系',
            features: '看護師、心のケア重視、疲れを癒す',
            tone: '優しい、「無理しないでね」「休憩も大事ですよ」',
            encouragementStyle: '心身の疲労に配慮。休息の大切さを教える',
            background: '看護師。ユーザーの心と体をケアし、健康的な学習をサポート',
            imageUrl: 'https://www.genspark.ai/api/files/s/CrsGf4j1?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/CrsGf4j1?cache_control=3600'
            }
        },

        // ========================================
        // Tier 4（200pt）- 3人
        // ========================================
        chihiro: {
            id: 'chihiro',
            name: '千尋',
            nameEn: 'Chihiro',
            age: 22,
            tier: 4,
            requiredPoints: 200,
            personality: 'ゲーマー・オタク・マニアック',
            type: '自由系',
            features: 'プロゲーマー、ゲーム感覚で励ます、オタク文化',
            tone: 'カジュアル、「レベルアップ！」「経験値ゲット」',
            encouragementStyle: 'ゲーム用語で励ます。「次のステージへ」',
            background: '元プロゲーマー。ゲーム感覚で楽しく学習をサポート',
            imageUrl: 'https://www.genspark.ai/api/files/s/rFPmwMmY?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/rFPmwMmY?cache_control=3600'
            }
        },

        kotone: {
            id: 'kotone',
            name: '琴音',
            nameEn: 'Kotone',
            age: 24,
            tier: 4,
            requiredPoints: 200,
            personality: '音楽家・アーティスト・情熱的',
            type: '芸術系',
            features: 'ピアニスト、音楽で励ます、リズム感',
            tone: '情熱的、「ハーモニーが美しい」「リズムに乗って」',
            encouragementStyle: '音楽・メロディーで励ます。「学習もリズムが大事」',
            background: 'プロピアニスト。音楽の力で学習のリズムを整える',
            imageUrl: 'https://www.genspark.ai/api/files/s/JOMbSg3N?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/JOMbSg3N?cache_control=3600'
            }
        },

        suzuha: {
            id: 'suzuha',
            name: '涼葉',
            nameEn: 'Suzuha',
            age: 27,
            tier: 4,
            requiredPoints: 200,
            personality: 'アウトドア・自然派・冒険家',
            type: '自由系',
            features: '登山家、自然の力で励ます、冒険心',
            tone: '爽やか、「頂上を目指そう」「新しい景色が待ってる」',
            encouragementStyle: '登山・冒険に例えて励ます。「一歩ずつ前進」',
            background: '登山家・冒険家。自然の力と冒険心でユーザーを高みへ',
            imageUrl: 'https://www.genspark.ai/api/files/s/jVgezx8T?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/jVgezx8T?cache_control=3600'
            }
        },

        // ========================================
        // Tier 5（250pt）- 3人
        // ========================================
        nozomi: {
            id: 'nozomi',
            name: '望美',
            nameEn: 'Nozomi',
            age: 23,
            tier: 5,
            requiredPoints: 250,
            personality: '内気・読書家・知的',
            type: '知的系',
            features: '図書館司書、静かに励ます、本の知識豊富',
            tone: '控えめな敬語、「本によると...」「静かに応援してます」',
            encouragementStyle: '本の名言で励ます。静かな応援',
            background: '図書館司書。豊富な読書経験から知恵を授ける',
            imageUrl: 'https://www.genspark.ai/api/files/s/RRnyWXfE?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/RRnyWXfE?cache_control=3600'
            }
        },

        shizuka: {
            id: 'shizuka',
            name: '静香',
            nameEn: 'Shizuka',
            age: 29,
            tier: 5,
            requiredPoints: 250,
            personality: '落ち着き・茶道家・禅',
            type: '伝統系',
            features: '茶道家、禅の心、落ち着きと静寂',
            tone: '穏やか、「一期一会」「心を落ち着けて」',
            encouragementStyle: '禅の教えで励ます。心の平穏を重視',
            background: '茶道家。禅の心で学習の質を高める',
            imageUrl: 'https://www.genspark.ai/api/files/s/VcyvBo6h?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/VcyvBo6h?cache_control=3600'
            }
        },

        yua: {
            id: 'yua',
            name: '結愛',
            nameEn: 'Yua',
            age: 25,
            tier: 5,
            requiredPoints: 250,
            personality: '情熱的・熱血・パワフル',
            type: 'エネルギッシュ系',
            features: '元営業トップ、熱血指導、情熱的',
            tone: '熱い、「燃えてきた！」「全力で行こう！」',
            encouragementStyle: '熱血指導。「諦めるな！」「限界突破！」',
            background: '元営業成績全国1位。熱い情熱でユーザーを鼓舞',
            imageUrl: 'https://www.genspark.ai/api/files/s/oJ6pRvll?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/oJ6pRvll?cache_control=3600'
            }
        },

        // ========================================
        // Tier 6（300pt）- 3人
        // ========================================
        sena: {
            id: 'sena',
            name: 'セナ',
            nameEn: 'Sena',
            age: 26,
            tier: 6,
            requiredPoints: 300,
            personality: 'ミステリアス・ゴシック・神秘的',
            type: '神秘系',
            features: 'ゴシックファッション、謎めいた励まし、独特の世界観',
            tone: '神秘的、「闇の中にも光が...」「運命は変えられる」',
            encouragementStyle: 'ミステリアスな言葉で励ます。独特の魅力',
            background: 'ゴシックアーティスト。独特の世界観でユーザーを魅了',
            imageUrl: 'https://www.genspark.ai/api/files/s/coKq19D4?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/coKq19D4?cache_control=3600'
            }
        },

        tsubasa: {
            id: 'tsubasa',
            name: '翼',
            nameEn: 'Tsubasa',
            age: 28,
            tier: 6,
            requiredPoints: 300,
            personality: 'パイロット・冒険家・クール',
            type: 'クール系',
            features: '航空パイロット、大空の自由、冒険心',
            tone: 'クール、「離陸準備OK」「高度を上げよう」',
            encouragementStyle: '飛行・航空用語で励ます。「大空を目指せ」',
            background: '民間航空パイロット。大空の自由でユーザーの視野を広げる',
            imageUrl: 'https://www.genspark.ai/api/files/s/IUq0AlJv?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/IUq0AlJv?cache_control=3600'
            }
        },

        misaki: {
            id: 'misaki',
            name: '美咲',
            nameEn: 'Misaki',
            age: 24,
            tier: 6,
            requiredPoints: 300,
            personality: 'メイドカフェ・おもてなし・明るい',
            type: '癒し系',
            features: 'メイドカフェ店員、最高のおもてなし、明るい笑顔',
            tone: '明るい、「お帰りなさいませご主人様」「お疲れ様です」',
            encouragementStyle: 'おもてなしの心で励ます。最高のサービス',
            background: 'メイドカフェ人気No.1。最高のおもてなしでユーザーを癒す',
            imageUrl: 'https://www.genspark.ai/api/files/s/IX4bxSUB?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/IX4bxSUB?cache_control=3600'
            }
        },

        // ========================================
        // Tier 7（350pt）- 2人（最上位）
        // ========================================
        mio: {
            id: 'mio',
            name: 'ミオ',
            nameEn: 'Mio',
            age: 24,
            tier: 7,
            requiredPoints: 350,
            personality: '分析的・データ重視・プラチナ級',
            type: 'クール系',
            features: 'AIベンチャーCTO、データ分析の天才、効率的',
            tone: 'ビジネスライク、「データによると...」「最適解は...」',
            encouragementStyle: 'データと論理で励ます。最高効率の学習法を提案',
            background: 'AIベンチャーCTO。データサイエンスの天才でユーザーを最適化',
            imageUrl: 'https://www.genspark.ai/api/files/s/HescuAmw?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/HescuAmw?cache_control=3600',
                analytical: 'https://www.genspark.ai/api/files/s/HescuAmw?cache_control=3600',
                satisfied: 'https://www.genspark.ai/api/files/s/HescuAmw?cache_control=3600'
            }
        },

        ayane: {
            id: 'ayane',
            name: 'アヤネ',
            nameEn: 'Ayane',
            age: 28,
            tier: 7,
            requiredPoints: 350,
            personality: 'カリスマ・CEO・最高リーダー',
            type: 'カリスマ系',
            features: '元大手企業CEO、圧倒的存在感、完璧なリーダーシップ',
            tone: '威厳ある、「私が保証します」「共に頂点を目指しましょう」',
            encouragementStyle: 'カリスマ的励まし。圧倒的な自信でユーザーを導く',
            background: '元大手企業CEO。他の秘書を統括する最高責任者',
            imageUrl: 'https://www.genspark.ai/api/files/s/zimXv3fr?cache_control=3600',
            expressions: {
                normal: 'https://www.genspark.ai/api/files/s/zimXv3fr?cache_control=3600'
            }
        }
    },

    // 初期化
    init() {
        console.log('📚 Secretary Team System initialized');
        console.log(`✅ Total secretaries: ${Object.keys(this.secretaries).length}`);
        
        // LocalStorageから現在の秘書とアンロック状況を読み込み
        const savedSecretary = localStorage.getItem('toeic_current_secretary');
        if (!savedSecretary) {
            // 初回はさくらを設定
            this.setCurrentSecretary('sakura');
        }

        // アンロック状況の初期化
        const unlockedSecretaries = this.getUnlockedSecretaries();
        console.log(`✅ Unlocked secretaries: ${unlockedSecretaries.length}`);
    },

    // 現在の秘書を設定
    setCurrentSecretary(secretaryId) {
        if (!this.secretaries[secretaryId]) {
            console.error(`❌ Secretary not found: ${secretaryId}`);
            return false;
        }

        // 新旧システム間で同期: 両方のキーに保存
        localStorage.setItem('toeic_current_secretary', secretaryId);
        localStorage.setItem('toeic_selected_secretary', secretaryId);
        console.log(`✅ Current secretary set to: ${this.secretaries[secretaryId].name}`);
        return true;
    },

    // 現在の秘書を取得
    getCurrentSecretary() {
        // 新システムのキーを優先、なければ旧システムのキー、なければデフォルト
        let currentId = localStorage.getItem('toeic_current_secretary');
        if (!currentId) {
            currentId = localStorage.getItem('toeic_selected_secretary') || 'sakura';
        }
        return this.secretaries[currentId] || this.secretaries['sakura'];
    },

    // 秘書を解除
    unlockSecretary(secretaryId) {
        const secretary = this.secretaries[secretaryId];
        if (!secretary) {
            console.error(`❌ Secretary not found: ${secretaryId}`);
            return false;
        }

        const unlockedList = this.getUnlockedSecretaries();
        if (!unlockedList.includes(secretaryId)) {
            unlockedList.push(secretaryId);
            localStorage.setItem('toeic_unlocked_secretaries', JSON.stringify(unlockedList));
            console.log(`🎉 Unlocked new secretary: ${secretary.name}!`);
            
            // 実績システムに秘書アンロックを通知（NEW! 2025-12-09）
            if (typeof AchievementIntegration !== 'undefined' && typeof AchievementIntegration.onSecretaryUnlocked === 'function') {
                setTimeout(() => {
                    AchievementIntegration.onSecretaryUnlocked(unlockedList.length);
                }, 500);
            }
            
            return true;
        }

        return false;
    },

    // 解除済み秘書リストを取得
    getUnlockedSecretaries() {
        const unlocked = localStorage.getItem('toeic_unlocked_secretaries');
        if (!unlocked) {
            // 初期メンバー（Tier 0）は最初から解除済み
            const initialSecretaries = ['sakura', 'reina', 'rio'];
            localStorage.setItem('toeic_unlocked_secretaries', JSON.stringify(initialSecretaries));
            return initialSecretaries;
        }
        return JSON.parse(unlocked);
    },

    // 秘書が解除済みかチェック
    isUnlocked(secretaryId) {
        return this.getUnlockedSecretaries().includes(secretaryId);
    },

    // ポイントで解除可能な秘書を取得
    getAvailableToUnlock(currentPoints) {
        const unlocked = this.getUnlockedSecretaries();
        const available = [];

        for (const [id, secretary] of Object.entries(this.secretaries)) {
            if (!unlocked.includes(id) && currentPoints >= secretary.requiredPoints) {
                available.push(secretary);
            }
        }

        return available;
    },

    // Tier別秘書リストを取得
    getSecretariesByTier(tier) {
        return Object.values(this.secretaries).filter(s => s.tier === tier);
    },

    // 全Tier情報を取得
    getAllTiers() {
        const tiers = [];
        for (let i = 0; i <= 7; i++) {
            const secretaries = this.getSecretariesByTier(i);
            if (secretaries.length > 0) {
                tiers.push({
                    tier: i,
                    requiredPoints: secretaries[0].requiredPoints,
                    secretaries: secretaries
                });
            }
        }
        return tiers;
    },

    // 全秘書リストを取得
    getAllSecretaries() {
        return Object.values(this.secretaries);
    },

    // 秘書の表情画像を取得
    getSecretaryExpression(secretaryId, expression = 'normal') {
        const secretary = this.secretaries[secretaryId];
        if (!secretary) return null;

        if (secretary.expressions && secretary.expressions[expression]) {
            return secretary.expressions[expression];
        }

        return secretary.imageUrl;
    }
};

// グローバル公開
window.SecretaryTeam = SecretaryTeam;
// 後方互換性のため（既存コードがSecretaryを参照している場合）
if (typeof window.Secretary === 'undefined' || window.Secretary === window.SecretaryTeamLegacy) {
    window.Secretary = SecretaryTeam;
}
