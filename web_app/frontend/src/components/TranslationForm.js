import React, { useState } from 'react';
import './TranslationForm.css';

const TranslationForm = ({ onSubmit, models }) => {
  const [apiKey, setApiKey] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('claude-3-7-sonnet-latest');
  const [inputMethod, setInputMethod] = useState('text');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!apiKey) {
      alert('Please enter your Anthropic API key');
      return;
    }

    if (inputMethod === 'text' && !text) {
      alert('Please enter text to translate');
      return;
    }

    if (inputMethod === 'file' && !file) {
      alert('Please select a file to translate');
      return;
    }

    const formData = new FormData();
    formData.append('api_key', apiKey);
    formData.append('model', model);

    if (inputMethod === 'text') {
      formData.append('text', text);
    } else {
      formData.append('file', file);
    }

    onSubmit(formData);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div className="translation-form-container">
      <form onSubmit={handleSubmit} className="translation-form">
        <div className="form-group">
          <label htmlFor="apiKey">
            Anthropic API Key <span className="required">*</span>
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Anthropic API key"
            required
          />
          <small>
            Your API key is only used for translation and is not stored on our servers.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="model">Model</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {models.map((modelOption) => (
              <option key={modelOption.id} value={modelOption.id}>
                {modelOption.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <div className="input-method-selector">
            <button
              type="button"
              className={inputMethod === 'text' ? 'active' : ''}
              onClick={() => setInputMethod('text')}
            >
              Enter Text
            </button>
            <button
              type="button"
              className={inputMethod === 'file' ? 'active' : ''}
              onClick={() => setInputMethod('file')}
            >
              Upload File
            </button>
          </div>
        </div>

        {inputMethod === 'text' ? (
          <div className="form-group">
            <label htmlFor="text">
              Greek Text <span className="required">*</span>
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter Ancient Greek text to translate"
              rows="10"
              required={inputMethod === 'text'}
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="file">
              Upload File <span className="required">*</span>
            </label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.png,.jpg,.jpeg"
              required={inputMethod === 'file'}
            />
            <small>
              Supported formats: .txt, .pdf, .png, .jpg, .jpeg (max 16MB)
            </small>
          </div>
        )}

        <button type="submit" className="submit-button">
          Translate
        </button>
      </form>
    </div>
  );
};

export default TranslationForm; 