# CV Change System - Technical Documentation

This document explains how the structured CV change system works for programmatic modification with reliable highlighting.

## Overview

Instead of asking AI to output modified HTML (unreliable), we:
1. Parse CV HTML to text representation
2. Ask AI for structured find/replace pairs
3. Apply changes programmatically with highlighting

## Files Involved

```
src/
├── utils/
│   ├── cvParser.js       # HTML → Text extraction
│   └── changeApplier.js  # Find/replace with highlighting
├── prompts/
│   ├── tailorCv.js       # Returns { changes: [...] }
│   └── feedbackCv.js     # Returns { items: [...] } with find/replace
└── App.jsx               # Orchestrates the flow
```

---

## 1. CV Parser (`src/utils/cvParser.js`)

### Purpose
Extracts text content from CV HTML for AI analysis. Smaller input = faster, more accurate responses.

### Key Functions

```javascript
// Parse HTML to structured data
parseCvToText(html) → {
  profile: { text, originalText },
  experience: [{ company, role, date, bullets: [...] }],
  skills: [...],
  certifications: [...],
  projects: [...]
}

// Generate text representation for AI
generateTextRepresentation(parsed) → string
```

### Output Format (sent to AI)
```
## PROFILE
Results-driven Sustainability Consultant...

## EXPERIENCE

### BAE Systems - Energy Consultant (Dec 2022 – Present)
• Delivery of product carbon profiling activities
• Management of profiling activities; scoping, resource planning...

## SKILLS
• Bilingual (Hungarian & English)
• Full UK Driver's Licence
```

---

## 2. Change Applier (`src/utils/changeApplier.js`)

### Purpose
Applies find/replace changes to HTML with highlighting. Handles whitespace normalization and fuzzy matching.

### Key Functions

```javascript
// Apply array of changes to HTML
applyChanges(html, changes) → {
  html: string,          // Modified HTML
  summary: { applied, failed, total },
  results: [{ ...change, status, reason }]
}

// Remove highlight spans for export
stripHighlights(html) → string

// Check if HTML has highlights
hasHighlights(html) → boolean
```

### Change Format
```javascript
{
  find: "Delivery of product carbon profiling activities",
  replace: "Led end-to-end product carbon profiling initiatives"
}
```

### How Matching Works

1. **Exact match** - Try direct `indexOf(find)`
2. **Normalized match** - Collapse whitespace/newlines, map positions back to original HTML
3. **Fuzzy match** - Try progressively shorter prefixes (60, 40, 30, 20 chars) and extend

The matcher handles text spanning multiple lines with embedded newlines and maps positions back to the original HTML accurately.

### Change Type Detection

The applier accepts changes with any `type` value (e.g., `improvement`, `keyword`, `replace`). It detects changes by checking for the presence of `find` and `replace` fields, not by type name.

### Highlighting

Every replacement is wrapped:
```html
<span class="cv-change-highlight">new text</span>
```

### CSS Injection for Custom CVs

When applying changes to a custom CV that doesn't have the highlight styles, the change applier automatically **injects the highlight CSS** into the `<head>` section:

```css
.cv-change-highlight {
    background: rgba(213, 143, 124, 0.25);
    border-bottom: 2px solid #D58F7C;
    padding: 0 2px;
}
```

This ensures highlights are visible regardless of which CV template is used.

---

## 3. Tailoring Prompt (`src/prompts/tailorCv.js`)

### Input
```javascript
createTailoringPrompt(jobDescription, cvText, cvHtml, userComments)
```

### Output (JSON)
```json
{
  "summary": "Added leadership emphasis and sustainability keywords",
  "changes": [
    {
      "section": "Profile",
      "reason": "Emphasize sustainability for this role",
      "find": "Experienced Energy Consultant",
      "replace": "Results-driven Sustainability & Energy Consultant"
    },
    {
      "section": "Experience",
      "reason": "Add leadership language",
      "find": "Delivery of product carbon profiling activities",
      "replace": "Led product carbon profiling initiatives across 15+ projects"
    }
  ]
}
```

---

## 4. Feedback Prompt (`src/prompts/feedbackCv.js`)

### Input
```javascript
createFeedbackPrompt(jobDescription, cvText, cvHtml)
```

### Output (JSON)
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
      "id": "str-1",
      "type": "strength",
      "text": "Strong carbon profiling experience"
    },
    {
      "id": "imp-1",
      "type": "improvement",
      "priority": "high",
      "text": "Add leadership language",
      "find": "Delivery of product carbon profiling",
      "replace": "Led product carbon profiling initiatives",
      "section": "Experience"
    }
  ]
}
```

---

## 5. App.jsx Flow

### Tailor Mode
```javascript
handleTailor():
  1. parseCvToText(currentCv)
  2. generateTextRepresentation(parsed)
  3. createTailoringPrompt(...) → AI call
  4. Parse JSON response → changes array
  5. applyChangesToHtml(currentCv, changes)
  6. setCurrentCv(result.html)
```

### Feedback Mode
```javascript
handleFeedback():
  1. parseCvToText(currentCv)
  2. generateTextRepresentation(parsed)
  3. createFeedbackPrompt(...) → AI call
  4. Parse JSON → items with find/replace
  5. Display in UI, user selects items

handleApplyChanges():
  1. Filter approved items that have both find AND replace fields
  2. applyChangesToHtml(currentCv, approvedItems)  // NO AI CALL!
  3. setCurrentCv(result.html)
```

---

## Edge Cases Handled

### Whitespace Normalization
```
HTML: "Managed  a\n  team"
Find: "Managed a team"
✓ Matches via normalized comparison
```

### Multi-line Text
Text spanning multiple lines with embedded newlines is correctly matched and replaced as a single unit.

### HTML Tag Boundaries
The matcher only searches text nodes, not HTML tags.

### Failed Matches
If text not found → logged in `results` array with `status: 'failed'`
UI shows: "Applied 4 changes (1 could not be found)"

### Custom CV Templates
CSS styles are automatically injected if the CV doesn't have `.cv-change-highlight` styles.

---

## CSS for Highlights

Built into `baseCv.js` and **auto-injected** for custom CVs:
```css
.cv-change-highlight {
  background: rgba(213, 143, 124, 0.25);
  border-bottom: 2px solid #D58F7C;
  padding: 0 2px;
}

@media print {
  .cv-change-highlight {
    background: none !important;
    border-bottom: none !important;
  }
}
```

---

## Benefits of This Approach

| Old Approach | New Approach |
|--------------|--------------|
| AI outputs full HTML | AI outputs small JSON |
| Highlights often missing | 100% reliable highlights |
| Custom CVs often broken | Works with any HTML structure |
| ~8000 tokens output | ~500 tokens output |
| Hard to debug | Easy to trace each change |
| Type-dependent logic | Type-agnostic (checks find/replace fields) |

