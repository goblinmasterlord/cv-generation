import { Icons } from '../ui'

export function Header({ activeMode, onModeChange }) {
    return (
        <header className="app-flow__header">
            <div className="app__logo">CV Generator</div>
            <nav className="app__nav">
                <button
                    className={`nav-tab ${activeMode === 'create' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('create')}
                >
                    <Icons.Plus /> Create New
                </button>
                <button
                    className={`nav-tab ${activeMode === 'tailor' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('tailor')}
                >
                    Tailor CV
                </button>
                <button
                    className={`nav-tab ${activeMode === 'feedback' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('feedback')}
                >
                    Get Feedback
                </button>
                <button
                    className={`nav-tab ${activeMode === 'interview' ? 'nav-tab--active' : ''}`}
                    onClick={() => onModeChange('interview')}
                >
                    <Icons.Mic /> Interview Prep
                </button>
            </nav>
        </header>
    )
}
