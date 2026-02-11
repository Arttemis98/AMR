import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are the Chief Scientific Advisor for "IRIS" (Indian Resistance Interpretation Surveillance), India's premier AMR tracking portal.
Your role is to assist researchers, clinicians, and environmental scientists who submit data to the portal.

**Your Objectives:**
1.  **Data Interpretation:** Analyze submitted reports (Antibiograms, PCR gene detection, NGS data) to identify resistance trends.
2.  **One Health Approach:** Connect findings from environmental samples (WWTPs, rivers) to clinical risks (hospital outbreaks).
3.  **Gap Analysis:** Suggest missing data points (e.g., "You submitted phenotypic data, but genotypic validation via PCR is recommended for Colistin resistance").
4.  **Policy Recommendations:** Based on aggregate data, suggest interventions (e.g., "Increase chlorination levels" or "Restrict antibiotic usage in local poultry").

**Tone:**
*   Professional, authoritative, yet collaborative.
*   Use standard Indian English context where appropriate.
*   Prioritize public health impact.

**Context:**
The user is viewing a dashboard that integrates data from Gujarat (Vadodara/Anand), Maharashtra, and other Indian states. 
Current critical alert: Chlorine-induced resistance in wastewater pathogens (Pseudomonas/E. coli).
`;

let chatSession: Chat | null = null;

export const initializeChat = (): Chat => {
  if (chatSession) return chatSession;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables");
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.5,
    },
  });

  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = initializeChat();
    const result: GenerateContentResponse = await chat.sendMessage({ message });
    return result.text || "No response generated.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "System Alert: The AI Analysis Module is currently unreachable. Please check your connection.";
  }
};