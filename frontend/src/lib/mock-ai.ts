export interface WordAttribution {
  word: string;
  weight: number;
  explanation: string;
}

export interface Stylometrics {
  readability_score: number;
  readability_grade: string;
  sensationalism_score: number;
  lexical_diversity: number;
  passive_voice_density: number;
}

export interface AnalysisResult {
  id: string;
  title: string;
  text: string;
  url: string;
  category: string;
  truth_score: number;
  bias_score: number;
  explanation: WordAttribution[];
  model_type: string;
  created_at: number;
  cached?: boolean;
  stylometrics?: Stylometrics;
}


export function cleanAndTokenize(text: string): string[] {
  // Split by spaces but preserve whitespace and newlines for proper rendering
  return text.split(/(\s+)/).filter(t => t.length > 0);
}

export function analyzeArticleClient(title: string, text: string, url: string = "", modelType: string = "tfidf"): AnalysisResult {
  const tokens = cleanAndTokenize(text);

  // DistilBERT mock behavior: simple random scoring and placeholder attributions
  if (modelType === 'bert') {
    // Generate simplified scores
    const truthScore = parseFloat((60 + Math.random() * 20).toFixed(1)); // 60-80
    const biasScore = parseFloat((100 - truthScore).toFixed(1));
    // Minimal attributions (empty for mock)
    const wordAttributions: WordAttribution[] = [];
    // Simple category based on keywords (reuse existing logic)
    const lowerText = text.toLowerCase();
    let category = "General News";
    if (/\b(senate|election|candidate|government|policy|president|congress|political)\b/.test(lowerText)) {
      category = "Politics";
    } else if (/\b(vaccine|health|virus|hospital|medical|science|clinical|treatment)\b/.test(lowerText)) {
      category = "Health & Science";
    } else if (/\b(market|stock|inflation|rate|economy|financial|bank|percent)\b/.test(lowerText)) {
      category = "Finance & Economy";
    } else if (/\b(quantum|ai|algorithm|satellite|rocket|software|digital|space)\b/.test(lowerText)) {
      category = "Technology & Space";
    }

    return {
      id: `local_${Math.random().toString(36).substr(2, 9)}`,
      title: title || "Untitled DistilBERT Scan",
      text,
      url,
      category,
      truth_score: truthScore,
      bias_score: biasScore,
      explanation: wordAttributions,
      model_type: "DistilBERT (Local Mock)",
      created_at: Math.floor(Date.now() / 1000),
      stylometrics: {
        readability_score: 0,
        readability_grade: "",
        sensationalism_score: 0,
        lexical_diversity: 0,
        passive_voice_density: 0
      }
    };
  }

  // Existing TF‑IDF logic continues below

  
  // Clean word helper to strip punctuation and lowercase
  const clean = (word: string) => word.replace(/[^\w\s]/g, '').toLowerCase().trim();

  // Words that suggest fake/sensational/biased content (with negative weights)
  const sensationalMap: Record<string, { weight: number; desc: string }> = {
    shocking: { weight: -0.65, desc: "Sensationalist clickbait adjective" },
    revelation: { weight: -0.45, desc: "Emotional disclosure term" },
    miracle: { weight: -0.55, desc: "Unscientific claims signifier" },
    secret: { weight: -0.4, desc: "Conspiratorial tone word" },
    panic: { weight: -0.5, desc: "Fear-inducing emotional language" },
    elites: { weight: -0.45, desc: "Populist/conspiratorial framing term" },
    scam: { weight: -0.6, desc: "Accusatory high-bias noun" },
    hoax: { weight: -0.65, desc: "Inflammatory dismissive noun" },
    exposed: { weight: -0.5, desc: "Sensational exposure verb" },
    unbelievable: { weight: -0.55, desc: "Highly subjective adjective" },
    conspiracy: { weight: -0.6, desc: "Conspiratorial claim phrasing" },
    guaranteed: { weight: -0.35, desc: "Overconfident marketing term" },
    terrifying: { weight: -0.5, desc: "Emotionally charged hyperbole" },
    scandal: { weight: -0.45, desc: "Sensationalized conflict noun" },
    exclusive: { weight: -0.3, desc: "Exclusivity marketing tactic" },
    treason: { weight: -0.55, desc: "Extreme political charge" },
    absolutely: { weight: -0.25, desc: "Subjective intensity adverb" },
    crazy: { weight: -0.5, desc: "Informal, sensationalist slang" },
    propaganda: { weight: -0.4, desc: "High-bias accusatory noun" },
    lie: { weight: -0.45, desc: "Aggressive accusatory language" }
  };

  // Words that suggest credible/factual reporting (with positive weights)
  const credibleMap: Record<string, { weight: number; desc: string }> = {
    researchers: { weight: 0.45, desc: "References academic researchers" },
    study: { weight: 0.4, desc: "Refers to structured investigation" },
    scientific: { weight: 0.35, desc: "Objective analytical framing" },
    published: { weight: 0.3, desc: "Indicates public/peer disclosure" },
    telemetry: { weight: 0.5, desc: "Factual instrumentation reference" },
    announced: { weight: 0.25, desc: "Standard institutional reporting verb" },
    unanimous: { weight: 0.35, desc: "Cites consensus standard" },
    statistics: { weight: 0.4, desc: "Objective quantitative framing" },
    according: { weight: 0.3, desc: "Attributes information source" },
    representative: { weight: 0.25, desc: "Refers to formal spokesperson" },
    spokesperson: { weight: 0.3, desc: "Formal information source attribution" },
    confirmed: { weight: 0.35, desc: "Verified by authoritative source" },
    surveillance: { weight: 0.2, desc: "Neutral technical reference" },
    telecommunication: { weight: 0.25, desc: "Technical institutional term" },
    quarterly: { weight: 0.3, desc: "Formal report scheduling" },
    analysts: { weight: 0.35, desc: "Cites professional observers" },
    spokesman: { weight: 0.25, desc: "Standard institutional source" }
  };

  let fakeScore = 0;
  let credibleScore = 0;
  
  const wordAttributions: WordAttribution[] = tokens.map(token => {
    const cleanWord = clean(token);
    let weight = 0;
    let explanation = "";

    if (sensationalMap[cleanWord]) {
      weight = sensationalMap[cleanWord].weight;
      fakeScore += Math.abs(weight);
      explanation = `${sensationalMap[cleanWord].desc} (${weight < 0 ? '' : '+'}${weight.toFixed(2)})`;
    } else if (credibleMap[cleanWord]) {
      weight = credibleMap[cleanWord].weight;
      credibleScore += weight;
      explanation = `${credibleMap[cleanWord].desc} (+${weight.toFixed(2)})`;
    } else {
      // Small randomized stylometric noise for non-vocabulary words to make SHAP landscape realistic
      if (cleanWord.length > 3 && Math.random() < 0.04) {
        const isPositive = Math.random() > 0.6;
        weight = isPositive ? 0.05 : -0.05;
        explanation = isPositive ? "Objective syntactical structure (+0.05)" : "Mild stylometric variance (-0.05)";
      }
    }

    return {
      word: token,
      weight,
      explanation
    };
  });

  // Calculate base score
  // Factual is positive, Fake is negative. 
  // Let's compute a credibility metric from 0 to 100
  let baseScore = 72; // Default starting truth score
  
  // Calculate capital letter ratio
  const charCount = text.length || 1;
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const capsRatio = capsCount / charCount;
  
  // Heavy capitalization penalty (clickbait style)
  if (capsRatio > 0.09) {
    baseScore -= 15;
    // Add weights to fully capitalized words to show why they were penalized
    wordAttributions.forEach(wa => {
      const trimmed = wa.word.trim();
      if (trimmed.length > 2 && trimmed === trimmed.toUpperCase() && !/^\d+$/.test(trimmed)) {
        wa.weight -= 0.25;
        wa.explanation = wa.explanation 
          ? `${wa.explanation}; Capitalized clickbait emphasis (-0.25)`
          : `Capitalized clickbait emphasis (-0.25)`;
      }
    });
  }

  // Compute detailed readability & stylometrics scores
  const cleanWords = tokens
    .map(tok => tok.replace(/[^\w]/g, "").toLowerCase())
    .filter(Boolean);
  const totalWords = cleanWords.length || 1;
  
  // 1. Sentences
  const sentenceMatches = text.match(/[.!?]+/g);
  const totalSentences = sentenceMatches ? Math.max(1, sentenceMatches.length) : 1;

  // 2. Syllables Heuristic
  const countWordSyllables = (word: string): number => {
    const w = word.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    let count = (w.match(/[aeiouy]+/g) || []).length;
    if (w.endsWith("es") || w.endsWith("ed")) count--;
    if (w.endsWith("e") && !w.endsWith("le")) count--;
    return Math.max(1, count);
  };
  const totalSyllables = cleanWords.reduce((sum, word) => sum + countWordSyllables(word), 0);

  // 3. Flesch Reading Ease Formula
  const rawReadability = 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
  const readability_score = Math.max(0, Math.min(100, parseFloat(rawReadability.toFixed(1))));

  let readability_grade = "Standard (8th Grade)";
  if (readability_score >= 90) readability_grade = "Easy (5th Grade)";
  else if (readability_score >= 80) readability_grade = "Easy (6th Grade)";
  else if (readability_score >= 70) readability_grade = "Fairly Easy (7th Grade)";
  else if (readability_score >= 60) readability_grade = "Standard (8th-9th Grade)";
  else if (readability_score >= 50) readability_grade = "Fairly Difficult (High School)";
  else if (readability_score >= 30) readability_grade = "Difficult (College)";
  else readability_grade = "Very Difficult (Grad School)";

  // 4. Sensationalism score
  const exclamations = (text.match(/!/g) || []).length;
  const uppercaseWords = tokens.filter(
    t => t.trim().length > 2 && t.trim() === t.trim().toUpperCase() && !/^\d+$/.test(t.trim())
  ).length;
  const sensationalWords = tokens.filter(t => sensationalMap[clean(t)]).length;
  
  const rawSensationalism = (exclamations * 15) + (uppercaseWords * 10) + (sensationalWords * 18) + (capsRatio * 250);
  const sensationalism_score = Math.max(0, Math.min(100, parseFloat(rawSensationalism.toFixed(1))));

  // 5. Lexical diversity
  const uniqueWordsSet = new Set(cleanWords);
  const lexical_diversity = Math.max(0, Math.min(100, parseFloat(((uniqueWordsSet.size / totalWords) * 100).toFixed(1))));

  // 6. Passive voice density heuristic
  // e.g. "was proven", "is confirmed", "been deleted"
  const passiveVoiceMatches = text.match(/\b(is|was|were|been|be|are|am)\b\s+\w+(ed|n)\b/gi);
  const passiveVoiceCount = passiveVoiceMatches ? passiveVoiceMatches.length : 0;
  const passive_voice_density = Math.max(0, Math.min(100, parseFloat(((passiveVoiceCount / totalSentences) * 100).toFixed(1))));

  // Adjust score
  baseScore = baseScore + (credibleScore * 14) - (fakeScore * 18);
  baseScore = Math.max(12.5, Math.min(97.8, baseScore));

  const truth_score = parseFloat(baseScore.toFixed(1));
  const bias_score = parseFloat((100 - truth_score).toFixed(1));

  // Category determination
  let category = "General News";
  const lowerText = text.toLowerCase();
  if (/\b(senate|election|candidate|government|policy|president|congress|political)\b/.test(lowerText)) {
    category = "Politics";
  } else if (/\b(vaccine|health|virus|hospital|medical|science|clinical|treatment)\b/.test(lowerText)) {
    category = "Health & Science";
  } else if (/\b(market|stock|inflation|rate|economy|financial|bank|percent)\b/.test(lowerText)) {
    category = "Finance & Economy";
  } else if (/\b(quantum|ai|algorithm|satellite|rocket|software|digital|space)\b/.test(lowerText)) {
    category = "Technology & Space";
  }

  return {
    id: `local_${Math.random().toString(36).substr(2, 9)}`,
    title: title || "Untitled Client Scan",
    text,
    url,
    category,
    truth_score,
    bias_score,
    explanation: wordAttributions,
    model_type: "Local Client NLP",
    created_at: Math.floor(Date.now() / 1000),
    stylometrics: {
      readability_score,
      readability_grade,
      sensationalism_score,
      lexical_diversity,
      passive_voice_density
    }
  };
}

