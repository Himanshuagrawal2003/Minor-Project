import fs from 'fs';
try {
  const content = fs.readFileSync('crash.log', 'utf16le');
  console.log("CRASH LOG CONTENT:");
  console.log(content.substring(0, 2000));
} catch(e) {
  console.error("Could not read crash.log", e);
}
