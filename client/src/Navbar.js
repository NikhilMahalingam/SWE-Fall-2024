import React from 'react';
import { Link } from 'react-router-dom';
import './assets/css/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Signup</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;