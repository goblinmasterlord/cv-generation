# CV Generator - Project Context

A personal tool to generate tailored CVs for different job applications using AI.

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Tech Stack

- **Frontend**: React 19 + Vite 6
- **AI**: Google Gemini 2.0 Flash (`gemini-2.0-flash`)
- **Styling**: Vanilla CSS (Sharp Editorial aesthetic from DESIGN.md)
- **Fonts**: Geist Sans / Geist Mono

## Project Structure

```
cv-generator/
├── index.html              # Entry point (loads Geist fonts)
├── package.json            # Dependencies: react, vite
├── vite.config.js          # Standard Vite + React config
├── .env                    # API key: VITE_GOOGLE_GENERATIVE_AI_API_KEY
│
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # Main app - dual mode (Tailor / Feedback)
│   │
│   ├── styles/
│   │   └── index.css       # Full design system (dark theme, coral accents)
│   │
│   ├── templates/
│   │   └── baseCv.js       # Lilla's base CV as HTML string
│   │                        # Includes .cv-change-highlight CSS for change tracking
│   │
│   └── prompts/
│       ├── tailorCv.js     # Prompt for direct CV tailoring
│       ├── feedbackCv.js   # Prompt for multi-perspective analysis
│       └── applyCv.js      # Prompt for applying approved changes
│
├── DESIGN.md               # Design guidelines (Sharp Editorial aesthetic)
└── GEMINI.md               # This file
```

## Two Modes

### 1. Tailor CV Mode
Direct AI rewriting of CV based on job description. One-shot tailoring.

### 2. Feedback Mode (Approval Flow)
Three-step process:
1. **Analyze** → Get multi-perspective feedback (Content Expert, HR/ATS, Hiring Manager)
2. **Select** → Toggle approve/reject on individual suggestions
3. **Apply** → Only approved changes are applied to CV

## Core Features

1. **Base CV Template**: HTML/CSS CV with embedded styles
2. **Job Description Input**: Paste job posting to analyze
3. **AI Tailoring**: Gemini rewrites profile, reorders bullets, integrates keywords
4. **Multi-Perspective Feedback**: Deep analysis from 3 viewpoints with priority ratings
5. **Selective Apply**: Choose which suggestions to implement
6. **Change Highlighting**: Modified text highlighted in coral, toggleable, stripped on export
7. **Template Selection**: Use base template or upload custom HTML
8. **Export**: Download as HTML (highlights auto-removed)
9. **Mobile Responsive**: Full mobile editing support with bottom-sheet preview

## AI Integration

**Model**: `gemini-2.0-flash`

**API Call Pattern** (in `App.jsx`):
```javascript
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
  })
})
```

**Temperature Settings**:
- Tailoring: 0.7 (more creative)
- Feedback analysis: 0.5 (balanced)
- Apply changes: 0.3 (precise)

**Environment Variable**: `VITE_GOOGLE_GENERATIVE_AI_API_KEY`

## Prompts Architecture

### `tailorCv.js`
One-shot CV rewriting. Returns complete HTML.

### `feedbackCv.js`
Multi-perspective analysis. Returns JSON:
```json
{
  "overallScore": 75,
  "perspectives": {
    "content": { "score": 80, "summary": "..." },
    "hr": { "score": 70, "summary": "..." },
    "hiring": { "score": 75, "summary": "..." }
  },
  "items": [
    {
      "id": "imp-1",
      "type": "improvement",
      "perspective": "content",
      "priority": "high",
      "text": "What to improve",
      "action": "Specific instruction",
      "section": "CV section"
    }
  ]
}
```

### `applyCv.js`
Takes approved items, applies changes with optional highlighting:
```html
<span class="cv-change-highlight">modified text</span>
```

## Change Highlighting System

- **In Template**: `baseCv.js` includes `.cv-change-highlight` CSS (coral bg + underline)
- **Applied by AI**: When `createApplyPrompt(items, cv, true)` is called
- **Toggle in UI**: Eye icon button shows/hides highlights in preview
- **Export**: `getExportCv()` function strips all highlight spans
- **Print**: CSS hides highlights automatically via `@media print`

## Key UI Components

| Component | Purpose |
|-----------|---------|
| `PerspectiveScores` | Three score cards at top of feedback |
| `FeedbackItem` | Selectable item with toggle, priority badge |
| `ApplyLoadingOverlay` | Stepped progress during apply |
| `FeedbackResults` | Full feedback panel with sections |

## State Management

Key states in `App.jsx`:
- `activeMode`: 'tailor' | 'feedback'
- `feedback`: Analysis results with `items[].approved` for selection
- `showHighlights`: Toggle for change visibility
- `isApplying` + `applyStep`: For stepped loading UX

## Design System

CSS Variables (in `src/styles/index.css`):
- Dark app background: `#1a1a1a`
- Coral accent: `#D58F7C`
- Sage green: `#61665C`
- Fonts: Geist Sans (body), Geist Mono (code/labels)
- No border-radius anywhere (Sharp Editorial)

## Prompt Philosophy

- **Never fabricate** experience or skills
- **Reorder** existing content to highlight relevance
- **Integrate keywords** only where genuinely applicable
- **Maintain authentic voice** - not robotic or template-like
- **Specific actions** - each suggestion is implementable verbatim

## Key Files to Edit

| Task | File |
|------|------|
| Change CV content | `src/templates/baseCv.js` |
| Modify tailoring behavior | `src/prompts/tailorCv.js` |
| Modify feedback analysis | `src/prompts/feedbackCv.js` |
| Modify apply behavior | `src/prompts/applyCv.js` |
| Update app UI/logic | `src/App.jsx` |
| Change styles | `src/styles/index.css` |
| Design guidelines | `DESIGN.md` |
