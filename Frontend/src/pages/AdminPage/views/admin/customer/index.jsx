import React, { useState, useEffect } from "react";
import CustomerCard from "./components/CustomerCard";
import TableTopCustomers from "./components/TableTopCustomers";
import CustomerHistoryCard from "./components/CustomerHistoryCard";
import CustomerFilter from "./components/CustomerFilter";
import Pagination from "./components/Pagination";
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";

import tableDataTopCustomers from "./variables/tableDataTopCustomers.json";
import { tableColumnsTopCustomers } from "./variables/tableColumnsTopCustomers";

const CustomerDashboard = () => {
  // Customer data state
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    alphabetFilter: '',
    customerType: 'all'
  });
  
  // New state for API data
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;
  
  // Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/customers`, {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCustomers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Failed to load customers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [API_URL]); // Re-fetch if API URL changes

  // Items per page - changed from 6 to 9 to accommodate three rows
  const customersPerPage = 9;

  // Calculate pagination indexes
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(customers.length / customersPerPage);

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {/* Customer Dashboard Header */}
        <div className="mb-4 flex flex-col justify-between md:flex-row md:items-center">
          <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
            Customer Management
          </h4>
          
          {/* Filter Component */}
          <CustomerFilter filter={filter} setFilter={setFilter} />
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {/* Customer Cards */}
            <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer) => (
                  <CustomerCard 
                    key={customer.id}
                    id={customer.id}
                    name={customer.name}
                    phone={customer.phone}
                    lastPurchase={customer.lastPurchase || "N/A"}
                    totalSpent={customer.totalSpent || "0.00"}
                    image={customer.image}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-500 dark:text-gray-400">
                  No customers found. Try adjusting your filters.
                </div>
              )}
            </div>

            {/* Pagination Component - only show if we have customers */}
            {customers.length > 0 && (
              <div className="mt-5 flex justify-center">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* right side section */}
      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        <TableTopCustomers
          extra="mb-5"
          columnsData={tableColumnsTopCustomers}
        />
        <CustomerHistoryCard />
      </div>
    </div>
  );
};

export default CustomerDashboard;
