const fs = require('fs');

const files = [
  'app/buyer/page.tsx', 
  'app/node-operator/page.tsx', 
  'app/creator/page.tsx',
  'app/buyer/jobs/page.tsx',
  'app/node-operator/earnings/page.tsx',
  'app/creator/earnings/page.tsx'
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    // Reduce gradient opacities from /20 to /5  -> /5 to transparent
    content = content.replace(/from-([a-zA-Z0-9-]+)\/20 to-\1\/5/g, 'from-$1/10 to-transparent');
    // Also tone down primary/40 to primary (if any) -> primary/30 to primary/80
    content = content.replace(/from-primary\/40 to-primary/g, 'from-primary/20 to-primary/80');
    // Any other /20 to /5
    content = content.replace(/\/20 to-transparent/g, '/10 to-transparent');

    if(content !== original) {
      fs.writeFileSync(f, content);
      console.log('Fixed colors in', f);
    }
  } catch(e) {}
});
