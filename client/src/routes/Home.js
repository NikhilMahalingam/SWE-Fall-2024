import logo from '../assets/images/logo_transparent.png';
import '../assets/css/Home.css';

function Home() {
  return (
    <div className="Home">
      <header className="Home-header">
        <img src={logo} className="Home-logo" alt="logo" />
        <h1>Welcome to PC Composer!</h1>
        <p>Compose beautiful personal computers using our chatbot,</p>
        <p>prebuilts, or custom-made database of parts.</p>
      </header>
    </div>
  );
}

export default Home;
