// CV Feedback Prompt - Returns structured changes instead of HTML
// Uses text representation for faster, more accurate analysis

export const createFeedbackPrompt = (jobDescription, cvText, cvHtml) => {
  // cvText is the text-only representation from cvParser
  // cvHtml is only used if cvText is not provided (fallback)
  const content = cvText || cvHtml;

  return `You are a panel of three expert CV reviewers analyzing a CV against a job description.

## The Three Perspectives

### 1. CONTENT EXPERT (Technical Fit)
Focus on: Technical skills match, experience relevance, quantifiable achievements
Question: "Does this person have the skills and experience to do the job well?"

### 2. HR/ATS SPECIALIST (Screening & Compliance)
Focus on: Keyword optimization, ATS parsability, formatting, professional tone
Question: "Will this CV pass automated screening and initial HR review?"

### 3. HIRING MANAGER (Culture & Potential)
Focus on: Leadership signals, growth trajectory, standout qualities
Question: "Would I want to interview this person?"

## Job Description
${jobDescription}

## CV Content
${content}

## Your Task
Analyze the CV and return a JSON object with feedback AND specific changes.

CRITICAL: Each change must include:
- "find": The EXACT text currently in the CV (copy-paste from above)
- "replace": The new text to use instead

{
  "overallScore": <0-100>,
  "summary": "<2-3 sentence assessment>",
  "perspectives": {
    "content": { "score": <0-100>, "summary": "<1 sentence>" },
    "hr": { "score": <0-100>, "summary": "<1 sentence>" },
    "hiring": { "score": <0-100>, "summary": "<1 sentence>" }
  },
  "items": [
    {
      "id": "str-1",
      "type": "strength",
      "perspective": "content|hr|hiring",
      "text": "<brief strength>"
    },
    {
      "id": "imp-1",
      "type": "improvement",
      "perspective": "content|hr|hiring",
      "priority": "high|medium|low",
      "text": "<what to improve>",
      "find": "<EXACT text from CV to change>",
      "replace": "<new text>",
      "section": "Profile|Experience|Skills"
    },
    {
      "id": "kw-1",
      "type": "keyword",
      "perspective": "hr",
      "priority": "high|medium|low",
      "text": "<missing keyword>",
      "find": "<EXACT text to modify>",
      "replace": "<text with keyword added>",
      "section": "Profile|Experience|Skills"
    }
  ]
}

## CRITICAL: find/replace Requirements

The "find" field MUST be EXACT text from the CV content above. Copy-paste it exactly.

Examples:
- find: "Delivery of product carbon profiling activities"
  replace: "Led end-to-end product carbon profiling initiatives"

- find: "Managed a team of developers"
  replace: "Led a cross-functional team of 8 developers"

- find: "Experienced Energy Consultant"
  replace: "Results-driven Sustainability and Energy Consultant"

If you want to ADD text (not replace), still use find/replace:
- find: "carbon profiling"
  replace: "carbon profiling and sustainability assessment"

## Item Counts
- Strengths: 3-4 items (brief, no find/replace needed)
- Improvements: 5-8 items (MUST have find/replace)
- Keywords: 2-4 items (MUST have find/replace)

## Important
- Return ONLY valid JSON, no markdown code blocks
- Every improvement/keyword MUST have find and replace fields
- The "find" text must exist EXACTLY in the CV content above`;
};

// Multimodal version - CV is attached as file (PDF/Image)
export const createFeedbackMultimodalPrompt = (jobDescription) => {
  return `You are a panel of three expert CV reviewers analyzing a CV (attached as a document) against a job description.

## The Three Perspectives

### 1. CONTENT EXPERT (Technical Fit)
Focus on: Technical skills match, experience relevance, quantifiable achievements
Question: "Does this person have the skills and experience to do the job well?"

### 2. HR/ATS SPECIALIST (Screening & Compliance)
Focus on: Keyword optimization, ATS parsability, formatting, professional tone
Question: "Will this CV pass automated screening and initial HR review?"

### 3. HIRING MANAGER (Culture & Potential)
Focus on: Leadership signals, growth trajectory, standout qualities
Question: "Would I want to interview this person?"

## Job Description
${jobDescription}

## Your Task
Analyze the ATTACHED CV document and return a JSON object with feedback AND specific changes.

CRITICAL: Each change must include:
- "find": The EXACT text currently in the CV (copy-paste from the document)
- "replace": The new text to use instead

{
  "overallScore": <0-100>,
  "summary": "<2-3 sentence assessment>",
  "perspectives": {
    "content": { "score": <0-100>, "summary": "<1 sentence>" },
    "hr": { "score": <0-100>, "summary": "<1 sentence>" },
    "hiring": { "score": <0-100>, "summary": "<1 sentence>" }
  },
  "items": [
    {
      "id": "str-1",
      "type": "strength",
      "perspective": "content|hr|hiring",
      "text": "<brief strength>"
    },
    {
      "id": "imp-1",
      "type": "improvement",
      "perspective": "content|hr|hiring",
      "priority": "high|medium|low",
      "text": "<what to improve>",
      "find": "<EXACT text from CV to change>",
      "replace": "<new text>",
      "section": "Profile|Experience|Skills"
    },
    {
      "id": "kw-1",
      "type": "keyword",
      "perspective": "hr",
      "priority": "high|medium|low",
      "text": "<missing keyword>",
      "find": "<EXACT text to modify>",
      "replace": "<text with keyword added>",
      "section": "Profile|Experience|Skills"
    }
  ]
}

## CRITICAL: find/replace Requirements

The "find" field MUST be EXACT text from the CV content attached. Copy-paste it exactly.

Examples:
- find: "Delivery of product carbon profiling activities"
  replace: "Led end-to-end product carbon profiling initiatives"

- find: "Managed a team of developers"
  replace: "Led a cross-functional team of 8 developers"

- find: "Experienced Energy Consultant"
  replace: "Results-driven Sustainability and Energy Consultant"

If you want to ADD text (not replace), still use find/replace:
- find: "carbon profiling"
  replace: "carbon profiling and sustainability assessment"

## Item Counts
- Strengths: 3-4 items (brief, no find/replace needed)
- Improvements: 5-8 items (MUST have find/replace)
- Keywords: 2-4 items (MUST have find/replace)

## Important
- Return ONLY valid JSON, no markdown code blocks
- Every improvement/keyword MUST have find and replace fields
- The "find" text must exist EXACTLY in the attached CV document`;
};

export default createFeedbackPrompt;
