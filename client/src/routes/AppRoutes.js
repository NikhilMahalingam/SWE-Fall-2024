import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Cart from './Cart';
import Parts from './Parts';
import Prebuilts from './Prebuilts';
import Chatbot from './Chatbot';
import Login from '../components/Login';
import Register from '../components/Register';
import ProtectedRoute from '../ProtectedRoutes'; 

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/parts" element={<ProtectedRoute><Parts /></ProtectedRoute>} />
      <Route path="/prebuilts" element={<ProtectedRoute><Prebuilts /></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;