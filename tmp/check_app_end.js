const fs = require("fs");
const s = fs.readFileSync("app.js", "utf8");
console.log("length:", s.length);
const t = s.trimEnd();
console.log("last120:", t.slice(-120));
console.log("lines:", s.split(/\r?\n/).length);
