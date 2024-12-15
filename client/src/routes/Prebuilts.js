import React, {useState, useEffect} from 'react';
import { listPreBuilts } from '../api';
import '../assets/css/Prebuilts.css';

const Prebuilts = ({ cart, onCartChange }) => {
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

  const getAWSImageURL = (slug) => {
    const baseURL = 'https://pccomposer.s3.amazonaws.com/';
    return `${baseURL}${slug}.jpg`;
  };

  console.log(prebuilts);
  return (
    <div className="prebuilts-container">
      <h1 className="prebuilts-title">Prebuilts List</h1>
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
                onClick={() => {}}>
                Buy
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Prebuilts;