const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'App.tsx'), 'utf8');

// Strip out JS curly braces to isolate JSX
let jsxOnly = '';
let inJS = 0;
let inQuote = '';
let lastChar = '';

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  
  if (inQuote) {
    if (char === inQuote && lastChar !== '\\') {
      inQuote = '';
    }
  } else if (char === '"' || char === "'" || char === "`") {
    inQuote = char;
  } else if (char === '{') {
    inJS++;
    lastChar = char;
    continue;
  } else if (char === '}') {
    inJS--;
    lastChar = char;
    continue;
  }
  
  if (inJS === 0 && !inQuote) {
    jsxOnly += char;
  } else {
    jsxOnly += ' '; // maintain index alignment
  }
  
  lastChar = char;
}

// Strip out HTML comments e.g. {/* ... */} or <!-- ... -->
jsxOnly = jsxOnly.replace(/{\/\*[\s\S]*?\*\/}/g, '');

const opens = {};
const closes = {};

// Find all matches
const tagRegex = /<([/]?)([a-zA-Z0-9.:-]+|motion\.[a-zA-Z0-9.-]+)([^>]*?)([/]?)>/g;
let match;
while ((match = tagRegex.exec(jsxOnly)) !== null) {
  const [full, isClose, tagName, attrs, isSelfClose] = match;
  
  const isSelf = isSelfClose === '/' || ['input', 'img', 'br', 'hr', 'meta', 'link', 'textarea'].includes(tagName);
  if (isSelf) continue;

  if (isClose === '/') {
    closes[tagName] = (closes[tagName] || 0) + 1;
  } else {
    opens[tagName] = (opens[tagName] || 0) + 1;
  }
}

console.log("TAG COUNT ANALYSIS:");
const allTags = new Set([...Object.keys(opens), ...Object.keys(closes)]);
for (const tag of allTags) {
  const oCount = opens[tag] || 0;
  const cCount = closes[tag] || 0;
  if (oCount !== cCount) {
    console.log(`[IMBALANCE] <${tag}>: Oppened ${oCount} times, Closed ${cCount} times! (Diff: ${oCount - cCount})`);
  } else {
    console.log(`[BALANCED]  <${tag}>: ${oCount} times`);
  }
}
