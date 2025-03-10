import os
from openai import OpenAI
from pathlib import Path

# Initialize OpenAI client
client = OpenAI(api_key="your_api_key_here")

# Set up paths
source_folder = Path("/Users/cameronpattison/Library/CloudStorage/OneDrive-Vanderbilt/For Publication/Machine Translation Article/STIS and MINT/Translation_stuff/Source_Text")
output_folder = Path("/Users/cameronpattison/Library/CloudStorage/OneDrive-Vanderbilt/For Publication/Machine Translation Article/STIS and MINT/Translation_stuff/Translations/gpt4o_translations_11.14.24")
output_folder.mkdir(exist_ok=True)

def translate_text(text, source_lang="Ancient Greek", target_lang="English"):
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": f"You are a skilled translator from {source_lang} to {target_lang}."},
                {"role": "user", "content": f"Translate the following {source_lang} text to {target_lang}:\n\n{text}"}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error during translation: {e}")
        return None

def process_files():
    for file in sorted(source_folder.glob("*.txt")):
        print(f"Processing {file.name}...")
        
        output_file = output_folder / file.name
        
        # Check if the translation file already exists
        if output_file.exists():
            print(f"Translation for {file.name} already exists. Skipping...")
            continue
        
        with file.open("r", encoding="utf-8") as source_file:
            source_text = source_file.read()
        
        try:
            translated_text = translate_text(source_text)
            
            if translated_text:
                with output_file.open("w", encoding="utf-8") as target_file:
                    target_file.write(translated_text)
                print(f"Translation saved to {output_file}")
            else:
                print(f"Failed to translate {file.name}")
        except Exception as e:
            print(f"Error during translation of {file.name}: {str(e)}")
            print(f"Failed to translate {file.name}")

    print("Translation process completed for all files.")

if __name__ == "__main__":
    process_files()
    print("Translation process completed for all files.")


