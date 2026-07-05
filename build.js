const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
if (fs.existsSync(appJsPath)) {
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Replace the default API key retrieval logic with the build-time environment variable injection
    const targetPattern = "let geminiApiKey = localStorage.getItem('gemini_api_key') || '';";
    const replacement = `let geminiApiKey = localStorage.getItem('gemini_api_key') || '${apiKey}';`;

    if (appJsContent.includes(targetPattern)) {
        appJsContent = appJsContent.replace(targetPattern, replacement);
        fs.writeFileSync(appJsPath, appJsContent, 'utf8');
        console.log('Build successful: Injected Gemini API Key from environment variables.');
    } else {
        console.log('Build warning: Target placeholder pattern not found in app.js.');
    }
} else {
    console.error('Build error: app.js not found.');
    process.exit(1);
}
