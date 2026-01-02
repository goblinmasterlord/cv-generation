// Stepped Loading Overlay Component
// Enhanced with tips section and better UX

import { useState, useEffect, useMemo } from 'react'
import { Icons } from './Icons'

const LOADING_TIPS = [
    "Tip: Use specific numbers and metrics when describing achievements — \"increased sales by 30%\" is more impactful than \"improved sales.\"",
    "Did you know? Recruiters spend an average of 7.4 seconds on an initial CV scan. Make your key achievements visible.",
    "Pro tip: Mirror the language from the job description in your CV — many companies use ATS systems that scan for keywords.",
    "Research shows: Candidates who prepare for the \"Tell me about yourself\" question perform 40% better in interviews.",
    "Interview insight: The STAR method (Situation, Task, Action, Result) helps structure compelling answers to behavioral questions."
]

export const SteppedLoadingOverlay = ({ steps, currentStep, title }) => {
    // Pick a random tip when component mounts
    const randomTip = useMemo(() => {
        return LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)]
    }, [])

    // Track which steps have been visited to show proper animation
    const [visitedSteps, setVisitedSteps] = useState(new Set([0]))

    useEffect(() => {
        setVisitedSteps(prev => new Set([...prev, currentStep]))
    }, [currentStep])

    return (
        <div className="flow-loading">
            <div className="flow-loading__content">
                {title && <h3 className="flow-loading__title">{title}</h3>}
                <div className="flow-loading__steps">
                    {steps.map((step, i) => {
                        const isDone = i < currentStep
                        const isActive = i === currentStep
                        const hasBeenVisited = visitedSteps.has(i)
                        const isPending = !hasBeenVisited && i > currentStep

                        return (
                            <div
                                key={i}
                                className={`flow-loading__step ${isDone ? 'flow-loading__step--done' : ''} ${isActive ? 'flow-loading__step--active' : ''} ${isPending ? 'flow-loading__step--pending' : ''}`}
                            >
                                <div className="flow-loading__step-icon">
                                    {isDone ? (
                                        <Icons.Check />
                                    ) : isActive ? (
                                        <div className="spinner-small" />
                                    ) : (
                                        <span className="flow-loading__step-number">{i + 1}</span>
                                    )}
                                </div>
                                <span className="flow-loading__step-text">{step}</span>
                            </div>
                        )
                    })}
                </div>
                <div className="flow-loading__progress">
                    <div
                        className="flow-loading__progress-bar"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
                <div className="flow-loading__tip">
                    <p>{randomTip}</p>
                </div>
            </div>
        </div>
    )
}

export default SteppedLoadingOverlay
