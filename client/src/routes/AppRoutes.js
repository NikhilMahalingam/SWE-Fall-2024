import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Cart from '../Cart';
import Chatbot from '../Chatbot';
import Login from '../Login';
import Register from '../Register';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;