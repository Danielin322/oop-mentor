import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
import { INTERVIEW_SYSTEM_PROMPT, CODING_LAB_SYSTEM_PROMPT } from "../constants";

type StudyCardResponse = {
  definition: string;
  example: string;
};

export type CodingLabChallenge = {
  title: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string;
  example1Input: string;
  example1Output: string;
  example2Input: string;
  example2Output: string;
};

export type CodeEvaluationResponse = {
  isCorrect: boolean;
  confidence: "low" | "medium" | "high";
  feedback: string;
  failingCases?: string[];
  improvements?: string;
};

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  }

  public async startChat() {
    this.chat = this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: INTERVIEW_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const response = await this.chat.sendMessage({ message: "שלום, בוא נתחיל בראיון." });
    return response.text;
  }

  public async sendMessageStream(message: string, onChunk: (text: string) => void) {
    if (!this.chat) {
      throw new Error("Chat not initialized");
    }

    try {
      const responseStream = await this.chat.sendMessageStream({ message });
      let fullText = "";
      for await (const chunk of responseStream) {
        const c = chunk as GenerateContentResponse;
        const text = c.text || "";
        fullText += text;
        onChunk(fullText);
      }
      return fullText;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  public async generateStudyCardContent(term: string, language: string): Promise<StudyCardResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a professional Object-Oriented Programming definition and a concise code example for the term "${term}" in the context of the ${language} programming language.`,
      config: {
        temperature: 0.4,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: {
              type: Type.STRING,
              description: "The clear, educational definition of the term.",
            },
            example: {
              type: Type.STRING,
              description: "A brief, practical code snippet demonstrating the concept.",
            },
          },
          required: ["definition", "example"],
        },
      },
    });

    return this.safeJsonParse<StudyCardResponse>(response.text, "generateStudyCardContent");
  }

  // Coding Lab: language agnostic algorithmic challenge generator
  // Keeping the parameter for backward compatibility with your UI, but it is not used to phrase the problem.
  public async generateCodeChallenge(language?: string): Promise<CodingLabChallenge> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate exactly one programming challenge now.",
      config: {
        systemInstruction: CODING_LAB_SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            inputDescription: { type: Type.STRING },
            outputDescription: { type: Type.STRING },
            constraints: { type: Type.STRING },
            example1Input: { type: Type.STRING },
            example1Output: { type: Type.STRING },
            example2Input: { type: Type.STRING },
            example2Output: { type: Type.STRING },
          },
          required: [
            "title",
            "inputDescription",
            "outputDescription",
            "constraints",
            "example1Input",
            "example1Output",
            "example2Input",
            "example2Output",
          ],
        },
      },
    });

    return this.safeJsonParse<CodingLabChallenge>(response.text, "generateCodeChallenge");
  }

  // Backward compatible evaluator:
  // You can pass either a string challengeDescription (old behavior) or a structured challenge object (recommended).
  public async evaluateCodeSolution(
    language: string,
    challengeOrDescription: CodingLabChallenge | string,
    userCode: string
  ): Promise<CodeEvaluationResponse> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

    const challengeText = this.formatChallengeForEvaluation(challengeOrDescription);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `
You are a strict code reviewer and evaluator.

Goal: evaluate the user's solution WITHOUT executing code.

Rules:
1) Do not claim that you executed the code.
2) Mentally simulate the logic against the provided examples.
3) Invent 5 to 8 additional test cases including edge cases implied by constraints.
4) Identify likely syntax or compilation issues for the chosen language.
5) Produce a correctness verdict and confidence level.

Return JSON only.

Language: ${language}

Problem:
${challengeText}

