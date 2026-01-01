// CV Apply Changes Prompt - Applies approved items with change highlighting
// More aggressive approach: explicitly list each change with before/after

export const createApplyPrompt = (approvedItems, cvHtml, highlightChanges = true) => {
  const changes = approvedItems
    .filter(item => item.action)
    .map((item, i) => {
      let change = `\n### CHANGE ${i + 1} of ${approvedItems.length}`
      change += `\nSection: ${item.section || 'General'}`
      change += `\nType: ${item.type || 'improvement'}`
      change += `\nWhat to do: ${item.action}`
      if (item.currentText) {
        change += `\nFind text: "${item.currentText}"`
      }
      if (item.text) {
        change += `\nContext: ${item.text}`
      }
      return change
    })
    .join('\n');

  return `You are a CV editor. You MUST apply ALL ${approvedItems.length} changes listed below. Do not skip any.

## YOUR MISSION
Apply EXACTLY ${approvedItems.length} changes to this CV. Each change MUST be made. Each modification MUST be wrapped in a highlight span.

## THE ${approvedItems.length} CHANGES TO APPLY
${changes}

## THE CV TO MODIFY

${cvHtml}

## HOW TO APPLY EACH CHANGE

1. READ the change instruction carefully
2. SEARCH the CV HTML for relevant text (search for keywords, not exact section names)
3. MAKE the modification
4. WRAP the changed text: <span class="cv-change-highlight">changed text</span>

## EXAMPLES

Example 1 - Adding a word:
- Instruction: "Add 'cross-functional' before 'team'"
- Before: <li>Managed a team of 5</li>
- After: <li>Managed a <span class="cv-change-highlight">cross-functional</span> team of 5</li>

Example 2 - Rewriting text:
- Instruction: "Start with 'Led' instead of 'Delivery of'"
- Before: <li>Delivery of product carbon profiling activities</li>
- After: <li><span class="cv-change-highlight">Led product carbon profiling activities</span></li>

Example 3 - Adding keyword:
- Instruction: "Add 'sustainability' to the profile"
- Before: <p class="tagline">Experienced Energy Consultant...</p>
- After: <p class="tagline">Experienced <span class="cv-change-highlight">Sustainability</span> and Energy Consultant...</p>

## CRITICAL REQUIREMENTS

1. Apply ALL ${approvedItems.length} changes - check each one off mentally
2. Every modification gets a highlight span
3. Search by CONTENT, not by class names (the CV may have different HTML structure)
4. Return the COMPLETE HTML document
5. NO markdown, NO explanations, just the HTML

## VERIFICATION

Before returning, count your highlight spans. You should have approximately ${approvedItems.length} spans (one per change, though some changes might need multiple spans).

If you applied fewer than ${approvedItems.length} changes, GO BACK and apply the ones you missed.

Return the complete modified HTML starting with <!DOCTYPE html>`;
};

export default createApplyPrompt;
