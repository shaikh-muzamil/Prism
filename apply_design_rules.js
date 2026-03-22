const fs = require('fs');

// 1. UPDATE STYLE.CSS
let css = fs.readFileSync('src/public/style.css', 'utf-8');

// Update font families
css = css.replace(/@import url\('[^']+'\);/, "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');");
css = css.replace(/--font-heading: '[^']+', sans-serif;/, "--font-heading: 'Inter', sans-serif;");
css = css.replace(/font-weight: 800;/, "font-weight: 700;");
css = css.replace(/font-weight: 600;/g, "font-weight: 500;");

// Fix input focus rings to strictly be Prism violet (#7c3aed)
css = css.replace(/border-color: var\(--accent\);/g, "border-color: var(--border-focus);");
css = css.replace(/box-shadow: 0 0 0 3px rgba\(167, 139, 250, 0.15\);/g, "box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);"); // 124, 58, 237 is #7c3aed

// Add integrations colors to root if missing
if (!css.includes('--gmail: #ea4335')) {
    css = css.replace(/--notion: #ffffff;/g, "--notion: #ffffff;\n  --gmail: #ea4335;\n  --drive: #0F9D58;\n  --ai-strip: #f472b6;\n  --slack-text: #ffffff;\n  --notion-text: #000000;");
}

// Ensure the AI strip CSS exists
if (!css.includes('.ai-strip')) {
    css += `
/* AI Answer Strip */
.ai-strip {
    border-left: 3px solid var(--ai-strip) !important;
    background: linear-gradient(90deg, rgba(244, 114, 182, 0.05) 0%, transparent 100%);
}
`;
}
fs.writeFileSync('src/public/style.css', css);

// 2. UPDATE INDEX.EJS FOR 3PX LEFT BORDERS
let index = fs.readFileSync('src/views/index.ejs', 'utf-8');

// Safely add borders to each integration section's cards
// Slack Cards
index = index.replace(/<% results\.slack\.forEach\(item=> { %>\s*<a href="[^"]+" target="_blank" class="card card-interactive">/g, `<% results.slack.forEach(item=> { %>\n                                    <a href="<%= item.permalink %>" target="_blank" class="card card-interactive" style="border-left: 3px solid var(--slack);">`);

// Notion Cards
index = index.replace(/<% results\.notion\.forEach\(item=> { %>\s*<a href="[^"]+" target="_blank" class="card card-interactive">/g, `<% results.notion.forEach(item=> { %>\n                                    <a href="<%= item.url %>" target="_blank" class="card card-interactive" style="border-left: 3px solid var(--notion);">`);

// Google Drive Cards
index = index.replace(/<% results\.googleDrive\.forEach\(item=> { %>\s*<a href="[^"]+" target="_blank" class="card card-interactive">/g, `<% results.googleDrive.forEach(item=> { %>\n                                    <a href="<%= item.url %>" target="_blank" class="card card-interactive" style="border-left: 3px solid var(--drive);">`);

// Gmail Cards
index = index.replace(/<% results\.gmail\.forEach\(item=> { %>\s*<a href="[^"]+" target="_blank" class="card card-interactive">/g, `<% results.gmail.forEach(item=> { %>\n                                    <a href="<%= item.url %>" target="_blank" class="card card-interactive" style="border-left: 3px solid var(--gmail);">`);

// Also update the Recents Slack cards if they don't have it
index = index.replace(/<% recents\.forEach\(item=> { %>\s*<a href="[^"]+" target="_blank" class="card card-interactive">/g, `<% recents.forEach(item=> { %>\n                                <a href="<%= item.permalink %>" target="_blank" class="card card-interactive" style="border-left: 3px solid var(--slack);">`);

fs.writeFileSync('src/views/index.ejs', index);

// 3. Ensure Landing Page Typography matches the rules
let landing = fs.readFileSync('src/views/landing.ejs', 'utf-8');
landing = landing.replace(/font-weight: 800;/g, "font-weight: 700;");
landing = landing.replace(/font-weight: 600;/g, "font-weight: 500;");
fs.writeFileSync('src/views/landing.ejs', landing);

console.log("Refactoring absolute brand rules completed!");
