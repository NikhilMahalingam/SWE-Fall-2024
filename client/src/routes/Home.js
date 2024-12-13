import React from 'react'
import pcCooling from '../assets/images/PCCooling3.jpg';
import '../assets/css/Home.css';

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
        <p>Compose beautiful personal computers using our chatbot,</p>
        <p>prebuilts, or custom-made database of parts.</p>
      </header>
    </div>
  );
}

export default Home;
