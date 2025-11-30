

import './App.css';
import './Header.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Contact from './contact';
import Artist from './Artist';
import Event from './Event';
import Work from './Work';
import { NavLink } from 'react-router-dom';


function App() {
  return (
    <Router>
      <div className="App">
        <header className="main-header">
  <div className="logo-box">
    <img src="/images/18813.jpg" alt="Logo" className="logo-img" />
  </div>

  <nav className="main-nav">
    <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>หน้าหลัก</NavLink>
    <NavLink to="/artist" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>ศิลปิน</NavLink>
    <NavLink to="/event" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>กิจกรรม</NavLink>
    <NavLink to="/work" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>ผลงาน</NavLink>
    <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>ช่องทางการติดตาม</NavLink>
  </nav>
</header>


        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artist" element={<Artist />} />
            <Route path="/event" element={<Event />} />
            <Route path="/work" element={<Work />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
