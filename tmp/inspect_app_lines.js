const fs = require('fs');

const lines = fs.readFileSync('app.js', 'utf8').split(/\r?\n/);
const start = 2238; // 1-based-ish neighborhood near reported area
const end = 2280;

for (let i = start; i <= end && i < lines.length; i++) {
    const lineNo = i + 1;
    console.log(String(lineNo).padStart(5) + ': ' + lines[i]);
}
