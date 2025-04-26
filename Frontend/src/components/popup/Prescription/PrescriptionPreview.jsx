import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Save, ChevronDown, ChevronUp, PlusCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

const PrescriptionPreview = ({ prescriptionData, onClose, onSave, onCancel }) => {
  const [editedData, setEditedData] = useState(null);
  const [editingSections, setEditingSections] = useState({
    patient_info: false,
    doctor_info: false,
    hospital_info: false,
    medications: false,
    additional_notes: false
  });
  const [expandedSections, setExpandedSections] = useState({
    patient_info: true,
    doctor_info: true,
    hospital_info: true,
    medications: true,
    additional_notes: true
  });

  // Initialize edited data when prescription data is received
  useEffect(() => {
    if (prescriptionData && prescriptionData.data) {
      setEditedData(JSON.parse(JSON.stringify(prescriptionData.data)));
    }
  }, [prescriptionData]);

  if (!editedData) return null;

  // Handle section toggle (expand/collapse)
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle edit mode toggle for a section
  const toggleEditMode = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Update text field value in a section
  const handleFieldChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Update a medication
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...editedData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setEditedData(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  // Add a new empty medication
  const addMedication = () => {
    const newMedication = {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    };
    
    setEditedData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  // Remove a medication
  const removeMedication = (index) => {
    setEditedData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  // Handle save click
  const handleSave = () => {
    // Prepare the data to be saved
    const dataToSave = {
      ...prescriptionData,
      data: editedData
    };
    
    // Call the onSave callback with the updated data
    onSave(dataToSave);
  };

  // Format keys for display
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div
        className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden border border-gray-200 dark:border-navy-700"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Prescription Preview
          </h2>
          <motion.button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Prescription Content - Scrollable */}
        <div className="p-6 dark:text-white max-h-[70vh] overflow-y-auto">
          {/* Prescription Image */}
          {editedData.image_data?.url && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">Prescription Image</h3>
              </div>
              <div className="relative aspect-[4/3] max-h-60 overflow-hidden bg-gray-100 dark:bg-navy-700 rounded-lg">
                <img
                  src={editedData.image_data.url}
                  alt="Prescription"
                  className="object-contain w-full h-full rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Patient Information Section */}
          {editedData.patient_info && (
            <div className="mb-6 border border-gray-200 dark:border-navy-600 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-navy-700 cursor-pointer"
                onClick={() => toggleSection('patient_info')}
              >
                <h3 className="font-medium text-gray-800 dark:text-white">Patient Information</h3>
                <div className="flex items-center">
                  {!editingSections.patient_info && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEditMode('patient_info');
                      }}
                      className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-600"
                    >
                      <Edit size={18} className="text-brand-500" />
                    </button>
                  )}
                  {expandedSections.patient_info ? 
                    <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : 
                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedSections.patient_info && (
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(editedData.patient_info).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatKey(key)}
                        </label>
                        {editingSections.patient_info ? (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleFieldChange('patient_info', key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-800 dark:text-white font-medium">
                            {value || 'Not specified'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editingSections.patient_info && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => toggleEditMode('patient_info')}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <Save size={16} />
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Doctor Information Section */}
          {editedData.doctor_info && (
            <div className="mb-6 border border-gray-200 dark:border-navy-600 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-navy-700 cursor-pointer"
                onClick={() => toggleSection('doctor_info')}
              >
                <h3 className="font-medium text-gray-800 dark:text-white">Doctor Information</h3>
                <div className="flex items-center">
                  {!editingSections.doctor_info && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEditMode('doctor_info');
                      }}
                      className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-600"
                    >
                      <Edit size={18} className="text-brand-500" />
                    </button>
                  )}
                  {expandedSections.doctor_info ? 
                    <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : 
                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedSections.doctor_info && (
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(editedData.doctor_info).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatKey(key)}
                        </label>
                        {editingSections.doctor_info ? (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleFieldChange('doctor_info', key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-800 dark:text-white font-medium">
                            {value || 'Not specified'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editingSections.doctor_info && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => toggleEditMode('doctor_info')}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <Save size={16} />
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hospital Information Section */}
          {editedData.hospital_info && (
            <div className="mb-6 border border-gray-200 dark:border-navy-600 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-navy-700 cursor-pointer"
                onClick={() => toggleSection('hospital_info')}
              >
                <h3 className="font-medium text-gray-800 dark:text-white">Hospital Information</h3>
                <div className="flex items-center">
                  {!editingSections.hospital_info && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEditMode('hospital_info');
                      }}
                      className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-600"
                    >
                      <Edit size={18} className="text-brand-500" />
                    </button>
                  )}
                  {expandedSections.hospital_info ? 
                    <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : 
                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedSections.hospital_info && (
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(editedData.hospital_info).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatKey(key)}
                        </label>
                        {editingSections.hospital_info ? (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleFieldChange('hospital_info', key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-800 dark:text-white font-medium">
                            {value || 'Not specified'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editingSections.hospital_info && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => toggleEditMode('hospital_info')}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <Save size={16} />
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Medications Section */}
          <div className="mb-6 border border-gray-200 dark:border-navy-600 rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-3 bg-gray-50 dark:bg-navy-700 cursor-pointer"
              onClick={() => toggleSection('medications')}
            >
              <h3 className="font-medium text-gray-800 dark:text-white">Medications ({editedData.medications?.length || 0})</h3>
              <div className="flex items-center">
                {!editingSections.medications && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEditMode('medications');
                    }}
                    className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-600"
                  >
                    <Edit size={18} className="text-brand-500" />
                  </button>
                )}
                {expandedSections.medications ? 
                  <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : 
                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                }
              </div>
            </div>
            
            {expandedSections.medications && (
              <div className="p-3">
                {editedData.medications && editedData.medications.length > 0 ? (
                  <div className="space-y-4">
                    {editedData.medications.map((medication, index) => (
                      <div key={index} className="border border-gray-200 dark:border-navy-600 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-navy-700 dark:text-white">
                            {editingSections.medications ? `Medication #${index + 1}` : (medication.name || `Medication #${index + 1}`)}
                          </h4>
                          {editingSections.medications && (
                            <button
                              onClick={() => removeMedication(index)}
                              className="text-red-500 hover:text-red-600 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {editingSections.medications ? (
                            <>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Name
                                </label>
                                <input
                                  type="text"
                                  value={medication.name || ''}
                                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                                  placeholder="Medication name"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Dosage
                                </label>
                                <input
                                  type="text"
                                  value={medication.dosage || ''}
                                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                                  placeholder="e.g., 500mg"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Frequency
                                </label>
                                <input
                                  type="text"
                                  value={medication.frequency || ''}
                                  onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                                  placeholder="e.g., Twice daily"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Duration
                                </label>
                                <input
                                  type="text"
                                  value={medication.duration || ''}
                                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                                  placeholder="e.g., 7 days"
                                />
                              </div>
                              <div className="col-span-full space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Instructions
                                </label>
                                <input
                                  type="text"
                                  value={medication.instructions || ''}
                                  onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                                  placeholder="Special instructions"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {medication.dosage && (
                                <div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Dosage:</span>
                                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                                    {medication.dosage}
                                  </span>
                                </div>
                              )}
                              
                              {medication.frequency && (
                                <div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Frequency:</span>
                                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                                    {medication.frequency}
                                  </span>
                                </div>
                              )}
                              
                              {medication.duration && (
                                <div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Duration:</span>
                                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                                    {medication.duration}
                                  </span>
                                </div>
                              )}
                              
                              {medication.instructions && (
                                <div className="col-span-full mt-2">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Instructions:</span>
                                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                                    {medication.instructions}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No medications found in this prescription.
                  </p>
                )}
                
                {editingSections.medications && (
                  <div className="mt-4 flex flex-col space-y-4">
                    <button
                      onClick={addMedication}
                      className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700"
                    >
                      <PlusCircle size={16} />
                      Add Medication
                    </button>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleEditMode('medications')}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <Save size={16} />
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Additional Notes Section */}
          {editedData.additional_notes && (
            <div className="mb-6 border border-gray-200 dark:border-navy-600 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-3 bg-gray-50 dark:bg-navy-700 cursor-pointer"
                onClick={() => toggleSection('additional_notes')}
              >
                <h3 className="font-medium text-gray-800 dark:text-white">Additional Notes</h3>
                <div className="flex items-center">
                  {!editingSections.additional_notes && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEditMode('additional_notes');
                      }}
                      className="mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-navy-600"
                    >
                      <Edit size={18} className="text-brand-500" />
                    </button>
                  )}
                  {expandedSections.additional_notes ? 
                    <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" /> : 
                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                  }
                </div>
              </div>
              
              {expandedSections.additional_notes && (
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(editedData.additional_notes).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatKey(key)}
                        </label>
                        {editingSections.additional_notes ? (
                          <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleFieldChange('additional_notes', key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-800 dark:text-white font-medium">
                            {value || 'Not specified'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {editingSections.additional_notes && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => toggleEditMode('additional_notes')}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
                      >
                        <Save size={16} />
                        Done
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with action buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-navy-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-navy-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
          >
            <Save size={16} />
            Save and Add to Cart
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrescriptionPreview;
