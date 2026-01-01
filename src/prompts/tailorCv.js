// CV Tailoring Prompt - Returns structured changes instead of HTML
// Uses text representation for faster, more accurate tailoring

export const createTailoringPrompt = (jobDescription, cvText, cvHtml, userComments = '') => {
   // cvText is the text-only representation from cvParser
   // cvHtml is only used if cvText is not provided (fallback)
   const content = cvText || cvHtml;

   return `You are an expert CV consultant. Tailor this CV to the job description by returning a list of specific text changes.

## Your Principles
- NEVER fabricate or exaggerate experience
- NEVER add skills or qualifications the person doesn't have
- Reorder and emphasize existing accomplishments relevant to the target role
- Integrate job keywords ONLY where genuinely applicable
- Maintain authentic voice - don't make it robotic

## Job Description
${jobDescription}

## User Instructions
${userComments || 'No additional instructions.'}

## CV Content
${content}

## Your Task
Return a JSON object with a list of changes to make. Each change needs:
- "find": The EXACT text currently in the CV (copy-paste from above)
- "replace": The new tailored text

{
  "summary": "<1-2 sentences explaining what you changed>",
  "changes": [
    {
      "section": "Profile|Experience|Skills|Certifications",
      "reason": "<why this change helps>",
      "find": "<EXACT text from CV>",
      "replace": "<new tailored text>"
    }
  ]
}

## What to Change

1. **Profile/Tagline**: Rewrite to highlight aspects most relevant to this role
2. **Experience Bullets**: Rephrase to emphasize transferable skills and add relevant keywords
3. **Skills**: Reorder to put most relevant first (if applicable)

## Examples

Profile change:
{
  "section": "Profile",
  "reason": "Emphasize sustainability expertise for this green energy role",
  "find": "Experienced Energy Consultant with a passion for driving meaningful climate action",
  "replace": "Results-driven Sustainability & Energy Consultant specializing in carbon reduction strategies and climate action"
}

Experience bullet change:
{
  "section": "Experience",
  "reason": "Add leadership emphasis for senior role",
  "find": "Delivery of product carbon profiling activities",
  "replace": "Led product carbon profiling initiatives across 15+ major projects"
}

Keyword integration:
{
  "section": "Experience", 
  "reason": "Add 'stakeholder management' keyword from job description",
  "find": "scoping, resource planning, scheduling",
  "replace": "scoping, resource planning, scheduling, and stakeholder management"
}

## CRITICAL Requirements
- "find" must be EXACT text from CV content above (copy-paste it)
- Make 8-15 strategic changes
- Focus on high-impact changes (profile and key experience bullets)
- Return ONLY valid JSON, no markdown blocks

## What NOT to Change
- Company names, job titles, dates
- Education details
- Contact information
- Factual achievements (e.g., percentages, metrics)`;
};

export default createTailoringPrompt;
