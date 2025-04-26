import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, PlusCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { MdDelete } from 'react-icons/md';

const AddMedicinePage = ({ medicines, addMedicine, removeMedicine, onNext, onBack, formatCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search medicines in database
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // In a real app, replace with actual API call
      // Mock API response for demonstration
      setTimeout(() => {
        const mockResults = [
          { id: 1, name: "Paracetamol 500mg", manufacturer: "ABC Pharma", batch: "BT1234", price: 10.50, expiry: "2024-12-31", stock: 100 },
          { id: 2, name: "Amoxicillin 250mg", manufacturer: "XYZ Meds", batch: "BT4321", price: 15.75, expiry: "2025-06-30", stock: 75 },
          { id: 3, name: "Cetirizine 10mg", manufacturer: "Health Ltd", batch: "BT7890", price: 8.25, expiry: "2024-10-15", stock: 120 },
        ].filter(med => med.name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 500);
    } catch (error) {
      console.error('Error searching medicines:', error);
      setSearchResults([]);
      setIsSearching(false);
    }
  };
  
  // Auto search when query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);
  
  // Handle medicine selection
  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setQuantity(1);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= selectedMedicine.stock) {
      setQuantity(value);
    }
  };
  
  // Add selected medicine to cart
  const handleAddMedicine = () => {
    if (selectedMedicine && quantity > 0) {
      const medicineToAdd = {
        id: selectedMedicine.id,
        name: selectedMedicine.name,
        batch: selectedMedicine.batch,
        price: selectedMedicine.price,
        quantity: quantity,
        expiry: selectedMedicine.expiry,
        total: selectedMedicine.price * quantity
      };
      
      addMedicine(medicineToAdd);
      setSelectedMedicine(null);
      setQuantity(1);
    }
  };
  
  return (
    <motion.div
      key="add-medicine"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Medicine Search */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">Search Medicines</h3>
        
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
              placeholder="Search medicine by name"
            />
          </div>
        </div>
        
        {/* Search Results */}
        {isSearching ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="max-h-40 overflow-y-auto mb-4">
            <ul className="divide-y divide-gray-200 dark:divide-navy-700">
              {searchResults.map((medicine) => (
                <li 
                  key={medicine.id} 
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-800 px-2 rounded-lg"
                  onClick={() => handleSelectMedicine(medicine)}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-navy-700 dark:text-white">{medicine.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{medicine.manufacturer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-brand-500">{formatCurrency(medicine.price)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {medicine.stock}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : searchQuery && (
          <p className="text-center py-2 text-gray-500 dark:text-gray-400">No medicines found</p>
        )}
        
        {/* Selected Medicine */}
        {selectedMedicine && (
          <div className="bg-gray-50 dark:bg-navy-800 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-medium text-navy-700 dark:text-white">{selectedMedicine.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Batch: {selectedMedicine.batch} | Expires: {new Date(selectedMedicine.expiry).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-brand-500">{formatCurrency(selectedMedicine.price)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedMedicine.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full px-3 py-1 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-navy-700 dark:text-white"
                />
              </div>
              
              <motion.button
                onClick={handleAddMedicine}
                className="mt-auto flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <PlusCircle size={16} />
                Add to Cart
              </motion.button>
            </div>
          </div>
        )}
      </div>
      
      {/* Medicines Table */}
      <div className="bg-white dark:bg-navy-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-navy-700">
        <h3 className="text-lg font-semibold text-navy-700 dark:text-white mb-3">Added Medicines</h3>
        
        {medicines.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No medicines added yet. Search and add medicines above.
          </div>
        ) : (
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
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
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => removeMedicine(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MdDelete className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <ArrowLeft size={16} />
          Back
        </motion.button>
        
        <motion.button
          onClick={onNext}
          disabled={medicines.length === 0}
          className={`flex items-center gap-2 ${
            medicines.length === 0 
              ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
              : 'bg-brand-500 hover:bg-brand-600'
          } text-white px-4 py-2 rounded-lg transition-colors`}
          whileHover={medicines.length > 0 ? { scale: 1.01 } : {}}
          whileTap={medicines.length > 0 ? { scale: 0.99 } : {}}
        >
          Continue to Bill
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AddMedicinePage;
