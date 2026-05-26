const fs = require("fs");
const lines = fs.readFileSync("app.js", "utf8").split(/\r?\n/);
const tail = lines.slice(Math.max(0, lines.length - 120));
tail.forEach((l, i) => {
    const lineNo = lines.length - 120 + i + 1;
    process.stdout.write(String(lineNo).padStart(5) + " " + l + "\n");
});
