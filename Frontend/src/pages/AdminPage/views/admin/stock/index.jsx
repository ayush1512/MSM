import React, { useState, useEffect } from "react";
import StockTable from "./components/StockTable";
import StockAlerts from "./components/StockAlerts";
import StockFilter from "./components/StockFilter";
import { MdDelete } from "react-icons/md";
import InventoryMovementChart from "components/charts/InventoryMovementChart";

const StockManagement = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState({
    category: '',
    expiryStatus: '',
    stockLevel: ''
  });
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${VITE_API_URL}/stock`, {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch stock data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Transform the data to match our table's expected format
        const transformedData = data.map(item => ({
          id: item.id,
          name: item.name,
          manufacturer: item.manufacturer,
          category: item.category || 'Uncategorized',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.stock) || 0,
          expiryDate: item.expiry,
          batch: item.batch
        }));
        
        setStockData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching stock data:", err);
        setError("Failed to load stock data. Please try again later.");
        // Keep any existing data if there's an error
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []); // Empty dependency array means this runs once on component mount

  // Handle bulk deletion
  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (window.confirm(`Delete ${selectedItems.length} selected items?`)) {
      console.log("Deleting items:", selectedItems);
      // Here you would implement the actual deletion logic
      setSelectedItems([]);
    }
  };

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Main content - Stock Table */}
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {/* Header Section - Styled like Customer page */}
        <div className="mb-4 flex flex-col justify-between md:flex-row md:items-center">
          <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
            Inventory Management
          </h4>
          
          {/* Filter Component */}
          <div className="mt-3 md:mt-0 flex items-center gap-4">
            <StockFilter filter={filter} setFilter={setFilter} />
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                <MdDelete className="h-5 w-5" />
                <span className="hidden sm:inline">Delete</span>
                <span className="inline">({selectedItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards/Table */}
        <div className="z-20">
          {loading ? (
            <div className="bg-white dark:bg-navy-800 rounded-xl p-6 shadow-md flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : error ? (
            <div className="bg-white dark:bg-navy-800 rounded-xl p-6 shadow-md">
              <div className="text-red-500 text-center py-4">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="mx-auto block px-4 py-2 bg-brand-500 text-white rounded-lg mt-2"
              >
                Retry
              </button>
            </div>
          ) : (
            <StockTable 
              tableData={stockData} 
              selectedItems={selectedItems}
              setSelectedItems={setSelectedItems}
              filter={filter}
            />
          )}
        </div>

        {/* Add Inventory Movement Chart below the stock table */}
        <div className="mt-5">
          <InventoryMovementChart />
        </div>
      </div>

      {/* Right sidebar - Alerts */}
      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        <StockAlerts />
      </div>
    </div>
  );
};

export default StockManagement;
