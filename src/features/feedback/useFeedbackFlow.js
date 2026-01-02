import { useState, useCallback } from 'react'
import { parseCvToText, generateTextRepresentation } from '../../utils/cvParser'
import { applyChanges as applyChangesToHtml } from '../../utils/changeApplier'
import { createFeedbackPrompt } from '../../prompts/feedbackCv'
import { useGeminiApi } from '../../hooks'

/**
 * Hook for Feedback flow logic.
 * Manages: step, loading, feedback data, item selection, apply changes.
 */
export function useFeedbackFlow(cvState, addToast) {
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [isApplying, setIsApplying] = useState(false)
    const [applyStep, setApplyStep] = useState(0)

    // Core State
    const [feedback, setFeedback] = useState(null)
    const [jobDescription, setJobDescription] = useState('')

    // Source State (aligned with CvInputSection)
    const [sourceType, setSourceType] = useState('pdf') // Default to PDF as requested
    const [sourceText, setSourceText] = useState('')
    const [sourceImage, setSourceImage] = useState(null) // { file, base64, preview }
    // sourceFile is mapped to sourceImage/sourceText logic or kept for PDF specific handling if needed, 
    // but CvInputSection uses 'sourceImage' for both Image and PDF preview/data usually, or we can adapt.
    // Let's stick to the pattern in InterviewFlow: sourceImage used for PDF/Image data.

    // Legacy: sourceFile was used for PDF. Let's map it:
    // We will replace sourceFile with sourceImage for consistency with InterviewFlow

    const { callGemini, callGeminiMultimodal, parseJsonResponse } = useGeminiApi(addToast)

    const loadingSteps = [
        'Reading Your CV...',
        'Deep Analysis in Progress...',
        'Generating Recommendations...'
    ]

    // Count approved items with find/replace data
    const approvedCount = feedback?.items?.filter(i => {
        if (!i.approved) return false
        return (i.find && i.replace) || i.action
    }).length || 0

    // Generate apply steps based on approved items
    const getApplySteps = useCallback(() => {
        const approvedItems = feedback?.items?.filter(i => i.approved && i.action) || []
        const steps = ['Reading approved changes...']
        const sections = [...new Set(approvedItems.map(i => i.section || 'General'))]
        sections.forEach(section => {
            steps.push(`Updating ${section}...`)
        })
        steps.push('Finalizing document...')
        return steps
    }, [feedback])

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
        } else if (file.type === 'application/pdf') {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSourceImage({
                    file,
                    base64: e.target.result,
                    fileName: file.name
                })
                setSourceType('pdf')
                cvState.setCustomFileName(file.name) // For display awareness
                addToast('PDF uploaded for analysis')
            }
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSourceImage({
                    file,
                    base64: e.target.result,
                    preview: e.target.result,
                    fileName: file.name
                })
                setSourceType('image')
                addToast('Image uploaded for analysis')
            }
            reader.readAsDataURL(file)
        } else {
            addToast('Please upload HTML, PDF or Image', 'error')
        }
    }, [cvState, addToast])

    const handleFeedback = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)
        setFeedback(null)

        try {
            setLoadingStep(1)
            let responseText

            // Determine source content
            if (sourceType === 'pdf' && sourceImage) {
                setLoadingStep(2)
                const { createFeedbackMultimodalPrompt } = await import('../../prompts/feedbackCv')
                const prompt = createFeedbackMultimodalPrompt(jobDescription)

                responseText = await callGeminiMultimodal(prompt, {
                    base64: sourceImage.base64,
                    mimeType: 'application/pdf'
                }, { temperature: 0.5 })

            } else if (sourceType === 'image' && sourceImage) {
                setLoadingStep(2)
                // Multimodal for image
                const { createFeedbackMultimodalPrompt } = await import('../../prompts/feedbackCv')
                const prompt = createFeedbackMultimodalPrompt(jobDescription)

                responseText = await callGeminiMultimodal(prompt, {
                    base64: sourceImage.base64,
                    mimeType: sourceImage.file.type
                }, { temperature: 0.5 })

            } else if (sourceType === 'text') {
                setLoadingStep(2)
                const { createFeedbackPrompt } = await import('../../prompts/feedbackCv')
                // For text input, we pass it as cvText and empty html
                const prompt = createFeedbackPrompt(jobDescription, sourceText, '')
                responseText = await callGemini(prompt, { temperature: 0.5 })

            } else {
                // Default: HTML mode (using cvState.currentCv)
                const parsed = parseCvToText(cvState.currentCv)
                const cvText = generateTextRepresentation(parsed)
                // If it's the base template, we might want to flag that, but logic holds
                setLoadingStep(2)
                const { createFeedbackPrompt } = await import('../../prompts/feedbackCv')
                const prompt = createFeedbackPrompt(jobDescription, cvText, cvState.currentCv)
                responseText = await callGemini(prompt, { temperature: 0.5 })
            }

            setLoadingStep(3)
            await new Promise(r => setTimeout(r, 300))

            const feedbackData = parseJsonResponse(responseText)
            feedbackData.items = feedbackData.items?.map(item => ({
                ...item,
                approved: false
            })) || []

            setFeedback(feedbackData)
            setStep(1)
            addToast('Deep analysis complete!')

        } catch (error) {
            console.error('Feedback error:', error)
            addToast(error.message || 'Failed to analyze CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, cvState, sourceType, sourceImage, sourceText, addToast, callGemini, callGeminiMultimodal, parseJsonResponse])

    const handleToggleItem = useCallback((itemId) => {
        setFeedback(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, approved: !item.approved } : item
            )
        }))
    }, [])

    const handleApplyChanges = useCallback(async () => {
        const approvedItems = feedback?.items?.filter(i => {
            if (!i.approved) return false
            return i.find && i.replace
        }) || []

        if (approvedItems.length === 0) {
            const allApproved = feedback?.items?.filter(i => i.approved) || []
            const legacyItems = feedback?.items?.filter(i => i.approved && i.action) || []
            if (legacyItems.length > 0) {
                addToast('Selected items don\'t have replacement data. Please re-analyze.', 'error')
            } else if (allApproved.length > 0) {
                addToast(`${allApproved.length} items selected but missing find/replace data`, 'error')
            } else {
                addToast('No changes selected', 'error')
            }
            return
        }

        const steps = getApplySteps()
        setIsApplying(true)
        setApplyStep(0)

        try {
            for (let i = 0; i < steps.length - 1; i++) {
                setApplyStep(i)
                await new Promise(r => setTimeout(r, 300))
            }

            const result = applyChangesToHtml(cvState.currentCv, approvedItems)

            setApplyStep(steps.length - 1)
            await new Promise(r => setTimeout(r, 200))

            cvState.setCurrentCv(result.html)
            cvState.setShowHighlights(true)
            setStep(2)

            const { applied, failed } = result.summary
            if (failed > 0) {
                addToast(`Applied ${applied} changes (${failed} could not be found)`, 'success')
            } else {
                addToast(`Applied ${applied} improvement${applied !== 1 ? 's' : ''} to your CV!`, 'success')
            }

        } catch (error) {
            console.error('Apply error:', error)
            addToast(error.message || 'Failed to apply changes', 'error')
        } finally {
            setIsApplying(false)
            setApplyStep(0)
        }
    }, [feedback, cvState, addToast, getApplySteps])

    const handleBack = useCallback(() => {
        if (step > 0) setStep(step - 1)
    }, [step])

    const reset = useCallback(() => {
        setStep(0)
        setFeedback(null)
        setJobDescription('')
    }, [])

    return {
        step,
        setStep,
        isLoading,
        loadingStep,
        loadingSteps,
        isApplying,
        applyStep,
        feedback,
        approvedCount,
        jobDescription,
        setJobDescription,
        getApplySteps,
        handleFeedback,
        handleToggleItem,
        handleApplyChanges,
        handleBack,
        reset,
        // Exposed state for CvInputSection
        sourceType,
        setSourceType,
        sourceText,
        setSourceText,
        sourceImage,
        setSourceImage,
        handleFileUpload
    }
}
