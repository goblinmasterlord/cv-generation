import { useRef, useState } from 'react'
import { Icons, SteppedLoadingOverlay } from '../../components/ui'
import { CVPreviewFull, CVPreviewModal } from '../../components/cv'
import { CvInputSection } from '../../components/forms'
import { StepIndicator, BottomBar } from '../../components/layout'
import { useTailorFlow } from './useTailorFlow'

export function TailorFlow({ cvState, addToast }) {
    const flow = useTailorFlow(cvState, addToast)
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
                addToast('Custom template loaded')
            }
            reader.readAsText(file)
        } else if (file.type.startsWith('image/')) {
            cvState.setTemplateMode('custom')
            addToast('Image uploaded (Using base template)', 'success')
        } else {
            addToast('Please upload HTML or Image', 'error')
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

    // Loading state
    if (flow.isLoading) {
        return (
            <SteppedLoadingOverlay
                steps={flow.loadingSteps}
                currentStep={flow.loadingStep}
                title="Tailoring Your CV"
            />
        )
    }

    // Step 0: Input
    if (flow.step === 0) {
        return (
            <>
                <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Result']} currentStep={0} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step flow-step--input">
                        <div className="flow-step__content">
                            <CvInputSection
                                sourceType={flow.sourceType}
                                onSourceTypeChange={(type) => {
                                    if (type === 'lilla') {
                                        cvState.resetCv() // Sets Base CV
                                        flow.setSourceType('lilla')
                                        flow.setSourceImage(null)
                                        flow.setSourceText('')
                                    } else {
                                        flow.setSourceType(type)
                                    }
                                }}
                                data={{
                                    text: flow.sourceText,
                                    image: flow.sourceImage,
                                    fileName: cvState.customFileName || flow.sourceImage?.fileName
                                }}
                                handlers={{
                                    onTextChange: flow.setSourceText,
                                    onFileChange: flow.handleFileUpload,
                                    onRemove: () => {
                                        flow.setSourceImage(null)
                                        flow.setSourceText('')
                                        // If removing, maybe go back to lilla default?
                                        flow.setSourceType('lilla')
                                        cvState.resetCv()
                                    }
                                }}
                                fileInputRef={fileInputRef}
                                presets={[{ id: 'lilla', label: "Lilla's CV template" }]}
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

                            <section className="input-section">
                                <div className="input-section__header">
                                    <h2 className="input-section__title">Your Notes</h2>
                                </div>
                                <textarea
                                    className="textarea textarea--small"
                                    placeholder="E.g., 'Emphasize leadership'..."
                                    value={flow.userComments}
                                    onChange={(e) => flow.setUserComments(e.target.value)}
                                />
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
                        onClick={flow.handleTailor}
                        disabled={!flow.jobDescription.trim()}
                    >
                        Tailor CV
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

    // Step 1: Result
    return (
        <>
            <div className="app-flow__steps">
                <StepIndicator steps={['Input', 'Result']} currentStep={1} />
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
                    <Icons.ArrowLeft /> Back
                </button>
                <div className="bottom-bar__spacer" />
                <button className="btn btn--secondary" onClick={cvState.resetCv}>
                    <Icons.Refresh /> Reset
                </button>
                <button className="btn btn--primary" onClick={handleDownload}>
                    <Icons.Download /> Download
                </button>
            </BottomBar>
        </>
    )
}
