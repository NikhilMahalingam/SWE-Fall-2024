import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../Home';
import Cart from '../Cart';
import Chatbot from '../Chatbot';
import Login from '../Login';
import Register from '../Register';
import ProtectedRoute from './ProtectedRoute'; 

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;