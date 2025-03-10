import os
import google.generativeai as genai
import re

def natural_sort_key(s, _nsre=re.compile('([0-9]+)')):
    return [int(text) if text.isdigit() else text.lower() for text in re.split(_nsre, s)]

def initialize_gemini(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-pro')

def load_texts_from_directory(directory_path):
    text_entries = []
    for filename in sorted(os.listdir(directory_path), key=natural_sort_key):
        if filename.endswith(".txt"):
            filepath = os.path.join(directory_path, filename)
            with open(filepath, 'r', encoding='utf-8') as file:
                text_entries.append((filename, file.read()))
    return text_entries

# Directories
source_directory = '/Users/cameronpattison/Library/CloudStorage/OneDrive-Vanderbilt/For Publication/Machine Translation Article/STIS and MINT/Translation_stuff/Source_Text'
output_directory = '/Users/cameronpattison/Library/CloudStorage/OneDrive-Vanderbilt/For Publication/Machine Translation Article/STIS and MINT/Translation_stuff/Translations/gemini_translations_11.14.24'

# Create output directory if it doesn't exist
os.makedirs(output_directory, exist_ok=True)

# Load texts to process
text_entries = load_texts_from_directory(source_directory)

# Limit to 3 runs
# text_entries = text_entries[:3]

# Initialize the model
gemini_api_key = 'AIzaSyALgfznjKBnpHdGbylQT31epIYGvk1RnRY'
model = initialize_gemini(gemini_api_key)

# Translation prompt
translation_prompt = "Please translate the following Ancient Greek text into English. Provide the translation only, without any additional information or commentary. Text to translate:"

for filename, text in text_entries:
    print(f"Translating {filename}...")
    combined_prompt = f"{translation_prompt}\n{text}"
    try:
        response = model.generate_content(combined_prompt)
        translation = response.text if response.parts else "No content generated"
        
        # Save translation to a new file in the output directory
        output_filepath = os.path.join(output_directory, filename)
        with open(output_filepath, 'w', encoding='utf-8') as file:
            file.write(translation)
        
        print(f"Translation saved to {output_filepath}")
    except Exception as e:
        print(f"Failed to generate content for {filename}: {str(e)}")

print(f"Translation process completed for {len(text_entries)} files.")


