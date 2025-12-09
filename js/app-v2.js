// TOEIC PART5 学習アプリ - メインロジック

// グローバル状態管理
const AppState = {
  currentTestNumber: null, // 1-5のテスト番号
  currentQuestionIndex: 0,
  userAnswers: [],
  startTime: null,
  timerInterval: null,
  score: 0,
  shuffledQuestions: [], // シャッフルされた30問
  allQuestions: [] // 全450問のプール
};

// ローカルストレージのキー
const STORAGE_KEYS = {
  progress: 'toeic_part5_progress',
  scores: 'toeic_part5_scores'
};

// ==================== 初期化 ====================

// アプリケーション起動時の初期化
// Lazy Loadingで動的に読み込まれるため、DOMContentLoadedを待たずに即座に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
  });
} else {
  // DOMがすでに読み込まれている場合（Lazy Loading後）
  initializeApp();
  setupEventListeners();
}

function setupEventListeners() {
  // Phase A: 絆レベルアップイベントリスナー
  window.addEventListener('bondLevelUp', function(event) {
    const { secretary, newLevel } = event.detail;
    
    // 絆レベル表示を更新
    if (typeof updateBondLevelDisplay === 'function') {
      updateBondLevelDisplay();
    }
    
    // レベルアップ祝福メッセージ
    const secretaryNames = {
      'sakura': '桜',
      'mirai': 'ミライ',
      'rio': 'リオ'
    };
    const name = secretaryNames[secretary] || secretary;
    const message = `🎉 ${name}との絆がレベル${newLevel}に上がりました！これからもよろしくお願いします！💕`;
    
    setTimeout(() => {
      showSecretaryMessage(message, 'celebration', 6000);
    }, 1000);
  });
}

function initializeApp() {
  console.log('🎯 initializeApp() 開始');
  // 全450問を読み込み
  if (typeof QUESTIONS_DATABASE !== 'undefined' && QUESTIONS_DATABASE.allQuestions) {
    AppState.allQuestions = QUESTIONS_DATABASE.allQuestions;
    console.log(`✅ 問題データ読み込み完了: ${AppState.allQuestions.length}問`);
  } else {
    console.warn('⚠️ QUESTIONS_DATABASEが見つかりません');
  }
  
  loadProgress();
  renderTestSets();
  updateHomeScreenProgress();
  updateTodayReviewCard(); // 今日の復習カードを更新
  updateReviewModeCard(); // 復習モードカードを更新
  updateStreakDisplay(); // 学習ストリークを更新
  updateDailyMissionsDisplay(); // デイリーミッションを更新
  updateWeaknessAnalysisDisplay(); // 弱点分析を更新
  updateNextActionCard(); // Phase C: 次にやることカードを更新
  updateBackupCard(); // Phase C-2: バックアップカードを更新
  
  // Phase C-2: 定期バックアップリマインダーをチェック
  checkBackupReminder();
  
  // 【NEW】Phase E: 秘書の部屋拡張機能を初期化
  if (typeof SecretaryRoomExpansion !== 'undefined') {
    SecretaryRoomExpansion.init();
  }
  
  // 【NEW】Phase 1: 超パーソナライズド学習ナビゲーション - ツカサさん専用ダッシュボードを初期化
  if (typeof PersonalizedLearningNav !== 'undefined' && typeof PersonalizedDashboard !== 'undefined') {
    console.log('🎯 パーソナライズドダッシュボード初期化中...');
    PersonalizedLearningNav.init();
    PersonalizedDashboard.render();
    console.log('✅ パーソナライズドダッシュボード初期化完了');
  }
  
  // 【NEW】Phase 1: グリーティングチーム選択システムを初期化
  if (typeof GreetingTeamSelector !== 'undefined') {
    GreetingTeamSelector.init();
  }
  
  showScreen('homeScreen');
}

/**
 * Phase C-2: 定期バックアップリマインダーをチェック
 */
function checkBackupReminder() {
  if (typeof window.BackupSystem === 'undefined') return;
  
  try {
    const reminder = window.BackupSystem.checkBackupReminder();
    
    if (reminder && reminder.shouldRemind) {
      const days = reminder.daysSinceBackup;
      const urgency = reminder.urgency;
      
      let message = '';
      let icon = '';
      
      if (urgency === 'high') {
        // 30日以上
        message = `⚠️ 重要なお知らせ\n\n最終バックアップから${days}日が経過しています。\n大切な学習データを守るため、今すぐバックアップを作成することを強くおすすめします！`;
        icon = '⚠️';
      } else {
        // 7日以上
        message = `💡 バックアップのおすすめ\n\n最終バックアップから${days}日が経過しました。\n定期的なバックアップで学習データを安全に保護しましょう！`;
        icon = '💡';
      }
      
      // リマインダーを表示（遅延実行）
      setTimeout(() => {
        if (confirm(`${message}\n\n今すぐバックアップを作成しますか？`)) {
          performBackup();
        }
        // リマインダー表示済みとしてマーク
        window.BackupSystem.markReminderShown();
      }, 3000); // 3秒遅延（初期化完了後）
    }
  } catch (error) {
    console.error('バックアップリマインダーチェックエラー:', error);
  }
}

// テストセット一覧を表示
function renderTestSets() {
  console.log('📝 renderTestSets() 呼び出し');
  const container = document.getElementById('testSetsGrid');
  if (!container) {
    console.warn('⚠️ testSetsGrid要素が見つかりません');
    return;
  }
  console.log('✅ testSetsGrid要素見つかりました');
  console.log('  現在の子要素数:', container.children.length);
  console.log('  表示状態:', window.getComputedStyle(container).display);
  console.log('  親要素表示:', window.getComputedStyle(container.parentElement).display);
  
  container.innerHTML = '';
  const progress = getProgress();
  
  for (let testNum = 1; testNum <= 5; testNum++) {
    const testProgress = progress.tests ? progress.tests[testNum] : null;
    const isCompleted = testProgress !== null;
    
    const card = document.createElement('div');
    card.className = `set-card ${isCompleted ? 'completed' : ''}`;
    card.onclick = () => startTest(testNum);
    
    card.innerHTML = `
      <div class="set-header">
        <h3 class="set-title">Test ${testNum}</h3>
        <span class="set-status">${isCompleted ? '✓' : ''}</span>
      </div>
      <p class="set-info">30問 | 約15分 | 🎲 完全ランダム</p>
      ${isCompleted && testProgress ? `
        <div class="set-score">
          <p class="set-score-text">スコア</p>
          <p class="set-score-value">${testProgress.score !== undefined ? testProgress.score : 0}/30</p>
          <p class="set-score-text" style="font-size: 0.75rem; margin-top: 0.25rem;">
            予測: ${testProgress.predictedScore || '---'}点
          </p>
        </div>
      ` : ''}
      <button class="btn btn-primary" onclick="event.stopPropagation(); startTest(${testNum})">
        開始！
      </button>
    `;
    
    container.appendChild(card);
    console.log(`✅ Test ${testNum} カード追加完了`);
  }
  console.log(`✅ renderTestSets() 完了: ${container.children.length}個のカード`);
}

// ==================== 画面遷移 ====================

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

function showHome() {
  console.log('🏠 showHome() 呼び出し');
  
  console.log('  📝 renderTestSets() を実行中...');
  renderTestSets();
  
  console.log('  📊 updateHomeScreenProgress() を実行中...');
  updateHomeScreenProgress();
  
  // スコア予測セクションを更新
  console.log('  📊 updateHomeScorePrediction() を実行中...');
  updateHomeScorePrediction();
  
  // Phase 1改善：統合復習ハブと成長ダッシュボード
  console.log('  🔄 updateUnifiedReviewHub() を実行中...');
  updateUnifiedReviewHub(); // 統合復習ハブを更新（NEW！Phase 1）
  
  console.log('  📈 updateGrowthDashboard() を実行中...');
  updateGrowthDashboard(); // 成長ダッシュボードを更新（NEW！Phase 1）
  
  // Phase C: 次にやることカードを更新（NEW！）
  console.log('  🎯 updateNextActionCard() を実行中...');
  updateNextActionCard();
  
  // Phase C-2: バックアップカードを更新（NEW！）
  console.log('  💾 updateBackupCard() を実行中...');
  updateBackupCard();
  
  // Phase E: ポイント表示を更新（NEW！）
  console.log('  💰 updatePointsBadge() を実行中...');
  updatePointsBadge();
  
  // Phase A: パーソナライズドメッセージ表示（NEW！）
  if (typeof SecretaryMotivation !== 'undefined') {
    try {
      console.log('  💬 SecretaryMotivation メッセージ処理中...');
      // 絆レベル表示を更新
      updateBondLevelDisplay();
      
      // 復帰ユーザーチェック
      if (typeof SecretaryMotivation.checkComebackUser === 'function') {
        const comebackMessage = SecretaryMotivation.checkComebackUser();
        if (comebackMessage && comebackMessage.message) {
          showSecretaryMessage(comebackMessage.message, 'welcome', 6000);
        } else if (typeof SecretaryMotivation.generatePersonalizedMessage === 'function') {
          // 通常のホームメッセージ
          const homeMessage = SecretaryMotivation.generatePersonalizedMessage('home');
          if (homeMessage && homeMessage.message) {
            showSecretaryMessage(homeMessage.message, 'greeting', 5000);
          }
        }
      }
      
      // 目標接近チェック
      if (typeof SecretaryMotivation.checkGoalProgress === 'function') {
        const goalMessage = SecretaryMotivation.checkGoalProgress();
        if (goalMessage && goalMessage.message) {
          setTimeout(() => {
            showSecretaryMessage(goalMessage.message, 'goal', 6000);
          }, 6000);
        }
      }
      
      // ストリーク警告チェック
      if (typeof SecretaryMotivation.checkLearningReminder === 'function') {
        const reminderMessage = SecretaryMotivation.checkLearningReminder();
        if (reminderMessage && reminderMessage.message) {
          setTimeout(() => {
            showSecretaryMessage(reminderMessage.message, 'reminder', 7000);
          }, 12000);
        }
      }
    } catch (error) {
      console.warn('⚠️ SecretaryMotivation エラー:', error);
    }
  }
  
  // 旧カードは非表示（統合復習ハブに置き換え）
  // updateTodayReviewCard();
  // updateWeaknessTrainingCard();
  // updateMistakeNotebookCard();
  
  console.log('  🖥️ showScreen("homeScreen") を実行中...');
  showScreen('homeScreen');
  console.log('✅ showHome() 完了');
  
  // 秘書にホーム画面に戻ったことを通知
  if (typeof Secretary !== 'undefined' && typeof Secretary.onReturnHome === 'function') {
    Secretary.onReturnHome();
  }
}

function startTest(testNumber) {
  AppState.currentTestNumber = testNumber;
  AppState.currentQuestionIndex = 0;
  AppState.userAnswers = [];
  AppState.startTime = Date.now();
  
  // 全450問から30問をランダムに選択
  AppState.shuffledQuestions = getRandomQuestions(AppState.allQuestions, 30);
  
  // Phase A: 学習セッション開始（モチベーションシステム）
  if (typeof SecretaryMotivation !== 'undefined') {
    if (typeof SecretaryMotivation.startSession === 'function') {
      SecretaryMotivation.startSession();
    }
    
    // テスト開始メッセージを表示
    if (typeof SecretaryMotivation.generatePersonalizedMessage === 'function') {
      const startMessage = SecretaryMotivation.generatePersonalizedMessage('test_start');
      if (startMessage && startMessage.message) {
        showSecretaryMessage(startMessage.message, 'encouragement', 4000);
      }
    }
  }
  
  // 秘書にテスト開始を通知
  if (typeof Secretary !== 'undefined' && typeof Secretary.onTestStart === 'function') {
    Secretary.onTestStart();
  }
  
  startTimer();
  renderQuestion();
  showScreen('questionScreen');
}

// Fisher-Yates シャッフルアルゴリズム
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 全問題からランダムにN問を選択
function getRandomQuestions(allQuestions, count) {
  const shuffled = shuffleArray([...allQuestions]);
  return shuffled.slice(0, count);
}

// ==================== ホーム画面 ====================

function updateHomeScreenProgress() {
  const progress = getProgress();
  const tests = progress.tests || {};
  
  // 完了したテスト数
  const completedCount = Object.keys(tests).length;
  const totalTests = 5;
  
  // 平均スコアを計算
  let totalScore = 0;
  let totalPredictedScore = 0;
  let count = 0;
  
  for (const testNum in tests) {
    if (tests[testNum].score !== undefined) {
      totalScore += tests[testNum].score;
      if (tests[testNum].predictedScore) {
        totalPredictedScore += tests[testNum].predictedScore;
      }
      count++;
    }
  }
  
  const averageScore = count > 0 ? Math.round((totalScore / (count * 30)) * 100) : 0;
  const averagePredicted = count > 0 ? Math.round(totalPredictedScore / count) : 0;
  const totalStudied = count * 30;
  
  // 統計情報を更新
  const completedTestsEl = document.getElementById('completedTests');
  const averageScoreEl = document.getElementById('averageScore');
  const predictedScoreEl = document.getElementById('predictedScore');
  const totalStudiedEl = document.getElementById('totalStudied');
  
  if (completedTestsEl) completedTestsEl.textContent = `${completedCount} / ${totalTests}`;
  if (averageScoreEl) averageScoreEl.textContent = count > 0 ? `${averageScore}%` : '--%';
  if (predictedScoreEl) predictedScoreEl.textContent = count > 0 ? `${averagePredicted}点` : '---';
  if (totalStudiedEl) totalStudiedEl.textContent = `${totalStudied}問`;
  
  // 全体の進捗バー
  const percentage = (completedCount / totalTests) * 100;
  const totalProgressEl = document.getElementById('totalProgress');
  const totalProgressTextEl = document.getElementById('totalProgressText');
  
  if (totalProgressEl) totalProgressEl.style.width = `${percentage}%`;
  if (totalProgressTextEl) {
    totalProgressTextEl.textContent = `${totalStudied} / 150問完了（5回分）`;
  }
  
  // ユーザープロフィールの進捗バー更新
  if (typeof UserProfile !== 'undefined' && UserProfile.updateScoreProgress) {
    UserProfile.updateScoreProgress();
  }
}



