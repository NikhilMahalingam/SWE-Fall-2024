import React, { useState } from 'react';
import { generatePCBuild, checkPartAvailability, fetchPartIdByName } from '../api';
import '../assets/css/Chatbot.css';

const Chatbot = ({ user, onUserChange, cart, onCartChange }) => {
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState('');
  const [pcBuild, setPcBuild] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState({}); // Tracks part availability
  const [addingToCart, setAddingToCart] = useState({}); // Tracks loading state for Add to Cart


  console.log('User in Chatbot:', user);
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

  const handleAddToCart = async (partName) => {
    if (!user) {
      setError('You must be logged in to add items to the cart.');
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [partName]: true }));

    try {
      // Fetch part_id using part name
      const response = await fetchPartIdByName(partName);
      const { part_id } = response;

      if (!part_id) {
        console.error('Part not found in database:', partName);
        setError('Unable to add item to cart. Part not found.');
        return;
      }

      // Send the part_id to the server to add to the cart
      const addToCartResponse = await fetch('http://localhost:8000/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, part_id }),
      });

      const result = await addToCartResponse.json();
      if (result.success) {
        console.log('Added to cart:', result.message);

        // Re-fetch cart data to update the state
        const updatedCartResponse = await fetch(`http://localhost:8000/cart?user_id=${user.user_id}`);
        const updatedCart = await updatedCartResponse.json();
        onCartChange(updatedCart);
      } else {
        console.error('Failed to add item to cart:', result.error);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart((prev) => ({ ...prev, [partName]: false }));
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
          <h2></h2>
        </div>
      )}
      {pcBuild && (
        <div className="chatbot-output">
          <h2>Parsed PC Build</h2>
          <ul>
            {Object.entries(pcBuild).map(([key, value]) => {
              const partName = `${value.Brand} ${value.Model}`;
              return (
                <li key={key}>
                  <strong>{key}:</strong> {value.Brand} - {value.Model}
                  <div>
                    {availability[key] === undefined ? (
                      <p>Checking availability...</p>
                    ) : availability[key] ? (
                      <button
                        className="chatbot-button"
                        onClick={() => handleAddToCart(partName)}
                        disabled={addingToCart[partName]}
                      >
                        {addingToCart[partName] ? 'Adding...' : 'Add to Cart'}
                      </button>
                    ) : (
                      <p>Out of Stock</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
