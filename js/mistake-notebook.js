// TOEIC PART5 学習サポート - 間違いノート自動生成システム
// 間違えた問題を自動的に整理し、見やすいノート形式で表示

const MistakeNotebook = {
  STORAGE_KEY: 'toeic_mistake_notebook',
  
  // ノートのフォーマット設定
  FORMAT: {
    COMPACT: 'compact',      // コンパクト表示
    DETAILED: 'detailed',    // 詳細表示
    PRINTABLE: 'printable'   // 印刷用
  },
  
  // ソート順
  SORT: {
    DATE_DESC: 'date_desc',           // 新しい順
    DATE_ASC: 'date_asc',             // 古い順
    MISTAKE_COUNT_DESC: 'count_desc', // 間違い回数が多い順
    CATEGORY: 'category'              // カテゴリ別
  },
  
  // 間違いノートデータを取得
  getNotebookData: function() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return {
        entries: [],          // ノートエントリー
        lastUpdate: null,
        totalMistakes: 0,
        settings: {
          format: this.FORMAT.DETAILED,
          sort: this.SORT.DATE_DESC,
          showExplanation: true,
          showOptions: true
        }
      };
    }
    return JSON.parse(data);
  },
  
  // データを保存
  saveNotebookData: function(data) {
    data.lastUpdate = Date.now();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },
  
  // ReviewSystemから間違いノートを自動生成
  generateNotebook: function() {
    if (typeof ReviewSystem === 'undefined') {
      console.error('ReviewSystemが見つかりません');
      return null;
    }
    
    const wrongAnswers = ReviewSystem.getWrongAnswers();
    
    if (wrongAnswers.length === 0) {
      return {
        entries: [],
        totalMistakes: 0,
        message: '間違えた問題はまだありません。テストを受けてみましょう！'
      };
    }
    
    // 元の問題データベースから完全な情報を取得
    const allQuestions = (typeof QUESTIONS_DATABASE !== 'undefined' && QUESTIONS_DATABASE.allQuestions) 
      ? QUESTIONS_DATABASE.allQuestions 
      : [];
    
    // ノートエントリーを生成
    const entries = wrongAnswers.map(item => {
      // 元の問題データを検索
      const originalQuestion = allQuestions.find(q => q.id === item.questionId);
      
      // エントリーを作成
      const entry = {
        id: item.questionId,
        questionText: item.questionText,
        options: item.options,
        correctAnswer: item.correctAnswer,
        userAnswers: item.attempts.map(a => a.userAnswer),
        category: item.category || '不明',
        questionType: originalQuestion ? originalQuestion.questionType : item.category,
        wrongCount: item.wrongCount,
        masteredCount: item.masteredCount || 0,
        firstWrong: item.firstWrong,
        lastWrong: item.lastWrong,
        lastReview: item.lastReview,
        explanation: null,
        notes: item.notes || '' // ユーザーのメモ
      };
      
      // 元の問題から詳細な解説を取得
      if (originalQuestion && originalQuestion.explanation) {
        entry.explanation = {
          ja: originalQuestion.explanation.ja || originalQuestion.explanation.translation,
          point: originalQuestion.explanation.point || originalQuestion.explanation.keyPoint,
          reason: originalQuestion.explanation.reason,
          details: originalQuestion.explanation.details,
          tips: originalQuestion.explanation.tips,
          related: originalQuestion.explanation.related,
          questionIntent: originalQuestion.explanation.questionIntent
        };
      }
      
      return entry;
    });
    
    return {
      entries: entries,
      totalMistakes: entries.length,
      generatedAt: Date.now()
    };
  },
  
  // ソート機能
  sortEntries: function(entries, sortType) {
    const sorted = [...entries];
    
    switch(sortType) {
      case this.SORT.DATE_DESC:
        // 新しい順（最近間違えた順）
        return sorted.sort((a, b) => b.lastWrong - a.lastWrong);
        
      case this.SORT.DATE_ASC:
        // 古い順
        return sorted.sort((a, b) => a.firstWrong - b.firstWrong);
        
      case this.SORT.MISTAKE_COUNT_DESC:
        // 間違い回数が多い順
        return sorted.sort((a, b) => {
          if (b.wrongCount !== a.wrongCount) {
            return b.wrongCount - a.wrongCount;
          }
          return b.lastWrong - a.lastWrong;
        });
        
      case this.SORT.CATEGORY:
        // カテゴリ別
        return sorted.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category);
          if (catCompare !== 0) return catCompare;
          return b.wrongCount - a.wrongCount;
        });
        
      default:
        return sorted;
    }
  },
  
  // カテゴリ別にグループ化
  groupByCategory: function(entries) {
    const groups = {};
    
    entries.forEach(entry => {
      const category = entry.category || '不明';
      if (!groups[category]) {
        groups[category] = {
          category: category,
          entries: [],
          totalMistakes: 0,
          avgWrongCount: 0
        };
      }
      groups[category].entries.push(entry);
      groups[category].totalMistakes += entry.wrongCount;
    });
    
    // 平均間違い回数を計算
    Object.keys(groups).forEach(category => {
      const group = groups[category];
      group.avgWrongCount = group.totalMistakes / group.entries.length;
    });
    
    return groups;
  },
  
  // 統計情報を取得
  getStatistics: function(entries) {
    if (!entries || entries.length === 0) {
      return {
        totalQuestions: 0,
        totalMistakes: 0,
        avgMistakesPerQuestion: 0,
        categoriesCount: 0,
        mostDifficultCategory: null,
        recentMistakes: 0
      };
    }
    
    const totalMistakes = entries.reduce((sum, entry) => sum + entry.wrongCount, 0);
    const categories = this.groupByCategory(entries);
    const categoriesArray = Object.values(categories);
    
    // 最難関カテゴリを特定
    let mostDifficult = null;
    let maxAvgWrong = 0;
    
    categoriesArray.forEach(cat => {
      if (cat.avgWrongCount > maxAvgWrong) {
        maxAvgWrong = cat.avgWrongCount;
        mostDifficult = cat.category;
      }
    });
    
    // 過去7日間の間違い
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentMistakes = entries.filter(e => e.lastWrong >= sevenDaysAgo).length;
    
    return {
      totalQuestions: entries.length,
      totalMistakes: totalMistakes,
      avgMistakesPerQuestion: (totalMistakes / entries.length).toFixed(1),
      categoriesCount: categoriesArray.length,
      mostDifficultCategory: mostDifficult,
      recentMistakes: recentMistakes
    };
  },
  
  // フィルター機能
  filterEntries: function(entries, filterOptions) {
    let filtered = [...entries];
    
    // カテゴリフィルター
    if (filterOptions.category && filterOptions.category !== 'all') {
      filtered = filtered.filter(e => e.category === filterOptions.category);
    }
    
    // 間違い回数フィルター
    if (filterOptions.minWrongCount) {
      filtered = filtered.filter(e => e.wrongCount >= filterOptions.minWrongCount);
    }
    
    // 日付フィルター
    if (filterOptions.dateFrom) {
      filtered = filtered.filter(e => e.lastWrong >= filterOptions.dateFrom);
    }
    
    if (filterOptions.dateTo) {
      filtered = filtered.filter(e => e.lastWrong <= filterOptions.dateTo);
    }
    
    // 未習熟のみ
    if (filterOptions.unmasteredOnly) {
      filtered = filtered.filter(e => e.masteredCount < 3);
    }
    
    return filtered;
  },
  
  // HTMLノート生成（表示用）
  generateHTML: function(entries, format = this.FORMAT.DETAILED) {
    if (!entries || entries.length === 0) {
      return '<div style="text-align: center; padding: 3rem; color: #6b7280;">間違えた問題はありません。素晴らしいです！🎉</div>';
    }
    
    let html = '';
    
    entries.forEach((entry, index) => {
      const wrongIcon = '❌'.repeat(Math.min(entry.wrongCount, 5));
      const masteredIcon = entry.masteredCount >= 3 ? '✅' : '📝';
      
      html += `
        <div class="mistake-entry" style="background: white; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); page-break-inside: avoid;">
          <!-- ヘッダー -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.75rem;">
            <div>
              <span style="font-size: 1.25rem; font-weight: 700; color: #1f2937;">問題 ${index + 1}</span>
              <span style="margin-left: 1rem; padding: 0.25rem 0.75rem; background: #fef3c7; color: #92400e; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 600;">${entry.category}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.5rem;" title="間違い回数">${wrongIcon}</span>
              <span style="font-size: 1rem; color: #ef4444; font-weight: 600;">×${entry.wrongCount}</span>
              <span style="font-size: 1.25rem; margin-left: 0.5rem;">${masteredIcon}</span>
            </div>
          </div>
          
          <!-- 問題タイプ -->
          ${entry.questionType ? `
            <div style="margin-bottom: 1rem; padding: 0.5rem 1rem; background: #dbeafe; border-left: 4px solid #2563eb; border-radius: 0.375rem;">
              <span style="color: #1e40af; font-weight: 600; font-size: 0.875rem;">📋 ${entry.questionType}</span>
            </div>
          ` : ''}
          
          <!-- 問題文 -->
          <div style="margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
            <p style="font-size: 1.125rem; line-height: 1.75; color: #1f2937; margin: 0;">${entry.questionText}</p>
          </div>
          
          <!-- 選択肢 -->
          ${format !== this.FORMAT.COMPACT ? `
            <div style="margin-bottom: 1rem;">
              <p style="font-weight: 600; margin-bottom: 0.5rem; color: #4b5563;">選択肢:</p>
              <div style="display: grid; gap: 0.5rem;">
                ${entry.options.map((option, i) => {
                  const isCorrect = i === entry.correctAnswer;
                  const wasSelected = entry.userAnswers.includes(i);
                  let bgColor = '#f9fafb';
                  let borderColor = '#e5e7eb';
                  let icon = '';
                  
                  if (isCorrect) {
                    bgColor = '#ecfdf5';
                    borderColor = '#10b981';
                    icon = '✅';
                  } else if (wasSelected) {
                    bgColor = '#fef2f2';
                    borderColor = '#ef4444';
                    icon = '❌';
                  }
                  
                  return `
                    <div style="padding: 0.75rem 1rem; background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                      <span style="font-weight: 600; color: #6b7280;">(${String.fromCharCode(65 + i)})</span>
                      <span style="flex: 1;">${option}</span>
                      ${icon ? `<span style="font-size: 1.25rem;">${icon}</span>` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}
          
          <!-- 正解 -->
          <div style="margin-bottom: 1rem; padding: 1rem; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 0.5rem;">
            <p style="margin: 0;"><strong style="color: #065f46;">✅ 正解:</strong> <span style="color: #10b981; font-size: 1.125rem; font-weight: 600;">${entry.options[entry.correctAnswer]}</span></p>
          </div>
          
          <!-- 解説 -->
          ${format !== this.FORMAT.COMPACT && entry.explanation ? `
            <div style="margin-top: 1rem;">
              <h4 style="font-size: 1.125rem; color: #1f2937; margin-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem;">📖 解説</h4>
              
              ${entry.explanation.ja ? `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0.5rem;">
                  <p style="margin: 0;"><strong>🌐 日本語訳:</strong></p>
                  <p style="margin: 0.5rem 0 0 0; line-height: 1.6;">${entry.explanation.ja}</p>
                </div>
              ` : ''}
              
              ${entry.explanation.point ? `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0.5rem;">
                  <p style="margin: 0;"><strong>📚 文法ポイント:</strong></p>
                  <p style="margin: 0.5rem 0 0 0; line-height: 1.6;">${entry.explanation.point}</p>
                </div>
              ` : ''}
              
              ${entry.explanation.reason ? `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 0.5rem;">
                  <p style="margin: 0;"><strong>💡 なぜこれが正解？</strong></p>
                  <p style="margin: 0.5rem 0 0 0; line-height: 1.6;">${entry.explanation.reason}</p>
                </div>
              ` : ''}
              
              ${entry.explanation.tips ? `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0.5rem;">
                  <p style="margin: 0;"><strong>💡 覚え方のコツ:</strong></p>
                  <p style="margin: 0.5rem 0 0 0; line-height: 1.6;">${entry.explanation.tips}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          <!-- 日付情報 -->
          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 0.875rem; color: #6b7280;">
            <span>初回間違い: ${this.formatDate(entry.firstWrong)}</span>
            <span>最終間違い: ${this.formatDate(entry.lastWrong)}</span>
          </div>
        </div>
      `;
    });
    
    return html;
  },
  
  // 日付フォーマット
  formatDate: function(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  },
  
  // 印刷用HTML生成
  generatePrintableHTML: function(entries) {
    const stats = this.getStatistics(entries);
    const groups = this.groupByCategory(entries);
    
    let html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <title>TOEIC PART5 間違いノート</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .page-break { page-break-after: always; }
          }
          body { font-family: 'Helvetica Neue', Arial, 'Hiragino Sans', sans-serif; }
          .header { text-align: center; margin-bottom: 2rem; }
          .stats { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📔 TOEIC PART5 間違いノート</h1>
          <p>作成日: ${this.formatDate(Date.now())}</p>
        </div>
        
        <div class="stats">
          <h3>📊 統計情報</h3>
          <p>総問題数: ${stats.totalQuestions}問</p>
          <p>総間違い回数: ${stats.totalMistakes}回</p>
          <p>平均間違い回数: ${stats.avgMistakesPerQuestion}回/問</p>
          <p>カテゴリ数: ${stats.categoriesCount}個</p>
          <p>最難関カテゴリ: ${stats.mostDifficultCategory || 'なし'}</p>
        </div>
        
        ${this.generateHTML(entries, this.FORMAT.PRINTABLE)}
      </body>
      </html>
    `;
    
    return html;
  },
  
  // 印刷
  print: function(entries) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(this.generatePrintableHTML(entries));
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  },
  
  // テキスト形式でエクスポート
  exportAsText: function(entries) {
    let text = '=' . repeat(50) + '\n';
    text += 'TOEIC PART5 間違いノート\n';
    text += `作成日: ${this.formatDate(Date.now())}\n`;
    text += '='.repeat(50) + '\n\n';
    
    const stats = this.getStatistics(entries);
    text += '【統計情報】\n';
    text += `総問題数: ${stats.totalQuestions}問\n`;
    text += `総間違い回数: ${stats.totalMistakes}回\n`;
    text += `平均間違い回数: ${stats.avgMistakesPerQuestion}回/問\n\n`;
    
    entries.forEach((entry, index) => {
      text += '-'.repeat(50) + '\n';
      text += `問題 ${index + 1} [${entry.category}] (×${entry.wrongCount}回)\n`;
      text += '-'.repeat(50) + '\n';
      text += `${entry.questionText}\n\n`;
      
      text += '【選択肢】\n';
      entry.options.forEach((option, i) => {
        const mark = i === entry.correctAnswer ? ' ✓' : '';
        text += `(${String.fromCharCode(65 + i)}) ${option}${mark}\n`;
      });
      text += '\n';
      
      if (entry.explanation) {
        text += '【解説】\n';
        if (entry.explanation.ja) text += `日本語訳: ${entry.explanation.ja}\n`;
        if (entry.explanation.point) text += `文法ポイント: ${entry.explanation.point}\n`;
        if (entry.explanation.reason) text += `理由: ${entry.explanation.reason}\n`;
        text += '\n';
      }
      
      text += `初回間違い: ${this.formatDate(entry.firstWrong)}\n`;
      text += `最終間違い: ${this.formatDate(entry.lastWrong)}\n\n`;
    });
    
    return text;
  },
  
  // ダウンロード
  downloadAsText: function(entries) {
    const text = this.exportAsText(entries);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TOEIC_間違いノート_${this.formatDate(Date.now())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  // システム初期化
  init: function() {
    console.log('📔 間違いノート自動生成システム初期化中...');
    
    const notebook = this.generateNotebook();
    
    if (notebook) {
      console.log(`  総問題数: ${notebook.totalMistakes}問`);
      
      if (notebook.totalMistakes > 0) {
        const stats = this.getStatistics(notebook.entries);
        console.log(`  総間違い回数: ${stats.totalMistakes}回`);
        console.log(`  平均間違い回数: ${stats.avgMistakesPerQuestion}回/問`);
        console.log(`  カテゴリ数: ${stats.categoriesCount}個`);
      }
    }
    
    return notebook;
  }
};

// グローバルに公開
window.MistakeNotebook = MistakeNotebook;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  MistakeNotebook.init();
});
