// Toast notification system
// Extracted from App.jsx

import { useState, useCallback } from 'react'

// Toast Container Component
export const ToastContainer = ({ toasts }) => (
    <div className="toast-container">
        {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast--${toast.type}`}>
                <div className="toast__content">{toast.message}</div>
            </div>
        ))}
    </div>
)

// Custom hook for toast management
export const useToast = () => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }, [])

    return { toasts, addToast }
}

export default ToastContainer
