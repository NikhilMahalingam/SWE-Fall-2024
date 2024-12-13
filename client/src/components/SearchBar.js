import React, { useState } from 'react';

import searchLogo from '../assets/images/search-alt-1-svgrepo-com.svg'
const SearchBar  = ({onSearch}) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    onSearch(e.target.value); // Pass the search query to the parent component
  };

  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        width: "300px",
        display: "flex",
        justifyContent: "start",
        gap: "0.5em",
        alignItems: "center",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)", // Add this line for box shadow
      }}
    >

      <img src={searchLogo} alt="looking-glass" height={16} width={16} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          border: 'none',
          zIndex: "1",
        }}
      />
    </div>
    );
  }
export default SearchBar

