import { useState, useRef, useCallback, useEffect } from 'react'
import baseCvTemplate from './templates/baseCv'
import { createTailoringPrompt } from './prompts/tailorCv'
import { createFeedbackPrompt } from './prompts/feedbackCv'
import { createCvPrompt, createCvMultimodalPrompt } from './prompts/createCv'
import { parseCvToText, generateTextRepresentation } from './utils/cvParser'
import { applyChanges as applyChangesToHtml, stripHighlights, hasHighlights as checkHighlights } from './utils/changeApplier'
import { generateCvHtml } from './utils/cvGenerator'

// Extracted Components
import { Icons, ToastContainer, useToast, SteppedLoadingOverlay } from './components/ui'
import { CVPreviewFull, CVPreviewModal } from './components/cv'
import { FeedbackResults } from './components/feedback'
import { useGeminiApi } from './hooks'

function App() {
    // Mode and Flow State
    const [activeMode, setActiveMode] = useState('tailor') // 'tailor' | 'feedback' | 'create'
    const [flowStep, setFlowStep] = useState(0) // 0 = input, 1 = result (tailor/create) or feedback (feedback), 2 = result (feedback only)

    // Input State
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')
    const [currentCv, setCurrentCv] = useState(baseCvTemplate)
    const [templateMode, setTemplateMode] = useState('base')
    const [customFileName, setCustomFileName] = useState('')

    // Create Mode Input State
    const [createSourceType, setCreateSourceType] = useState('text') // 'text' | 'image' | 'html'
    const [createSourceText, setCreateSourceText] = useState('')
    const [createSourceImage, setCreateSourceImage] = useState(null) // { file, base64, preview }
    const [createSourceFileName, setCreateSourceFileName] = useState('')

    // Loading State
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [isApplying, setIsApplying] = useState(false)
    const [applyStep, setApplyStep] = useState(0)

    // UI State
    const { toasts, addToast } = useToast()
    const [zoom, setZoom] = useState(1)
    const [feedback, setFeedback] = useState(null)
    const [showHighlights, setShowHighlights] = useState(true)
    const [showCvModal, setShowCvModal] = useState(false)

    const fileInputRef = useRef(null)
    const createFileInputRef = useRef(null)

    // Hooks
    const { callGemini, callGeminiMultimodal, parseJsonResponse } = useGeminiApi(addToast)

    // Reset flow step when mode changes
    useEffect(() => {
        setFlowStep(0)
        setFeedback(null)
    }, [activeMode])

    // Count approved items that have find/replace data (or legacy action field)
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

    // Get CV for display
    const getDisplayCv = useCallback(() => {
        if (showHighlights) return currentCv
        return currentCv.replace(/<span class="cv-change-highlight">(.*?)<\/span>/gi, '$1')
    }, [currentCv, showHighlights])

    // Get CV for export
    const getExportCv = useCallback(() => {
        return currentCv.replace(/<span class="cv-change-highlight">(.*?)<\/span>/gi, '$1')
    }, [currentCv])

    // Check if CV has highlights
    const hasHighlights = currentCv.includes('cv-change-highlight')

    // --- Actions ---

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
            const parsed = parseCvToText(currentCv)
            const cvText = generateTextRepresentation(parsed)
            console.log('Parsed CV text:', cvText.substring(0, 500))

            // Step 2: Get structured changes from AI
            setLoadingStep(2)
            const prompt = createTailoringPrompt(jobDescription, cvText, currentCv, userComments)
            const responseText = await callGemini(prompt, { temperature: 0.7 })

            // Step 3: Parse JSON response and apply changes
            setLoadingStep(3)
            const tailorData = parseJsonResponse(responseText)
            const changes = tailorData.changes || []

            console.log('Changes to apply:', changes.length)

            // Apply changes programmatically
            const result = applyChangesToHtml(currentCv, changes)
            console.log('Apply result:', result.summary)

            setCurrentCv(result.html)
            setShowHighlights(true)
            setFlowStep(1)

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
    }, [jobDescription, currentCv, userComments, addToast, callGemini, parseJsonResponse])

    const handleFeedback = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)
        setFeedback(null)

        try {
            // Step 1: Parse CV to text
            setLoadingStep(1)
            const parsed = parseCvToText(currentCv)
            const cvText = generateTextRepresentation(parsed)

            // Step 2: Get feedback from AI
            setLoadingStep(2)
            const prompt = createFeedbackPrompt(jobDescription, cvText, currentCv)
            const responseText = await callGemini(prompt, { temperature: 0.5 })

            setLoadingStep(3)
            await new Promise(r => setTimeout(r, 300))

            const feedbackData = parseJsonResponse(responseText)

            feedbackData.items = feedbackData.items?.map(item => ({
                ...item,
                approved: false
            })) || []

            setFeedback(feedbackData)
            setFlowStep(1)
            addToast('Deep analysis complete!')

        } catch (error) {
            console.error('Feedback error:', error)
            addToast(error.message || 'Failed to analyze CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, currentCv, addToast, callGemini, parseJsonResponse])

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

            const result = applyChangesToHtml(currentCv, approvedItems)

            setApplyStep(steps.length - 1)
            await new Promise(r => setTimeout(r, 200))

            setCurrentCv(result.html)
            setShowHighlights(true)
            setFlowStep(2)

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
    }, [feedback, currentCv, addToast, getApplySteps])

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setCurrentCv(e.target.result)
                setCustomFileName(file.name)
                setTemplateMode('custom')
                addToast('Custom template loaded')
            }
            reader.readAsText(file)
        } else if (file.type.startsWith('image/')) {
            setCustomFileName(file.name)
            setTemplateMode('custom')
            addToast('Image uploaded (Using base template)', 'success')
        } else {
            addToast('Please upload HTML or Image', 'error')
        }
    }, [addToast])

    const handleCreateFileUpload = useCallback((event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const parsed = parseCvToText(e.target.result)
                const textContent = generateTextRepresentation(parsed)
                setCreateSourceText(textContent)
                setCreateSourceType('html')
                setCreateSourceFileName(file.name)
                setCreateSourceImage(null)
                addToast('HTML CV loaded - content extracted')
            }
            reader.readAsText(file)
        } else if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setCreateSourceImage({
                    file: file,
                    base64: e.target.result,
                    preview: e.target.result
                })
                setCreateSourceType('image')
                setCreateSourceFileName(file.name)
                setCreateSourceText('')
                addToast('Screenshot uploaded')
            }
            reader.readAsDataURL(file)
        } else {
            addToast('Please upload HTML or image file', 'error')
        }
    }, [addToast])

    const handleCreate = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        if (createSourceType === 'text' && !createSourceText.trim()) {
            addToast('Please enter your experience information', 'error')
            return
        }
        if (createSourceType === 'image' && !createSourceImage) {
            addToast('Please upload a CV screenshot', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(0)

        try {
            let responseText

            if (createSourceType === 'image' && createSourceImage) {
                setLoadingStep(1)
                const prompt = createCvMultimodalPrompt(jobDescription, userComments)

                setLoadingStep(2)
                responseText = await callGeminiMultimodal(prompt, {
                    base64: createSourceImage.base64,
                    mimeType: createSourceImage.file.type
                }, { temperature: 0.7 })
            } else {
                setLoadingStep(1)
                const sourceText = createSourceType === 'text' ? createSourceText : createSourceText
                const prompt = createCvPrompt(jobDescription, sourceText, userComments)

                setLoadingStep(2)
                responseText = await callGemini(prompt, { temperature: 0.7 })
            }

            setLoadingStep(3)
            const cvData = parseJsonResponse(responseText)

            const generatedHtml = generateCvHtml(cvData)
            setCurrentCv(generatedHtml)
            setShowHighlights(true)
            setFlowStep(1)

            addToast('CV created successfully!')

        } catch (error) {
            console.error('Create CV error:', error)
            addToast(error.message || 'Failed to create CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, createSourceType, createSourceText, createSourceImage, userComments, addToast, callGemini, callGeminiMultimodal, parseJsonResponse])

    const handleDownload = useCallback(() => {
        const exportHtml = getExportCv()
        const blob = new Blob([exportHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'tailored-cv.html'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        addToast('CV downloaded (highlights removed)')
    }, [getExportCv, addToast])

    const handleReset = useCallback(() => {
        setCurrentCv(baseCvTemplate)
        setTemplateMode('base')
        setCustomFileName('')
        setFeedback(null)
        setFlowStep(0)
        addToast('Reset to base template')
    }, [addToast])

    const handleTemplateSwitch = (mode) => {
        if (mode === 'base') {
            handleReset()
        } else {
            setTemplateMode('custom')
            fileInputRef.current?.click()
        }
    }

    const handleBack = () => {
        if (flowStep > 0) {
            setFlowStep(flowStep - 1)
        }
    }

    const getLoadingSteps = () => {
        if (activeMode === 'tailor') {
            return ['Analyzing Job Description...', 'Tailoring Experience & Skills...', 'Formatting Document...']
        }
        if (activeMode === 'create') {
            return ['Extracting CV Data...', 'Analyzing Job Requirements...', 'Generating Tailored CV...', 'Formatting Document...']
        }
        return ['Reading Your CV...', 'Deep Analysis in Progress...', 'Generating Recommendations...']
    }

    const loadingSteps = getLoadingSteps()
    const applySteps = getApplySteps()

    // --- Render ---

    const getStepIndicator = () => {
        if (activeMode === 'tailor' || activeMode === 'create') {
            return (
                <div className="step-indicator">
                    <div className={`step-indicator__item ${flowStep === 0 ? 'step-indicator__item--active' : ''} ${flowStep > 0 ? 'step-indicator__item--done' : ''}`}>
                        <span className="step-indicator__number">1</span>
                        <span className="step-indicator__label">Input</span>
                    </div>
                    <div className="step-indicator__line" />
                    <div className={`step-indicator__item ${flowStep === 1 ? 'step-indicator__item--active' : ''}`}>
                        <span className="step-indicator__number">2</span>
                        <span className="step-indicator__label">Result</span>
                    </div>
                </div>
            )
        }
        return (
            <div className="step-indicator">
                <div className={`step-indicator__item ${flowStep === 0 ? 'step-indicator__item--active' : ''} ${flowStep > 0 ? 'step-indicator__item--done' : ''}`}>
                    <span className="step-indicator__number">1</span>
                    <span className="step-indicator__label">Input</span>
                </div>
                <div className="step-indicator__line" />
                <div className={`step-indicator__item ${flowStep === 1 ? 'step-indicator__item--active' : ''} ${flowStep > 1 ? 'step-indicator__item--done' : ''}`}>
                    <span className="step-indicator__number">2</span>
                    <span className="step-indicator__label">Feedback</span>
                </div>
                <div className="step-indicator__line" />
                <div className={`step-indicator__item ${flowStep === 2 ? 'step-indicator__item--active' : ''}`}>
                    <span className="step-indicator__number">3</span>
                    <span className="step-indicator__label">Result</span>
                </div>
            </div>
        )
    }

    const renderStepContent = () => {
        if (isLoading) {
            const loadingTitles = {
                tailor: 'Tailoring Your CV',
                feedback: 'Analyzing Your CV',
                create: 'Creating Your CV'
            }
            return (
                <SteppedLoadingOverlay
                    steps={loadingSteps}
                    currentStep={loadingStep}
                    title={loadingTitles[activeMode]}
                />
            )
        }

        if (isApplying) {
            return (
                <SteppedLoadingOverlay
                    steps={applySteps}
                    currentStep={applyStep}
                    title="Applying Changes"
                />
            )
        }

        // Step 0: Input for Tailor/Feedback modes
        if (flowStep === 0 && activeMode !== 'create') {
            return (
                <div className="flow-step flow-step--input">
                    <div className="flow-step__content">
                        <section className="input-section">
                            <div className="input-section__header">
                                <h2 className="input-section__title">CV Template</h2>
                            </div>
                            <div className="template-selector">
                                <button
                                    className={`template-option ${templateMode === 'base' ? 'template-option--active' : ''}`}
                                    onClick={() => handleTemplateSwitch('base')}
                                >
                                    Base Template
                                </button>
                                <button
                                    className={`template-option ${templateMode === 'custom' ? 'template-option--active' : ''}`}
                                    onClick={() => handleTemplateSwitch('custom')}
                                >
                                    Upload Custom
                                </button>
                            </div>

                            {templateMode === 'custom' && (
                                <div
                                    className={`file-upload ${customFileName ? 'file-upload--active' : ''}`}
                                    onClick={() => !customFileName && fileInputRef.current?.click()}
                                >
                                    {customFileName ? (
                                        <div className="file-upload__preview">
                                            <span className="file-upload__filename">{customFileName}</span>
                                            <span className="file-upload__remove" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                                                Remove
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <Icons.Upload />
                                            <p className="file-upload__text">Upload HTML or Screenshot</p>
                                            <p className="file-upload__hint">Drag & drop to replace base template</p>
                                        </>
                                    )}
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept=".html,image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                        </section>

                        <div className="divider">Job Details</div>

                        <section className="input-section">
                            <div className="input-section__header">
                                <h2 className="input-section__title">Job Description</h2>
                            </div>
                            <textarea
                                className="textarea"
                                placeholder="Paste the full job posting (requirements, responsibilities)..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="char-count">{jobDescription.length} chars</div>
                        </section>

                        {activeMode === 'tailor' && (
                            <section className="input-section">
                                <div className="input-section__header">
                                    <h2 className="input-section__title">Your Notes</h2>
                                </div>
                                <textarea
                                    className="textarea textarea--small"
                                    placeholder="E.g., 'Emphasize leadership'..."
                                    value={userComments}
                                    onChange={(e) => setUserComments(e.target.value)}
                                />
                            </section>
                        )}
                    </div>
                </div>
            )
        }

        // Step 0: Input for Create mode
        if (flowStep === 0 && activeMode === 'create') {
            return (
                <div className="flow-step flow-step--input">
                    <div className="flow-step__content">
                        <section className="input-section">
                            <div className="input-section__header">
                                <h2 className="input-section__title">Your Experience</h2>
                                <p className="input-section__subtitle">Provide your background in one of these formats</p>
                            </div>
                            <div className="source-type-selector">
                                <button
                                    className={`source-type-option ${createSourceType === 'text' ? 'source-type-option--active' : ''}`}
                                    onClick={() => setCreateSourceType('text')}
                                >
                                    <Icons.Text />
                                    <span>Paste Text</span>
                                </button>
                                <button
                                    className={`source-type-option ${createSourceType === 'image' ? 'source-type-option--active' : ''}`}
                                    onClick={() => setCreateSourceType('image')}
                                >
                                    <Icons.Image />
                                    <span>Screenshot</span>
                                </button>
                                <button
                                    className={`source-type-option ${createSourceType === 'html' ? 'source-type-option--active' : ''}`}
                                    onClick={() => setCreateSourceType('html')}
                                >
                                    <Icons.Upload />
                                    <span>HTML File</span>
                                </button>
                            </div>

                            {createSourceType === 'text' && (
                                <textarea
                                    className="textarea textarea--large"
                                    placeholder="Paste your experience, LinkedIn summary, resume bullets, or describe your background...

Example:
- Software Engineer at Google (2020-2023)
- Led team of 5 on search infrastructure
- MSc Computer Science, Stanford 2020"
                                    value={createSourceText}
                                    onChange={(e) => setCreateSourceText(e.target.value)}
                                />
                            )}

                            {createSourceType === 'image' && (
                                <div
                                    className={`file-upload file-upload--large ${createSourceImage ? 'file-upload--active' : ''}`}
                                    onClick={() => !createSourceImage && createFileInputRef.current?.click()}
                                >
                                    {createSourceImage ? (
                                        <div className="file-upload__image-preview">
                                            <img src={createSourceImage.preview} alt="CV Preview" />
                                            <div className="file-upload__image-overlay">
                                                <span className="file-upload__filename">{createSourceFileName}</span>
                                                <button
                                                    className="file-upload__remove-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCreateSourceImage(null);
                                                        setCreateSourceFileName('');
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <Icons.Image />
                                            <p className="file-upload__text">Upload CV Screenshot</p>
                                            <p className="file-upload__hint">PNG, JPG, or PDF screenshot</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {createSourceType === 'html' && (
                                <div
                                    className={`file-upload ${createSourceFileName && createSourceType === 'html' ? 'file-upload--active' : ''}`}
                                    onClick={() => !(createSourceFileName && createSourceType === 'html') && createFileInputRef.current?.click()}
                                >
                                    {createSourceFileName && createSourceType === 'html' ? (
                                        <div className="file-upload__preview">
                                            <span className="file-upload__filename">{createSourceFileName}</span>
                                            <span
                                                className="file-upload__remove"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCreateSourceText('');
                                                    setCreateSourceFileName('');
                                                }}
                                            >
                                                Remove
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <Icons.Upload />
                                            <p className="file-upload__text">Upload HTML CV</p>
                                            <p className="file-upload__hint">We'll extract the content</p>
                                        </>
                                    )}
                                </div>
                            )}

                            <input
                                ref={createFileInputRef}
                                type="file"
                                accept={createSourceType === 'image' ? 'image/*' : '.html'}
                                onChange={handleCreateFileUpload}
                                style={{ display: 'none' }}
                            />
                        </section>

                        <div className="divider">Target Job</div>

                        <section className="input-section">
                            <div className="input-section__header">
                                <h2 className="input-section__title">Job Description</h2>
                            </div>
                            <textarea
                                className="textarea"
                                placeholder="Paste the job posting you're applying for..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <div className="char-count">{jobDescription.length} chars</div>
                        </section>

                        <section className="input-section">
                            <div className="input-section__header">
                                <h2 className="input-section__title">Additional Notes</h2>
                                <span className="input-section__optional">Optional</span>
                            </div>
                            <textarea
                                className="textarea textarea--small"
                                placeholder="Any specific focus or preferences..."
                                value={userComments}
                                onChange={(e) => setUserComments(e.target.value)}
                            />
                        </section>
                    </div>
                </div>
            )
        }

        // Step 1 for Tailor: Result
        if (activeMode === 'tailor' && flowStep === 1) {
            return (
                <div className="flow-step flow-step--result">
                    <CVPreviewFull
                        cvHtml={getDisplayCv()}
                        showHighlights={showHighlights}
                        onToggleHighlights={() => setShowHighlights(!showHighlights)}
                        hasHighlights={hasHighlights}
                        zoom={zoom}
                        setZoom={setZoom}
                    />
                </div>
            )
        }

        // Step 1 for Create: Result
        if (activeMode === 'create' && flowStep === 1) {
            return (
                <div className="flow-step flow-step--result">
                    <CVPreviewFull
                        cvHtml={getDisplayCv()}
                        showHighlights={showHighlights}
                        onToggleHighlights={() => setShowHighlights(!showHighlights)}
                        hasHighlights={hasHighlights}
                        zoom={zoom}
                        setZoom={setZoom}
                    />
                </div>
            )
        }

        // Step 1 for Feedback: Feedback Dashboard
        if (activeMode === 'feedback' && flowStep === 1) {
            return (
                <div className="flow-step flow-step--feedback">
                    <div className="flow-step__content flow-step__content--wide">
                        <FeedbackResults
                            feedback={feedback}
                            onToggleItem={handleToggleItem}
                        />
                    </div>
                </div>
            )
        }

        // Step 2 for Feedback: Result
        if (activeMode === 'feedback' && flowStep === 2) {
            return (
                <div className="flow-step flow-step--result">
                    <CVPreviewFull
                        cvHtml={getDisplayCv()}
                        showHighlights={showHighlights}
                        onToggleHighlights={() => setShowHighlights(!showHighlights)}
                        hasHighlights={hasHighlights}
                        zoom={zoom}
                        setZoom={setZoom}
                    />
                </div>
            )
        }

        return null
    }

    const renderBottomBarActions = () => {
        if (flowStep === 0 && activeMode !== 'create') {
            return (
                <>
                    <button
                        className="btn btn--secondary"
                        onClick={() => setShowCvModal(true)}
                    >
                        <Icons.Eye /> Preview CV
                    </button>
                    <button
                        className="btn btn--primary"
                        onClick={activeMode === 'tailor' ? handleTailor : handleFeedback}
                        disabled={isLoading || !jobDescription.trim()}
                    >
                        {activeMode === 'tailor' ? 'Tailor CV' : 'Analyze CV'}
                    </button>
                </>
            )
        }

        if (flowStep === 0 && activeMode === 'create') {
            const hasSource = createSourceType === 'text' ? createSourceText.trim() :
                createSourceType === 'image' ? createSourceImage :
                    createSourceFileName
            return (
                <>
                    <button
                        className="btn btn--primary btn--large"
                        onClick={handleCreate}
                        disabled={isLoading || !jobDescription.trim() || !hasSource}
                    >
                        <Icons.Plus /> Create CV
                    </button>
                </>
            )
        }

        if (activeMode === 'tailor' && flowStep === 1) {
            return (
                <>
                    <button className="btn btn--secondary" onClick={handleBack}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__spacer" />
                    <button className="btn btn--secondary" onClick={handleReset}>
                        <Icons.Refresh /> Reset
                    </button>
                    <button className="btn btn--primary" onClick={handleDownload}>
                        <Icons.Download /> Download
                    </button>
                </>
            )
        }

        if (activeMode === 'create' && flowStep === 1) {
            return (
                <>
                    <button className="btn btn--secondary" onClick={handleBack}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__spacer" />
                    <button className="btn btn--secondary" onClick={() => {
                        setFlowStep(0)
                        setCreateSourceText('')
                        setCreateSourceImage(null)
                        setCreateSourceFileName('')
                    }}>
                        <Icons.Refresh /> Start Over
                    </button>
                    <button className="btn btn--primary" onClick={handleDownload}>
                        <Icons.Download /> Download
                    </button>
                </>
            )
        }

        if (activeMode === 'feedback' && flowStep === 1) {
            return (
                <>
                    <button className="btn btn--secondary" onClick={handleBack}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__info">
                        <span className="bottom-bar__count">{approvedCount}</span>
                        <span className="bottom-bar__label">change{approvedCount !== 1 ? 's' : ''} selected</span>
                    </div>
                    <button
                        className="btn btn--primary"
                        onClick={handleApplyChanges}
                        disabled={approvedCount === 0 || isApplying}
                    >
                        Apply Changes
                    </button>
                </>
            )
        }

        if (activeMode === 'feedback' && flowStep === 2) {
            return (
                <>
                    <button className="btn btn--secondary" onClick={handleBack}>
                        <Icons.ArrowLeft /> Back to Feedback
                    </button>
                    <div className="bottom-bar__spacer" />
                    <button className="btn btn--secondary" onClick={handleReset}>
                        <Icons.Refresh /> Start Over
                    </button>
                    <button className="btn btn--primary" onClick={handleDownload}>
                        <Icons.Download /> Download
                    </button>
                </>
            )
        }

        return null
    }

    return (
        <div className="app-flow">
            <ToastContainer toasts={toasts} />

            <header className="app-flow__header">
                <div className="app__logo">CV Generator</div>
                <nav className="app__nav">
                    <button
                        className={`nav-tab ${activeMode === 'create' ? 'nav-tab--active' : ''}`}
                        onClick={() => setActiveMode('create')}
                    >
                        <Icons.Plus /> Create New
                    </button>
                    <button
                        className={`nav-tab ${activeMode === 'tailor' ? 'nav-tab--active' : ''}`}
                        onClick={() => setActiveMode('tailor')}
                    >
                        Tailor CV
                    </button>
                    <button
                        className={`nav-tab ${activeMode === 'feedback' ? 'nav-tab--active' : ''}`}
                        onClick={() => setActiveMode('feedback')}
                    >
                        Get Feedback
                    </button>
                </nav>
            </header>

            <div className="app-flow__steps">
                {getStepIndicator()}
            </div>

            <main className="app-flow__main">
                {renderStepContent()}
            </main>

            <div className="bottom-bar">
                <div className="bottom-bar__content">
                    {renderBottomBarActions()}
                </div>
            </div>

            <CVPreviewModal
                isOpen={showCvModal}
                onClose={() => setShowCvModal(false)}
                cvHtml={getDisplayCv()}
                showHighlights={showHighlights}
                onToggleHighlights={() => setShowHighlights(!showHighlights)}
                hasHighlights={hasHighlights}
            />
        </div>
    )
}

export default App
