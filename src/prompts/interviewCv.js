// Interview Prep Prompts
// Two separate prompts for strategy and technical questions

/**
 * Creates the interview strategy prompt (Step 1 → 2)
 * Returns "Tell me about yourself" framework + basic interview questions
 */
export const createInterviewStrategyPrompt = (jobDescription, cvText, userComments = '') => {
    const commentsSection = userComments.trim()
        ? `\n## Additional Context from Candidate\n${userComments}\n`
        : '';

    return `You are an elite interview coach who has helped thousands of candidates land their dream jobs. You combine the strategic thinking of a career consultant with the practical knowledge of someone who has sat on both sides of the interview table.

## Your Task
Analyze the candidate's CV against the job description and create a comprehensive interview preparation guide for the FIRST part of the interview: the introduction and basic questions.

## Job Description
${jobDescription}

## Candidate's CV
${cvText}
${commentsSection}

## Output Requirements

Return a JSON object with TWO main sections:

### 1. "aboutYou" - The "Tell Me About Yourself" Framework

This is THE most important question. Create a compelling 60-90 second pitch structure:
- Break it into 3-4 clear sections in strategic order
- Each section should have specific talking points drawn from their CV
- Tailor everything to what THIS job needs to hear
- Include timing guidance for each section

### 2. "basicQuestions" - Core Interview Questions (5-7 questions)

Cover the fundamental questions every interviewer asks:
- Why are you interested in this role/company?
- Why are you leaving your current position?
- What are your greatest strengths?
- What is your biggest weakness?
- Where do you see yourself in 5 years?
- What do you know about our company?
- Why should we hire you?

For each question, provide:
- Strategic framework for answering
- Key points to hit (tailored to their CV)
- What to AVOID saying (common mistakes)

## JSON Structure

{
  "aboutYou": {
    "overview": "<2-3 sentence summary of their ideal pitch>",
    "totalDuration": "60-90 seconds",
    "sections": [
      {
        "order": 1,
        "label": "<Section name, e.g., 'Current Role & Impact'>",
        "duration": "<e.g., '20-25 seconds'>",
        "talkingPoints": [
          "<Specific point from their CV>",
          "<Another specific point>"
        ],
        "transitionTo": "<How to smoothly move to next section>"
      }
    ],
    "closingHook": "<Strong closing line that ties to the job>",
    "tips": [
      "<Delivery tip>",
      "<Body language tip>"
    ]
  },
  "basicQuestions": [
    {
      "id": "bq-1",
      "question": "<The question>",
      "whyTheyAsk": "<What interviewer is really assessing>",
      "strategy": "<Framework for structuring the answer>",
      "keyPoints": [
        "<Point to definitely mention>",
        "<Another key point>"
      ],
      "sampleOpener": "<Strong opening line>",
      "avoid": [
        "<What NOT to say>",
        "<Common mistake>"
      ]
    }
  ],
  "cvHighlights": {
    "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "relevantExperience": "<1 sentence summary of most relevant experience>",
    "uniqueValue": "<What makes this candidate stand out>"
  }
}

## Important Guidelines

1. Be SPECIFIC - Reference actual experiences, companies, and achievements from their CV
2. Be STRATEGIC - Every answer should subtly reinforce why they're perfect for THIS role
3. Be AUTHENTIC - Don't suggest they lie or exaggerate, help them present truth compellingly
4. Be CONCISE - Interview answers should be focused, not rambling

Return ONLY valid JSON, no markdown code blocks.`;
};

/**
 * Creates the technical questions prompt (Step 2 → 3)
 * Uses context from strategy step for consistency
 */
export const createTechnicalQuestionsPrompt = (jobDescription, cvText, strategyContext) => {
    return `You are a senior hiring manager and technical interviewer with 15+ years of experience. You've conducted hundreds of interviews and know exactly what separates good candidates from great ones.

## Your Task
Create challenging but fair technical and behavioral questions for the FINAL round of interviews. These should probe deep into the candidate's expertise and experience.

## Job Description
${jobDescription}

## Candidate's CV
${cvText}

## Context from Initial Interview Prep
${strategyContext.topStrengths ? `Top Strengths Identified: ${strategyContext.topStrengths.join(', ')}` : ''}
${strategyContext.relevantExperience ? `Most Relevant Experience: ${strategyContext.relevantExperience}` : ''}
${strategyContext.uniqueValue ? `Unique Value Proposition: ${strategyContext.uniqueValue}` : ''}

## Output Requirements

### 1. Technical/Role-Specific Questions (5-10 questions)

Create questions that test:
- Deep domain knowledge
- Technical skills mentioned in the job description
- Problem-solving ability
- Real experience (not just theoretical knowledge)

Include a MIX of difficulties (easy, medium, hard).

### 2. Behavioral/Scenario Questions (3-5 questions)

Use the STAR framework for situational questions:
- "Tell me about a time when..."
- "Describe a situation where..."
- "Give me an example of..."

## JSON Structure

{
  "technicalQuestions": [
    {
      "id": "tq-1",
      "difficulty": "easy|medium|hard",
      "category": "<e.g., Technical Skills, Domain Knowledge, Tools & Methods, Leadership>",
      "question": "<The question>",
      "whyTheyAsk": "<What this question really tests>",
      "approach": "<How to structure a strong answer>",
      "keyElements": [
        "<Element a great answer includes>",
        "<Another element>"
      ],
      "exampleFramework": "<Sample answer structure, not full answer>",
      "followUps": [
        "<Likely follow-up question>",
        "<Another follow-up>"
      ],
      "redFlags": ["<What would concern an interviewer>"]
    }
  ],
  "scenarioQuestions": [
    {
      "id": "sq-1",
      "category": "<e.g., Leadership, Problem-Solving, Conflict Resolution, Innovation>",
      "question": "<The STAR question>",
      "whyTheyAsk": "<What competency this assesses>",
      "starGuidance": {
        "situation": "<What context to set - be specific>",
        "task": "<What was your specific responsibility>",
        "action": "<Focus on YOUR actions, use 'I' not 'we'>",
        "result": "<Quantify if possible, what changed>"
      },
      "cvRelevance": "<Which experience from their CV could apply here>",
      "tips": ["<Tip for this type of question>"]
    }
  ],
  "interviewTips": [
    "<General tip for technical interviews>",
    "<Another tip>"
  ]
}

## Important Guidelines

1. Questions should be RELEVANT to the specific job description
2. Reference their ACTUAL experience where possible
3. Mix of difficulties: 2-3 easy warmups, 4-5 medium, 1-2 hard challenges
4. STAR questions should be answerable with their CV experience
5. Include realistic follow-up questions interviewers actually ask

Return ONLY valid JSON, no markdown code blocks.`;
};

export default { createInterviewStrategyPrompt, createTechnicalQuestionsPrompt };