// ==================== 問題画面 ====================

function renderQuestion() {
  console.log('🎯 renderQuestion() 呼び出し');
  console.log('  currentQuestionIndex:', AppState.currentQuestionIndex);
  console.log('  shuffledQuestions 件数:', AppState.shuffledQuestions ? AppState.shuffledQuestions.length : 'undefined');
  
  const questionData = getCurrentQuestion();
  if (!questionData) {
    console.error('❌ Question data not found');
    console.error('  AppState.currentQuestionIndex:', AppState.currentQuestionIndex);
    console.error('  AppState.shuffledQuestions:', AppState.shuffledQuestions);
    return;
  }
  
  console.log('✅ 問題データ取得成功: ID', questionData.id);
  
  // Phase A: 問題開始時刻を記録（回答速度計測用）
  AppState.questionStartTime = Date.now();
  
  // 問題番号を更新
  document.getElementById('questionNumber').textContent = 
    AppState.currentQuestionIndex + 1;
  
  // 問題文を表示
  document.getElementById('questionText').textContent = 
    questionData.text;
  
  // 選択肢を表示
  renderOptions(questionData);
  
  // 復習モードかどうかを判定
  const isReviewMode = AppState.currentTestNumber === null;
  
  // 既に回答済みかどうかをチェック
  const isAnswered = AppState.userAnswers[AppState.currentQuestionIndex] !== undefined;
  
  // 解説の表示/非表示を制御
  const explanationBox = document.getElementById('explanationBox');
  if (isReviewMode && isAnswered) {
    // 復習モードで既に回答済みの問題：解説を表示
    const userAnswer = AppState.userAnswers[AppState.currentQuestionIndex];
    const isCorrect = userAnswer === questionData.answer;
    showExplanation(questionData, isCorrect);
    console.log('🔄 復習モード：既回答問題の解説を再表示');
  } else {
    // 未回答の問題：解説を非表示
    explanationBox.classList.add('hidden');
    console.log('📝 解説を非表示（未回答）');
  }
  
  // ナビゲーションボタンを更新
  updateNavigationButtons();
}

function renderOptions(questionData) {
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  
  questionData.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = `(${String.fromCharCode(65 + index)}) ${option}`;
    button.onclick = () => selectAnswer(index);
    
    // 既に回答済みの場合
    const userAnswer = AppState.userAnswers[AppState.currentQuestionIndex];
    if (userAnswer !== undefined) {
      button.disabled = true;
      if (index === userAnswer) {
        button.classList.add(
          index === questionData.answer ? 'correct' : 'incorrect'
        );
      }
      if (index === questionData.answer) {
        button.classList.add('correct');
      }
    }
    
    container.appendChild(button);
  });
}

function selectAnswer(answerIndex) {
  const questionData = getCurrentQuestion();
  const isCorrect = answerIndex === questionData.answer;
  
  // 回答を記録
  AppState.userAnswers[AppState.currentQuestionIndex] = answerIndex;
  
  // 選択肢のスタイルを更新
  const optionButtons = document.querySelectorAll('.option-btn');
  optionButtons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === answerIndex) {
      btn.classList.add(isCorrect ? 'correct' : 'incorrect');
    }
    if (index === questionData.answer) {
      btn.classList.add('correct');
    }
  });
  
  // 間違えた問題を保存
  if (!isCorrect && typeof ReviewSystem !== 'undefined' && typeof ReviewSystem.saveWrongAnswer === 'function') {
    ReviewSystem.saveWrongAnswer(
      questionData.id,
      questionData.text,
      questionData.options,
      questionData.answer,
      answerIndex,
      questionData.questionType || questionData.category || '不明'
    );
  } else if (isCorrect && typeof ReviewSystem !== 'undefined' && typeof ReviewSystem.saveCorrectAnswer === 'function') {
    // 正解した場合、復習中の問題ならマスター進捗を記録
    ReviewSystem.saveCorrectAnswer(questionData.id);
  }
  
  // 弱点分析に記録
  if (typeof WeaknessAnalysis !== 'undefined' && typeof WeaknessAnalysis.recordAnswer === 'function') {
    const category = questionData.questionType || questionData.category || 'その他';
    WeaknessAnalysis.recordAnswer(category, isCorrect);
  }
  
  // 弱点克服特訓に記録
  if (typeof WeaknessTraining !== 'undefined') {
    const result = WeaknessTraining.recordAnswer(questionData.id, isCorrect);
    
    // 克服達成時の特別演出
    if (result.mastered && typeof Secretary !== 'undefined') {
      setTimeout(() => {
        Secretary.showMessage(
          `🎉 素晴らしい！問題${result.questionId}を完全に克服しました！3回連続正解です！`,
          'celebration',
          5000
        );
      }, 2000);
    }
  }
  
  // 秘書のリアクション（従来の秘書システム）
  if (typeof Secretary !== 'undefined') {
    if (isCorrect && typeof Secretary.onCorrectAnswer === 'function') {
      Secretary.onCorrectAnswer();
    } else if (!isCorrect && typeof Secretary.onIncorrectAnswer === 'function') {
      Secretary.onIncorrectAnswer();
    }
  }
  
  // Phase A: リアルタイムモチベーションシステム（NEW!）
  if (typeof SecretaryMotivation !== 'undefined') {
    // 回答時間を計算
    const answerTime = AppState.questionStartTime 
      ? Math.floor((Date.now() - AppState.questionStartTime) / 1000)
      : 0;
    
    // リアルタイムフィードバック生成
    const feedback = SecretaryMotivation.onAnswerQuestion(isCorrect, answerTime, questionData);
    
    // フィードバックメッセージを表示
    showMotivationFeedback(feedback);
  }
  
  // 解説を表示
  showExplanation(questionData, isCorrect);
  
  // ナビゲーションボタンを更新
  updateNavigationButtons();
}

