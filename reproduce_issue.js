
const html = `<li><b>Operational Efficiency:</b> Architected automation workflows.</li>`;
const findText = "Operational Efficiency: Architected automation workflows.";
const replaceText = "New Strategy: Implemented new things.";

// Mocking the normalization and find logic from changeApplier.js to demonstrate the issue

function normalizeForSearch(text) {
    return text.replace(/\s+/g, ' ').trim();
}

function findNormalizedPosition(html, normalizedSearch) {
    let textBuffer = '';
    let textToHtmlMap = [];
    let inTag = false;

    for (let i = 0; i < html.length; i++) {
        const char = html[i];
        if (char === '<') { inTag = true; continue; }
        if (char === '>') { inTag = false; continue; }

        if (!inTag) {
            textBuffer += char;
            textToHtmlMap.push(i);
        }
    }

    const textIndex = textBuffer.indexOf(normalizedSearch);
    if (textIndex === -1) return { index: -1, length: 0 };

    const htmlStartIndex = textToHtmlMap[textIndex];
    const htmlEndIndex = textToHtmlMap[textIndex + normalizedSearch.length - 1];

    // Important: Normalized find doesn't "see" the tags, so it maps to the first and last text chars
    // 'Operational' starts at index 7 (after <b>)
    // '.' ends at index 68

    return { index: htmlStartIndex, length: htmlEndIndex - htmlStartIndex + 1 };
}

const pos = findNormalizedPosition(html, findText);
console.log('Match Position:', pos);

const before = html.substring(0, pos.index);
const match = html.substring(pos.index, pos.index + pos.length);
const after = html.substring(pos.index + pos.length);

console.log('--- Current Logic Break ---');
console.log('Before:', before); // Expect: <li><b>
console.log('Match :', match);  // Expect: Operational Efficiency:</b> Architected...
console.log('After :', after);  // Expect: </li>

const newHtml = before + `<span class="highlight">${replaceText}</span>` + after;
console.log('Result:', newHtml);
// Expected Result: <li><b><span ...>...</span></li>
// The <b> is never closed!

console.log('--- Proposed Fix Logic ---');

// Check for unbalanced tags in the match
function expandToBalancedTags(html, start, end) {
    const matchStr = html.substring(start, start + end); // wait, length vs end index
    // fix args: start, length
    const selection = html.substring(start, start + end);

    // Simple checking for </b> without <b>
    const stack = [];
    const unbalancedClosing = [];

    const tagRegex = /<\/?\w+[^>]*>/g;
    let tagMatch;

    // We only care about simple formatting tags for now? 
    // Or we should be generic.

    while ((tagMatch = tagRegex.exec(selection)) !== null) {
        const tag = tagMatch[0];
        if (tag.startsWith('</')) {
            const tagName = tag.substring(2, tag.length - 1);
            if (stack.length > 0 && stack[stack.length - 1] === tagName) {
                stack.pop();
            } else {
                unbalancedClosing.push(tagName);
            }
        } else if (!tag.endsWith('/>')) { // Ignore self-closing
            const tagName = tag.match(/<(\w+)/)[1];
            stack.push(tagName);
        }
    }

    console.log('Unbalanced Closing Tags in Match:', unbalancedClosing);

    let newStart = start;
    let newLength = end;

    if (unbalancedClosing.length > 0) {
        // Search backwards for the opener
        // Optimization: just look for the first match?
        // Logic: The closest one?
        // If we have </b>, we need the nearest <b> before start.

        const beforeStr = html.substring(0, start);
        const tagToFind = unbalancedClosing[0]; // simplistic handling of first one

        const openTagRegex = new RegExp(`<${tagToFind}[^>]*>`, 'gi');
        let lastOpenIndex = -1;
        let match;
        while ((match = openTagRegex.exec(beforeStr)) !== null) {
            lastOpenIndex = match.index;
        }

        if (lastOpenIndex !== -1) {
            console.log(`Found opening <${tagToFind}> at index ${lastOpenIndex}`);
            // Check if this opener is already closed? 
            // That would require parsing everything from there to start.
            // But usually, if it's "text flow", it's likely the one.

            // Assume it is the one.
            const extraLength = start - lastOpenIndex;
            newStart = lastOpenIndex;
            newLength = end + extraLength;
        }
    }

    return { index: newStart, length: newLength };
}

const expanded = expandToBalancedTags(html, pos.index, pos.length);
console.log('Expanded Position:', expanded);

const expandedBefore = html.substring(0, expanded.index);
const expandedMatch = html.substring(expanded.index, expanded.index + expanded.length);
const expandedAfter = html.substring(expanded.index + expanded.length);

console.log('Exp Before:', expandedBefore);
console.log('Exp Match :', expandedMatch);
console.log('Exp After :', expandedAfter);

const fixedHtml = expandedBefore + `<span class="highlight">${replaceText}</span>` + expandedAfter;
console.log('Fixed Result:', fixedHtml);
