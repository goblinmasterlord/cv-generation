// useGeminiApi - Shared API call logic for Gemini AI
// Extracted from App.jsx to reduce duplication

import { useCallback } from 'react'

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent'

/**
 * Hook for making Gemini API calls
 * @param {Function} addToast - Toast notification function
 * @returns {Object} API call functions
 */
export const useGeminiApi = (addToast) => {
    /**
     * Call Gemini API with text prompt
     * @param {string} prompt - The prompt to send
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Parsed JSON string response
     */
    const callGemini = useCallback(async (prompt, options = {}) => {
        const { temperature = 0.7, maxOutputTokens = 8192 } = options

        const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            throw new Error('API key not configured')
        }

        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature, maxOutputTokens }
            })
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!responseText) {
            throw new Error('No response from AI')
        }

        return responseText
    }, [])

    /**
     * Call Gemini API with multimodal input (text + image)
     * @param {string} prompt - The prompt to send
     * @param {Object} imageData - Image data { base64, mimeType }
     * @param {Object} options - Generation options
     * @returns {Promise<string>} Parsed JSON string response
     */
    const callGeminiMultimodal = useCallback(async (prompt, imageData, options = {}) => {
        const { temperature = 0.7, maxOutputTokens = 8192 } = options

        const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
        if (!apiKey) {
            throw new Error('API key not configured')
        }

        // Extract base64 data (remove data:image/xxx;base64, prefix if present)
        const base64Data = imageData.base64.includes(',')
            ? imageData.base64.split(',')[1]
            : imageData.base64

        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: imageData.mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }],
                generationConfig: { temperature, maxOutputTokens }
            })
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`)
        }

        const data = await response.json()
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!responseText) {
            throw new Error('No response from AI')
        }

        return responseText
    }, [])

    /**
     * Parse JSON from AI response (handles markdown code blocks)
     * @param {string} responseText - Raw AI response
     * @returns {Object} Parsed JSON object
     */
    const parseJsonResponse = useCallback((responseText) => {
        const cleanJson = responseText
            .replace(/^```json\n?/i, '')
            .replace(/\n?```$/i, '')
            .trim()

        return JSON.parse(cleanJson)
    }, [])

    return {
        callGemini,
        callGeminiMultimodal,
        parseJsonResponse
    }
}

export default useGeminiApi
