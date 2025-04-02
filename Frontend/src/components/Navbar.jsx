import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="nav-link">
          Medical Store Management
        </Link>
      </div>
      
      <button className="menu-btn" onClick={toggleMenu}>
        {menuActive ? "✕" : "☰"}
      </button>
      
      <ul className={`nav-links ${menuActive ? 'active' : ''}`}>
        <li><Link to="/" className="nav-link" onClick={() => setMenuActive(false)}>Home</Link></li>
        <li><Link to="/prescription-reader" className="nav-link" onClick={() => setMenuActive(false)}>Prescription Reader</Link></li>
        <li><Link to="/payment-records" className="nav-link" onClick={() => setMenuActive(false)}>Payment Records</Link></li>
        <li><Link to="/product-scanner" className="nav-link" onClick={() => setMenuActive(false)}>Product Scanner</Link></li>
        <li><Link to="/login-page" className="nav-link" onClick={() => setMenuActive(false)}>Log In</Link></li>
        <li><Link to="/admin" className="nav-link" onClick={() => setMenuActive(false)}>Admin</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
