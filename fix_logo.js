const fs = require('fs');

// 1. Fix hardcoded white text in index.ejs
let index = fs.readFileSync('src/views/index.ejs', 'utf-8');
index = index.replace(/color: #fff;/g, 'color: var(--text-1);');
fs.writeFileSync('src/views/index.ejs', index);

// 2. Fix the Logo in header.ejs and landing.ejs
// Updating knockout to full_color_dark which generally blends better on deep Night
let header = fs.readFileSync('src/views/partials/header.ejs', 'utf-8');
header = header.replace(/05_prism_white_knockout\.jpg/g, '02_prism_full_color_dark.jpg');
if (!header.includes('class="prism-logo"')) {
    header = header.replace(/<img id="logo-img"/g, '<img id="logo-img" class="prism-logo"');
}
fs.writeFileSync('src/views/partials/header.ejs', header);

let landing = fs.readFileSync('src/views/landing.ejs', 'utf-8');
landing = landing.replace(/05_prism_white_knockout\.jpg/g, '02_prism_full_color_dark.jpg');
if (!landing.includes('class="prism-logo"')) {
    landing = landing.replace(/<img id="logo-img"/g, '<img id="logo-img" class="prism-logo"');
}
fs.writeFileSync('src/views/landing.ejs', landing);

// 3. Add CSS rules to style.css for the logo blending perfectly
let css = fs.readFileSync('src/public/style.css', 'utf-8');
const logoCss = `
/* Logo Blending */
.prism-logo {
    border-radius: 8px; /* So it looks like a premium app icon if box is visible */
    transition: mix-blend-mode 0.2s ease, filter 0.2s ease;
}
[data-theme="light"] .prism-logo {
    mix-blend-mode: multiply; /* Instantly turns the white background completely transparent! */
}
`;
if(!css.includes('.prism-logo')) {
    css += logoCss;
    fs.writeFileSync('src/public/style.css', css);
}

console.log("Fixes applied successfully!");
