import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContactUs from './pages/ContactUs';
import PrescriptionReader from "./pages/Prescription";
import ProductScanner from "./pages/ProductScanner";
import SalePage from "pages/SalePage";
import Demo from "./pages/Demo";

import 'animate.css';


// Admin Page Imports
import AdminLayout from "./pages/AdminPage/layouts/admin";
import routes from "routes.js";
import Navbar from "components/navbar";
import { SidebarProvider } from './context/SidebarContext';
import UpwardDropdown from 'components/dropup';
import { UserProvider, useUser } from './context/UserContext';
import AboutUs from "./pages/AboutUs";

function AppContent(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = React.useState("Home Page");
  const navigate = useNavigate();
  const { user, loading } = useUser();

  // Advance
  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes) => {
    let activeRoute = "Main Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        setCurrentRoute(routes[i].name);
      }
    }
    return activeRoute;
  };
  
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  // Check URL parameters for auth success
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authSuccess = params.get('auth_success');
    const authAction = params.get('auth_action');
    const email = params.get('email');
    
    // Clear URL parameters and show welcome message if needed
    if (authSuccess === 'true' && email) {
      // Remove query parameters
      navigate('/', { replace: true });
      
      // Show welcome message
      const message = authAction === 'signup' 
        ? `Welcome! Your account has been created with ${email}`
        : `Welcome back, ${email}`;
      setTimeout(() => alert(message), 500);
    }
  }, [location.search, navigate]);

  // Simple loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="relative h-32 w-32">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-800 absolute inset-0"></div>
          <div className="absolute inset-0 h-30 w-30 flex items-center justify-center">
            <img src="../shop_logo-removebg-preview.png" alt="logo" style={{maxWidth: "53%"}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar
        brandText={currentRoute}
        secondary={getActiveNavbar(routes)}
        {...rest}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prescription-reader" element={<PrescriptionReader />} />
        <Route path="/product-scanner" element={<ProductScanner />} />
        <Route path="/contact-us" element={<ContactUs/>}/>
        <Route path="/about-us" element={<AboutUs/>}/>
        <Route path="/demo" element={<Demo/>}/>

        {/* Admin Page Routes */}
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/sales" element={<SalePage />} />
      </Routes>
      <UpwardDropdown />
    </>
  );
}

function App(props) {
  return (
    <Router>
      <UserProvider>
        <SidebarProvider>
          <AppContent {...props} />
        </SidebarProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
