import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
const getAiClient = () => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

// --- ERROR HANDLING UTILITIES ---

type ErrorType = 'NETWORK' | 'SERVER_BUSY' | 'AUTH' | 'QUOTA' | 'SAFETY' | 'UNKNOWN';

const classifyError = (error: any): ErrorType => {
  const msg = (error.message || '').toLowerCase();
  
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted')) return 'QUOTA';
  if (msg.includes('401') || msg.includes('403') || msg.includes('api key') || msg.includes('permission')) return 'AUTH';
  if (msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable')) return 'SERVER_BUSY';
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) return 'NETWORK';
  if (msg.includes('candidate') || msg.includes('safety') || msg.includes('blocked')) return 'SAFETY';
  
  return 'UNKNOWN';
};

const getUserFriendlyErrorMessage = (error: any): string => {
  const type = classifyError(error);
  switch (type) {
    case 'AUTH': return "API Key invalid or missing. Please check settings.";
    case 'QUOTA': return "Server busy (Rate limit). Please wait a moment.";
    case 'NETWORK': return "Network error. Please check your internet.";
    case 'SAFETY': return "Content blocked by safety filters.";
    case 'SERVER_BUSY': return "AI Service is currently overloaded. Try again.";
    default: return "Something went wrong. Please try again.";
  }
};

// Robust JSON Cleaner
const cleanAndParseJson = (text: string, defaultValue: any) => {
  try {
    if (!text) return defaultValue;
    
    // Remove markdown code blocks
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extract JSON object/array
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    let startIdx = -1;
    let endIdx = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIdx = firstBrace;
      endIdx = cleanText.lastIndexOf('}') + 1;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
      endIdx = cleanText.lastIndexOf(']') + 1;
    }

    if (startIdx !== -1 && endIdx !== -1) {
      cleanText = cleanText.substring(startIdx, endIdx);
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("JSON Parsing Failed:", error);
    return defaultValue;
  }
};

// Retry Operation Wrapper
const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error("NetworkError: No internet connection.");
  }

  try {
    return await operation();
  } catch (error: any) {
    const type = classifyError(error);

    // Don't retry for Auth, Quota, or Safety errors
    if (type === 'AUTH' || type === 'QUOTA' || type === 'SAFETY') {
      console.warn(`Aborting retry for ${type} error:`, error.message);
      throw error;
    }

    // Retry for Network or Server Busy errors
    if (retries > 0) {
      console.warn(`Operation failed (${type}), retrying in ${delay}ms... (${retries} attempts left).`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2); // Exponential backoff
    }
    
    throw error;
  }
};

// --- API FUNCTIONS ---

export const translateText = async (text: string, toEnglish: boolean): Promise<string> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = toEnglish 
        ? `Translate the following Gujarati text to natural English: "${text}"`
        : `Translate the following English text to Gujarati: "${text}"`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Translation not available.";
    });
  } catch (error) {
    console.error("Translation API Error:", error);
    return getUserFriendlyErrorMessage(error);
  }
};

export const explainDoubt = async (query: string): Promise<string> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        You are an expert English tutor for Gujarati speakers.
        The user has asked: "${query}".
        Provide a clear, simple explanation in Gujarati. 
        Use English only for examples.
        Keep it concise (under 100 words).
      `;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Could not generate explanation.";
    });
  } catch (error) {
    console.error("Doubt API Error:", error);
    return getUserFriendlyErrorMessage(error);
  }
};

export const generateLessonContent = async (topic: string): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Create a short English learning lesson for a Gujarati speaker about "${topic}".
        Output ONLY valid JSON with this structure:
        {
          "intro_gujarati": "Introduction in Gujarati explaining the topic",
          "key_phrases": [
            {"english": "Phrase 1", "gujarati": "Meaning 1"}
          ]
        }
      `;
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      });
      return cleanAndParseJson(response.text || "{}", null);
    });
  } catch (error) {
    console.error("Lesson API Error:", error);
    return null; // Return null so UI can show specific error state
  }
};

export const generateScenarioDrills = async (topic: string, drillType?: 'vocab' | 'grammar' | 'sentence'): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      
      let typePrompt = "";
      if (drillType === 'vocab') typePrompt = "Generate ONLY 1 'vocab_drills' item.";
      else if (drillType === 'grammar') typePrompt = "Generate ONLY 1 'grammar_drills' item.";
      else if (drillType === 'sentence') typePrompt = "Generate ONLY 1 'sentence_builder' item.";
      else typePrompt = "Generate 1 drill for EACH category (vocab_drills, grammar_drills, sentence_builder).";

      const prompt = `
        Create targeted practice drills for the English lesson topic: "${topic}".
        Target Audience: Gujarati speakers.
        ${typePrompt}
        Random Seed: ${Date.now()}
        
        Output ONLY raw JSON with this structure:
        {
          "vocab_drills": [
            {
              "question": "English question about vocabulary related to ${topic}",
              "options": ["Option A", "Option B", "Option C"],
              "correct": "Correct Option String"
            }
          ],
          "grammar_drills": [
             {
               "sentence": "Sentence with a _____ (blank)",
               "correct": "answer",
               "hint": "Gujarati hint"
             }
          ],
          "sentence_builder": [
             {
               "correct": "Correct English sentence",
               "gujarati": "Gujarati translation"
             }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const data = cleanAndParseJson(response.text || "{}", {});

      // Post-processing for sentence builder (Client-side shuffling)
      if (data.sentence_builder && data.sentence_builder.length > 0) {
          data.sentence_builder = data.sentence_builder.map((item: any) => {
             // Tokenize: split by space but keep punctuation attached or separate based on simple logic
             const words = item.correct.match(/[\w']+|[.,!?;]/g) || item.correct.split(' ');
             
             // Shuffle copy
             const jumbled = [...words];
             for (let i = jumbled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [jumbled[i], jumbled[j]] = [jumbled[j], jumbled[i]];
             }
             
             return { ...item, jumbled };
          });
      }

      return data;
    });
  } catch (error) {
    console.error("Drill API Error:", error);
    return null;
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string, languageHint: string): Promise<string> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `Transcribe the speech in this audio into ${languageHint} text. Return ONLY the transcribed text.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
              { inlineData: { mimeType, data: base64Audio } },
              { text: prompt }
          ]
        }
      });
      return response.text?.trim() || "";
    });
  } catch (error) {
    console.error("Transcription API Error:", error);
    return ""; // Fail silently or return empty string for UI to handle
  }
};

