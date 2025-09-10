import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Home from "./pages/Home";
import AddSpot from './pages/AddSpot'; 
import SpotDetail from './pages/SpotDetail';
import Favorites from './pages/Favorites'; 
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav style={{ margin: '20px' }}>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/home" style={{ marginLeft: '10px' }}>Home</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/add-spot" element={<AddSpot />} />
          <Route path="/spot/:id" element={<SpotDetail />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;