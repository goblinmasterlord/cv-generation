import { useState, useRef, useCallback, useEffect } from 'react'
import baseCvTemplate from './templates/baseCv'
import { createTailoringPrompt } from './prompts/tailorCv'

// --- Utility Components ---

const Icons = {
    Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Print: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>,
    Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    ZoomIn: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    ZoomOut: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>,
    Maximize: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
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

function App() {
    const [jobDescription, setJobDescription] = useState('')
    const [userComments, setUserComments] = useState('')
    const [currentCv, setCurrentCv] = useState(baseCvTemplate)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState(0) // 0: Idle, 1: Analyzing, 2: Tailoring, 3: Formatting

    const [toasts, setToasts] = useState([])
    const [templateMode, setTemplateMode] = useState('base')
    const [customFileName, setCustomFileName] = useState('')
    const [zoom, setZoom] = useState(1) // 1 = 100%

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

    const handlePrint = useCallback(() => {
        iframeRef.current?.contentWindow?.print()
    }, [])

    const handleReset = useCallback(() => {
        setCurrentCv(baseCvTemplate)
        setTemplateMode('base')
        setCustomFileName('')
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

    // --- Render ---

    return (
        <div className="app">
            <ToastContainer toasts={toasts} />

            {/* Header */}
            <header className="app__header">
                <div className="app__logo">CV Generator</div>
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
                            placeholder="Paste the full job posting (requirements, responsibilities)..." // Simpler placeholder
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                        <div className="char-count">{jobDescription.length} chars</div>
                    </section>

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

                    {/* Actions */}
                    <div className="action-bar animate-in animate-in--delay-3">
                        <div className="action-bar__primary">
                            <button
                                className="btn btn--primary"
                                onClick={handleTailor}
                                disabled={isLoading || !jobDescription.trim()}
                                style={{ width: '100%' }}
                            >
                                {isLoading ? 'Processing...' : 'Tailor CV for This Job'}
                            </button>
                        </div>

                        <div className="action-bar__secondary">
                            <button className="btn btn--secondary" onClick={handleReset} title="Reset">
                                <Icons.Refresh /> Reset
                            </button>
                            <button className="btn btn--secondary" onClick={handleDownload} title="Download HTML">
                                <Icons.Download /> Download
                            </button>
                            <button className="btn btn--secondary" onClick={handlePrint} title="Print PDF">
                                <Icons.Print /> Print
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Preview Panel */}
            <main className="panel-preview">
                <div
                    className="cv-preview"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} // Handle zoom transform
                >
                    {/* Advanced Loading UI */}
                    {isLoading && (
                        <div className="loading-overlay">
                            <div className="loading-steps">
                                <div className={`loading-step ${loadingStep >= 1 ? (loadingStep > 1 ? 'loading-step--done' : 'loading-step--active') : ''}`}>
                                    <div className="step-icon"></div>
                                    <span className="step-text">Analyzing Job Description...</span>
                                </div>
                                <div className={`loading-step ${loadingStep >= 2 ? (loadingStep > 2 ? 'loading-step--done' : 'loading-step--active') : ''}`}>
                                    <div className="step-icon"></div>
                                    <span className="step-text">Tailoring Experience & Skills...</span>
                                </div>
                                <div className={`loading-step ${loadingStep >= 3 ? 'loading-step--active' : ''}`}>
                                    <div className="step-icon"></div>
                                    <span className="step-text">Formatting Document...</span>
                                </div>
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
            </main>
        </div>
    )
}

export default App
