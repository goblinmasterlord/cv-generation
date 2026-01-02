import { useRef, useState } from 'react'
import { Icons, SteppedLoadingOverlay, CollapsibleSection } from '../../components/ui'
import { StepIndicator, BottomBar } from '../../components/layout'
import { useInterviewFlow } from './useInterviewFlow'

export function InterviewFlow({ addToast }) {
    const flow = useInterviewFlow(addToast)
    const fileInputRef = useRef(null)

    // Collapsible state for questions
    const [expandedQuestions, setExpandedQuestions] = useState({})

    const toggleQuestion = (id) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleSourceTypeChange = (type) => {
        flow.setSourceType(type)
        if (type === 'text') {
            flow.setSourceImage(null)
            flow.setSourceFileName('')
        }
    }

    // Loading states
    if (flow.isLoading) {
        const steps = flow.step === 0 ? flow.strategyLoadingSteps : flow.technicalLoadingSteps
        const title = flow.step === 0 ? 'Preparing Interview Strategy' : 'Generating Technical Questions'
        return (
            <SteppedLoadingOverlay
                steps={steps}
                currentStep={flow.loadingStep}
                title={title}
            />
        )
    }

    // Step 0: Input
    if (flow.step === 0) {
        return (
            <>
                <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Strategy', 'Technical']} currentStep={0} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step flow-step--input">
                        <div className="flow-step__content">
                            {/* Source Type Selector */}
                            <div className="source-type-selector">
                                <button
                                    className={`source-type-option ${flow.sourceType === 'text' ? 'source-type-option--active' : ''}`}
                                    onClick={() => handleSourceTypeChange('text')}
                                >
                                    <Icons.Text />
                                    <span>Paste Text</span>
                                </button>
                                <button
                                    className={`source-type-option ${flow.sourceType === 'image' ? 'source-type-option--active' : ''}`}
                                    onClick={() => handleSourceTypeChange('image')}
                                >
                                    <Icons.Image />
                                    <span>Screenshot</span>
                                </button>
                                <button
                                    className={`source-type-option ${flow.sourceType === 'html' ? 'source-type-option--active' : ''}`}
                                    onClick={() => {
                                        handleSourceTypeChange('html')
                                        fileInputRef.current?.click()
                                    }}
                                >
                                    <Icons.Upload />
                                    <span>HTML File</span>
                                </button>
                            </div>

                            {/* Source Input */}
                            {flow.sourceType === 'text' && (
                                <section className="input-section">
                                    <div className="input-section__header">
                                        <h2 className="input-section__title">Your Experience</h2>
                                    </div>
                                    <textarea
                                        className="textarea"
                                        placeholder="Paste your CV content, work experience, skills..."
                                        value={flow.sourceText}
                                        onChange={(e) => flow.setSourceText(e.target.value)}
                                    />
                                    <div className="char-count">{flow.sourceText.length} chars</div>
                                </section>
                            )}

                            {flow.sourceType === 'image' && (
                                <section className="input-section">
                                    <div className="input-section__header">
                                        <h2 className="input-section__title">CV Screenshot</h2>
                                    </div>
                                    <div
                                        className="file-upload-zone"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {flow.sourceImage ? (
                                            <div className="file-upload-zone__preview">
                                                <img src={flow.sourceImage.preview} alt="CV Preview" />
                                                <span className="file-upload-zone__filename">{flow.sourceFileName}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Icons.Upload />
                                                <span>Click to upload CV screenshot</span>
                                            </>
                                        )}
                                    </div>
                                </section>
                            )}

                            {flow.sourceType === 'html' && flow.sourceFileName && (
                                <section className="input-section">
                                    <div className="input-section__header">
                                        <h2 className="input-section__title">Loaded CV</h2>
                                    </div>
                                    <div className="file-loaded-indicator">
                                        <Icons.FileText />
                                        <span>{flow.sourceFileName}</span>
                                        <button
                                            className="file-loaded-indicator__change"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </section>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".html,image/*"
                                style={{ display: 'none' }}
                                onChange={flow.handleFileUpload}
                            />

                            <div className="divider">Job Details</div>

                            <section className="input-section">
                                <div className="input-section__header">
                                    <h2 className="input-section__title">Job Description</h2>
                                </div>
                                <textarea
                                    className="textarea"
                                    placeholder="Paste the full job posting (requirements, responsibilities, qualifications)..."
                                    value={flow.jobDescription}
                                    onChange={(e) => flow.setJobDescription(e.target.value)}
                                />
                                <div className="char-count">{flow.jobDescription.length} chars</div>
                            </section>

                            <section className="input-section">
                                <div className="input-section__header">
                                    <h2 className="input-section__title">Additional Notes</h2>
                                    <span className="input-section__optional">Optional</span>
                                </div>
                                <textarea
                                    className="textarea textarea--small"
                                    placeholder="Any specific concerns, company research, or focus areas..."
                                    value={flow.userComments}
                                    onChange={(e) => flow.setUserComments(e.target.value)}
                                />
                            </section>
                        </div>
                    </div>
                </main>
                <BottomBar>
                    <div className="bottom-bar__spacer" />
                    <button
                        className="btn btn--primary"
                        onClick={flow.handleAnalyze}
                        disabled={!flow.hasSource || !flow.jobDescription.trim()}
                    >
                        <Icons.Mic /> Prepare Interview
                    </button>
                </BottomBar>
            </>
        )
    }

    // Step 1: Strategy (Tell Me About Yourself + Basic Questions)
    if (flow.step === 1) {
        const { aboutYou, basicQuestions } = flow.strategyData || {}

        return (
            <>
                <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Strategy', 'Technical']} currentStep={1} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step flow-step--interview">
                        <div className="flow-step__content flow-step__content--wide">

                            {/* Tell Me About Yourself Section */}
                            <section className="interview-section">
                                <div className="interview-section__header">
                                    <h2 className="interview-section__title">
                                        <Icons.User /> "Tell Me About Yourself"
                                    </h2>
                                    {aboutYou?.totalDuration && (
                                        <span className="interview-section__duration">{aboutYou.totalDuration}</span>
                                    )}
                                </div>

                                {aboutYou?.overview && (
                                    <p className="interview-section__overview">{aboutYou.overview}</p>
                                )}

                                <div className="about-you-sections">
                                    {aboutYou?.sections?.map((section, idx) => (
                                        <div key={idx} className="about-you-card">
                                            <div className="about-you-card__header">
                                                <span className="about-you-card__order">{section.order}</span>
                                                <h3 className="about-you-card__label">{section.label}</h3>
                                                <span className="about-you-card__duration">{section.duration}</span>
                                            </div>
                                            <ul className="about-you-card__points">
                                                {section.talkingPoints?.map((point, pIdx) => (
                                                    <li key={pIdx}>{point}</li>
                                                ))}
                                            </ul>
                                            {section.transitionTo && (
                                                <p className="about-you-card__transition">
                                                    <strong>Transition:</strong> {section.transitionTo}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {aboutYou?.closingHook && (
                                    <div className="about-you-closing">
                                        <strong>Closing Hook:</strong> "{aboutYou.closingHook}"
                                    </div>
                                )}

                                {aboutYou?.tips?.length > 0 && (
                                    <div className="interview-tips">
                                        <h4>Delivery Tips</h4>
                                        <ul>
                                            {aboutYou.tips.map((tip, idx) => (
                                                <li key={idx}>{tip}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            {/* Basic Questions Section */}
                            <section className="interview-section">
                                <div className="interview-section__header">
                                    <h2 className="interview-section__title">
                                        <Icons.Briefcase /> Common Questions
                                    </h2>
                                    <span className="interview-section__count">{basicQuestions?.length || 0} questions</span>
                                </div>

                                <div className="question-cards">
                                    {basicQuestions?.map((q) => (
                                        <div
                                            key={q.id}
                                            className={`question-card ${expandedQuestions[q.id] ? 'question-card--expanded' : ''}`}
                                        >
                                            <button
                                                className="question-card__header"
                                                onClick={() => toggleQuestion(q.id)}
                                            >
                                                <span className="question-card__question">{q.question}</span>
                                                <Icons.Arrow />
                                            </button>
                                            {expandedQuestions[q.id] && (
                                                <div className="question-card__body">
                                                    {q.whyTheyAsk && (
                                                        <div className="question-card__section">
                                                            <h4>Why They Ask This</h4>
                                                            <p>{q.whyTheyAsk}</p>
                                                        </div>
                                                    )}
                                                    {q.strategy && (
                                                        <div className="question-card__section">
                                                            <h4>Strategy</h4>
                                                            <p>{q.strategy}</p>
                                                        </div>
                                                    )}
                                                    {q.keyPoints?.length > 0 && (
                                                        <div className="question-card__section">
                                                            <h4>Key Points</h4>
                                                            <ul>
                                                                {q.keyPoints.map((point, idx) => (
                                                                    <li key={idx}>{point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {q.sampleOpener && (
                                                        <div className="question-card__section">
                                                            <h4>Sample Opener</h4>
                                                            <p className="question-card__sample">"{q.sampleOpener}"</p>
                                                        </div>
                                                    )}
                                                    {q.avoid?.length > 0 && (
                                                        <div className="question-card__section question-card__section--avoid">
                                                            <h4>Avoid Saying</h4>
                                                            <ul>
                                                                {q.avoid.map((item, idx) => (
                                                                    <li key={idx}>{item}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
                <BottomBar>
                    <button className="btn btn--secondary" onClick={flow.handleBack}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__spacer" />
                    <button className="btn btn--primary" onClick={flow.handleTechnical}>
                        Continue to Technical <Icons.Arrow />
                    </button>
                </BottomBar>
            </>
        )
    }

    // Step 2: Technical Questions
    const { technicalQuestions, scenarioQuestions, interviewTips } = flow.technicalData || {}

    return (
        <>
            <div className="app-flow__steps">
                <StepIndicator steps={['Input', 'Strategy', 'Technical']} currentStep={2} />
            </div>
            <main className="app-flow__main">
                <div className="flow-step flow-step--interview">
                    <div className="flow-step__content flow-step__content--wide">

                        {/* Technical Questions */}
                        <section className="interview-section">
                            <div className="interview-section__header">
                                <h2 className="interview-section__title">
                                    Technical Questions
                                </h2>
                                <span className="interview-section__count">{technicalQuestions?.length || 0} questions</span>
                            </div>

                            <div className="question-cards">
                                {technicalQuestions?.map((q) => (
                                    <div
                                        key={q.id}
                                        className={`question-card ${expandedQuestions[q.id] ? 'question-card--expanded' : ''}`}
                                    >
                                        <button
                                            className="question-card__header"
                                            onClick={() => toggleQuestion(q.id)}
                                        >
                                            <div className="question-card__meta">
                                                <span className={`difficulty-badge difficulty-badge--${q.difficulty}`}>
                                                    {q.difficulty}
                                                </span>
                                                {q.category && (
                                                    <span className="category-badge">{q.category}</span>
                                                )}
                                            </div>
                                            <span className="question-card__question">{q.question}</span>
                                            <Icons.Arrow />
                                        </button>
                                        {expandedQuestions[q.id] && (
                                            <div className="question-card__body">
                                                {q.whyTheyAsk && (
                                                    <div className="question-card__section">
                                                        <h4>Why They Ask This</h4>
                                                        <p>{q.whyTheyAsk}</p>
                                                    </div>
                                                )}
                                                {q.approach && (
                                                    <div className="question-card__section">
                                                        <h4>How to Approach</h4>
                                                        <p>{q.approach}</p>
                                                    </div>
                                                )}
                                                {q.keyElements?.length > 0 && (
                                                    <div className="question-card__section">
                                                        <h4>Key Elements</h4>
                                                        <ul>
                                                            {q.keyElements.map((el, idx) => (
                                                                <li key={idx}>{el}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {q.exampleFramework && (
                                                    <div className="question-card__section">
                                                        <h4>Answer Framework</h4>
                                                        <p className="question-card__sample">{q.exampleFramework}</p>
                                                    </div>
                                                )}
                                                {q.followUps?.length > 0 && (
                                                    <div className="question-card__section">
                                                        <h4>Likely Follow-ups</h4>
                                                        <ul>
                                                            {q.followUps.map((fu, idx) => (
                                                                <li key={idx}>{fu}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                {q.redFlags?.length > 0 && (
                                                    <div className="question-card__section question-card__section--avoid">
                                                        <h4>Red Flags to Avoid</h4>
                                                        <ul>
                                                            {q.redFlags.map((rf, idx) => (
                                                                <li key={idx}>{rf}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Scenario/STAR Questions */}
                        <section className="interview-section">
                            <div className="interview-section__header">
                                <h2 className="interview-section__title">
                                    Behavioral Questions (STAR Method)
                                </h2>
                                <span className="interview-section__count">{scenarioQuestions?.length || 0} questions</span>
                            </div>

                            <div className="question-cards">
                                {scenarioQuestions?.map((q) => (
                                    <div
                                        key={q.id}
                                        className={`question-card ${expandedQuestions[q.id] ? 'question-card--expanded' : ''}`}
                                    >
                                        <button
                                            className="question-card__header"
                                            onClick={() => toggleQuestion(q.id)}
                                        >
                                            {q.category && (
                                                <span className="category-badge">{q.category}</span>
                                            )}
                                            <span className="question-card__question">{q.question}</span>
                                            <Icons.Arrow />
                                        </button>
                                        {expandedQuestions[q.id] && (
                                            <div className="question-card__body">
                                                {q.whyTheyAsk && (
                                                    <div className="question-card__section">
                                                        <h4>What They're Assessing</h4>
                                                        <p>{q.whyTheyAsk}</p>
                                                    </div>
                                                )}
                                                {q.starGuidance && (
                                                    <div className="star-framework">
                                                        <h4>STAR Framework</h4>
                                                        <div className="star-framework__grid">
                                                            <div className="star-framework__item">
                                                                <span className="star-framework__letter">S</span>
                                                                <div>
                                                                    <strong>Situation</strong>
                                                                    <p>{q.starGuidance.situation}</p>
                                                                </div>
                                                            </div>
                                                            <div className="star-framework__item">
                                                                <span className="star-framework__letter">T</span>
                                                                <div>
                                                                    <strong>Task</strong>
                                                                    <p>{q.starGuidance.task}</p>
                                                                </div>
                                                            </div>
                                                            <div className="star-framework__item">
                                                                <span className="star-framework__letter">A</span>
                                                                <div>
                                                                    <strong>Action</strong>
                                                                    <p>{q.starGuidance.action}</p>
                                                                </div>
                                                            </div>
                                                            <div className="star-framework__item">
                                                                <span className="star-framework__letter">R</span>
                                                                <div>
                                                                    <strong>Result</strong>
                                                                    <p>{q.starGuidance.result}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {q.cvRelevance && (
                                                    <div className="question-card__section">
                                                        <h4>From Your CV</h4>
                                                        <p>{q.cvRelevance}</p>
                                                    </div>
                                                )}
                                                {q.tips?.length > 0 && (
                                                    <div className="question-card__section">
                                                        <h4>Tips</h4>
                                                        <ul>
                                                            {q.tips.map((tip, idx) => (
                                                                <li key={idx}>{tip}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* General Tips */}
                        {interviewTips?.length > 0 && (
                            <section className="interview-section interview-section--tips">
                                <div className="interview-section__header">
                                    <h2 className="interview-section__title">
                                        <Icons.Star /> Pro Tips
                                    </h2>
                                </div>
                                <ul className="interview-tips__list">
                                    {interviewTips.map((tip, idx) => (
                                        <li key={idx}>{tip}</li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>
                </div>
            </main>
            <BottomBar>
                <button className="btn btn--secondary" onClick={flow.handleBack}>
                    <Icons.ArrowLeft /> Back to Strategy
                </button>
                <div className="bottom-bar__spacer" />
                <button className="btn btn--secondary" onClick={flow.reset}>
                    <Icons.Refresh /> Start Over
                </button>
            </BottomBar>
        </>
    )
}
