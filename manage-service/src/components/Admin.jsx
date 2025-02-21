import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import StockManagement from "./StockManagement";
import PaymentRecords from "./PaymentRecords";
import DebitCredit from "./DebitCredit";


const Admin = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="flex min-h-screen">
    
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        {isAuthenticated && (
          <ul className="space-y-4">
            <li>
              <Link to="/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/stock-management" className="hover:text-gray-300">
                Stock Management
              </Link>
            </li>
            <li>
              <Link to="/payment-records" className="hover:text-gray-300">
                Payment Records
              </Link>
            </li>
            <li>
              <Link to="/debit-credit" className="hover:text-gray-300">
                Debit/Credit
              </Link>
            </li>
            <li>
              <Link to="/*/admin-login" className="hover:text-gray-300">
                Admin login
              </Link>
            </li>
          </ul>
        )}
      </nav>

    
      <div className="flex-grow p-6">
        <Routes>
  
          {!isAuthenticated ? (
            <>
              <Route
                path="login"
                element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />}
              />
              <Route path="*" element={<Navigate to="login" replace />} />
            </>
          ) : (
            <>
              <Route path="/vite-project/src/components/AdminDashboard.jsx"  element={<AdminDashboard/>} />
              <Route path="/stock-management/"  element={<StockManagement/>} />
              <Route path="/payment-records"  element={<PaymentRecords/>} />
              <Route path="/*/debit-credit" element={<DebitCredit/>} />
              {/* <Route path="*" element={<h1>404 - Page Not Found</h1>} /> */}
   </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
