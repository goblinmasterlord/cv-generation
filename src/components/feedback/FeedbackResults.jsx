// Feedback Results Components
// Extracted from App.jsx - includes FeedbackItem, PerspectiveScores, StrengthsList

import { Icons } from '../ui/Icons'
import { CollapsibleSection } from '../ui/CollapsibleSection'

// Perspective Score Cards
export const PerspectiveScores = ({ perspectives }) => {
    if (!perspectives) return null

    const getScoreClass = (score) => {
        if (score >= 80) return 'perspective-score--high'
        if (score >= 60) return 'perspective-score--medium'
        return 'perspective-score--low'
    }

    const perspectiveData = [
        { key: 'content', label: 'Technical Fit', icon: <Icons.FileText />, data: perspectives.content },
        { key: 'hr', label: 'HR / ATS', icon: <Icons.User />, data: perspectives.hr },
        { key: 'hiring', label: 'Hiring Manager', icon: <Icons.Briefcase />, data: perspectives.hiring },
    ]

    return (
        <div className="perspective-scores">
            {perspectiveData.map(p => p.data && (
                <div key={p.key} className="perspective-card">
                    <div className="perspective-card__header">
                        <span className="perspective-card__icon">{p.icon}</span>
                        <span className="perspective-card__label">{p.label}</span>
                        <span className={`perspective-card__score ${getScoreClass(p.data.score)}`}>
                            {p.data.score}
                        </span>
                    </div>
                    <p className="perspective-card__summary">{p.data.summary}</p>
                </div>
            ))}
        </div>
    )
}

// Feedback Item Component - Selectable
export const FeedbackItem = ({ item, onToggle }) => {
    const isActionable = item.type !== 'strength'
    const isApproved = item.approved

    const getIcon = () => {
        switch (item.type) {
            case 'strength': return <Icons.Star />
            case 'improvement': return <Icons.Arrow />
            case 'keyword': return <Icons.Tag />
            default: return null
        }
    }

    const getPriorityClass = () => {
        if (!item.priority) return ''
        return `feedback-item--priority-${item.priority}`
    }

    return (
        <div
            className={`feedback-item feedback-item--${item.type} ${isApproved ? 'feedback-item--approved' : ''} ${isActionable ? 'feedback-item--actionable' : ''} ${getPriorityClass()}`}
            onClick={() => isActionable && onToggle(item.id)}
        >
            <div className="feedback-item__icon">{getIcon()}</div>
            <div className="feedback-item__content">
                <div className="feedback-item__meta">
                    {item.perspective && (
                        <span className="feedback-item__perspective">{item.perspective}</span>
                    )}
                    {item.priority && (
                        <span className={`feedback-item__priority feedback-item__priority--${item.priority}`}>
                            {item.priority}
                        </span>
                    )}
                </div>
                <p className="feedback-item__text">{item.text}</p>
                {item.action && (
                    <p className="feedback-item__action">{item.action}</p>
                )}
                {item.section && (
                    <span className="feedback-item__section">{item.section}</span>
                )}
            </div>
            {isActionable && (
                <div className="feedback-item__toggle">
                    {isApproved && <Icons.Check />}
                </div>
            )}
        </div>
    )
}

// Compact Strengths Component
export const StrengthsList = ({ strengths }) => (
    <div className="strengths-compact">
        {strengths.map(item => (
            <div key={item.id} className="strength-chip">
                <Icons.Star />
                <span>{item.text}</span>
            </div>
        ))}
    </div>
)

// Feedback Results Component - Interactive
export const FeedbackResults = ({ feedback, onToggleItem }) => {
    if (!feedback) return null

    const getScoreClass = (score) => {
        if (score >= 80) return 'feedback-score--high'
        if (score >= 60) return 'feedback-score--medium'
        return 'feedback-score--low'
    }

    // Group items by type
    const strengths = feedback.items?.filter(i => i.type === 'strength') || []
    const improvements = feedback.items?.filter(i => i.type === 'improvement') || []
    const keywords = feedback.items?.filter(i => i.type === 'keyword') || []

    return (
        <div className="feedback-results">
            <div className="feedback-header">
                <div className={`feedback-score ${getScoreClass(feedback.overallScore)}`}>
                    {feedback.overallScore}
                </div>
                <p className="feedback-summary">{feedback.summary}</p>
            </div>

            {/* Perspective Scores */}
            <PerspectiveScores perspectives={feedback.perspectives} />

            {/* Compact Strengths */}
            {strengths.length > 0 && (
                <CollapsibleSection
                    title="Strengths"
                    icon={<Icons.Star />}
                    count={strengths.length}
                    defaultOpen={false}
                >
                    <StrengthsList strengths={strengths} />
                </CollapsibleSection>
            )}

            {/* Improvements - Main Focus */}
            {improvements.length > 0 && (
                <CollapsibleSection
                    title="Improvements"
                    icon={<Icons.Arrow />}
                    count={improvements.length}
                    hint="Click to approve"
                    defaultOpen={true}
                >
                    <div className="feedback-items">
                        {improvements.map(item => (
                            <FeedbackItem key={item.id} item={item} onToggle={onToggleItem} />
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Keywords */}
            {keywords.length > 0 && (
                <CollapsibleSection
                    title="Missing Keywords"
                    icon={<Icons.Tag />}
                    count={keywords.length}
                    hint="Click to add"
                    defaultOpen={true}
                >
                    <div className="feedback-items">
                        {keywords.map(item => (
                            <FeedbackItem key={item.id} item={item} onToggle={onToggleItem} />
                        ))}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    )
}

export default FeedbackResults
