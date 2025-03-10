from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import tempfile
import uuid
from werkzeug.utils import secure_filename
import sys
from pathlib import Path
import logging

# Add the translator script directory to the path
sys.path.append(str(Path(__file__).parent.parent / "translator_scripts copy"))

# Import the translator functions
from translator_claude import translate_text, initialize_anthropic

# Import OCR processor
from ocr_processor import extract_text_from_pdf, extract_text_from_image, chunk_text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("web_app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='frontend/build')
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = Path(tempfile.gettempdir()) / 'greek_translator_uploads'
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = str(UPLOAD_FOLDER)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/translate', methods=['POST'])
def translate_api():
    """API endpoint to translate text"""
    # Check if API key is provided
    api_key = request.form.get('api_key')
    if not api_key:
        return jsonify({'error': 'API key is required'}), 400
    
    # Get the model to use
    model = request.form.get('model', 'claude-3-7-sonnet-latest')
    
    # Check if text is provided directly
    text = request.form.get('text')
    
    # Check if file is provided
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            # Generate a unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(filepath)
            
            try:
                # Process the file based on its type
                if filename.endswith('.pdf'):
                    logger.info(f"Processing PDF file: {filename}")
                    text = extract_text_from_pdf(filepath)
                elif filename.endswith(('.png', '.jpg', '.jpeg')):
                    logger.info(f"Processing image file: {filename}")
                    text = extract_text_from_image(filepath)
                else:
                    # Read text file
                    logger.info(f"Processing text file: {filename}")
                    with open(filepath, 'r', encoding='utf-8') as f:
                        text = f.read()
            except Exception as e:
                logger.error(f"Error processing file {filename}: {str(e)}")
                return jsonify({'error': f"Error processing file: {str(e)}"}), 500
            finally:
                # Clean up the file
                os.remove(filepath)
    
    if not text:
        return jsonify({'error': 'No text provided for translation'}), 400
    
    try:
        # Initialize Anthropic client with the provided API key
        client = initialize_anthropic(api_key)
        
        # Chunk the text if it's too large
        chunks = chunk_text(text)
        logger.info(f"Text split into {len(chunks)} chunks")
        
        # Translate each chunk
        translations = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Translating chunk {i+1}/{len(chunks)}")
            translation = translate_text(client, chunk, model=model)
            translations.append(translation)
        
        # Combine translations
        full_translation = '\n\n'.join(translations)
        
        return jsonify({
            'original_text': text,
            'translated_text': full_translation,
            'model': model,
            'chunks': len(chunks)
        })
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models', methods=['GET'])
def get_models():
    """Return available models"""
    models = [
        {"id": "claude-3-7-sonnet-latest", "name": "Claude 3.7 Sonnet (Latest)"},
        {"id": "claude-3-5-sonnet-20240620", "name": "Claude 3.5 Sonnet"},
        {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"}
    ]
    return jsonify(models)

# Serve React frontend in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 