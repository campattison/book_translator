import os
import re
import time
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm
from dotenv import load_dotenv
from anthropic import Anthropic, RateLimitError, APIError

# Load environment variables from .env file if it exists
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("translator_claude.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def natural_sort_key(s, _nsre=re.compile('([0-9]+)')):
    """Sort strings with embedded numbers naturally."""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(_nsre, s)]

def initialize_anthropic(api_key=None):
    """Initialize the Anthropic client with the provided API key or from environment."""
    if api_key is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("No API key provided. Set ANTHROPIC_API_KEY environment variable or provide it as an argument.")
    return Anthropic(api_key=api_key)

def load_texts_from_directory(directory_path):
    """Load all text files from the specified directory."""
    directory = Path(directory_path)
    text_entries = []
    
    if not directory.exists():
        logger.error(f"Directory not found: {directory_path}")
        return text_entries
    
    for filename in sorted(os.listdir(directory), key=natural_sort_key):
        if filename.endswith(".txt"):
            filepath = directory / filename
            try:
                with open(filepath, 'r', encoding='utf-8') as file:
                    text_entries.append((filename, file.read()))
                logger.debug(f"Loaded file: {filename}")
            except Exception as e:
                logger.error(f"Failed to load file {filename}: {str(e)}")
    
    logger.info(f"Loaded {len(text_entries)} text files from {directory_path}")
    return text_entries

def translate_text(client, text, model="claude-3-7-sonnet-latest", max_retries=3, retry_delay=2):
    """Translate text using Anthropic's Claude API with retry logic."""
    system_prompt = """You are a skilled translator from Ancient Greek to English. 
    Focus on accuracy while maintaining readability. 
    Preserve the meaning, tone, and style of the original text.
    When encountering specialized terminology or cultural references, translate them accurately.
    Do not add explanatory notes or commentary to the translation."""
    
    user_prompt = "Please translate the following Ancient Greek text into English. Provide the translation only, without any additional information or commentary. Text to translate:\n\n"
    
    combined_prompt = f"{user_prompt}{text}"
    
    for attempt in range(max_retries):
        try:
            # Set up parameters for the API call
            params = {
                "model": model,
                "max_tokens": 4000,
                "system": system_prompt,
                "messages": [
                    {"role": "user", "content": combined_prompt}
                ]
            }
            
            response = client.messages.create(**params)
            return response.content[0].text
        except RateLimitError:
            wait_time = retry_delay * (2 ** attempt)
            logger.warning(f"Rate limit exceeded. Waiting {wait_time} seconds before retry.")
            time.sleep(wait_time)
        except APIError as e:
            if attempt < max_retries - 1:
                wait_time = retry_delay * (2 ** attempt)
                logger.warning(f"API error: {str(e)}. Retrying in {wait_time} seconds.")
                time.sleep(wait_time)
            else:
                logger.error(f"Failed after {max_retries} attempts: {str(e)}")
                raise
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            raise
    
    raise Exception(f"Failed to translate after {max_retries} attempts")

def process_file(args):
    """Process a single file for translation."""
    client, filename, text, output_directory, model, force_retranslate = args
    
    output_filepath = Path(output_directory) / filename
    
    # Skip if translation exists and force_retranslate is False
    if output_filepath.exists() and not force_retranslate:
        logger.info(f"Skipping {filename} - translation already exists")
        return filename, "skipped"
    
    try:
        logger.info(f"Translating {filename}...")
        translation = translate_text(client, text, model=model)
        
        # Save translation to output file
        with open(output_filepath, 'w', encoding='utf-8') as file:
            file.write(translation)
        
        # Save metadata
        metadata = {
            "source_file": filename,
            "translation_date": datetime.now().isoformat(),
            "model": model,
            "characters": len(text),
            "status": "completed"
        }
        
        metadata_path = output_filepath.with_suffix('.meta.json')
        with open(metadata_path, 'w', encoding='utf-8') as meta_file:
            json.dump(metadata, meta_file, indent=2)
        
        logger.info(f"Translation saved to {output_filepath}")
        return filename, "completed"
    
    except Exception as e:
        logger.error(f"Failed to translate {filename}: {str(e)}")
        
        # Save error information
        error_dir = Path(output_directory) / "errors"
        error_dir.mkdir(exist_ok=True)
        
        error_info = {
            "source_file": filename,
            "error_date": datetime.now().isoformat(),
            "error_message": str(e),
            "status": "failed"
        }
        
        error_path = error_dir / f"{filename}.error.json"
        with open(error_path, 'w', encoding='utf-8') as error_file:
            json.dump(error_info, error_file, indent=2)
        
        return filename, "failed"

