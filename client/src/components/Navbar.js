import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Navbar.css';
import logo from '../assets/images/logo_transparent.png';

function Navbar({ user, onUserChange }) {
  const handleLogout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        onUserChange(null);
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  return (
    <nav className="navbar">
      <div className="navbar-brand">
          <img src={logo} alt="App Logo" className="navbar-logo" />
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li>
          <Link to="/parts" className="navbar-link">Parts</Link>
        </li>
        <li>
          <Link to="/prebuilts" className="navbar-link">Pre-Builts</Link>
        </li>
        <li>
          <Link to="/chatbot" className="navbar-link">Chatbot</Link>
        </li>
        <li>
          <Link to="/cart" className="navbar-link">Cart</Link>
        </li>
        <li>
        {user 
        ? <text className="navbar-link">Welcome, {user.name}</text>
        : <Link to="/login" className="navbar-link">Login</Link>
        }
        </li>
        {user 
        ? <li><text className="navbar-link" onClick={handleLogout}>Logout</text></li>
        : null
        }
      </ul>
    </nav>
  );
}

export default Navbar;
