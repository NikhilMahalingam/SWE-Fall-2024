import React, { useState, useEffect } from 'react';
import { listParts } from '../api';
import '../assets/css/Parts.css';

const Parts = ({ cart, onCartChange }) => {
  const [parts, setParts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const data = await listParts();
        setParts(data);
      } catch (err) {
        setError('Failed to fetch parts');
        console.error('Error fetching parts:', err);
      }
    };

    fetchParts();
  }, []);

  const getAWSImageURL = (slug) => {
    const baseURL = 'https://pccomposer.s3.amazonaws.com/';
    return `${baseURL}${slug}.jpg`;
  };

  const handleBuyClick = (part) => {
    console.log(`Adding ${part.part_name} to the cart.`);
  };

  return (
    <div className="parts-container">
      <h1 className="parts-title">Parts List</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul className="parts-list">
        {parts.map((part, index) => (
          <li key={index} className="part-item">
            <img
              src={getAWSImageURL(part.slug)}
              alt={part.part_name}
              className="part-image"
            />
            <div className="part-details">
              <div className="part-name">{part.part_name}</div>
              <div className="part-brand">{part.brand}</div>
              <div className="part-price">${part.unit_price}</div>
              <button 
                className="buy-button" 
                onClick={() => handleBuyClick(part)}>
                Buy
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Parts;
