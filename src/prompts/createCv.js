// CV Creation Prompt - Generates structured CV data from user input
// Supports: screenshot (multimodal), HTML text, or raw experience text

export const createCvPrompt = (jobDescription, sourceText, userComments = '', options = {}) => {
  const {
    contactInfo = {},
    includeEducation = false,
    includeCertifications = false,
    educationText = '',
    certificationsText = ''
  } = options;

  const educationSection = includeEducation ? `
## Education Information
${educationText || 'Extract from source if available'}
` : '';

  const certificationsSection = includeCertifications ? `
## Certifications Information
${certificationsText || 'Extract from source if available'}
` : '';

  const educationOutputNote = includeEducation
    ? `- Include education section with details from the provided information`
    : `- OMIT the education section entirely from output (set to empty array)`;

  const certificationsOutputNote = includeCertifications
    ? `- Include certifications section with details from the provided information`
    : `- OMIT the certifications section entirely from output (set to empty array)`;

  return `You are an expert CV writer creating a professional CV from provided information.

## Your Mission
Transform the provided experience information into a polished, professional CV tailored for the target role.

## CRITICAL RULES - READ CAREFULLY

1. **ONLY USE PROVIDED INFORMATION** - Never invent, fabricate, or embellish:
   - No made-up metrics or percentages
   - No skills not mentioned in the source
   - No achievements not described
   - No certifications not listed
   
2. **PROFESSIONAL BUT NOT COCKY** - The tone should be:
   - Confident but not arrogant
   - Achievement-focused but honest
   - Professional without being robotic
   - Appealing to recruiters without overselling

3. **TAILORING APPROACH**:
   - Emphasize experience relevant to the target job
   - Use keywords from the job description naturally
   - Reorder sections to highlight most relevant experience first
   - Rephrase existing achievements to align with job requirements

## Contact Information (USE EXACTLY AS PROVIDED)
- Name: ${contactInfo.name || 'Extract from source'}
- Email: ${contactInfo.email || null}
- Phone: ${contactInfo.phone || null}
- Location: ${contactInfo.location || null}

## Target Job Description
${jobDescription}

## User's Additional Notes
${userComments || 'None provided.'}

## Source Information (Extract CV data from this)
${sourceText}
${educationSection}${certificationsSection}
## Your Task
Extract and structure the CV information as JSON. Return ONLY valid JSON, no markdown.

{
  "name": "${contactInfo.name || '<from source>'}",
  "title": "<professional title - tailored to job>",
  "profile": "<2-3 sentence professional summary tailored to the job>",
  "contact": {
    "phone": "${contactInfo.phone || 'null'}",
    "email": "${contactInfo.email || 'null'}",
    "location": "${contactInfo.location || 'null'}"
  },
  "education": [${includeEducation ? `
    {
      "school": "<institution name>",
      "degree": "<degree and field>",
      "year": "<graduation year>",
      "details": ["<relevant coursework or achievements>"]
    }
  ` : ''}],
  "certifications": [${includeCertifications ? `
    {
      "name": "<certification name>",
      "year": "<year obtained or 'ongoing'>"
    }
  ` : ''}],
  "skills": [
    "<skill 1 - most relevant to job first>",
    "<skill 2>",
    "<etc - max 5-6 skills>"
  ],
  "experience": [
    {
      "company": "<company name>",
      "location": "<city if known>",
      "role": "<job title>",
      "date": "<start - end, e.g. 'Jan 2022 – Present'>",
      "bullets": [
        "<achievement/responsibility 1 - action verb, specific>",
        "<achievement/responsibility 2>",
        "<4-6 bullets per role>"
      ],
      "additional": "<optional: extra context like teams led, tools used>"
    }
  ]
}

## Formatting Guidelines

- **Profile**: Write in third person, focus on value proposition
- **Experience bullets**: Start with action verbs (Led, Managed, Developed, Delivered)
- **Skills**: Include only skills evidenced in the source material
- **Order experience**: Most recent first, most relevant emphasized
${educationOutputNote}
${certificationsOutputNote}

## What to Do If Information Is Missing

- Use the contact info provided above EXACTLY (don't guess or change it)
- If no education details → provide empty details array
- If unclear dates → use approximate ("2020 – 2022")
- If job title unclear → infer from context, keep professional
- Never guess or invent missing information

Return ONLY the JSON object, no explanation or markdown formatting.`;
};

// Multimodal prompt for image input (screenshot of CV)
export const createCvMultimodalPrompt = (jobDescription, userComments = '', options = {}) => {
  const {
    contactInfo = {},
    includeEducation = false,
    includeCertifications = false
  } = options;

  const educationOutputNote = includeEducation
    ? `- Include education section if visible in the image`
    : `- OMIT the education section entirely from output (set to empty array)`;

  const certificationsOutputNote = includeCertifications
    ? `- Include certifications section if visible in the image`
    : `- OMIT the certifications section entirely from output (set to empty array)`;

  return `You are an expert CV writer. Analyze the CV image provided and create a professional CV tailored for the target role.

## Your Mission
Extract all information from the CV image and restructure it for the target job.

## CRITICAL RULES

1. **EXTRACT ONLY WHAT YOU SEE** - Read the image carefully:
   - Only include information visibly present in the CV
   - Don't add skills, achievements, or details not shown
   - If text is unclear, make reasonable interpretation but don't invent

2. **PROFESSIONAL BUT AUTHENTIC** - Keep the person's voice:
   - Don't over-polish or make generic
   - Maintain specific details and context
   - Tailor emphasis, not substance

3. **TAILORING FOR THE JOB**:
   - Reorder to emphasize relevant experience
   - Use job keywords where naturally applicable
   - Adjust professional title/summary for role fit

## Contact Information (USE EXACTLY AS PROVIDED)
- Name: ${contactInfo.name || 'Extract from image'}
- Email: ${contactInfo.email || 'Extract from image if visible'}
- Phone: ${contactInfo.phone || 'Extract from image if visible'}
- Location: ${contactInfo.location || 'Extract from image if visible'}

## Target Job Description
${jobDescription}

## User's Additional Notes
${userComments || 'None provided.'}

## Output Format
Return ONLY valid JSON (no markdown code blocks):

{
  "name": "${contactInfo.name || '<from image>'}",
  "title": "<professional title - tailored to job>",
  "profile": "<2-3 sentence summary tailored to job>",
  "contact": {
    "phone": "${contactInfo.phone || '<from image or null>'}",
    "email": "${contactInfo.email || '<from image or null>'}",
    "location": "${contactInfo.location || '<from image or null>'}"
  },
  "education": [${includeEducation ? `
    {
      "school": "<institution>",
      "degree": "<degree>",
      "year": "<year>",
      "details": ["<relevant details>"]
    }
  ` : ''}],
  "certifications": [${includeCertifications ? `{ "name": "<cert name>", "year": "<year>" }` : ''}],
  "skills": ["<skill 1>", "<skill 2>"],
  "experience": [
    {
      "company": "<company>",
      "location": "<location if known>",
      "role": "<job title>",
      "date": "<date range>",
      "bullets": ["<achievement 1>", "<achievement 2>"],
      "additional": "<optional extra context>"
    }
  ]
}

## Section Notes
${educationOutputNote}
${certificationsOutputNote}

Extract everything you can see, structure it professionally, and tailor the emphasis for the target role.`;
};

export default createCvPrompt;

