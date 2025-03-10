import React from 'react';
import './TranslationResult.css';

const TranslationResult = ({ result }) => {
  const { original_text, translated_text, model, chunks } = result;

  const handleCopyTranslation = () => {
    navigator.clipboard.writeText(translated_text);
    alert('Translation copied to clipboard!');
  };

  const handleDownloadTranslation = () => {
    const element = document.createElement('a');
    const file = new Blob([translated_text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'translation.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="translation-result">
      <h2>Translation Result</h2>
      
      <div className="result-info">
        <p>
          <strong>Model:</strong> {model}
          {chunks > 1 && <span> | <strong>Chunks:</strong> {chunks}</span>}
        </p>
        
        <div className="result-actions">
          <button onClick={handleCopyTranslation} className="action-button">
            Copy Translation
          </button>
          <button onClick={handleDownloadTranslation} className="action-button">
            Download Translation
          </button>
        </div>
      </div>

      <div className="text-columns">
        <div className="text-column">
          <h3>Original Text</h3>
          <div className="text-content original">
            {original_text.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>

        <div className="text-column">
          <h3>English Translation</h3>
          <div className="text-content translation">
            {translated_text.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationResult; 