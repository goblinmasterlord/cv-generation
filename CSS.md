# CSS Structure - Table of Contents

Quick reference for the modular CSS architecture in `src/styles/`.

## File Structure

```
src/styles/
├── index.css                ← Entry point (imports all partials)
│
├── base/
│   ├── _variables.css      ← Design tokens (:root variables)
│   └── _reset.css          ← Reset, html/body/root base styles
│
├── layout/
│   ├── _app-flow.css       ← App shell, header, nav tabs, steps container, main
│   ├── _bottom-bar.css     ← Sticky action bar
│   └── _panels.css         ← Legacy panel classes
│
├── components/
│   ├── _step-indicator.css ← Progress steps
│   ├── _buttons.css        ← btn, btn--primary, btn--secondary, btn-group
│   ├── _inputs.css         ← input-section, textarea, char-count
│   ├── _loading.css        ← flow-loading, status, loading-overlay, empty-state
│   ├── _toast.css          ← Toast notifications
│   ├── _modal.css          ← CV modal + overlay
│   └── _zoom.css           ← Zoom controls (inline + floating)
│
├── features/
│   ├── _cv-preview.css     ← CV preview full + controls
│   ├── _feedback.css       ← Feedback panel, items, strengths, perspective cards
│   ├── _create.css         ← Contact grid, collapsible sections, source type
│   ├── _template-selector.css ← Base/Custom template toggle
│   ├── _file-upload.css    ← Drag/drop, preview, file-upload-zone
│   └── _interview.css      ← Strategy, question cards, STAR framework
│
├── utilities/
│   ├── _animations.css     ← Keyframes: fadeIn, fadeInUp, slideUp, spin, pulse
│   └── _helpers.css        ← visually-hidden, scrollbar, divider, loading-steps
│
└── responsive/
    └── _mobile.css         ← All @media queries (768px + 374px breakpoints)
```

## Key CSS Variables

```css
--color-bg-app: #1a1a1a       /* Main background */
--color-bg-panel: #252525     /* Panel/card background */
--color-accent: #D58F7C       /* Coral accent */
--color-sage: #61665C         /* Secondary green */
--font-sans: 'Geist'          /* Primary font */
--font-mono: 'Geist Mono'     /* Code/labels */
```

## Quick Find

| Need to style...       | File                                  |
|------------------------|---------------------------------------|
| Design tokens          | `base/_variables.css`                 |
| Buttons                | `components/_buttons.css`             |
| Form inputs            | `components/_inputs.css`              |
| Loading states         | `components/_loading.css`             |
| Feedback cards         | `features/_feedback.css`              |
| Interview prep         | `features/_interview.css`             |
| Mobile layout          | `responsive/_mobile.css`              |
| Toast messages         | `components/_toast.css`               |
| CV preview             | `features/_cv-preview.css`            |
| Bottom bar             | `layout/_bottom-bar.css`              |
| Create Flow UI         | `features/_create.css`                |
| Animations             | `utilities/_animations.css`           |
