import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, User, UserPlus, Search, Users } from 'lucide-react';
import axios from 'axios';

const CustomerSelectPage = ({ onNewCustomer, onExistingCustomer, customerDetails, handleCustomerChange, setCustomerDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('phone'); // 'phone' or 'name'
  const [customerResults, setCustomerResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get FRONTEND_URL from environment variables
  const FRONTEND_URL = import.meta.env.VITE_API_URL;
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Search for customers when search term changes
  useEffect(() => {
    // Only search if we have at least 3 characters
    if (searchTerm.length < 3) {
      setCustomerResults([]);
      return;
    }
    
    const searchCustomers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${FRONTEND_URL}/customers`, {
          params: {
            [searchBy]: searchTerm
          },
          withCredentials: true
        });
        
        setCustomerResults(response.data || []);
      } catch (err) {
        console.error('Error searching customers:', err);
        setError('Failed to search customers');
        setCustomerResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Debounce the search to avoid too many requests
    const timeoutId = setTimeout(() => {
      searchCustomers();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchBy, FRONTEND_URL]);
  
  // Select a customer from results
  const selectCustomer = (customer) => {
    setCustomerDetails({
      id: customer.id,
      name: customer.name,
      mobile: customer.phone,
      email: customer.email || '',
      address: customer.address || ''
    });
    
    // Close results and move to next step
    setCustomerResults([]);
    onExistingCustomer();
  };

  // Submit form to continue with the entered information
  const handleSubmit = (e) => {
    e.preventDefault();
    onExistingCustomer();
  };

  return (
    <motion.div
      key="customer-select"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing Customer Option */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-navy-700">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">Existing Customer</h3>
          
          {/* Search type toggle */}
          <div className="flex rounded-md mb-4 border border-gray-200 dark:border-navy-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setSearchBy('phone')}
              className={`flex-1 py-2 px-3 text-center text-sm font-medium ${
                searchBy === 'phone' 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Phone size={16} className="inline-block mr-1" />
              By Phone
            </button>
            <button
              type="button"
              onClick={() => setSearchBy('name')}
              className={`flex-1 py-2 px-3 text-center text-sm font-medium ${
                searchBy === 'name' 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <User size={16} className="inline-block mr-1" />
              By Name
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {searchBy === 'phone' ? 'Mobile Number' : 'Customer Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type={searchBy === 'phone' ? 'tel' : 'text'}
                  name={searchBy === 'phone' ? 'mobile' : 'name'}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder={searchBy === 'phone' ? "Enter customer mobile" : "Enter customer name"}
                />
              </div>
              
              {/* Customer search results */}
              {customerResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  <ul className="divide-y divide-gray-100 dark:divide-navy-700">
                    {customerResults.map(customer => (
                      <li 
                        key={customer.id} 
                        className="p-2 hover:bg-gray-50 dark:hover:bg-navy-700 cursor-pointer"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {customer.image ? (
                              <img
                                className="h-8 w-8 rounded-full"
                                src={customer.image}
                                alt={customer.name}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Loading indicator */}
              {loading && (
                <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  Searching customers...
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="mt-2 text-center text-sm text-red-500">
                  {error}
                </div>
              )}
              
              {/* No results */}
              {searchTerm.length >= 3 && !loading && customerResults.length === 0 && !error && (
                <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
                  No customers found. Try a different search or create a new customer.
                </div>
              )}
            </div>
          </form>
        </div>

        {/* New Customer Option */}
        <div className="bg-white dark:bg-navy-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-navy-700">
          <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">New Customer</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create a new customer profile for this sale.
          </p>
          <motion.button
            onClick={onNewCustomer}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-navy-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <UserPlus size={18} />
            Create New Customer
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerSelectPage;
