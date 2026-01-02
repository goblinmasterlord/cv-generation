import { Icons } from '../ui'

export function FileUpload({
    accept,
    value,
    fileName,
    onChange,
    onRemove,
    inputRef,
    uploadText = 'Upload File',
    hint = 'Drag & drop or click to browse',
    Icon = Icons.Upload,
    showPreview = false,
    large = false
}) {
    const hasFile = value || fileName

    return (
        <div
            className={`file-upload ${large ? 'file-upload--large' : ''} ${hasFile ? 'file-upload--active' : ''}`}
            onClick={() => !hasFile && inputRef?.current?.click()}
        >
            {hasFile ? (
                showPreview && value?.preview && !value?.file?.type?.includes('pdf') && !fileName?.endsWith('.pdf') ? (
                    <div className="file-upload__image-preview">
                        <img src={value.preview} alt="Preview" />
                        <div className="file-upload__image-overlay">
                            <span className="file-upload__filename">{fileName}</span>
                            <button
                                className="file-upload__remove-btn"
                                onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="file-upload__preview">
                        <span className="file-upload__filename">
                            {value?.file?.type === 'application/pdf' || fileName?.endsWith('.pdf') ? <Icons.FileText /> : null}
                            {fileName}
                        </span>
                        <span className="file-upload__remove" onClick={(e) => { e.stopPropagation(); onRemove?.(); }}>
                            Remove
                        </span>
                    </div>
                )
            ) : (
                <>
                    <Icon />
                    <p className="file-upload__text">{uploadText}</p>
                    <p className="file-upload__hint">{hint}</p>
                </>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={onChange}
                style={{ display: 'none' }}
            />
        </div>
    )
}
