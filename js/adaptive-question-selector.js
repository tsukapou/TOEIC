/**
 * 🎯 Adaptive Question Selector
 * アダプティブ問題選択アルゴリズム
 * 
 * 【機能】
 * 1. 学習者プロファイルに基づく最適な問題選択
 * 2. 難易度の動的調整
 * 3. 弱点補強と得意分野の維持のバランス
 * 4. 復習タイミングの最適化
 * 
 * 【アルゴリズム】
 * - 弱点カテゴリ: 60%の出題比率
 * - 中間カテゴリ: 30%の出題比率
 * - 得意カテゴリ: 10%の出題比率（維持目的）
 * 
 * 実装日: 2025-12-09
 */

const AdaptiveQuestionSelector = {
    /**
     * アダプティブテスト用の問題セットを生成
     * @param {number} questionCount - 問題数（デフォルト: 30）
     * @returns {Array} 選択された問題の配列
     */
    selectQuestions: function(questionCount = 30) {
        console.log(`🎯 アダプティブ問題選択開始（${questionCount}問）...`);
        
        // 学習者プロファイルを取得
        const profile = AdaptiveLearningEngine.getProfile();
        
        // 全問題を取得
        const allQuestions = this.getAllQuestions();
        if (allQuestions.length === 0) {
            console.error('❌ 問題データが読み込まれていません');
            return [];
        }
        
        console.log(`  利用可能な問題数: ${allQuestions.length}問`);
        
        // カテゴリ別に問題を分類
        const questionsByCategory = this.categorizeQuestions(allQuestions);
        
        // 学習者の弱点・中間・得意カテゴリを特定
        const categoryAnalysis = this.analyzeCategoryStrength(profile);
        
        console.log('📊 カテゴリ分析結果:');
        console.log(`  弱点: ${categoryAnalysis.weak.map(c => c.category).join(', ')}`);
        console.log(`  中間: ${categoryAnalysis.medium.map(c => c.category).join(', ')}`);
        console.log(`  得意: ${categoryAnalysis.strong.map(c => c.category).join(', ')}`);
        
        // 問題を選択（弱点60%, 中間30%, 得意10%）
        const selectedQuestions = this.selectBalancedQuestions(
            questionsByCategory,
            categoryAnalysis,
            questionCount,
            profile
        );
        
        // 難易度順にソート（易→難）して学習効果を最大化
        const sortedQuestions = this.sortByDifficulty(selectedQuestions, profile);
        
        console.log(`✅ アダプティブ問題選択完了: ${sortedQuestions.length}問`);
        this.logSelectionSummary(sortedQuestions);
        
        return sortedQuestions;
    },

    /**
     * 全問題を取得
     */
    getAllQuestions: function() {
        if (typeof QUESTIONS_DATABASE !== 'undefined' && QUESTIONS_DATABASE.allQuestions) {
            return QUESTIONS_DATABASE.allQuestions;
        }
        
        // フォールバック: window.AppStateから取得
        if (typeof window !== 'undefined' && window.AppState && window.AppState.allQuestions) {
            return window.AppState.allQuestions;
        }
        
        console.error('❌ QUESTIONS_DATABASEが見つかりません');
        return [];
    },

    /**
     * 問題をカテゴリ別に分類
     */
    categorizeQuestions: function(questions) {
        const categorized = {
            '品詞問題': [],
            '動詞問題': [],
            '前置詞問題': [],
            '接続詞問題': [],
            '代名詞問題': [],
            '関係詞問題': [],
            '数量詞問題': [],
            '語彙問題': []
        };
        
        questions.forEach(q => {
            const category = AdaptiveLearningEngine.mapQuestionTypeToCategory(q.questionType);
            if (categorized[category]) {
                categorized[category].push(q);
            }
        });
        
        return categorized;
    },

    /**
     * カテゴリの強度を分析
     */
    analyzeCategoryStrength: function(profile) {
        const categories = Object.entries(profile.categoryMastery)
            .map(([category, mastery]) => ({
                category,
                score: mastery.score,
                confidence: mastery.confidence,
                attempts: mastery.attempts
            }))
            .filter(c => c.attempts >= 3 || c.attempts === 0); // 経験あるカテゴリ or 未経験
        
        // スコアで分類
        const weak = categories.filter(c => c.score < 60).sort((a, b) => a.score - b.score);
        const medium = categories.filter(c => c.score >= 60 && c.score < 75).sort((a, b) => a.score - b.score);
        const strong = categories.filter(c => c.score >= 75).sort((a, b) => b.score - a.score);
        
        // 未経験カテゴリは中間として扱う
        const inexperienced = Object.keys(profile.categoryMastery)
            .filter(cat => profile.categoryMastery[cat].attempts === 0)
            .map(cat => ({ category: cat, score: 50, confidence: 0, attempts: 0 }));
        
        return {
            weak: weak.length > 0 ? weak : inexperienced.slice(0, 2),
            medium: medium.length > 0 ? medium : inexperienced,
            strong
        };
    },

    /**
     * バランスの取れた問題選択
     */
    selectBalancedQuestions: function(questionsByCategory, categoryAnalysis, totalCount, profile) {
        const selected = [];
        
        // 出題比率
        const weakCount = Math.ceil(totalCount * 0.6); // 60%
        const mediumCount = Math.ceil(totalCount * 0.3); // 30%
        const strongCount = totalCount - weakCount - mediumCount; // 残り（約10%）
        
        console.log(`📊 出題比率: 弱点${weakCount}問, 中間${mediumCount}問, 得意${strongCount}問`);
        
        // 1. 弱点カテゴリから選択（最優先）
        this.selectFromCategories(
            selected,
            questionsByCategory,
            categoryAnalysis.weak,
            weakCount,
            profile,
            'weak'
        );
        
        // 2. 中間カテゴリから選択
        this.selectFromCategories(
            selected,
            questionsByCategory,
            categoryAnalysis.medium,
            mediumCount,
            profile,
            'medium'
        );
        
        // 3. 得意カテゴリから選択（維持目的）
        this.selectFromCategories(
            selected,
            questionsByCategory,
            categoryAnalysis.strong,
            strongCount,
            profile,
            'strong'
        );
        
        // 不足分を補充
        if (selected.length < totalCount) {
            const remaining = totalCount - selected.length;
            console.log(`⚠️ 問題が不足しています。ランダムに${remaining}問追加...`);
            const allAvailable = Object.values(questionsByCategory).flat();
            const unused = allAvailable.filter(q => !selected.some(s => s.id === q.id));
            const additional = this.shuffleArray(unused).slice(0, remaining);
            selected.push(...additional);
        }
        
        return selected;
    },

    /**
     * 指定カテゴリから問題を選択
     */
    selectFromCategories: function(selected, questionsByCategory, categories, count, profile, strengthLevel) {
        if (categories.length === 0 || count === 0) return;
        
        const questionsPerCategory = Math.ceil(count / categories.length);
        
        categories.forEach(catInfo => {
            const categoryQuestions = questionsByCategory[catInfo.category] || [];
            if (categoryQuestions.length === 0) return;
            
            // 難易度を選択
            const targetDifficulty = this.selectTargetDifficulty(profile, strengthLevel);
            
            // 難易度でフィルタリング
            let filtered = categoryQuestions.filter(q => q.difficulty === targetDifficulty);
            
            // 該当難易度がない場合は全問題から選択
            if (filtered.length === 0) {
                filtered = categoryQuestions;
            }
            
            // 既に選択済みの問題を除外
            const available = filtered.filter(q => !selected.some(s => s.id === q.id));
            
            // ランダムに選択
            const sampled = this.shuffleArray(available).slice(0, questionsPerCategory);
            selected.push(...sampled);
        });
    },

    /**
     * 目標難易度を選択
     */
    selectTargetDifficulty: function(profile, strengthLevel) {
        const level = profile.level;
        
        // 弱点カテゴリ: やや易しめ
        if (strengthLevel === 'weak') {
            if (level === 'beginner') return '基礎';
            if (level === 'intermediate') return '基礎'; // 基礎を固める
            if (level === 'advanced') return '中級';
            return '中級';
        }
        
        // 中間カテゴリ: レベル相応
        if (strengthLevel === 'medium') {
            if (level === 'beginner') return '基礎';
            if (level === 'intermediate') return '中級';
            if (level === 'advanced') return '中級';
            return '上級';
        }
        
        // 得意カテゴリ: やや難しめ（維持とチャレンジ）
        if (level === 'beginner') return '中級';
        if (level === 'intermediate') return '上級';
        return '上級';
    },

    /**
     * 難易度順にソート（易→難）
     */
    sortByDifficulty: function(questions, profile) {
        const difficultyOrder = { '基礎': 1, '中級': 2, '上級': 3 };
        
        // 基本的に難易度順
        const sorted = questions.sort((a, b) => {
            const orderA = difficultyOrder[a.difficulty] || 2;
            const orderB = difficultyOrder[b.difficulty] || 2;
            return orderA - orderB;
        });
        
        // ただし、単調にならないよう、難易度内でカテゴリをミックス
        return this.mixCategories(sorted);
    },

    /**
     * カテゴリをミックス（同じカテゴリが連続しないように）
     */
    mixCategories: function(questions) {
        const mixed = [];
        const byDifficulty = {
            '基礎': [],
            '中級': [],
            '上級': []
        };
        
        // 難易度別に分類
        questions.forEach(q => {
            const diff = q.difficulty || '中級';
            if (byDifficulty[diff]) {
                byDifficulty[diff].push(q);
            }
        });
        
        // 各難易度内でシャッフル
        Object.keys(byDifficulty).forEach(diff => {
            byDifficulty[diff] = this.shuffleArray(byDifficulty[diff]);
        });
        
        // 順番に追加
        mixed.push(...byDifficulty['基礎']);
        mixed.push(...byDifficulty['中級']);
        mixed.push(...byDifficulty['上級']);
        
        return mixed;
    },

    /**
     * 配列をシャッフル（Fisher-Yatesアルゴリズム）
     */
    shuffleArray: function(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    /**
     * 選択結果のサマリーをログ
     */
    logSelectionSummary: function(questions) {
        const categoryCount = {};
        const difficultyCount = { '基礎': 0, '中級': 0, '上級': 0 };
        
        questions.forEach(q => {
            const category = AdaptiveLearningEngine.mapQuestionTypeToCategory(q.questionType);
            categoryCount[category] = (categoryCount[category] || 0) + 1;
            
            const diff = q.difficulty || '中級';
            difficultyCount[diff]++;
        });
        
        console.log('📊 選択サマリー:');
        console.log('  カテゴリ別:', categoryCount);
        console.log('  難易度別:', difficultyCount);
    },

    /**
     * クイック選択（簡易版）
     * @param {number} count - 問題数
     * @returns {Array} 選択された問題
     */
    quickSelect: function(count = 30) {
        const profile = AdaptiveLearningEngine.getProfile();
        
        // 初回ユーザーまたは履歴が少ない場合
        if (profile.history.length < 3) {
            console.log('🆕 初回ユーザー向けの問題選択');
            return this.selectForNewUser(count);
        }
        
        // 通常のアダプティブ選択
        return this.selectQuestions(count);
    },

    /**
     * 初回ユーザー向けの問題選択
     */
    selectForNewUser: function(count) {
        const allQuestions = this.getAllQuestions();
        if (allQuestions.length === 0) return [];
        
        // 基礎70%, 中級30%の配分
        const basicCount = Math.ceil(count * 0.7);
        const intermediateCount = count - basicCount;
        
        const basicQuestions = allQuestions.filter(q => q.difficulty === '基礎');
        const intermediateQuestions = allQuestions.filter(q => q.difficulty === '中級');
        
        const selected = [
            ...this.shuffleArray(basicQuestions).slice(0, basicCount),
            ...this.shuffleArray(intermediateQuestions).slice(0, intermediateCount)
        ];
        
        console.log(`🆕 初回ユーザー: 基礎${basicCount}問, 中級${intermediateCount}問`);
        
        return this.shuffleArray(selected);
    }
};

// グローバルに公開
if (typeof window !== 'undefined') {
    window.AdaptiveQuestionSelector = AdaptiveQuestionSelector;
}
