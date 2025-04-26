import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerSelectPage from './CustomerSelectPage';
import CustomerInfoPage from './CustomerInfoPage';
import AddMedicinePage from './AddMedicinePage';
import BillSummaryPage from './BillSummaryPage';

export default function Sales({ externalOpen, onClose, hideButton }) {
  // State management
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  
  // Customer details state
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    mobile: '',
    email: '',
    address: ''
  });
  
  // Medicines state
  const [medicines, setMedicines] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'amount'
  
  // Calculate final amount after discount
  const finalAmount = discountType === 'percentage' 
    ? totalAmount - (totalAmount * (discount / 100)) 
    : totalAmount - discount;
  
  // Determine if popup should be open based on internal or external state
  const isPopupOpen = externalOpen !== undefined ? externalOpen : isInternalOpen;
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Handle customer details change
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({
      ...customerDetails,
      [name]: value
    });
  };
  
  // Navigate to next page
  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };
  
  // Navigate to previous page
  const prevPage = () => {
    // If on new customer page and going back, reset new customer flag
    if (currentPage === 2 && isNewCustomer) {
      setIsNewCustomer(false);
    }
    setCurrentPage(currentPage - 1);
  };
  
  // Start new customer flow
  const handleNewCustomer = () => {
    setIsNewCustomer(true);
    nextPage();
  };
  
  // Use existing customer and skip to medicine page
  const handleExistingCustomer = () => {
    // For existing customer, skip customer info page
    setCurrentPage(3);
  };
  
  // Add medicine to cart
  const addMedicine = (medicine) => {
    setMedicines([...medicines, medicine]);
    setTotalAmount(totalAmount + medicine.total);
  };
  
  // Remove medicine from cart
  const removeMedicine = (index) => {
    const removedMed = medicines[index];
    const updatedMedicines = medicines.filter((_, i) => i !== index);
    
    setMedicines(updatedMedicines);
    setTotalAmount(totalAmount - removedMed.total);
  };
  
  // Handle discount change
  const handleDiscountChange = (e) => {
    setDiscount(parseFloat(e.target.value) || 0);
  };
  
  // Handle discount type change
  const handleDiscountTypeChange = (type) => {
    setDiscountType(type);
    // Reset discount when changing type
    setDiscount(0);
  };
  
  // Submit sale
  const handleSubmit = async () => {
    try {
      // Format sale data for API
      const saleData = {
        customer: customerDetails,
        medicines: medicines,
        totalAmount,
        discount,
        discountType,
        finalAmount
      };
      
      // API call would go here
      console.log('Submitting sale:', saleData);
      
      // Success message
      alert('Sale completed successfully!');
      
      // Reset and close
      resetAndClose();
    } catch (error) {
      console.error('Error submitting sale:', error);
      alert('Error: Failed to complete sale');
    }
  };
  
  // Print bill
  const handlePrint = () => {
    window.print();
  };
  
  // Reset all states and close popup
  const resetAndClose = () => {
    setCurrentPage(1);
    setIsNewCustomer(false);
    setCustomerDetails({
      name: '',
      mobile: '',
      email: '',
      address: ''
    });
    setMedicines([]);
    setTotalAmount(0);
    setDiscount(0);
    
    if (onClose) {
      onClose();
    } else {
      setIsInternalOpen(false);
    }
  };
  
  return (
    <div className="p-4">
      {/* Button to open sales (only shown when not in popup mode) */}
      {!hideButton && (
        <button 
          onClick={() => setIsInternalOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          New Sale
        </button>
      )}
      
      {/* Popup overlay with animation */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) resetAndClose();
            }}
          >
            <motion.div 
              className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-4xl mx-auto my-4 border border-gray-200 dark:border-navy-700 flex flex-col max-h-[90vh]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              {/* Popup header - fixed at top */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700 sticky top-0 bg-white dark:bg-navy-800 z-10">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {currentPage === 1 ? "New Sale" : 
                   currentPage === 2 ? "Customer Information" :
                   currentPage === 3 ? "Add Medicines" : "Bill Summary"}
                </h2>
                <motion.button 
                  onClick={resetAndClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Popup body - scrollable content */}
              <div className="p-6 dark:text-white overflow-y-auto">
                <AnimatePresence mode="wait">
                  {/* Page 1: Customer Selection */}
                  {currentPage === 1 && (
                    <CustomerSelectPage 
                      onNewCustomer={handleNewCustomer}
                      onExistingCustomer={handleExistingCustomer}
                      customerDetails={customerDetails}
                      handleCustomerChange={handleCustomerChange}
                      setCustomerDetails={setCustomerDetails}
                    />
                  )}
                  
                  {/* Page 2: New Customer Information */}
                  {currentPage === 2 && (
                    <CustomerInfoPage 
                      customerDetails={customerDetails}
                      handleCustomerChange={handleCustomerChange}
                      onNext={nextPage}
                      onBack={prevPage}
                    />
                  )}
                  
                  {/* Page 3: Add Medicines */}
                  {currentPage === 3 && (
                    <AddMedicinePage 
                      medicines={medicines}
                      addMedicine={addMedicine}
                      removeMedicine={removeMedicine}
                      onNext={nextPage}
                      onBack={prevPage}
                      formatCurrency={formatCurrency}
                    />
                  )}
                  
                  {/* Page 4: Bill Summary */}
                  {currentPage === 4 && (
                    <BillSummaryPage 
                      customerDetails={customerDetails}
                      medicines={medicines}
                      totalAmount={totalAmount}
                      discount={discount}
                      discountType={discountType}
                      finalAmount={finalAmount}
                      handleDiscountChange={handleDiscountChange}
                      handleDiscountTypeChange={handleDiscountTypeChange}
                      onBack={prevPage}
                      onSubmit={handleSubmit}
                      onPrint={handlePrint}
                      formatCurrency={formatCurrency}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
