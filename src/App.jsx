import { useState, useEffect } from 'react'

// Extracted Components
import { ToastContainer, useToast } from './components/ui'
import { Header } from './components/layout'

// Features
import { TailorFlow, FeedbackFlow, CreateFlow, InterviewFlow } from './features'

// Hooks
import { useCvState } from './hooks'

function App() {
    // Mode State
    const [activeMode, setActiveMode] = useState('tailor') // 'tailor' | 'feedback' | 'create' | 'interview'

    // Shared State
    const cvState = useCvState()
    const { toasts, addToast } = useToast()

    // Reset CV when mode changes
    useEffect(() => {
        // Optional: reset CV state when switching modes
        // cvState.resetCv()
    }, [activeMode])

    return (
        <div className="app-flow">
            <ToastContainer toasts={toasts} />
            <Header activeMode={activeMode} onModeChange={setActiveMode} />

            {activeMode === 'tailor' && (
                <TailorFlow cvState={cvState} addToast={addToast} />
            )}
            {activeMode === 'feedback' && (
                <FeedbackFlow cvState={cvState} addToast={addToast} />
            )}
            {activeMode === 'create' && (
                <CreateFlow cvState={cvState} addToast={addToast} />
            )}
            {activeMode === 'interview' && (
                <InterviewFlow cvState={cvState} addToast={addToast} />
            )}
        </div>
    )
}

export default App
