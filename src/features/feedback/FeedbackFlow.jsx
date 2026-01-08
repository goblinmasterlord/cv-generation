import { useRef, useState } from 'react'
import { Icons, SteppedLoadingOverlay } from '../../components/ui'
import { CVPreviewFull, CVPreviewModal } from '../../components/cv'
import { FeedbackResults } from '../../components/feedback'
import { CvInputSection } from '../../components/forms'
import { StepIndicator, BottomBar } from '../../components/layout'
import { useFeedbackFlow } from './useFeedbackFlow'

export function FeedbackFlow({ cvState, addToast }) {
    const flow = useFeedbackFlow(cvState, addToast)
    const fileInputRef = useRef(null)
    const [showCvModal, setShowCvModal] = useState(false)

    const handleTemplateSwitch = (mode) => {
        if (mode === 'base') {
            cvState.resetCv()
        } else {
            cvState.setTemplateMode('custom')
            fileInputRef.current?.click()
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (file.type === 'text/html' || file.name.endsWith('.html')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                cvState.loadCustomCv(e.target.result, file.name)
                flow.setSourceFile(null) // Clear PDF if any
                addToast('Custom template loaded')
            }
            reader.readAsText(file)
        } else if (file.type === 'application/pdf') {
            const reader = new FileReader()
            reader.onload = (e) => {
                // PDF handling - don't load into cvState (which expects HTML)
                // Instead store in local flow state
                flow.setSourceFile({
                    file,
                    base64: e.target.result
                })
                cvState.setCustomFileName(file.name) // Just for display
                addToast('PDF uploaded for analysis')
            }
            reader.readAsDataURL(file)
        } else if (file.type.startsWith('image/')) {
            cvState.setTemplateMode('custom')
            // For now, image handling is limited in Feedback flow as per original logic, 
            // but we could add it to sourceFile if improvements needed.
            // Original logic just said "Using base template".
            // Let's defer strict image support unless requested, but PDF is priority.
            addToast('Image uploaded (Using base template)', 'success')
        } else {
            addToast('Please upload HTML, PDF or Image', 'error')
        }
    }

    const handleDownload = () => {
        const exportHtml = cvState.getExportCv()
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
    }

    // Loading states
    if (flow.isLoading) {
        return (
            <SteppedLoadingOverlay
                steps={flow.loadingSteps}
                currentStep={flow.loadingStep}
                title="Analyzing Your CV"
            />
        )
    }

    if (flow.isApplying) {
        return (
            <SteppedLoadingOverlay
                steps={flow.getApplySteps()}
                currentStep={flow.applyStep}
                title="Applying Changes"
            />
        )
    }

    // Step 0: Input
    if (flow.step === 0) {
        return (
            <>
                <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Feedback', 'Result']} currentStep={0} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step flow-step--input">
                        <div className="flow-step__content">
                            <CvInputSection
                                sourceType={flow.sourceType}
                                onSourceTypeChange={(type) => {
                                    // Clear previous data when switching types
                                    if (type !== flow.sourceType) {
                                        flow.setSourceImage(null)
                                        flow.setSourceText('')
                                        cvState.setCustomFileName('')
                                    }
                                    if (type === 'base') {
                                        cvState.resetCv()
                                        flow.setSourceType('html')
                                    } else {
                                        flow.setSourceType(type)
                                    }
                                }}
                                data={{
                                    text: flow.sourceText,
                                    image: flow.sourceImage,
                                    fileName: flow.sourceType === 'html' ? cvState.customFileName : flow.sourceImage?.fileName
                                }}
                                handlers={{
                                    onTextChange: flow.setSourceText,
                                    onFileChange: flow.handleFileUpload,
                                    onRemove: () => {
                                        flow.setSourceImage(null)
                                        flow.setSourceText('')
                                        // Reset to html mode if current cv is base? Logic depends on intent
                                    }
                                }}
                                fileInputRef={fileInputRef}
                            />

                            <div className="divider">Job Details</div>

                            <section className="input-section">
                                <div className="input-section__header">
                                    <h2 className="input-section__title">Job Description</h2>
                                </div>
                                <textarea
                                    className="textarea"
                                    placeholder="Paste the full job posting (requirements, responsibilities)..."
                                    value={flow.jobDescription}
                                    onChange={(e) => flow.setJobDescription(e.target.value)}
                                />
                                <div className="char-count">{flow.jobDescription.length} chars</div>
                            </section>
                        </div>
                    </div>
                </main>
                <BottomBar>
                    <button
                        className="btn btn--secondary"
                        onClick={() => setShowCvModal(true)}
                    >
                        <Icons.Eye /> Preview CV
                    </button>
                    <button
                        className="btn btn--primary"
                        onClick={flow.handleFeedback}
                        disabled={!flow.jobDescription.trim()}
                    >
                        Analyze CV
                    </button>
                </BottomBar>
                <CVPreviewModal
                    isOpen={showCvModal}
                    onClose={() => setShowCvModal(false)}
                    cvHtml={cvState.getDisplayCv()}
                    showHighlights={cvState.showHighlights}
                    onToggleHighlights={() => cvState.setShowHighlights(!cvState.showHighlights)}
                    hasHighlights={cvState.hasHighlights}
                />
            </>
        )
    }

    // Step 1: Feedback Dashboard
    if (flow.step === 1) {
        return (
            <>
                <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Feedback', 'Result']} currentStep={1} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step flow-step--feedback">
                        <div className="flow-step__content flow-step__content--wide">
                            <FeedbackResults
                                feedback={flow.feedback}
                                onToggleItem={flow.handleToggleItem}
                            />
                        </div>
                    </div>
                </main>
                <BottomBar>
                    <button className="btn btn--secondary" onClick={flow.handleBack}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__info">
                        <span className="bottom-bar__count">{flow.approvedCount}</span>
                        <span className="bottom-bar__label">change{flow.approvedCount !== 1 ? 's' : ''} selected</span>
                    </div>
                    <button
                        className="btn btn--primary"
                        onClick={flow.handleApplyChanges}
                        disabled={flow.approvedCount === 0}
                    >
                        Apply Changes
                    </button>
                </BottomBar>
            </>
        )
    }

    // Step 2: Result
    return (
        <>
            <div className="app-flow__steps">
                <StepIndicator steps={['Input', 'Feedback', 'Result']} currentStep={2} />
            </div>
            <main className="app-flow__main">
                <div className="flow-step flow-step--result">
                    <CVPreviewFull
                        cvHtml={cvState.getDisplayCv()}
                        showHighlights={cvState.showHighlights}
                        onToggleHighlights={() => cvState.setShowHighlights(!cvState.showHighlights)}
                        hasHighlights={cvState.hasHighlights}
                        zoom={cvState.zoom}
                        setZoom={cvState.setZoom}
                    />
                </div>
            </main>
            <BottomBar>
                <button className="btn btn--secondary" onClick={flow.handleBack}>
                    <Icons.ArrowLeft /> Back to Feedback
                </button>
                <div className="bottom-bar__spacer" />
                <button className="btn btn--secondary" onClick={cvState.resetCv}>
                    <Icons.Refresh /> Start Over
                </button>
                <button className="btn btn--primary" onClick={handleDownload}>
                    <Icons.Download /> Download
                </button>
            </BottomBar>
        </>
    )
}