def main():
    """Main function to run the translator."""
    parser = argparse.ArgumentParser(description="Translate Ancient Greek texts using Claude API")
    parser.add_argument("--source", type=str, help="Source directory containing Greek text files")
    parser.add_argument("--output", type=str, help="Output directory for translations")
    parser.add_argument("--model", type=str, default="claude-3-7-sonnet-latest", 
                        help="Claude model to use for translation")
    parser.add_argument("--api-key", type=str, help="Anthropic API key (optional, can use env var)")
    parser.add_argument("--workers", type=int, default=1, 
                        help="Number of parallel workers (default: 1)")
    parser.add_argument("--force", action="store_true", 
                        help="Force retranslation of already translated files")
    parser.add_argument("--files", type=str, nargs="+", 
                        help="Specific files to translate (optional)")
    
    args = parser.parse_args()
    
    # Get the script's directory
    script_dir = Path(__file__).parent.parent.absolute()
    
    # Use provided paths or defaults with paths relative to the script's location
    source_directory = args.source or os.getenv("SOURCE_DIRECTORY") or (script_dir / "Source_Text copy")
    output_directory = args.output or os.getenv("OUTPUT_DIRECTORY") or (script_dir / "Translations/claude_translations")
    
    # Convert Path objects to strings to avoid JSON serialization issues
    source_directory = str(source_directory)
    output_directory = str(output_directory)
    
    # Add timestamp to output directory if not specified
    if args.output is None and os.getenv("OUTPUT_DIRECTORY") is None:
        timestamp = datetime.now().strftime("%m.%d.%y")
        output_directory = f"{output_directory}_{timestamp}"
    
    # Create output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)
    
    # Initialize the client
    try:
        client = initialize_anthropic(args.api_key)
    except ValueError as e:
        logger.error(str(e))
        return
    
    # Load texts to process
    text_entries = load_texts_from_directory(source_directory)
    
    if not text_entries:
        logger.error(f"No text files found in {source_directory}")
        return
    
    # Filter specific files if requested
    if args.files:
        text_entries = [(filename, text) for filename, text in text_entries if filename in args.files]
        if not text_entries:
            logger.error("None of the specified files were found")
            return
    
    logger.info(f"Starting translation of {len(text_entries)} files")
    logger.info(f"Source directory: {source_directory}")
    logger.info(f"Output directory: {output_directory}")
    logger.info(f"Model: {args.model}")
    logger.info(f"Workers: {args.workers}")
    
    # Prepare arguments for processing
    process_args = [
        (client, filename, text, output_directory, args.model, args.force)
        for filename, text in text_entries
    ]
    
    # Process files with progress bar
    results = []
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        for result in tqdm(
            executor.map(process_file, process_args),
            total=len(process_args),
            desc="Translating files"
        ):
            results.append(result)
    
    # Summarize results
    completed = sum(1 for _, status in results if status == "completed")
    skipped = sum(1 for _, status in results if status == "skipped")
    failed = sum(1 for _, status in results if status == "failed")
    
    logger.info(f"Translation process completed:")
    logger.info(f"  - Completed: {completed}")
    logger.info(f"  - Skipped: {skipped}")
    logger.info(f"  - Failed: {failed}")
    
    # Save summary
    summary = {
        "timestamp": datetime.now().isoformat(),
        "source_directory": source_directory,
        "output_directory": output_directory,
        "model": args.model,
        "total_files": len(text_entries),
        "completed": completed,
        "skipped": skipped,
        "failed": failed,
        "results": dict(results)
    }
    
    summary_path = Path(output_directory) / "translation_summary.json"
    with open(summary_path, 'w', encoding='utf-8') as summary_file:
        json.dump(summary, summary_file, indent=2)

if __name__ == "__main__":
    main()


