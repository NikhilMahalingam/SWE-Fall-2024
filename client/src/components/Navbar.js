import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Navbar.css';
import logo from '../assets/images/logo.png';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={logo} alt="App Logo" className="navbar-logo" />
        </Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/cart" className="navbar-link">Cart</Link>
        </li>
        <li>
          <Link to="/chatbot" className="navbar-link">Chatbot</Link>
        </li>
        <li>
          <Link to="/login" className="navbar-link">Login/Signin</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