function showExplanation(questionData, isCorrect) {
  const explanationBox = document.getElementById('explanationBox');
  const explanationContent = document.getElementById('explanationContent');
  
  // 復習モードかどうかを判定
  const isReviewMode = AppState.currentTestNumber === null;
  
  console.log('📖 showExplanation() 呼び出し');
  console.log('  復習モード:', isReviewMode);
  console.log('  正解:', isCorrect);
  
  const resultIcon = isCorrect ? '✅' : '❌';
  const resultText = isCorrect ? '正解です！' : '不正解です';
  const encouragement = isCorrect ? 'よくできました！' : '次は正解できますよ！';
  
  // 復習モード専用のメッセージ
  const reviewModeMessage = isReviewMode ? `
    <div style="margin-bottom: 1rem; padding: 0.75rem 1rem; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 0.5rem; color: white; text-align: center;">
      <p style="font-weight: 600; font-size: 0.95rem;">📚 復習モード - しっかり理解を深めましょう！</p>
    </div>
  ` : '';
  
  // 正解の選択肢
  const correctOption = questionData.options[questionData.answer];
  
  // 各選択肢の詳細解説を生成
  let optionsExplanation = '';
  if (questionData.explanation.details) {
    optionsExplanation = '<div style="margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 0.5rem;"><strong>📝 各選択肢の解説：</strong>';
    questionData.options.forEach((option, index) => {
      const isCorrectOption = index === questionData.answer;
      const icon = isCorrectOption ? '✅' : '❌';
      const detailKey = `option${index}`;
      const detail = questionData.explanation.details[detailKey] || questionData.explanation.details.correct;
      if (detail) {
        optionsExplanation += `<p style="margin-top: 0.5rem;"><strong>${icon} ${option}:</strong> ${detail}</p>`;
      }
    });
    optionsExplanation += '</div>';
  }
  
  explanationContent.innerHTML = `
    ${reviewModeMessage}
    <div style="margin-bottom: 1rem; padding: 1rem; background: ${isCorrect ? '#ecfdf5' : '#fef2f2'}; border-radius: 0.5rem;">
      <p style="font-size: 1.125rem; margin-bottom: 0.5rem;"><strong>${resultIcon} ${resultText}</strong></p>
      <p style="color: #6b7280;">${encouragement}</p>
    </div>
    
    ${questionData.questionType ? `
      <div style="margin-bottom: 1rem; padding: 0.75rem 1rem; background: #dbeafe; border-left: 4px solid #2563eb; border-radius: 0.5rem;">
        <p style="color: #1e40af; font-weight: 600; font-size: 0.875rem;">📋 問題タイプ: ${questionData.questionType}</p>
      </div>
    ` : ''}
    
    ${questionData.explanation.questionIntent ? `
      <div style="margin-bottom: 1rem; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5rem; color: white;">
        <p style="font-weight: 600; line-height: 1.6;">${questionData.explanation.questionIntent}</p>
      </div>
    ` : ''}
    
    <div style="margin-bottom: 1rem;">
      <p><strong>✅ 正解：</strong> <span style="color: #10b981; font-size: 1.125rem;">${correctOption}</span></p>
    </div>
    
    <div style="margin-bottom: 1rem; padding: 1rem; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0.5rem;">
      <p style="margin-bottom: 0.5rem;"><strong>🌐 日本語訳：</strong></p>
      <p style="line-height: 1.6;">${questionData.explanation.ja}</p>
    </div>
    
    <div style="margin-bottom: 1rem; padding: 1rem; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0.5rem;">
      <p style="margin-bottom: 0.5rem;"><strong>📚 文法ポイント：</strong></p>
      <p style="line-height: 1.6;">${questionData.explanation.point}</p>
    </div>
    
    <div style="margin-bottom: 1rem; padding: 1rem; background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 0.5rem;">
      <p style="margin-bottom: 0.5rem;"><strong>💡 なぜこれが正解？</strong></p>
      <p style="line-height: 1.6;">${questionData.explanation.reason}</p>
    </div>
    
    ${optionsExplanation}
    
    ${questionData.explanation.tips ? `
      <div style="margin-top: 1rem; padding: 1rem; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0.5rem;">
        <p style="margin-bottom: 0.5rem;"><strong>💡 覚え方のコツ：</strong></p>
        <p style="line-height: 1.6;">${questionData.explanation.tips}</p>
      </div>
    ` : ''}
    
    ${questionData.explanation.related ? `
      <div style="margin-top: 1rem; padding: 1rem; background: #fae8ff; border-left: 4px solid #a855f7; border-radius: 0.5rem;">
        <p style="margin-bottom: 0.5rem;"><strong>🔗 関連知識：</strong></p>
        <p style="line-height: 1.6;">${questionData.explanation.related}</p>
      </div>
    ` : ''}
  `;
  
  // 復習モードでは常に解説を表示、通常テストでも表示
  explanationBox.classList.remove('hidden');
  
  if (isReviewMode) {
    console.log('✅ 復習モード：解説を自動表示');
  } else {
    console.log('✅ 通常テスト：解説を表示');
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const finishBtn = document.getElementById('finishBtn');
  
  if (!prevBtn || !nextBtn || !finishBtn) {
    console.error('❌ ナビゲーションボタンが見つかりません');
    return;
  }
  
  // 問題数を動的に取得（テスト:30問、復習:可変）
  const totalQuestions = AppState.shuffledQuestions ? AppState.shuffledQuestions.length : 30;
  const lastIndex = totalQuestions - 1;
  
  console.log('🔘 updateNavigationButtons()');
  console.log('  現在のインデックス:', AppState.currentQuestionIndex);
  console.log('  総問題数:', totalQuestions);
  console.log('  最終インデックス:', lastIndex);
  
  // 前へボタン
  prevBtn.disabled = AppState.currentQuestionIndex === 0;
  
  // 次へ/終了ボタン
  const isAnswered = AppState.userAnswers[AppState.currentQuestionIndex] !== undefined;
  const isLastQuestion = AppState.currentQuestionIndex === lastIndex;
  
  console.log('  回答済み:', isAnswered);
  console.log('  最終問題:', isLastQuestion);
  
  if (isLastQuestion && isAnswered) {
    nextBtn.classList.add('hidden');
    finishBtn.classList.remove('hidden');
    console.log('  ✅ 終了ボタン表示');
  } else {
    nextBtn.classList.remove('hidden');
    finishBtn.classList.add('hidden');
    nextBtn.disabled = !isAnswered;
    console.log('  ✅ 次へボタン表示 (無効:', !isAnswered, ')');
  }
}

function previousQuestion() {
  console.log('⬅️ previousQuestion() 呼び出し');
  console.log('  現在のインデックス:', AppState.currentQuestionIndex);
  
  if (AppState.currentQuestionIndex > 0) {
    AppState.currentQuestionIndex--;
    console.log('✅ 前の問題へ移動: インデックス', AppState.currentQuestionIndex);
    renderQuestion();
  } else {
    console.log('⚠️ 最初の問題です');
  }
}

function nextQuestion() {
  console.log('🔄 nextQuestion() 呼び出し');
  console.log('  現在のインデックス:', AppState.currentQuestionIndex);
  console.log('  総問題数:', AppState.shuffledQuestions ? AppState.shuffledQuestions.length : 'undefined');
  
  if (!AppState.shuffledQuestions || AppState.shuffledQuestions.length === 0) {
    console.error('❌ AppState.shuffledQuestions が空です');
    alert('問題データが読み込まれていません。ホーム画面に戻ります。');
    showHome();
    return;
  }
  
  const maxIndex = AppState.shuffledQuestions.length - 1;
  console.log('  最大インデックス:', maxIndex);
  
  if (AppState.currentQuestionIndex < maxIndex) {
    AppState.currentQuestionIndex++;
    console.log('✅ 次の問題へ移動: インデックス', AppState.currentQuestionIndex);
    renderQuestion();
  } else {
    console.log('⚠️ 最後の問題です');
  }
}

function finishTest() {
  stopTimer();
  calculateScore();
  
  // 経過時間を計算（秒）
  const elapsed = Date.now() - AppState.startTime;
  const timeInSeconds = Math.floor(elapsed / 1000);
  
  // Phase A: 学習セッション終了（モチベーションシステム）
  if (typeof SecretaryMotivation !== 'undefined' && typeof SecretaryMotivation.endSession === 'function') {
    const sessionSummary = SecretaryMotivation.endSession();
    console.log('📊 学習セッション完了:', sessionSummary);
    
    // テスト完了メッセージを表示
    if (typeof SecretaryMotivation.generatePersonalizedMessage === 'function') {
      const completeMessage = SecretaryMotivation.generatePersonalizedMessage('test_complete');
      if (completeMessage && completeMessage.message) {
        // 結果画面に表示される前にメッセージを予約
        AppState.testCompleteMessage = completeMessage.message;
      }
    }
  }
  
  // 学習ストリークを記録（勉強時間も含めて）
  if (typeof StreakSystem !== 'undefined' && typeof StreakSystem.recordStudy === 'function') {
    StreakSystem.recordStudy(timeInSeconds);
  }
  
  // 問題数を動的に取得（テスト:30問、復習:可変）
  const totalQuestions = AppState.shuffledQuestions ? AppState.shuffledQuestions.length : 30;
  
  // デイリーミッションを更新
  if (typeof DailyMissions !== 'undefined' && typeof DailyMissions.onTestComplete === 'function') {
    DailyMissions.onTestComplete(AppState.score, totalQuestions, timeInSeconds);
  }
  
  // 秘書にテスト終了を通知
  if (typeof Secretary !== 'undefined' && typeof Secretary.onTestFinish === 'function') {
    Secretary.onTestFinish(AppState.score, totalQuestions);
  }
  
  saveProgress();
  showResultScreen();
}

// ==================== タイマー ====================

function startTimer() {
  updateTimer();
  AppState.timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (AppState.timerInterval) {
    clearInterval(AppState.timerInterval);
    AppState.timerInterval = null;
  }
}

function updateTimer() {
  const elapsed = Date.now() - AppState.startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  document.getElementById('timer').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getElapsedTime() {
  const elapsed = Date.now() - AppState.startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ==================== スコア計算 ====================

function calculateScore() {
  let correct = 0;
  const questions = AppState.shuffledQuestions;
  
  AppState.userAnswers.forEach((answer, index) => {
    if (answer === questions[index].answer) {
      correct++;
    }
  });
  
  AppState.score = correct;
  return correct;
}

// TOEIC PART5スコア予測
function predictTOEICScore(correctCount, totalQuestions = 30) {
  const accuracy = correctCount / totalQuestions;
  
  // TOEIC PART5の配点とスコア換算
  // 実際のTOEICでは、PART5は30問で約35-40%の配点
  // リーディングセクション（100問）で495点満点
  
  let predictedPart5Score;
  
  if (accuracy >= 0.95) {
    // 95%以上：ほぼ満点レベル
    predictedPart5Score = 180;
  } else if (accuracy >= 0.90) {
    // 90-95%：上級レベル
    predictedPart5Score = 170;
  } else if (accuracy >= 0.85) {
    // 85-90%：中上級レベル
    predictedPart5Score = 160;
  } else if (accuracy >= 0.80) {
    // 80-85%：中級レベル
    predictedPart5Score = 150;
  } else if (accuracy >= 0.75) {
    // 75-80%：中級入門レベル
    predictedPart5Score = 140;
  } else if (accuracy >= 0.70) {
    // 70-75%：初中級レベル
    predictedPart5Score = 130;
  } else if (accuracy >= 0.65) {
    // 65-70%：初級上レベル
    predictedPart5Score = 120;
  } else if (accuracy >= 0.60) {
    // 60-65%：初級中レベル
    predictedPart5Score = 110;
  } else if (accuracy >= 0.55) {
    // 55-60%：初級レベル
    predictedPart5Score = 100;
  } else if (accuracy >= 0.50) {
    // 50-55%：基礎レベル
    predictedPart5Score = 90;
  } else if (accuracy >= 0.40) {
    // 40-50%：基礎入門レベル
    predictedPart5Score = 75;
  } else {
    // 40%未満：要基礎固め
    predictedPart5Score = Math.round(accuracy * 180);
  }
  
  // PART5のスコアから全体のリーディングスコアを推定
  // PART5が得意な人は他のパートでも比較的良いスコアを取る傾向
  const estimatedReadingScore = Math.round(predictedPart5Score * 2.75);
  
  // 総合スコア範囲を推定（リーディングのみからの推定）
  const minTotalScore = Math.max(10, Math.round(estimatedReadingScore * 0.75));
  const maxTotalScore = Math.min(990, Math.round(estimatedReadingScore * 1.25));
  
  return {
    part5Score: predictedPart5Score,
    readingScore: estimatedReadingScore,
    minTotalScore: minTotalScore,
    maxTotalScore: maxTotalScore,
    accuracy: Math.round(accuracy * 100),
    level: getScoreLevel(estimatedReadingScore)
  };
}

// スコアレベルを判定
function getScoreLevel(readingScore) {
  if (readingScore >= 450) return "Aレベル（ハイスコア）";
  if (readingScore >= 400) return "Bレベル（上級）";
  if (readingScore >= 350) return "Cレベル（中上級）";
  if (readingScore >= 300) return "Dレベル（中級）";
  if (readingScore >= 250) return "Eレベル（初中級）";
  return "Fレベル（基礎）";
}

// ==================== 結果画面 ====================

function showResultScreen() {
  const score = AppState.score;
  const total = 30;
  const percentage = Math.round((score / total) * 100);
  
  // TOEICスコア予測
  const prediction = predictTOEICScore(score, total);
  
  // スコア表示
  document.getElementById('scorePercentage').textContent = percentage;
  document.getElementById('correctCount').textContent = score;
  document.getElementById('totalTime').textContent = getElapsedTime();
  
  // 分析結果（スコア予測を含む）
  renderAnalysis(prediction);
  
  // 3人の秘書全員の評価を表示
  if (typeof SecretaryTeam !== 'undefined' && SecretaryTeam.showAllEvaluations) {
    SecretaryTeam.showAllEvaluations(score, total);
  }
  
  // 間違えた問題
  renderWrongQuestions();
  
  showScreen('resultScreen');
}

function renderAnalysis(prediction) {
  const analysisGrid = document.getElementById('analysisGrid');
  const score = AppState.score;
  const percentage = Math.round((score / 30) * 100);
  
  let rating = '';
  let message = '';
  
  if (percentage >= 90) {
    rating = '優秀';
    message = '素晴らしい成績です！';
  } else if (percentage >= 75) {
    rating = '良好';
    message = '良い成績です！';
  } else if (percentage >= 60) {
    rating = '合格';
    message = '合格ラインです！';
  } else {
    rating = '要復習';
    message = '復習が必要です';
  }
  
  analysisGrid.innerHTML = `
    <div class="analysis-item" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <p class="analysis-label" style="color: white; opacity: 0.9;">PART5予測スコア</p>
      <p class="analysis-value" style="color: white; font-size: 2rem;">${prediction.part5Score}</p>
      <p style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.9;">/ 200点</p>
    </div>
    <div class="analysis-item" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
      <p class="analysis-label" style="color: white; opacity: 0.9;">リーディング予測</p>
      <p class="analysis-value" style="color: white; font-size: 2rem;">${prediction.readingScore}</p>
      <p style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.9;">/ 495点</p>
    </div>
    <div class="analysis-item" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
      <p class="analysis-label" style="color: white; opacity: 0.9;">総合予測スコア</p>
      <p class="analysis-value" style="color: white; font-size: 1.5rem;">${prediction.minTotalScore}-${prediction.maxTotalScore}</p>
      <p style="font-size: 0.75rem; margin-top: 0.25rem; opacity: 0.9;">/ 990点</p>
    </div>
    <div class="analysis-item">
      <p class="analysis-label">正答率</p>
      <p class="analysis-value">${percentage}%</p>
    </div>
    <div class="analysis-item">
      <p class="analysis-label">レベル</p>
      <p class="analysis-value" style="font-size: 1rem;">${prediction.level}</p>
    </div>
    <div class="analysis-item">
      <p class="analysis-label">所要時間</p>
      <p class="analysis-value">${getElapsedTime()}</p>
    </div>
  `;
}

function renderWrongQuestions() {
  const wrongQuestionsSection = document.getElementById('wrongQuestionsSection');
  const wrongQuestionsList = document.getElementById('wrongQuestionsList');
  const questions = AppState.shuffledQuestions;
  
  const wrongQuestions = [];
  AppState.userAnswers.forEach((answer, index) => {
    if (answer !== questions[index].answer) {
      wrongQuestions.push({ index, question: questions[index] });
    }
  });
  
  if (wrongQuestions.length === 0) {
    wrongQuestionsSection.style.display = 'none';
    return;
  }
  
  wrongQuestionsSection.style.display = 'block';
  wrongQuestionsList.innerHTML = '';
  
  wrongQuestions.forEach(({ index, question }) => {
    const item = document.createElement('div');
    item.className = 'wrong-question-item';
    item.innerHTML = `
      <p class="wrong-question-number">問題 ${index + 1}</p>
      <p class="wrong-question-text">${question.text}</p>
    `;
    wrongQuestionsList.appendChild(item);
  });
}

function reviewWrongQuestions() {
  // 結果画面から復習モードへ遷移
  showReviewMode();
}

// ==================== データ管理 ====================

function getCurrentQuestion() {
  // シャッフルされた問題リストを使用
  return AppState.shuffledQuestions[AppState.currentQuestionIndex];
}

function getProgress() {
  const stored = localStorage.getItem(STORAGE_KEYS.progress);
  return stored ? JSON.parse(stored) : {
    tests: {}
  };
}

function saveProgress() {
  const progress = getProgress();
  
  if (!progress.tests) {
    progress.tests = {};
  }
  
  const currentScore = AppState.score;
  const prediction = predictTOEICScore(currentScore, 30);
  const testNum = AppState.currentTestNumber;
  
  const existingTest = progress.tests[testNum];
  
  // ベストスコアを保存
  if (!existingTest || currentScore > existingTest.score) {
    progress.tests[testNum] = {
      score: currentScore,
      predictedScore: prediction.readingScore,
      accuracy: prediction.accuracy,
      date: new Date().toISOString(),
      time: getElapsedTime()
    };
  }
  
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(progress));
  
  // 秘書に進捗更新を通知
  const completedTests = Object.keys(progress.tests).length;
  if (typeof Secretary !== 'undefined' && typeof Secretary.onProgressUpdate === 'function') {
    Secretary.onProgressUpdate(completedTests);
  }
}

function loadProgress() {
  // ローカルストレージから進捗を読み込み
  return getProgress();
}

// ==================== ユーティリティ ====================

function resetProgress() {
  if (confirm('すべての進捗データをリセットしますか？')) {
    localStorage.removeItem(STORAGE_KEYS.progress);
    localStorage.removeItem(STORAGE_KEYS.scores);
    initializeApp();
  }
}

// デバッグ用（開発時のみ）
if (window.location.hostname === 'localhost') {
  window.AppState = AppState;
  window.resetProgress = resetProgress;
  console.log('Debug mode: AppState and resetProgress() available');
}

// ==================== 復習モード ====================

// 復習モードを表示
function showReviewMode() {
  updateReviewModeStats();
  renderReviewQuestions();
  showScreen('reviewModeScreen');
  
  // 初めて復習画面を開いた時のガイド（復習問題が0問の場合）
  if (typeof ReviewSystem !== 'undefined') {
    const wrongAnswers = ReviewSystem.getWrongAnswers();
    if (wrongAnswers.length === 0 && typeof Secretary !== 'undefined') {
      Secretary.showMessage('📚 復習システムへようこそ！まずはテストを解いて、間違えた問題を記録しましょう。', 'encouraging', 4000);
    } else if (wrongAnswers.length > 0 && typeof Secretary !== 'undefined') {
      Secretary.showMessage(`現在${wrongAnswers.length}問が復習リストに登録されています。一緒に弱点を克服しましょう！`, 'normal', 3000);
    }
  }
}

// 復習統計を更新
function updateReviewModeStats() {
  if (typeof ReviewSystem === 'undefined') return;
  
  const progress = ReviewSystem.getReviewProgress();
  
  // 統計を更新
  const needReviewEl = document.getElementById('reviewStatsNeedReview');
  const masteredEl = document.getElementById('reviewStatsMastered');
  const avgWrongEl = document.getElementById('reviewStatsAvgWrong');
  
  if (needReviewEl) needReviewEl.textContent = `${progress.needReview}問`;
  if (masteredEl) masteredEl.textContent = `${progress.mastered}問`;
  if (avgWrongEl) avgWrongEl.textContent = `${progress.averageWrongCount.toFixed(1)}回`;
}

// 復習問題リストを描画
function renderReviewQuestions(category = 'all') {
  if (typeof ReviewSystem === 'undefined') return;
  
  const allWrongAnswers = ReviewSystem.getWrongAnswers();
  const wrongAnswers = category === 'all' 
    ? allWrongAnswers 
    : allWrongAnswers.filter(q => q.category === category);
  
  const listContainer = document.getElementById('reviewQuestionsList');
  const noQuestionsEl = document.getElementById('noReviewQuestions');
  const startBtn = document.getElementById('startReviewBtn');
  
  if (wrongAnswers.length === 0) {
    listContainer.style.display = 'none';
    noQuestionsEl.style.display = 'block';
    // ボタンは常に表示（クリック時にガイドメッセージを表示）
    if (startBtn) startBtn.style.display = 'inline-block';
    return;
  }
  
  listContainer.style.display = 'flex';
  noQuestionsEl.style.display = 'none';
  if (startBtn) startBtn.style.display = 'inline-block';
  
  // カテゴリ別フィルターボタンを生成
  renderCategoryFilters();
  
  // 優先度でソート（間違い回数が多い順）
  const sorted = [...wrongAnswers].sort((a, b) => {
    if (b.wrongCount !== a.wrongCount) {
      return b.wrongCount - a.wrongCount;
    }
    return b.lastWrong - a.lastWrong;
  });
  
  listContainer.innerHTML = '';
  
  sorted.forEach((item, index) => {
    const card = document.createElement('div');
    card.style.cssText = 'background: white; border: 2px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; transition: all 0.2s; cursor: pointer;';
    card.onmouseover = () => {
      card.style.borderColor = '#ff6b6b';
      card.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    };
    card.onmouseout = () => {
      card.style.borderColor = '#e5e7eb';
      card.style.boxShadow = 'none';
    };
    
    // 優先度バッジ
    let priorityBadge = '';
    let priorityColor = '';
    if (item.wrongCount >= 3) {
      priorityBadge = '🔥 超高';
      priorityColor = '#ef4444';
    } else if (item.wrongCount >= 2) {
      priorityBadge = '⚠️ 高';
      priorityColor = '#f59e0b';
    } else {
      priorityBadge = '📌 中';
      priorityColor = '#3b82f6';
    }
    
    // マスター進捗
    const masteredProgress = item.masteredCount > 0 
      ? `<span style="color: #10b981; font-weight: 600;">✓ 正解 ${item.masteredCount}/3回</span>` 
      : '';
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <span style="background: ${priorityColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 600;">
            ${priorityBadge}
          </span>
          <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; font-weight: 600;">
            ${item.category || '不明'}
          </span>
          ${masteredProgress}
        </div>
        <span style="color: #6b7280; font-size: 0.875rem;">
          間違い: ${item.wrongCount}回
        </span>
      </div>
      <p style="font-size: 1rem; line-height: 1.6; color: #1f2937; margin-bottom: 0.75rem;">
        ${item.questionText}
      </p>
      <div style="display: flex; justify-content: space-between; align-items: center; color: #6b7280; font-size: 0.875rem;">
        <span>最後の間違い: ${formatDate(item.lastWrong)}</span>
        ${item.lastReview ? `<span style="color: #10b981;">復習済み: ${formatDate(item.lastReview)}</span>` : ''}
      </div>
    `;
    
    listContainer.appendChild(card);
  });
}

// カテゴリ別フィルターを描画
function renderCategoryFilters() {
  if (typeof ReviewSystem === 'undefined') return;
  
  const stats = ReviewSystem.getWrongAnswerStats();
  const container = document.getElementById('categoryFilters');
  
  if (!container) return;
  
  // 「すべて」ボタンは既にHTMLに存在
  const existingAll = container.querySelector('[data-category="all"]');
  
  // 既存のカテゴリボタンを削除（「すべて」以外）
  const categoryButtons = container.querySelectorAll('.filter-btn:not([data-category="all"])');
  categoryButtons.forEach(btn => btn.remove());
  
  // カテゴリボタンを追加
  Object.keys(stats).forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.dataset.category = category;
    button.textContent = `${category} (${stats[category].count})`;
    button.style.cssText = 'padding: 0.5rem 1rem; border-radius: 0.5rem; border: 2px solid #e5e7eb; background: white; color: #1f2937; font-weight: 600; cursor: pointer; transition: all 0.2s;';
    button.onclick = () => filterReviewQuestions(category);
    container.appendChild(button);
  });
}

// 復習問題をフィルター
function filterReviewQuestions(category) {
  // すべてのフィルターボタンの状態を更新
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.style.background = '#3b82f6';
      btn.style.color = 'white';
      btn.style.borderColor = '#3b82f6';
      btn.classList.add('active');
    } else {
      btn.style.background = 'white';
      btn.style.color = '#1f2937';
      btn.style.borderColor = '#e5e7eb';
      btn.classList.remove('active');
    }
  });
  
  // 問題リストを再描画
  renderReviewQuestions(category);
}

// 復習テストを開始
function startReviewTest() {
  console.log('🔄 復習テスト開始関数が呼ばれました');
  
  if (typeof ReviewSystem === 'undefined') {
    console.error('❌ ReviewSystemが読み込まれていません');
    alert('復習システムが読み込まれていません。ページをリロードしてください。');
    return;
  }
  
  console.log('✅ ReviewSystemが利用可能です');
  
  const wrongAnswersCount = ReviewSystem.getWrongAnswers().length;
  console.log(`📊 間違えた問題数: ${wrongAnswersCount}問`);
  
  const reviewQuestions = ReviewSystem.generateReviewTest(30);
  
  console.log(`📊 生成された復習問題数: ${reviewQuestions ? reviewQuestions.length : 0}問`);
  
  if (!reviewQuestions || reviewQuestions.length === 0) {
    // 復習問題がない場合、視覚的なガイドを表示
    if (typeof Secretary !== 'undefined') {
      Secretary.showMessage('📝 まだ復習する問題がありません。新しいテストで問題を解きましょう！', 'encouraging', 5000);
    }
    
    // ユーザーをホーム画面に誘導
    const shouldGoHome = confirm('📚 復習する問題がまだありません。\n\nまずはテストを解いて、間違えた問題を記録しましょう！\n復習システムが自動的に弱点を管理します。\n\n💡 今すぐホーム画面に戻ってテストを開始しますか？');
    
    if (shouldGoHome) {
      showHome();
    }
    return;
  }
  
  console.log('🚀 復習モードを開始します');
  
  // 復習モードで問題を開始
  AppState.currentTestNumber = null; // 復習モード
  AppState.currentQuestionIndex = 0;
  AppState.userAnswers = [];
  AppState.startTime = Date.now();
  AppState.shuffledQuestions = reviewQuestions;
  
  // 秘書にテスト開始を通知
  if (typeof Secretary !== 'undefined') {
    Secretary.showMessage('復習頑張ってください！弱点を克服しましょう！', 'normal', 3000);
  }
  
  startTimer();
  renderQuestion();
  showScreen('questionScreen');
  
  console.log('✅ 復習テスト画面に移行しました');
}

// 日付フォーマット
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // 1分未満
  if (diff < 60000) {
    return 'たった今';
  }
  // 1時間未満
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分前`;
  }
  // 24時間未満
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}時間前`;
  }
  // 7日未満
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}日前`;
  }
  
  // それ以上は日付表示
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}/${month}/${day}`;
}

// ホーム画面で復習カードを更新
function updateReviewModeCard() {
  if (typeof ReviewSystem === 'undefined') return;
  
  const progress = ReviewSystem.getReviewProgress();
  const card = document.getElementById('reviewModeCard');
  const countEl = document.getElementById('reviewCount');
  
  if (!card || !countEl) return;
  
  if (progress.needReview > 0) {
    card.style.display = 'block';
    countEl.textContent = `${progress.needReview}問`;
  } else {
    card.style.display = 'none';
  }
}

// 今日の復習カードを更新（スペースドリピティション）
function updateTodayReviewCard() {
  if (typeof SpacedRepetition === 'undefined') return;
  
  const stats = SpacedRepetition.getStatistics();
  const card = document.getElementById('todayReviewCard');
  const dueCountEl = document.getElementById('todayReviewDueCount');
  const overdueCountEl = document.getElementById('todayReviewOverdueCount');
  const statsEl = document.getElementById('todayReviewStats');
  
  if (!card || !dueCountEl || !overdueCountEl || !statsEl) return;
  
  // 復習が必要な問題がある場合のみ表示
  if (stats.dueToday > 0 || stats.overdue > 0) {
    card.style.display = 'block';
    dueCountEl.textContent = `${stats.dueToday}問`;
    overdueCountEl.textContent = `${stats.overdue}問`;
    
    // 統計情報を表示
    statsEl.innerHTML = `
      📊 平均記憶定着率: ${stats.averageRetention}% | 
      👑 マスター済み: ${stats.mastered}問 | 
      ⚠️ 高リスク: ${stats.highRiskCount}問
    `;
  } else {
    card.style.display = 'none';
  }
}

// 今日の復習を開始
function startTodayReview() {
  if (typeof SpacedRepetition === 'undefined' || typeof ReviewSystem === 'undefined') {
    alert('スペースドリピティションシステムが利用できません。');
    return;
  }
  
  const dueQuestions = SpacedRepetition.getDueQuestions();
  
  if (dueQuestions.length === 0) {
    alert('今日復習すべき問題はありません！素晴らしいです！🎉');
    return;
  }
  
  // 復習モードを開始（優先度付きで問題を取得）
  startReviewTest();
}

// ==================== 弱点分析 ====================

let weaknessChart = null; // Chart.jsインスタンスを保持

// 弱点分析表示を更新
function updateWeaknessAnalysisDisplay() {
  if (typeof WeaknessAnalysis === 'undefined') return;
  
  const report = WeaknessAnalysis.generateReport();
  
  // データがない場合は非表示
  if (report.overall.totalQuestions === 0) {
    const card = document.getElementById('weaknessAnalysisCard');
    if (card) card.style.display = 'none';
    return;
  }
  
  // カードを表示
  const card = document.getElementById('weaknessAnalysisCard');
  if (card) card.style.display = 'block';
  
  // ヘッダー統計を更新
  const accuracyEl = document.getElementById('weaknessOverallAccuracy');
  const totalEl = document.getElementById('weaknessTotalQuestions');
  
  if (accuracyEl) accuracyEl.textContent = `${report.overall.accuracy}%`;
  if (totalEl) totalEl.textContent = `${report.overall.totalQuestions}問`;
  
  // クイックビューを描画
  renderWeaknessQuickView(report.categories);
  
  // 詳細パネルを描画
  renderWeaknessDetailPanel(report);
}

// 弱点分析クイックビューを描画
function renderWeaknessQuickView(categories) {
  const container = document.getElementById('weaknessQuickView');
  if (!container) return;
  
  container.innerHTML = '';
  
  categories.forEach(category => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${category.total > 0 ? '#f9fafb' : '#f3f4f6'};
      border: 2px solid ${category.color};
      border-radius: 0.75rem;
      padding: 1rem;
      text-align: center;
      transition: all 0.2s;
      cursor: pointer;
    `;
    
    if (category.total > 0) {
      card.onmouseover = () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
      };
      card.onmouseout = () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
      };
    }
    
    const accuracyColor = category.accuracy >= 85 ? '#10b981' : category.accuracy >= 70 ? '#f59e0b' : '#ef4444';
    
    card.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${category.icon}</div>
      <div style="font-size: 0.875rem; font-weight: 600; color: #1f2937; margin-bottom: 0.5rem;">${category.name}</div>
      <div style="font-size: 1.75rem; font-weight: 700; color: ${accuracyColor};">
        ${category.total > 0 ? `${category.accuracy}%` : '--'}
      </div>
      <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
        ${category.total}問
      </div>
    `;
    
    container.appendChild(card);
  });
}

// 弱点分析詳細パネルを描画
function renderWeaknessDetailPanel(report) {
  // 統計更新
  const accuracyEl = document.getElementById('weaknessDetailAccuracy');
  const totalEl = document.getElementById('weaknessDetailTotal');
  const weakEl = document.getElementById('weaknessDetailWeak');
  const strongEl = document.getElementById('weaknessDetailStrong');
  
  if (accuracyEl) accuracyEl.textContent = `${report.overall.accuracy}%`;
  if (totalEl) totalEl.textContent = `${report.overall.totalQuestions}問`;
  if (weakEl) weakEl.textContent = `${report.weakCategories.length}個`;
  if (strongEl) strongEl.textContent = `${report.strongCategories.length}個`;
  
  // 学習推奨を描画
  renderWeaknessRecommendations(report.recommendations);
  
  // カテゴリ詳細リストを描画
  renderWeaknessCategoryList(report.categories);
}

// 学習推奨を描画
function renderWeaknessRecommendations(recommendations) {
  const container = document.getElementById('weaknessRecommendations');
  if (!container) return;
  
  container.innerHTML = '<h3 style="margin-bottom: 1rem; color: #1f2937;">💡 学習推奨</h3>';
  
  recommendations.forEach(rec => {
    const priorityColor = rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981';
    
    const recCard = document.createElement('div');
    recCard.style.cssText = `
      background: ${rec.priority === 'high' ? '#fef2f2' : rec.priority === 'medium' ? '#fffbeb' : '#ecfdf5'};
      border-left: 4px solid ${priorityColor};
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1rem;
    `;
    
    recCard.innerHTML = `
      <div style="display: flex; align-items: start; gap: 0.75rem;">
        <span style="font-size: 1.5rem;">${rec.icon}</span>
        <div style="flex: 1;">
          <h4 style="font-weight: 700; color: #1f2937; margin-bottom: 0.5rem;">${rec.title}</h4>
          <p style="color: #6b7280; line-height: 1.6;">${rec.message}</p>
        </div>
      </div>
    `;
    
    container.appendChild(recCard);
  });
}

// カテゴリ詳細リストを描画
function renderWeaknessCategoryList(categories) {
  const container = document.getElementById('weaknessCategoryList');
  if (!container) return;
  
  container.innerHTML = '<h3 style="margin-bottom: 1rem; color: #1f2937;">📋 カテゴリ別詳細</h3>';
  
  categories.forEach(category => {
    const accuracyColor = category.accuracy >= 85 ? '#10b981' : category.accuracy >= 70 ? '#f59e0b' : '#ef4444';
    const statusIcon = category.accuracy >= 85 ? '✅' : category.accuracy >= 70 ? '📈' : '⚠️';
    const statusText = category.accuracy >= 85 ? '得意' : category.accuracy >= 70 ? '改善中' : '弱点';
    
    const card = document.createElement('div');
    card.style.cssText = `
      background: white;
      border: 2px solid ${category.color};
      border-radius: 0.75rem;
      padding: 1.5rem;
      transition: all 0.2s;
    `;
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <span style="font-size: 2.5rem;">${category.icon}</span>
          <div>
            <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; color: #1f2937;">
              ${category.name}
            </h4>
            <p style="font-size: 0.875rem; color: #6b7280;">
              ${category.description}
            </p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.875rem; color: ${accuracyColor}; font-weight: 600; margin-bottom: 0.25rem;">
            ${statusIcon} ${statusText}
          </div>
          <div style="font-size: 1.75rem; font-weight: 700; color: ${accuracyColor};">
            ${category.total > 0 ? `${category.accuracy}%` : '--'}
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
        <div>
          <div style="font-size: 0.75rem; color: #6b7280;">正解</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #10b981;">${category.correct}問</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: #6b7280;">不正解</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #ef4444;">${category.incorrect}問</div>
        </div>
        <div>
          <div style="font-size: 0.75rem; color: #6b7280;">合計</div>
          <div style="font-size: 1.25rem; font-weight: 700; color: #3b82f6;">${category.total}問</div>
        </div>
      </div>
      ${category.trend.length > 0 ? `
        <div style="margin-top: 1rem;">
          <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">最近の傾向（直近${category.trend.length}回）</div>
          <div style="display: flex; gap: 0.25rem;">
            ${category.trend.map(t => `<div style="flex: 1; height: 8px; border-radius: 4px; background: ${t === 1 ? '#10b981' : '#ef4444'};"></div>`).join('')}
          </div>
        </div>
      ` : ''}
    `;
    
    container.appendChild(card);
  });
}

