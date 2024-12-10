// Login.js
import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './assets/css/Login.css';

function Login() {
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
      await signInWithEmailAndPassword(auth, username, password); 
      navigate(from, { replace: true }); // Redirect to the intended route
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
        <p>
          New user? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );

}
export default Login;