import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const RestockModal = ({ isOpen, onClose, product }) => {
  const [quantity, setQuantity] = useState("");
  const [supplier, setSupplier] = useState("");
  const [requestNotes, setRequestNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulated API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Automatically close the modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-navy-700"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Restock {product.name}
              </h2>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                disabled={isLoading}
              >
                <X size={24} />
              </motion.button>
            </div>
            
            {/* Form content */}
            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                    <svg
                      className="h-6 w-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                    Restock Request Submitted
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your request for {quantity} units has been sent to the supplier.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label 
                        htmlFor="product-info" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Product
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Current Stock: {product.stock} units
                      </span>
                    </div>
                    <input
                      type="text"
                      id="product-info"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white bg-opacity-50"
                      value={`${product.name} - ${product.strength}`}
                      disabled
                    />
                  </div>
                
                  <div className="mb-4">
                    <label 
                      htmlFor="quantity" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Quantity to Order*
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      min="1"
                    />
                    {product.aiInsights?.restockAlert?.suggestedQuantity && (
                      <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
                        Suggested order: {product.aiInsights.restockAlert.suggestedQuantity} units
                      </p>
                    )}
                  </div>
                
                  <div className="mb-4">
                    <label 
                      htmlFor="supplier" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Select Supplier*
                    </label>
                    <select
                      id="supplier"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      required
                    >
                      <option value="">Choose a supplier</option>
                      {product.manufacturer.distributors.map((distributor, index) => (
                        <option key={index} value={distributor}>{distributor}</option>
                      ))}
                    </select>
                  </div>
                
                  <div className="mb-6">
                    <label 
                      htmlFor="notes" 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                      placeholder="Any special instructions..."
                      value={requestNotes}
                      onChange={(e) => setRequestNotes(e.target.value)}
                    ></textarea>
                  </div>
                
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-navy-700"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 flex items-center justify-center gap-2 ${
                        isLoading ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Processing...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RestockModal;
