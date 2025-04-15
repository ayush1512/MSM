import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import Pagination from "components/pagination";
import { MdSearch, MdFilterList, MdCalendarToday } from "react-icons/md";
import BillCard from "./components/BillCard";
import { format } from "date-fns";

const BillSection = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  useEffect(() => {
    // Fetch bills data
    const fetchBills = async () => {
      setLoading(true);
      try {
        // Build query parameters for filtering
        const params = new URLSearchParams();
        if (dateFilter) params.append('date', dateFilter);
        
        // Make API call
        const response = await fetch(`http://localhost:5000/bill-scanner/bills?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch bills");
        
        const data = await response.json();
        setBills(data);
        
        // Set total pages based on data length (assuming 9 items per page)
        setTotalPages(Math.max(1, Math.ceil(data.length / 9)));
      } catch (error) {
        console.error("Error fetching bills:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBills();
  }, [dateFilter]);
  
  // Filter bills by search term
  const filteredBills = bills.filter(bill => {
    const searchString = searchTerm.toLowerCase();
    const billDetails = bill.bill_details || {};
    
    return (
      (billDetails.bill_number && billDetails.bill_number.toLowerCase().includes(searchString)) ||
      (billDetails.drawing_party && billDetails.drawing_party.toLowerCase().includes(searchString)) ||
      (bill.original_filename && bill.original_filename.toLowerCase().includes(searchString))
    );
  });
  
  // Paginate bills
  const paginatedBills = filteredBills.slice((currentPage - 1) * 9, currentPage * 9);
  
  // Handle bill click to navigate to bill details page
  const handleBillClick = (billId) => {
    navigate(`/admin/bills/${billId}`);
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Handle date filter clear
  const handleClearDateFilter = () => {
    setDateFilter("");
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      return dateString || "N/A";
    }
  };
  
  return (
    <div className="mt-3">
        {/* Header */}
        <div className="mb-4 relative flex items-center justify-between">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Bill Management
          </div>
          <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-navy-600 dark:bg-navy-700 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            {dateFilter && (
              <button
                onClick={handleClearDateFilter}
                className="px-3 py-2 text-sm bg-gray-100 dark:bg-navy-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-navy-600"
              >
                Clear Date
              </button>
            )}
          </div>
          </div>
        </div>
        
        {/* Bills Grid Display */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          </div>
        ) : paginatedBills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginatedBills.map((bill) => (
              <BillCard 
                key={bill._id} 
                bill={bill} 
                onClick={() => handleBillClick(bill._id)}
                formatDate={formatDate}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-xl font-semibold text-navy-700 dark:text-white">No bills found</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {searchTerm || dateFilter ? 
                "Try adjusting your search or filters" : 
                "Start by scanning new bills"}
            </p>
          </div>
        )}
        
        {/* Pagination Controls */}
        {filteredBills.length > 0 && (
          <div className="mt-6 flex items-center justify-center">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
    </div>
  );
};

export default BillSection;
