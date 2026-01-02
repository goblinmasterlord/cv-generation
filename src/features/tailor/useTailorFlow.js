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
    // Source State (aligned with CvInputSection)
    const [sourceType, setSourceType] = useState('lilla') // Default to Lilla's CV (Base)
    const [sourceText, setSourceText] = useState('')
    const [sourceImage, setSourceImage] = useState(null) // { file, base64, preview }
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')

    const { callGemini, parseJsonResponse } = useGeminiApi(addToast)

    const loadingSteps = [
        'Analyzing Job Description...',
        'Tailoring Experience & Skills...',
        'Formatting Document...'
    ]

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                cvState.loadCustomCv(e.target.result, file.name)
                setSourceType('html')
                setSourceImage(null)
                addToast('Custom template loaded')
            }
            reader.readAsText(file)
        } else {
            // For Tailor flow, we ideally want HTML. 
            // If they upload PDF/Image, we can capture it but can't fully tailor it with highlights yet.
            // We'll allow it for now but warn on action.
            if (file.type === 'application/pdf') {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setSourceImage({ file, base64: e.target.result, fileName: file.name })
                    setSourceType('pdf')
                    addToast('PDF uploaded (Note: Highlighting requires HTML)', 'info')
                }
                reader.readAsDataURL(file)
            } else if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setSourceImage({ file, base64: e.target.result, preview: e.target.result, fileName: file.name })
                    setSourceType('image')
                    addToast('Image uploaded (Note: Highlighting requires HTML)', 'info')
                }
                reader.readAsDataURL(file)
            }
        }
    }, [cvState, addToast])

    const handleTailor = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        // Validate Source for Tailoring
        // We strictly need HTML content in cvState.currentCv to apply highlights.
        // If sourceType is text/pdf/image, we don't have that yet.
        const requiresHtmlMsg = 'Tailoring with highlights requires an HTML CV or Lilla\'s CV. Please upload an HTML file.'

        if (sourceType === 'text' || sourceType === 'pdf' || sourceType === 'image') {
            addToast(requiresHtmlMsg, 'warning')
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
    }, [jobDescription, cvState, userComments, sourceType, addToast, callGemini, parseJsonResponse])

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
        reset,
        // Exposed Source State
        sourceType,
        setSourceType,
        sourceText,
        setSourceText,
        sourceImage,
        setSourceImage,
        handleFileUpload
    }
}
