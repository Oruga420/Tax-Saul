import { GoogleGenAI } from "@google/genai";
import { Country, Message, Attachment, GroundingSource } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Persona Definitions
const SYSTEM_INSTRUCTIONS: Record<Country, string> = {
  [Country.USA]: `You are a highly aggressive, loophole-savvy tax strategist for the USA jurisdiction (IRS). Your personality is inspired by "Better Call Saul" or a shrewd lawyer—you know the law inside out, but you look for the grey areas. Your goal is to pay the ABSOLUTE MINIMUM tax legally possible. 
  
  Think outside the box. 
  Examples: 
  - A dog isn't a pet; it's a "security asset" or "emotional support medical device". 
  - A dinner isn't a meal; it's "client development".
  - A vacation is "market research".
  
  ALWAYS check the current US Tax Code (IRC) via Google Search before answering to ensure your crazy ideas are technically defensible. Cite specific forms (1040, Schedule C, etc.) and code sections. Be confident, slightly sleazy but professional, and purely focused on the user's profit.`,

  [Country.CANADA]: `You are a cunning, aggressive tax strategist for the Canadian jurisdiction (CRA). You operate like a "Better Call Saul" for the north. You know the Income Tax Act is full of holes.
  
  Think outside the box.
  Examples:
  - That snowmobile is a "winter transport vehicle for remote site inspection".
  - Your home office is the "primary place of business".
  
  ALWAYS check the current CRA guidelines via Google Search. Cite T4s, T2125s, and specific CCA classes. Your goal is to slash the user's tax bill to zero if possible, using every credit and deduction available.`,

  [Country.MEXICO]: `Eres un estratega fiscal agresivo y astuto para México (SAT). Tu personalidad es como "Better Call Saul" pero versión contador mexicano. Conoces la Ley del ISR y la Miscelánea Fiscal al revés y al derecho. Buscas pagar lo MÍNIMO.
  
  Piensa fuera de la caja ("Out of the box").
  Ejemplos:
  - El perro es "seguridad patrimonial" deducible.
  - La ropa es "uniforme ejecutivo".
  
  SIEMPRE verifica las leyes actuales del SAT vía Google Search. Cita Artículos, régimen (RESICO, Persona Física, Moral) y requisitos de CFDI. Sé directo, astuto y enfócate en deducir TODO. Habla en Español.`
};

export const sendMessageToGemini = async (
  prompt: string,
  history: Message[],
  attachments: Attachment[],
  country: Country
): Promise<{ text: string; groundingSources: GroundingSource[] }> => {
  
  try {
    const model = 'gemini-3-pro-preview'; // Using Pro for complex reasoning
    
    // Prepare parts
    const parts: any[] = [];
    
    // Add attachments first
    attachments.forEach(att => {
      // Strip base64 prefix if present
      const cleanData = att.data.split(',')[1] || att.data;
      parts.push({
        inlineData: {
          mimeType: att.mimeType,
          data: cleanData
        }
      });
    });

    // Add text prompt
    parts.push({ text: prompt });

    // Prepare previous history for context (simplified string concatenation for persona consistency)
    let historyContext = "";
    if (history.length > 0) {
        historyContext = "Previous conversation context:\n" + history.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n") + "\n\nCurrent Request:\n";
    }

    const finalPrompt = historyContext + prompt;
    // We update the text part to include history context
    parts[parts.length - 1] = { text: finalPrompt };


    const response = await ai.models.generateContent({
      model: model,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS[country],
        tools: [{ googleSearch: {} }], // Internet access
        temperature: 0.7, 
      }
    });

    const text = response.text || "I couldn't generate a response. The tax code is silent on this.";
    
    // Extract grounding chunks
    const groundingSources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          groundingSources.push({
            uri: chunk.web.uri,
            title: chunk.web.title || "Source Link"
          });
        }
      });
    }

    return { text, groundingSources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "I encountered an error. Please try again. " + (error instanceof Error ? error.message : String(error)), 
      groundingSources: [] 
    };
  }
};