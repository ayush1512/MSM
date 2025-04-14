import React from "react";
import Card from "components/card";
import { Badge } from "components/badge";
import { 
  MdLocalShipping, 
  MdRestartAlt, 
  MdNotifications, 
  MdDownload, 
  MdEmail 
} from "react-icons/md";

const ProductHeader = ({ product }) => {
  // Stock status label and color
  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { label: "Out of Stock", color: "red" };
    if (quantity < 10) return { label: "Low Stock", color: "yellow" };
    if (quantity < 20) return { label: "Moderate", color: "blue" };
    return { label: "In Stock", color: "green" };
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* Left section: Product image and basic info */}
        <div className="flex items-center mb-4 md:mb-0">
          <div className="h-24 w-24 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center mr-4 overflow-hidden">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-3xl font-bold text-gray-400 dark:text-gray-600">
                {product.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center">
              <h3 className="font-bold text-xl text-navy-700 dark:text-white">
                {product.name}
              </h3>
              <Badge 
                className={`ml-3 bg-${stockStatus.color}-100 text-${stockStatus.color}-800 dark:bg-${stockStatus.color}-900/30 dark:text-${stockStatus.color}-400`}
              >
                {stockStatus.label}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {product.genericName} • {product.categoryName}
            </p>
            
            <div className="flex items-center mt-2">
              <p className="font-bold text-lg text-brand-500">
                ₹{product.price}
              </p>
              <div className="mx-3 h-4 w-0.5 bg-gray-300 dark:bg-navy-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.dosageForm} • {product.strength} • Pack of {product.packSize}
              </p>
            </div>
          </div>
        </div>
        
        {/* Right section: Action buttons */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors">
            <MdRestartAlt size={20} />
            <span>Restock</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-800 dark:text-white rounded-lg transition-colors">
            <MdNotifications size={20} />
            <span>Set Alert</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-800 dark:text-white rounded-lg transition-colors">
            <MdDownload size={20} />
            <span>Report</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-800 dark:text-white rounded-lg transition-colors">
            <MdEmail size={20} />
            <span>Contact</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductHeader;
