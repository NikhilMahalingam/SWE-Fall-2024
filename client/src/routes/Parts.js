import React, { useState, useEffect } from 'react';
import {listPart} from '../api';
import '../assets/css/Parts.css';


const Parts = ({ cart, onCartChange }) => {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [error, setError] = useState(null);
  

  // Filter state
  const [selectedComponentType, setSelectedComponentType] = useState('all');
  const [searchQuery, setSearchQuery] = useState ('');

  // Fetch parts from the API
  useEffect(() => {
    const fetchParts = async () => {
      try {
        
        const data = await listPart(selectedComponentType, /*componentAttribute = */ undefined, searchQuery); 
        setParts(data);
        setFilteredParts(data); 

        console.log(data)
      } catch (err) {
        setError('Failed to fetch ' + selectedComponentType +  ' parts');
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


  // useEffect(() => {
  //   const fetchParts = async () => {
  //     try {
  //       const data = await listParts();
  //       setParts(data);
  //     } catch (err) {
  //       setError('Failed to fetch parts');
  //       console.error('Error fetching parts:', err);
  //     }
  //   };

  //   fetchParts();
  // }, []);

  const getAWSImageURL = (slug) => {
    const baseURL = 'https://pccomposer.s3.amazonaws.com/';
    return `${baseURL}${slug}.jpg`;
  };

  const handleBuyClick = (part) => {
    console.log(`Adding ${part.part_name} to the cart.`);
  };

  // Component Type Filter UI
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
       <div style={{ display: "flex", justifyContent: "space-between"}}>
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
                  value = {searchQuery}
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
