// TOEIC PART5 学習サポート - 解法パターン暗記システム
// 頻出パターンをフラッシュカードで効率的に暗記

const PatternMemorization = {
  STORAGE_KEY: 'toeic_pattern_memorization',
  
  // 解法パターン定義
  patterns: [
    {
      id: 'pattern_001',
      category: '品詞問題',
      title: '助動詞の後ろは必ず動詞の原形',
      example: 'will attend / can speak / must complete',
      explanation: '助動詞（will, can, must, should等）の後ろには必ず動詞の原形が来ます',
      tips: '助動詞を見たら、その後ろの動詞の形をチェック！',
      frequency: 'very_high',
      difficulty: 'easy'
    },
    {
      id: 'pattern_002',
      category: '品詞問題',
      title: '冠詞（a/an/the）の後ろは名詞',
      example: 'a meeting / an employee / the document',
      explanation: '冠詞の後ろには必ず名詞が来ます。形容詞がある場合は「冠詞→形容詞→名詞」の語順',
      tips: '冠詞を見たら、名詞を探せ！',
      frequency: 'very_high',
      difficulty: 'easy'
    },
    {
      id: 'pattern_003',
      category: '品詞問題',
      title: '前置詞の後ろは名詞・動名詞',
      example: 'for attending / by completing / without permission',
      explanation: '前置詞の後ろには名詞または動名詞（-ing形）が来ます',
      tips: '前置詞の後ろに動詞が来たら、必ず-ing形に！',
      frequency: 'very_high',
      difficulty: 'medium'
    },
    {
      id: 'pattern_004',
      category: '動詞問題',
      title: 'have/has + 過去分詞 = 現在完了',
      example: 'has completed / have attended / has been',
      explanation: '現在完了は「have/has + 過去分詞」の形。「〜した（ことがある）」「〜してしまった」',
      tips: 'haveを見たら過去分詞をチェック！',
      frequency: 'high',
      difficulty: 'medium'
    },
    {
      id: 'pattern_005',
      category: '動詞問題',
      title: 'be動詞 + 過去分詞 = 受動態',
      example: 'was completed / is attended / will be finished',
      explanation: '受動態は「be動詞 + 過去分詞」。「〜される」「〜された」',
      tips: 'be動詞の後ろの動詞の形をチェック！',
      frequency: 'high',
      difficulty: 'medium'
    },
    {
      id: 'pattern_006',
      category: '前置詞問題',
      title: '時間表現：at/on/in の使い分け',
      example: 'at 3 PM / on Monday / in January',
      explanation: 'at（時刻）、on（曜日・日付）、in（月・年・季節）',
      tips: '時間の範囲が狭い→広い：at→on→in',
      frequency: 'high',
      difficulty: 'easy'
    },
    {
      id: 'pattern_007',
      category: '接続詞問題',
      title: 'although vs despite の違い',
      example: 'although S+V / despite 名詞',
      explanation: 'although の後ろは「主語+動詞」、despite の後ろは「名詞」',
      tips: 'although は文、despite は名詞！',
      frequency: 'medium',
      difficulty: 'medium'
    },
    {
      id: 'pattern_008',
      category: '品詞問題',
      title: '形容詞 + 名詞 の語順',
      example: 'important meeting / successful project',
      explanation: '形容詞は名詞の前に置く。「形容詞 + 名詞」の語順',
      tips: '名詞を修飾するのは形容詞！',
      frequency: 'very_high',
      difficulty: 'easy'
    },
    {
      id: 'pattern_009',
      category: '品詞問題',
      title: '動詞を修飾するのは副詞',
      example: 'quickly completed / carefully reviewed',
      explanation: '動詞を修飾するのは副詞。「副詞 + 動詞」または「動詞 + 副詞」',
      tips: '動詞の前後をチェック！',
      frequency: 'high',
      difficulty: 'medium'
    },
    {
      id: 'pattern_010',
      category: '動詞問題',
      title: '時制の一致：主節が過去なら従属節も過去',
      example: 'said that he was / thought that she would',
      explanation: '主節の動詞が過去形の場合、従属節（that以下）も過去形にする',
      tips: '主節の時制をまずチェック！',
      frequency: 'medium',
      difficulty: 'hard'
    }
  ],
  
  // 暗記データを取得
  getMemorizationData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        patterns: {},
        totalStudied: 0,
        masteredCount: 0,
        lastStudy: null
      };
    }
    return JSON.parse(data);
  },
  
  // データを保存
  saveMemorizationData: function(data) {
    data.lastStudy = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // パターンの学習記録
  recordStudy: function(patternId, understood) {
    const data = this.getMemorizationData();
    
    if (!data.patterns[patternId]) {
      data.patterns[patternId] = {
        studyCount: 0,
        masteredCount: 0,
        lastStudy: null,
        understood: [],
        mastered: false
      };
    }
    
    const pattern = data.patterns[patternId];
    pattern.studyCount++;
    pattern.lastStudy = Date.now();
    pattern.understood.push(understood ? 1 : 0);
    
    // 最近5回中4回以上理解できたらマスター
    if (pattern.understood.length >= 5) {
      const recent5 = pattern.understood.slice(-5);
      const understoodCount = recent5.filter(u => u === 1).length;
      
      if (understoodCount >= 4 && !pattern.mastered) {
        pattern.mastered = true;
        pattern.masteredCount++;
        data.masteredCount++;
        console.log(`🎉 パターンマスター：${this.patterns.find(p => p.id === patternId)?.title}`);
      }
    }
    
    data.totalStudied++;
    this.saveMemorizationData(data);
    
    return pattern;
  },
  
  // 学習推奨パターンを取得
  getRecommendedPatterns: function(limit = 10) {
    const data = this.getMemorizationData();
    const recommended = [];
    
    this.patterns.forEach(pattern => {
      const patternData = data.patterns[pattern.id] || {
        studyCount: 0,
        mastered: false,
        understood: []
      };
      
      // 優先度計算
      let priority = 0;
      
      // 頻出度による優先度
      if (pattern.frequency === 'very_high') priority += 100;
      else if (pattern.frequency === 'high') priority += 70;
      else if (pattern.frequency === 'medium') priority += 50;
      
      // 難易度による優先度（簡単なものを優先）
      if (pattern.difficulty === 'easy') priority += 30;
      else if (pattern.difficulty === 'medium') priority += 20;
      else if (pattern.difficulty === 'hard') priority += 10;
      
      // 未マスターは優先度アップ
      if (!patternData.mastered) priority += 50;
      
      // 学習回数が少ないほど優先度アップ
      priority += Math.max(0, 20 - patternData.studyCount);
      
      recommended.push({
        ...pattern,
        ...patternData,
        priority: priority
      });
    });
    
    // 優先度順にソート
    recommended.sort((a, b) => b.priority - a.priority);
    
    return recommended.slice(0, limit);
  },
  
  // マスター済みパターンを取得
  getMasteredPatterns: function() {
    const data = this.getMemorizationData();
    return this.patterns.filter(p => data.patterns[p.id]?.mastered);
  },
  
  // 未マスターパターンを取得
  getUnmasteredPatterns: function() {
    const data = this.getMemorizationData();
    return this.patterns.filter(p => !data.patterns[p.id]?.mastered);
  },
  
  // 統計情報を取得
  getStats: function() {
    const data = this.getMemorizationData();
    const mastered = this.getMasteredPatterns();
    const unmastered = this.getUnmasteredPatterns();
    
    return {
      totalPatterns: this.patterns.length,
      masteredCount: mastered.length,
      unmasteredCount: unmastered.length,
      masteryRate: Math.round((mastered.length / this.patterns.length) * 100),
      totalStudied: data.totalStudied
    };
  },
  
  // カテゴリ別統計
  getCategoryStats: function() {
    const data = this.getMemorizationData();
    const stats = {};
    
    this.patterns.forEach(pattern => {
      if (!stats[pattern.category]) {
        stats[pattern.category] = {
          total: 0,
          mastered: 0
        };
      }
      
      stats[pattern.category].total++;
      if (data.patterns[pattern.id]?.mastered) {
        stats[pattern.category].mastered++;
      }
    });
    
    return stats;
  },
  
  // 初期化
  init: function() {
    console.log('🎴 解法パターン暗記システム初期化中...');
    const stats = this.getStats();
    console.log(`  総パターン数: ${stats.totalPatterns}個`);
    console.log(`  マスター済み: ${stats.masteredCount}個`);
    console.log(`  暗記率: ${stats.masteryRate}%`);
  }
};

// グローバルにエクスポート
window.PatternMemorization = PatternMemorization;

// ページ読み込み時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    PatternMemorization.init();
  });
} else {
  PatternMemorization.init();
}
