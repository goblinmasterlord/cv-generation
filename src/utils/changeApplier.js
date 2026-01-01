// Change Applier Utility
// Applies structured changes to CV HTML with highlighting
// Handles whitespace normalization and fuzzy matching

/**
 * Apply a list of changes to CV HTML
 * @param {string} html - The original CV HTML
 * @param {Array} changes - Array of change objects
 * @returns {object} { html: string, results: Array }
 */
export function applyChanges(html, changes) {
    let modifiedHtml = html;
    const results = [];

    for (const change of changes) {
        // Check if this is a replacement change (has find and replace fields)
        // This handles: type='replace', type='improvement', type='keyword', or no type
        const isReplaceChange = change.find && change.replace;
        const isInsertChange = change.type === 'insert' && change.anchor && change.content;

        if (isReplaceChange) {
            const result = applyReplaceChange(modifiedHtml, change);
            modifiedHtml = result.html;
            results.push({
                ...change,
                status: result.success ? 'applied' : 'failed',
                reason: result.reason
            });
        } else if (isInsertChange) {
            const result = applyInsertChange(modifiedHtml, change);
            modifiedHtml = result.html;
            results.push({
                ...change,
                status: result.success ? 'applied' : 'failed',
                reason: result.reason
            });
        } else {
            results.push({
                ...change,
                status: 'skipped',
                reason: 'Missing find/replace or anchor/content fields'
            });
        }
    }

    const applied = results.filter(r => r.status === 'applied').length;
    const failed = results.filter(r => r.status === 'failed').length;

    // Inject highlight CSS if any changes were applied and it's not already in the HTML
    if (applied > 0 && !modifiedHtml.includes('.cv-change-highlight')) {
        const highlightCSS = `
<style>
/* CV Change Highlight - Injected by Change Applier */
.cv-change-highlight {
    background: rgba(213, 143, 124, 0.25);
    border-bottom: 2px solid #D58F7C;
    padding: 0 2px;
    transition: background 0.3s ease;
}
@media print {
    .cv-change-highlight {
        background: none !important;
        border-bottom: none !important;
    }
}
</style>`;

        // Insert before </head> or at the beginning if no </head>
        if (modifiedHtml.includes('</head>')) {
            modifiedHtml = modifiedHtml.replace('</head>', highlightCSS + '</head>');
        } else if (modifiedHtml.includes('<body')) {
            modifiedHtml = modifiedHtml.replace('<body', highlightCSS + '<body');
        } else {
            modifiedHtml = highlightCSS + modifiedHtml;
        }
    }

    return {
        html: modifiedHtml,
        summary: { applied, failed, total: changes.length },
        results
    };
}

/**
 * Apply a replace change
 */
function applyReplaceChange(html, change) {
    const { find, replace } = change;

    if (!find || !replace) {
        return { html, success: false, reason: 'Missing find or replace text' };
    }

    // Normalize the find text for matching
    const normalizedFind = normalizeForSearch(find);

    // Try exact match first
    let position = findTextPosition(html, find);
    let matchType = 'exact';

    // If not found, try normalized match
    if (position.index === -1) {
        position = findNormalizedPosition(html, normalizedFind);
        matchType = 'normalized';
    }

    // If still not found, try fuzzy match with longer prefix
    if (position.index === -1) {
        position = findFuzzyPosition(html, normalizedFind);
        matchType = 'fuzzy';
    }

    if (position.index === -1) {
        return { html, success: false, reason: `Text not found: "${find.substring(0, 50)}..."` };
    }

    // CRITICAL FIX: Expand selection to include balanced tags matched text spans across closing tags
    // This prevents issues where we replace "Text</b>" but leave "<b>" behind
    position = expandSelectionToBalancedTags(html, position);

    console.log('[ChangeApplier] SUCCESS (' + matchType + '):', {
        index: position.index,
        length: position.length,
        matchedText: html.substring(position.index, position.index + Math.min(position.length, 50))
    });

    // Create highlighted replacement
    const highlighted = `<span class="cv-change-highlight">${replace}</span>`;

    // Replace at the found position
    const before = html.substring(0, position.index);
    const after = html.substring(position.index + position.length);
    const newHtml = before + highlighted + after;

    return { html: newHtml, success: true };
}

/**
 * Apply an insert change (add new content after anchor)
 */
