import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Cart from './Cart';
import Parts from './Parts';
import Prebuilts from './Prebuilts';
import Chatbot from './Chatbot';
import Login from '../components/Login';
import Register from '../components/Register';

const AppRoutes = ({cart, user, onCartChange, onUserChange}) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login onUserChange={onUserChange} />} />
      <Route path="/register" element={<Register />}/>

      {/* Protected Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart cart={cart} onCartChange={onCartChange}  user={user} onUserChange={onUserChange} />} />
      <Route path="/parts" element={<Parts cart={cart} onCartChange={onCartChange} user={user} onUserChange={onUserChange} />}/>
      <Route path="/prebuilts" element={<Prebuilts cart={cart} onCartChange={onCartChange}/>} />
      <Route path="/chatbot" element={<Chatbot />} />
    </Routes>
  );
};

export default AppRoutes;