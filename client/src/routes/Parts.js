import React, { useState, useEffect } from 'react';
import { listParts } from '../api';

const Parts = () => {
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

  return (
    <div>
      <h1>Parts List</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {parts.map((part, index) => (
          <li key={index}>
            <strong>{part.part_name}</strong> - {part.brand} (${part.unit_price})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Parts;
