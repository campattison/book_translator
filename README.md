# Book Translator

A powerful command-line application for translating large text files using modern Language Models (LLMs) including Claude, GPT-4o, and Gemini. This tool is designed to handle book-length texts while maintaining context and quality throughout the translation process.

## Features

- Support for multiple LLM providers (Anthropic Claude, OpenAI GPT-4o, Google Gemini)
- Batch processing of large text files
- Progress tracking and logging
- Automatic retry mechanism for API failures
- Natural ordering of text segments
- Concurrent processing capabilities

## Prerequisites

- Python 3.8 or higher
- API keys for the LLM services you plan to use:
  - Anthropic API key (for Claude)
  - OpenAI API key (for GPT-4o)
  - Google API key (for Gemini)

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/book_translator.git
   cd book_translator
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows, use `.venv\Scripts\activate`
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up your environment variables:
   ```bash
   cp .env.template .env
   ```
   Then edit `.env` with your API keys.

## Usage

1. Place your source text files in the `Source_Text` directory. Files should be in `.txt` format.

2. Run the translator using one of the available models:

   For Claude:
   ```bash
   python translator_scripts/translator_claude.py --input_dir Source_Text --output_dir Translations
   ```

   For GPT-4:
   ```bash
   python translator_scripts/translator_gpt4.py --input_dir Source_Text --output_dir Translations
   ```

   For Gemini:
   ```bash
   python translator_scripts/translator_gemini.py --input_dir Source_Text --output_dir Translations
   ```

3. Translated files will be saved in the `Translations` directory.

## Configuration Options

- `--input_dir`: Directory containing source text files (default: "Source_Text")
- `--output_dir`: Directory for translated files (default: "Translations")
- `--model`: Specific model to use (varies by service)
- `--batch_size`: Number of concurrent translations (default varies by script)

## Logging

The application logs all operations to `translator_[service].log`. Check these logs for detailed information about the translation process and any errors that occur.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms included in the LICENSE file.

## Last Updated

March 10, 2025
