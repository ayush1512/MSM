import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "components/card";
import { MdArrowBack, MdDownload, MdEdit, MdOutlineReceipt } from "react-icons/md";
import BillInfo from "./components/BillInfo";
import ProductsTable from "./components/ProductsTable";

const BillPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBillDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/bill-scanner/bills/${id}`);
        if (!response.ok) throw new Error("Failed to fetch bill details");
        
        const data = await response.json();
        setBill(data);
      } catch (error) {
        console.error("Error fetching bill details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillDetails();
  }, [id]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="mt-3 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mt-3">
        <Card extra={"w-full h-full p-6 flex flex-col items-center justify-center"}>
          <div className="text-xl font-bold text-red-500 mb-2">Error</div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={handleGoBack}
            className="mt-4 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </Card>
      </div>
    );
  }
  
  if (!bill) {
    return (
      <div className="mt-3">
        <Card extra={"w-full h-full p-6 flex flex-col items-center justify-center"}>
          <div className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Bill not found</div>
          <button
            onClick={handleGoBack}
            className="mt-4 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg"
          >
            Go Back
          </button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="mt-3">
      {/* Header with back button */}
      <div className="flex items-center mb-5">
        <button 
          onClick={handleGoBack}
          className="mr-4 flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Bill Details
        </h4>
        
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-navy-600">
            <MdDownload className="h-5 w-5" />
            <span className="hidden sm:block">Download</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg">
            <MdEdit className="h-5 w-5" />
            <span className="hidden sm:block">Edit</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column - Bill Image */}
        <div className="col-span-1">
          <Card extra={"w-full p-4"}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold text-navy-700 dark:text-white">
                Bill Image
              </div>
              <div className="rounded-full bg-lightPrimary p-2 text-brand-500 dark:bg-navy-700 dark:text-white">
                <MdOutlineReceipt className="h-6 w-6" />
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden">
              {bill.image_url ? (
                <img 
                  src={bill.image_url} 
                  alt="Bill" 
                  className="w-full h-auto rounded-xl"
                />
              ) : (
                <div className="h-96 w-full bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">No image available</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Original filename:</p>
                <p className="font-medium text-navy-700 dark:text-white truncate">
                  {bill.original_filename || "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right column - Bill Details and Products */}
        <div className="col-span-1 lg:col-span-2">
          {/* Bill Info Card */}
          <BillInfo bill={bill} />
          
          {/* Products Table */}
          <div className="mt-5">
            <ProductsTable products={bill.products || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPage;
