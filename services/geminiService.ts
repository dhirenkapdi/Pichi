import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- UTILITIES ---

// Robust JSON Cleaner: Removes Markdown code blocks and extracts the JSON object/array
const cleanAndParseJson = (text: string, defaultValue: any) => {
  try {
    if (!text) return defaultValue;
    
    // Remove markdown code blocks (```json ... ```)
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // If text still has garbage before/after, try to find the first '{' or '[' and last '}' or ']'
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    
    let startIdx = -1;
    let endIdx = -1;

    // Determine if we are looking for an object or array
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
    console.error("JSON Parsing Failed:", error, "Original Text:", text);
    return defaultValue;
  }
};

// Utility to handle retry with exponential backoff for 503 errors and Network errors
const retryOperation = async <T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error("No internet connection. Please check your network.");
  }

  try {
    return await operation();
  } catch (error: any) {
    const isNetworkError = 
      error instanceof TypeError || 
      error.message?.includes('NetworkError') || 
      error.message?.includes('fetch failed') || 
      error.message?.includes('Failed to fetch');
      
    const isServiceUnavailable = 
      error.message?.includes('503') || 
      error.message?.includes('unavailable') || 
      error.status === 503;

    if (retries > 0 && (isNetworkError || isServiceUnavailable)) {
      console.warn(`Operation failed, retrying in ${delay}ms... (${retries} attempts left). Error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
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
      return response.text || "Translation failed.";
    });
  } catch (error) {
    console.error("Translation error:", error);
    return "Error during translation. Please check your connection.";
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
      `;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Could not generate explanation.";
    });
  } catch (error) {
    console.error("Doubt explanation error:", error);
    return "Error processing doubt. Please try again.";
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
          "intro_gujarati": "Introduction in Gujarati",
          "key_phrases": [
            {"english": "Phrase 1", "gujarati": "Meaning 1"},
            {"english": "Phrase 2", "gujarati": "Meaning 2"}
          ],
          "dialogue_scenario": "Description of roleplay"
        }
      `;
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      });
      return cleanAndParseJson(response.text || "{}", {});
    });
  } catch (error) {
    console.error("Lesson generation error:", error);
    return {};
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
        
        Output ONLY raw JSON with this structure (include only requested keys):
        {
          "vocab_drills": [
            {
              "question": "English question about vocabulary related to ${topic}",
              "options": ["Option A", "Option B", "Option C"],
              "correct": "Correct Option String",
              "explanation": "Gujarati explanation"
            }
          ],
          "grammar_drills": [
             {
               "sentence": "Sentence with a _____ (blank)",
               "correct": "answer",
               "hint": "Gujarati hint about grammar (prepositions/tenses)"
             }
          ],
          "sentence_builder": [
             {
               "correct": "Correct English sentence string",
               "gujarati": "Gujarati translation of the sentence"
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

      // Programmatically generate jumbled words for sentence builder if it exists
      if (data.sentence_builder && data.sentence_builder.length > 0) {
          data.sentence_builder = data.sentence_builder.map((item: any) => {
             // Split by space or punctuation logic
             const words = item.correct.match(/[\w']+|[.,!?;]/g) || item.correct.split(' ');
             
             // Shuffle
             const jumbled = [...words];
             for (let i = jumbled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [jumbled[i], jumbled[j]] = [jumbled[j], jumbled[i]];
             }
             
             return {
                 ...item,
                 jumbled
             };
          });
      }

      return data;
    });
  } catch (error) {
    console.error("Drill generation error:", error);
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
    console.error("Transcription error", error);
    return "";
  }
};

export const explainGrammarTopic = async (topic: string): Promise<string> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Explain the English grammar topic "${topic}" for a Gujarati speaker.
        
        Format the response using simple Markdown.
        Structure:
        1. **Definition** (Explanation in Gujarati)
        2. **Structure/Formula** (e.g., Subject + Verb + Object)
        3. **Examples** (3-5 examples with Gujarati translation)
        4. **Common Mistakes** (List typical errors with Correct vs Incorrect examples)
        
        Keep it simple and easy to understand.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "Explanation not available.";
    });
  } catch (error) {
    console.error("Grammar explanation error:", error);
    return "Error loading grammar topic. Please check connection.";
  }
};

export const checkGrammarPractice = async (sentence: string, topic: string): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        The user is practicing the English grammar topic: "${topic}".
        The user wrote/said: "${sentence}".

        Analyze if the sentence is grammatically correct specifically regarding the rules of "${topic}".
        
        Output raw JSON.
        JSON Structure:
        {
          "isCorrect": boolean,
          "correctedSentence": "The fully corrected sentence (if incorrect), or the original sentence (if correct)",
          "explanationGujarati": "Explanation in Gujarati. If incorrect, explain the rule violated. If correct, give a short encouragement."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      return cleanAndParseJson(response.text || "{}", { isCorrect: false, explanationGujarati: "Parsing error" });
    });
  } catch (error) {
    console.error("Grammar check error:", error);
    return { isCorrect: false, correctedSentence: "", explanationGujarati: "Error checking grammar. Please try again." };
  }
};

export const generateVocabulary = async (): Promise<any[]> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Generate 5 useful English vocabulary words for a Gujarati speaker (Intermediate level).
        Output ONLY raw JSON (no markdown).
        
        Array Structure:
        [
          {
            "word": "English Word",
            "pronunciation": "Phonetic spelling in Gujarati script",
            "gujaratiMeaning": "Meaning in Gujarati",
            "englishDefinition": "Short definition in English",
            "exampleSentence": "A simple example sentence using the word."
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
    console.error("Vocabulary generation error:", error);
    return [];
  }
};

export const checkVocabularyUsage = async (word: string, sentence: string): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        The user is practicing the word: "${word}".
        User Sentence: "${sentence}".
        
        Check if the word is used correctly in the sentence.
        Output ONLY raw JSON.
        
        {
          "isCorrect": boolean,
          "feedback": "Explanation in Gujarati. If incorrect, explain why."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return cleanAndParseJson(response.text || "{}", {});
    });
  } catch (error) {
    console.error("Vocab check error:", error);
    return { isCorrect: false, feedback: "Error checking usage." };
  }
};

export const generatePhraseOfTheDay = async (): Promise<any> => {
  try {
    return await retryOperation(async () => {
      const ai = getAiClient();
      const prompt = `
        Generate a useful English idiom or phrase of the day for a Gujarati speaker.
        Output ONLY raw JSON.
        
        {
          "phrase": "English Phrase",
          "gujaratiMeaning": "Meaning in Gujarati",
          "pronunciation": "Phonetic in Gujarati"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      return cleanAndParseJson(response.text || "{}", {});
    });
  } catch (error) {
    console.error("Phrase error:", error);
    return null;
  }
};

