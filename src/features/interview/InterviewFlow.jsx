import React from 'react';
import { Icons, SteppedLoadingOverlay } from '../../components/ui';
import { StepIndicator, BottomBar } from '../../components/layout';
import { FileUpload } from '../../components/forms';
import { useInterviewFlow } from './useInterviewFlow';

// Sub-components for Steps
const IntroStrategyView = ({ data }) => (
    <div className="interview-section animate-in">
        <h2 className="interview-section__title">
            <Icons.User /> "Tell Me About Yourself"
        </h2>
        <div className="interview-card">
            <p className="interview-card__summary">{data.overview}</p>
            <div className="interview-steps">
                {data.steps.map((step, idx) => (
                    <div key={idx} className="interview-step">
                        <div className="interview-step__number">{step.order}</div>
                        <div className="interview-step__content">
                            <h4>{step.section}</h4>
                            <p>{step.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="interview-script">
                <h4>Suggested Script</h4>
                <p>"{data.script}"</p>
            </div>
        </div>
    </div>
);

const BasicQuestionsView = ({ questions }) => (
    <div className="interview-section animate-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="interview-section__title">
            <Icons.MessageSquare /> Standard Questions
        </h2>
        <div className="interview-grid">
            {questions.map((q, idx) => (
                <div key={idx} className="interview-card">
                    <h3 className="interview-card__question">{q.question}</h3>
                    <div className="interview-card__meta">
                        <span className="badge badge--neutral">Context: {q.context}</span>
                    </div>
                    <div className="interview-card__advice">
                        <strong>Advice:</strong> {q.advice}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const TechnicalQuestionsView = ({ questions }) => (
    <div className="interview-section animate-in">
        <h2 className="interview-section__title">
            <Icons.Cpu /> Technical & Hard Questions
        </h2>
        <div className="interview-grid">
            {questions.map((q, idx) => (
                <div key={idx} className="interview-card interview-card--technical">
                    <div className="interview-card__header">
                         <h3 className="interview-card__question">{q.question}</h3>
                         <span className="badge badge--warning">Hard</span>
                    </div>

                    <div className="interview-card__content">
                        <div className="interview-card__block">
                            <h4>Expected Answer Structure</h4>
                            <p>{q.expectedAnswer}</p>
                        </div>
                        <div className="interview-card__block">
                             <h4>Preparation Tip</h4>
                             <p>{q.preparationTip}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export function InterviewFlow({ cvState, addToast }) {
    const flow = useInterviewFlow(cvState, addToast);

    // Loading State
    if (flow.isLoading) {
        return (
            <SteppedLoadingOverlay
                steps={flow.loadingSteps}
                currentStep={flow.loadingStep}
                title="Generating Interview Guide"
            />
        );
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

                            {/* CV Source Selection */}
                            <div className="create-section">
                                <div className="create-section__header">
                                    <h3 className="create-section__title">
                                        <Icons.FileText /> CV Context
                                    </h3>
                                </div>
                                <div className="create-section__content">
                                    <div className="source-type-selector">
                                        {cvState.cvHtml && (
                                            <button
                                                className={`source-type-option ${flow.sourceType === 'current' ? 'source-type-option--active' : ''}`}
                                                onClick={() => flow.setSourceType('current')}
                                            >
                                                <Icons.Briefcase />
                                                <span>Current CV</span>
                                            </button>
                                        )}
                                        <button
                                            className={`source-type-option ${flow.sourceType === 'text' ? 'source-type-option--active' : ''}`}
                                            onClick={() => flow.setSourceType('text')}
                                        >
                                            <Icons.Text />
                                            <span>Paste Text</span>
                                        </button>
                                        <button
                                            className={`source-type-option ${flow.sourceType === 'html' ? 'source-type-option--active' : ''}`}
                                            onClick={() => flow.setSourceType('html')}
                                        >
                                            <Icons.Upload />
                                            <span>HTML File</span>
                                        </button>
                                    </div>

                                    {flow.sourceType === 'current' && (
                                        <div className="info-box">
                                            Using your currently loaded CV for analysis.
                                        </div>
                                    )}

                                    {flow.sourceType === 'text' && (
                                        <textarea
                                            className="textarea textarea--large"
                                            placeholder="Paste your CV content here..."
                                            value={flow.sourceText}
                                            onChange={(e) => flow.setSourceText(e.target.value)}
                                        />
                                    )}

                                    {flow.sourceType === 'html' && (
                                        <FileUpload
                                            accept=".html"
                                            value={flow.sourceText} // We use sourceText as presence indicator for HTML
                                            fileName={flow.sourceFileName}
                                            onChange={flow.handleFileUpload}
                                            onRemove={() => {
                                                flow.setSourceText('');
                                                flow.setSourceFileName('');
                                            }}
                                            large
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Job Description */}
                            <div className="create-section">
                                <div className="create-section__header">
                                    <h3 className="create-section__title">
                                        <Icons.Briefcase /> Job Description
                                    </h3>
                                </div>
                                <div className="create-section__content">
                                    <textarea
                                        className="textarea"
                                        placeholder="Paste the job posting..."
                                        value={flow.jobDescription}
                                        onChange={(e) => flow.setJobDescription(e.target.value)}
                                    />
                                    <div style={{ marginTop: 'var(--space-md)' }}>
                                        <textarea
                                            className="textarea textarea--small"
                                            placeholder="Optional notes or specific focus..."
                                            value={flow.userComments}
                                            onChange={(e) => flow.setUserComments(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
                <BottomBar>
                    <button
                        className="btn btn--primary btn--large"
                        onClick={flow.handleGenerate}
                        disabled={!flow.jobDescription.trim() || !flow.hasSource}
                    >
                        <Icons.Sparkles /> Generate Guide
                    </button>
                </BottomBar>
            </>
        );
    }

    // Step 1: Strategy & Basic Questions
    if (flow.step === 1) {
        return (
            <>
                 <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Strategy', 'Technical']} currentStep={1} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step">
                        <IntroStrategyView data={flow.interviewData.introStrategy} />
                        <BasicQuestionsView questions={flow.interviewData.basicQuestions} />
                    </div>
                </main>
                <BottomBar>
                    <button className="btn btn--secondary" onClick={() => flow.setStep(0)}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__spacer" />
                    <button className="btn btn--primary" onClick={() => flow.setStep(2)}>
                        Next: Technical Questions <Icons.ArrowRight />
                    </button>
                </BottomBar>
            </>
        );
    }

    // Step 2: Technical Questions
    if (flow.step === 2) {
        return (
            <>
                 <div className="app-flow__steps">
                    <StepIndicator steps={['Input', 'Strategy', 'Technical']} currentStep={2} />
                </div>
                <main className="app-flow__main">
                    <div className="flow-step">
                        <TechnicalQuestionsView questions={flow.interviewData.technicalQuestions} />
                    </div>
                </main>
                <BottomBar>
                    <button className="btn btn--secondary" onClick={() => flow.setStep(1)}>
                        <Icons.ArrowLeft /> Back
                    </button>
                    <div className="bottom-bar__spacer" />
                    <button className="btn btn--secondary" onClick={flow.reset}>
                        <Icons.Refresh /> Start Over
                    </button>
                </BottomBar>
            </>
        );
    }

    return null;
}
