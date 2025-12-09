// TOEIC PART5 出題パターン一覧
// 各問題に自動的に出題意図を付与するための定義

const TOEIC_QUESTION_TYPES = {
  // 品詞問題（最頻出：40-50%）
  PARTS_OF_SPEECH: {
    VERB_FORM: {
      type: "品詞問題（動詞の語形選択）",
      intent: "💡 出題意図：文脈に応じて適切な動詞の形（原形・現在形・過去形・分詞など）を選べるかを問う品詞問題",
      keywords: ["助動詞", "to不定詞", "動名詞", "現在分詞", "過去分詞"]
    },
    NOUN: {
      type: "品詞問題（名詞の識別）",
      intent: "💡 出題意図：冠詞や前置詞の後ろに適切な名詞を選べるかを問う品詞問題",
      keywords: ["冠詞", "前置詞", "所有格"]
    },
    ADJECTIVE: {
      type: "品詞問題（形容詞の識別）",
      intent: "💡 出題意図：名詞を修飾する形容詞、またはbe動詞の後ろの補語として適切な形容詞を選べるかを問う品詞問題",
      keywords: ["名詞修飾", "be動詞", "補語"]
    },
    ADVERB: {
      type: "品詞問題（副詞の識別）",
      intent: "💡 出題意図：動詞・形容詞・副詞を修飾する適切な副詞を選べるかを問う品詞問題",
      keywords: ["動詞修飾", "形容詞修飾", "文修飾"]
    }
  },

  // 動詞問題（20-25%）
  VERB: {
    TENSE: {
      type: "時制問題（現在・過去・未来）",
      intent: "💡 出題意図：文脈や時を表す副詞句から適切な時制を判断できるかを問う問題",
      keywords: ["yesterday", "last", "tomorrow", "next", "now"]
    },
    PERFECT: {
      type: "完了形問題（現在完了・過去完了）",
      intent: "💡 出題意図：継続・経験・完了の文脈で適切に完了形を使えるかを問う問題",
      keywords: ["have/has", "had", "since", "for", "already", "yet"]
    },
    PASSIVE: {
      type: "受動態問題（be + 過去分詞）",
      intent: "💡 出題意図：能動態と受動態の使い分け、適切な受動態の形を選べるかを問う問題",
      keywords: ["be動詞", "過去分詞", "by"]
    },
    MODAL: {
      type: "助動詞問題",
      intent: "💡 出題意図：助動詞の後ろに動詞の原形を置くという文法ルールを理解しているかを問う問題",
      keywords: ["will", "can", "must", "should", "may", "might"]
    }
  },

  // 前置詞問題（10-15%）
  PREPOSITION: {
    TIME: {
      type: "前置詞問題（時間表現）",
      intent: "💡 出題意図：時刻・日付・期間を表す前置詞の使い分けができるかを問う問題",
      keywords: ["at", "on", "in", "by", "until", "during", "for", "since"]
    },
    PLACE: {
      type: "前置詞問題（場所表現）",
      intent: "💡 出題意図：場所・位置を表す前置詞の使い分けができるかを問う問題",
      keywords: ["at", "on", "in", "to", "from"]
    },
    IDIOMATIC: {
      type: "前置詞問題（慣用表現）",
      intent: "💡 出題意図：動詞や形容詞と結びつく特定の前置詞を知っているかを問う語法問題",
      keywords: ["responsible for", "good at", "interested in", "depend on"]
    }
  },

  // 接続詞問題（5-10%）
  CONJUNCTION: {
    CONDITION: {
      type: "接続詞問題（条件表現）",
      intent: "💡 出題意図：条件を表す接続詞の使い分け、意味の違いを理解しているかを問う問題",
      keywords: ["if", "unless", "in case", "provided"]
    },
    REASON: {
      type: "接続詞問題（理由表現）",
      intent: "💡 出題意図：理由・原因を表す接続詞を適切に選べるかを問う問題",
      keywords: ["because", "since", "as"]
    },
    CONTRAST: {
      type: "接続詞問題（対比・譲歩表現）",
      intent: "💡 出題意図：対比や譲歩を表す接続詞・前置詞の使い分けができるかを問う問題",
      keywords: ["although", "though", "despite", "in spite of", "while"]
    }
  },

  // 代名詞問題（5%）
  PRONOUN: {
    POSSESSIVE: {
      type: "代名詞問題（所有格・所有代名詞）",
      intent: "💡 出題意図：所有格と所有代名詞の使い分けができるかを問う問題",
      keywords: ["my/mine", "your/yours", "his", "her/hers"]
    },
    REFLEXIVE: {
      type: "代名詞問題（再帰代名詞）",
      intent: "💡 出題意図：再帰代名詞を適切に使えるかを問う問題",
      keywords: ["myself", "yourself", "himself", "themselves"]
    }
  },

  // 関係詞問題（5%）
  RELATIVE: {
    WHO_WHICH: {
      type: "関係代名詞問題",
      intent: "💡 出題意図：先行詞に応じて適切な関係代名詞を選べるかを問う問題",
      keywords: ["who", "which", "that", "whose"]
    },
    WHERE_WHEN: {
      type: "関係副詞問題",
      intent: "💡 出題意図：場所や時を表す関係副詞を適切に選べるかを問う問題",
      keywords: ["where", "when", "why"]
    }
  },

  // 語彙問題（5-10%）
  VOCABULARY: {
    SIMILAR_WORDS: {
      type: "語彙問題（類似語の使い分け）",
      intent: "💡 出題意図：意味が似ている単語の微妙なニュアンスの違いを理解しているかを問う問題",
      keywords: ["affect/effect", "raise/rise", "lay/lie"]
    },
    COLLOCATIONS: {
      type: "語彙問題（コロケーション）",
      intent: "💡 出題意図：特定の単語と一緒によく使われる語の組み合わせを知っているかを問う問題",
      keywords: ["make a decision", "take action", "reach an agreement"]
    }
  },

  // 数量詞問題（3-5%）
  QUANTIFIER: {
    COUNTABLE: {
      type: "数量詞問題（可算名詞）",
      intent: "💡 出題意図：可算名詞を修飾する適切な数量表現を選べるかを問う問題",
      keywords: ["many", "few", "several", "a number of"]
    },
    UNCOUNTABLE: {
      type: "数量詞問題（不可算名詞）",
      intent: "💡 出題意図：不可算名詞を修飾する適切な数量表現を選べるかを問う問題",
      keywords: ["much", "little", "a great deal of"]
    },
    BOTH: {
      type: "数量詞問題（比較級・最上級）",
      intent: "💡 出題意図：可算・不可算両方に使える数量表現や比較表現を選べるかを問う問題",
      keywords: ["more", "most", "less", "least", "some", "any"]
    }
  }
};

// 出題意図を自動生成する関数
function generateQuestionIntent(questionType) {
  // questionTypeから適切なintentを返す
  for (const category in TOEIC_QUESTION_TYPES) {
    for (const subCategory in TOEIC_QUESTION_TYPES[category]) {
      const pattern = TOEIC_QUESTION_TYPES[category][subCategory];
      if (pattern.type === questionType) {
        return pattern.intent;
      }
    }
  }
  return "💡 出題意図：TOEIC頻出の文法・語法パターンを理解しているかを問う問題";
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TOEIC_QUESTION_TYPES, generateQuestionIntent };
}
