import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/ italic/g, '');
content = content.replace(/italic /g, '');

fs.writeFileSync('src/App.tsx', content);

console.log('Removed italics');
