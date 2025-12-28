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
- **AI**: Google Gemini 3 Flash Preview (`gemini-3-flash-preview`)
- **Styling**: Vanilla CSS (Sharp Editorial aesthetic from DESIGN.md)
- **Fonts**: Geist Sans / Geist Mono

## Project Structure

```
cv-generator/
├── index.html              # Entry point (loads Geist fonts)
├── package.json            # Dependencies: react, ai, @ai-sdk/google
├── vite.config.js          # Standard Vite + React config
├── .env                    # API key: VITE_GOOGLE_GENERATIVE_AI_API_KEY
│
├── src/
│   ├── main.jsx            # React entry
│   ├── App.jsx             # Main app - split panel layout
│   │
│   ├── styles/
│   │   └── index.css       # Full design system (dark theme, coral accents)
│   │
│   ├── templates/
│   │   └── baseCv.js       # Lilla's base CV as HTML string
│   │                        # Contains data-tailorable attributes for AI
│   │
│   └── prompts/
│       └── tailorCv.js     # AI prompt for CV tailoring
│                           # Principles: honest, no exaggeration, genuine tone
│
├── DESIGN.md               # Design guidelines (Sharp Editorial aesthetic)
└── GEMINI.md               # This file
```

## Core Features

1. **Base CV Template**: HTML/CSS CV for Lilla Mocsonoky (Energy & Carbon Consultant)
2. **Job Description Input**: Paste job posting to analyze
3. **AI Tailoring**: Gemini rewrites profile, reorders bullets, integrates keywords
4. **Template Selection**: Use base template or upload custom HTML
5. **Export**: Download as HTML or Print to PDF

## AI Integration

**API Call** (in `App.jsx`):
```javascript
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
  })
})
```

**Environment Variable**: `VITE_GOOGLE_GENERATIVE_AI_API_KEY`

## CV Template Structure

The base CV uses `data-tailorable` attributes to mark editable sections:
- `data-tailorable="profile"` - Profile/summary paragraph
- `data-tailorable="experience"` - Job items (can reorder bullets)
- `data-tailorable="certifications"` - Certification list
- `data-tailorable="skills"` - Skills list

## Design System

CSS Variables (defined in `src/styles/index.css`):
- Dark app background: `#1a1a1a`
- Coral accent: `#D58F7C`
- Sage green: `#61665C`
- Fonts: Geist Sans (body), Geist Mono (code/labels)
- No border-radius anywhere (Sharp Editorial)

## Prompt Philosophy

From `src/prompts/tailorCv.js`:
- **Never fabricate** experience or skills
- **Reorder** existing content to highlight relevance
- **Integrate keywords** only where genuinely applicable
- **Maintain authentic voice** - not robotic or template-like
- **Confident but not cocky** tone

## Key Files to Edit

| Task | File |
|------|------|
| Change CV content | `src/templates/baseCv.js` |
| Modify AI behavior | `src/prompts/tailorCv.js` |
| Update app UI | `src/App.jsx` |
| Change styles | `src/styles/index.css` |
| Design guidelines | `DESIGN.md` |
