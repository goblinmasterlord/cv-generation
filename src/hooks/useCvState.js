import { useState, useCallback } from 'react'
import baseCvTemplate from '../templates/baseCv'

/**
 * Shared CV state hook used across all flows.
 * Manages: current CV HTML, template mode, zoom, highlights.
 */
export function useCvState() {
    const [currentCv, setCurrentCv] = useState(baseCvTemplate)
    const [templateMode, setTemplateMode] = useState('base') // 'base' | 'custom'
    const [customFileName, setCustomFileName] = useState('')
    const [showHighlights, setShowHighlights] = useState(true)
    const [zoom, setZoom] = useState(1)

    const hasHighlights = currentCv.includes('cv-change-highlight')

    const getDisplayCv = useCallback(() => {
        if (showHighlights) return currentCv
        return currentCv.replace(/<span class="cv-change-highlight">(.*?)<\/span>/gi, '$1')
    }, [currentCv, showHighlights])

    const getExportCv = useCallback(() => {
        return currentCv.replace(/<span class="cv-change-highlight">(.*?)<\/span>/gi, '$1')
    }, [currentCv])

    const resetCv = useCallback(() => {
        setCurrentCv(baseCvTemplate)
        setTemplateMode('base')
        setCustomFileName('')
    }, [])

    const loadCustomCv = useCallback((html, fileName) => {
        setCurrentCv(html)
        setCustomFileName(fileName)
        setTemplateMode('custom')
    }, [])

    return {
        // State
        currentCv,
        setCurrentCv,
        templateMode,
        setTemplateMode,
        customFileName,
        showHighlights,
        setShowHighlights,
        zoom,
        setZoom,
        hasHighlights,

        // Computed
        getDisplayCv,
        getExportCv,

        // Actions
        resetCv,
        loadCustomCv
    }
}
