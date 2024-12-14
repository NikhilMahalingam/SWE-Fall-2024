// Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from '../auth.js';
import '../assets/css/Register.css';
import bcryptjs from 'bcryptjs';
const bycrypt = require('bcryptjs');

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const hashedPassword = await hashPassword(password);
      console.log('Type of hashedPassword: ', typeof hashedPassword);
      console.log('Hashed password: ', hashedPassword);
      await createUserWithEmailAndPassword(name, username, hashedPassword);
      alert('Account created successfully');
      navigate('/login');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>New Account</h1>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-name">Name:</label>
            <input
              type="name"
              id="new-name"
              name="new-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-username">Email:</label>
            <input
              type="email"
              id="new-username"
              name="new-username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">Password:</label>
            <input
              type="password"
              id="new-password"
              name="new-password"
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              required
              minLength="8"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

async function hashPassword(password){ 
  const saltRounds = 10; 
  try {
    const hash = bcryptjs.hashSync(password, 10);   
    if (typeof hash !== 'string') {
      throw new Error('Hash is not a string');
    }
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; 
  }
}

export default Register;