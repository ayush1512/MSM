import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ContactUs from './pages/ContactUs';
import PrescriptionReader from "./pages/PrescriptionReader";
import StockManagement from "./pages/StockManagement";
import PaymentRecords from "./pages/PaymentRecords";
import Billing from "./pages/Billing";
import ProductScanner from "./pages/ProductScanner";
import DebitCredit from "./pages/DebitCredit";
import LoginPage from "./pages/Login/LoginPage";

// Admin Page Imports
import AdminLayout from "./pages/AdminPage/layouts/admin";
import routes from "routes.js";
import Navbar from "components/navbar";
import { SidebarProvider } from './context/SidebarContext';

function AppContent(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = React.useState("Home Page");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = React.useState(true);

  // Advance

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);
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


  // Normal
  useEffect(() => {
    // Check URL parameters for auth success
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
    
    // Use environment variable for API URL
    const apiUrl = import.meta.env.VITE_API_URL;
    
    axios.get(`${apiUrl}/check-login`, { 
      withCredentials: true,
      timeout: 4000
    })
      .then(response => {
        console.log("Login response:", response.data);
        setUser(response.data.email);
      })
      .catch(error => {
        console.log("Login check failed:", error.message);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
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
      <SidebarProvider>
        {/* <Navbar user={user} /> */}
        <Navbar
          onOpenSidenav={() => setOpen(true)}
          logoText={"Horizon UI Tailwind React"}
          brandText={currentRoute}
          secondary={getActiveNavbar(routes)}
          {...rest}
        />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/prescription-reader" element={<PrescriptionReader user={user} />} />
          <Route path="/payment-records" element={<PaymentRecords />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/product-scanner" element={<ProductScanner />} />
          <Route path="/stock-management" element={<StockManagement/>}/>
          <Route path="/debit-credit" element={<DebitCredit/>}/>
          {user? null :  <Route path="/login-page" element={<LoginPage/>}/>}
          <Route path="/contact-us" element={<ContactUs/>}/>

          {/* Admin Page Routes */}
          <Route path="/admin/*" element={<AdminLayout open={open} />} />
        </Routes>
      </SidebarProvider>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
