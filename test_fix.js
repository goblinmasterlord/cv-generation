
import { applyChanges } from './src/utils/changeApplier.js';

const html = `<li><b>Operational Efficiency:</b> Architected automation workflows.</li>`;
const findText = "Operational Efficiency: Architected automation workflows.";
const replaceText = "New Strategy: Implemented new things.";

const changes = [{
    find: findText,
    replace: replaceText
}];

console.log('Original HTML:', html);
const result = applyChanges(html, changes);
console.log('Modified HTML:', result.html);

if (result.html.includes('<b>')) {
    console.warn('FAIL: HTML still contains bold tag (might imply unclosed or retained bold)');
    // In our case, we want it REMOVED because we are replacing the whole thing.
    // If result is <li><span...>New...</span></li>, it's good.
    // If result is <li><b><span...>New...</span></li>, it's BAD (unclosed bold if we stripped closer, or retained bold if we kept opener).
    // Wait, reproduction logic: 
    // Opener BEFORE match. Match includes closer.
    // Result logic: We should remove BOTH.
} else {
    console.log('SUCCESS: Bold tags removed/replaced cleanly.');
}

if (result.html.includes('<span class="cv-change-highlight">')) {
    console.log('SUCCESS: Highlight applied.');
}
