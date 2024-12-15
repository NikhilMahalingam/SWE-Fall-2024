// Login.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { auth, signInWithEmailAndPassword } from '../auth.js';
import '../assets/css/Login.css';

function Login({user, onUserChange}) {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/'; // Get the intended route 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userData = await signInWithEmailAndPassword(username, password);
      localStorage.setItem('user', JSON.stringify(userData));
      onUserChange(userData);
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Email:</label>
            <input
              type="email"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength="8"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Login</button>
        </form>
        {error ? <p>Error: {error}</p>: <></>}
        <p>
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );

}

async function comparePasword(password){ 
  
}

export default Login;