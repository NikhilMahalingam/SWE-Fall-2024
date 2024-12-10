import logo from '../assets/images/logo.png';
import '../assets/css/Home.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Welcome!</h1>
        <p>Compose beautiful personal computers using our chatbot,</p>
        <p>prebuilts, or custom-made database of parts.</p>
      </header>
    </div>
  );
}

export default App;
