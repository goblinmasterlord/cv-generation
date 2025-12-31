import { useState, useRef, useCallback, useEffect } from 'react'
import baseCvTemplate from './templates/baseCv'
import { createTailoringPrompt } from './prompts/tailorCv'
import { createFeedbackPrompt } from './prompts/feedbackCv'
import { createApplyPrompt } from './prompts/applyCv'

// --- Utility Components ---

const Icons = {
    Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    ZoomIn: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    ZoomOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    Maximize: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>,
    Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    Arrow: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>,
    ArrowLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>,
    Tag: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    Star: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    Eye: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    EyeOff: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    User: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    Briefcase: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    FileText: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>,
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

// Perspective Score Cards
const PerspectiveScores = ({ perspectives }) => {
    if (!perspectives) return null

    const getScoreClass = (score) => {
        if (score >= 80) return 'perspective-score--high'
        if (score >= 60) return 'perspective-score--medium'
        return 'perspective-score--low'
    }

    const perspectiveData = [
        { key: 'content', label: 'Technical Fit', icon: <Icons.FileText />, data: perspectives.content },
        { key: 'hr', label: 'HR / ATS', icon: <Icons.User />, data: perspectives.hr },
        { key: 'hiring', label: 'Hiring Manager', icon: <Icons.Briefcase />, data: perspectives.hiring },
    ]

    return (
        <div className="perspective-scores">
            {perspectiveData.map(p => p.data && (
                <div key={p.key} className="perspective-card">
                    <div className="perspective-card__header">
                        <span className="perspective-card__icon">{p.icon}</span>
                        <span className="perspective-card__label">{p.label}</span>
                        <span className={`perspective-card__score ${getScoreClass(p.data.score)}`}>
                            {p.data.score}
                        </span>
                    </div>
                    <p className="perspective-card__summary">{p.data.summary}</p>
                </div>
            ))}
        </div>
    )
}

// Feedback Item Component - Selectable
const FeedbackItem = ({ item, onToggle }) => {
    const isActionable = item.type !== 'strength'
    const isApproved = item.approved

    const getIcon = () => {
        switch (item.type) {
            case 'strength': return <Icons.Star />
            case 'improvement': return <Icons.Arrow />
            case 'keyword': return <Icons.Tag />
            default: return null
        }
    }

    const getPriorityClass = () => {
        if (!item.priority) return ''
        return `feedback-item--priority-${item.priority}`
    }

    return (
        <div
            className={`feedback-item feedback-item--${item.type} ${isApproved ? 'feedback-item--approved' : ''} ${isActionable ? 'feedback-item--actionable' : ''} ${getPriorityClass()}`}
            onClick={() => isActionable && onToggle(item.id)}
        >
            <div className="feedback-item__icon">{getIcon()}</div>
            <div className="feedback-item__content">
                <div className="feedback-item__meta">
                    {item.perspective && (
                        <span className="feedback-item__perspective">{item.perspective}</span>
                    )}
                    {item.priority && (
                        <span className={`feedback-item__priority feedback-item__priority--${item.priority}`}>
                            {item.priority}
                        </span>
                    )}
                </div>
                <p className="feedback-item__text">{item.text}</p>
                {item.action && (
                    <p className="feedback-item__action">{item.action}</p>
                )}
                {item.section && (
                    <span className="feedback-item__section">{item.section}</span>
                )}
            </div>
            {isActionable && (
                <div className="feedback-item__toggle">
                    {isApproved && <Icons.Check />}
                </div>
            )}
        </div>
    )
}

// Stepped Loading Overlay
const SteppedLoadingOverlay = ({ steps, currentStep, title }) => (
    <div className="flow-loading">
        <div className="flow-loading__content">
            {title && <h3 className="flow-loading__title">{title}</h3>}
            <div className="flow-loading__steps">
                {steps.map((step, i) => (
                    <div key={i} className={`flow-loading__step ${i < currentStep ? 'flow-loading__step--done' : ''} ${i === currentStep ? 'flow-loading__step--active' : ''}`}>
                        <div className="flow-loading__step-icon">
                            {i < currentStep ? <Icons.Check /> : i === currentStep ? <div className="spinner-small" /> : null}
                        </div>
                        <span className="flow-loading__step-text">{step}</span>
                    </div>
                ))}
            </div>
            <div className="flow-loading__progress">
                <div
                    className="flow-loading__progress-bar"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>
        </div>
    </div>
)

// Feedback Results Component - Interactive
const FeedbackResults = ({ feedback, onToggleItem }) => {
    if (!feedback) return null

    const getScoreClass = (score) => {
        if (score >= 80) return 'feedback-score--high'
        if (score >= 60) return 'feedback-score--medium'
        return 'feedback-score--low'
    }

    // Group items by type
    const strengths = feedback.items?.filter(i => i.type === 'strength') || []
    const improvements = feedback.items?.filter(i => i.type === 'improvement') || []
    const keywords = feedback.items?.filter(i => i.type === 'keyword') || []

    return (
        <div className="feedback-results">
            <div className="feedback-header">
                <div className={`feedback-score ${getScoreClass(feedback.overallScore)}`}>
                    {feedback.overallScore}
                </div>
                <p className="feedback-summary">{feedback.summary}</p>
            </div>

            {/* Perspective Scores */}
            <PerspectiveScores perspectives={feedback.perspectives} />

            <div className="feedback-sections">
                {strengths.length > 0 && (
                    <div className="feedback-section">
                        <h3 className="feedback-section__title">
                            <Icons.Star /> Strengths
                            <span className="feedback-section__count">{strengths.length}</span>
                        </h3>
                        <div className="feedback-items">
                            {strengths.map(item => (
                                <FeedbackItem key={item.id} item={item} onToggle={onToggleItem} />
                            ))}
                        </div>
                    </div>
                )}

                {improvements.length > 0 && (
                    <div className="feedback-section">
                        <h3 className="feedback-section__title">
                            <Icons.Arrow /> Improvements
                            <span className="feedback-section__count">{improvements.length}</span>
                            <span className="feedback-section__hint">Click to approve</span>
                        </h3>
                        <div className="feedback-items">
                            {improvements.map(item => (
                                <FeedbackItem key={item.id} item={item} onToggle={onToggleItem} />
                            ))}
                        </div>
                    </div>
                )}

                {keywords.length > 0 && (
                    <div className="feedback-section">
                        <h3 className="feedback-section__title">
                            <Icons.Tag /> Missing Keywords
                            <span className="feedback-section__count">{keywords.length}</span>
                            <span className="feedback-section__hint">Click to add</span>
                        </h3>
                        <div className="feedback-items">
                            {keywords.map(item => (
                                <FeedbackItem key={item.id} item={item} onToggle={onToggleItem} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// CV Preview Modal/Drawer
const CVPreviewModal = ({ isOpen, onClose, cvHtml, showHighlights, onToggleHighlights, hasHighlights }) => {
    if (!isOpen) return null

    return (
        <div className="cv-modal-overlay" onClick={onClose}>
            <div className="cv-modal" onClick={e => e.stopPropagation()}>
                <div className="cv-modal__header">
                    <h2 className="cv-modal__title">CV Preview</h2>
                    <div className="cv-modal__actions">
                        {hasHighlights && (
                            <button
                                className={`btn btn--secondary ${showHighlights ? 'btn--active' : ''}`}
                                onClick={onToggleHighlights}
                            >
                                {showHighlights ? <Icons.Eye /> : <Icons.EyeOff />}
                                <span>{showHighlights ? 'Showing Changes' : 'Changes Hidden'}</span>
                            </button>
                        )}
                        <button className="cv-modal__close" onClick={onClose}>
                            <Icons.Close />
                        </button>
                    </div>
                </div>
                <div className="cv-modal__content">
                    <iframe
                        srcDoc={cvHtml}
                        title="CV Preview"
                        className="cv-modal__iframe"
                    />
                </div>
            </div>
        </div>
    )
}

// CV Preview Component (Full view for result steps)
const CVPreviewFull = ({ cvHtml, showHighlights, onToggleHighlights, hasHighlights, zoom, setZoom }) => (
    <div className="cv-preview-full">
        <div className="cv-preview-full__controls">
            {hasHighlights && (
                <button
                    className={`preview-control-btn ${showHighlights ? 'preview-control-btn--active' : ''}`}
                    onClick={onToggleHighlights}
                >
                    {showHighlights ? <Icons.Eye /> : <Icons.EyeOff />}
                    <span>{showHighlights ? 'Changes Visible' : 'Changes Hidden'}</span>
                </button>
            )}
            <div className="zoom-controls-inline">
                <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom Out">
                    <Icons.ZoomOut />
                </button>
                <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                <button className="zoom-btn" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} title="Zoom In">
                    <Icons.ZoomIn />
                </button>
            </div>
        </div>
        <div className="cv-preview-full__container">
            <div
                className="cv-preview-full__document"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
                <iframe
                    srcDoc={cvHtml}
                    title="CV Preview"
                    className="cv-preview-full__iframe"
                />
            </div>
        </div>
    </div>
)

function App() {
    // Mode and Flow State
    const [activeMode, setActiveMode] = useState('tailor') // 'tailor' | 'feedback'
    const [flowStep, setFlowStep] = useState(0) // 0 = input, 1 = result (tailor) or feedback (feedback), 2 = result (feedback only)

    // Input State
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')
    const [currentCv, setCurrentCv] = useState(baseCvTemplate)
    const [templateMode, setTemplateMode] = useState('base')
    const [customFileName, setCustomFileName] = useState('')

    // Loading State
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0)
    const [isApplying, setIsApplying] = useState(false)
    const [applyStep, setApplyStep] = useState(0)

    // UI State
    const [toasts, setToasts] = useState([])
    const [zoom, setZoom] = useState(1)
    const [feedback, setFeedback] = useState(null)
    const [showHighlights, setShowHighlights] = useState(true)
    const [showCvModal, setShowCvModal] = useState(false)

    const fileInputRef = useRef(null)

    // --- Helpers ---

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    // Reset flow step when mode changes
    useEffect(() => {
        setFlowStep(0)
        setFeedback(null)
    }, [activeMode])

    // Count approved items
    const approvedCount = feedback?.items?.filter(i => i.approved && i.action).length || 0

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
            const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
            if (!apiKey) throw new Error('API key not configured')

            setLoadingStep(1)
            await new Promise(r => setTimeout(r, 600))

            const prompt = createTailoringPrompt(jobDescription, currentCv, userComments)

            setLoadingStep(2)

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

            setLoadingStep(3)
            await new Promise(r => setTimeout(r, 400))

            const cleanHtml = tailoredHtml
                .replace(/^```html\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim()

            setCurrentCv(cleanHtml)
            setFlowStep(1) // Move to result step
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
        setLoadingStep(0)
        setFeedback(null)

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
            if (!apiKey) throw new Error('API key not configured')

            setLoadingStep(1)
            await new Promise(r => setTimeout(r, 500))

            const prompt = createFeedbackPrompt(jobDescription, currentCv)

            setLoadingStep(2)

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.5, maxOutputTokens: 8192 }
                    })
                }
            )

            if (!response.ok) throw new Error(`API request failed: ${response.status}`)

            const data = await response.json()
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (!responseText) throw new Error('No response from AI')

            setLoadingStep(3)
            await new Promise(r => setTimeout(r, 300))

            const cleanJson = responseText
                .replace(/^```json\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim()

            const feedbackData = JSON.parse(cleanJson)

            feedbackData.items = feedbackData.items?.map(item => ({
                ...item,
                approved: false
            })) || []

            setFeedback(feedbackData)
            setFlowStep(1) // Move to feedback step
            addToast('Deep analysis complete!')

        } catch (error) {
            console.error('Feedback error:', error)
            addToast(error.message || 'Failed to analyze CV', 'error')
        } finally {
            setIsLoading(false)
            setLoadingStep(0)
        }
    }, [jobDescription, currentCv, addToast])

    const handleToggleItem = useCallback((itemId) => {
        setFeedback(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === itemId ? { ...item, approved: !item.approved } : item
            )
        }))
    }, [])

    const handleApplyChanges = useCallback(async () => {
        const approvedItems = feedback?.items?.filter(i => i.approved && i.action) || []

        if (approvedItems.length === 0) {
            addToast('No changes selected', 'error')
            return
        }

        const steps = getApplySteps()
        setIsApplying(true)
        setApplyStep(0)

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY
            if (!apiKey) throw new Error('API key not configured')

            for (let i = 0; i < steps.length - 1; i++) {
                setApplyStep(i)
                await new Promise(r => setTimeout(r, 400 + Math.random() * 300))
            }

            const prompt = createApplyPrompt(approvedItems, currentCv, true)

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
                    })
                }
            )

            if (!response.ok) throw new Error(`API request failed: ${response.status}`)

            const data = await response.json()
            const updatedHtml = data.candidates?.[0]?.content?.parts?.[0]?.text

            if (!updatedHtml) throw new Error('No response from AI')

            setApplyStep(steps.length - 1)
            await new Promise(r => setTimeout(r, 400))

            const cleanHtml = updatedHtml
                .replace(/^```html\n?/i, '')
                .replace(/\n?```$/i, '')
                .trim()

            setCurrentCv(cleanHtml)
            setShowHighlights(true)
            setFlowStep(2) // Move to result step in feedback flow
            addToast(`Applied ${approvedItems.length} improvement${approvedItems.length !== 1 ? 's' : ''} to your CV!`)

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
        return ['Reading Your CV...', 'Deep Analysis in Progress...', 'Generating Recommendations...']
    }

    const loadingSteps = getLoadingSteps()
    const applySteps = getApplySteps()

    // --- Render ---

    // Step indicator
    const getStepIndicator = () => {
        if (activeMode === 'tailor') {
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

    // Render step content
    const renderStepContent = () => {
        // Loading overlay
        if (isLoading) {
            return (
                <SteppedLoadingOverlay
                    steps={loadingSteps}
                    currentStep={loadingStep}
                    title={activeMode === 'tailor' ? 'Tailoring Your CV' : 'Analyzing Your CV'}
                />
            )
        }

        // Apply loading overlay
        if (isApplying) {
            return (
                <SteppedLoadingOverlay
                    steps={applySteps}
                    currentStep={applyStep}
                    title="Applying Changes"
                />
            )
        }

        // Step 0: Input
        if (flowStep === 0) {
            return (
                <div className="flow-step flow-step--input">
                    <div className="flow-step__content">
                        {/* Template Selection */}
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

                        {/* Job Description */}
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

                        {/* User Notes - Only in Tailor mode */}
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

    // Render bottom bar actions
    const renderBottomBarActions = () => {
        // Step 0: Input step
        if (flowStep === 0) {
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

        // Tailor Step 1: Result
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

        // Feedback Step 1: Feedback Dashboard
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

        // Feedback Step 2: Result
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

            {/* Header */}
            <header className="app-flow__header">
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

            {/* Step Indicator */}
            <div className="app-flow__steps">
                {getStepIndicator()}
            </div>

            {/* Main Content */}
            <main className="app-flow__main">
                {renderStepContent()}
            </main>

            {/* Sticky Bottom Bar */}
            <div className="bottom-bar">
                <div className="bottom-bar__content">
                    {renderBottomBarActions()}
                </div>
            </div>

            {/* CV Preview Modal */}
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
