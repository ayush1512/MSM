import React, { useEffect, useState } from "react";
import { MdShoppingCart, MdWarning } from "react-icons/md";
import Card from "components/card";

const StockAlerts = () => {
  const [purchaseAlerts, setPurchaseAlerts] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPurchaseAlerts = async () => {
      try {
        const response = await fetch(`${API_URL}/stock/products-to-purchase`, {
          credentials: "include",
        });
        const data = await response.json();
        setPurchaseAlerts(data);
      } catch (error) {
        console.error("Error fetching purchase alerts:", error);
      }
    };

    const fetchExpiryAlerts = async () => {
      try {
        const response = await fetch(`${API_URL}/stock/expiring-soon`, {
          credentials: "include",
        });
        const data = await response.json();
        setExpiryAlerts(data);
      } catch (error) {
        console.error("Error fetching expiry alerts:", error);
      }
    };

    fetchPurchaseAlerts();
    fetchExpiryAlerts();
  }, [API_URL]);

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
            <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
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

      {/* Expiring Soon */}
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
            <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
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
                      <p
                        className={`font-bold ${
                          item.daysToExpiry <= 30
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      >
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
    </>
  );
};

export default StockAlerts;
