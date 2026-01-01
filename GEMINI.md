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
- **AI**: Google Gemini 3 Pro (`gemini-3-pro-preview`)
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
│   ├── App.jsx             # Main app - step-based flow UI
│   │
│   ├── styles/
│   │   └── index.css       # Full design system (dark theme, coral accents)
│   │
│   ├── templates/
│   │   └── baseCv.js       # Lilla's base CV as HTML string
│   │
│   ├── prompts/
│   │   ├── tailorCv.js     # Returns structured find/replace changes
│   │   ├── feedbackCv.js   # Returns structured feedback with find/replace
│   │   └── applyCv.js      # (Legacy - no longer used for apply)
│   │
│   └── utils/
│       ├── cvParser.js     # Parses CV HTML to text for AI analysis
│       └── changeApplier.js # Applies find/replace changes programmatically
│
├── DESIGN.md               # Design guidelines (Sharp Editorial aesthetic)
├── GEMINI.md               # This file
└── CV-CHANGE-SYSTEM.md     # How the structured change system works
```

## UI Flow (Step-Based)

### Tailor CV Mode (2 steps)
1. **Input** → Enter job description, select template
2. **Result** → View tailored CV with highlights

### Feedback Mode (3 steps)
1. **Input** → Enter job description
2. **Feedback** → Review analysis, select changes (collapsible sections)
3. **Result** → View CV with approved changes applied

## Core Architecture: Structured Changes

**Key Insight**: Instead of asking AI to output full HTML, we now:
1. **Parse CV to text** → Send smaller text representation to AI
2. **AI returns find/replace pairs** → Structured JSON, not HTML
3. **Apply changes programmatically** → 100% reliable highlighting

See `CV-CHANGE-SYSTEM.md` for full details.

## AI Integration

**Model**: `gemini-3-pro-preview`

**Temperature Settings**:
- Tailoring: 0.7 (creative rewriting)
- Feedback analysis: 0.5 (balanced)

**Environment Variable**: `VITE_GOOGLE_GENERATIVE_AI_API_KEY`

## Prompts Architecture

### `tailorCv.js`
Returns structured changes (not HTML):
```json
{
  "summary": "Added leadership language...",
  "changes": [
    { "section": "Profile", "find": "...", "replace": "..." }
  ]
}
```

### `feedbackCv.js`
Multi-perspective analysis with find/replace:
```json
{
  "overallScore": 75,
  "perspectives": { "content": {...}, "hr": {...}, "hiring": {...} },
  "items": [
    {
      "id": "imp-1",
      "type": "improvement",
      "priority": "high",
      "text": "What to improve",
      "find": "exact text from CV",
      "replace": "new improved text",
      "section": "Experience"
    }
  ]
}
```

## Change Highlighting System

- **Applied programmatically** by `changeApplier.js`
- **Wraps changes** in `<span class="cv-change-highlight">...</span>`
- **CSS auto-injection**: For custom CVs without highlight styles, CSS is automatically injected
- **Matching**: Handles exact, normalized (collapses whitespace/newlines), and fuzzy matching
- **Type-agnostic**: Detects changes by `find`/`replace` fields, not by type name
- **Toggle in UI**: Eye icon shows/hides highlights
- **Export**: `stripHighlights()` removes spans
- **CSS**: Coral background + underline, hidden on print

## Key UI Components

| Component | Purpose |
|-----------|---------|
| `CollapsibleSection` | Expandable feedback sections |
| `StrengthsList` | Compact chip-style strengths |
| `FeedbackItem` | Selectable item with toggle |
| `SteppedLoadingOverlay` | Progress during AI calls |
| `CVPreviewFull` | Result display with zoom |

## State Management

Key states in `App.jsx`:
- `flowStep`: 0 (input), 1 (feedback/result), 2 (final result)
- `activeMode`: 'tailor' | 'feedback'
- `feedback`: Analysis with `items[].approved` for selection
- `showHighlights`: Toggle for change visibility

## Key Files to Edit

| Task | File |
|------|------|
| Change CV template | `src/templates/baseCv.js` |
| Modify tailoring | `src/prompts/tailorCv.js` |
| Modify feedback | `src/prompts/feedbackCv.js` |
| Change replacement logic | `src/utils/changeApplier.js` |
| Change parsing logic | `src/utils/cvParser.js` |
| Update app UI/logic | `src/App.jsx` |
| Change styles | `src/styles/index.css` |
