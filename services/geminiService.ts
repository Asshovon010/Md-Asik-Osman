
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, ResumeData } from "../types";

// Support both Vite (import.meta.env) and standard Node (process.env) environments
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined);
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const sendMessageToGemini = async (
  history: ChatMessage[],
  newMessage: string,
  resumeData: ResumeData
): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API key is missing.");
    return "I'm sorry, I can't answer right now. Please try again later.";
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash-latest",
      config: {
        systemInstruction: `You are a helpful AI assistant for ${resumeData.name}, a ${resumeData.title}.
        
        Here is the resume data you can use to answer questions:
        ${JSON.stringify(resumeData, null, 2)}
        
        Answer questions concisely and professionally. If you don't know the answer based on the provided data, suggest contacting ${resumeData.name} directly via the contact form or email.`,
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I'm sorry, I didn't get a response.";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "I'm sorry, something went wrong. Please try again later.";
  }
};
