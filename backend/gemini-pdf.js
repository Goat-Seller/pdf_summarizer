import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
dotenv.config();
/**
 * summarizePdfBase64
 * - Accepts a base64-encoded PDF and returns a summary result.
 * - Attempts to dynamically use the installed `@google/genai` client.
 * - If that fails, returns a helpful object explaining how to enable
 *   the Gemini integration.
 */
export async function summarizePdfBase64(base64Pdf) {
    if (!base64Pdf) throw new Error('No PDF data provided');
    
    if (!process.env.GEMINI_API_KEY) {
        return {
            error: 'GEMINI_API_KEY not set. Set it in your environment or .env file.',
            hint: 'Run: npm install @google/genai && set GEMINI_API_KEY=your_key'
        };
    }

    try {
        // Dynamic import so the function still works even if the client isn't installed.
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const contents = [
                {text: "Summarize this document" },
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: base64Pdf,
                    }
                }
        ];
        const response = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
        contents: contents
    });
    return response.text;

    } catch (err) {
        console.error('Error during Gemini API call:', err);
        return {
            error: err.message,
        };
    }
}

