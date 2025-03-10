import os
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import tempfile
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def extract_text_from_image(image_path):
    """Extract text from an image using Tesseract OCR."""
    try:
        # Open the image
        image = Image.open(image_path)
        
        # Use pytesseract to extract text
        text = pytesseract.image_to_string(image, lang='grc')
        
        return text
    except Exception as e:
        logger.error(f"Error extracting text from image: {str(e)}")
        raise

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using Tesseract OCR."""
    try:
        # Create a temporary directory for the images
        with tempfile.TemporaryDirectory() as temp_dir:
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            # Extract text from each image
            extracted_text = []
            for i, image in enumerate(images):
                # Save the image temporarily
                temp_image_path = os.path.join(temp_dir, f'page_{i}.png')
                image.save(temp_image_path, 'PNG')
                
                # Extract text from the image
                page_text = extract_text_from_image(temp_image_path)
                extracted_text.append(page_text)
            
            # Combine all extracted text
            return '\n\n'.join(extracted_text)
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise

def chunk_text(text, max_chunk_size=4000):
    """Split text into chunks of appropriate size for the API."""
    # Simple chunking by paragraphs
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        # If adding this paragraph would exceed the max chunk size,
        # save the current chunk and start a new one
        if len(current_chunk) + len(paragraph) > max_chunk_size and current_chunk:
            chunks.append(current_chunk)
            current_chunk = paragraph
        else:
            if current_chunk:
                current_chunk += '\n\n' + paragraph
            else:
                current_chunk = paragraph
    
    # Add the last chunk if it's not empty
    if current_chunk:
        chunks.append(current_chunk)
    
    return chunks 