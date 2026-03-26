import { Country, Message, Attachment } from "../types";

export const sendMessageToGemini = async (
  prompt: string,
  history: Message[],
  attachments: Attachment[],
  country: Country
): Promise<{ text: string; groundingSources: never[] }> => {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        history: history.map((m) => ({ role: m.role, content: m.content })),
        attachments: attachments.map((a) => ({
          name: a.name,
          mimeType: a.mimeType,
          data: a.data,
        })),
        country,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.text, groundingSources: [] };
  } catch (error) {
    console.error("API Error:", error);
    return {
      text:
        "I encountered an error. Please try again. " +
        (error instanceof Error ? error.message : String(error)),
      groundingSources: [],
    };
  }
};
