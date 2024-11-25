import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Cart from '../Cart';
import Chatbot from '../Chatbot';
import Login from '../Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};

export default AppRoutes;