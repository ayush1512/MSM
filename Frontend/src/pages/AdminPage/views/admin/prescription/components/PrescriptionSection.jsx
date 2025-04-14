import React from "react";
import Card from "components/card";
import { FiEdit2 } from "react-icons/fi";

const PrescriptionSection = ({ title, data, onEdit, nonEditable = false }) => {
  if (!data) {
    return null;
  }
  
  // Format keys for display
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  return (
    <Card extra="mb-5 p-4">
      <div className="flex justify-between items-center mb-4">
        <h5 className="font-bold text-brand-700 dark:text-white text-lg">{title}</h5>
        {!nonEditable && (
          <button
            onClick={onEdit}
            className="flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-brand-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatKey(key)}:
            </span>
            <span className="font-medium text-navy-700 dark:text-white">
              {value || "Not specified"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PrescriptionSection;