// 弱点分析パネルをトグル
function toggleWeaknessPanel() {
  const panel = document.getElementById('weaknessDetailPanel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderWeaknessChart();
  } else {
    panel.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// 弱点分析を表示
function showWeaknessAnalysis() {
  toggleWeaknessPanel();
}

// Chart.jsでチャートを描画
function renderWeaknessChart() {
  if (typeof WeaknessAnalysis === 'undefined' || typeof Chart === 'undefined') return;
  
  const canvas = document.getElementById('weaknessChart');
  if (!canvas) return;
  
  // 既存のチャートを破棄
  if (weaknessChart) {
    weaknessChart.destroy();
  }
  
  const chartData = WeaknessAnalysis.getChartData();
  
  weaknessChart = new Chart(canvas, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `正答率: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      }
    }
  });
}

// ==================== デイリーミッション ====================

// デイリーミッション表示を更新
function updateDailyMissionsDisplay() {
  if (typeof DailyMissions === 'undefined') return;
  
  const missions = DailyMissions.getTodayMissions();
  const stats = DailyMissions.getMissionStats();
  
  // ヘッダー統計を更新
  const completedEl = document.getElementById('missionsCompleted');
  const pointsEl = document.getElementById('missionsPoints');
  
  if (completedEl) completedEl.textContent = `${stats.completedCount}/${stats.totalCount}`;
  if (pointsEl) pointsEl.textContent = `${stats.todayPoints}pt`;
  
  // クイックビューを描画
  renderMissionsQuickView(missions);
  
  // 詳細パネルを描画
  renderMissionsDetailPanel(missions, stats);
}

// ミッションクイックビューを描画
function renderMissionsQuickView(missions) {
  const container = document.getElementById('missionsQuickView');
  if (!container) return;
  
  container.innerHTML = '';
  
  // 最初の3つのミッションのみ表示
  missions.slice(0, 3).forEach(mission => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${mission.completed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f9fafb'};
      border: 2px solid ${mission.completed ? '#10b981' : '#e5e7eb'};
      border-radius: 0.75rem;
      padding: 1rem;
      transition: all 0.2s;
      cursor: pointer;
    `;
    
    if (!mission.completed) {
      card.onmouseover = () => {
        card.style.borderColor = '#3b82f6';
        card.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
      };
      card.onmouseout = () => {
        card.style.borderColor = '#e5e7eb';
        card.style.boxShadow = 'none';
      };
    }
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
        <span style="font-size: 1.5rem;">${mission.icon}</span>
        <span style="font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: ${mission.completed ? 'rgba(255,255,255,0.3)' : '#dbeafe'}; color: ${mission.completed ? 'white' : '#1e40af'}; font-weight: 600;">
          ${mission.completed ? '達成！' : `${mission.progress}/${mission.target}`}
        </span>
      </div>
      <div style="font-weight: 600; color: ${mission.completed ? 'white' : '#1f2937'}; margin-bottom: 0.5rem; font-size: 0.95rem;">
        ${mission.title}
      </div>
      <div style="background: ${mission.completed ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}; height: 6px; border-radius: 3px; overflow: hidden;">
        <div style="background: ${mission.completed ? 'white' : '#3b82f6'}; height: 100%; width: ${mission.progressPercentage}%; transition: width 0.3s;"></div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// ミッション詳細パネルを描画
function renderMissionsDetailPanel(missions, stats) {
  const listContainer = document.getElementById('missionsDetailList');
  const completionRateEl = document.getElementById('missionCompletionRate');
  const todayPointsEl = document.getElementById('missionTodayPoints');
  const totalPointsEl = document.getElementById('missionTotalPoints');
  
  if (completionRateEl) completionRateEl.textContent = `${stats.completionRate}%`;
  if (todayPointsEl) todayPointsEl.textContent = `${stats.todayPoints}pt`;
  if (totalPointsEl) totalPointsEl.textContent = `${stats.totalPoints}pt`;
  
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  
  missions.forEach(mission => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${mission.completed ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'white'};
      border: 2px solid ${mission.completed ? '#10b981' : '#e5e7eb'};
      border-radius: 0.75rem;
      padding: 1.5rem;
      color: ${mission.completed ? 'white' : '#1f2937'};
      transition: all 0.2s;
    `;
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
        <div style="display: flex; gap: 1rem; align-items: center;">
          <span style="font-size: 2.5rem;">${mission.icon}</span>
          <div>
            <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem; color: ${mission.completed ? 'white' : '#1f2937'};">
              ${mission.title}
            </h4>
            <p style="font-size: 0.875rem; opacity: ${mission.completed ? '0.9' : '0.7'}; color: ${mission.completed ? 'white' : '#6b7280'};">
              ${mission.description}
            </p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.5rem; font-weight: 700; color: ${mission.completed ? 'white' : '#f59e0b'};">
            +${mission.reward}pt
          </div>
          <div style="font-size: 0.875rem; opacity: 0.8; margin-top: 0.25rem;">
            ${mission.completed ? '✓ 達成済み' : `進捗: ${mission.progress}/${mission.target}`}
          </div>
        </div>
      </div>
      <div style="background: ${mission.completed ? 'rgba(255,255,255,0.2)' : '#f3f4f6'}; height: 8px; border-radius: 4px; overflow: hidden;">
        <div style="background: ${mission.completed ? 'white' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'}; height: 100%; width: ${mission.progressPercentage}%; transition: width 0.3s;"></div>
      </div>
    `;
    
    listContainer.appendChild(card);
  });
}

// ミッションパネルをトグル
function toggleMissionsPanel() {
  const panel = document.getElementById('missionsDetailPanel');
  if (!panel) return;
  
  if (panel.style.display === 'none' || !panel.style.display) {
    panel.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    panel.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// ==================== 学習ストリーク ====================

// ストリーク表示を更新
function updateStreakDisplay() {
  if (typeof StreakSystem === 'undefined') return;
  
  const stats = StreakSystem.getStreakStats();
  
  // 現在のストリーク
  const currentStreakEl = document.getElementById('currentStreak');
  const longestStreakEl = document.getElementById('longestStreak');
  const totalStudyDaysEl = document.getElementById('totalStudyDays');
  const totalStudyTimeEl = document.getElementById('totalStudyTime');
  const streakStatusEl = document.getElementById('streakStatus');
  
  if (currentStreakEl) currentStreakEl.textContent = `${stats.currentStreak}日`;
  if (longestStreakEl) longestStreakEl.textContent = `${stats.longestStreak}日`;
  if (totalStudyDaysEl) totalStudyDaysEl.textContent = `${stats.totalStudyDays}日`;
  if (totalStudyTimeEl) totalStudyTimeEl.textContent = stats.totalStudyTimeFormatted;
  if (streakStatusEl) streakStatusEl.textContent = stats.message;
}

// ==================== マイスコア画面 ====================

// マイスコア画面を表示
function showMyScorePage() {
  const history = loadTestHistory();
  
  if (history.length === 0) {
    // テスト履歴がない場合
    document.getElementById('noScoreHistory').style.display = 'block';
    document.getElementById('scoreHistoryChart').style.display = 'none';
    document.getElementById('noScoreHistoryList').style.display = 'block';
    document.getElementById('scoreHistoryList').style.display = 'none';
  } else {
    // 最新のテスト結果を表示
    const latestTest = history[history.length - 1];
    updateMyScoreDisplay(latestTest);
    
    // グラフを描画
    renderScoreHistoryChart(history);
    
    // 履歴リストを表示
    renderScoreHistoryList(history);
    
    document.getElementById('noScoreHistory').style.display = 'none';
    document.getElementById('scoreHistoryChart').style.display = 'block';
    document.getElementById('noScoreHistoryList').style.display = 'none';
    document.getElementById('scoreHistoryList').style.display = 'flex';
  }
  
  showScreen('myScoreScreen');
}

// マイスコア画面の表示を更新
function updateMyScoreDisplay(testResult) {
  const prediction = predictTOEICScore(testResult.score, 30);
  const percentage = Math.round((testResult.score / 30) * 100);
  const date = new Date(testResult.timestamp);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  
  document.getElementById('myScorePart5').textContent = prediction.part5Score;
  document.getElementById('myScoreReading').textContent = prediction.readingScore;
  document.getElementById('myScoreTotal').textContent = `${prediction.minTotalScore}-${prediction.maxTotalScore}`;
  document.getElementById('myScoreAccuracy').textContent = `${percentage}%`;
  document.getElementById('myScoreLevel').textContent = prediction.level;
  document.getElementById('myScoreDate').textContent = dateStr;
}

// テスト履歴を読み込む
function loadTestHistory() {
  const stored = localStorage.getItem(STORAGE_KEYS.scores);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('テスト履歴の読み込みに失敗:', e);
    return [];
  }
}

// ホーム画面のスコア予測セクションを更新
function updateHomeScorePrediction() {
  const history = loadTestHistory();
  
  if (history.length === 0) {
    document.getElementById('latestScorePrediction').style.display = 'none';
    return;
  }
  
  const latestTest = history[history.length - 1];
  const prediction = predictTOEICScore(latestTest.score, 30);
  const date = new Date(latestTest.timestamp);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  
  document.getElementById('homePart5Score').textContent = prediction.part5Score;
  document.getElementById('homeReadingScore').textContent = prediction.readingScore;
  document.getElementById('homeTotalScore').textContent = `${prediction.minTotalScore}-${prediction.maxTotalScore}`;
  document.getElementById('homeScoreLevel').textContent = prediction.level;
  document.getElementById('homeScoreDate').textContent = `前回テスト: ${dateStr}`;
  
  document.getElementById('latestScorePrediction').style.display = 'block';
}

// スコア履歴グラフを描画
function renderScoreHistoryChart(history) {
  const canvas = document.getElementById('scoreHistoryChart');
  const ctx = canvas.getContext('2d');
  
  // 過去10回分のみ表示
  const recentHistory = history.slice(-10);
  
  const labels = recentHistory.map((test, index) => {
    const date = new Date(test.timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const part5Scores = recentHistory.map(test => {
    const prediction = predictTOEICScore(test.score, 30);
    return prediction.part5Score;
  });
  
  const readingScores = recentHistory.map(test => {
    const prediction = predictTOEICScore(test.score, 30);
    return prediction.readingScore;
  });
  
  // 既存のチャートを破棄
  if (window.scoreChart) {
    window.scoreChart.destroy();
  }
  
  // Chart.jsを使用してグラフを描画
  window.scoreChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'PART5予測スコア',
          data: part5Scores,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'リーディング予測',
          data: readingScores,
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.y + '点';
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'PART5スコア'
          },
          min: 0,
          max: 200
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'リーディングスコア'
          },
          min: 0,
          max: 495,
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// テスト履歴リストを表示
function renderScoreHistoryList(history) {
  const listContainer = document.getElementById('scoreHistoryList');
  listContainer.innerHTML = '';
  
  // 新しい順に表示
  const reversedHistory = [...history].reverse();
  
  reversedHistory.forEach((test, index) => {
    const prediction = predictTOEICScore(test.score, 30);
    const percentage = Math.round((test.score / 30) * 100);
    const date = new Date(test.timestamp);
    const dateStr = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    
    const item = document.createElement('div');
    item.style.cssText = `
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1.5rem;
      align-items: center;
      transition: all 0.2s;
      cursor: pointer;
    `;
    
    item.onmouseover = function() {
      this.style.background = '#f3f4f6';
      this.style.borderColor = '#d1d5db';
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    };
    
    item.onmouseout = function() {
      this.style.background = '#f9fafb';
      this.style.borderColor = '#e5e7eb';
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    };
    
    item.innerHTML = `
      <div style="font-size: 2rem;">📝</div>
      <div>
        <div style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">${dateStr}</div>
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 0.5rem;">テスト${test.testNumber || (history.length - index)}</div>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <span style="font-size: 0.875rem; color: #667eea; font-weight: 600;">PART5: ${prediction.part5Score}点</span>
          <span style="font-size: 0.875rem; color: #f093fb; font-weight: 600;">リーディング: ${prediction.readingScore}点</span>
          <span style="font-size: 0.875rem; color: #6b7280;">正答率: ${percentage}%</span>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 1.5rem; font-weight: 700; color: #4facfe;">${prediction.minTotalScore}-${prediction.maxTotalScore}</div>
        <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">総合予測</div>
      </div>
    `;
    
    listContainer.appendChild(item);
  });
}

// 週間カレンダーを更新（削除済み - 2025-12-08）
// function updateWeeklyCalendar() {
//   過去7日間の表示は削除されました
// }

// initializeApp に追加
const originalInitializeApp = initializeApp;
initializeApp = function() {
  originalInitializeApp();
  updateReviewModeCard();
  updateStreakDisplay();
  updateDailyMissionsDisplay();
  updateWeaknessAnalysisDisplay();
  updateMistakeNotebookCard();
};

// showHome に追加
const originalShowHome = showHome;
showHome = function() {
  originalShowHome();
  updateReviewModeCard();
  updateStreakDisplay();
  updateDailyMissionsDisplay();
  updateWeaknessAnalysisDisplay();
  updateMistakeNotebookCard();
};

// エクスポート
window.showHome = showHome;
window.startTest = startTest;
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.finishTest = finishTest;
window.reviewWrongQuestions = reviewWrongQuestions;
window.showReviewMode = showReviewMode;
window.filterReviewQuestions = filterReviewQuestions;
window.startReviewTest = startReviewTest;
window.updateDailyMissionsDisplay = updateDailyMissionsDisplay;
window.toggleMissionsPanel = toggleMissionsPanel;
window.showWeaknessAnalysis = showWeaknessAnalysis;
window.toggleWeaknessPanel = toggleWeaknessPanel;

// ==================== 苦手問題集中特訓モード ====================

// 苦手問題集中特訓カードを更新
function updateWeaknessTrainingCard() {
  if (typeof WeaknessTraining === 'undefined') return;
  
  const card = document.getElementById('weaknessTrainingCard');
  if (!card) return;
  
  const weakCategories = WeaknessTraining.getWeakCategories();
  
  // 苦手カテゴリがない場合はカードを非表示
  if (weakCategories.length === 0) {
    card.style.display = 'none';
    return;
  }
  
  // カードを表示
  card.style.display = 'block';
  
  // 苦手カテゴリリストを表示
  const categoryListEl = document.getElementById('weaknessCategoryList');
  if (categoryListEl) {
    categoryListEl.innerHTML = weakCategories.map(cat => {
      const categoryInfo = WeaknessAnalysis.categories[cat.category];
      return `<span style="background: rgba(255,255,255,0.25); padding: 0.375rem 0.75rem; border-radius: 0.375rem; font-size: 0.85rem; font-weight: 600; backdrop-filter: blur(10px);">
        ${categoryInfo.icon} ${cat.category} (${cat.accuracy}%)
      </span>`;
    }).join('');
  }
}

// 苦手問題集中特訓モードを開始
function startWeaknessTrainingMode() {
  if (typeof WeaknessTraining === 'undefined') {
    alert('苦手問題集中特訓システムが読み込まれていません。');
    return;
  }
  
  const weakCategories = WeaknessTraining.getWeakCategories();
  
  if (weakCategories.length === 0) {
    alert('まずはテストを受けて、あなたの弱点を分析しましょう！\n\n正答率50%未満のカテゴリが見つかると、集中特訓モードを開始できます。');
    return;
  }
  
  // 特訓モードを初期化
  const success = WeaknessTraining.startTraining();
  
  if (!success) {
    alert('特訓用の問題が見つかりませんでした。\nもう少しテストを受けてデータを蓄積してください。');
    return;
  }
  
  // AppStateに特訓モード用の状態を追加
  AppState.weaknessTrainingMode = true;
  AppState.weaknessTrainingIndex = 0;
  AppState.weaknessTrainingAnswers = [];
  AppState.weaknessTrainingStartTime = Date.now();
  
  // タイマー開始
  startWeaknessTrainingTimer();
  
  // 最初の問題を表示
  renderWeaknessTrainingQuestion();
  
  // 特訓画面を表示
  showScreen('weaknessTrainingScreen');
  
  // 秘書に通知
  if (typeof Secretary !== 'undefined') {
    Secretary.react('training_start');
  }
}

// 苦手問題集中特訓用タイマー開始
function startWeaknessTrainingTimer() {
  stopTimer(); // 既存タイマーを停止
  
  AppState.weaknessTrainingStartTime = Date.now();
  AppState.timerInterval = setInterval(() => {
    const timerEl = document.getElementById('weaknessTrainingTimer');
    if (timerEl) {
      const elapsed = Date.now() - AppState.weaknessTrainingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      timerEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }, 1000);
}

// 苦手問題集中特訓の問題を表示
function renderWeaknessTrainingQuestion() {
  if (typeof WeaknessTraining === 'undefined') return;
  
  const state = WeaknessTraining.getCurrentState();
  if (!state || !state.currentQuestion) return;
  
  const question = state.currentQuestion;
  const currentIndex = state.currentQuestionIndex;
  const totalQuestions = state.trainingQuestions.length;
  
  // ヘッダー更新
  document.getElementById('weaknessTrainingCurrentQ').textContent = currentIndex + 1;
  document.getElementById('weaknessTrainingTotalQ').textContent = totalQuestions;
  document.getElementById('weaknessTrainingMastered').textContent = state.masteredCategories.length;
  
  // 現在のカテゴリ情報を表示
  const categoryInfo = WeaknessAnalysis.categories[state.currentCategory];
  document.getElementById('trainingCategoryName').textContent = `${categoryInfo.icon} ${state.currentCategory}`;
  
  const categoryProgress = state.categoryProgress[state.currentCategory] || { correct: 0, total: 0 };
  document.getElementById('categoryCorrectCount').textContent = `${categoryProgress.correct}/${categoryProgress.total}`;
  document.getElementById('consecutiveCorrect').textContent = state.consecutiveCorrect;
  
  // 問題文を表示
  const questionTextEl = document.getElementById('weaknessTrainingQuestionText');
  questionTextEl.innerHTML = `<strong>Q${currentIndex + 1}.</strong> ${question.text}`;
  
  // 選択肢を表示
  const optionsContainer = document.getElementById('weaknessTrainingOptionsContainer');
  optionsContainer.innerHTML = '';
  
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option-btn';
    button.textContent = option;
    button.onclick = () => submitWeaknessTrainingAnswer(index);
    optionsContainer.appendChild(button);
  });
  
  // 解説を非表示にリセット
  const explanationBox = document.getElementById('weaknessTrainingExplanationBox');
  explanationBox.classList.add('hidden');
  
  // ナビゲーションボタンを更新
  updateWeaknessTrainingNavigation();
}

// 苦手問題集中特訓の解答を送信
function submitWeaknessTrainingAnswer(selectedIndex) {
  if (typeof WeaknessTraining === 'undefined') return;
  
  const state = WeaknessTraining.getCurrentState();
  if (!state || !state.currentQuestion) return;
  
  const question = state.currentQuestion;
  const isCorrect = selectedIndex === question.answer;
  
  // WeaknessTrainingシステムに解答を記録
  WeaknessTraining.submitAnswer(selectedIndex, isCorrect);
  
  // AppStateに解答を記録
  AppState.weaknessTrainingAnswers[AppState.weaknessTrainingIndex] = {
    questionId: question.id,
    userAnswer: selectedIndex,
    correctAnswer: question.answer,
    isCorrect: isCorrect,
    category: state.currentCategory
  };
  
  // 選択肢のボタンを無効化し、色を変更
  const optionsContainer = document.getElementById('weaknessTrainingOptionsContainer');
  const buttons = optionsContainer.querySelectorAll('.option-btn');
  
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === question.answer) {
      btn.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      btn.classList.add('wrong');
    }
  });
  
  // 解説を表示
  showWeaknessTrainingExplanation(question);
  
  // 秘書に反応させる
  if (typeof Secretary !== 'undefined') {
    Secretary.react(isCorrect ? 'correct' : 'wrong');
  }
  
  // ナビゲーションボタンを更新
  updateWeaknessTrainingNavigation();
}

// 苦手問題集中特訓の解説を表示
function showWeaknessTrainingExplanation(question) {
  const explanationBox = document.getElementById('weaknessTrainingExplanationBox');
  const explanationContent = document.getElementById('weaknessTrainingExplanationContent');
  
  explanationContent.innerHTML = `
    <p><strong>正解:</strong> ${question.options[question.answer]}</p>
    <p><strong>日本語訳:</strong> ${question.explanation.translation}</p>
    <p><strong>ポイント:</strong> ${question.explanation.keyPoint}</p>
    <p><strong>理由:</strong> ${question.explanation.reason}</p>
  `;
  
  explanationBox.classList.remove('hidden');
}

// 苦手問題集中特訓のナビゲーションを更新
function updateWeaknessTrainingNavigation() {
  if (typeof WeaknessTraining === 'undefined') return;
  
  const state = WeaknessTraining.getCurrentState();
  if (!state) return;
  
  const currentIndex = state.currentQuestionIndex;
  const totalQuestions = state.trainingQuestions.length;
  const hasAnswered = AppState.weaknessTrainingAnswers[currentIndex] !== undefined;
  
  const prevBtn = document.getElementById('weaknessPrevBtn');
  const nextBtn = document.getElementById('weaknessNextBtn');
  const finishBtn = document.getElementById('weaknessFinishBtn');
  
  // 前へボタン
  prevBtn.disabled = currentIndex === 0;
  
  // 次へボタン
  nextBtn.disabled = !hasAnswered;
  
  // 終了ボタン（最後の問題で解答済みの場合のみ表示）
  if (currentIndex === totalQuestions - 1 && hasAnswered) {
    nextBtn.classList.add('hidden');
    finishBtn.classList.remove('hidden');
  } else {
    nextBtn.classList.remove('hidden');
    finishBtn.classList.add('hidden');
  }
}

// 前の苦手問題へ
function previousWeaknessTrainingQuestion() {
  if (AppState.weaknessTrainingIndex > 0) {
    AppState.weaknessTrainingIndex--;
    WeaknessTraining.moveToPreviousQuestion();
    renderWeaknessTrainingQuestion();
  }
}

// 次の苦手問題へ
function nextWeaknessTrainingQuestion() {
  const state = WeaknessTraining.getCurrentState();
  if (!state) return;
  
  if (AppState.weaknessTrainingIndex < state.trainingQuestions.length - 1) {
    AppState.weaknessTrainingIndex++;
    WeaknessTraining.moveToNextQuestion();
    renderWeaknessTrainingQuestion();
  }
}

// 苦手問題集中特訓を終了
function finishWeaknessTrainingTest() {
  stopTimer();
  
  if (typeof WeaknessTraining === 'undefined') return;
  
  const result = WeaknessTraining.finishTraining();
  
  if (!result) {
    alert('特訓結果の取得に失敗しました。');
    showHome();
    return;
  }
  
  // 学習時間を記録
  const elapsedTime = Date.now() - AppState.weaknessTrainingStartTime;
  const elapsedSeconds = Math.floor(elapsedTime / 1000);
  StreakSystem.recordStudy(elapsedSeconds);
  
  // デイリーミッションを更新
  if (typeof DailyMissions !== 'undefined') {
    DailyMissions.completeTest(result.score, result.accuracy);
  }
  
  // 【NEW】絆レベルを更新(学習時間を追加)
  if (typeof SecretaryRoomExpansion !== 'undefined' && typeof SecretaryTeam !== 'undefined') {
    const currentSec = SecretaryTeam.getCurrentSecretary();
    if (currentSec) {
      SecretaryRoomExpansion.updateBondLevel(currentSec.id, Math.floor(elapsedSeconds / 60));
    }
  }
  
  // ボーナスポイントを付与
  let bonusPoints = 0;
  if (result.masteredCategories.length > 0) {
    bonusPoints = result.masteredCategories.length * 10; // 習熟したカテゴリ × 10pt
    if (typeof PointRewards !== 'undefined') {
      PointRewards.addPoints(bonusPoints, `特訓モード完了（${result.masteredCategories.length}カテゴリ習熟）`);
    }
  }
  
  // 結果を表示
  const masteredText = result.masteredCategories.length > 0 
    ? `\n🎉 習熟したカテゴリ: ${result.masteredCategories.join(', ')}\n💰 ボーナス: +${bonusPoints}pt`
    : '';
  
  alert(
    `🎯 苦手問題集中特訓 完了！\n\n` +
    `正解数: ${result.score}/${result.totalQuestions}問\n` +
    `正答率: ${result.accuracy}%\n` +
    `所要時間: ${Math.floor(elapsedSeconds / 60)}分${elapsedSeconds % 60}秒` +
    masteredText +
    `\n\n弱点克服、お疲れ様でした！💪`
  );
  
  // 秘書に通知
  if (typeof Secretary !== 'undefined') {
    Secretary.onTestComplete(result.score, result.totalQuestions);
  }
  
  // ホームに戻る
  showHome();
}

// グローバルスコープに公開
window.updateTodayReviewCard = updateTodayReviewCard;
window.startTodayReview = startTodayReview;
window.updateWeaknessTrainingCard = updateWeaknessTrainingCard;
window.startWeaknessTrainingMode = startWeaknessTrainingMode;
window.submitWeaknessTrainingAnswer = submitWeaknessTrainingAnswer;
window.previousWeaknessTrainingQuestion = previousWeaknessTrainingQuestion;
window.nextWeaknessTrainingQuestion = nextWeaknessTrainingQuestion;
window.finishWeaknessTrainingTest = finishWeaknessTrainingTest;

// ==================== Phase 1改善：統合復習ハブ ====================

// 統合復習ハブを更新
function updateUnifiedReviewHub() {
  if (typeof UnifiedReview === 'undefined') return;
  
  const hub = document.getElementById('unifiedReviewHub');
  if (!hub) return;
  
  const stats = UnifiedReview.getUnifiedStatistics();
  const categorized = UnifiedReview.categorizeProblems();
  
  // 問題がない場合は非表示
  if (stats.totalProblems === 0) {
    hub.style.display = 'none';
    return;
  }
  
  // ハブを表示
  hub.style.display = 'block';
  
  // 緊急セクション
  const urgentSection = document.getElementById('urgentSection');
  const urgentCount = document.getElementById('urgentCount');
  const urgentReasons = document.getElementById('urgentReasons');
  
  if (categorized.urgent.length > 0) {
    urgentSection.style.display = 'block';
    urgentCount.textContent = categorized.urgent.length;
    
    // 理由のサマリーを生成
    const overdueCount = categorized.urgent.filter(p => p.overdueDays && p.overdueDays > 0).length;
    const highRiskCount = categorized.urgent.filter(p => p.forgettingRisk >= 70).length;
    urgentReasons.innerHTML = `
      📅 ${overdueCount}問が期限切れ | 
      ⚠️ ${highRiskCount}問が超高リスク
    `;
  } else {
    urgentSection.style.display = 'none';
  }
  
  // 重要セクション
  const importantSection = document.getElementById('importantSection');
  const importantCount = document.getElementById('importantCount');
  const importantReasons = document.getElementById('importantReasons');
  
  if (categorized.important.length > 0) {
    importantSection.style.display = 'block';
    importantCount.textContent = categorized.important.length;
    
    const categoryStats = UnifiedReview.getCategoryStats();
    const topCategory = categoryStats.length > 0 ? categoryStats[0].category : '';
    importantReasons.innerHTML = `
      📊 ${topCategory}カテゴリが多め | 
      🧠 記憶定着が必要
    `;
  } else {
    importantSection.style.display = 'none';
  }
  
  // 推奨セクション
  const recommendedSection = document.getElementById('recommendedSection');
  const recommendedCount = document.getElementById('recommendedCount');
  const recommendedReasons = document.getElementById('recommendedReasons');
  
  if (categorized.recommended.length > 0) {
    recommendedSection.style.display = 'block';
    recommendedCount.textContent = categorized.recommended.length;
    
    const weakCategories = categorized.recommended
      .filter(p => p.source === 'weakness-category')
      .map(p => p.category);
    const uniqueCategories = [...new Set(weakCategories)].slice(0, 2);
    
    recommendedReasons.innerHTML = uniqueCategories.length > 0
      ? `📚 ${uniqueCategories.join('、')}が苦手`
      : '📚 弱点カテゴリの強化';
  } else {
    recommendedSection.style.display = 'none';
  }
}

// 統合復習を開始
function startUnifiedReview(category) {
  if (typeof UnifiedReview === 'undefined') {
    alert('統合復習システムが読み込まれていません。');
    return;
  }
  
  UnifiedReview.startReview(category);
}

// ==================== Phase 1改善：成長ダッシュボード ====================

// 成長ダッシュボードを更新
function updateGrowthDashboard() {
  if (typeof GrowthDashboard === 'undefined') return;
  
  const dashboard = document.getElementById('growthDashboard');
  if (!dashboard) return;
  
  // メソッドの存在確認
  if (typeof GrowthDashboard.calculateGrowthStats !== 'function') {
    console.warn('⚠️ GrowthDashboard.calculateGrowthStats is not available');
    return;
  }
  
  const stats = GrowthDashboard.calculateGrowthStats();
  
  // データがない場合は非表示
  if (stats.totalMastered === 0 && stats.currentScore === 500) {
    dashboard.style.display = 'none';
    return;
  }
  
  // ダッシュボードを表示
  dashboard.style.display = 'block';
  
  // 目標スコア進捗
  document.getElementById('dashboardTargetScore').textContent = `${stats.targetScore}点`;
  document.getElementById('dashboardCurrentScore').textContent = `${stats.currentScore}点`;
  document.getElementById('dashboardRemainingScore').textContent = `${stats.remainingPoints}点`;
  document.getElementById('dashboardProgressBar').style.width = `${stats.progressPercentage}%`;
  document.getElementById('dashboardProgressText').textContent = `${stats.progressPercentage}%達成`;
  
  // マスター進捗
  document.getElementById('dashboardMasteredCount').textContent = `${stats.totalMastered}問マスター`;
  document.getElementById('dashboardMasteryBar').style.width = `${stats.masteryByLevel.totalMastered / 450 * 100}%`;
  
  // masteryByLevel.byLevelが存在しない場合のnullチェック
  const byLevel = stats.masteryByLevel && stats.masteryByLevel.byLevel ? stats.masteryByLevel.byLevel : {};
  document.getElementById('dashboardPerfect').textContent = byLevel.perfect || 0;
  document.getElementById('dashboardExpert').textContent = byLevel.expert || 0;
  document.getElementById('dashboardAdvanced').textContent = byLevel.advanced || 0;
  
  // カテゴリ別習熟度
  const categoryList = document.getElementById('categoryProficiencyList');
  categoryList.innerHTML = '';
  
  stats.categoryProficiency.forEach(category => {
    if (category.totalQuestions === 0) return;
    
    const item = document.createElement('div');
    item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 0.5rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;';
    
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span>${category.icon}</span>
        <span>${category.label}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="flex: 1; background: rgba(0,0,0,0.2); height: 6px; border-radius: 3px; min-width: 80px;">
          <div style="background: ${category.status.color}; height: 100%; width: ${category.accuracy}%; border-radius: 3px; transition: width 0.3s;"></div>
        </div>
        <span style="min-width: 45px; text-align: right; font-weight: 600;">${category.accuracy}%</span>
        <span style="min-width: 50px; font-size: 0.85rem; opacity: 0.9;">${category.status.emoji} ${category.status.text}</span>
      </div>
    `;
    
    categoryList.appendChild(item);
  });
  
  // 学習推奨
  const recommendationsList = document.getElementById('recommendationsList');
  recommendationsList.innerHTML = '';
  
  if (stats.recommendations.length === 0) {
    recommendationsList.innerHTML = '<p style="opacity: 0.8; font-size: 0.9rem;">素晴らしい！今のところ特に優先すべきことはありません。</p>';
  } else {
    const topRecommendation = stats.recommendations[0];
    
    const recItem = document.createElement('div');
    recItem.style.cssText = 'background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid ' + (topRecommendation.priority === 'critical' ? '#ef4444' : topRecommendation.priority === 'high' ? '#f59e0b' : '#3b82f6');
    
    recItem.innerHTML = `
      <div style="display: flex; align-items: start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        <div style="flex: 1;">
          <h5 style="font-size: 1.1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            ${topRecommendation.icon} ${topRecommendation.title}
          </h5>
          <p style="opacity: 0.9; font-size: 0.9rem; margin-bottom: 0.5rem;">
            ${topRecommendation.description}
          </p>
          <p style="opacity: 0.85; font-size: 0.85rem; color: #fbbf24;">
            💡 ${topRecommendation.impact}
          </p>
        </div>
        <button class="btn" style="background: white; color: #059669; font-weight: 700; padding: 0.75rem 1.5rem; font-size: 0.95rem; border: none; cursor: pointer; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s; white-space: nowrap;" onclick="${topRecommendation.actionFunction}(${topRecommendation.actionParam ? `'${topRecommendation.actionParam}'` : ''})" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          ${topRecommendation.action} →
        </button>
      </div>
    `;
    
    recommendationsList.appendChild(recItem);
    
    // 2つ目以降の推奨があれば簡略表示
    if (stats.recommendations.length > 1) {
      const moreDiv = document.createElement('div');
      moreDiv.style.cssText = 'margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.85rem; opacity: 0.9;';
      moreDiv.textContent = `他に${stats.recommendations.length - 1}つの推奨アクションがあります`;
      recommendationsList.appendChild(moreDiv);
    }
  }
  
  // 🧠 適応型分散復習の統計を更新 (Phase 2 NEW!)
  if (typeof GrowthDashboard.updateAdaptiveSRStats === 'function') {
    GrowthDashboard.updateAdaptiveSRStats();
  }
}

// グローバルスコープに公開
window.updateUnifiedReviewHub = updateUnifiedReviewHub;
window.startUnifiedReview = startUnifiedReview;
window.updateGrowthDashboard = updateGrowthDashboard;

// ==================== 間違いノート自動生成 ====================

// 間違いノートカードを更新
function updateMistakeNotebookCard() {
  if (typeof MistakeNotebook === 'undefined') return;
  
  const card = document.getElementById('mistakeNotebookCard');
  if (!card) return;
  
  const notebook = MistakeNotebook.generateNotebook();
  
  if (!notebook || notebook.totalMistakes === 0) {
    card.style.display = 'none';
    return;
  }
  
  // カードを表示
  card.style.display = 'block';
  
  // 問題数を更新
  const countEl = document.getElementById('mistakeNotebookCount');
  if (countEl) {
    countEl.textContent = notebook.totalMistakes;
  }
}

// 間違いノートを表示
function showMistakeNotebook() {
  if (typeof MistakeNotebook === 'undefined') {
    alert('間違いノートシステムが読み込まれていません。');
    return;
  }
  
  const notebook = MistakeNotebook.generateNotebook();
  
  if (!notebook || notebook.totalMistakes === 0) {
    alert('間違えた問題はまだありません。\nテストを受けて、間違いノートを作成しましょう！');
    return;
  }
  
  // 統計情報を表示
  const stats = MistakeNotebook.getStatistics(notebook.entries);
  document.getElementById('mistakeNotebookTotalQuestions').textContent = stats.totalQuestions;
  document.getElementById('mistakeNotebookTotalMistakes').textContent = stats.totalMistakes;
  document.getElementById('mistakeNotebookAvgMistakes').textContent = stats.avgMistakesPerQuestion;
  document.getElementById('mistakeNotebookCategories').textContent = stats.categoriesCount;
  
  // カテゴリフィルターを更新
  updateMistakeNotebookCategoryFilter(notebook.entries);
  
  // 初期表示（新しい順）
  AppState.mistakeNotebookEntries = notebook.entries;
  AppState.mistakeNotebookFilteredEntries = notebook.entries;
  renderMistakeNotebook(notebook.entries);
  
  // 画面を表示
  showScreen('mistakeNotebookScreen');
}

// カテゴリフィルターを更新
function updateMistakeNotebookCategoryFilter(entries) {
  const select = document.getElementById('mistakeNotebookCategoryFilter');
  if (!select) return;
  
  // 既存のオプションをクリア（「すべて」以外）
  while (select.options.length > 1) {
    select.remove(1);
  }
  
  // カテゴリを取得
  const categories = {};
  entries.forEach(entry => {
    const category = entry.category || '不明';
    categories[category] = (categories[category] || 0) + 1;
  });
  
  // カテゴリを追加
  Object.keys(categories).sort().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = `${category} (${categories[category]}問)`;
    select.appendChild(option);
  });
}

// フィルターを適用
function applyMistakeNotebookFilters() {
  if (!AppState.mistakeNotebookEntries) return;
  
  const categoryFilter = document.getElementById('mistakeNotebookCategoryFilter').value;
  const unmasteredOnly = document.getElementById('mistakeNotebookUnmasteredOnly').checked;
  
  let filtered = [...AppState.mistakeNotebookEntries];
  
  // カテゴリフィルター
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(e => e.category === categoryFilter);
  }
  
  // 未習熟のみフィルター
  if (unmasteredOnly) {
    filtered = filtered.filter(e => e.masteredCount < 3);
  }
  
  AppState.mistakeNotebookFilteredEntries = filtered;
  
  // 現在のソート順を適用
  applyMistakeNotebookSort();
}

// ソートを適用
function applyMistakeNotebookSort() {
  if (!AppState.mistakeNotebookFilteredEntries) return;
  
  const sortType = document.getElementById('mistakeNotebookSort').value;
  const sorted = MistakeNotebook.sortEntries(AppState.mistakeNotebookFilteredEntries, sortType);
  
  renderMistakeNotebook(sorted);
}

// 間違いノートをレンダリング
function renderMistakeNotebook(entries) {
  const container = document.getElementById('mistakeNotebookContent');
  if (!container) return;
  
  if (!entries || entries.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #6b7280; background: white; border-radius: 0.75rem;"><p style="font-size: 1.25rem; margin-bottom: 0.5rem;">🎉 該当する問題はありません</p><p>フィルター条件を変更してみてください。</p></div>';
    return;
  }
  
  container.innerHTML = MistakeNotebook.generateHTML(entries, MistakeNotebook.FORMAT.DETAILED);
}

// 印刷
function printMistakeNotebook() {
  if (!AppState.mistakeNotebookFilteredEntries || AppState.mistakeNotebookFilteredEntries.length === 0) {
    alert('印刷する問題がありません。');
    return;
  }
  
  MistakeNotebook.print(AppState.mistakeNotebookFilteredEntries);
}

// ダウンロード
function downloadMistakeNotebook() {
  if (!AppState.mistakeNotebookFilteredEntries || AppState.mistakeNotebookFilteredEntries.length === 0) {
    alert('ダウンロードする問題がありません。');
    return;
  }
  
  MistakeNotebook.downloadAsText(AppState.mistakeNotebookFilteredEntries);
}

// グローバルスコープに公開
window.updateMistakeNotebookCard = updateMistakeNotebookCard;
window.showMistakeNotebook = showMistakeNotebook;
window.applyMistakeNotebookFilters = applyMistakeNotebookFilters;
window.applyMistakeNotebookSort = applyMistakeNotebookSort;
window.printMistakeNotebook = printMistakeNotebook;
window.downloadMistakeNotebook = downloadMistakeNotebook;

// ==================== Phase E: リワードシステムUI ====================

/**
 * ポイントバッジを更新
 */
function updatePointsBadge() {
  const badge = document.getElementById('currentPointsBadge');
  if (!badge) return;
  
  // DailyMissionsからポイント取得
  if (typeof DailyMissions !== 'undefined') {
    const points = DailyMissions.getTotalPoints();
    badge.textContent = `${points}pt`;
    
    // ポイント数に応じてバッジの色を変更
    if (points >= 1000) {
      badge.style.background = 'rgba(255, 215, 0, 0.4)'; // ゴールド
    } else if (points >= 500) {
      badge.style.background = 'rgba(138, 43, 226, 0.4)'; // パープル
    } else if (points >= 200) {
      badge.style.background = 'rgba(255, 107, 157, 0.4)'; // ピンク
    } else {
      badge.style.background = 'rgba(255, 255, 255, 0.3)'; // デフォルト
    }
  } else {
    badge.textContent = '0pt';
  }
}

// グローバルスコープに公開
window.updatePointsBadge = updatePointsBadge;

// ==================== Phase A: モチベーションシステムUI ====================

/**
 * リアルタイムモチベーションフィードバックを表示
 * @param {object} feedback - SecretaryMotivation.onAnswerQuestion()の戻り値
 */
function showMotivationFeedback(feedback) {
  if (!feedback || !feedback.message) return;
  
  // フィードバックメッセージを秘書メッセージとして表示
  const messageType = feedback.isCorrect ? 'praise' : 'encourage';
  const duration = feedback.encouragementLevel === 'excited' ? 5000 : 
                   feedback.encouragementLevel === 'high' ? 4000 : 3000;
  
  showSecretaryMessage(feedback.message, messageType, duration);
  
  // 連続正解/誤答の場合、特別な視覚効果を追加
  if (feedback.stats.correctStreak >= 5) {
    // 連続正解時のアニメーション効果
    showSpecialEffect('streak', feedback.stats.correctStreak);
  }
  
  console.log('💬 モチベーションフィードバック:', feedback);
}

/**
 * 秘書メッセージを画面に表示
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージタイプ (greeting, praise, encourage, reminder, goal, welcome, etc.)
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showSecretaryMessage(message, type = 'greeting', duration = 4000) {
  // 既存の秘書メッセージエリアを探す
  let messageContainer = document.getElementById('secretaryMotivationMessage');
  
  if (!messageContainer) {
    // メッセージコンテナが存在しない場合、動的に作成
    messageContainer = document.createElement('div');
    messageContainer.id = 'secretaryMotivationMessage';
    messageContainer.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      max-width: 600px;
      width: 90%;
      padding: 16px 20px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
      color: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-size: 0.95rem;
      line-height: 1.6;
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none;
    `;
    document.body.appendChild(messageContainer);
  }
  
  // タイプ別のスタイル適用
  const typeStyles = {
    greeting: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)',
    praise: 'linear-gradient(135deg, rgba(76, 217, 100, 0.95) 0%, rgba(52, 211, 153, 0.95) 100%)',
    encourage: 'linear-gradient(135deg, rgba(251, 191, 36, 0.95) 0%, rgba(245, 158, 11, 0.95) 100%)',
    reminder: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
    goal: 'linear-gradient(135deg, rgba(167, 139, 250, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
    welcome: 'linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(219, 39, 119, 0.95) 100%)',
    encouragement: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)'
  };
  
  messageContainer.style.background = typeStyles[type] || typeStyles.greeting;
  messageContainer.textContent = message;
  messageContainer.style.opacity = '1';
  messageContainer.style.transform = 'translateX(-50%) translateY(0)';
  
  // 一定時間後に非表示
  clearTimeout(messageContainer.hideTimeout);
  messageContainer.hideTimeout = setTimeout(() => {
    messageContainer.style.opacity = '0';
    messageContainer.style.transform = 'translateX(-50%) translateY(-10px)';
  }, duration);
}

/**
 * 特別な視覚効果を表示（連続正解など）
 * @param {string} effectType - 効果のタイプ
 * @param {number} value - 効果に関連する値（連続数など）
 */
function showSpecialEffect(effectType, value) {
  if (effectType === 'streak' && value >= 5) {
    // 連続正解時の紙吹雪アニメーション（簡易版）
    const streakBanner = document.createElement('div');
    streakBanner.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      font-size: 3rem;
      font-weight: bold;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      animation: pulseStreak 1s ease-in-out;
      pointer-events: none;
    `;
    streakBanner.textContent = `🔥 ${value}問連続正解！ 🔥`;
    document.body.appendChild(streakBanner);
    
    // アニメーション用CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulseStreak {
        0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      streakBanner.remove();
      style.remove();
    }, 1000);
  }
}

/**
 * 通知メッセージを表示（汎用）
 */
function showNotification(message, type = 'info') {
  showSecretaryMessage(message, type, 4000);
}

/**
 * 絆レベル表示を更新
 */
function updateBondLevelDisplay() {
  if (typeof SecretaryMotivation === 'undefined') return;
  
  const bondLevelDisplay = document.getElementById('bondLevelDisplay');
  if (!bondLevelDisplay) return;
  
  const currentSecretary = SecretaryMotivation.getCurrentSecretary();
  const bondData = SecretaryMotivation.getBondLevel(currentSecretary);
  
  if (!bondData) return;
  
  // 絆レベル表示エリアを表示
  bondLevelDisplay.style.display = 'block';
  
  // 絆レベルを更新
  const bondLevelEl = document.getElementById('bondLevel');
  if (bondLevelEl) {
    bondLevelEl.textContent = bondData.level;
  }
  
  // 経験値バーを更新
  const bondExpBar = document.getElementById('bondExpBar');
  if (bondExpBar) {
    const expPercentage = (bondData.exp / bondData.maxExp * 100).toFixed(1);
    bondExpBar.style.width = `${expPercentage}%`;
  }
  
  // 経験値テキストを更新
  const bondExpText = document.getElementById('bondExpText');
  if (bondExpText) {
    bondExpText.textContent = `経験値: ${bondData.exp} / ${bondData.maxExp}`;
  }
  
  // 秘書名を更新
  const secretaryNameEl = document.getElementById('secretaryName');
  if (secretaryNameEl) {
    const secretaryNames = {
      'sakura': '桜 🌸',
      'mirai': 'ミライ ⚡',
      'rio': 'リオ 💕'
    };
    secretaryNameEl.textContent = secretaryNames[currentSecretary] || currentSecretary;
  }
}

/**
 * Phase C: 次にやることカードを更新（NEW!）
 */
function updateNextActionCard() {
  if (typeof NextAction === 'undefined') return;
  
  try {
    const actionData = NextAction.getNextAction();
    if (!actionData) return;
    
    // 絵文字更新
    const nextActionEmoji = document.getElementById('nextActionEmoji');
    if (nextActionEmoji && actionData.emoji) {
      nextActionEmoji.textContent = actionData.emoji;
    }
    
    // タイトル更新
    const nextActionTitle = document.getElementById('nextActionTitle');
    if (nextActionTitle) {
      nextActionTitle.textContent = actionData.title;
    }
    
    // 説明更新
    const nextActionDescription = document.getElementById('nextActionDescription');
    if (nextActionDescription) {
      nextActionDescription.textContent = actionData.description;
    }
    
    // ボタンテキスト更新
    const nextActionButtonText = document.getElementById('nextActionButtonText');
    if (nextActionButtonText) {
      nextActionButtonText.textContent = actionData.buttonText;
    }
    
    // 優先度バッジ更新
    const priorityBadge = document.getElementById('priorityBadge');
    const nextActionPriorityText = document.getElementById('nextActionPriorityText');
    if (priorityBadge && nextActionPriorityText) {
      // 優先度に応じて色を変更
      const priorityColors = {
        'critical': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'urgent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'important': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'recommended': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'normal': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
      priorityBadge.style.background = priorityColors[actionData.priority] || priorityColors['normal'];
      nextActionPriorityText.textContent = actionData.priorityText || '推奨';
    }
    
    // actionDataをグローバルに保存（実行時に使用）
    window.currentNextAction = actionData;
    
    console.log('✅ 次にやることカード更新完了:', actionData.title);
  } catch (error) {
    console.error('❌ 次にやることカード更新エラー:', error);
  }
}

/**
 * 次にやることを実行
 */
function executeNextAction() {
  console.log('🔘 executeNextAction() 呼び出し');
  console.log('  NextAction:', typeof NextAction);
  console.log('  currentNextAction:', window.currentNextAction);
  
  if (typeof NextAction === 'undefined' || !window.currentNextAction) {
    console.warn('⚠️ NextAction not available');
    alert('次にやることシステムが初期化されていません。ページを再読み込みしてください。');
    return;
  }
  
  console.log('✅ NextAction.executeAction() 実行中...', window.currentNextAction.action);
  NextAction.executeAction(window.currentNextAction);
}

/**
 * Phase C-2: バックアップカードを更新（NEW!）
 */
function updateBackupCard() {
  if (typeof window.BackupSystem === 'undefined') return;
  
  try {
    const stats = window.BackupSystem.getBackupStats();
    const sizeInfo = window.BackupSystem.getDataSize();
    
    // 最終バックアップ日時を更新（コンパクト版）
    const lastBackupDateEl = document.getElementById('lastBackupDate');
    if (lastBackupDateEl) {
      if (stats.hasBackup) {
        const days = stats.daysSinceBackup;
        if (days === 0) {
          lastBackupDateEl.textContent = '今日';
        } else if (days === 1) {
          lastBackupDateEl.textContent = '昨日';
        } else if (days <= 7) {
          lastBackupDateEl.textContent = `${days}日前`;
        } else if (days <= 30) {
          lastBackupDateEl.textContent = `${days}日前`;
        } else {
          lastBackupDateEl.textContent = `${days}日前⚠️`;
        }
      } else {
        lastBackupDateEl.textContent = '未実施';
      }
    }
    
    // データサイズを更新（コンパクト版）
    const backupDataSizeEl = document.getElementById('backupDataSize');
    if (backupDataSizeEl) {
      backupDataSizeEl.textContent = `${sizeInfo.kilobytes}KB`;
    }
    
    // バックアップ状況メッセージを更新（警告のみ表示）
    const backupStatusEl = document.getElementById('backupStatus');
    if (backupStatusEl && stats.hasBackup) {
      const days = stats.daysSinceBackup;
      if (days >= 30) {
        backupStatusEl.textContent = '⚠️ 1ヶ月以上バックアップがありません！今すぐ作成を推奨';
        backupStatusEl.style.display = 'block';
        backupStatusEl.style.color = '#fef3c7';
      } else if (days >= 7) {
        backupStatusEl.textContent = '💡 定期バックアップをおすすめします';
        backupStatusEl.style.display = 'block';
        backupStatusEl.style.color = '#d1fae5';
      } else {
        backupStatusEl.style.display = 'none';
      }
    }
    
    console.log('✅ バックアップカード更新完了');
  } catch (error) {
    console.error('❌ バックアップカード更新エラー:', error);
  }
}

/**
 * バックアップを実行
 */
function performBackup() {
  if (typeof window.BackupSystem === 'undefined') {
    alert('バックアップシステムが利用できません');
    return;
  }
  
  const button = document.getElementById('backupButton');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span>⏳</span><span>作成中...</span>';
  }
  
  setTimeout(() => {
    const result = window.BackupSystem.createBackup();
    
    if (result.success) {
      alert(`✅ バックアップ作成完了！\n\nファイル名: ${result.filename}\nサイズ: ${(result.size / 1024).toFixed(2)} KB\nデータ項目: ${result.dataCount}件`);
      updateBackupCard();
    } else {
      alert(`❌ バックアップ作成エラー\n\n${result.error}`);
    }
    
    if (button) {
      button.disabled = false;
      button.innerHTML = '<span>📥</span><span>バックアップ作成</span>';
    }
  }, 100);
}

/**
 * 復元モーダルを表示
 */
function showRestoreModal() {
  const modal = document.getElementById('restoreModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * 復元モーダルを閉じる
 */
function closeRestoreModal() {
  const modal = document.getElementById('restoreModal');
  if (modal) {
    modal.style.display = 'none';
  }
  // ファイル入力をリセット
  const fileInput = document.getElementById('restoreFileInput');
  if (fileInput) {
    fileInput.value = '';
  }
}

/**
 * データを復元
 */
async function performRestore() {
  if (typeof window.BackupSystem === 'undefined') {
    alert('バックアップシステムが利用できません');
    return;
  }
  
  const fileInput = document.getElementById('restoreFileInput');
  const modeSelect = document.getElementById('restoreMode');
  
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('バックアップファイルを選択してください');
    return;
  }
  
  const file = fileInput.files[0];
  const mode = modeSelect ? modeSelect.value : 'overwrite';
  
  // 確認ダイアログ
  const modeText = mode === 'overwrite' ? '上書き（既存データを完全に置換）' : 'マージ（既存データを保護）';
  if (!confirm(`データ復元を実行しますか？\n\nモード: ${modeText}\nファイル: ${file.name}\n\n※この操作は取り消せません`)) {
    return;
  }
  
  try {
    const result = await window.BackupSystem.restoreBackup(file, mode);
    
    if (result.success) {
      alert(`✅ データ復元完了！\n\n復元: ${result.restored}件\nスキップ: ${result.skipped}件\nバックアップ日時: ${result.timestamp}\n\nページを再読み込みします。`);
      closeRestoreModal();
      
      // ページをリロード
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      alert(`❌ データ復元エラー\n\n${result.error}`);
    }
  } catch (error) {
    alert(`❌ データ復元エラー\n\n${error.message}`);
  }
}

// グローバルに公開
window.showMotivationFeedback = showMotivationFeedback;
window.showSecretaryMessage = showSecretaryMessage;
window.showSpecialEffect = showSpecialEffect;
window.showNotification = showNotification;
window.updateBondLevelDisplay = updateBondLevelDisplay;
window.updateNextActionCard = updateNextActionCard;
window.executeNextAction = executeNextAction;
window.updateBackupCard = updateBackupCard;
window.performBackup = performBackup;
window.showRestoreModal = showRestoreModal;
window.closeRestoreModal = closeRestoreModal;
window.performRestore = performRestore;

// ==================== グローバル関数の公開（HTMLから呼び出すため） ====================
console.log('🌍 app.js: グローバル関数を公開開始...');
console.log('  renderQuestion定義済み?', typeof renderQuestion);
console.log('  startTimer定義済み?', typeof startTimer);
console.log('  nextQuestion定義済み?', typeof nextQuestion);

// 必須のコア関数
window.renderQuestion = renderQuestion;
window.startTimer = startTimer;
window.stopTimer = stopTimer;
window.updateTimer = updateTimer;
window.selectAnswer = selectAnswer;
window.showExplanation = showExplanation;
window.showScreen = showScreen;
window.updateNavigationButtons = updateNavigationButtons;
window.renderOptions = renderOptions;
window.startUnifiedReview = startUnifiedReview;
window.updateGrowthDashboard = updateGrowthDashboard;

console.log('✅ app.js: グローバル関数公開完了');
console.log('  window.renderQuestion?', typeof window.renderQuestion);
console.log('  window.startTimer?', typeof window.startTimer);
console.log('  window.nextQuestion?', typeof window.nextQuestion);
console.log('  window.showHome?', typeof window.showHome);
console.log('  window.startTest?', typeof window.startTest);
console.log('  window.startUnifiedReview?', typeof window.startUnifiedReview);
console.log('  window.selectAnswer?', typeof window.selectAnswer);
console.log('  window.updateNavigationButtons?', typeof window.updateNavigationButtons);
