import React, { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import StockManagement from "./StockManagement";
import PaymentRecords from "./PaymentRecords";
import DebitCredit from "./DebitCredit";

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
        {isAuthenticated && (
          <ul className="space-y-4">
            <li>
              <Link to="/admin/dashboard" className="hover:text-gray-300">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/stock-management" className="hover:text-gray-300">
                Stock Management
              </Link>
            </li>
            <li>
              <Link to="/admin/payment-records" className="hover:text-gray-300">
                Payment Records
              </Link>
            </li>
            <li>
              <Link to="/admin/debit-credit" className="hover:text-gray-300">
                Debit/Credit
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="hover:text-gray-300">
                Logout
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
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="stock-management" element={<StockManagement />} />
              <Route path="payment-records" element={<PaymentRecords />} />
              <Route path="debit-credit" element={<DebitCredit />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