export const explainGrammarTopic = async (topic: string): Promise<string> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Explain the English grammar topic "${topic}" for a Gujarati speaker.
        
        Format as Markdown:
        1. **Definition** (In Gujarati)
        2. **Structure** (Formula)
        3. **Examples** (3 examples with Gujarati)
        
        Keep it simple.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Explanation not available.";
    });
  } catch (error) {
    console.error("Grammar API Error:", error);
    return `Error: ${getUserFriendlyErrorMessage(error)}`;
  }
};

export const checkGrammarPractice = async (sentence: string, topic: string): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Topic: "${topic}".
        User input: "${sentence}".
        Check grammar.
        
        Output JSON:
        {
          "isCorrect": boolean,
          "correctedSentence": "Corrected version or original",
          "explanationGujarati": "Explanation in Gujarati"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      return cleanAndParseJson(response.text || "{}", { 
          isCorrect: false, 
          correctedSentence: sentence, 
          explanationGujarati: "Could not analyze grammar." 
      });
    });
  } catch (error) {
    console.error("Grammar Check API Error:", error);
    return { isCorrect: false, correctedSentence: "", explanationGujarati: getUserFriendlyErrorMessage(error) };
  }
};

export const generateVocabulary = async (): Promise<any[]> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Generate 5 useful English vocabulary words for a Gujarati speaker (Intermediate).
        Output JSON Array:
        [
          {
            "word": "Word",
            "pronunciation": "Gujarati Phonetic",
            "gujaratiMeaning": "Meaning",
            "englishDefinition": "Def",
            "exampleSentence": "Example"
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return cleanAndParseJson(response.text || "[]", []);
    });
  } catch (error) {
    console.error("Vocab API Error:", error);
    return [];
  }
};

export const checkVocabularyUsage = async (word: string, sentence: string): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Word: "${word}". Sentence: "${sentence}".
        Check usage.
        Output JSON: { "isCorrect": boolean, "feedback": "Gujarati feedback" }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return cleanAndParseJson(response.text || "{}", { isCorrect: false, feedback: "Error checking." });
    });
  } catch (error) {
    console.error("Vocab Check API Error:", error);
    return { isCorrect: false, feedback: getUserFriendlyErrorMessage(error) };
  }
};

export const generatePhraseOfTheDay = async (): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Generate 1 English idiom for Gujarati speakers.
        Output JSON: { "phrase": "", "gujaratiMeaning": "", "pronunciation": "" }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return cleanAndParseJson(response.text || "{}", null);
    });
  } catch (error) {
    console.error("Phrase API Error:", error);
    return null;
  }
};

export const generateGameData = async (
    gameType: 'scramble' | 'rapidFire', 
    count: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<any[]> => {
    try {
        return await retryOperation(async () => {
            const ai = getAiClient();
            let prompt = "";
            
            if (gameType === 'scramble') {
                const diffDesc = difficulty === 'easy' ? 'simple 3-4 letter' : difficulty === 'medium' ? 'common 5-6 letter' : 'complex 7+ letter';
                prompt = `
                  Generate ${count} "Word Scramble" items (English word + Gujarati hint).
                  Level: ${difficulty} (${diffDesc} words).
                  Output JSON Array: [{ "word": "APPLE", "hint": "સફરજન", "scrambled": "ELPPA" }]
                `;
            } else if (gameType === 'rapidFire') {
                const diffDesc = difficulty === 'easy' ? 'basic phrases' : difficulty === 'medium' ? 'intermediate sentences' : 'advanced idioms or business english';
                prompt = `
                  Generate ${count} translation multiple choice questions.
                  Level: ${difficulty} (${diffDesc}).
                  Output JSON Array: [{ "question": "Hi", "options": ["નમસ્તે", "આવજો"], "correctIndex": 0 }]
                `;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const data = cleanAndParseJson(response.text || "[]", []);
            
            if (gameType === 'scramble' && Array.isArray(data)) {
                return data.map((item: any) => ({
                    ...item,
                    word: item.word?.toUpperCase() || "",
                    scrambled: item.word?.toUpperCase().split('').sort(() => Math.random() - 0.5).join('') || ""
                }));
            }
            return data;
        });
    } catch (error) {
        console.error("Game Data API Error:", error);
        return [];
    }
}
