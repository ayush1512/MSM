import React from "react";
import { MdShoppingCart, MdWarning } from "react-icons/md";
import Card from "components/card";
import { purchaseAlerts, expiryAlerts } from "../variables/tableData";

const StockAlerts = () => {
  return (
    <>
      {/* Products to Purchase */}
      <Card extra="mb-5">
        <div className="p-4 border-b border-gray-200 dark:border-navy-700">
          <div className="flex items-center">
            <MdShoppingCart className="h-6 w-6 text-brand-500 mr-2" />
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Products to Purchase
            </h4>
          </div>
        </div>
        
        <div className="px-4 py-3">
          {purchaseAlerts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No products need to be purchased at this time
            </p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-navy-700">
              {purchaseAlerts.map((item, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-navy-700 dark:text-white">
                        {item.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Current: {item.currentStock} | Minimum: {item.minStock}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-500">
                        Buy {item.purchaseQty}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last ordered: {item.lastOrdered}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      
      {/* Expiring Products */}
      <Card extra="mb-5">
        <div className="p-4 border-b border-gray-200 dark:border-navy-700">
          <div className="flex items-center">
            <MdWarning className="h-6 w-6 text-yellow-500 mr-2" />
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Expiring Soon
            </h4>
          </div>
        </div>
        
        <div className="px-4 py-3">
          {expiryAlerts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No products are expiring soon
            </p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-navy-700">
              {expiryAlerts.map((item, index) => (
                <div key={index} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium text-navy-700 dark:text-white">
                        {item.name}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.manufacturer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.daysToExpiry <= 30 ? 'text-red-500' : 'text-yellow-500'}`}>
                        Expires in {item.daysToExpiry} days
                      </p>
                      <p className="text-xs text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      
      {/* Quick Stats */}
      <Card>
        <div className="p-4">
          <h4 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
            Inventory Summary
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-navy-700 p-3 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-navy-700 dark:text-white">327</p>
            </div>
            <div className="bg-gray-50 dark:bg-navy-700 p-3 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-navy-700 dark:text-white">12</p>
            </div>
            <div className="bg-gray-50 dark:bg-navy-700 p-3 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-red-500">18</p>
            </div>
            <div className="bg-gray-50 dark:bg-navy-700 p-3 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Expiring</p>
              <p className="text-2xl font-bold text-yellow-500">23</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default StockAlerts;
