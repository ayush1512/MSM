import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditSectionPopup = ({ isOpen, onClose, sectionTitle, sectionData, onSave }) => {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    if (sectionData) {
      setFormData({ ...sectionData });
    }
  }, [sectionData]);
  
  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  // Format keys for display
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
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
            {/* Popup header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Edit {sectionTitle}
              </h2>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label 
                      htmlFor={key} 
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {formatKey(key)}
                    </label>
                    <input
                      type="text"
                      id={key}
                      value={value || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-navy-700 dark:text-white"
                      placeholder={`Enter ${formatKey(key).toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-navy-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 text-white rounded-full hover:bg-brand-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditSectionPopup;
