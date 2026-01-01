# CSS Structure - Table of Contents

Quick reference for `src/styles/index.css` (~2898 lines).

## File Map

| Section | Lines | Description |
|---------|-------|-------------|
| **Variables & Reset** | 1-77 | CSS custom properties, box-sizing reset, html/body/root |
| **Layout - App Shell** | 79-132 | `.app-flow`, header, steps container, main (with scroll spacer) |
| **Step Indicator** | 134-200 | Progress dots and lines |
| **Flow Steps** | 201-247 | `.flow-step` variants (input, feedback, result) + `::after` spacer |
| **Bottom Bar** | 248-307 | Sticky action bar (right-aligned, fixed button widths) |
| **Flow Loading** | 309-389 | Stepped loading overlay |
| **CV Preview Full** | 391-469 | Result page CV display with zoom |
| **CV Modal** | 471-553 | CV preview modal/drawer |
| **Legacy App Classes** | 554-633 | `.app__header`, `.app__logo`, nav tabs |
| **Input Section** | 663-695 | Form labels, textareas, char count, last-of-type margin |
| **Textarea** | 697-726 | Textarea styles |
| **Buttons** | 737-809 | `.btn`, `.btn--primary`, `.btn--secondary`, btn groups |
| **CV Preview** | 811-825 | Generic CV preview container |
| **Status Indicator** | 827-874 | Loading/success/error dots |
| **Loading Overlay** | 876-912 | Generic spinner overlay |
| **Empty State** | 914-946 | Placeholder when no content |
| **Utilities** | 948-981 | `.visually-hidden`, scrollbar styles |
| **Animations** | 983-1013 | `fadeInUp`, `.animate-in` |
| **File Upload** | 1015-1124 | Drag/drop, image preview |
| **Source Type Selector** | 1126-1205 | Create mode input type buttons (compact row) |
| **Create Flow Sections** | 1206-1375 | Contact grid, collapsible sections, optional checkboxes |
| **Action Bar** | 1376-1397 | Primary/secondary action groups |
| **Template Selector** | 1399-1431 | Base/Custom template toggle |
| **Zoom Controls** | 1433-1485 | Floating zoom buttons |
| **Advanced Loading** | 1487-1564 | Step-by-step loading with icons |
| **Toast Notifications** | 1566-1636 | Bottom-center toast system |
| **Divider** | 1638-1661 | Horizontal rule with text |
| **Feedback Panel** | 1663-1804 | Score cards, sections, headers |
| **Strengths Chips** | 1805-1827 | Compact strength badges |
| **Feedback Items** | 1829-1948 | Selectable improvement cards |
| **Apply Bar** | 1950-1991 | Sticky apply changes bar |
| **Perspective Cards** | 1993-2061 | HR/Technical/Hiring scores |
| **Apply Loading** | 2063-2155 | Progress during apply |
| **Preview Controls** | 2157-2193 | Eye toggle, zoom inline |
| **Feedback Meta** | 2195-2241 | Priority badges, perspectives |
| **Mobile Responsive** | 2243-2898 | Premium mobile experience |

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
| Buttons | Buttons (737-809) |
| Form inputs | Input Section (663-695) |
| Loading states | Flow Loading (309-389) or Advanced Loading (1487-1564) |
| Feedback cards | Feedback Items (1829-1948) |
| Mobile layout | Mobile Responsive (2243-2898) |
| Toast messages | Toast Notifications (1566-1636) |
| CV preview | CV Preview Full (391-469) or CV Modal (471-553) |
| Bottom bar | Bottom Bar (248-307) |
| Create Flow UI | Create Flow Sections (1206-1375) |
