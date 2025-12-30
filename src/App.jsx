import { useState, useRef, useCallback, useEffect } from 'react'
import baseCvTemplate from './templates/baseCv'
import { createTailoringPrompt } from './prompts/tailorCv'
import { createFeedbackPrompt } from './prompts/feedbackCv'

// --- Utility Components ---

const Icons = {
    Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    ZoomIn: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    ZoomOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    Maximize: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>,
}

// Custom Toast System
const ToastContainer = ({ toasts }) => (
    <div className="toast-container">
        {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.type}`}>
                <div className="toast__content">{toast.message}</div>
            </div>
        ))}
    </div>
)

// Feedback Results Component
const FeedbackResults = ({ feedback }) => {
    if (!feedback) return null

    const getScoreClass = (score) => {
        if (score >= 80) return 'feedback-score--high'
        if (score >= 60) return 'feedback-score--medium'
        return 'feedback-score--low'
    }

    return (
        <div className="feedback-results">
            <div className="feedback-header">
                <div className={`feedback-score ${getScoreClass(feedback.overallScore)}`}>
                    {feedback.overallScore}
                </div>
                <p className="feedback-summary">{feedback.summary}</p>
            </div>

            <div className="feedback-sections">
                <div className="feedback-section">
                    <h3 className="feedback-section__title">Strengths</h3>
                    <ul className="feedback-list feedback-list--strengths">
                        {feedback.strengths?.map((item, i) => (
                            <li key={i}><Icons.Check /> {item}</li>
                        ))}
                    </ul>
                </div>

                <div className="feedback-section">
                    <h3 className="feedback-section__title">Areas to Improve</h3>
                    <ul className="feedback-list feedback-list--improvements">
                        {feedback.improvements?.map((item, i) => (
                            <li key={i}><Icons.Arrow /> {item}</li>
                        ))}
                    </ul>
                </div>

                {feedback.missingKeywords?.length > 0 && (
                    <div className="feedback-section">
                        <h3 className="feedback-section__title">Missing Keywords</h3>
                        <div className="keyword-tags">
                            {feedback.missingKeywords.map((keyword, i) => (
                                <span key={i} className="keyword-tag">{keyword}</span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="feedback-section">
                    <h3 className="feedback-section__title">Suggestions</h3>
                    <ul className="feedback-list feedback-list--suggestions">
                        {feedback.suggestions?.map((item, i) => (
                            <li key={i}>{item}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

function App() {
    const [activeMode, setActiveMode] = useState('tailor') // 'tailor' or 'feedback'
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')
    const [currentCv, setCurrentCv] = useState(baseCvTemplate)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0) // 0: Idle, 1: Analyzing, 2: Tailoring/Processing, 3: Formatting

    const [toasts, setToasts] = useState([])
    const [templateMode, setTemplateMode] = useState('base')
    const [customFileName, setCustomFileName] = useState('')
    const [zoom, setZoom] = useState(1)
    const [feedback, setFeedback] = useState(null)

    const iframeRef = useRef(null)
    const fileInputRef = useRef(null)

    // --- Feedback Helpers ---

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    // Handle window resize for mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 900)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Auto-open preview on mobile when done tailoring
    useEffect(() => {
        if (loadingStep === 3 && isMobile && activeMode === 'tailor') {
            setIsMobilePreviewOpen(true)
        }
    }, [loadingStep, isMobile, activeMode])


    // --- Actions ---

    const handleTailor = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(1) // Analyzing

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
            if (!apiKey) throw new Error('API key not configured')

            // Artificial delay for UX pacing (Analyzing -> Tailoring)
            await new Promise(r => setTimeout(r, 800))
            setLoadingStep(2)

            const prompt = createTailoringPrompt(jobDescription, currentCv, userComments)

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
                    })
                }
            )

            if (!response.ok) throw new Error(`API request failed: ${response.status}`)

            const data = await response.json()
            const tailoredHtml = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (!tailoredHtml) throw new Error('No response from AI')

            setLoadingStep(3) // Formatting
            await new Promise(r => setTimeout(r, 600)) // Artificial delay for step 3

            // Clean HTML
            const cleanHtml = tailoredHtml
                .replace(/^```html\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim()

            setCurrentCv(cleanHtml)
            addToast('CV tailored successfully!')

        } catch (error) {
            console.error('Tailoring error:', error)
            addToast(error.message || 'Failed to tailor CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, currentCv, userComments, addToast])

    const handleFeedback = useCallback(async () => {
        if (!jobDescription.trim()) {
            addToast('Please enter a job description', 'error')
            return
        }

        setIsLoading(true)
        setLoadingStep(1) // Reading CV
        setFeedback(null)

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
            if (!apiKey) throw new Error('API key not configured')

            await new Promise(r => setTimeout(r, 600))
            setLoadingStep(2) // Analyzing

            const prompt = createFeedbackPrompt(jobDescription, currentCv)

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.5, maxOutputTokens: 4096 }
                    })
                }
            )

            if (!response.ok) throw new Error(`API request failed: ${response.status}`)

            const data = await response.json()
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (!responseText) throw new Error('No response from AI')

            setLoadingStep(3) // Processing results
            await new Promise(r => setTimeout(r, 400))

            // Parse JSON response
            const cleanJson = responseText
                .replace(/^```json\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim()

            const feedbackData = JSON.parse(cleanJson)
            setFeedback(feedbackData)
            addToast('Analysis complete!')

        } catch (error) {
            console.error('Feedback error:', error)
            addToast(error.message || 'Failed to analyze CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, currentCv, addToast])

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
            // Note: In a real app we'd OCR this
        } else {
            addToast('Please upload HTML or Image', 'error')
        }
    }, [addToast])

    const handleDownload = useCallback(() => {
        const blob = new Blob([currentCv], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'tailored-cv.html'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        addToast('CV downloaded')
    }, [currentCv, addToast])

    const handleReset = useCallback(() => {
        setCurrentCv(baseCvTemplate)
        setTemplateMode('base')
        setCustomFileName('')
        setFeedback(null)
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

    // Mode-specific loading step labels
    const getLoadingSteps = () => {
        if (activeMode === 'tailor') {
            return ['Analyzing Job Description...', 'Tailoring Experience & Skills...', 'Formatting Document...']
        }
        return ['Reading Your CV...', 'Analyzing Against Job...', 'Generating Feedback...']
    }

    const loadingSteps = getLoadingSteps()

    // --- Render ---

    return (
        <div className={`app ${isMobile ? 'app--mobile' : ''} ${isMobilePreviewOpen ? 'app--preview-open' : ''}`}>
            <ToastContainer toasts={toasts} />

            {/* Header with Navigation */}
            <header className="app__header">
                <div className="app__logo">CV Generator</div>
                <nav className="app__nav">
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

            {/* Input Panel */}
            <aside className="panel-input">
                <div className="panel-input__content">

                    {/* Template Selection */}
                    <section className="input-section animate-in">
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

                    {/* Inputs */}
                    <section className="input-section animate-in animate-in--delay-1">
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

                    {/* User Notes - Only in Tailor mode */}
                    {activeMode === 'tailor' && (
                        <section className="input-section animate-in animate-in--delay-2">
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

                    {/* Desktop Actions */}
                    {!isMobile && (
                        <div className="action-bar animate-in animate-in--delay-3">
                            <div className="action-bar__primary">
                                <button
                                    className="btn btn--primary"
                                    onClick={activeMode === 'tailor' ? handleTailor : handleFeedback}
                                    disabled={isLoading || !jobDescription.trim()}
                                    style={{ width: '100%' }}
                                >
                                    {isLoading ? 'Processing...' : (activeMode === 'tailor' ? 'Tailor CV for This Job' : 'Analyze My CV')}
                                </button>
                            </div>

                            <div className="action-bar__secondary">
                                <button className="btn btn--secondary" onClick={handleReset} title="Reset">
                                    <Icons.Refresh /> Reset
                                </button>
                                <button className="btn btn--secondary" onClick={handleDownload} title="Download HTML">
                                    <Icons.Download /> Download
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Preview/Results Panel */}
            <main className="panel-preview">
                {/* Mobile Preview Header */}
                {isMobile && (
                    <div className="mobile-preview-header">
                        <h2 className="mobile-preview-title">{activeMode === 'tailor' ? 'CV Preview' : 'Feedback'}</h2>
                        <button className="btn-icon" onClick={() => setIsMobilePreviewOpen(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {activeMode === 'tailor' ? (
                    // CV Preview for Tailor mode
                    <>
                        <div
                            className="cv-preview"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                        >
                            {/* Loading UI */}
                            {isLoading && (
                                <div className="loading-overlay">
                                    <div className="loading-steps">
                                        {loadingSteps.map((step, i) => (
                                            <div key={i} className={`loading-step ${loadingStep >= i + 1 ? (loadingStep > i + 1 ? 'loading-step--done' : 'loading-step--active') : ''}`}>
                                                <div className="step-icon"></div>
                                                <span className="step-text">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <iframe
                                ref={iframeRef}
                                srcDoc={currentCv}
                                title="CV Preview"
                                style={{ width: '100%', height: '100%', border: 'none', background: 'white' }}
                            />
                        </div>

                        {/* Zoom Controls */}
                        <div className="zoom-controls">
                            <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom Out">
                                <Icons.ZoomOut />
                            </button>
                            <button className="zoom-btn" onClick={() => setZoom(1)} title="Reset Zoom">
                                <span style={{ fontSize: '10px', fontWeight: 600 }}>{Math.round(zoom * 100)}%</span>
                            </button>
                            <button className="zoom-btn" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} title="Zoom In">
                                <Icons.ZoomIn />
                            </button>
                        </div>
                    </>
                ) : (
                    // Feedback Results panel
                    <div className="feedback-panel">
                        {isLoading ? (
                            <div className="loading-overlay loading-overlay--inline">
                                <div className="loading-steps">
                                    {loadingSteps.map((step, i) => (
                                        <div key={i} className={`loading-step ${loadingStep >= i + 1 ? (loadingStep > i + 1 ? 'loading-step--done' : 'loading-step--active') : ''}`}>
                                            <div className="step-icon"></div>
                                            <span className="step-text">{step}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : feedback ? (
                            <FeedbackResults feedback={feedback} />
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state__icon">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="16" y1="13" x2="8" y2="13" />
                                        <line x1="16" y1="17" x2="8" y2="17" />
                                        <polyline points="10 9 9 9 8 9" />
                                    </svg>
                                </div>
                                <h3 className="empty-state__title">Ready to Analyze</h3>
                                <p className="empty-state__text">Add a job description and click "Analyze My CV" to get structured feedback.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Mobile Bottom Dock */}
            {isMobile && (
                <div className="mobile-dock">
                    <div className="mobile-dock__actions">
                        {!isMobilePreviewOpen ? (
                            <>
                                <button
                                    className="btn btn--primary mobile-dock__main-btn"
                                    onClick={activeMode === 'tailor' ? handleTailor : handleFeedback}
                                    disabled={isLoading || !jobDescription.trim()}
                                >
                                    {isLoading ? 'Processing...' : (activeMode === 'tailor' ? 'Tailor CV' : 'Analyze')}
                                </button>
                                <button
                                    className="btn btn--secondary mobile-dock__icon-btn"
                                    onClick={() => setIsMobilePreviewOpen(true)}
                                    title="View Preview"
                                >
                                    <Icons.Maximize />
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="btn btn--secondary mobile-dock__main-btn" onClick={handleDownload}>
                                    <Icons.Download /> Save
                                </button>
                                <button className="btn btn--primary mobile-dock__icon-btn" onClick={() => setIsMobilePreviewOpen(false)}>
                                    OK
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
