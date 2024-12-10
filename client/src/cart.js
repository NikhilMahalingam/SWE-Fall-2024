import React, {useState} from 'react';
import './assets/css/Cart.css';

function Cart() {

  const[cartItems, setCartItems] = useState([]);
  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      <p>Your cart is currently empty. Add some items to see them here!</p>
    </div>
  );
}

export default Cart;
