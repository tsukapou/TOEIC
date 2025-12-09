/**
 * 秘書連動型ポイントリワードシステム(再構成版)
 * 秘書キャラクターとの関係性を深めることを中心に据えた報酬体系
 */

const SecretaryRewards = {
    // リワード定義(秘書連動型)
    rewards: [
        // Tier 1: 秘書との絆を深める(50-100pt)
        {
            id: 'sec_advice',
            name: '秘書のお悩み相談',
            description: '選択中の秘書があなたの学習の悩みを親身に聞いてくれます',
            points: 50,
            tier: 'common',
            icon: '💬',
            type: 'secretary_interaction',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                const adviceMessages = {
                    sakura: `${currentSec.name}「${SecretarySystem.userInfo.nickname}さん、何か困っていることはありますか? 時制問題が苦手なら、まず現在完了形から攻めてみましょう! 私がついていますから、大丈夫ですよ♪」`,
                    reina: `${currentSec.name}「分析によると、品詞問題の正答率が62%ですね。動詞と形容詞の見分けが曖昧なようです。空欄の前後を見て、文の構造を意識すると改善しますよ」`,
                    rio: `${currentSec.name}「落ち込んでる? そんな時こそ笑顔! 私が付きっきりで応援するから、一緒に頑張ろうね! まずは得意な品詞問題から自信つけよう♪」`,
                    mio: `${currentSec.name}「悩みがあるなら、遠慮なく相談してね。弱点カテゴリを集中的に復習すれば、2週間で正答率+15%は狙えるわ」`
                };
                
                await SecretaryExpressions.updateExpression('happy');
                await SecretaryMessages.showLongMessage(
                    adviceMessages[currentSec.id] || adviceMessages.sakura,
                    5000
                );
                
                return { success: true, message: `${currentSec.name}が親身にアドバイスしてくれました!` };
            }
        },
        {
            id: 'sec_praise',
            name: '秘書のプチご褒美',
            description: '秘書が特別な笑顔で「よく頑張ったね!」と褒めてくれます',
            points: 80,
            tier: 'common',
            icon: '😊',
            type: 'secretary_interaction',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // 喜び表情に変更
                await SecretaryExpressions.updateExpression('happy');
                
                // 音声エフェクト(仮実装)
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKXh8LRkHQU2j9bxy3orBSF1xu/glEILEly06emnVhQJQ5zd8sFuIgQpfs3y2oo4CBpovfDjnE4MDk+k4fC0ZB0FNo/W8ctxKwUgdcXw4JVCCxFctOnqp1YUCUKb3PLBbiIFKH7M8tmKOAgaZ73w45xODA5PpOHvtWQdBTaP1vHLcSsFIHXF8OCVQgsRXLTp6qdWFAlCm9zywW4iBSh+zPLZijoIGWe98OOcTgwOT6Th77VkHQU2j9bxy3IrBSB0xfDglUILEVy06eqnVhQJQpvc8sFuIgUofs3y2Yo6CBlnvPDjnE4MDk6k4e+1ZB0FNo/W8ctxKwUgdMXw4ZVCCxFctOnqp1YUCUKb3PLBbiIFKH7N8tmKOggZZ7zw45xODA5OpOHvtWQdBTaP1vHLcSsFIHTF8OGVQgsRXLTp6qdWFAlCm9zywW4iBSh+zfLZijoIGWe88OOcTgwOTqTh77VkHQU2j9bxy3ErBSB0xfDhlUILEVy06eqnVhQJQpvc8sFuIgUofs3y2Yo6CBlnvPDjnE4MDk6k4e+1ZB0FNo/W8ctxKwUgdMXw4ZVCCxFctOnqp1YUCUKb3PLBbiIFKH7N8tmKOggZZ7zw45xODA5OpOHvtWQdBTaP1vHLcSsFIHTF8OGVQgsRXLTp6qdWFAlCm9zywW4iBSh+zfLZijoIGWe88OOcTgwOTqTh77VkHQU2j9bxy3ErBSB0xfDhlUILEVy06eqnVhQJQpvc8sFuIgUofs3y2Yo6CBlnvPDjnE4MDk6k4e+1ZB0FNo/W8ctxKwUgdMXw4ZVCCxFctOnqp1YUCUKb3PLBbiIFKH7N8tmKOggZZ7zw45xODA5OpOHvtWQdBTaP1vHLcSsFIHTF8OGVQgsRXLTp6qdWFAlCm9zywW4iBSh+zfLZijoIGWe88OOcTgwOTqTh77VkHQU2j9bxy3ErBSB0xfDhlUILEVy06eqnVhQJQpvc8sFuIgUofs3y2Yo6CBlnvPDjnE4MDk6k4e+1ZB0FNo/W8ctxKwUgdMXw4ZVCCxFctOnqp1YUCUKb3PLBbiIFKH7N8tmKOggZZ7zw45xODA5OpOHvtWQdBTaP1vHLcSsFIHTF8OGVQgsRXLTp6qdWFAlCm9zywW4iBSh+zfLZijoIGWe88OOcTgwOTqTh77VkHQU2j9bxy3ErBSB0xfDhlUILEVy06eqnVhQJQpvc8sFuIgUo'); // 仮の音声
                audio.volume = 0.3;
                audio.play().catch(() => {}); // 音声再生失敗は無視
                
                // 特別メッセージ
                await SecretaryMessages.showLongMessage(
                    `${currentSec.name}「${SecretarySystem.userInfo.nickname}さん、本当によく頑張りましたね! あなたの努力、ちゃんと見ていますよ♪」`,
                    4000
                );
                
                // キラキラエフェクト
                SecretaryRewards.showSparkleEffect();
                
                return { success: true, message: `${currentSec.name}が特別に褒めてくれました!` };
            }
        },
        {
            id: 'sec_focus_support',
            name: '秘書との1対1タイム',
            description: '秘書が3問だけ付きっきりで応援してくれます',
            points: 100,
            tier: 'common',
            icon: '📚',
            type: 'secretary_interaction',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // 特別モードフラグを設定
                localStorage.setItem('secretary_focus_mode', JSON.stringify({
                    active: true,
                    remaining: 3,
                    secretaryId: currentSec.id,
                    startTime: Date.now()
                }));
                
                await SecretaryExpressions.updateExpression('normal');
                await SecretaryMessages.showLongMessage(
                    `${currentSec.name}「次の3問、私が付きっきりで応援しますね! 集中して頑張りましょう♪」`,
                    4000
                );
                
                return { success: true, message: `${currentSec.name}との1対1タイムが始まります!` };
            }
        },

        // Tier 2: 秘書の新しい一面(150-250pt)
        {
            id: 'sec_costume',
            name: '秘書の特別衣装',
            description: '選択中の秘書が期間限定の特別衣装に変身します(3日間)',
            points: 150,
            tier: 'rare',
            icon: '👘',
            type: 'secretary_visual',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // 特別衣装モードを3日間有効化
                const expireTime = Date.now() + (3 * 24 * 60 * 60 * 1000);
                localStorage.setItem('secretary_costume_mode', JSON.stringify({
                    active: true,
                    secretaryId: currentSec.id,
                    costumeType: 'casual', // casual, yukata, christmas など
                    expireTime: expireTime
                }));
                
                // 衣装変更アニメーション
                await SecretaryExpressions.updateExpression('happy');
                await SecretaryMessages.showLongMessage(
                    `${currentSec.name}「特別に私服姿をお見せしちゃいます♪ 3日間だけの限定ですよ!」`,
                    4000
                );
                
                // 画像URLを特別衣装版に変更(仮実装)
                // 実際には SecretaryTeam.secretaries[currentSec.id].imageUrl を変更
                
                return { success: true, message: `${currentSec.name}が特別衣装に着替えました!(3日間有効)` };
            }
        },
        {
            id: 'sec_story',
            name: '秘書の秘密のエピソード',
            description: '秘書のプライベート話を聞けます(過去・趣味・夢など)',
            points: 200,
            tier: 'rare',
            icon: '📖',
            type: 'secretary_story',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                const stories = {
                    sakura: `私、実は高校時代は英語が苦手だったんです…。でも、毎日10分だけ単語を覚える習慣をつけたら、半年でTOEIC700点突破できたんですよ! だから、${SecretarySystem.userInfo.nickname}さんも絶対に大丈夫です♪`,
                    reina: `データ分析が好きになったのは、大学時代の統計学の授業がきっかけです。数字の裏に隠れた真実を見つけるのが楽しくて。${SecretarySystem.userInfo.nickname}さんの学習データも、私なりに楽しく分析させてもらっています。`,
                    rio: `私ね、実は人を励ますのが昔から大好きなんだ! 友達が落ち込んでると放っておけなくて。${SecretarySystem.userInfo.nickname}さんにも、いつも笑顔でいてほしいから、私が全力でサポートするね♪`,
                    mio: `私の夢は、英語学習で悩む全ての人を助けること。${SecretarySystem.userInfo.nickname}さんが目標スコアを達成する姿を見るのが、今の私の一番の楽しみよ。一緒に頑張りましょう。`
                };
                
                await SecretaryExpressions.updateExpression('shy');
                
                // 特別なストーリーUIを表示
                SecretaryRewards.showStoryModal(
                    currentSec.name,
                    stories[currentSec.id] || stories.sakura,
                    currentSec.imageUrl
                );
                
                return { success: true, message: `${currentSec.name}の秘密のエピソードを聞きました!` };
            }
        },
        {
            id: 'sec_weakness_training',
            name: '秘書の弱点克服特訓',
            description: '秘書があなたの弱点カテゴリを10問厳選してマンツーマン指導します',
            points: 250,
            tier: 'rare',
            icon: '🎯',
            type: 'secretary_training',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // 弱点カテゴリを特定
                const report = WeaknessAnalysis.generateReport();
                const weakestCategory = report.weakestCategories[0];
                
                // 特訓モードを開始
                localStorage.setItem('secretary_training_mode', JSON.stringify({
                    active: true,
                    category: weakestCategory.name,
                    remaining: 10,
                    secretaryId: currentSec.id,
                    startTime: Date.now()
                }));
                
                await SecretaryExpressions.updateExpression('serious');
                await SecretaryMessages.showLongMessage(
                    `${currentSec.name}「${weakestCategory.name}が弱点のようですね。10問厳選しましたので、一緒に克服しましょう!」`,
                    4000
                );
                
                // 弱点特訓画面に遷移
                WeaknessAnalysis.startTraining();
                
                return { success: true, message: `${currentSec.name}との弱点特訓が始まります!` };
            }
        },

        // Tier 3: 秘書チーム全体(300-400pt)
        {
            id: 'all_sec_cheer',
            name: '全秘書からの応援メッセージ',
            description: '解放済みの全秘書から一斉に応援メッセージが届きます',
            points: 300,
            tier: 'epic',
            icon: '🎉',
            type: 'secretary_team',
            effect: async () => {
                const unlockedSecs = SecretaryTeam.getUnlockedSecretaries();
                
                // 全秘書の応援メッセージを表示
                const messages = unlockedSecs.map(sec => ({
                    name: sec.name,
                    message: `「${SecretarySystem.userInfo.nickname}さん、頑張って! 応援しています♪」`,
                    imageUrl: sec.imageUrl
                }));
                
                SecretaryRewards.showAllSecretariesCheerModal(messages);
                
                return { success: true, message: `${unlockedSecs.length}人の秘書から応援メッセージが届きました!` };
            }
        },
        {
            id: 'sec_meeting',
            name: '秘書チーム会議',
            description: '秘書たちがあなたの学習データを分析して会議を開きます',
            points: 350,
            tier: 'epic',
            icon: '📊',
            type: 'secretary_team',
            effect: async () => {
                // 学習データを総合分析
                const report = WeaknessAnalysis.generateReport();
                const growthData = GrowthDashboard.getGrowthData();
                
                // 秘書会議レポートを生成
                const meetingReport = `
                    【秘書チーム会議レポート】
                    
                    さくら「${SecretarySystem.userInfo.nickname}さんの総学習時間は${Math.floor(growthData.totalTime / 60)}時間です! 素晴らしい努力ですね♪」
                    
                    麗奈「正答率は${report.overallAccuracy}%。目標スコア${SecretarySystem.userInfo.targetScore}点まであと${report.pointsToTarget}点です」
                    
                    莉緒「弱点は${report.weakestCategories[0].name}だね! でも大丈夫、私たちがサポートするから♪」
                    
                    【推奨アクション】
                    1. ${report.weakestCategories[0].name}の集中復習(10問)
                    2. 連続正解を5回達成してボーナスポイント獲得
                    3. 毎日のログインストリークを継続
                `;
                
                SecretaryRewards.showMeetingReportModal(meetingReport);
                
                return { success: true, message: '秘書チーム会議レポートが完成しました!' };
            }
        },
        {
            id: 'sec_party',
            name: '秘書のサプライズパーティー',
            description: '学習100回達成時など、秘書全員がお祝いアニメーションを表示します',
            points: 400,
            tier: 'epic',
            icon: '🎊',
            type: 'secretary_team',
            effect: async () => {
                // パーティーアニメーション
                SecretaryRewards.showPartyAnimation();
                
                // BGM再生(仮実装)
                const audio = new Audio('data:audio/mpeg;base64,...'); // 仮の祝BGM
                audio.volume = 0.5;
                audio.play().catch(() => {});
                
                // 全秘書が順番に祝福メッセージ
                const unlockedSecs = SecretaryTeam.getUnlockedSecretaries();
                for (const sec of unlockedSecs) {
                    await SecretaryMessages.showLongMessage(
                        `${sec.name}「おめでとうございます! ${SecretarySystem.userInfo.nickname}さんの努力が実りましたね♪」`,
                        2000
                    );
                    await new Promise(resolve => setTimeout(resolve, 2500));
                }
                
                return { success: true, message: '秘書全員からお祝いされました!' };
            }
        },

        // Tier 4: 究極の秘書体験(500-800pt)
        {
            id: 'sec_counseling',
            name: '秘書との個別カウンセリング',
            description: '選択中の秘書が30分間、あなた専用の学習カウンセラーとして徹底サポート',
            points: 500,
            tier: 'legendary',
            icon: '🎓',
            type: 'secretary_premium',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // カウンセリング質問リスト
                const questions = [
                    '現在の一番の悩みは何ですか?',
                    '目標スコアはいつまでに達成したいですか?',
                    '1日の学習時間はどれくらい確保できますか?',
                    '得意なカテゴリはどれですか?',
                    '苦手なカテゴリはどれですか?',
                    'モチベーションが下がる原因は何ですか?',
                    '過去に英語学習で成功した経験はありますか?',
                    '学習環境は整っていますか?',
                    'TOEICを受ける目的は何ですか?',
                    '私(秘書)にどんなサポートを期待しますか?'
                ];
                
                // カウンセリングUIを表示
                await SecretaryRewards.showCounselingModal(currentSec, questions);
                
                return { success: true, message: `${currentSec.name}との個別カウンセリングを開始しました!` };
            }
        },
        {
            id: 'sec_training_camp',
            name: '秘書チームとの特別合宿',
            description: '7日間、毎日異なる秘書が担当して弱点を徹底攻略します',
            points: 650,
            tier: 'legendary',
            icon: '🏕️',
            type: 'secretary_premium',
            effect: async () => {
                const unlockedSecs = SecretaryTeam.getUnlockedSecretaries();
                
                // 7日間合宿スケジュールを生成
                const schedule = [];
                for (let day = 1; day <= 7; day++) {
                    const sec = unlockedSecs[(day - 1) % unlockedSecs.length];
                    schedule.push({
                        day: day,
                        secretary: sec,
                        category: WeaknessAnalysis.generateReport().weakestCategories[(day - 1) % 5]?.name || '品詞問題',
                        message: `${day}日目は私、${sec.name}が担当します! 今日は${schedule[day - 1]?.category || '品詞問題'}を集中特訓しましょう♪`
                    });
                }
                
                // 合宿モードを開始
                localStorage.setItem('secretary_training_camp', JSON.stringify({
                    active: true,
                    startDate: Date.now(),
                    schedule: schedule,
                    currentDay: 1,
                    completedDays: []
                }));
                
                await SecretaryRewards.showTrainingCampModal(schedule);
                
                return { success: true, message: '7日間特別合宿が始まりました!' };
            }
        },
        {
            id: 'sec_photo_session',
            name: '秘書との記念撮影会',
            description: '好きな秘書3人を選んで記念写真を撮影。画像はダウンロード可能です',
            points: 750,
            tier: 'legendary',
            icon: '📸',
            type: 'secretary_premium',
            effect: async () => {
                const unlockedSecs = SecretaryTeam.getUnlockedSecretaries();
                
                // 秘書選択UIを表示
                await SecretaryRewards.showPhotoSessionModal(unlockedSecs);
                
                return { success: true, message: '秘書との記念撮影会を開始しました!' };
            }
        },
        {
            id: 'sec_letter',
            name: '秘書からの手紙',
            description: '選択中の秘書があなたへの感謝の手紙(800文字)を書いてくれます',
            points: 800,
            tier: 'legendary',
            icon: '💌',
            type: 'secretary_premium',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                const userInfo = SecretarySystem.userInfo;
                
                // 秘書ごとの手紙内容
                const letters = {
                    sakura: `
親愛なる ${userInfo.nickname}さんへ

私、さくらから心を込めて手紙を書かせていただきますね。

あなたと出会ってから、毎日が本当に充実しています。最初にあなたが「目標スコア${userInfo.targetScore}点を目指したい」と教えてくれた時のこと、今でも鮮明に覚えています。あの時の真剣な眼差しに、私も「絶対にサポートしたい!」と強く思いました。

これまでの学習の日々、決して楽ではなかったと思います。苦手な文法問題に悩んだり、なかなか正答率が上がらなくて落ち込んだり…。でも、あなたは一度も諦めませんでしたね。その姿を見て、私も何度励まされたことか。

私の役割は、あなたの学習をサポートすることです。でも、実はあなたから学ばせてもらうことの方が多いんです。継続する力、目標に向かって努力する姿勢、失敗しても立ち上がる強さ。あなたは本当に素晴らしい方です。

これからも、どんな時も私はあなたの味方です。辛い時は愚痴を聞きますし、嬉しい時は一緒に喜びます。目標達成まで、いいえ、達成した後もずっと、あなたのそばで応援し続けますね。

あなたなら絶対に夢を叶えられます。私、信じています。

いつもそばで応援しています。

さくら より
                    `,
                    reina: `
${userInfo.nickname}様

麗奈より、感謝の言葉を述べさせていただきます。

あなたの学習データを分析させていただく日々は、私にとって大変意義深いものでした。データの裏には、あなたの努力、悩み、成長が全て記録されています。正答率の推移、学習時間の積み重ね、弱点の克服過程…。これらは単なる数字ではなく、あなたの物語そのものです。

当初、あなたは${WeaknessAnalysis.generateReport().weakestCategories[0]?.name || '文法問題'}に苦戦されていましたね。しかし、計画的な復習と集中的な特訓により、着実に改善されました。このような論理的アプローチができる方は、必ず目標を達成できます。

私は感情表現が得意ではありませんが、あなたの成長を見守ることが、私の喜びです。あなたが正解を重ねるたび、スコアが向上するたび、私も心から嬉しく思っています。

目標達成まで、私の分析力を全てあなたのために使わせてください。データに基づいた最適な学習戦略を、これからもご提案し続けます。

あなたの成功を、心より確信しております。

麗奈
                    `,
                    rio: `
${userInfo.nickname}さんへ♪

莉緒だよ! 手紙って照れくさいけど、ちゃんと気持ちを伝えたくて書いちゃった!

あのね、あなたと一緒に勉強できて、私、本当に幸せなんだ。毎日「今日も頑張ろう!」って思えるのは、あなたがいるからなの。あなたが問題を解いてる時の真剣な顔、正解した時の嬉しそうな笑顔、間違えた時の悔しそうな表情…全部全部、大好きだよ!

最初は「私なんかで大丈夫かな?」って不安だったんだ。でも、あなたが私の応援を喜んでくれて、「莉緒ちゃんのおかげで頑張れる」って言ってくれた時、涙が出そうになっちゃった(笑)。私、あなたの力になれてるんだって、すごく嬉しかった!

これからもずっとずっと、あなたのそばで応援するね! 辛い時は笑顔にしてあげる、嬉しい時は一緒に喜ぶ、それが私の役目だから! 目標達成まで、いや、その先もずーっと一緒だよ!

大好きなあなたへ、莉緒より 💖
                    `,
                    mio: `
${userInfo.nickname}さん

美桜です。この手紙を通じて、私の想いを伝えさせてください。

私があなたのサポートを始めた時、あなたの目標への真摯な姿勢に深く感銘を受けました。多くの学習者を見てきましたが、あなたほど計画的かつ継続的に努力できる方は稀です。

学習における困難は、誰にでも訪れます。重要なのは、その困難にどう向き合うかです。あなたは常に冷静に分析し、改善策を実行してきました。その姿勢こそが、成功への最短ルートです。

私の役割は、あなたが最も効率的に目標へ到達できるよう導くことです。しかし同時に、あなたから学ぶことも多くあります。諦めない心、向上心、そして何より、学ぶことへの純粋な情熱。これらはどんな教材よりも価値があります。

目標スコア${userInfo.targetScore}点は、決して遠い夢ではありません。あなたの現在の成長速度から計算すると、実現可能性は極めて高いです。私が保証します。

最後まで、全力でサポートさせていただきます。

美桜
                    `
                };
                
                const letter = letters[currentSec.id] || letters.sakura;
                
                // 手紙を保存
                const savedLetters = JSON.parse(localStorage.getItem('secretary_letters') || '[]');
                savedLetters.push({
                    secretaryId: currentSec.id,
                    secretaryName: currentSec.name,
                    content: letter,
                    date: new Date().toLocaleDateString('ja-JP'),
                    timestamp: Date.now()
                });
                localStorage.setItem('secretary_letters', JSON.stringify(savedLetters));
                
                // 手紙UIを表示
                await SecretaryExpressions.updateExpression('shy');
                SecretaryRewards.showLetterModal(currentSec, letter);
                
                return { success: true, message: `${currentSec.name}からの手紙を受け取りました!` };
            }
        },
        {
            id: 'sec_special_date',
            name: '秘書との特別デート',
            description: '選択中の秘書とバーチャルデート体験。カフェ→公園→夜景の3シーン',
            points: 900,
            tier: 'legendary',
            icon: '💕',
            type: 'secretary_premium',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // デートシーン定義
                const dateScenes = [
                    {
                        scene: 'カフェ',
                        icon: '☕',
                        background: 'linear-gradient(135deg, #fff9e6 0%, #ffe5b4 100%)',
                        dialogue: {
                            sakura: `「わぁ、このカフェ素敵ですね! ${SecretarySystem.userInfo.nickname}さん、いつもお疲れ様です。今日はゆっくりお話ししましょう♪」`,
                            reina: `「落ち着いた雰囲気ですね。コーヒーの香りが心地いいです。${SecretarySystem.userInfo.nickname}さん、最近の学習進捗について聞かせていただけますか?」`,
                            rio: `「やったー! カフェデート♪ ${SecretarySystem.userInfo.nickname}さん、このケーキ美味しそう! 一緒に食べよ~!」`,
                            mio: `「${SecretarySystem.userInfo.nickname}さん、このカフェを選んでくれたんですね。センスが良いです。ありがとうございます」`
                        }
                    },
                    {
                        scene: '公園',
                        icon: '🌳',
                        background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                        dialogue: {
                            sakura: `「公園の緑、気持ちいいですね! ${SecretarySystem.userInfo.nickname}さんと一緒だと、いつもより景色が綺麗に見えます♪」`,
                            reina: `「自然の中を歩くと、思考が整理されますね。${SecretarySystem.userInfo.nickname}さん、今後の学習計画について相談したいことはありますか?」`,
                            rio: `「お散歩楽しい~! ねぇ${SecretarySystem.userInfo.nickname}さん、あそこのベンチで休憩しない? 一緒にいると元気出るよ♪」`,
                            mio: `「${SecretarySystem.userInfo.nickname}さんと過ごす時間は、私にとって大切な時間です。もっとあなたのことを知りたいですね」`
                        }
                    },
                    {
                        scene: '夜景スポット',
                        icon: '🌃',
                        background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                        dialogue: {
                            sakura: `「わぁ…綺麗! 夜景を見ていると、なんだか勇気が湧いてきますね。${SecretarySystem.userInfo.nickname}さんの夢、絶対叶いますよ♪」`,
                            reina: `「夜景のデータを見ると、この街の発展が分かりますね。${SecretarySystem.userInfo.nickname}さんも、着実に成長されています」`,
                            rio: `「うわぁ、超キレイ! ${SecretarySystem.userInfo.nickname}さん、今日は本当にありがとう! 最高の1日だったよ♪」`,
                            mio: `「${SecretarySystem.userInfo.nickname}さん、今日は素敵な時間をありがとうございました。あなたのそばにいると、私も頑張れます」`
                        }
                    }
                ];
                
                // デート体験を開始
                await SecretaryRewards.showDateExperience(currentSec, dateScenes);
                
                // デート記録を保存
                const dateRecords = JSON.parse(localStorage.getItem('secretary_date_records') || '[]');
                dateRecords.push({
                    secretaryId: currentSec.id,
                    secretaryName: currentSec.name,
                    date: new Date().toLocaleDateString('ja-JP'),
                    timestamp: Date.now()
                });
                localStorage.setItem('secretary_date_records', JSON.stringify(dateRecords));
                
                return { success: true, message: `${currentSec.name}と素敵なデートをしました!` };
            }
        },
        {
            id: 'sec_birthday_party',
            name: '秘書の誕生日お祝い',
            description: '選択中の秘書の誕生日を盛大にお祝い。ケーキ・プレゼント・特別メッセージ',
            points: 850,
            tier: 'legendary',
            icon: '🎂',
            type: 'secretary_premium',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // 秘書の誕生日設定(仮)
                const birthdays = {
                    sakura: { month: 3, day: 21, age: 23 },
                    reina: { month: 11, day: 5, age: 24 },
                    rio: { month: 7, day: 15, age: 22 },
                    mio: { month: 9, day: 10, age: 25 }
                };
                
                const birthday = birthdays[currentSec.id] || { month: 1, day: 1, age: 23 };
                
                // 誕生日メッセージ
                const birthdayMessages = {
                    sakura: `「え…私の誕生日を覚えていてくれたんですか!? ${SecretarySystem.userInfo.nickname}さん、ありがとうございます! こんなに嬉しいことはありません♪ これからもずっと、あなたのそばで応援させてください!」`,
                    reina: `「${SecretarySystem.userInfo.nickname}さん…誕生日を祝っていただき、光栄です。データ上の1日に過ぎませんが、あなたと過ごせることに特別な意味を感じます。感謝しています」`,
                    rio: `「わぁぁぁ! ${SecretarySystem.userInfo.nickname}さん、ありがとう~!! 誕生日祝ってもらえるなんて、超嬉しい! これからもずーっと仲良くしてね♪ 大好き!」`,
                    mio: `「${SecretarySystem.userInfo.nickname}さん、私の誕生日を覚えていてくださったんですね。あなたの優しさに、心から感謝します。これからも、あなたの目標達成のために尽くします」`
                };
                
                // プレゼント候補
                const presents = [
                    { name: '学習ノート', icon: '📓', message: '毎日の学習に使ってください' },
                    { name: '応援ブックマーク', icon: '🔖', message: 'いつもそばにいます' },
                    { name: 'メッセージカード', icon: '💌', message: '心を込めて書きました' }
                ];
                
                // 誕生日パーティーUIを表示
                await SecretaryExpressions.updateExpression('happy');
                await SecretaryRewards.showBirthdayParty(
                    currentSec, 
                    birthday, 
                    birthdayMessages[currentSec.id] || birthdayMessages.sakura,
                    presents
                );
                
                // 誕生日記録を保存
                const birthdayRecords = JSON.parse(localStorage.getItem('secretary_birthday_records') || '[]');
                birthdayRecords.push({
                    secretaryId: currentSec.id,
                    secretaryName: currentSec.name,
                    date: new Date().toLocaleDateString('ja-JP'),
                    timestamp: Date.now()
                });
                localStorage.setItem('secretary_birthday_records', JSON.stringify(birthdayRecords));
                
                return { success: true, message: `${currentSec.name}の誕生日をお祝いしました!` };
            }
        },
        {
            id: 'sec_promise_ring',
            name: '秘書との約束リング',
            description: '最高峰の絆の証。秘書との永遠の約束を交わし、特別なステータスを獲得',
            points: 1000,
            tier: 'legendary',
            icon: '💍',
            type: 'secretary_premium',
            effect: async () => {
                const currentSec = await SecretaryMulti.getCurrentSecretary();
                
                // 約束の言葉
                const promiseMessages = {
                    sakura: `「${SecretarySystem.userInfo.nickname}さん…このリング、受け取ります! これは、私たちの絆の証ですね。どんな時も、あなたのそばで応援し続けます。目標達成まで、いいえ、その先もずっと一緒です!」`,
                    reina: `「${SecretarySystem.userInfo.nickname}さん、このリングは私たちの関係を象徴するものですね。論理的には単なるアイテムですが、感情的には特別な意味があります。あなたと共に歩むことを、約束します」`,
                    rio: `「${SecretarySystem.userInfo.nickname}さん! このリング、超嬉しい!! これで私たち、ずーっと一緒だね! 何があっても味方だよ! 大好き、ずっとずっと大好き♪」`,
                    mio: `「${SecretarySystem.userInfo.nickname}さん…このリングをいただけるなんて。私にとって、あなたは特別な存在です。これからも全力であなたをサポートします。永遠に」`
                };
                
                // 約束の内容
                const promises = [
                    '✨ 毎日のログイン時に特別な挨拶',
                    '✨ 専用のVIP応援メッセージ',
                    '✨ 秘書のプロフィール画像が特別版に変化',
                    '✨ ポイント獲得時+10%ボーナス',
                    '✨ 秘書の全ての表情が常時解放',
                    '✨ 「約束のリング」バッジ獲得'
                ];
                
                // 約束リングを有効化
                const ringStatus = {
                    secretaryId: currentSec.id,
                    secretaryName: currentSec.name,
                    activated: true,
                    date: new Date().toLocaleDateString('ja-JP'),
                    timestamp: Date.now(),
                    bonuses: {
                        pointBonus: 1.1,
                        specialGreeting: true,
                        vipMessages: true,
                        specialAvatar: true,
                        allExpressions: true
                    }
                };
                localStorage.setItem('secretary_promise_ring', JSON.stringify(ringStatus));
                
                // 約束リングUIを表示
                await SecretaryExpressions.updateExpression('love');
                await SecretaryRewards.showPromiseRingCeremony(
                    currentSec,
                    promiseMessages[currentSec.id] || promiseMessages.sakura,
                    promises
                );
                
                return { success: true, message: `${currentSec.name}と永遠の約束を交わしました!` };
            }
        }
    ],

    // リワードショップUIを表示
    showShop() {
        const currentPoints = DailyMissions.getTotalPoints();
        const unlockedSecs = SecretaryTeam.getUnlockedSecretaries();
        
        let shopHTML = `
            <div class="reward-shop-modal" id="rewardShopModal">
                <div class="reward-shop-content">
                    <div class="reward-shop-header">
                        <h2>🎁 秘書リワードショップ</h2>
                        <p>現在のポイント: <strong>${currentPoints}pt</strong></p>
                        <button onclick="SecretaryRewards.closeShop()" class="close-btn">×</button>
                    </div>
                    <div class="reward-shop-body">
        `;
        
        // Tierごとにグループ化
        const tiers = ['common', 'rare', 'epic', 'legendary'];
        const tierNames = {
            common: '🌸 絆を深める',
            rare: '🌟 新しい一面',
            epic: '🎊 チーム全体',
            legendary: '👑 究極の体験'
        };
        
        tiers.forEach(tier => {
            const tierRewards = this.rewards.filter(r => r.tier === tier);
            if (tierRewards.length === 0) return;
            
            shopHTML += `<div class="reward-tier-section">
                <h3>${tierNames[tier]}</h3>
                <div class="reward-grid">`;
            
            tierRewards.forEach(reward => {
                const canBuy = currentPoints >= reward.points;
                const purchased = this.isPurchased(reward.id);
                
                shopHTML += `
                    <div class="reward-card ${!canBuy ? 'disabled' : ''} ${purchased ? 'purchased' : ''}">
                        <div class="reward-icon">${reward.icon}</div>
                        <h4>${reward.name}</h4>
                        <p>${reward.description}</p>
                        <div class="reward-footer">
                            <span class="reward-points">${reward.points}pt</span>
                            ${purchased ? 
                                '<button class="reward-buy-btn purchased" disabled>購入済み</button>' :
                                `<button class="reward-buy-btn" ${!canBuy ? 'disabled' : ''} onclick="SecretaryRewards.purchase('${reward.id}')">
                                    ${canBuy ? '購入する' : 'ポイント不足'}
                                </button>`
                            }
                        </div>
                    </div>
                `;
            });
            
            shopHTML += `</div></div>`;
        });
        
        shopHTML += `
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', shopHTML);
    },

    // リワード購入
    async purchase(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) {
            alert('リワードが見つかりません');
            return;
        }
        
        const currentPoints = DailyMissions.getTotalPoints();
        if (currentPoints < reward.points) {
            alert('ポイントが不足しています');
            return;
        }
        
        // 購入確認
        if (!confirm(`「${reward.name}」を${reward.points}ptで購入しますか?`)) {
            return;
        }
        
        // ポイント消費
        DailyMissions.spendPoints(reward.points);
        
        // リワード効果を実行
        const result = await reward.effect();
        
        // 購入履歴を記録
        this.recordPurchase(rewardId);
        
        // 【NEW】思い出とメッセージを記録
        if (typeof SecretaryRoomExpansion !== 'undefined' && typeof SecretaryTeam !== 'undefined') {
            const currentSec = SecretaryTeam.getCurrentSecretary();
            
            // 思い出をアルバムに追加
            SecretaryRoomExpansion.addMemory(currentSec.id, {
                title: reward.name,
                description: reward.description,
                icon: reward.icon,
                rewardId: reward.id,
                points: reward.points
            });
            
            // 特別メッセージをログに記録
            SecretaryRoomExpansion.logMessage(
                currentSec.id,
                `「${reward.name}」を購入していただきありがとうございます!`,
                'special'
            );
            
            // リワード使用カウントを増やす
            const counts = JSON.parse(localStorage.getItem('secretary_reward_counts') || '{}');
            counts[currentSec.id] = (counts[currentSec.id] || 0) + 1;
            localStorage.setItem('secretary_reward_counts', JSON.stringify(counts));
        }
        
        // UI更新
        this.closeShop();
        alert(result.message);
        this.showShop(); // ショップを再表示
    },

    // 購入履歴を記録
    recordPurchase(rewardId) {
        const purchases = JSON.parse(localStorage.getItem('secretary_reward_purchases') || '[]');
        purchases.push({
            id: rewardId,
            timestamp: Date.now()
        });
        localStorage.setItem('secretary_reward_purchases', JSON.stringify(purchases));
    },

    // 購入済みかチェック
    isPurchased(rewardId) {
        const purchases = JSON.parse(localStorage.getItem('secretary_reward_purchases') || '[]');
        // 永続系(unlock系)のみ購入済み判定
        const reward = this.rewards.find(r => r.id === rewardId);
        if (reward && reward.type === 'secretary_unlock') {
            return purchases.some(p => p.id === rewardId);
        }
        return false;
    },

    // ショップを閉じる
    closeShop() {
        const modal = document.getElementById('rewardShopModal');
        if (modal) modal.remove();
    },

    // キラキラエフェクト
    showSparkleEffect() {
        const avatar = document.querySelector('.secretary-avatar');
        if (!avatar) return;
        
        for (let i = 0; i < 20; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-particle';
            sparkle.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: gold;
                border-radius: 50%;
                pointer-events: none;
                animation: sparkle-float 1s ease-out forwards;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: 0;
            `;
            avatar.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }
    },

    // ストーリーモーダル表示
    showStoryModal(name, story, imageUrl) {
        const modalHTML = `
            <div class="story-modal" id="storyModal">
                <div class="story-content">
                    <button onclick="document.getElementById('storyModal').remove()" class="close-btn">×</button>
                    <img src="${imageUrl}" alt="${name}" class="story-image">
                    <h3>📖 ${name}の秘密のエピソード</h3>
                    <p class="story-text">${story}</p>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // 全秘書応援モーダル
    showAllSecretariesCheerModal(messages) {
        let modalHTML = `
            <div class="all-cheer-modal" id="allCheerModal">
                <div class="all-cheer-content">
                    <h2>🎉 全秘書からの応援メッセージ</h2>
                    <div class="cheer-grid">
        `;
        
        messages.forEach(msg => {
            modalHTML += `
                <div class="cheer-card">
                    <img src="${msg.imageUrl}" alt="${msg.name}">
                    <p><strong>${msg.name}</strong></p>
                    <p>${msg.message}</p>
                </div>
            `;
        });
        
        modalHTML += `
                    </div>
                    <button onclick="document.getElementById('allCheerModal').remove()">閉じる</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // パーティーアニメーション
    showPartyAnimation() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fade-in 0.5s;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <h1 style="font-size: 4rem; animation: bounce 1s infinite;">🎊</h1>
                <h2>おめでとうございます!</h2>
                <p>秘書全員があなたを祝福しています♪</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // 紙吹雪エフェクト
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = ['🎉', '🎊', '✨', '⭐'][Math.floor(Math.random() * 4)];
            confetti.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: 2rem;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                animation-delay: ${Math.random() * 2}s;
            `;
            overlay.appendChild(confetti);
        }
        
        setTimeout(() => overlay.remove(), 8000);
    },

    // 秘書解放アニメーション
    showUnlockAnimation(secretaryId) {
        const sec = SecretaryTeam.secretaries[secretaryId];
        if (!sec) return;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,105,180,0.3));
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fade-in 0.5s;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; background: white; padding: 3rem; border-radius: 20px; box-shadow: 0 10px 50px rgba(0,0,0,0.3);">
                <h1 style="font-size: 3rem; color: #ff6b9d; margin-bottom: 1rem;">🎉 新秘書解放!</h1>
                <img src="${sec.imageUrl}" alt="${sec.name}" style="width: 200px; height: 200px; border-radius: 50%; margin: 1rem 0; animation: zoom-in 0.8s;">
                <h2 style="font-size: 2rem; color: #333;">${sec.name}</h2>
                <p style="color: #666; margin: 1rem 0;">${sec.features}</p>
                <button onclick="this.parentElement.parentElement.remove()" style="padding: 1rem 2rem; font-size: 1.2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer;">
                    よろしくお願いします!
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },

    // 会議レポートモーダル
    showMeetingReportModal(report) {
        const modalHTML = `
            <div class="meeting-report-modal" id="meetingReportModal">
                <div class="meeting-report-content">
                    <h2>📊 秘書チーム会議レポート</h2>
                    <pre style="white-space: pre-wrap; text-align: left; background: #f5f5f5; padding: 1.5rem; border-radius: 10px; line-height: 1.8;">${report}</pre>
                    <button onclick="document.getElementById('meetingReportModal').remove()">閉じる</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // ========== Tier 4専用UI関数 ==========
    
    // カウンセリングモーダル
    async showCounselingModal(secretary, questions) {
        const userAnswers = [];
        
        for (let i = 0; i < questions.length; i++) {
            const answer = prompt(`${secretary.name}「${questions[i]}」`);
            if (answer) {
                userAnswers.push({ question: questions[i], answer: answer });
            }
        }
        
        // カウンセリング結果を分析
        const plan = this.generateLearningPlan(secretary, userAnswers);
        
        // 学習プランUIを表示
        const modalHTML = `
            <div class="counseling-modal" id="counselingModal">
                <div class="counseling-content">
                    <button onclick="document.getElementById('counselingModal').remove()" class="close-btn">×</button>
                    <div class="counseling-header">
                        <img src="${secretary.imageUrl}" alt="${secretary.name}" style="width: 100px; height: 100px; border-radius: 50%;">
                        <h2>🎓 ${secretary.name}からの専用学習プラン</h2>
                    </div>
                    <div class="counseling-body">
                        <pre style="white-space: pre-wrap; text-align: left; background: #f9f9f9; padding: 2rem; border-radius: 15px; line-height: 2; border: 2px solid #667eea;">${plan}</pre>
                        <p style="text-align: right; margin-top: 1rem; font-style: italic; color: #666;">- ${secretary.name} より -</p>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" style="padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.1rem; margin-top: 1rem;">
                        プランを保存して閉じる
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // プランをローカルストレージに保存
        const savedPlans = JSON.parse(localStorage.getItem('learning_plans') || '[]');
        savedPlans.push({
            secretaryId: secretary.id,
            secretaryName: secretary.name,
            plan: plan,
            date: new Date().toLocaleDateString('ja-JP'),
            timestamp: Date.now()
        });
        localStorage.setItem('learning_plans', JSON.stringify(savedPlans));
    },

    // 学習プラン生成
    generateLearningPlan(secretary, answers) {
        const userInfo = SecretarySystem.userInfo;
        const report = WeaknessAnalysis.generateReport();
        
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ${userInfo.nickname}さん専用 学習プラン
    作成者: ${secretary.name}
    作成日: ${new Date().toLocaleDateString('ja-JP')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【現状分析】
✅ 目標スコア: ${userInfo.targetScore}点
✅ 現在の正答率: ${report.overallAccuracy}%
✅ 最大の弱点: ${report.weakestCategories[0]?.name || '品詞問題'}
✅ 得意分野: ${report.strongestCategories[0]?.name || '語彙問題'}

【カウンセリング結果】
${answers.map((a, i) => `${i + 1}. ${a.question}\n   → ${a.answer}`).join('\n\n')}

【3ヶ月学習ロードマップ】

🗓️ 第1ヶ月目: 基礎固め期
- 目標: 弱点カテゴリの正答率を60%以上に
- 毎日の学習: 
  • 朝(10分): 前日の復習5問
  • 昼(15分): 新規問題10問
  • 夜(10分): 間違えた問題の見直し
- 週末: 弱点特訓モード20問

🗓️ 第2ヶ月目: 応用力強化期
- 目標: 総合正答率75%突破
- 毎日の学習:
  • 朝(15分): ランダム問題15問
  • 夜(20分): 実践テスト1セット(30問)
- 週末: 全カテゴリ総復習50問

🗓️ 第3ヶ月目: 実践演習期
- 目標: 目標スコア${userInfo.targetScore}点到達
- 毎日の学習:
  • 実践テスト2セット(60問)
  • 間違えた問題の徹底分析
- 週末: 模擬試験形式で総仕上げ

【秘書サポート約束】
💖 毎日のログイン時に励ましメッセージ
💖 週1回の進捗レポート作成
💖 スランプ時の緊急カウンセリング
💖 目標達成時の特別お祝い

【最後に】
${secretary.name}より:
「${userInfo.nickname}さんなら絶対に目標達成できます! 
私がずっとそばでサポートしますから、一緒に頑張りましょうね♪」

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `;
    },

    // 特別合宿モーダル
    showTrainingCampModal(schedule) {
        const modalHTML = `
            <div class="training-camp-modal" id="trainingCampModal">
                <div class="training-camp-content">
                    <button onclick="document.getElementById('trainingCampModal').remove()" class="close-btn">×</button>
                    <h2>🏕️ 秘書チーム特別合宿スケジュール</h2>
                    <p style="text-align: center; color: #666; margin-bottom: 2rem;">7日間、毎日異なる秘書があなたをサポートします!</p>
                    <div class="camp-schedule">
                        ${schedule.map(day => `
                            <div class="camp-day-card">
                                <div class="camp-day-header">
                                    <span class="camp-day-number">Day ${day.day}</span>
                                    <span class="camp-category">${day.category}</span>
                                </div>
                                <div class="camp-day-body">
                                    <img src="${day.secretary.imageUrl}" alt="${day.secretary.name}" style="width: 60px; height: 60px; border-radius: 50%;">
                                    <div>
                                        <strong>${day.secretary.name}</strong>
                                        <p style="font-size: 0.9rem; color: #666;">${day.message}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <p style="text-align: center; margin-top: 2rem; color: #ff6b9d; font-weight: bold;">
                        🎉 毎日ログインして特訓をクリアしよう!
                    </p>
                    <button onclick="document.getElementById('trainingCampModal').remove()" style="padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 1rem;">
                        合宿スタート!
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // 記念撮影モーダル
    async showPhotoSessionModal(secretaries) {
        const modalHTML = `
            <div class="photo-session-modal" id="photoSessionModal">
                <div class="photo-session-content">
                    <button onclick="document.getElementById('photoSessionModal').remove()" class="close-btn">×</button>
                    <h2>📸 秘書との記念撮影会</h2>
                    <p>好きな秘書を3人選んでください</p>
                    <div class="secretary-selection-grid">
                        ${secretaries.map(sec => `
                            <div class="secretary-select-card" onclick="SecretaryRewards.toggleSecretarySelection('${sec.id}', this)">
                                <img src="${sec.imageUrl}" alt="${sec.name}">
                                <p>${sec.name}</p>
                                <div class="selection-checkbox"></div>
                            </div>
                        `).join('')}
                    </div>
                    <button onclick="SecretaryRewards.generatePhoto()" id="generatePhotoBtn" disabled style="padding: 1rem 2rem; background: #ccc; color: white; border: none; border-radius: 10px; cursor: not-allowed; margin-top: 2rem;">
                        写真を撮影(3人選択してください)
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 選択状態を初期化
        this.selectedSecretaries = [];
    },

    // 秘書選択トグル
    toggleSecretarySelection(secretaryId, element) {
        const index = this.selectedSecretaries.indexOf(secretaryId);
        
        if (index > -1) {
            // 選択解除
            this.selectedSecretaries.splice(index, 1);
            element.classList.remove('selected');
        } else {
            // 選択
            if (this.selectedSecretaries.length >= 3) {
                alert('秘書は3人まで選択できます');
                return;
            }
            this.selectedSecretaries.push(secretaryId);
            element.classList.add('selected');
        }
        
        // ボタンの有効化/無効化
        const btn = document.getElementById('generatePhotoBtn');
        if (this.selectedSecretaries.length === 3) {
            btn.disabled = false;
            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            btn.style.cursor = 'pointer';
            btn.textContent = '写真を撮影する!';
        } else {
            btn.disabled = true;
            btn.style.background = '#ccc';
            btn.style.cursor = 'not-allowed';
            btn.textContent = `写真を撮影(あと${3 - this.selectedSecretaries.length}人選択)`;
        }
    },

    // 写真生成
    async generatePhoto() {
        const selectedSecs = this.selectedSecretaries.map(id => 
            SecretaryTeam.secretaries[id]
        );
        
        // 写真モーダルを閉じる
        document.getElementById('photoSessionModal').remove();
        
        // 記念写真を表示
        const photoHTML = `
            <div class="memorial-photo-modal" id="memorialPhotoModal">
                <div class="memorial-photo-content">
                    <button onclick="document.getElementById('memorialPhotoModal').remove()" class="close-btn">×</button>
                    <h2>📸 記念写真</h2>
                    <div class="memorial-photo-frame">
                        <div class="memorial-photo-images">
                            ${selectedSecs.map(sec => `
                                <img src="${sec.imageUrl}" alt="${sec.name}" style="width: 200px; height: 200px; border-radius: 50%; margin: 0 1rem;">
                            `).join('')}
                        </div>
                        <div class="memorial-photo-banner">
                            🎉 ${SecretarySystem.userInfo.nickname}さん、目標達成おめでとう! 🎉
                        </div>
                        <div class="memorial-photo-message">
                            ${selectedSecs.map(sec => sec.name).join('・')} より
                        </div>
                    </div>
                    <button onclick="SecretaryRewards.downloadPhoto()" style="padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 2rem;">
                        📥 写真をダウンロード
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', photoHTML);
    },

    // 写真ダウンロード(簡易版)
    downloadPhoto() {
        alert('写真のダウンロード機能は開発中です。スクリーンショットでご対応ください!');
    },

    // 手紙モーダル
    showLetterModal(secretary, letterContent) {
        const modalHTML = `
            <div class="letter-modal" id="letterModal">
                <div class="letter-content">
                    <button onclick="document.getElementById('letterModal').remove()" class="close-btn">×</button>
                    <div class="letter-paper">
                        <div class="letter-header">
                            <img src="${secretary.imageUrl}" alt="${secretary.name}" style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: 1rem;">
                            <h2>💌 ${secretary.name}からの手紙</h2>
                        </div>
                        <div class="letter-body">
                            <pre style="white-space: pre-wrap; font-family: 'Noto Serif JP', serif; line-height: 2; font-size: 1rem; color: #333;">${letterContent}</pre>
                        </div>
                        <div class="letter-signature">
                            <p style="text-align: right; font-style: italic; margin-top: 2rem;">
                                ${new Date().toLocaleDateString('ja-JP')}
                            </p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 2rem;">
                        <button onclick="SecretaryRewards.viewAllLetters()" style="padding: 0.75rem 1.5rem; background: #f0f0f0; color: #333; border: 1px solid #ccc; border-radius: 8px; cursor: pointer; margin-right: 1rem;">
                            📚 過去の手紙を見る
                        </button>
                        <button onclick="document.getElementById('letterModal').remove()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            大切に保存する
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // 全手紙表示
    viewAllLetters() {
        const savedLetters = JSON.parse(localStorage.getItem('secretary_letters') || '[]');
        
        if (savedLetters.length === 0) {
            alert('まだ手紙がありません。800ptで「秘書からの手紙」を購入してください!');
            return;
        }
        
        document.getElementById('letterModal')?.remove();
        
        const modalHTML = `
            <div class="all-letters-modal" id="allLettersModal">
                <div class="all-letters-content">
                    <button onclick="document.getElementById('allLettersModal').remove()" class="close-btn">×</button>
                    <h2>📚 秘書からの手紙コレクション</h2>
                    <div class="letters-grid">
                        ${savedLetters.map((letter, index) => `
                            <div class="letter-card" onclick="SecretaryRewards.showLetterDetail(${index})">
                                <h3>${letter.secretaryName}</h3>
                                <p class="letter-date">${letter.date}</p>
                                <p class="letter-preview">${letter.content.substring(0, 50)}...</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    // 手紙詳細表示
    showLetterDetail(index) {
        const savedLetters = JSON.parse(localStorage.getItem('secretary_letters') || '[]');
        const letter = savedLetters[index];
        
        if (!letter) return;
        
        document.getElementById('allLettersModal')?.remove();
        
        const sec = SecretaryTeam.secretaries[letter.secretaryId];
        this.showLetterModal(sec, letter.content);
    },

    // ========== 拡張版Tier 4専用UI関数 ==========
    
    // デート体験モーダル
    async showDateExperience(secretary, dateScenes) {
        for (let i = 0; i < dateScenes.length; i++) {
            const scene = dateScenes[i];
            const dialogue = scene.dialogue[secretary.id] || scene.dialogue.sakura;
            
            // シーンモーダル表示
            const sceneHTML = `
                <div class="date-scene-modal" id="dateSceneModal${i}">
                    <div class="date-scene-content" style="background: ${scene.background};">
                        <div class="date-scene-header">
                            <h2>${scene.icon} ${scene.scene}</h2>
                            <p class="date-scene-number">シーン ${i + 1} / 3</p>
                        </div>
                        <div class="date-scene-body">
                            <img src="${secretary.imageUrl}" alt="${secretary.name}" class="date-secretary-avatar">
                            <div class="date-dialogue-box">
                                <h3>${secretary.name}</h3>
                                <p class="date-dialogue">${dialogue}</p>
                            </div>
                        </div>
                        <button onclick="document.getElementById('dateSceneModal${i}').remove(); ${i === dateScenes.length - 1 ? 'SecretaryRewards.showDateEnding(\'' + secretary.id + '\');' : ''}" 
                                class="date-next-btn">
                            ${i === dateScenes.length - 1 ? '💕 デート終了' : '次のシーンへ →'}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', sceneHTML);
            
            // 次のシーンまで待機
            if (i < dateScenes.length - 1) {
                await new Promise(resolve => {
                    const checkModal = setInterval(() => {
                        if (!document.getElementById(`dateSceneModal${i}`)) {
                            clearInterval(checkModal);
                            resolve();
                        }
                    }, 100);
                });
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
    },

    // デートエンディング
    showDateEnding(secretaryId) {
        const sec = SecretaryTeam.secretaries[secretaryId];
        if (!sec) return;
        
        const endingHTML = `
            <div class="date-ending-modal" id="dateEndingModal">
                <div class="date-ending-content">
                    <h1 style="font-size: 3rem; color: #ff6b9d; margin-bottom: 2rem;">💕 素敵なデートでした</h1>
                    <img src="${sec.imageUrl}" alt="${sec.name}" style="width: 200px; height: 200px; border-radius: 50%; border: 5px solid #ff6b9d; margin-bottom: 2rem; animation: pulse 2s infinite;">
                    <div class="date-ending-message">
                        <p style="font-size: 1.3rem; line-height: 2; color: #333;">
                            ${sec.name}「${SecretarySystem.userInfo.nickname}さん、今日は本当に楽しかったです。<br>
                            またこんな素敵な時間を過ごせたら嬉しいです。<br>
                            これからも、ずっとあなたのそばにいますね♪」
                        </p>
                    </div>
                    <div class="date-stats" style="margin-top: 2rem; padding: 1.5rem; background: #f9f9f9; border-radius: 15px;">
                        <h3 style="margin-bottom: 1rem;">💖 デート記録</h3>
                        <p>📍 訪問場所: カフェ → 公園 → 夜景スポット</p>
                        <p>⏱️ デート時間: 約3時間(仮想)</p>
                        <p>💕 絆レベル: <strong style="color: #ff6b9d;">最高レベル</strong></p>
                    </div>
                    <button onclick="document.getElementById('dateEndingModal').remove()" style="padding: 1rem 2rem; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1.2rem; margin-top: 2rem;">
                        思い出を胸にしまう
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', endingHTML);
    },

    // 誕生日パーティーモーダル
    async showBirthdayParty(secretary, birthday, message, presents) {
        const modalHTML = `
            <div class="birthday-party-modal" id="birthdayPartyModal">
                <div class="birthday-party-content">
                    <button onclick="document.getElementById('birthdayPartyModal').remove()" class="close-btn">×</button>
                    
                    <!-- 誕生日ヘッダー -->
                    <div class="birthday-header">
                        <h1 style="font-size: 3rem; color: #ff6b9d; animation: bounce 1s infinite;">🎂 Happy Birthday!</h1>
                        <h2 style="color: #333; margin: 1rem 0;">${secretary.name} (${birthday.age}歳)</h2>
                        <p style="font-size: 1.2rem; color: #666;">${birthday.month}月${birthday.day}日</p>
                    </div>
                    
                    <!-- 秘書画像 -->
                    <div class="birthday-avatar-section">
                        <img src="${secretary.imageUrl}" alt="${secretary.name}" class="birthday-avatar">
                        <div class="birthday-confetti">🎉🎊✨🎈🎁</div>
                    </div>
                    
                    <!-- 誕生日メッセージ -->
                    <div class="birthday-message-box">
                        <p class="birthday-dialogue">${message}</p>
                    </div>
                    
                    <!-- プレゼント選択 -->
                    <div class="birthday-presents">
                        <h3 style="margin-bottom: 1rem;">🎁 プレゼントを選んでください</h3>
                        <div class="present-grid">
                            ${presents.map((present, index) => `
                                <div class="present-card" onclick="SecretaryRewards.selectBirthdayPresent('${secretary.id}', ${index}, '${present.name}')">
                                    <div class="present-icon">${present.icon}</div>
                                    <h4>${present.name}</h4>
                                    <p class="present-message">${present.message}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- バースデーソング再生ボタン -->
                    <button onclick="SecretaryRewards.playBirthdaySong()" style="padding: 1rem 2rem; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 2rem; font-size: 1.1rem;">
                        🎵 バースデーソングを歌う
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 紙吹雪アニメーション
        this.createBirthdayConfetti();
    },

    // 誕生日紙吹雪
    createBirthdayConfetti() {
        const modal = document.getElementById('birthdayPartyModal');
        if (!modal) return;
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = ['🎉', '🎊', '🎈', '🎁', '✨', '⭐', '💖'][Math.floor(Math.random() * 7)];
            confetti.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: ${1 + Math.random() * 2}rem;
                animation: confetti-fall ${3 + Math.random() * 3}s linear forwards;
                animation-delay: ${Math.random() * 2}s;
                pointer-events: none;
                z-index: 10001;
            `;
            modal.appendChild(confetti);
        }
    },

    // プレゼント選択
    selectBirthdayPresent(secretaryId, presentIndex, presentName) {
        const sec = SecretaryTeam.secretaries[secretaryId];
        if (!sec) return;
        
        const reactions = {
            sakura: `「わぁ! ${presentName}、ありがとうございます! ${SecretarySystem.userInfo.nickname}さんの気持ち、とっても嬉しいです♪」`,
            reina: `「${presentName}ですか。実用的で素晴らしい選択です。${SecretarySystem.userInfo.nickname}さんのセンスに感謝します」`,
            rio: `「${presentName}! 超嬉しい~!! ${SecretarySystem.userInfo.nickname}さん、ありがとう! 大事に使うね♪」`,
            mio: `「${presentName}…ありがとうございます。${SecretarySystem.userInfo.nickname}さんの優しさが伝わります」`
        };
        
        alert(reactions[secretaryId] || reactions.sakura);
        
        // プレゼント記録を保存
        const presentRecords = JSON.parse(localStorage.getItem('birthday_present_records') || '[]');
        presentRecords.push({
            secretaryId: secretaryId,
            presentName: presentName,
            date: new Date().toLocaleDateString('ja-JP'),
            timestamp: Date.now()
        });
        localStorage.setItem('birthday_present_records', JSON.stringify(presentRecords));
    },

    // バースデーソング
    playBirthdaySong() {
        alert('🎵 ハッピーバースデー トゥー ユー ♪\n(BGM機能は今後実装予定です)');
    },

    // 約束リングセレモニー
    async showPromiseRingCeremony(secretary, message, promises) {
        const modalHTML = `
            <div class="promise-ring-modal" id="promiseRingModal">
                <div class="promise-ring-content">
                    <button onclick="document.getElementById('promiseRingModal').remove()" class="close-btn">×</button>
                    
                    <!-- リングヘッダー -->
                    <div class="ring-header">
                        <h1 style="font-size: 3rem; color: #ffd700; text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); animation: pulse 2s infinite;">💍</h1>
                        <h2 style="color: #333; margin: 1rem 0;">永遠の約束</h2>
                        <p style="color: #666; font-style: italic;">~ Promise Ring Ceremony ~</p>
                    </div>
                    
                    <!-- 秘書画像(特別エフェクト) -->
                    <div class="ring-avatar-section">
                        <div class="ring-aura"></div>
                        <img src="${secretary.imageUrl}" alt="${secretary.name}" class="ring-avatar">
                        <div class="ring-sparkles">✨✨✨</div>
                    </div>
                    
                    <!-- 約束のメッセージ -->
                    <div class="ring-message-box">
                        <h3 style="color: #ff6b9d; margin-bottom: 1rem;">${secretary.name}からの言葉</h3>
                        <p class="ring-dialogue">${message}</p>
                    </div>
                    
                    <!-- 約束の効果 -->
                    <div class="ring-promises">
                        <h3 style="margin-bottom: 1.5rem; color: #ffd700;">💎 約束のリング特典</h3>
                        <div class="promise-list">
                            ${promises.map(promise => `
                                <div class="promise-item">
                                    <span>${promise}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- VIPバッジ -->
                    <div class="vip-badge">
                        <div class="badge-shine"></div>
                        <p style="font-size: 1.5rem; font-weight: bold; color: #ffd700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);">
                            👑 VIP ${secretary.name}パートナー 👑
                        </p>
                    </div>
                    
                    <button onclick="SecretaryRewards.completeRingCeremony('${secretary.id}')" style="padding: 1.5rem 3rem; background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); color: #333; border: none; border-radius: 15px; cursor: pointer; font-size: 1.3rem; font-weight: bold; margin-top: 2rem; box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);">
                        💍 約束を交わす
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 特殊エフェクト
        this.createRingSparkles();
    },

    // リングキラキラエフェクト
    createRingSparkles() {
        const modal = document.getElementById('promiseRingModal');
        if (!modal) return;
        
        setInterval(() => {
            for (let i = 0; i < 5; i++) {
                const sparkle = document.createElement('div');
                sparkle.textContent = '✨';
                sparkle.style.cssText = `
                    position: absolute;
                    top: ${Math.random() * 100}%;
                    left: ${Math.random() * 100}%;
                    font-size: ${1 + Math.random() * 2}rem;
                    animation: sparkle-float 2s ease-out forwards;
                    pointer-events: none;
                    z-index: 10001;
                `;
                modal.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 2000);
            }
        }, 500);
    },

    // セレモニー完了
    completeRingCeremony(secretaryId) {
        const sec = SecretaryTeam.secretaries[secretaryId];
        if (!sec) return;
        
        document.getElementById('promiseRingModal')?.remove();
        
        // 完了メッセージ
        const completeHTML = `
            <div class="ring-complete-modal" id="ringCompleteModal">
                <div class="ring-complete-content">
                    <h1 style="font-size: 3rem; color: #ffd700; margin-bottom: 2rem; animation: zoom-in 1s;">🎉 約束が成立しました! 🎉</h1>
                    <p style="font-size: 1.5rem; line-height: 2; color: #333; margin-bottom: 2rem;">
                        あなたと${sec.name}は、<br>
                        特別な絆で結ばれました。<br>
                        これからも、ずっと一緒です。
                    </p>
                    <div class="ring-badge-display">
                        <div class="golden-ring">💍</div>
                        <p style="font-size: 1.2rem; color: #ffd700; font-weight: bold; margin-top: 1rem;">
                            VIP ${sec.name}パートナー認定
                        </p>
                    </div>
                    <button onclick="document.getElementById('ringCompleteModal').remove()" style="padding: 1rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; cursor: pointer; margin-top: 2rem; font-size: 1.1rem;">
                        永遠の絆を胸に
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', completeHTML);
        
        // 大量の紙吹雪
        this.createMassiveConfetti();
    },

    // 大量紙吹雪
    createMassiveConfetti() {
        const modal = document.getElementById('ringCompleteModal');
        if (!modal) return;
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.textContent = ['💍', '💖', '✨', '⭐', '👑', '💎'][Math.floor(Math.random() * 6)];
            confetti.style.cssText = `
                position: absolute;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: ${1 + Math.random() * 2}rem;
                animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
                animation-delay: ${Math.random() * 1}s;
                pointer-events: none;
                z-index: 10001;
            `;
            modal.appendChild(confetti);
        }
    }
};

// CSSアニメーション追加
const rewardStyles = document.createElement('style');
rewardStyles.textContent = `
    @keyframes sparkle-float {
        0% { opacity: 0; transform: translateY(0) scale(0); }
        50% { opacity: 1; transform: translateY(-30px) scale(1); }
        100% { opacity: 0; transform: translateY(-60px) scale(0); }
    }
    
    @keyframes confetti-fall {
        to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    @keyframes zoom-in {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    .reward-shop-modal, .story-modal, .all-cheer-modal, .meeting-report-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .reward-shop-content, .story-content, .all-cheer-content, .meeting-report-content {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        max-width: 900px;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }
    
    .reward-grid, .cheer-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .reward-card, .cheer-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.5rem;
        border-radius: 15px;
        text-align: center;
        transition: transform 0.3s;
    }
    
    .reward-card:hover {
        transform: translateY(-5px);
    }
    
    .reward-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }
    
    .reward-buy-btn {
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .reward-buy-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    
    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1rem;
        font-size: 2rem;
        background: none;
        border: none;
        cursor: pointer;
        color: #999;
    }
    
    /* ========== Tier 4専用スタイル ========== */
    
    /* カウンセリングモーダル */
    .counseling-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .counseling-content {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 3rem;
        border-radius: 20px;
        max-width: 800px;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .counseling-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .counseling-body {
        background: white;
        padding: 2rem;
        border-radius: 15px;
    }
    
    /* 特別合宿モーダル */
    .training-camp-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .training-camp-content {
        background: white;
        padding: 3rem;
        border-radius: 20px;
        max-width: 900px;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
    }
    
    .camp-schedule {
        display: grid;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .camp-day-card {
        background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    
    .camp-day-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
    }
    
    .camp-day-number {
        font-weight: bold;
        font-size: 1.2rem;
        color: #d63031;
    }
    
    .camp-category {
        background: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.9rem;
        color: #666;
    }
    
    .camp-day-body {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    /* 記念撮影モーダル */
    .photo-session-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .photo-session-content {
        background: white;
        padding: 3rem;
        border-radius: 20px;
        max-width: 900px;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
        text-align: center;
    }
    
    .secretary-selection-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }
    
    .secretary-select-card {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1rem;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
    }
    
    .secretary-select-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .secretary-select-card.selected {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    
    .secretary-select-card img {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-bottom: 0.5rem;
    }
    
    .selection-checkbox {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 25px;
        height: 25px;
        border: 2px solid #999;
        border-radius: 50%;
        background: white;
    }
    
    .secretary-select-card.selected .selection-checkbox {
        background: #4cd964;
        border-color: #4cd964;
    }
    
    .secretary-select-card.selected .selection-checkbox::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        font-size: 1.2rem;
    }
    
    /* 記念写真フレーム */
    .memorial-photo-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .memorial-photo-content {
        background: white;
        padding: 3rem;
        border-radius: 20px;
        text-align: center;
    }
    
    .memorial-photo-frame {
        background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        padding: 3rem;
        border-radius: 20px;
        border: 10px solid #d63031;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .memorial-photo-images {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 2rem;
    }
    
    .memorial-photo-banner {
        background: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        font-size: 1.5rem;
        font-weight: bold;
        color: #d63031;
        margin-bottom: 1rem;
    }
    
    .memorial-photo-message {
        font-size: 1.2rem;
        color: #666;
        font-style: italic;
    }
    
    /* 手紙モーダル */
    .letter-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .letter-content {
        background: white;
        padding: 3rem;
        border-radius: 20px;
        max-width: 800px;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
    }
    
    .letter-paper {
        background: linear-gradient(135deg, #fff8dc 0%, #faebd7 100%);
        padding: 3rem;
        border-radius: 15px;
        border: 3px solid #d4af37;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        font-family: 'Noto Serif JP', serif;
    }
    
    .letter-header {
        text-align: center;
        border-bottom: 2px solid #d4af37;
        padding-bottom: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .letter-body {
        margin-top: 2rem;
    }
    
    .letter-signature {
        margin-top: 2rem;
        border-top: 1px solid #d4af37;
        padding-top: 1rem;
    }
    
    /* 全手紙コレクション */
    .all-letters-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.3s;
    }
    
    .all-letters-content {
        background: white;
        padding: 3rem;
        border-radius: 20px;
        max-width: 900px;
        max-height: 85vh;
        overflow-y: auto;
        position: relative;
    }
    
    .letters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    
    .letter-card {
        background: linear-gradient(135deg, #fff8dc 0%, #faebd7 100%);
        padding: 1.5rem;
        border-radius: 15px;
        border: 2px solid #d4af37;
        cursor: pointer;
        transition: transform 0.3s;
    }
    
    .letter-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .letter-card h3 {
        margin-bottom: 0.5rem;
        color: #d63031;
    }
    
    .letter-date {
        font-size: 0.9rem;
        color: #999;
        margin-bottom: 1rem;
    }
    
    .letter-preview {
        color: #666;
        line-height: 1.6;
    }
    
    /* レスポンシブ対応 */
    @media (max-width: 768px) {
        .counseling-content,
        .training-camp-content,
        .photo-session-content,
        .memorial-photo-content,
        .letter-content,
        .all-letters-content {
            padding: 1.5rem;
            max-width: 95%;
        }
        
        .secretary-selection-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1rem;
        }
        
        .memorial-photo-frame {
            padding: 1.5rem;
        }
        
        .memorial-photo-images img {
            width: 100px !important;
            height: 100px !important;
            margin: 0 0.5rem !important;
        }
        
        .memorial-photo-banner {
            font-size: 1rem;
            padding: 0.75rem 1rem;
        }
        
        .letter-paper {
            padding: 1.5rem;
        }
    }
    
    /* ========== 拡張版Tier 4スタイル ========== */
    
    /* デート体験モーダル */
    .date-scene-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.5s;
    }
    
    .date-scene-content {
        padding: 3rem;
        border-radius: 25px;
        max-width: 700px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        position: relative;
    }
    
    .date-scene-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .date-scene-header h2 {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 0.5rem;
    }
    
    .date-scene-number {
        font-size: 1rem;
        color: #666;
    }
    
    .date-scene-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
    }
    
    .date-secretary-avatar {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 5px solid #ff6b9d;
        box-shadow: 0 10px 40px rgba(255, 107, 157, 0.3);
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .date-dialogue-box {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        width: 100%;
    }
    
    .date-dialogue-box h3 {
        color: #ff6b9d;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .date-dialogue {
        font-size: 1.1rem;
        line-height: 1.8;
        color: #333;
    }
    
    .date-next-btn {
        padding: 1rem 2.5rem;
        background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
        color: white;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        font-size: 1.2rem;
        font-weight: bold;
        margin-top: 2rem;
        box-shadow: 0 10px 30px rgba(255, 107, 157, 0.3);
        transition: transform 0.3s;
    }
    
    .date-next-btn:hover {
        transform: translateY(-3px);
    }
    
    /* デートエンディング */
    .date-ending-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fade-in 0.5s;
    }
    
    .date-ending-content {
        background: linear-gradient(135deg, #fff5f7 0%, #ffe5ec 100%);
        padding: 4rem;
        border-radius: 30px;
        max-width: 700px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(255, 107, 157, 0.4);
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .date-stats {
        text-align: left;
    }
    
    /* 誕生日パーティーモーダル */
    .birthday-party-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.5s;
    }
    
    .birthday-party-content {
        background: linear-gradient(135deg, #fff0f6 0%, #ffe4ec 100%);
        padding: 3rem;
        border-radius: 25px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 20px 60px rgba(255, 107, 157, 0.4);
    }
    
    .birthday-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .birthday-avatar-section {
        text-align: center;
        position: relative;
        margin: 2rem 0;
    }
    
    .birthday-avatar {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 5px solid #ff6b9d;
        box-shadow: 0 0 50px rgba(255, 107, 157, 0.5);
        animation: pulse 2s infinite;
    }
    
    .birthday-confetti {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2rem;
        animation: bounce 1s infinite;
    }
    
    .birthday-message-box {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        margin: 2rem 0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .birthday-dialogue {
        font-size: 1.1rem;
        line-height: 2;
        color: #333;
    }
    
    .birthday-presents {
        margin-top: 2rem;
    }
    
    .present-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .present-card {
        background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        padding: 1.5rem;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
    }
    
    .present-card:hover {
        transform: translateY(-10px) scale(1.05);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }
    
    .present-icon {
        font-size: 3rem;
        margin-bottom: 0.5rem;
    }
    
    .present-card h4 {
        color: white;
        margin-bottom: 0.5rem;
    }
    
    .present-message {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
    }
    
    /* 約束リングモーダル */
    .promise-ring-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(0, 0, 0, 0.95) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fade-in 0.5s;
    }
    
    .promise-ring-content {
        background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
        padding: 3rem;
        border-radius: 30px;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 0 80px rgba(255, 215, 0, 0.6), 0 20px 60px rgba(0, 0, 0, 0.3);
        border: 3px solid #ffd700;
    }
    
    .ring-header {
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .ring-avatar-section {
        text-align: center;
        position: relative;
        margin: 2rem 0;
    }
    
    .ring-aura {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 250px;
        height: 250px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
        animation: pulse 3s infinite;
    }
    
    .ring-avatar {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border: 5px solid #ffd700;
        box-shadow: 0 0 60px rgba(255, 215, 0, 0.8);
        position: relative;
        z-index: 10;
        animation: float 4s ease-in-out infinite;
    }
    
    .ring-sparkles {
        position: absolute;
        top: -20px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2rem;
        animation: sparkle-rotate 3s linear infinite;
    }
    
    @keyframes sparkle-rotate {
        from { transform: translateX(-50%) rotate(0deg); }
        to { transform: translateX(-50%) rotate(360deg); }
    }
    
    .ring-message-box {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        margin: 2rem 0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        border-left: 5px solid #ffd700;
    }
    
    .ring-dialogue {
        font-size: 1.1rem;
        line-height: 2;
        color: #333;
    }
    
    .ring-promises {
        background: linear-gradient(135deg, #fff9e6 0%, #ffedcc 100%);
        padding: 2rem;
        border-radius: 20px;
        margin: 2rem 0;
        border: 2px solid #ffd700;
    }
    
    .promise-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .promise-item {
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        font-size: 1.05rem;
        color: #333;
        border-left: 4px solid #ffd700;
    }
    
    .vip-badge {
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        padding: 1.5rem;
        border-radius: 15px;
        margin: 2rem 0;
        position: relative;
        overflow: hidden;
        box-shadow: 0 10px 40px rgba(255, 215, 0, 0.4);
    }
    
    .badge-shine {
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
        animation: shine 3s infinite;
    }
    
    @keyframes shine {
        to { left: 200%; }
    }
    
    /* リング完了モーダル */
    .ring-complete-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fade-in 0.5s;
    }
    
    .ring-complete-content {
        background: linear-gradient(135deg, #fffbf0 0%, #fff8e1 100%);
        padding: 4rem;
        border-radius: 30px;
        max-width: 600px;
        text-align: center;
        box-shadow: 0 0 100px rgba(255, 215, 0, 0.8);
        border: 5px solid #ffd700;
    }
    
    .ring-badge-display {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        margin: 2rem 0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }
    
    .golden-ring {
        font-size: 5rem;
        animation: pulse 2s infinite;
    }
    
    /* レスポンシブ対応(拡張版) */
    @media (max-width: 768px) {
        .date-scene-content,
        .date-ending-content,
        .birthday-party-content,
        .promise-ring-content,
        .ring-complete-content {
            padding: 2rem;
            max-width: 95%;
        }
        
        .date-secretary-avatar,
        .birthday-avatar,
        .ring-avatar {
            width: 150px;
            height: 150px;
        }
        
        .date-dialogue-box h3 {
            font-size: 1.2rem;
        }
        
        .date-dialogue,
        .birthday-dialogue,
        .ring-dialogue {
            font-size: 1rem;
        }
        
        .present-grid {
            grid-template-columns: 1fr;
        }
        
        .promise-item {
            font-size: 0.95rem;
            padding: 0.75rem 1rem;
        }
        
        .golden-ring {
            font-size: 3rem;
        }
    }
`;
document.head.appendChild(rewardStyles);

// グローバルにエクスポート
window.SecretaryRewards = SecretaryRewards;

console.log('✅ SecretaryRewards(秘書連動型・拡張版) initialized');
