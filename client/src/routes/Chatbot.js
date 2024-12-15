import React, { useState } from 'react';
import { generatePCBuild, checkPartAvailability } from '../api';
import '../assets/css/Chatbot.css';

const Chatbot = () => {
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState('');
  const [pcBuild, setPcBuild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState({}); // Tracks part availability

  const handleGenerateBuild = async () => {
    setError(null);
    setOutput('');
    setPcBuild(null);
    setAvailability({});
    setLoading(true);

    try {
      const { rawOutput, parsedPcBuild } = await generatePCBuild(description);
      setOutput(rawOutput);
      setPcBuild(parsedPcBuild);
      const availabilityMap = {};
      for (const [key, value] of Object.entries(parsedPcBuild)) {
        const partName = `${value.Brand} ${value.Model}`;
        console.log(value);
        console.log(partName)
        const inStock = await checkPartAvailability(partName);
        availabilityMap[key] = inStock;
      }
      setAvailability(availabilityMap);
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
          <h2>Parsed PC Build</h2>
          <ul>
            {Object.entries(pcBuild).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value.Brand} - {value.Model}
                <div>
                  {availability[key] === undefined ? (
                    <p>Checking availability...</p>
                  ) : availability[key] ? (
                    <button className="chatbot-button">Add to Cart</button>
                  ) : (
                    <p>Out of Stock</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
