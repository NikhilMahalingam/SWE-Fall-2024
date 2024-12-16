import React from 'react'
import pcCooling from '../assets/images/PCCooling3.jpg';
import ManWithComputer from '../assets/images/ManWIthComputer.png';
import '../assets/css/Home.css';
import Laptop from '../assets/images/laptop.png';
import GeForce from '../assets/images/GeForce.png';
import Ssd from '../assets/images/ssd.png';
import Headphones from '../assets/images/Headphones.png';
import Controller from '../assets/images/Controller.png';

function Home() {
  return (
    <div className="Home"
    style={{
      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${pcCooling})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh', 
    }}
    >
      <header className="Home-header">
        <h1>Welcome to PC Composer!</h1>
        <p>Want to compose beautiful personal computers?</p>
        <p>PC Composer easily achieves this</p>
        <p>using our chatbot, prebuilts, and custom-made</p>
        <p>database of parts.</p>

        <img
          src={ManWithComputer}
          alt ="Man with a Computer"
          className = "Home-page-image"
        />
        <h3>Our Parts</h3>
        <h5>We have an abundance of parts for users to checkout</h5>

      
        <div className = "Home-images-container">
          <img
            src={Laptop}
            alt ="Laptop"
            className = "Home-page-Laptop"
          />

          <img
            src={GeForce}
            alt ="GeForce"
            className = "Home-page-GeForce"
          />

          <img
            src={Ssd}
            alt ="Ssd"
            className = "Home-page-Ssd"
          />

          <img
            src={Headphones}
            alt ="Headphones"
            className = "Home-page-Headphones"
          />

          <img
            src={Controller}
            alt ="Controller"
            className = "Home-page-Controller"
          />
        </div>
      </header>
    </div>
  );
}

export default Home;
