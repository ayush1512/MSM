import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from 'context/UserContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const { user, logout } = useUser();
  
  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };
  
  const handleLogout = async () => {
    await logout();
    // No need to navigate or reload here since UserContext will handle that
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles['navbar-brand']}>
        <Link to="/" className={styles['nav-link']}>
          Medical Store Management
        </Link>
      </div>
      
      <button className={styles['menu-btn']} onClick={toggleMenu}>
        {menuActive ? "✕" : "☰"}
      </button>
      
      <ul className={`${styles['nav-links']} ${menuActive ? styles.active : ''}`}>
        <li><Link to="/" className={styles['nav-link']} onClick={() => setMenuActive(false)}>Home</Link></li>
        <li><Link to="/prescription-reader" className={styles['nav-link']} onClick={() => setMenuActive(false)}>Prescription Reader</Link></li>
        {user ? <li><Link to="/payment-records" className={styles['nav-link']} onClick={() => setMenuActive(false)}>Payment Records</Link></li> : null}
        <li><Link to="/product-scanner" className={styles['nav-link']} onClick={() => setMenuActive(false)}>Product Scanner</Link></li>
        {user ? null : <li><Link to="/login-page" className={styles['nav-link']} onClick={() => setMenuActive(false)}>Log In</Link></li>}
        {user ? <li><Link to="/admin" className={styles['nav-link']} onClick={() => setMenuActive(false)}>Admin</Link></li> : null}
        {user ? <li><button onClick={handleLogout}>Logout</button></li> : null}
      </ul>
    </nav>
  );
};

export default Navbar;
