import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isModelOverloaded(err: unknown): boolean {
  const msg = String((err as any)?.message ?? err);
  return (
    msg.includes('"code":503') ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand")
  );
}

async function generateWithRetry(ai: GoogleGenAI) {
  const modelsToTry = ["gemini-3-flash-preview", "gemini-2.0-flash"];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents:
            "Generate exactly one short OOP coding challenge. Return JSON only.",
          config: {
            temperature: 0.6,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                exampleInput: { type: Type.STRING },
                exampleOutput: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
          },
        });
      } catch (e) {
        lastError = e;
        if (!isModelOverloaded(e)) {
          throw e; // שגיאה אמיתית - לא עומס
        }
        // עומס - נחכה קצת וננסה שוב
        await sleep(400 * attempt);
      }
    }
  }

  throw lastError ?? new Error("Model unavailable");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await generateWithRetry(ai);

    const text = response.text ?? "";
    try {
      res.status(200).json(JSON.parse(text));
    } catch {
      res.status(500).json({ error: "Invalid JSON from model", raw: text });
    }
  } catch (error: any) {
    // אם עדיין זה עומס אחרי כל הניסיונות - נחזיר הודעה נחמדה ללקוח
    if (isModelOverloaded(error)) {
      res.status(503).json({
        error:
          "Gemini is under high demand right now. Please try again in a moment.",
      });
      return;
    }
    res.status(500).json({ error: String(error?.message ?? error) });
  }
}

// import type { VercelRequest, VercelResponse } from "@vercel/node";
// import { GoogleGenAI, Type } from "@google/genai";
// import { CODING_LAB_SYSTEM_PROMPT } from "../constants";

// function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
// return new Promise((resolve, reject) => {
//     const id = setTimeout(
//     () => reject(new Error("Gemini request timed out")),
//     ms,
//     );
//     promise
//     .then((v) => {
//         clearTimeout(id);
//         resolve(v);
//     })
//     .catch((e) => {
//         clearTimeout(id);
//         reject(e);
//     });
// });
// }

// export default async function handler(req: VercelRequest, res: VercelResponse) {
// try {
//     if (req.method !== "POST") {
//     res.status(405).json({ error: "Method not allowed" });
//     return;
//     }

//     const geminiResponse = await withTimeout(
//     ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: "Return a very short OOP coding challenge in 3 lines.",
//         config: {
//         temperature: 0.4,
//         maxOutputTokens: 200,
//         },
//     }),
//     45000,
//     );

//     res.status(200).json({ text: geminiResponse.text ?? "" });
//     return;

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//     res.status(500).json({ error: "Missing GEMINI_API_KEY" });
//     return;
//     }

//     const ai = new GoogleGenAI({ apiKey });

//     const response = await withTimeout(
//     ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents:
//         "Create ONE short coding challenge for OOP practice. Return JSON with exactly: title, description, exampleInput, exampleOutput.",
//         config: {
//         temperature: 0.6,
//         responseMimeType: "application/json",
//         responseSchema: {
//             type: Type.OBJECT,
//             properties: {
//             title: { type: Type.STRING },
//             description: { type: Type.STRING },
//             exampleInput: { type: Type.STRING },
//             exampleOutput: { type: Type.STRING },
//             },
//             required: ["title", "description", "exampleInput", "exampleOutput"],
//         },
//         },
//     }),
//     20000,
//     );

//     const text = response.text ?? "";
//     try {
//     res.status(200).json(JSON.parse(text));
//     } catch {
//     res.status(500).json({ error: "Invalid JSON from model", raw: text });
//     }
// } catch (e: any) {
//     res.status(500).json({ error: String(e?.message ?? e) });
// }
// }
