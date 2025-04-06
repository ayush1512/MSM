import React, { useState, useRef, useEffect } from 'react';
import { FaPills } from 'react-icons/fa';
import { ScrollText } from 'lucide-react';
import { BiBrain } from 'react-icons/bi';
import Prescription from '../popup/Prescription';

const UpwardDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Open prescription popup and close dropdown
  const handleOpenPrescription = () => {
    setIsPrescriptionOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Prescription popup */}
      <Prescription 
        externalOpen={isPrescriptionOpen} 
        onClose={() => setIsPrescriptionOpen(false)}
        hideButton={true}
      />
      
      <div className="fixed bottom-6 right-6 z-50" ref={dropdownRef}>
        {/* Main dropdown button */}
        <button
          onClick={toggleDropdown}
          className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 text-white font-medium p-3 rounded-full shadow-lg shadow-gray-800/50 dark:shadow-gray-900/30 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-700 transition-all duration-200"
        >
          AI Scan
        </button>

        {/* Dropdown content that opens upward */}
        {isOpen && (
          <div className="absolute bottom-full mb-2 w-48 -left-16">
            <div className="flex flex-col space-y-3 p-2">
              <button 
                onClick={handleOpenPrescription}
                className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 text-white font-medium p-3 rounded-full shadow-lg shadow-gray-800/50 dark:shadow-gray-900/30 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-700 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <ScrollText size={20} />
                <span>Prescription</span>
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 text-white font-medium p-3 rounded-full shadow-lg shadow-gray-800/50 dark:shadow-gray-900/30 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-700 transition-all duration-200 flex items-center justify-center space-x-2">
                <FaPills className="text-lg" />
                <span>Products</span>
              </button>
              <button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 text-white font-medium p-3 rounded-full shadow-lg shadow-gray-800/50 dark:shadow-gray-900/30 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-700 transition-all duration-200 flex items-center justify-center space-x-2">
                <BiBrain className="text-lg" />
                <span>AI Assistant</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UpwardDropdown;