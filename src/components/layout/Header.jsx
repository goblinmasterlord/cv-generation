import { Icons } from '../ui'

export function Header({ activeMode, onModeChange }) {
    return (
        <header className="app-flow__header">
            <div className="app__logo">
                <span className="app__logo-mark"></span>
                <span className="app__logo-text">CV Generator</span>
            </div>
            <nav className="app__nav">
                <button
                    className={`nav-tab ${activeMode === 'create' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('create')}
                >
                    <Icons.Plus />
                    <span className="nav-tab__label">Create</span>
                </button>
                <button
                    className={`nav-tab ${activeMode === 'tailor' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('tailor')}
                >
                    <Icons.Briefcase />
                    <span className="nav-tab__label">Tailor</span>
                </button>
                <button
                    className={`nav-tab ${activeMode === 'feedback' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('feedback')}
                >
                    <Icons.Star />
                    <span className="nav-tab__label">Feedback</span>
                </button>
                <button
                    className={`nav-tab ${activeMode === 'interview' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('interview')}
                >
                    <Icons.Mic />
                    <span className="nav-tab__label">Interview</span>
                </button>
            </nav>
        </header>
    )
}
