import { Icons } from '../ui'

export function CvInputSection({
    sourceType,
    onSourceTypeChange,
    data = {}, // { text, file, image, fileName }
    handlers = {}, // { onFileChange, onTextChange, onRemove }
    fileInputRef,
    presets = [] // [{ id: 'lilla', label: "Lilla's CV" }]
}) {
    // Helper to determine active class
    const getOptionClass = (type) =>
        `source-type-option ${sourceType === type ? 'source-type-option--active' : ''}`

    return (
        <div className="cv-input-section">
            {/* Source Type Selector */}
            <div className="source-type-selector">
                <button
                    className={getOptionClass('text')}
                    onClick={() => onSourceTypeChange('text')}
                >
                    <Icons.Text />
                    <span>Paste Text</span>
                </button>
                <button
                    className={getOptionClass('pdf')}
                    onClick={() => onSourceTypeChange('pdf')}
                >
                    <Icons.FileText />
                    <span>PDF File</span>
                </button>
                <button
                    className={getOptionClass('image')}
                    onClick={() => onSourceTypeChange('image')}
                >
                    <Icons.Image />
                    <span>Screenshot</span>
                </button>
                <button
                    className={getOptionClass('html')}
                    onClick={() => {
                        onSourceTypeChange('html')
                        // Only auto-click if we don't have a file yet
                        if (!data.fileName) {
                            fileInputRef.current?.click()
                        }
                    }}
                >
                    <Icons.Upload />
                    <span>HTML File</span>
                </button>

                {/* Generic "From Template" Entry Point */}
                {presets.length > 0 && (
                    <button
                        className={`source-type-option ${presets.some(p => p.id === sourceType) ? 'source-type-option--active' : ''}`}
                        onClick={() => onSourceTypeChange(presets[0].id)}
                    >
                        <Icons.User />
                        <span>Template</span>
                    </button>
                )}
            </div>

            {/* Source Input Areas */}
            <div className="source-input-area">
                {sourceType === 'text' && (
                    <section className="input-section">
                        <div className="input-section__header">
                            <h2 className="input-section__title">Your Experience</h2>
                        </div>
                        <textarea
                            className="textarea"
                            placeholder="Paste your CV content, work experience, skills..."
                            value={data.text || ''}
                            onChange={(e) => handlers.onTextChange?.(e.target.value)}
                        />
                        <div className="char-count">{(data.text || '').length} chars</div>
                    </section>
                )}

                {sourceType === 'pdf' && (
                    <section className="input-section">
                        <div className="input-section__header">
                            <h2 className="input-section__title">Upload PDF CV</h2>
                        </div>
                        <div
                            className="file-upload-zone"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {/* We reuse the image data structure for PDF file info usually */}
                            {data.image || data.fileName ? (
                                <div className="file-upload-zone__preview">
                                    <Icons.FileText />
                                    <span className="file-upload-zone__filename">{data.fileName}</span>
                                </div>
                            ) : (
                                <>
                                    <Icons.Upload />
                                    <span>Click to upload PDF CV</span>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {sourceType === 'image' && (
                    <section className="input-section">
                        <div className="input-section__header">
                            <h2 className="input-section__title">CV Screenshot</h2>
                        </div>
                        <div
                            className="file-upload-zone"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {data.image ? (
                                <div className="file-upload-zone__preview">
                                    <img src={data.image.preview} alt="CV Preview" />
                                    <span className="file-upload-zone__filename">{data.fileName}</span>
                                </div>
                            ) : (
                                <>
                                    <Icons.Upload />
                                    <span>Click to upload CV screenshot</span>
                                </>
                            )}
                        </div>
                    </section>
                )}

                {sourceType === 'html' && (
                    <section className="input-section">
                        <div className="input-section__header">
                            <h2 className="input-section__title">Loaded CV</h2>
                        </div>
                        {data.fileName ? (
                            <div className="file-loaded-indicator">
                                <Icons.FileText />
                                <span>{data.fileName}</span>
                                <button
                                    className="file-loaded-indicator__change"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Change
                                </button>
                            </div>
                        ) : (
                            <div
                                className="file-upload-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Icons.Upload />
                                <span>Click to upload HTML CV</span>
                            </div>
                        )}
                    </section>
                )}

                {/* Specific Template Selector (Visible when From Template is active) */}
                {presets.length > 0 && presets.some(p => p.id === sourceType) && (
                    <section className="input-section">
                        <div className="input-section__header">
                            <h2 className="input-section__title">Select Template</h2>
                        </div>
                        <div className="template-options-grid">
                            {presets.map(preset => (
                                <button
                                    key={preset.id}
                                    className={`template-option ${sourceType === preset.id ? 'template-option--active' : ''}`}
                                    onClick={() => onSourceTypeChange(preset.id)}
                                >
                                    <div className="template-option__icon">
                                        <Icons.Check />
                                    </div>
                                    <span className="template-option__label">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={
                    sourceType === 'image' ? 'image/*' :
                        sourceType === 'pdf' ? 'application/pdf' :
                            '.html'
                }
                style={{ display: 'none' }}
                onChange={handlers.onFileChange}
            />
        </div>
    )
}