User code:
${userCode}
      `.trim(),
      config: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            confidence: {
              type: Type.STRING,
              description: "low, medium, or high",
            },
            feedback: {
              type: Type.STRING,
              description: "Short, direct evaluation.",
            },
            failingCases: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "If incorrect, list specific failing inputs.",
            },
            improvements: {
              type: Type.STRING,
              description: "One short tip to improve correctness or clarity.",
            },
          },
          required: ["isCorrect", "confidence", "feedback"],
        },
      },
    });

    const parsed = this.safeJsonParse<any>(response.text, "evaluateCodeSolution");

    // Normalize confidence to allowed values
    const confidence = this.normalizeConfidence(parsed.confidence);

    const result: CodeEvaluationResponse = {
      isCorrect: Boolean(parsed.isCorrect),
      confidence,
      feedback: String(parsed.feedback ?? ""),
      failingCases: Array.isArray(parsed.failingCases) ? parsed.failingCases.map(String) : undefined,
      improvements: parsed.improvements != null ? String(parsed.improvements) : undefined,
    };

    return result;
  }

  private formatChallengeForEvaluation(challengeOrDescription: CodingLabChallenge | string): string {
    if (typeof challengeOrDescription === "string") {
      // Backward compatibility mode: we only have a free-text description.
      // The evaluator will be less reliable, but it will still behave "like Gemini chat".
      return challengeOrDescription.trim();
    }

    const ch = challengeOrDescription;
    return [
      `Title: ${ch.title}`,
      `Input description: ${ch.inputDescription}`,
      `Output description: ${ch.outputDescription}`,
      `Constraints: ${ch.constraints}`,
      `Example 1 input: ${ch.example1Input}`,
      `Example 1 output: ${ch.example1Output}`,
      `Example 2 input: ${ch.example2Input}`,
      `Example 2 output: ${ch.example2Output}`,
    ].join("\n");
  }

  private normalizeConfidence(value: any): "low" | "medium" | "high" {
    const v = String(value ?? "").toLowerCase().trim();
    if (v === "high") return "high";
    if (v === "medium") return "medium";
    return "low";
  }

  private safeJsonParse<T>(text: string, context: string): T {
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      console.error(`Failed to parse AI response in ${context}`, e, { text });
      throw new Error(`Invalid AI response format in ${context}`);
    }
  }
}

export const geminiService = new GeminiService();


// import { GoogleGenAI, Chat, GenerateContentResponse, Type } from "@google/genai";
// import { INTERVIEW_SYSTEM_PROMPT } from "../constants";

// export class GeminiService {
//   private ai: GoogleGenAI;
//   private chat: Chat | null = null;

//   constructor() {
//     this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
//   }

//   public async startChat() {
//     this.chat = this.ai.chats.create({
//       model: 'gemini-3-pro-preview',
//       config: {
//         systemInstruction: INTERVIEW_SYSTEM_PROMPT,
//         temperature: 0.7,
//       },
//     });

//     // Start with a generic trigger to get the system's defined "First Message"
//     const response = await this.chat.sendMessage({ message: "שלום, בוא נתחיל בראיון." });
//     return response.text;
//   }

//   public async sendMessageStream(message: string, onChunk: (text: string) => void) {
//     if (!this.chat) {
//       throw new Error("Chat not initialized");
//     }

//     try {
//       const responseStream = await this.chat.sendMessageStream({ message });
//       let fullText = "";
//       for await (const chunk of responseStream) {
//         const c = chunk as GenerateContentResponse;
//         const text = c.text || "";
//         fullText += text;
//         onChunk(fullText);
//       }
//       return fullText;
//     } catch (error) {
//       console.error("Gemini API Error:", error);
//       throw error;
//     }
//   }

//   public async generateStudyCardContent(term: string, language: string) {
//     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview",
//       contents: `Provide a professional Object-Oriented Programming definition and a concise code example for the term "${term}" in the context of the ${language} programming language.`,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             definition: {
//               type: Type.STRING,
//               description: 'The clear, educational definition of the term.',
//             },
//             example: {
//               type: Type.STRING,
//               description: 'A brief, practical code snippet demonstrating the concept.',
//             },
//           },
//           required: ["definition", "example"],
//         },
//       },
//     });

//     try {
//       return JSON.parse(response.text);
//     } catch (e) {
//       console.error("Failed to parse AI response", e);
//       throw new Error("Invalid AI response format");
//     }
//   }

//   public async generateCodeChallenge(language: string) {
//     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview",
//       contents: `Generate a SHORT and CONCISE coding challenge for a student learning OOP in ${language}. 
//       The task must be small: either writing a single class definition or one specific method. 
//       The solution should require no more than 5-10 lines of code. 
//       Focus on ONE specific concept like "Encapsulate this property" or "Override this specific method".`,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             title: { type: Type.STRING },
//             description: { type: Type.STRING, description: 'A very short task description.' },
//           },
//           required: ["title", "description"],
//         },
//       },
//     });
//     return JSON.parse(response.text);
//   }

//   public async evaluateCodeSolution(language: string, challengeDescription: string, userCode: string) {
//     const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
//     const response = await ai.models.generateContent({
//       model: "gemini-3-pro-preview",
//       contents: `Language: ${language}\nTask: ${challengeDescription}\n\nUser's Solution:\n${userCode}\n\nEvaluate if the solution correctly implements the requested OOP logic. Be concise.`,
//       config: {
//         responseMimeType: "application/json",
//         responseSchema: {
//           type: Type.OBJECT,
//           properties: {
//             isCorrect: { type: Type.BOOLEAN },
//             feedback: { type: Type.STRING, description: 'Brief feedback.' },
//             improvements: { type: Type.STRING, description: 'One short tip.' },
//           },
//           required: ["isCorrect", "feedback"],
//         },
//       },
//     });
//     return JSON.parse(response.text);
//   }
// }

// export const geminiService = new GeminiService();
