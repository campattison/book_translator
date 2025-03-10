document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const translationForm = document.getElementById('translationForm');
  const apiKeyInput = document.getElementById('apiKey');
  const modelSelect = document.getElementById('model');
  const textInputBtn = document.getElementById('textInputBtn');
  const fileInputBtn = document.getElementById('fileInputBtn');
  const textInputSection = document.getElementById('textInputSection');
  const fileInputSection = document.getElementById('fileInputSection');
  const textInput = document.getElementById('text');
  const fileInput = document.getElementById('file');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  const translationResult = document.getElementById('translationResult');
  const resultModel = document.getElementById('resultModel');
  const chunksInfo = document.getElementById('chunksInfo');
  const resultChunks = document.getElementById('resultChunks');
  const originalText = document.getElementById('originalText');
  const translatedText = document.getElementById('translatedText');
  const copyTranslationBtn = document.getElementById('copyTranslationBtn');
  
  // Debug panel elements
  const debugPanel = document.getElementById('debugPanel');
  const debugLogs = document.getElementById('debugLogs');
  const debugToggle = document.getElementById('debugToggle');
  const showDebugLink = document.getElementById('showDebugLink');
  const clearLogsBtn = document.getElementById('clearLogs');
  
  // Export buttons
  const exportTxtBtn = document.getElementById('exportTxtBtn');
  const exportHtmlBtn = document.getElementById('exportHtmlBtn');
  const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');

  // Store translation data
  let translationData = {
    original: '',
    translation: '',
    model: '',
    timestamp: ''
  };
  
  // Debug logging
  const debugLog = {
    logs: [],
    
    // Add a log entry
    add: function(type, message, data) {
      const entry = {
        type: type,
        message: message,
        data: data,
        timestamp: new Date().toISOString()
      };
      
      this.logs.push(entry);
      this.render();
      
      // Also log to console
      if (type === 'error') {
        console.error(message, data || '');
      } else if (type === 'warn') {
        console.warn(message, data || '');
      } else {
        console.log(message, data || '');
      }
    },
    
    // Clear all logs
    clear: function() {
      this.logs = [];
      this.render();
    },
    
    // Render logs to debug panel
    render: function() {
      debugLogs.innerHTML = '';
      
      this.logs.forEach(log => {
        const entry = document.createElement('div');
        entry.className = `debug-entry ${log.type}`;
        
        const timestamp = document.createElement('div');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date(log.timestamp).toLocaleTimeString();
        
        const message = document.createElement('div');
        message.className = 'message';
        message.textContent = log.message;
        
        entry.appendChild(timestamp);
        entry.appendChild(message);
        
        if (log.data) {
          const data = document.createElement('pre');
          data.textContent = typeof log.data === 'object' 
            ? JSON.stringify(log.data, null, 2) 
            : log.data.toString();
          entry.appendChild(data);
        }
        
        debugLogs.appendChild(entry);
      });
      
      // Auto-scroll to bottom
      debugLogs.scrollTop = debugLogs.scrollHeight;
    }
  };
  
  // Override console methods to capture logs
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.log = function() {
    debugLog.add('info', arguments[0], arguments.length > 1 ? arguments[1] : null);
    originalConsoleLog.apply(console, arguments);
  };
  
  console.warn = function() {
    debugLog.add('warn', arguments[0], arguments.length > 1 ? arguments[1] : null);
    originalConsoleWarn.apply(console, arguments);
  };
  
  console.error = function() {
    debugLog.add('error', arguments[0], arguments.length > 1 ? arguments[1] : null);
    originalConsoleError.apply(console, arguments);
  };
  
  // Debug panel toggle
  debugToggle.addEventListener('click', function() {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    debugToggle.textContent = debugPanel.style.display === 'none' ? 'Show Debug Info' : 'Hide Debug Info';
  });
  
  showDebugLink.addEventListener('click', function(e) {
    e.preventDefault();
    debugPanel.style.display = 'block';
    debugToggle.textContent = 'Hide Debug Info';
  });
  
  clearLogsBtn.addEventListener('click', function() {
    debugLog.clear();
  });

  // Input method toggle
  textInputBtn.addEventListener('click', function() {
    textInputBtn.classList.add('active');
    fileInputBtn.classList.remove('active');
    textInputSection.style.display = 'flex';
    fileInputSection.style.display = 'none';
    textInput.required = true;
    fileInput.required = false;
  });

  fileInputBtn.addEventListener('click', function() {
    fileInputBtn.classList.add('active');
    textInputBtn.classList.remove('active');
    fileInputSection.style.display = 'flex';
    textInputSection.style.display = 'none';
    fileInput.required = true;
    textInput.required = false;
  });

  // File input handling
  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        fileInput.value = '';
        return;
      }

      // Check file type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'txt') {
        alert('Only .txt files are supported in this version.');
        fileInput.value = '';
        return;
      }
    }
  });

  // Form submission
  translationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    let text = '';
    
    // Get text from input or file
    if (textInputBtn.classList.contains('active')) {
      text = textInput.value.trim();
    } else {
      const file = fileInput.files[0];
      if (file) {
        try {
          text = await readFileAsText(file);
        } catch (error) {
          showError('Error reading file: ' + error.message);
          return;
        }
      }
    }
    
    // Validate inputs
    if (!apiKey) {
      showError('API key is required');
      return;
    }
    
    if (!text) {
      showError('No text provided for translation');
      return;
    }
    
    // Clear previous logs
    debugLog.clear();
    
    // Start translation process
    translateText(apiKey, text, model);
  });

  // Read file as text
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        resolve(e.target.result);
      };
      reader.onerror = function(e) {
        reject(new Error('Failed to read file'));
      };
      reader.readAsText(file);
    });
  }

  // Show error message
  function showError(message) {
    console.error('Error:', message);
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    loadingSpinner.style.display = 'none';
    translationResult.style.display = 'none';
  }

  // Chunk text for API - improved chunking algorithm
  function chunkText(text, maxChunkSize = 4000) {
    // Split by paragraphs (double newlines)
    const paragraphs = text.split('\n\n');
    const chunks = [];
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph would exceed the max size and we already have content
      if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk);
        currentChunk = paragraph;
      } else {
        // Otherwise add to current chunk with proper spacing
        if (currentChunk) {
          currentChunk += '\n\n' + paragraph;
        } else {
          currentChunk = paragraph;
        }
      }
    }
    
    // Add the last chunk if it has content
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  // Make a direct API call to Anthropic's API
  async function callAnthropicAPI(apiKey, model, prompt, systemPrompt, maxRetries = 3) {
    let retryCount = 0;
    let retryDelay = 2000; // Start with 2 seconds
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1}: Making API request to Anthropic with model ${model}`);
        
        const requestBody = {
          model: model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        };
        
        console.log('Request headers:', {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': apiKey ? '(API key provided)' : '(No API key)'
        });
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(requestBody)
        });
        
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        const responseData = await response.json();
        console.log('Response data:', JSON.stringify(responseData, null, 2));
        
        if (!response.ok) {
          const errorMessage = responseData.error?.message || `API error: ${response.status}`;
          console.error('API error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        return responseData.content[0].text;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        
        retryCount++;
        
        // Check if it's a rate limit error (status code 429)
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          if (retryCount < maxRetries) {
            console.warn(`Rate limit exceeded. Waiting ${retryDelay/1000} seconds before retry.`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryDelay *= 2; // Exponential backoff
            continue;
          }
        } else if (retryCount < maxRetries) {
          // For other errors, also retry with backoff
          console.warn(`API error: ${error.message}. Retrying in ${retryDelay/1000} seconds.`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
          continue;
        }
        
        // If we've exhausted retries or it's not a retryable error
        throw error;
      }
    }
    
    throw new Error(`Failed to get response after ${maxRetries} attempts`);
  }

  // Translate text using Anthropic API with retry logic
  async function translateText(apiKey, text, model) {
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    translationResult.style.display = 'none';
    
    try {
      console.log('Starting translation process');
      console.log(`Model selected: ${model}`);
      console.log(`Text length: ${text.length} characters`);
      
      // Chunk the text if it's too large
      const chunks = chunkText(text);
      console.log(`Text split into ${chunks.length} chunks`);
      
      const translations = [];
      
      // System prompt for translation - identical to Python script
      const systemPrompt = `You are a skilled translator from Ancient Greek to English. 
