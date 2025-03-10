# Ancient Greek Translator - GitHub Pages Version

This is a static web application for translating Ancient Greek texts to English using Anthropic's Claude AI. This version is designed to be deployed on GitHub Pages.

## Features

- Translate Ancient Greek text to English using Claude AI
- Upload text files containing Greek text
- Support for large texts with automatic chunking
- User-friendly interface with side-by-side display of original and translated text
- Copy and download translation results

## How It Works

This application runs entirely in the browser and uses the Anthropic API directly from the client side. Users must provide their own Anthropic API key to use the translator.

## Deployment to GitHub Pages

### Option 1: Deploy to Your Main GitHub Pages Site

1. If you have a GitHub Pages site at `yourusername.github.io`, copy these files to your repository:
   ```
   index.html
   styles.css
   script.js
   ```

2. Push the changes to GitHub:
   ```bash
   git add .
   git commit -m "Add Greek Translator app"
   git push
   ```

3. Your app will be available at `https://yourusername.github.io`

### Option 2: Deploy to a Project Page (Recommended for Your Case)

1. Create a new folder in your existing GitHub Pages repository:
   ```bash
   mkdir -p greek-translator
   cp index.html styles.css script.js greek-translator/
   ```

2. Push the changes to GitHub:
   ```bash
   git add greek-translator
   git commit -m "Add Greek Translator app"
   git push
   ```

3. Your app will be available at `https://campattison.github.io/bio/greek-translator/`

### Option 3: Create a New Repository

1. Create a new repository on GitHub named `greek-translator`

2. Initialize the repository locally:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/campattison/greek-translator.git
   git push -u origin main
   ```

3. Enable GitHub Pages in the repository settings:
   - Go to Settings > Pages
   - Set the source to "main" branch and the folder to "/ (root)"
   - Click Save

4. Your app will be available at `https://campattison.github.io/greek-translator/`

## Customization

- Update the header link in `index.html` to point to your main site
- Customize the styles in `styles.css` to match your site's design
- Add your GitHub username to the footer in `index.html`

## Security Notes

- This application never stores or transmits API keys to any server
- All API calls are made directly from the user's browser to Anthropic's API
- The application is served as static files only, with no backend server

## Browser Compatibility

This application works in modern browsers that support:
- ES6+ JavaScript
- Fetch API
- Promises and async/await
- CSS Grid and Flexbox

## License

This project is licensed under the MIT License. 