function applyInsertChange(html, change) {
    const { anchor, content, position = 'after' } = change;

    if (!anchor || !content) {
        return { html, success: false, reason: 'Missing anchor or content' };
    }

    // Find the anchor text
    const anchorPos = findTextPosition(html, anchor);

    if (anchorPos.index === -1) {
        // Try normalized search
        const normalizedAnchor = normalizeForSearch(anchor);
        const normalizedPos = findNormalizedPosition(html, normalizedAnchor);
        if (normalizedPos.index === -1) {
            return { html, success: false, reason: `Anchor not found: "${anchor.substring(0, 50)}..."` };
        }
        anchorPos.index = normalizedPos.index;
        anchorPos.length = normalizedPos.length;
    }

    // Find the end of the containing element (look for </li>, </p>, etc.)
    const afterAnchor = html.substring(anchorPos.index + anchorPos.length);
    const closingTagMatch = afterAnchor.match(/^[^<]*(<\/\w+>)/);

    if (!closingTagMatch) {
        return { html, success: false, reason: 'Could not find element boundary' };
    }

    // Determine the element type and create appropriate wrapper
    const closingTag = closingTagMatch[1];
    const tagName = closingTag.match(/<\/(\w+)>/)[1];

    // Create the new content wrapped in matching tags and highlighted
    const highlighted = `<span class="cv-change-highlight">${content}</span>`;
    let newElement = '';

    if (tagName === 'li') {
        newElement = `\n<li>${highlighted}</li>`;
    } else if (tagName === 'p') {
        newElement = `\n<p>${highlighted}</p>`;
    } else {
        // Default: add as text with separator
        newElement = `, ${highlighted}`;
    }

    // Find insertion point (after closing tag)
    const insertPoint = anchorPos.index + anchorPos.length + afterAnchor.indexOf(closingTag) + closingTag.length;

    const before = html.substring(0, insertPoint);
    const after = html.substring(insertPoint);
    const newHtml = before + newElement + after;

    return { html: newHtml, success: true };
}

/**
 * Find exact text position in HTML
 */
function findTextPosition(html, searchText) {
    const index = html.indexOf(searchText);
    if (index !== -1) {
        return { index, length: searchText.length };
    }
    return { index: -1, length: 0 };
}

/**
 * Find text with normalized whitespace
 * Returns position in ORIGINAL html
 * 
 * This function handles the case where the search text has been normalized
 * (collapsed whitespace) but the original HTML has newlines, tabs, etc.
 */
function findNormalizedPosition(html, normalizedSearch) {
    // Build a normalized text buffer while tracking mapping to original HTML positions
    let textBuffer = '';
    let textToHtmlMap = []; // Maps text buffer position to html position
    let inTag = false;
    let lastCharWasSpace = false;

    for (let i = 0; i < html.length; i++) {
        const char = html[i];

        if (char === '<') {
            inTag = true;
            continue;
        }
        if (char === '>') {
            inTag = false;
            continue;
        }

        if (!inTag) {
            // Normalize whitespace (newlines, tabs, multiple spaces -> single space)
            const isWhitespace = /\s/.test(char);

            if (isWhitespace) {
                // Only add a single space, skip if last char was already a space
                if (!lastCharWasSpace) {
                    textBuffer += ' ';
                    textToHtmlMap.push(i);
                    lastCharWasSpace = true;
                }
            } else {
                textBuffer += char;
                textToHtmlMap.push(i);
                lastCharWasSpace = false;
            }
        }
    }

    // Trim leading/trailing spaces from searchand buffer for matching
    const trimmedSearch = normalizedSearch.trim();

    // Search for the normalized text
    const textIndex = textBuffer.indexOf(trimmedSearch);

    if (textIndex === -1) {
        return { index: -1, length: 0 };
    }

    // Map back to HTML positions
    const htmlStartIndex = textToHtmlMap[textIndex];
    const htmlEndIndex = textToHtmlMap[textIndex + trimmedSearch.length - 1];

    if (htmlStartIndex === undefined || htmlEndIndex === undefined) {
        return { index: -1, length: 0 };
    }

    // The length in original HTML (includes all the whitespace/newlines we normalized)
    const length = htmlEndIndex - htmlStartIndex + 1;

    return { index: htmlStartIndex, length };
}

/**
 * Fuzzy find - allows for minor differences
 * Uses a sliding window approach to find best match
 */