export const generateGameData = async (gameType: 'scramble' | 'rapidFire', count: number = 5): Promise<any[]> => {
    try {
        return await retryOperation(async () => {
            const ai = getAiClient();
            let prompt = "";
            
            if (gameType === 'scramble') {
                prompt = `
                  Generate ${count} "Word Scramble" game items for English learners (Gujarati speakers).
                  Level: Easy to Intermediate.
                  Output ONLY raw JSON array:
                  [
                    {
                      "word": "APPLE",
                      "hint": "સફરજન (Fruit)",
                      "scrambled": "ELPPA" // Ensure scrambled is mixed up
                    }
                  ]
                `;
            } else if (gameType === 'rapidFire') {
                prompt = `
                  Generate ${count} "Rapid Fire Translation" questions.
                  Level: Easy to Intermediate.
                  Output ONLY raw JSON array:
                  [
                     {
                       "question": "How are you?",
                       "options": ["તમે કેમ છો?", "તમે ક્યાં છો?", "શું નામ છે?"],
                       "correctIndex": 0
                     }
                  ]
                `;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const data = cleanAndParseJson(response.text || "[]", []);
            
            // Double check scramble logic on client side if needed, or rely on AI
            if (gameType === 'scramble' && Array.isArray(data)) {
                return data.map((item: any) => ({
                    ...item,
                    word: item.word.toUpperCase(),
                    // Client side shuffle to be safe
                    scrambled: item.word.toUpperCase().split('').sort(() => Math.random() - 0.5).join('')
                }));
            }
            return data;
        });
    } catch (error) {
        console.error("Game data error:", error);
        return [];
    }
}