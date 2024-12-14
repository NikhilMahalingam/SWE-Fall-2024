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
  let [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <Navbar user={user} onUserChange={setUser}/>
        
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
