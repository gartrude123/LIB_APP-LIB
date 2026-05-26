const fs = require("fs");
const lines = fs.readFileSync("app.js", "utf8").split(/\r?\n/);
const start = 940; // 1-based-ish vicinity
const end = 980;
for (let i = start; i <= end && i < lines.length; i++) {
    const lineNo = i + 1;
    console.log(String(lineNo).padStart(5) + ": " + lines[i]);
}
