import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdPerson } from "react-icons/md";

const TableTopCustomers = (props) => {
  const { columnsData, extra } = props;
  
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Fetch top customers on component mount
  useEffect(() => {
    const fetchTopCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/customers/top?limit=5`, {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch top customers: ${response.statusText}`);
        }
        
        const data = await response.json();
        setTableData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching top customers:', err);
        setError('Failed to load top customers data');
        // Keep existing data if available
      } finally {
        setLoading(false);
      }
    };

    fetchTopCustomers();
  }, [API_URL]);

  // Generate initials for customer avatar when no image
  const getInitials = (name) => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <Card extra={`${extra}`}>
      <div className="relative flex items-center justify-between pt-4 pb-3 px-4">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Top Customers
        </h4>
      </div>

      <div className="w-full overflow-x-scroll px-4 md:overflow-x-hidden">
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500 text-sm">{error}</div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">No customer data available</div>
        ) : (
          <table className="w-full min-w-[500px]">
            <thead>
              <tr>
                {columnsData.map((column, index) => (
                  <th
                    key={index}
                    className="border-b border-gray-200 pb-[10px] pr-14 text-start dark:!border-navy-700"
                  >
                    <p className="text-xs font-bold tracking-wide text-gray-600 lg:text-xs dark:text-white">
                      {column.Header}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => {
                return (
                  <tr key={index}>
                    <td className="flex items-center gap-2 pt-[14px] pb-[18px] sm:text-[14px]">
                      {row.image ? (
                        <div className="h-8 w-8 rounded-full">
                          <img
                            className="h-full w-full rounded-full"
                            src={row.image}
                            alt={row.name}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white text-xs font-bold">
                          {row.initials || getInitials(row.name)}
                        </div>
                      )}
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {row.name}
                      </p>
                    </td>
                    <td className="pt-[14px] pb-[18px] sm:text-[14px]">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full text-xl">
                          <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {row.orders}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="pt-[14px] pb-[18px] sm:text-[14px]">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        ₹{parseFloat(row.value || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="pt-[14px] pb-[18px] sm:text-[14px]">
                      <button
                        className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
                        size="sm"
                      >
                        Contact
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

export default TableTopCustomers;
