import { Icons } from '../ui'

export function TemplateSelector({ mode, onModeChange, fileName, onUpload, onReset, fileInputRef, allowPdf = false }) {
    return (
        <section className="input-section">
            <div className="input-section__header">
                <h2 className="input-section__title">CV Template</h2>
            </div>
            <div className="template-selector">
                <button
                    className={`template-option ${mode === 'base' ? 'template-option--active' : ''}`}
                    onClick={() => onModeChange('base')}
                >
                    Base Template
                </button>
                <button
                    className={`template-option ${mode === 'custom' ? 'template-option--active' : ''}`}
                    onClick={() => onModeChange('custom')}
                >
                    {allowPdf ? 'Upload Custom / PDF' : 'Upload Custom Template'}
                </button>
            </div>

            {mode === 'custom' && (
                <div
                    className={`file-upload ${fileName ? 'file-upload--active' : ''}`}
                    onClick={() => !fileName && fileInputRef.current?.click()}
                >
                    {fileName ? (
                        <div className="file-upload__preview">
                            <span className="file-upload__filename">
                                {fileName.endsWith('.pdf') ? <Icons.FileText /> : null}
                                {fileName}
                            </span>
                            <span className="file-upload__remove" onClick={(e) => { e.stopPropagation(); onReset(); }}>
                                Remove
                            </span>
                        </div>
                    ) : (
                        <>
                            <Icons.Upload />
                            <p className="file-upload__text">
                                {allowPdf ? 'Upload HTML, PDF or Screenshot' : 'Upload HTML or Screenshot'}
                            </p>
                            <p className="file-upload__hint">
                                {allowPdf ? 'Drag & drop to analyze your CV' : 'Drag & drop to replace base template'}
                            </p>
                        </>
                    )}
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept={allowPdf ? ".html,.pdf,image/*" : ".html,image/*"}
                onChange={onUpload}
                style={{ display: 'none' }}
            />
        </section>
    )
}
