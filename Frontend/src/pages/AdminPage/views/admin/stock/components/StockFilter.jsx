import React, { useState } from "react";
import { MdFilterList, MdFilterAlt, MdClose } from "react-icons/md";

const StockFilter = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleCategoryChange = (e) => {
    setFilter({
      ...filter,
      category: e.target.value
    });
  };

  const handleExpiryStatusChange = (e) => {
    setFilter({
      ...filter,
      expiryStatus: e.target.value
    });
  };

  const handleStockLevelChange = (e) => {
    setFilter({
      ...filter,
      stockLevel: e.target.value
    });
  };

  const clearFilters = () => {
    setFilter({
      category: '',
      expiryStatus: '',
      stockLevel: ''
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-brand-500 dark:text-white bg-lightPrimary dark:bg-navy-700 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 transition-all"
      >
        <MdFilterList className="h-5 w-5" />
        Filter Products
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 md:w-96 bg-white dark:bg-navy-800 shadow-xl rounded-lg p-4 border border-gray-200 dark:border-navy-700">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-bold text-navy-700 dark:text-white flex items-center">
              <MdFilterAlt className="mr-1" /> Filter Options
            </h5>
            <button onClick={() => setIsOpen(false)}>
              <MdClose className="h-5 w-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={filter.category}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="tablet">Tablet</option>
                <option value="syrup">Syrup</option>
                <option value="powder">Powder</option>
                <option value="injection">Injection</option>
                <option value="cream">Cream</option>
              </select>
            </div>
            
            {/* Expiry Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expiry Status
              </label>
              <select
                value={filter.expiryStatus}
                onChange={handleExpiryStatusChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="expired">Expired</option>
                <option value="expiring-soon">Expiring Soon</option>
                <option value="good">Good</option>
              </select>
            </div>
            
            {/* Stock Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Level
              </label>
              <select
                value={filter.stockLevel}
                onChange={handleStockLevelChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="low">Low Stock</option>
                <option value="normal">Normal Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <button 
                onClick={clearFilters}
                className="px-3 py-1.5 border border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-400 rounded-full hover:bg-gray-50 dark:hover:bg-navy-700 text-sm transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 bg-brand-500 text-white rounded-full hover:bg-brand-600 text-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockFilter;
