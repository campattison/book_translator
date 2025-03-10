# Ancient Greek Translator Web Application

A web application for translating Ancient Greek texts to English using Anthropic's Claude AI.

## Features

- Translate Ancient Greek text to English using Claude AI
- Upload text files, PDFs, or images containing Greek text
- OCR processing for extracting text from PDFs and images
- Support for large texts with automatic chunking
- User-friendly interface with side-by-side display of original and translated text
- Copy and download translation results

## Prerequisites

- Python 3.8 or higher
- Node.js 14 or higher
- Tesseract OCR (for PDF and image processing)
- Anthropic API key

## Installation

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/greek-translator-web
   cd greek-translator-web/web_app
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

4. Install Tesseract OCR:
   - On macOS: `brew install tesseract tesseract-lang`
   - On Ubuntu: `sudo apt-get install tesseract-ocr tesseract-ocr-grc`
   - On Windows: Download and install from https://github.com/UB-Mannheim/tesseract/wiki

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install the required Node.js packages:
   ```
   npm install
   ```

3. Build the frontend:
   ```
   npm run build
   ```

## Usage

1. Start the backend server:
   ```
   cd web_app
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

3. Enter your Anthropic API key, paste or upload your Greek text, and click "Translate"

## Development

For development, you can run the frontend development server:

```
cd web_app/frontend
npm start
```

This will start the React development server on port 3000. The API requests will be proxied to the backend server running on port 5000.

## Deployment

The application can be deployed to various platforms:

### Heroku

1. Create a new Heroku app
2. Set up the Heroku CLI and login
3. Deploy the application:
   ```
   git push heroku main
   ```

### Docker

A Dockerfile is provided for containerized deployment:

1. Build the Docker image:
   ```
   docker build -t greek-translator .
   ```

2. Run the container:
   ```
   docker run -p 5000:5000 greek-translator
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Anthropic for providing the Claude AI API
- Tesseract OCR for text extraction capabilities 