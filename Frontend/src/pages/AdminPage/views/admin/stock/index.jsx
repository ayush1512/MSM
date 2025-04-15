import React, { useState } from "react";
import StockTable from "./components/StockTable";
import StockAlerts from "./components/StockAlerts";
import StockFilter from "./components/StockFilter";
import { MdDelete } from "react-icons/md";
import { stockTableData } from "./variables/tableData";

const StockManagement = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [filter, setFilter] = useState({
    category: '',
    expiryStatus: '',
    stockLevel: ''
  });

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
          <StockTable 
            tableData={stockTableData} 
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            filter={filter}
          />
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
