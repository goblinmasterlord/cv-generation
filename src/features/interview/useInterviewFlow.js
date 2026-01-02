import { useState, useCallback, useRef } from 'react'
import { parseCvToText, generateTextRepresentation } from '../../utils/cvParser'
import { createInterviewStrategyPrompt, createTechnicalQuestionsPrompt } from '../../prompts/interviewCv'
import { useGeminiApi } from '../../hooks'

/**
 * Hook for Interview Prep flow logic.
 * Manages: step, source input, job description, strategy data, technical data.
 * 
 * Flow: Input (0) → Strategy (1) → Technical (2)
 * Two separate LLM calls with context passing between them.
 */
export function useInterviewFlow(addToast) {
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)

    // Source input (similar to CreateFlow)
    const [sourceType, setSourceType] = useState('pdf') // Default to PDF as requested
    const [sourceText, setSourceText] = useState('')
    const [sourceImage, setSourceImage] = useState(null) // { file, base64, preview }
    const [sourceFileName, setSourceFileName] = useState('')

    // Job description & comments
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')

    // AI Results
    const [strategyData, setStrategyData] = useState(null)
    const [technicalData, setTechnicalData] = useState(null)

    const fileInputRef = useRef(null)
    const { callGemini, callGeminiMultimodal, parseJsonResponse } = useGeminiApi(addToast)

    const strategyLoadingSteps = [
        'Analyzing your CV...',
        'Studying job requirements...',
        'Crafting your pitch...',
        'Generating interview strategy...'
    ]

    const technicalLoadingSteps = [
        'Reviewing role requirements...',
        'Analyzing technical skills...',
        'Generating challenging questions...',
        'Preparing STAR scenarios...'
    ]

    const hasSource = sourceType === 'text' ? sourceText.trim() :
        (sourceType === 'image' || sourceType === 'pdf') ? (sourceImage || sourceFileName) : // Allow if file name exists (pdf/image)
            sourceFileName

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const parsed = parseCvToText(e.target.result)
                const textContent = generateTextRepresentation(parsed)
                setSourceText(textContent)
                setSourceType('html')
                setSourceFileName(file.name)
                setSourceImage(null)
                addToast('HTML CV loaded - content extracted')
            }
            reader.readAsText(file)
        } else if (file.type === 'application/pdf') {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSourceImage({
                    file: file,
                    base64: e.target.result,
                    fileName: file.name
                })
                setSourceType('pdf')
                setSourceFileName(file.name)
                setSourceText('')
                addToast('PDF uploaded')
            }
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setSourceImage({
                    file: file,
                    base64: e.target.result,
                    preview: e.target.result
                })
                setSourceType('image')
                setSourceFileName(file.name)
                setSourceText('')
                addToast('Screenshot uploaded')
            }
            reader.readAsDataURL(file)
        } else {
            addToast('Please upload HTML or image file', 'error')
        }
    }, [addToast])

    // Step 0 → 1: Generate interview strategy
    const handleAnalyze = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }
        if (sourceType === 'text' && !sourceText.trim()) {
            addToast('Please enter your CV information', 'error')
            return
        }
        if ((sourceType === 'image' || sourceType === 'pdf') && !sourceImage) {
            addToast('Please upload a CV reference', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)

        try {
            let responseText

            if (sourceType === 'pdf' && sourceImage) {
                setLoadingStep(1)
                const { createInterviewStrategyMultimodalPrompt } = await import('../../prompts/interviewCv')
                const prompt = createInterviewStrategyMultimodalPrompt(jobDescription, userComments)

                setLoadingStep(2)
                responseText = await callGeminiMultimodal(prompt, {
                    base64: sourceImage.base64,
                    mimeType: 'application/pdf'
                }, { temperature: 0.7 })

            } else if (sourceType === 'image' && sourceImage) {
                setLoadingStep(1)
                // For image input, we need multimodal - but our prompt expects text
                // So we'll include instruction to extract CV content from image
                const { createInterviewStrategyPrompt } = await import('../../prompts/interviewCv')
                const imagePrompt = `First, extract all text content from this CV image. Then use that content to complete the following task:\n\n${createInterviewStrategyPrompt(jobDescription, '[CV content from image above]', userComments)}`

                setLoadingStep(2)
                responseText = await callGeminiMultimodal(imagePrompt, {
                    base64: sourceImage.base64,
                    mimeType: sourceImage.file.type
                }, { temperature: 0.7 })
            } else {
                setLoadingStep(1)
                const { createInterviewStrategyPrompt } = await import('../../prompts/interviewCv')
                const prompt = createInterviewStrategyPrompt(jobDescription, sourceText, userComments)

                setLoadingStep(2)
                responseText = await callGemini(prompt, { temperature: 0.7 })
            }

            setLoadingStep(3)
            const data = parseJsonResponse(responseText)

            setStrategyData(data)
            setStep(1)
            addToast('Interview strategy ready!')

        } catch (error) {
            console.error('Interview strategy error:', error)
            addToast(error.message || 'Failed to generate interview strategy', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, sourceType, sourceText, sourceImage, userComments, addToast, callGemini, callGeminiMultimodal, parseJsonResponse])

    // Step 1 → 2: Generate technical questions (uses context from strategy)
    const handleTechnical = useCallback(async () => {
        if (!strategyData) {
            addToast('Strategy data missing', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)

        try {
            setLoadingStep(1)

            // Build context from strategy step for consistency
            const strategyContext = {
                topStrengths: strategyData.cvHighlights?.topStrengths || [],
                relevantExperience: strategyData.cvHighlights?.relevantExperience || '',
                uniqueValue: strategyData.cvHighlights?.uniqueValue || ''
            }

            let responseText

            if (sourceType === 'pdf' && sourceImage) {
                const { createTechnicalQuestionsMultimodalPrompt } = await import('../../prompts/interviewCv')
                const prompt = createTechnicalQuestionsMultimodalPrompt(jobDescription, strategyContext)

                setLoadingStep(2)
                responseText = await callGeminiMultimodal(prompt, {
                    base64: sourceImage.base64,
                    mimeType: 'application/pdf'
                }, { temperature: 0.7 })

            } else {
                const cvContent = sourceType === 'image'
                    ? '[CV content previously analyzed from image]'
                    : sourceText

                const { createTechnicalQuestionsPrompt } = await import('../../prompts/interviewCv')
                const prompt = createTechnicalQuestionsPrompt(jobDescription, cvContent, strategyContext)

                setLoadingStep(2)
                responseText = await callGemini(prompt, { temperature: 0.7 })
            }

            setLoadingStep(3)
            const data = parseJsonResponse(responseText)

            setTechnicalData(data)
            setStep(2)
            addToast('Technical questions ready!')

        } catch (error) {
            console.error('Technical questions error:', error)
            addToast(error.message || 'Failed to generate technical questions', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [strategyData, sourceType, sourceText, sourceImage, jobDescription, addToast, callGemini, callGeminiMultimodal, parseJsonResponse])

    const handleBack = useCallback(() => {
        if (step > 0) setStep(step - 1)
    }, [step])

    const reset = useCallback(() => {
        setStep(0)
        setSourceText('')
        setSourceImage(null)
        setSourceFileName('')
        setJobDescription('')
        setUserComments('')
        setStrategyData(null)
        setTechnicalData(null)
    }, [])

    return {
        step,
        setStep,
        isLoading,
        loadingStep,
        strategyLoadingSteps,
        technicalLoadingSteps,
        sourceType,
        setSourceType,
        sourceText,
        setSourceText,
        sourceImage,
        setSourceImage,
        sourceFileName,
        setSourceFileName,
        jobDescription,
        setJobDescription,
        userComments,
        setUserComments,
        strategyData,
        technicalData,
        fileInputRef,
        hasSource,
        handleFileUpload,
        handleAnalyze,
        handleTechnical,
        handleBack,
        reset
    }
}
