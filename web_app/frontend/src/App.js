import React, { useState, useEffect } from 'react';
import './App.css';
import TranslationForm from './components/TranslationForm';
import TranslationResult from './components/TranslationResult';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    // Fetch available models
    fetch('/api/models')
      .then(response => response.json())
      .then(data => setModels(data))
      .catch(error => console.error('Error fetching models:', error));
  }, []);

  const handleTranslate = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ancient Greek Translator</h1>
        <p>Translate Ancient Greek texts to English using AI</p>
      </header>

      <main className="App-main">
        <TranslationForm onSubmit={handleTranslate} models={models} />

        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {result && <TranslationResult result={result} />}
      </main>

      <footer className="App-footer">
        <p>
          Powered by Anthropic Claude AI | 
          <a href="https://github.com/yourusername/greek-translator" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App; 