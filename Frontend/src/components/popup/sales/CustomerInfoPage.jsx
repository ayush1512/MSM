import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';

const CustomerInfoPage = ({ customerDetails, handleCustomerChange, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <motion.div
      key="customer-info"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-4"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer Name*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                onChange={handleCustomerChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Full Name"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mobile Number*
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
                placeholder="Phone Number"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={customerDetails.email}
                onChange={handleCustomerChange}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Email Address (Optional)"
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <MapPin size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <textarea
                name="address"
                value={customerDetails.address}
                onChange={handleCustomerChange}
                rows="3"
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                placeholder="Full Address (Optional)"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <motion.button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
          
          <motion.button
            type="submit"
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Continue
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CustomerInfoPage;
