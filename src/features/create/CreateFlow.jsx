import { Icons, SteppedLoadingOverlay } from '../../components/ui'
import { CVPreviewFull } from '../../components/cv'
import { ContactForm } from '../../components/forms'
import { StepIndicator, BottomBar } from '../../components/layout'
import { useCreateFlow } from './useCreateFlow'

export function CreateFlow({ cvState, addToast }) {
    const flow = useCreateFlow(cvState, addToast)

    const handleDownload = () => {
        const exportHtml = cvState.getExportCv()
        const blob = new Blob([exportHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'new-cv.html'
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
                title="Creating Your CV"
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
                            {/* Contact Info Section */}
                            <ContactForm
                                value={flow.contactInfo}
                                onChange={flow.setContactInfo}
                            />

                            {/* Experience Section - Collapsible */}
                            <div className={`create-section ${!flow.isContactFilled ? 'create-section--disabled' : ''}`}>
                                <button
                                    className="create-section__header"
                                    onClick={() => flow.isContactFilled && flow.setExperienceSectionOpen(!flow.experienceSectionOpen)}
                                >
                                    <h3 className="create-section__title">
                                        <Icons.Briefcase /> Your Experience
                                    </h3>
                                    {!flow.isContactFilled ? (
                                        <span className="create-section__lock">Enter name to unlock</span>
                                    ) : (
                                        <svg
                                            className={`create-section__chevron ${flow.experienceSectionOpen || flow.isContactFilled ? 'create-section__chevron--open' : ''}`}
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    )}
                                </button>
                                {(flow.experienceSectionOpen || flow.isContactFilled) && flow.isContactFilled && (
                                    <div className="create-section__content">
                                        <div className="source-type-selector">
                                            <button
                                                className={`source-type-option ${flow.sourceType === 'text' ? 'source-type-option--active' : ''}`}
                                                onClick={() => flow.setSourceType('text')}
                                            >
                                                <Icons.Text />
                                                <span>Paste Text</span>
                                            </button>
                                            <button
                                                className={`source-type-option ${flow.sourceType === 'image' ? 'source-type-option--active' : ''}`}
                                                onClick={() => flow.setSourceType('image')}
                                            >
                                                <Icons.Image />
                                                <span>Screenshot</span>
                                            </button>
                                            <button
                                                className={`source-type-option ${flow.sourceType === 'pdf' ? 'source-type-option--active' : ''}`}
                                                onClick={() => flow.setSourceType('pdf')}
                                            >
                                                <Icons.FileText />
                                                <span>PDF File</span>
                                            </button>
                                            <button
                                                className={`source-type-option ${flow.sourceType === 'html' ? 'source-type-option--active' : ''}`}
                                                onClick={() => flow.setSourceType('html')}
                                            >
                                                <Icons.Upload />
                                                <span>HTML File</span>
                                            </button>
                                        </div>

                                        {flow.sourceType === 'text' && (
                                            <textarea
                                                className="textarea textarea--large"
                                                placeholder="Paste your experience, LinkedIn summary, resume bullets, or describe your background..."
                                                value={flow.sourceText}
                                                onChange={(e) => flow.setSourceText(e.target.value)}
                                            />
                                        )}

                                        {flow.sourceType === 'image' && (
                                            <div
                                                className={`file-upload file-upload--large ${flow.sourceImage ? 'file-upload--active' : ''}`}
                                                onClick={() => !flow.sourceImage && flow.fileInputRef.current?.click()}
                                            >
                                                {flow.sourceImage ? (
                                                    <div className="file-upload__image-preview">
                                                        <img src={flow.sourceImage.preview} alt="CV Preview" />
                                                        <div className="file-upload__image-overlay">
                                                            <span className="file-upload__filename">{flow.sourceFileName}</span>
                                                            <button
                                                                className="file-upload__remove-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    flow.setSourceImage(null);
                                                                    flow.setSourceFileName('');
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
                                                        <p className="file-upload__hint">PNG, JPG</p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {flow.sourceType === 'pdf' && (
                                            <div
                                                className={`file-upload file-upload--large ${flow.sourceImage ? 'file-upload--active' : ''}`}
                                                onClick={() => !flow.sourceImage && flow.fileInputRef.current?.click()}
                                            >
                                                {flow.sourceImage ? (
                                                    <div className="file-upload__preview">
                                                        <span className="file-upload__filename"><Icons.FileText /> {flow.sourceFileName}</span>
                                                        <span
                                                            className="file-upload__remove"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                flow.setSourceImage(null);
                                                                flow.setSourceFileName('');
                                                            }}
                                                        >
                                                            Remove
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Icons.FileText />
                                                        <p className="file-upload__text">Upload PDF CV</p>
                                                        <p className="file-upload__hint">Native PDF analysis supported</p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {flow.sourceType === 'html' && (
                                            <div
                                                className={`file-upload ${flow.sourceFileName && flow.sourceType === 'html' ? 'file-upload--active' : ''}`}
                                                onClick={() => !(flow.sourceFileName && flow.sourceType === 'html') && flow.fileInputRef.current?.click()}
                                            >
                                                {flow.sourceFileName && flow.sourceType === 'html' ? (
                                                    <div className="file-upload__preview">
                                                        <span className="file-upload__filename">{flow.sourceFileName}</span>
                                                        <span
                                                            className="file-upload__remove"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                flow.setSourceText('');
                                                                flow.setSourceFileName('');
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
                                            key={flow.sourceType}
                                            ref={flow.fileInputRef}
                                            type="file"
                                            accept={flow.sourceType === 'image' ? 'image/*' : flow.sourceType === 'pdf' ? 'application/pdf' : '.html'}
                                            onChange={flow.handleFileUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Job Description Section */}
                            <div className={`create-section ${!flow.isContactFilled ? 'create-section--disabled' : ''}`}>
                                <button
                                    className="create-section__header"
                                    onClick={() => flow.isContactFilled && flow.setJobSectionOpen(!flow.jobSectionOpen)}
                                >
                                    <h3 className="create-section__title">
                                        <Icons.FileText /> Target Job
                                    </h3>
                                    {!flow.isContactFilled ? (
                                        <span className="create-section__lock">Enter name to unlock</span>
                                    ) : (
                                        <svg
                                            className={`create-section__chevron ${flow.jobSectionOpen || flow.isContactFilled ? 'create-section__chevron--open' : ''}`}
                                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    )}
                                </button>
                                {(flow.jobSectionOpen || flow.isContactFilled) && flow.isContactFilled && (
                                    <div className="create-section__content">
                                        <textarea
                                            className="textarea"
                                            placeholder="Paste the job posting you're applying for..."
                                            value={flow.jobDescription}
                                            onChange={(e) => flow.setJobDescription(e.target.value)}
                                        />
                                        <div className="char-count">{flow.jobDescription.length} chars</div>

                                        <div style={{ marginTop: 'var(--space-md)' }}>
                                            <textarea
                                                className="textarea textarea--small"
                                                placeholder="Additional notes (optional): specific focus or preferences..."
                                                value={flow.userComments}
                                                onChange={(e) => flow.setUserComments(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="divider">Optional Sections</div>

                            {/* Education */}
                            <div className={`create-optional-section ${flow.includeEducation ? 'create-optional-section--active' : ''}`}>
                                <label className="create-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={flow.includeEducation}
                                        onChange={(e) => flow.setIncludeEducation(e.target.checked)}
                                    />
                                    <span className="create-checkbox__label">Include Education</span>
                                    <span className="create-checkbox__hint">Degrees, schools, years</span>
                                </label>
                                {flow.includeEducation && (
                                    <textarea
                                        className="textarea textarea--small"
                                        placeholder="e.g., BSc Computer Science, University of London, 2020"
                                        value={flow.education}
                                        onChange={(e) => flow.setEducation(e.target.value)}
                                    />
                                )}
                            </div>

                            {/* Certifications */}
                            <div className={`create-optional-section ${flow.includeCertifications ? 'create-optional-section--active' : ''}`}>
                                <label className="create-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={flow.includeCertifications}
                                        onChange={(e) => flow.setIncludeCertifications(e.target.checked)}
                                    />
                                    <span className="create-checkbox__label">Include Certifications</span>
                                    <span className="create-checkbox__hint">Professional certs, licenses</span>
                                </label>
                                {flow.includeCertifications && (
                                    <textarea
                                        className="textarea textarea--small"
                                        placeholder="e.g., AWS Solutions Architect, 2023"
                                        value={flow.certifications}
                                        onChange={(e) => flow.setCertifications(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                <BottomBar>
                    <button
                        className="btn btn--primary"
                        onClick={flow.handleCreate}
                        disabled={!flow.jobDescription.trim() || !flow.hasSource}
                    >
                        <Icons.Plus /> Create CV
                    </button>
                </BottomBar>
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
                <button className="btn btn--secondary" onClick={flow.reset}>
                    <Icons.Refresh /> Start Over
                </button>
                <button className="btn btn--primary" onClick={handleDownload}>
                    <Icons.Download /> Download
                </button>
            </BottomBar>
        </>
    )
}
