import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ContactUs from './components/ContactUs';
import PrescriptionReader from "./components/PrescriptionReader";
import StockManagement from "./components/StockManagement";
import PaymentRecords from "./components/PaymentRecords";
import Billing from "./components/Billing";
import ProductScanner from "./components/ProductScanner";
import DebitCredit from "./components/DebitCredit";
import Admin from './components/Admin.jsx';
import LoginPage from "./components/Login/LoginPage";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        clearTimeout(checkLoginTimeout);
        setLoading(false);
      });
  }, []);

  // Simple loading indicator
  if (!loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800">
          <img src="./shop_logo-removebg-preview.png" alt="logo" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prescription-reader" element={<PrescriptionReader />} />
        <Route path="/payment-records" element={<PaymentRecords />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/product-scanner" element={<ProductScanner />} />
        {user? <Route path="/admin/*" element={<Admin user={user} />} /> : null}
        <Route path="/stock-management" element={<StockManagement/>}/>
        <Route path="/debit-credit" element={<DebitCredit/>}/>
        {user? null :  <Route path="/login-page" element={<LoginPage/>}/>}
        <Route path="/dashboard" element={<AdminDashboard/>}/>
        <Route path="/contact-us" element={<ContactUs/>}/>
      </Routes>
    </Router>
  );
}

export default App;
