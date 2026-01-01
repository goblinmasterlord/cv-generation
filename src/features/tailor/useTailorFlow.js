import { useState, useCallback } from 'react'
import { parseCvToText, generateTextRepresentation } from '../../utils/cvParser'
import { applyChanges as applyChangesToHtml } from '../../utils/changeApplier'
import { createTailoringPrompt } from '../../prompts/tailorCv'
import { useGeminiApi } from '../../hooks'

/**
 * Hook for Tailor CV flow logic.
 * Manages: step, loading state, tailoring action.
 */
export function useTailorFlow(cvState, addToast) {
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')

    const { callGemini, parseJsonResponse } = useGeminiApi(addToast)

    const loadingSteps = [
        'Analyzing Job Description...',
        'Tailoring Experience & Skills...',
        'Formatting Document...'
    ]

    const handleTailor = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)

        try {
            // Step 1: Parse CV to text
            setLoadingStep(1)
            const parsed = parseCvToText(cvState.currentCv)
            const cvText = generateTextRepresentation(parsed)

            // Step 2: Get structured changes from AI
            setLoadingStep(2)
            const prompt = createTailoringPrompt(jobDescription, cvText, cvState.currentCv, userComments)
            const responseText = await callGemini(prompt, { temperature: 0.7 })

            // Step 3: Parse JSON response and apply changes
            setLoadingStep(3)
            const tailorData = parseJsonResponse(responseText)
            const changes = tailorData.changes || []

            const result = applyChangesToHtml(cvState.currentCv, changes)
            cvState.setCurrentCv(result.html)
            cvState.setShowHighlights(true)
            setStep(1)

            const { applied, failed } = result.summary
            if (failed > 0) {
                addToast(`Tailored CV with ${applied} changes (${failed} could not be applied)`, 'success')
            } else {
                addToast(`CV tailored with ${applied} changes!`, 'success')
            }

        } catch (error) {
            console.error('Tailoring error:', error)
            addToast(error.message || 'Failed to tailor CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, cvState, userComments, addToast, callGemini, parseJsonResponse])

    const handleBack = useCallback(() => {
        setStep(0)
    }, [])

    const reset = useCallback(() => {
        setStep(0)
        setJobDescription('')
        setUserComments('')
    }, [])

    return {
        step,
        setStep,
        isLoading,
        loadingStep,
        loadingSteps,
        jobDescription,
        setJobDescription,
        userComments,
        setUserComments,
        handleTailor,
        handleBack,
        reset
    }
}
