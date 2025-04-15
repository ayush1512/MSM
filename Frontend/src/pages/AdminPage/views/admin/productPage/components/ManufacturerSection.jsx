import React from "react";
import Card from "components/card";
import { MdLocationOn, MdCalendarToday, MdNumbers, MdBusiness } from "react-icons/md";

const ManufacturerSection = ({ product }) => {
  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-bold text-navy-700 dark:text-white text-lg">
          Manufacturer & Supply
        </h4>
      </div>

      <div className="flex items-center mb-4 pb-4 border-b border-gray-200 dark:border-navy-700">
        {product.manufacturer.logo ? (
          <img 
            src={product.manufacturer.logo} 
            alt={product.manufacturer.name} 
            className="h-10 w-10 mr-3 rounded-md object-contain bg-white p-1"
          />
        ) : (
          <div className="h-10 w-10 mr-3 rounded-md bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
            <MdBusiness className="text-gray-500 dark:text-gray-400 text-xl" />
          </div>
        )}
        
        <div>
          <h5 className="font-semibold text-navy-700 dark:text-white">
            {product.manufacturer.name}
          </h5>
          <p className="text-sm flex items-center text-gray-600 dark:text-gray-400">
            <MdLocationOn className="mr-1" />
            {product.manufacturer.location}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Batch Information
          </h6>
          <div className="flex flex-col">
            {product.batches.map((batch, index) => (
              <div key={index} className="bg-gray-50 dark:bg-navy-800 p-3 rounded-lg">
                <div className="flex justify-between">
                  <p className="text-sm font-semibold text-navy-700 dark:text-white">
                    Batch #{batch.number}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    batch.expired ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                    batch.expiringSoon ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {batch.expired ? 'Expired' : batch.expiringSoon ? 'Expiring Soon' : 'Valid'}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <MdCalendarToday className="mr-1" />
                  <span>MFG: {batch.manufactureDate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <MdCalendarToday className="mr-1" />
                  <span>EXP: {batch.expiryDate}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Qty: {batch.quantity}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Distributors & Suppliers
          </h6>
          <div className="space-y-2">
            {product.suppliers.map((supplier, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-navy-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-navy-700 dark:text-white">
                    {supplier.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Last supplied: {supplier.lastSupplied}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ₹{supplier.price}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Min order: {supplier.minOrder}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ManufacturerSection;