Focus on accuracy while maintaining readability. 
Preserve the meaning, tone, and style of the original text.
When encountering specialized terminology or cultural references, translate them accurately.
Do not add explanatory notes or commentary to the translation.`;
      
      // Translate each chunk with retry logic
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Processing chunk ${i+1}/${chunks.length} (${chunk.length} characters)`);
        
        // User prompt with the text to translate - identical to Python script
        const userPrompt = "Please translate the following Ancient Greek text into English. Provide the translation only, without any additional information or commentary. Text to translate:\n\n" + chunk;
        
        try {
          // Call the Anthropic API directly
          const translation = await callAnthropicAPI(apiKey, model, userPrompt, systemPrompt);
          console.log(`Successfully translated chunk ${i+1}`);
          translations.push(translation);
        } catch (error) {
          console.error(`Error translating chunk ${i+1}:`, error);
          throw new Error(`Error translating chunk ${i+1}: ${error.message}`);
        }
      }
      
      // Combine translations
      console.log('All chunks translated successfully, combining results');
      const fullTranslation = translations.join('\n\n');
      
      // Store translation data
      translationData = {
        original: text,
        translation: fullTranslation,
        model: model,
        timestamp: new Date().toISOString()
      };
      
      // Display results
      console.log('Displaying translation results');
      displayResults(text, fullTranslation, model, chunks.length);
      
    } catch (error) {
      console.error('Translation error:', error);
      showError(`Translation failed: ${error.message}`);
    } finally {
      loadingSpinner.style.display = 'none';
    }
  }

  // Display translation results
  function displayResults(originalTextContent, translatedTextContent, model, numChunks) {
    // Set result values
    resultModel.textContent = model;
    
    if (numChunks > 1) {
      resultChunks.textContent = numChunks;
      chunksInfo.style.display = 'inline';
    } else {
      chunksInfo.style.display = 'none';
    }
    
    // Format and display texts
    originalText.innerHTML = formatTextForDisplay(originalTextContent);
    translatedText.innerHTML = formatTextForDisplay(translatedTextContent);
    
    // Show results
    translationResult.style.display = 'block';
  }

  // Format text for display
  function formatTextForDisplay(text) {
    return text.split('\n').map(line => {
      return line ? `<p>${line}</p>` : '<br>';
    }).join('');
  }

  // Copy translation to clipboard
  copyTranslationBtn.addEventListener('click', function() {
    const textToCopy = translatedText.textContent;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        alert('Translation copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text. Please try again.');
      });
  });

  // Export as plain text
  exportTxtBtn.addEventListener('click', function(e) {
    e.preventDefault();
    downloadFile(translationData.translation, 'translation.txt', 'text/plain');
  });

  // Export as HTML
  exportHtmlBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const htmlContent = generateHtmlExport(translationData);
    downloadFile(htmlContent, 'translation.html', 'text/html');
  });

  // Export as Markdown
  exportMarkdownBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const markdownContent = generateMarkdownExport(translationData);
    downloadFile(markdownContent, 'translation.md', 'text/markdown');
  });

  // Export as JSON
  exportJsonBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const jsonContent = JSON.stringify(translationData, null, 2);
    downloadFile(jsonContent, 'translation.json', 'application/json');
  });

  // Generate HTML export
  function generateHtmlExport(data) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Greek Translation</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #ddd;
    }
    .meta {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .columns {
      display: flex;
      gap: 2rem;
    }
    .column {
      flex: 1;
    }
    h2 {
      color: #4a90e2;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #4a90e2;
    }
    .text-content {
      background-color: #f5f7fa;
      padding: 1.5rem;
      border-radius: 4px;
      white-space: pre-wrap;
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.8;
    }
    footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
      font-size: 0.9rem;
      color: #666;
    }
    @media (max-width: 768px) {
      .columns {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Ancient Greek Translation</h1>
  </header>
  
  <div class="meta">
    <p><strong>Model:</strong> ${data.model}</p>
    <p><strong>Date:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
  </div>
  
  <div class="columns">
    <div class="column">
      <h2>Original Text (Ancient Greek)</h2>
      <div class="text-content">${data.original}</div>
    </div>
    
    <div class="column">
      <h2>English Translation</h2>
      <div class="text-content">${data.translation}</div>
    </div>
  </div>
  
  <footer>
    <p>Generated using Anthropic Claude AI</p>
  </footer>
</body>
</html>`;
  }

  // Generate Markdown export
  function generateMarkdownExport(data) {
    return `# Ancient Greek Translation

## Metadata
- **Model:** ${data.model}
- **Date:** ${new Date(data.timestamp).toLocaleString()}

## Original Text (Ancient Greek)

\`\`\`
${data.original}
\`\`\`

## English Translation

\`\`\`
${data.translation}
\`\`\`

---

*Generated using Anthropic Claude AI*`;
  }

  // Download file
  function downloadFile(content, filename, contentType) {
    const element = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  
  // Log initial application load
  console.log('Ancient Greek Translator application loaded');
}); 