import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAttachMoney } from "react-icons/md";

const CustomerHistoryCard = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Fetch recent activity on component mount
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/customers/recent-activity?limit=5`, {
          credentials: 'include' // Include cookies for authentication
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recent activity: ${response.statusText}`);
        }
        
        const data = await response.json();
        setHistoryData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [API_URL]);

  // Generate initials when no image is available
  const getInitials = (name) => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <Card extra={"mt-3 !z-5 overflow-hidden"}>
      <div className="flex items-center justify-between rounded-t-3xl p-3">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Recent Activities
        </div>
        <button className="linear rounded-[20px] bg-lightPrimary px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
          See all
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : historyData.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No recent activity</div>
      ) : (
        <>
          {/* Customer History Data */}
          {historyData.map((data, index) => (
            <div key={index} className="flex h-full w-full items-start justify-between bg-white px-3 py-[20px] hover:shadow-2xl dark:!bg-navy-800 dark:shadow-none dark:hover:!bg-navy-700">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center">
                  {data.image ? (
                    <img
                      className="h-full w-full rounded-xl object-cover"
                      src={data.image}
                      alt={data.name}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full rounded-xl bg-brand-500 text-white text-xl font-bold">
                      {getInitials(data.name)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <h5 className="text-base font-bold text-navy-700 dark:text-white">
                    {data.name}
                  </h5>
                  <p className="mt-1 text-sm font-normal text-gray-600 dark:text-gray-400">
                    {data.action}
                  </p>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-center">
                <div className="flex items-center">
                  {/* Replace dollar icon with rupee symbol */}
                  <span className="text-brand-500 dark:text-white font-bold">₹</span>
                  <div className="ml-1 flex items-center text-sm font-bold text-navy-700 dark:text-white">
                    {data.value.toFixed(2)}
                  </div>
                </div>
                <div className="ml-2 flex items-center text-sm font-normal text-gray-600 dark:text-gray-400">
                  <p>{data.time || "Recently"}</p>
                  <p className="ml-1">ago</p>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </Card>
  );
};

export default CustomerHistoryCard;
