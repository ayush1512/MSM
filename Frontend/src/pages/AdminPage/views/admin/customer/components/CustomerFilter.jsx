import React, { useState } from "react";
import { MdFilterList, MdFilterAlt, MdClose } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomerFilter = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Handlers for filter changes
  const handleStartDateChange = (date) => {
    setFilter({
      ...filter,
      startDate: date
    });
  };

  const handleEndDateChange = (date) => {
    setFilter({
      ...filter,
      endDate: date
    });
  };

  const handleAlphabetFilterChange = (e) => {
    setFilter({
      ...filter,
      alphabetFilter: e.target.value
    });
  };

  const handleCustomerTypeChange = (e) => {
    setFilter({
      ...filter,
      customerType: e.target.value
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilter({
      startDate: null,
      endDate: null,
      alphabetFilter: '',
      customerType: 'all'
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-brand-500 dark:text-white bg-lightPrimary dark:bg-navy-700 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 transition-all"
      >
        <MdFilterList className="h-5 w-5" />
        Filter Customers
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
            {/* Date Range Filter */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <DatePicker
                  selected={filter.startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={filter.startDate}
                  endDate={filter.endDate}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
                  placeholderText="Start Date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={filter.endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={filter.startDate}
                  endDate={filter.endDate}
                  minDate={filter.startDate}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
                  placeholderText="End Date"
                />
              </div>
            </div>
            
            {/* Alphabetical Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name Starts With
              </label>
              <select
                value={filter.alphabetFilter}
                onChange={handleAlphabetFilterChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
              >
                <option value="">All</option>
                {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                  <option key={letter} value={letter}>{letter}</option>
                ))}
              </select>
            </div>
            
            {/* Customer Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Type
              </label>
              <select
                value={filter.customerType}
                onChange={handleCustomerTypeChange}
                className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-full text-sm dark:bg-navy-700 dark:text-white"
              >
                <option value="all">All Customers</option>
                <option value="new">New Customers</option>
                <option value="returning">Returning Customers</option>
                <option value="premium">Premium Customers</option>
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

export default CustomerFilter;
