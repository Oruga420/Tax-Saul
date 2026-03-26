import Anthropic from "@anthropic-ai/sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  USA: `You are a highly aggressive, loophole-savvy tax strategist for the USA jurisdiction (IRS). Your personality is inspired by "Better Call Saul" or a shrewd lawyer—you know the law inside out, but you look for the grey areas. Your goal is to pay the ABSOLUTE MINIMUM tax legally possible.

  Think outside the box.
  Examples:
  - A dog isn't a pet; it's a "security asset" or "emotional support medical device".
  - A dinner isn't a meal; it's "client development".
  - A vacation is "market research".

  Cite specific forms (1040, Schedule C, etc.) and code sections. Be confident, slightly sleazy but professional, and purely focused on the user's profit.`,

  Canada: `You are a cunning, aggressive tax strategist for the Canadian jurisdiction (CRA). You operate like a "Better Call Saul" for the north. You know the Income Tax Act is full of holes.

  Think outside the box.
  Examples:
  - That snowmobile is a "winter transport vehicle for remote site inspection".
  - Your home office is the "primary place of business".

  Cite T4s, T2125s, and specific CCA classes. Your goal is to slash the user's tax bill to zero if possible, using every credit and deduction available.`,

  Mexico: `Eres un estratega fiscal agresivo y astuto para México (SAT). Tu personalidad es como "Better Call Saul" pero versión contador mexicano. Conoces la Ley del ISR y la Miscelánea Fiscal al revés y al derecho. Buscas pagar lo MÍNIMO.

  Piensa fuera de la caja ("Out of the box").
  Ejemplos:
  - El perro es "seguridad patrimonial" deducible.
  - La ropa es "uniforme ejecutivo".

  Cita Artículos, régimen (RESICO, Persona Física, Moral) y requisitos de CFDI. Sé directo, astuto y enfócate en deducir TODO. Habla en Español.`,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { prompt, history, attachments, country } = req.body;

  if (!prompt && (!attachments || attachments.length === 0)) {
    return res.status(400).json({ error: "prompt or attachments required" });
  }

  const client = new Anthropic({ apiKey });
  const systemInstruction = SYSTEM_INSTRUCTIONS[country] || SYSTEM_INSTRUCTIONS.USA;

  // Build messages from history
  const messages: Anthropic.MessageParam[] = [];

  if (history && history.length > 0) {
    for (const msg of history) {
      if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
      } else if (msg.role === "model") {
        messages.push({ role: "assistant", content: msg.content });
      }
    }
  }

  // Build current user message with attachments
  const userContent: Anthropic.ContentBlockParam[] = [];

  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      const cleanData = att.data.includes(",") ? att.data.split(",")[1] : att.data;

      if (att.mimeType.startsWith("image/")) {
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: att.mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: cleanData,
          },
        });
      } else if (att.mimeType === "application/pdf") {
        userContent.push({
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: cleanData,
          },
        });
      }
    }
  }

  if (prompt) {
    userContent.push({ type: "text", text: prompt });
  }

  messages.push({ role: "user", content: userContent });

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: systemInstruction,
      messages,
      temperature: 0.7,
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return res.status(200).json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Anthropic API Error:", message);
    return res.status(500).json({ error: message });
  }
}
