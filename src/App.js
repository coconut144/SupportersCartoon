import './App.css';
import './Header.css';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import Home from './Home';
import Event from './Event';
import Work from './Work';
import Support from './Support';
import GameHub from './GameHub';
import NaamtokGame from './NaamtokGame';
import NextGirlsGame from './NextGirlsGame';
import Footer from './Footer';


function App() {
  return (
    <Router>
      <div className="App">
        <header className="main-header">
          <Link to="/" className="site-name">Cartoon<small aria-hidden="true">♡ fan site</small></Link>

          <nav className="main-nav">
            <NavLink to="/" end className="nav-link">หน้าหลัก</NavLink>
            <NavLink to="/event" className="nav-link">กิจกรรม</NavLink>
            <NavLink to="/work" className="nav-link">วิดีโอ</NavLink>
            <NavLink to="/support" className="nav-link">ซัพพอร์ต</NavLink>
            <NavLink to="/game" className="nav-link">เกม</NavLink>
          </nav>
        </header>


        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/event" element={<Event />} />
            <Route path="/work" element={<Work />} />
            <Route path="/support" element={<Support />} />
            <Route path="/game" element={<GameHub />} />
            <Route path="/game/naamtok" element={<NaamtokGame />} />
            <Route path="/game/next-girls" element={<NextGirlsGame />} />
            {/* หน้าเดิมที่ถูกรวมเข้าหน้าหลักและ footer แล้ว เก็บไว้ไม่ให้ลิงก์เก่าเสีย */}
            <Route path="/artist" element={<Navigate to="/" replace />} />
            <Route path="/contact" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
