export function StepIndicator({ steps, currentStep }) {
    return (
        <div className="step-indicator">
            {steps.map((label, index) => (
                <div key={index} style={{ display: 'contents' }}>
                    {index > 0 && <div className="step-indicator__line" />}
                    <div
                        className={`step-indicator__item ${currentStep === index ? 'step-indicator__item--active' : ''
                            } ${currentStep > index ? 'step-indicator__item--done' : ''}`}
                    >
                        <span className="step-indicator__number">{index + 1}</span>
                        <span className="step-indicator__label">{label}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
