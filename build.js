const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, 'app.js');
if (fs.existsSync(appJsPath)) {
    let appJsContent = fs.readFileSync(appJsPath, 'utf8');
    const apiKey = process.env.GEMINI_API_KEY || '';

    // Replace the default API key retrieval logic with the build-time environment variable injection using regex
    const regex = /let\s+geminiApiKey\s*=\s*localStorage\.getItem\(\s*['"]gemini_api_key['"]\s*\)\s*\|\|\s*['"]['"]\s*;/;
    const replacement = `let geminiApiKey = localStorage.getItem('gemini_api_key') || '${apiKey}';`;

    if (regex.test(appJsContent)) {
        appJsContent = appJsContent.replace(regex, replacement);
        fs.writeFileSync(appJsPath, appJsContent, 'utf8');
        console.log('Build successful: Injected Gemini API Key from environment variables.');
    } else {
        console.log('Build warning: Target placeholder pattern not found in app.js.');
    }
} else {
    console.error('Build error: app.js not found.');
    process.exit(1);
}
