// Stepped Loading Overlay Component
// Extracted from App.jsx

import { Icons } from './Icons'

export const SteppedLoadingOverlay = ({ steps, currentStep, title }) => (
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

export default SteppedLoadingOverlay
