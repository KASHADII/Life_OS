import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Fallback to prevent crash if key is missing, though instructions say assume it's there.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getMotivationalQuote = async (): Promise<string> => {
  if (!ai) return "Stay hungry, stay foolish. (API Key Missing)";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Give me a short, punchy, unique motivational quote for a software engineering student preparing for tough interviews. Do not include author, just the quote.",
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Consistenty is the key to mastery.";
  }
};

export const getDSAHint = async (problemTitle: string, topic: string[]): Promise<string> => {
  if (!ai) return "Configure API Key for AI hints.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a conceptual hint for the DSA problem "${problemTitle}" which involves topics: ${topic.join(', ')}. 
      Do not give the code directly. Explain the intuition or the data structure to use in 2-3 sentences.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not fetch hint at this time.";
  }
};

export const breakdownTask = async (taskTitle: string): Promise<string[]> => {
    if (!ai) return ["Analyze requirements", "Draft solution", "Implement", "Test"];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Break down the task "${taskTitle}" into 3-5 actionable subtasks for a student. Return only the subtasks as a bulleted list.`,
        });
        const text = response.text;
        return text.split('\n').map(line => line.replace(/^[-*]\s*/, '').trim()).filter(line => line.length > 0);
    } catch (error) {
        return ["Plan", "Execute", "Review"];
    }
}
