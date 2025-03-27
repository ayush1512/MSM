
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; 


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="nav-link">
          Medical Store Management
        </Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/" className="nav-link">Home</Link></li>
        <li><Link to="/prescription-reader" className="nav-link">Prescription Reader</Link></li>
        {/* <li><Link to="/payment-records" className="nav-link">Payment Records</Link></li> */}
        <li><Link to="/product-scanner" className="nav-link">Product Scanner</Link></li>
        {/* <li><Link to="/login-page" className="nav-link">Log In</Link></li> */}
        <li><Link to="/admin" className="nav-link">Admin</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
