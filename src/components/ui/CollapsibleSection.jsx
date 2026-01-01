// Collapsible Section Component
// Extracted from App.jsx

import { useState } from 'react'

export const CollapsibleSection = ({ title, icon, count, hint, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className={`feedback-section ${isOpen ? 'feedback-section--open' : ''}`}>
            <button
                className="feedback-section__header"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="feedback-section__title">
                    {icon} {title}
                    <span className="feedback-section__count">{count}</span>
                    {hint && <span className="feedback-section__hint">{hint}</span>}
                </h3>
                <svg
                    className={`feedback-section__chevron ${isOpen ? 'feedback-section__chevron--open' : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {isOpen && (
                <div className="feedback-section__content">
                    {children}
                </div>
            )}
        </div>
    )
}

export default CollapsibleSection
