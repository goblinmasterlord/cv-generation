# CV Generator - Agent Starter Prompt

## Context
A React+Vite app that uses Gemini AI to custom-tailor CVs for job applications.

## Required Reading (Read ALL of these first)

Before doing anything, you **MUST read these files in full**:

| File | What You'll Learn |
|------|-------------------|
| **GEMINI.md** | Tech stack, project structure, state management, UI components, key files to edit |
| **DESIGN.md** | The "Sharp Editorial" aesthetic—typography, colors, spacing, anti-patterns |
| **CV-CHANGE-SYSTEM.md** | How the find/replace system works, matching algorithm, CSS injection |
| **CSS.md** | Table of contents for `index.css`—where to find specific styles |

These files contain critical context. Do not skim—read completely.

## UX Mandates (Always Follow)

- **Sharp Editorial Feel**: Premium tool (Linear, Notion). Crisp borders, Geist fonts, no rounded corners.
- **Optimistic UI**: Stepped loading states, not generic spinners.
- **No "AI Slop"**: No Inter/Roboto, no purple gradients, no generic shadows.

## Known Gotchas

- **Custom CVs**: Always test with both `baseCv.js` AND uploaded HTML files (e.g., `marton-cv-original-v3.html`).
- **Model name**: The API model is `gemini-3-pro-preview` (not `gemini-3-pro`).

## Code Architecture (Maintain This Structure)

> **CRITICAL**: Keep the modular architecture. Never let `App.jsx` grow beyond ~100 lines.

### File Organization Rules

| Type | Location | Guidelines |
|------|----------|------------|
| **Flow logic** | `features/<mode>/use<Mode>Flow.js` | All business logic + state for that mode |
| **Flow UI** | `features/<mode>/<Mode>Flow.jsx` | Container that uses the hook, renders steps |
| **Layout** | `components/layout/` | Header, BottomBar, StepIndicator — shared shells |
| **Forms** | `components/forms/` | Reusable form components (TemplateSelector, FileUpload) |
| **UI primitives** | `components/ui/` | Icons, Toast, LoadingOverlay, etc. |
| **Shared hooks** | `hooks/` | Cross-flow state (useCvState, useGeminiApi) |

### Anti-Patterns to Avoid

- ❌ **God components**: No component should exceed ~300 lines
- ❌ **Inline business logic**: Extract to hooks, not embedded in JSX
- ❌ **Prop drilling 3+ levels**: Use shared hooks instead
- ❌ **Duplicated patterns**: Extract to reusable components

## Documentation Maintenance

> **IMPORTANT**: When making significant changes, update the relevant `.md` files:

| Change Type | Update These Files |
|-------------|-------------------|
| New component/hook | `GEMINI.md` (Project Structure, Key Files) |
| New CSS section | `CSS.md` (add to table of contents) |
| Change flow/mode | `GEMINI.md` (UI Flow section) |
| Change AI prompts | `GEMINI.md` (Prompts Architecture) |
| Change design system | `DESIGN.md`, `CSS.md` |

## Next Steps

1. Read the four `.md` files listed above
2. Reply **"Ready."** when you understand the architecture
3. Await my specific feature request
