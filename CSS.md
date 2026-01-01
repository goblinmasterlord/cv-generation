# CSS Structure - Table of Contents

Quick reference for `src/styles/index.css` (~2200 lines).

## File Map

| Section | Lines | Description |
|---------|-------|-------------|
| **Variables & Reset** | 1-77 | CSS custom properties, box-sizing reset, html/body/root |
| **Layout - App Shell** | 79-132 | `.app-flow`, header, steps container, main |
| **Step Indicator** | 134-198 | Progress dots and lines |
| **Flow Steps** | 200-234 | `.flow-step` variants (input, feedback, result) |
| **Bottom Bar** | 236-282 | Sticky action bar at bottom |
| **Flow Loading** | 284-364 | Stepped loading overlay |
| **CV Preview Full** | 366-444 | Result page CV display with zoom |
| **CV Modal** | 446-534 | CV preview modal/drawer |
| **Legacy App Classes** | 536-608 | `.app__header`, `.app__logo`, nav tabs |
| **Input Section** | 640-704 | Form labels, textareas, char count |
| **Buttons** | 706-779 | `.btn`, `.btn--primary`, `.btn--secondary` |
| **Status Indicator** | 800-844 | Loading/success/error dots |
| **Loading Overlay** | 846-882 | Generic spinner overlay |
| **Empty State** | 884-916 | Placeholder when no content |
| **Utilities** | 918-950 | `.visually-hidden`, scrollbar styles |
| **Animations** | 952-982 | `fadeInUp`, `.animate-in` |
| **File Upload** | 984-1094 | Drag/drop, image preview |
| **Source Type Selector** | 1096-1162 | Create mode input type buttons |
| **Action Bar** | 1172-1192 | Primary/secondary action groups |
| **Template Selector** | 1194-1228 | Base/Custom template toggle |
| **Zoom Controls** | 1230-1282 | Floating zoom buttons |
| **Advanced Loading** | 1284-1360 | Step-by-step loading with icons |
| **Toast Notifications** | 1362-1432 | Bottom-center toast system |
| **Divider** | 1434-1458 | Horizontal rule with text |
| **Feedback Panel** | 1460-1604 | Score cards, sections, headers |
| **Strengths Chips** | 1600-1622 | Compact strength badges |
| **Feedback Items** | 1624-1744 | Selectable improvement cards |
| **Apply Bar** | 1746-1788 | Sticky apply changes bar |
| **Perspective Cards** | 1790-1858 | HR/Technical/Hiring scores |
| **Apply Loading** | 1860-1950 | Progress during apply |
| **Preview Controls** | 1952-1988 | Eye toggle, zoom inline |
| **Feedback Meta** | 1990-2036 | Priority badges, perspectives |
| **Mobile Responsive** | 2038-2196 | `@media (max-width: 900px)` |

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

| Need to style... | Look at section |
|------------------|-----------------|
| Buttons | Buttons (706-779) |
| Form inputs | Input Section (640-704) |
| Loading states | Flow Loading (284-364) or Advanced Loading (1284-1360) |
| Feedback cards | Feedback Items (1624-1744) |
| Mobile layout | Mobile Responsive (2038-2196) |
| Toast messages | Toast Notifications (1362-1432) |
| CV preview | CV Preview Full (366-444) or CV Modal (446-534) |
