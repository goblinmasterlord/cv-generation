// CV Preview Components
// Extracted from App.jsx - Full preview and Modal versions

import { Icons } from '../ui/Icons'

// CV Preview Modal/Drawer
export const CVPreviewModal = ({ isOpen, onClose, cvHtml, showHighlights, onToggleHighlights, hasHighlights }) => {
    if (!isOpen) return null

    return (
        <div className="cv-modal-overlay" onClick={onClose}>
            <div className="cv-modal" onClick={e => e.stopPropagation()}>
                <div className="cv-modal__header">
                    <h2 className="cv-modal__title">CV Preview</h2>
                    <div className="cv-modal__actions">
                        {hasHighlights && (
                            <button
                                className={`btn btn--secondary ${showHighlights ? 'btn--active' : ''}`}
                                onClick={onToggleHighlights}
                            >
                                {showHighlights ? <Icons.Eye /> : <Icons.EyeOff />}
                                <span>{showHighlights ? 'Showing Changes' : 'Changes Hidden'}</span>
                            </button>
                        )}
                        <button className="cv-modal__close" onClick={onClose}>
                            <Icons.Close />
                        </button>
                    </div>
                </div>
                <div className="cv-modal__content">
                    <iframe
                        srcDoc={cvHtml}
                        title="CV Preview"
                        className="cv-modal__iframe"
                    />
                </div>
            </div>
        </div>
    )
}

// CV Preview Component (Full view for result steps)
export const CVPreviewFull = ({ cvHtml, showHighlights, onToggleHighlights, hasHighlights, zoom, setZoom }) => (
    <div className="cv-preview-full">
        <div className="cv-preview-full__controls">
            {hasHighlights && (
                <button
                    className={`preview-control-btn ${showHighlights ? 'preview-control-btn--active' : ''}`}
                    onClick={onToggleHighlights}
                >
                    {showHighlights ? <Icons.Eye /> : <Icons.EyeOff />}
                    <span>{showHighlights ? 'Changes Visible' : 'Changes Hidden'}</span>
                </button>
            )}
            <div className="zoom-controls-inline">
                <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} title="Zoom Out">
                    <Icons.ZoomOut />
                </button>
                <span className="zoom-value">{Math.round(zoom * 100)}%</span>
                <button className="zoom-btn" onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} title="Zoom In">
                    <Icons.ZoomIn />
                </button>
            </div>
        </div>
        <div className="cv-preview-full__container">
            <div
                className="cv-preview-full__document"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            >
                <iframe
                    srcDoc={cvHtml}
                    title="CV Preview"
                    className="cv-preview-full__iframe"
                />
            </div>
        </div>
    </div>
)

export default CVPreviewFull
