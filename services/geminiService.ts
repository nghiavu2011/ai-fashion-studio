/**
 * © 2025 N&M_AI_ART. All Rights Reserved.
 */
import type { Language } from "../lib/locales";

/**
 * Calls the backend serverless function to generate an image by fusing a model, clothing, and background.
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
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            characterImageDataUrl,
            propImageDataUrl,
            backgroundImageDataUrl,
            lang,
            cameraAngleText,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
        // Use the error message from the serverless function
        throw new Error(errorData.error || 'Failed to generate image due to a server error.');
    }

    const result = await response.json();
    if (!result.imageUrl) {
        throw new Error('Server response did not include an image URL.');
    }
    
    return result.imageUrl;
}