import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ContactUs from './components/ContactUs';
import PrescriptionReader from "./components/PrescriptionReader";
import StockManagement from "./components/StockManagement";
import PaymentRecords from "./components/PaymentRecords";
// import Billing from "./components/Billing";
import ProductScanner from "./components/ProductScanner";
import DebitCredit from "./components/DebitCredit";
import Admin from '/src/components/Admin.jsx';
// import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";




function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prescription-reader" element={<PrescriptionReader />} />
        <Route path="/payment-records" element={<PaymentRecords />} />
        {/* <Route path="/billing" element={<Billing />} /> */}
        <Route path="/product-scanner" element={<ProductScanner />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/stock-management" element={<StockManagement/>}/>
        <Route path="/debit-credit" element={<DebitCredit/>}/>
        {/* <Route path="/login-page" element={<LoginPage/>}/> */}
        <Route path="/dashboard" element={<AdminDashboard/>}/>
        <Route path="/contact-us" element={<ContactUs/>}/>
      </Routes>
    </Router>
  );
}

export default App;
