import React, { useState } from 'react';
import { generatePCBuild } from '../api';
import '../assets/css/Chatbot.css';

const Chatbot = () => {
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState('');
  const [pcBuild, setPcBuild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateBuild = async () => {
    setError(null);
    setOutput('');
    setPcBuild(null);
    setLoading(true);

    try {
      const { rawOutput, parsedPcBuild } = await generatePCBuild(description);
      if(!parsedPcBuild){
        setOutput(rawOutput);
      } else { 
        setPcBuild(parsedPcBuild); 
      }
    } catch (err) {
      setError('Failed to generate PC build. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <h1>Chatbot</h1>
      <textarea
        rows="4"
        cols="50"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter your PC build description..."
        className="chatbot-textarea"
      />
      <button
        onClick={handleGenerateBuild}
        className={`chatbot-button ${loading ? 'disabled' : ''}`}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate PC Build'}
      </button>
      {error && <p className="chatbot-error">{error}</p>}
      {output && (
        <div className="chatbot-output">
          <h2>Raw Output</h2>
          <pre>{output}</pre>
        </div>
      )}
      {pcBuild && (
        <div className="chatbot-output">
          <h2>PC Build</h2>
          <ul>
            {Object.entries(pcBuild).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value.Brand} - {value.Model}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chatbot;