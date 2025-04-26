import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Printer, Save } from 'lucide-react';
import { MdPercent } from 'react-icons/md';
import axios from 'axios';

const BillSummaryPage = ({ 
  customerDetails, 
  medicines, 
  totalAmount, 
  discount, 
  discountType, 
  finalAmount, 
  handleDiscountChange, 
  handleDiscountTypeChange, 
  onBack, 
  onSubmit, 
  onPrint, 
  formatCurrency 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL;
  
  const handleSubmit = async () => {
    // Reset any previous errors
    setSaveError(null);
    setIsSaving(true);
    
    try {
      // Format the data according to the backend expectations
      const saleData = {
        customerId: customerDetails.id || null,
        customer: {
          name: customerDetails.name || 'Walk-in Customer',
          mobile: customerDetails.mobile || '',
          email: customerDetails.email || '',
          address: customerDetails.address || ''
        },
        medicines: medicines.map(med => ({
          stock_id: med.id,
          name: med.name,
          batch: med.batch,
          price: med.price,
          quantity: med.quantity,
        })),
        subtotal: totalAmount,
        discount: discount,
        discountFormat: discountType,
        totalAmount: finalAmount,
        date: new Date().toISOString()
      };
      
      // Send the data to the backend
      const response = await axios.post(`${API_URL}/sales`, saleData, {
        withCredentials: true, // Important for session cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        // Call the parent's onSubmit handler to handle UI state 
        // (like closing popups, resetting state, etc.)
        onSubmit(response.data);
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      setSaveError(error.response?.data?.error || "Failed to save sale. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      key="bill-summary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Customer Info Section */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">Customer Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name:</p>
            <p className="text-navy-700 dark:text-white">{customerDetails.name || 'Walk-in Customer'}</p>
          </div>
          {customerDetails.mobile && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mobile:</p>
              <p className="text-navy-700 dark:text-white">{customerDetails.mobile}</p>
            </div>
          )}
          {customerDetails.email && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email:</p>
              <p className="text-navy-700 dark:text-white">{customerDetails.email}</p>
            </div>
          )}
          {customerDetails.address && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address:</p>
              <p className="text-navy-700 dark:text-white">{customerDetails.address}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Medicines Table */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">Medicine Details</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700">
            <thead className="bg-gray-50 dark:bg-navy-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-navy-900 divide-y divide-gray-200 dark:divide-navy-700">
              {medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-navy-700 dark:text-white">
                      {medicine.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Exp: {new Date(medicine.expiry).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {medicine.batch}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatCurrency(medicine.price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {medicine.quantity}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatCurrency(medicine.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Bill Summary */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">Bill Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-navy-700">
            <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
            <span className="font-medium text-navy-700 dark:text-white">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-gray-600 dark:text-gray-300">Discount:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDiscountTypeChange('percentage')}
                  className={`px-2 py-1 rounded-md ${
                    discountType === 'percentage' 
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' 
                      : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => handleDiscountTypeChange('amount')}
                  className={`px-2 py-1 rounded-md ${
                    discountType === 'amount' 
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' 
                      : 'bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  ₹
                </button>
                <input
                  type="number"
                  value={discount}
                  onChange={handleDiscountChange}
                  min="0"
                  step={discountType === 'percentage' ? "1" : "0.01"}
                  max={discountType === 'percentage' ? "100" : totalAmount}
                  className="w-24 px-2 py-1 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-right"
                />
              </div>
            </div>
            <span className="font-medium text-navy-700 dark:text-white">
              {formatCurrency(discountType === 'percentage' 
                ? (totalAmount * (discount / 100)) 
                : discount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-navy-700 text-lg font-bold">
            <span className="text-gray-800 dark:text-white">Total Amount:</span>
            <span className="text-navy-700 dark:text-white">
              {formatCurrency(finalAmount)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Display any save errors */}
      {saveError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg">
          {saveError}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={isSaving}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>
        
        <div className="flex gap-3">
          <motion.button
            onClick={onPrint}
            className="flex items-center gap-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isSaving}
          >
            <Printer size={18} />
            Print
          </motion.button>
          
          <motion.button
            onClick={handleSubmit}
            className={`flex items-center gap-2 ${isSaving ? 'bg-brand-400' : 'bg-brand-500 hover:bg-brand-600'} text-white px-6 py-2 rounded-lg transition-colors`}
            whileHover={!isSaving ? { scale: 1.01 } : {}}
            whileTap={!isSaving ? { scale: 0.99 } : {}}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Sale
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BillSummaryPage;
