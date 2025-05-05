import React from "react";
import Card from "components/card";
import { MdOutlineReceipt, MdPerson, MdCalendarToday, MdAttachMoney } from "react-icons/md";

const BillCard = ({ bill, onClick, formatDate }) => {
  const billDetails = bill.bill_details || {};
  
  // Extract key information
  const billNumber = billDetails.bill_number || "N/A";
  const billDate = billDetails.bill_date || bill.upload_date;
  const formattedDate = formatDate(billDate);
  const totalAmount = billDetails.total_amount || "N/A";
  const drawingParty = billDetails.drawing_party || "Unknown Vendor";
  const productCount = Array.isArray(bill.products) ? bill.products.length : 0;
  
  return (
    <Card 
      extra={`flex flex-col cursor-pointer hover:shadow-lg transition-shadow duration-300 p-4`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-shrink-0 h-16 w-16 bg-brand-50 dark:bg-navy-800 rounded-full flex items-center justify-center">
          <MdOutlineReceipt className="h-8 w-8 text-brand-500 dark:text-brand-400" />
        </div>
        <div>
          <h5 className="text-base font-bold text-navy-700 dark:text-white">
            Bill #{billNumber}
          </h5>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {drawingParty}
          </p>
        </div>
      </div>
      
      {/* Bill image preview */}
      <div className="relative mb-3 h-32 w-full rounded-xl overflow-hidden">
        {bill.image_url ? (
          <img 
            src={bill.image_url} 
            alt="Bill" 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>
      
      {/* Bill details */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div className="flex items-center">
          <MdCalendarToday className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formattedDate}
          </span>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ₹{totalAmount}
          </span>
        </div>
      </div>
      
      {/* Product count badge */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-navy-700">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {productCount} {productCount === 1 ? "product" : "products"} listed
          </span>
          <span className="text-xs bg-brand-50 dark:bg-brand-900/20 text-brand-500 dark:text-brand-400 px-2 py-1 rounded">
            View Details
          </span>
        </div>
      </div>
    </Card>
  );
};

export default BillCard;
