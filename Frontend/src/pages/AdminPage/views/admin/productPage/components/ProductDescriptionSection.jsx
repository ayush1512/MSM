import React, { useState } from "react";
import Card from "components/card";
import { MdWarning, MdOutlineExpandMore, MdOutlineExpandLess } from "react-icons/md";
import { FaTemperatureLow } from "react-icons/fa";

const ProductDescriptionSection = ({ product }) => {
  const [expandedSection, setExpandedSection] = useState("uses"); // Default expanded section

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-bold text-navy-700 dark:text-white text-lg">
          Product Information
        </h4>
      </div>

      <div className="space-y-3">
        {/* Uses and Indications */}
        <div className="border border-gray-200 dark:border-navy-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("uses")}
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-navy-800 p-3 text-left"
          >
            <h5 className="font-semibold text-navy-700 dark:text-white">
              Uses & Indications
            </h5>
            {expandedSection === "uses" ? (
              <MdOutlineExpandLess className="text-lg text-gray-600 dark:text-gray-400" />
            ) : (
              <MdOutlineExpandMore className="text-lg text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === "uses" && (
            <div className="p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {product.description.uses}
              </p>
              
              {product.description.conditions && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Primary conditions treated:
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.description.conditions.map((condition, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 py-0.5 px-2 rounded-full"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mechanism of Action */}
        <div className="border border-gray-200 dark:border-navy-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("mechanism")}
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-navy-800 p-3 text-left"
          >
            <h5 className="font-semibold text-navy-700 dark:text-white">
              How It Works
            </h5>
            {expandedSection === "mechanism" ? (
              <MdOutlineExpandLess className="text-lg text-gray-600 dark:text-gray-400" />
            ) : (
              <MdOutlineExpandMore className="text-lg text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === "mechanism" && (
            <div className="p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {product.description.mechanism}
              </p>
            </div>
          )}
        </div>

        {/* Precautions & Warnings */}
        <div className="border border-gray-200 dark:border-navy-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("precautions")}
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-navy-800 p-3 text-left"
          >
            <h5 className="font-semibold text-navy-700 dark:text-white flex items-center">
              <MdWarning className="text-yellow-500 mr-1" />
              Precautions & Warnings
            </h5>
            {expandedSection === "precautions" ? (
              <MdOutlineExpandLess className="text-lg text-gray-600 dark:text-gray-400" />
            ) : (
              <MdOutlineExpandMore className="text-lg text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === "precautions" && (
            <div className="p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {product.description.precautions}
              </p>
              
              {product.description.sideEffects && product.description.sideEffects.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Common Side Effects:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    {product.description.sideEffects.map((effect, index) => (
                      <li key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Storage Instructions */}
        <div className="border border-gray-200 dark:border-navy-700 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection("storage")}
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-navy-800 p-3 text-left"
          >
            <h5 className="font-semibold text-navy-700 dark:text-white flex items-center">
              <FaTemperatureLow className="text-blue-500 mr-1" />
              Storage Instructions
            </h5>
            {expandedSection === "storage" ? (
              <MdOutlineExpandLess className="text-lg text-gray-600 dark:text-gray-400" />
            ) : (
              <MdOutlineExpandMore className="text-lg text-gray-600 dark:text-gray-400" />
            )}
          </button>
          
          {expandedSection === "storage" && (
            <div className="p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {product.description.storage}
              </p>
              
              {product.description.storageConditions && (
                <div className="flex items-center mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <FaTemperatureLow className="text-blue-500 mr-2" />
                  <span className="text-xs text-blue-800 dark:text-blue-400">
                    {product.description.storageConditions}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProductDescriptionSection;
