const fs = require('fs');

// 1. STYLE.CSS
let css = fs.readFileSync('src/public/style.css', 'utf-8');
// Remove [data-theme="light"] block
css = css.replace(/\[data-theme="light"\]\s*{[^}]*}/m, '');
// Remove light mode logo blending
css = css.replace(/\[data-theme="light"\] \.prism-logo\s*{[^}]*}/m, '');
fs.writeFileSync('src/public/style.css', css);

// 2. HEADER.EJS
let header = fs.readFileSync('src/views/partials/header.ejs', 'utf-8');
// Remove Theme Toggle Button
header = header.replace(/<!-- Theme Toggle Button -->[\s\S]*?<\/button>/, '');
// Remove Theme Toggle Script
header = header.replace(/<script>[\s\S]*?\(function \(\) \{[\s\S]*?const savedTheme = localStorage[\s\S]*?(?:<\/script>)/, '');
fs.writeFileSync('src/views/partials/header.ejs', header);

// 3. LANDING.EJS
let landing = fs.readFileSync('src/views/landing.ejs', 'utf-8');
// Remove FOUC Script
landing = landing.replace(/<script>[\s\S]*?\/\/ Set theme immediately to avoid FOUC[\s\S]*?<\/script>/, '');
// Remove Theme Toggle Button
landing = landing.replace(/<!-- Theme Toggle Button -->[\s\S]*?<\/button>/, '');
// Remove Theme Toggle Script at bottom
landing = landing.replace(/<script>[\s\S]*?window\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?const toggleBtn = document\.getElementById\('theme-toggle'\);[\s\S]*?<\/script>/, '');
fs.writeFileSync('src/views/landing.ejs', landing);

console.log("Light mode completely removed!");
