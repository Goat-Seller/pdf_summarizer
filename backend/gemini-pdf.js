import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";
dotenv.config();

/**
 * @description Summarizes a PDF provided in base64 format using Google Gemini API.
 * @param {pdf in base64 format} base64Pdf 
 * @returns 
 */
export async function summarizePdfBase64(base64Pdf) {
    try {
        // Initialize Gemini/GenAI client
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // Prepare contents with PDF data
        const contents = [
                {text: "Summarize this document" },
                {
                    inlineData: {
                        mimeType: 'application/pdf',
                        data: base64Pdf,
                    }
                }
        ];
        // Call Gemini API to generate summary
        const response = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
        contents: contents
    });
    return response.text;

    } catch (err) {
        return err.message;
    }
}