function findFuzzyPosition(html, searchText) {
    // Try progressively shorter prefixes to find a match
    const prefixLengths = [60, 40, 30, 20];

    for (const prefixLen of prefixLengths) {
        if (searchText.length < prefixLen) continue;

        const prefix = searchText.substring(0, prefixLen);
        const normalizedPos = findNormalizedPosition(html, prefix);

        if (normalizedPos.index !== -1) {
            // Now we need to find where the full text ends in the HTML
            // Start from found position and extend to cover the expected length
            // Account for the fact that original HTML may have more whitespace
            const estimatedLength = Math.floor(searchText.length * 1.5); // Allow for extra whitespace

            // Try to find the end of the logical content
            let endPos = normalizedPos.index + normalizedPos.length;
            const remainingSearch = searchText.substring(prefixLen).trim();

            if (remainingSearch.length > 0) {
                // Look for the end of the search text in the remaining HTML
                const remainingHtml = html.substring(endPos, endPos + estimatedLength);
                const lastFewWords = remainingSearch.split(/\s+/).slice(-3).join(' ');

                // Find where the last few words appear (normalized match)
                let searchPos = 0;
                let foundEnd = false;
                for (let i = 0; i < remainingHtml.length - lastFewWords.length; i++) {
                    const chunk = remainingHtml.substring(i).replace(/\s+/g, ' ').trim();
                    if (chunk.startsWith(lastFewWords.replace(/\s+/g, ' ').trim())) {
                        endPos += i + lastFewWords.length + 10; // Approximate
                        foundEnd = true;
                        break;
                    }
                }

                if (!foundEnd) {
                    // Fall back to estimated length
                    endPos = normalizedPos.index + Math.min(searchText.length + 100, estimatedLength);
                }
            }

            return { index: normalizedPos.index, length: endPos - normalizedPos.index };
        }
    }

    return { index: -1, length: 0 };
}

/**
 * Normalize text for searching
 */
function normalizeForSearch(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .trim();
}

/**
 * Strip highlight spans from HTML (for export)
 */
export function stripHighlights(html) {
    return html.replace(/<span class="cv-change-highlight">(.*?)<\/span>/gi, '$1');
}

/**
 * Check if HTML has any highlights
 */
export function hasHighlights(html) {
    return html.includes('cv-change-highlight');
}

/**
 * Expand the selection range to ensure we don't leave unbalanced tags
 * e.g. if we match "Title:</b> Description", we should expand start to include "<b>"
 * so we replace "<b>Title:</b> Description" fully.
 */
function expandSelectionToBalancedTags(html, position) {
    let { index, length } = position;

    // Safety check
    if (index < 0 || length <= 0 || index + length > html.length) {
        return position;
    }

    // Get the actual HTML string we are planning to replace
    const selection = html.substring(index, index + length);

    // Check for unbalanced closing tags in the selection
    const stack = [];
    const unbalancedClosing = [];

    // Regex to find tags
    const tagRegex = /<\/?\w+[^>]*>/g;
    let tagMatch;

    while ((tagMatch = tagRegex.exec(selection)) !== null) {
        const tag = tagMatch[0];
        if (tag.startsWith('</')) {
            const tagNameMatch = tag.match(/<\/(\w+)/);
            if (tagNameMatch) {
                const tagName = tagNameMatch[1];
                if (stack.length > 0 && stack[stack.length - 1] === tagName) {
                    stack.pop();
                } else {
                    unbalancedClosing.push(tagName);
                }
            }
        } else if (!tag.endsWith('/>')) {
            // Opening tag
            const tagNameMatch = tag.match(/<(\w+)/);
            if (tagNameMatch) {
                const tagName = tagNameMatch[1];
                const voidTags = ['br', 'hr', 'img', 'input', 'meta', 'link'];
                if (!voidTags.includes(tagName.toLowerCase())) {
                    stack.push(tagName);
                }
            }
        }
    }

    // If we found unbalanced closing tags, find their opener BEFORE the selection
    if (unbalancedClosing.length > 0) {
        const firstUnbalanced = unbalancedClosing[0];

        // Search backwards for the opening tag
        const beforeHtml = html.substring(0, index);
        const openTagRegex = new RegExp(`<${firstUnbalanced}(\\s[^>]*)?>`, 'gi');

        let lastOpenIndex = -1;
        let match;
        while ((match = openTagRegex.exec(beforeHtml)) !== null) {
            lastOpenIndex = match.index;
        }

        if (lastOpenIndex !== -1) {
            const extraLength = index - lastOpenIndex;
            index = lastOpenIndex;
            length = length + extraLength;
            console.log(`[ChangeApplier] Expanded selection left to include <${firstUnbalanced}> at ${index}`);
        }
    }

    return { index, length };
}

export default { applyChanges, stripHighlights, hasHighlights };