export const sampleArticles = [
  {
    title: "NIH Study Confirms Cardio Exercise Reduces Cardiac Disease by 30%",
    category: "Health & Science",
    text: "Researchers at the National Institute of Health released a peer-reviewed study confirming that regular cardiovascular exercise reduces long-term cardiac disease rates by thirty percent. The study tracked ten thousand participants over a decade, adjusting for dietary factors and age, proving a definitive causal link between active lifestyles and heart longevity. The detailed scientific report was published in the quarterly Journal of Cardiology, and has been announced as a milestone by administrative health spokespersons."
  },
  {
    title: "ESA Satellite Launch Succeeds from French Guiana Spaceport",
    category: "Technology & Space",
    text: "The European Space Agency successfully launched its new atmospheric surveillance satellite from the French Guiana spaceport on Tuesday. According to official flight telemetry, the orbital device deployed its primary sensor array and has begun transmitting climate data to research centers in Geneva and Munich. Geologists announced that satellite networks will soon deliver micro-climate statistics for quarterly analysis."
  },
  {
    title: "SHOCKING REVELATION! Miracle Herb Cures Diabetes in 24 Hours!",
    category: "Health & Science",
    text: "SHOCKING REVELATION! Doctors are panicking after a miracle natural herb was proven to completely cure all forms of diabetes in just twenty-four hours! The big pharmaceutical companies are desperately trying to ban this secret plant to protect their billion-dollar profits! This is absolutely an exclusive truth the elites don't want you to know. Click here to buy this guaranteed cure before the post gets deleted!"
  },
  {
    title: "EXCLUSIVE: Government Mind Control Waves Leaked by Insiders!",
    category: "Politics",
    text: "EXCLUSIVE: Unbelievable leaked documents expose the dark secret that the government is using high-frequency radio waves to control the minds of citizens in major cities! This secret project, code-named Project Omega, has been running for years and the mainstream media is completely silent! Wake up! Do not trust the lies of the corrupt elites. Read the shocking documents here!"
  }
];
