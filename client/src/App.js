import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import logo from './assets/images/logo_transparent.png';
//import './assets/css/App.css';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  let [cart, setCart] = useState([]);
  const [user, setUser] = useState(() => {
    // Restore user from localStorage on app load
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user && user.user_id) {
      fetch(`http://localhost:8000/cart?user_id=${user.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          setCart(data);
        })
        .catch((err) => console.error('Error fetching cart:', err));
    } else {
      setCart([]); 
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
  };


  return (
    <Router>
      <div className="App">
        <Navbar user={user}/>
        
          <AppRoutes cart={cart} user={user} onUserChange={setUser} onCartChange={setCart} />
          {/* <Route path="/login" element={<Login />} />
          <Route path ="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} /> */}

          {/* <Route path="/" element={
            <header className="App-header">
              <img src={logo} className="App-logo" alt="logo" />
              <p>
                Edit <code>src/App.js</code> and save to reload.
              </p>
              <a
                className="App-link"
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn React
              </a>
            </header>
          } /> */}
        
      </div>
    </Router>
  );
}

export default App;
