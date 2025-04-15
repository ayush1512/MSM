import React from "react";
import Card from "components/card";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

const MedicationsSection = ({ medications = [], onEditMedication, onAddMedication, onDeleteMedication }) => {
  if (!medications || medications.length === 0) {
    return (
      <Card extra="mb-5 p-4">
        <div className="flex justify-between items-center mb-4">
          <h5 className="font-bold text-brand-700 dark:text-white text-lg">Medications</h5>
          <button
            onClick={onAddMedication}
            className="flex items-center justify-center py-2 px-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
          >
            <FiPlus className="h-4 w-4 mr-2" />
            Add Medication
          </button>
        </div>
        <p className="text-gray-500 dark:text-gray-400">No medications found</p>
      </Card>
    );
  }
  
  return (
    <Card extra="mb-5 p-4">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-bold text-brand-700 dark:text-white text-lg">Medications</h5>
        <button
          onClick={onAddMedication}
          className="flex items-center justify-center py-2 px-4 rounded-full bg-brand-500 text-white hover:bg-brand-600 transition-colors"
        >
          <FiPlus className="h-4 w-4 mr-2" />
          Add Medication
        </button>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-navy-700">
        {medications.map((medication, index) => (
          <div key={index} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <h6 className="font-bold text-navy-700 dark:text-white">
                {medication.name || "Medication " + (index + 1)}
              </h6>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditMedication(medication, index)}
                  className="flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-brand-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteMedication(index)}
                  className="flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-red-500 dark:text-red-400 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {medication.dosage && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Dosage:</span>
                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                    {medication.dosage}
                  </span>
                </div>
              )}
              
              {medication.frequency && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Frequency:</span>
                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                    {medication.frequency}
                  </span>
                </div>
              )}
              
              {medication.duration && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                    {medication.duration}
                  </span>
                </div>
              )}
              
              {medication.instructions && (
                <div className="col-span-full">
                  <span className="text-gray-500 dark:text-gray-400">Instructions:</span>
                  <span className="ml-1 font-medium text-navy-700 dark:text-white">
                    {medication.instructions}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default MedicationsSection;
