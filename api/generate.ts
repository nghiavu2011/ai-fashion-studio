/**
 * © 2025 N&M_AI_ART. All Rights Reserved.
 *
 * This is a Vercel Edge Function that handles secure calls to the Gemini API.
 */
import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import { locales, type Language } from "../lib/locales";

// This tells Vercel to run this function on the Edge network for speed.
export const config = {
  runtime: 'edge',
};

// Ensure the API key is available in the environment variables.
// On Vercel, this should be set in the project settings.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


// --- Main Handler ---
// This function is triggered when a request is made to /api/generate
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      characterImageDataUrl,
      propImageDataUrl,
      backgroundImageDataUrl,
      lang,
      cameraAngleText,
    } = await request.json();

    if (!characterImageDataUrl || !propImageDataUrl || !backgroundImageDataUrl || !lang || !cameraAngleText) {
        return new Response(JSON.stringify({ error: 'Missing required parameters.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const imageUrl = await generateFusedImage(
        characterImageDataUrl,
        propImageDataUrl,
        backgroundImageDataUrl,
        lang,
        cameraAngleText
    );

    return new Response(JSON.stringify({ imageUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in /api/generate handler:", error);
    const message = error instanceof Error ? error.message : "An unknown internal server error occurred.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


// --- Helper Functions (moved from original services/geminiService.ts) ---

function dataUrlToGeminiPart(imageDataUrl: string, lang: Language): Part {
    const t = locales[lang];
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      throw new Error(t.invalidDataUrlError);
    }
    const [, mimeType, data] = match;
    return {
      inlineData: { mimeType, data },
    };
}

function processGeminiResponse(response: GenerateContentResponse, lang: Language): string {
    const t = locales[lang];
    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const textResponse = response.text;
    console.error("API did not return an image. Response:", textResponse);
    throw new Error(`${t.apiReturnsTextError}"${textResponse || t.noResponseError}"`);
}

async function callGeminiWithRetry(imageParts: Part[], textPart: Part, lang: Language): Promise<GenerateContentResponse> {
    const t = locales[lang];
    const maxRetries = 3;
    const initialDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [...imageParts, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
        } catch (error) {
            console.error(`Error calling Gemini API (Attempt ${attempt}/${maxRetries}):`, error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            const isInternalError = errorMessage.includes('"code":500') || errorMessage.includes('INTERNAL');

            if (isInternalError && attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                console.log(`Internal error detected. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error(t.connectionError);
}

async function generateFusedImage(
    characterImageDataUrl: string, 
    propImageDataUrl: string,
    backgroundImageDataUrl: string,
    lang: Language,
    cameraAngleText: string
): Promise<string> {
    const t = locales[lang];
    const characterImagePart = dataUrlToGeminiPart(characterImageDataUrl, lang);
    const propImagePart = dataUrlToGeminiPart(propImageDataUrl, lang);
    const backgroundImagePart = dataUrlToGeminiPart(backgroundImageDataUrl, lang);
    const imageParts = [characterImagePart, propImagePart, backgroundImagePart];

    try {
        console.log("Attempting generation with original prompt...");
        const promptWithAngle = t.geminiPrompt.replace('[CAMERA_ANGLE_PLACEHOLDER]', cameraAngleText);
        const textPart = { text: promptWithAngle };
        const response = await callGeminiWithRetry(imageParts, textPart, lang);
        return processGeminiResponse(response, lang);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        const isNoImageError = errorMessage.includes(t.apiReturnsTextError.trim());

        if (isNoImageError) {
            console.warn("Original prompt was likely blocked. Trying a fallback prompt.");
            try {
                console.log(`Attempting generation with fallback prompt...`);
                const fallbackPromptWithAngle = t.geminiFallbackPrompt.replace('[CAMERA_ANGLE_PLACEHOLDER]', cameraAngleText);
                const fallbackTextPart = { text: fallbackPromptWithAngle };
                const fallbackResponse = await callGeminiWithRetry(imageParts, fallbackTextPart, lang);
                return processGeminiResponse(fallbackResponse, lang);
            } catch (fallbackError) {
                console.error("Fallback prompt also failed.", fallbackError);
                const finalErrorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                throw new Error(`${t.fallbackFailedError}${finalErrorMessage}`);
            }
        } else {
            console.error("An unrecoverable error occurred during image generation.", error);
            throw new Error(`${t.unrecoverableError}${errorMessage}`);
        }
    }
}
