const fs = require('fs');
const path = require('path');

const d = path.join(__dirname, '../src/components');

const r = dir => fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
        r(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
        let c = fs.readFileSync(p, 'utf8');
        const o = c;

        // Convert indigo to primary
        c = c.replace(/\b(bg|text|border|from|to|border-[lrtb])-indigo-(\d{2,3})\b/g, '$1-primary-$2');

        // Convert purple to secondary
        c = c.replace(/\b(bg|text|border|from|to|border-[lrtb])-purple-(\d{2,3})\b/g, '$1-secondary-$2');

        // Convert hardcoded widget backgrounds to secondary, allowing app layout background to shine through
        c = c.replace(/bg-white dark:bg-slate-800/g, 'bg-secondary');
        c = c.replace(/bg-gray-100 dark:bg-slate-700/g, 'bg-secondary/50');
        c = c.replace(/bg-gray-50 dark:bg-slate-900/g, 'bg-secondary');
        c = c.replace(/border-gray-100 dark:border-slate-700/g, 'border-secondary-100 dark:border-secondary-100/20');

        // Convert hardcoded space layouts to transparent so the tertiary background works
        if (p.includes('(app)')) {
            c = c.replace(/bg-white dark:bg-slate-900/g, 'bg-transparent');
        }

        if (c !== o) {
            fs.writeFileSync(p, c);
            console.log('Updated ' + p);
        }
    }
});

r(d);
console.log('Replacement complete.');
