import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/text-sm/g, 'text-base');
content = content.replace(/text-xs/g, 'text-sm');
content = content.replace(/text-\[11px\]/g, 'text-sm');
content = content.replace(/text-\[10px\]/g, 'text-sm');
content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[8px\]/g, 'text-xs');

fs.writeFileSync('src/App.tsx', content);

let indexContent = fs.readFileSync('src/index.css', 'utf8');
indexContent = indexContent.replace(/antialiased/g, 'subpixel-antialiased tracking-wide font-medium');
// Oh wait, if I had subpixel-antialiased already it might replace it to subpixel-subpixel-antialiased if run again, but I only ran it once.

fs.writeFileSync('src/index.css', indexContent);

console.log('Fonts bumped');
