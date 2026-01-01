import { useState, useCallback, useRef } from 'react'
import { parseCvToText, generateTextRepresentation } from '../../utils/cvParser'
import { generateCvHtml } from '../../utils/cvGenerator'
import { createCvPrompt, createCvMultimodalPrompt } from '../../prompts/createCv'
import { useGeminiApi } from '../../hooks'

/**
 * Hook for Create CV flow logic.
 * Manages: step, source input, contact info, optional sections, CV generation.
 */
export function useCreateFlow(cvState, addToast) {
    const [step, setStep] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)

    // Source input
    const [sourceType, setSourceType] = useState('text') // 'text' | 'image' | 'html'
    const [sourceText, setSourceText] = useState('')
    const [sourceImage, setSourceImage] = useState(null) // { file, base64, preview }
    const [sourceFileName, setSourceFileName] = useState('')

    // Contact info
    const [contactInfo, setContactInfo] = useState({
        name: '',
        email: '',
        phone: '',
        location: ''
    })

    // Optional sections
    const [includeEducation, setIncludeEducation] = useState(false)
    const [includeCertifications, setIncludeCertifications] = useState(false)
    const [education, setEducation] = useState('')
    const [certifications, setCertifications] = useState('')

    // Job description
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')

    // Section expansion (progressive disclosure)
    const [experienceSectionOpen, setExperienceSectionOpen] = useState(false)
    const [jobSectionOpen, setJobSectionOpen] = useState(false)

    const fileInputRef = useRef(null)
    const { callGemini, callGeminiMultimodal, parseJsonResponse } = useGeminiApi(addToast)

    const loadingSteps = [
        'Extracting CV Data...',
        'Analyzing Job Requirements...',
        'Generating Tailored CV...',
        'Formatting Document...'
    ]

    const isContactFilled = contactInfo.name.trim().length > 0

    const hasSource = sourceType === 'text' ? sourceText.trim() :
        sourceType === 'image' ? sourceImage :
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

    const handleCreate = useCallback(async () => {
        if (!contactInfo.name.trim()) {
            addToast('Please enter your name', 'error')
            return
        }
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }
        if (sourceType === 'text' && !sourceText.trim()) {
            addToast('Please enter your experience information', 'error')
            return
        }
        if (sourceType === 'image' && !sourceImage) {
            addToast('Please upload a CV screenshot', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)

        const promptOptions = {
            contactInfo,
            includeEducation,
            includeCertifications,
            educationText: education,
            certificationsText: certifications
        }

        try {
            let responseText

            if (sourceType === 'image' && sourceImage) {
                setLoadingStep(1)
                const prompt = createCvMultimodalPrompt(jobDescription, userComments, promptOptions)

                setLoadingStep(2)
                responseText = await callGeminiMultimodal(prompt, {
                    base64: sourceImage.base64,
                    mimeType: sourceImage.file.type
                }, { temperature: 0.7 })
            } else {
                setLoadingStep(1)
                const currentSourceText = sourceType === 'text' ? sourceText : sourceText
                const prompt = createCvPrompt(jobDescription, currentSourceText, userComments, promptOptions)

                setLoadingStep(2)
                responseText = await callGemini(prompt, { temperature: 0.7 })
            }

            setLoadingStep(3)
            const cvData = parseJsonResponse(responseText)

            const generatedHtml = generateCvHtml(cvData, { includeEducation, includeCertifications })
            cvState.setCurrentCv(generatedHtml)
            cvState.setShowHighlights(true)
            setStep(1)

            addToast('CV created successfully!')

        } catch (error) {
            console.error('Create CV error:', error)
            addToast(error.message || 'Failed to create CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [
        contactInfo, jobDescription, sourceType, sourceText, sourceImage, userComments,
        includeEducation, includeCertifications, education, certifications,
        cvState, addToast, callGemini, callGeminiMultimodal, parseJsonResponse
    ])

    const handleBack = useCallback(() => {
        setStep(0)
    }, [])

    const reset = useCallback(() => {
        setStep(0)
        setSourceText('')
        setSourceImage(null)
        setSourceFileName('')
        setJobDescription('')
        setUserComments('')
    }, [])

    return {
        step,
        setStep,
        isLoading,
        loadingStep,
        loadingSteps,
        sourceType,
        setSourceType,
        sourceText,
        setSourceText,
        sourceImage,
        setSourceImage,
        sourceFileName,
        setSourceFileName,
        contactInfo,
        setContactInfo,
        includeEducation,
        setIncludeEducation,
        includeCertifications,
        setIncludeCertifications,
        education,
        setEducation,
        certifications,
        setCertifications,
        jobDescription,
        setJobDescription,
        userComments,
        setUserComments,
        experienceSectionOpen,
        setExperienceSectionOpen,
        jobSectionOpen,
        setJobSectionOpen,
        fileInputRef,
        isContactFilled,
        hasSource,
        handleFileUpload,
        handleCreate,
        handleBack,
        reset
    }
}
