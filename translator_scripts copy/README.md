# Ancient Greek Translator

A tool for translating Ancient Greek texts to English using Anthropic's Claude API.

## Features

- Translate multiple text files in batch
- Parallel processing for faster translation
- Automatic retry on API errors
- Progress tracking with detailed logs
- Metadata for each translation
- Command-line interface for flexible usage
- Environment variable support for secure API key management
- Support for Claude 3.7 Sonnet with extended thinking mode for improved translations

## Installation

1. Clone this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Set up your Anthropic API key:
   - Create a `.env` file in the project directory
   - Add your API key: `ANTHROPIC_API_KEY=your_api_key_here`

## Usage

### Basic Usage

```bash
python translator_claude.py
```

This will use the default source and output directories defined in the script.

### Command Line Options

```bash
python translator_claude.py --source /path/to/source --output /path/to/output
```

Available options:

- `--source`: Directory containing Greek text files
- `--output`: Directory for saving translations
- `--model`: Claude model to use (default: claude-3-7-sonnet)
- `--api-key`: Anthropic API key (can also use env var)
- `--workers`: Number of parallel workers (default: 1)
- `--force`: Force retranslation of already translated files
- `--extended-thinking`: Enable extended thinking mode for Claude 3.7 Sonnet (better for complex translations)
- `--files`: Specific files to translate (space-separated list)

### Examples

Translate specific files:
```bash
python translator_claude.py --files Book_1_Chapter_01.txt Book_1_Chapter_02.txt
```

Use parallel processing:
```bash
python translator_claude.py --workers 4
```

Force retranslation of all files:
```bash
python translator_claude.py --force
```

Use Claude 3.7 Sonnet with extended thinking mode:
```bash
python translator_claude.py --extended-thinking
```

## Models

### Claude 3.7 Sonnet (Default)

Claude 3.7 Sonnet is Anthropic's most advanced model, featuring hybrid reasoning capabilities. It can produce more accurate translations of complex Ancient Greek texts by using its enhanced reasoning abilities.

When using Claude 3.7 Sonnet, you can enable "extended thinking" mode with the `--extended-thinking` flag. This allows the model to take more time to analyze the text and produce a more accurate translation, which is particularly helpful for complex or ambiguous passages.

Note that using extended thinking mode may increase token usage and therefore cost, as the model's reasoning process counts toward output tokens.

### Other Models

You can also use other Claude models by specifying the `--model` parameter:

```bash
python translator_claude.py --model claude-3-5-sonnet
```

## Output

The script creates:
- Translated text files in the output directory
- Metadata files (.meta.json) with information about each translation
- Error logs for failed translations
- A summary file with statistics about the translation process

## Troubleshooting

- Check the log file `translator_claude.log` for detailed error messages
- Ensure your API key is valid and has sufficient quota
- For large files, consider increasing the max_tokens parameter in the translate_text function 
- If using extended thinking mode and encountering errors, try without it as the feature may require specific API access 