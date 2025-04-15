import React from "react";
import Card from "components/card";
import { format } from "date-fns";
import { MdBusinessCenter, MdCalendarToday, MdReceipt, MdAttachMoney } from "react-icons/md";

const BillInfo = ({ bill }) => {
  const billDetails = bill.bill_details || {};
  
  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMMM dd, yyyy");
    } catch (e) {
      return dateString || "N/A";
    }
  };
  
  // Upload date and bill date
  const uploadDate = formatDate(bill.upload_date);
  const billDate = formatDate(billDetails.bill_date || bill.upload_date);
  
  return (
    <Card extra={"w-full p-4"}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Bill Information
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bill Number */}
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 bg-brand-50 dark:bg-navy-800 rounded-md flex items-center justify-center mr-3">
            <MdReceipt className="h-5 w-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bill Number</p>
            <p className="font-medium text-navy-700 dark:text-white">
              {billDetails.bill_number || "N/A"}
            </p>
          </div>
        </div>
        
        {/* Bill Date */}
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 bg-brand-50 dark:bg-navy-800 rounded-md flex items-center justify-center mr-3">
            <MdCalendarToday className="h-5 w-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bill Date</p>
            <p className="font-medium text-navy-700 dark:text-white">
              {billDate}
            </p>
          </div>
        </div>
        
        {/* Drawing Party (Vendor) */}
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 bg-brand-50 dark:bg-navy-800 rounded-md flex items-center justify-center mr-3">
            <MdBusinessCenter className="h-5 w-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Vendor / Drawing Party</p>
            <p className="font-medium text-navy-700 dark:text-white">
              {billDetails.drawing_party || "N/A"}
            </p>
          </div>
        </div>
        
        {/* Total Amount */}
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 bg-brand-50 dark:bg-navy-800 rounded-md flex items-center justify-center mr-3">
            <MdAttachMoney className="h-5 w-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="font-medium text-navy-700 dark:text-white">
              ₹{billDetails.total_amount || "N/A"}
            </p>
          </div>
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-navy-700">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-2 sm:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded On</p>
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {uploadDate}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
            <p className="text-sm font-medium text-navy-700 dark:text-white">
              {Array.isArray(bill.products) ? bill.products.length : 0} items
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BillInfo;
