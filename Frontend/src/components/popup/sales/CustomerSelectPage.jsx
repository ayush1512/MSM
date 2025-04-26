import React from 'react';
import { motion } from 'framer-motion';
import { Phone, UserPlus } from 'lucide-react';

const CustomerSelectPage = ({ onNewCustomer, onExistingCustomer, customerDetails, handleCustomerChange }) => {
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
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="mobile"
                  value={customerDetails.mobile}
                  onChange={handleCustomerChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Enter customer mobile"
                  required
                />
              </div>
            </div>
            <motion.button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Continue with Existing Customer
            </motion.button>
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
