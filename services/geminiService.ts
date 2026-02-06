import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API Key is available
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeCodeWithGemini = async (
  promptText: string,
  codeSnippet: string,
  base64Image?: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const model = 'gemini-3-pro-preview'; // Using Pro for complex reasoning and coding tasks

  const systemInstruction = `
    You are Agent Architect, an elite senior software engineer and system architect. 
    Your goal is to analyze code or architecture diagrams provided by the user.
    
    1. Identify bugs, security vulnerabilities, performance bottlenecks, and anti-patterns.
    2. Provide a corrected version of the code or a detailed architectural improvement plan.
    3. Explain your reasoning clearly using Markdown.
    4. If the explanation involves system relationships, flows, or state changes, YOU MUST generate a Mermaid.js diagram to visualize it.
       Wrap Mermaid code in a code block like this:
       \`\`\`mermaid
       graph TD;
         A-->B;
       \`\`\`
    
    Be concise but thorough. Use a professional, technical tone.
  `;

  try {
    const parts: any[] = [];

    // Add image if present
    if (base64Image) {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      const base64Data = base64Image.split(',')[1] || base64Image;
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG or adapt based on input
          data: base64Data
        }
      });
    }

    // Construct the text prompt
    let userMessage = "";
    if (codeSnippet) {
      userMessage += `Here is the code to analyze:\n\`\`\`\n${codeSnippet}\n\`\`\`\n\n`;
    }
    userMessage += promptText;
    
    parts.push({ text: userMessage });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for more deterministic/correct code
        thinkingConfig: { thinkingBudget: 2048 }, // Enable thinking for better reasoning
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze code. Please try again.");
  }
};
