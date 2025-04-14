import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EditMedicationPopup = ({ isOpen, onClose, medication, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: ""
  });
  
  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || "",
        dosage: medication.dosage || "",
        frequency: medication.frequency || "",
        duration: medication.duration || "",
        instructions: medication.instructions || ""
      });
    }
  }, [medication]);
  
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
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
                Edit Medication
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
                <div>
                  <label 
                    htmlFor="medication-name" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Medication Name
                  </label>
                  <input
                    type="text"
                    id="medication-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-navy-700 dark:text-white"
                    placeholder="Enter medication name"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="medication-dosage" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Dosage
                  </label>
                  <input
                    type="text"
                    id="medication-dosage"
                    value={formData.dosage}
                    onChange={(e) => handleChange('dosage', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-navy-700 dark:text-white"
                    placeholder="E.g. 500mg"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="medication-frequency" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Frequency
                  </label>
                  <input
                    type="text"
                    id="medication-frequency"
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-navy-700 dark:text-white"
                    placeholder="E.g. Twice daily"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="medication-duration" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Duration
                  </label>
                  <input
                    type="text"
                    id="medication-duration"
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-navy-700 dark:text-white"
                    placeholder="E.g. 7 days"
                  />
                </div>
                
                <div>
                  <label 
                    htmlFor="medication-instructions" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Instructions
                  </label>
                  <textarea
                    id="medication-instructions"
                    value={formData.instructions}
                    onChange={(e) => handleChange('instructions', e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 dark:bg-navy-700 dark:text-white"
                    placeholder="Enter any special instructions"
                    rows={3}
                  />
                </div>
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

export default EditMedicationPopup;
