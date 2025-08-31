/**
 * © 2024 N&M_AI_ART. All Rights Reserved.
 */
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse, Part } from "@google/genai";
import { locales, type Language } from "../lib/locales";


const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });


// --- Helper Functions ---

/**
 * Converts a data URL string to a Gemini API-compatible Part object.
 * @param imageDataUrl The data URL of the image.
 * @param lang The current language for error messages.
 * @returns A Part object for the Gemini API.
 */
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

/**
 * Processes the Gemini API response, extracting the image or throwing an error if none is found.
 * @param response The response from the generateContent call.
 * @param lang The current language for error messages.
 * @returns A data URL string for the generated image.
 */
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

/**
 * A wrapper for the Gemini API call that includes a retry mechanism for internal server errors.
 * @param imageParts The image parts of the request payload.
 * @param textPart The text part of the request payload.
 * @param lang The current language for error messages.
 * @returns The GenerateContentResponse from the API.
 */
async function callGeminiWithRetry(imageParts: Part[], textPart: Part, lang: Language): Promise<GenerateContentResponse> {
    const t = locales[lang];
    const maxRetries = 3;
    const initialDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [...imageParts, textPart] },
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
            throw error; // Re-throw if not a retriable error or if max retries are reached.
        }
    }
    // This should be unreachable due to the loop and throw logic above.
    throw new Error(t.connectionError);
}


/**
 * Generates an image by fusing a model, clothing, and background.
 * It includes a fallback mechanism for prompts that might be blocked.
 * @param characterImageDataUrl Data URL string of the model image.
 * @param propImageDataUrl Data URL string of the clothing image.
 * @param backgroundImageDataUrl Data URL string of the background image.
 * @param lang The current language ('vi' or 'en').
 * @param cameraAngleText The descriptive text for the camera angle (e.g., 'Toàn thân', 'Full Body').
 * @returns A promise that resolves to a base64-encoded image data URL of the generated image.
 */
export async function generateFusedImage(
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

    // --- First attempt with the original prompt ---
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
            
            // --- Second attempt with the fallback prompt ---
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
            // This is for other errors, like a final internal server error after retries.
            console.error("An unrecoverable error occurred during image generation.", error);
            throw new Error(`${t.unrecoverableError}${errorMessage}`);
        }
    }
}