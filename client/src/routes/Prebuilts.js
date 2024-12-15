import React, {useState, useEffect} from 'react';
import { listPreBuilts } from '../api';
import '../assets/css/Prebuilts.css';

const Prebuilts = ({ cart, onCartChange, user }) => {
  const [prebuilts, setPrebuilts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrebuilts = async () => {
      try {
        const data = await listPreBuilts();
        setPrebuilts(data);
      } catch (err) {
        setError('Failed to fetch prebuilts');
        console.error('Error fetching prebuilts:', err);
      }
    };

    fetchPrebuilts();
  }, []);

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
            .then(updatedCart => onCartChange(updatedCart))
            .catch(console.error);
        }
      })
      .catch(err => console.error("Error adding to cart:", err));
  };

  const getAWSImageURL = (slug) => {
    const baseURL = 'https://pccomposer.s3.amazonaws.com/';
    return `${baseURL}${slug}.jpg`;
  };

  console.log(prebuilts);
  return (
    <div className="prebuilts-container">
      <h1 className="prebuilts-title">Pre-builts List</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul className="prebuilts-list">
        {Object.values(prebuilts).map((prebuild, index) => (
          <li key={index} className="prebuilts-item">
            {/* <img
              src={getAWSImageURL(part.slug)}
              alt={part.part_name}
              className="prebuilt-image"
            /> */}
            <div className="prebuilt-details">
              <div className="prebuilt-name">{prebuild.build_name}</div>
              <div className="prebuilt-price">${prebuild.build_price.toFixed(2)}</div>
              <ul>
                {prebuild.parts.map(part => 
                  (<li>{part.part_name} - ${part.unit_price.toFixed(2)}</li>)
                )}
              </ul>
            </div>
            <button 
                className="buy-button"
                onClick={() => {
                  if (user == null) {
                    alert("You are not logged in, please login to add to cart.");
                  } else {
                    for (const part of prebuild.parts) {
                      handleBuyClick(part);
                    }
                    alert("Pre-built added to cart!");
                  }
                }}>
                Buy
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Prebuilts;