import React, { useState, useEffect } from 'react';
import { listPart } from '../api';
import '../assets/css/Parts.css';

const Parts = ({ cart, onCartChange, user, setCart }) => {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [error, setError] = useState(null);

  const [selectedComponentType, setSelectedComponentType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchParts = async () => {
      try {
        const data = await listPart(selectedComponentType, undefined, searchQuery);
        setParts(data);
        setFilteredParts(data);
        console.log(data);
      } catch (err) {
        setError('Failed to fetch ' + selectedComponentType + ' parts');
        console.error('Error fetching parts:', err);
      }
    };

    if (selectedComponentType) {
      fetchParts();
    } else {
      setParts([]);
      setFilteredParts([]);
    }
  }, [selectedComponentType, searchQuery]);

  const getAWSImageURL = (slug) => {
    const baseURL = 'https://pccomposer.s3.amazonaws.com/';
    return `${baseURL}${slug}.jpg`;
  };


  const handleBuyClick = (part) => {
    console.log(`Adding ${part.part_name} to the cart (server).`);
    fetch('http://localhost:8000/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, part_id: part.part_id })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Server response from cart/add:", data);

        if (data.success) {
          fetch(`http://localhost:8000/cart?user_id=${user.user_id}`)
            .then(res => res.json())
            .then(updatedCart => setCart(updatedCart))
            .catch(console.error);
        }
      })
      .catch(err => console.error("Error adding to cart:", err));
  };

  const componentTypes = [
    { label: 'All Parts', value: 'all' },
    { label: 'CPU', value: 'cpu' },
    { label: 'Storage', value: 'storage' },
    { label: 'GPU', value: 'gpu' },
    { label: 'Motherboard', value: 'motherboard' },
    { label: 'Case', value: 'case' },
    { label: 'Cooling', value: 'cooling' },
  ];

  return (
    <div className="parts-container">
      <h1 className="parts-title">Parts List</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Filter UI */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ marginRight: "100px" }}>
          <div className="drop-down-menu">
            <select
              value={selectedComponentType}
              onChange={(e) => setSelectedComponentType(e.target.value)}
            >
              {componentTypes.map((component, index) => (
                <option key={index} value={component.value}>
                  {component.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <form className="search-bar">
            <div>
              <input
                placeholder="Search By Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>

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
                onClick={() => {
                  console.log("Button got clicked: part_id is " + part.part_id);
                  handleBuyClick(part)
                }}
              >
                Add to Cart
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Parts;
