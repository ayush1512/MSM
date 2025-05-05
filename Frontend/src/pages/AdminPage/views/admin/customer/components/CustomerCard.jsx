import { MdPhone, MdCalendarToday, MdEdit, MdDelete } from "react-icons/md";
import { useState } from "react";
import Card from "components/card";
import { useNavigate } from "react-router-dom";

const CustomerCard = ({ id, name, phone, lastPurchase, totalSpent, image }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // Generate initials when no image is available
  const getInitials = () => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewClick = () => {
    navigate(`/admin/customers/${id}`);
  };

  return (
    <Card
      extra={`flex flex-col w-full h-full !p-4 3xl:p-![18px] bg-white dark:bg-navy-800`}
    >
      <div className="h-full w-full">
        <div className="relative flex items-center justify-center w-full h-40 bg-gray-100 dark:bg-navy-700 rounded-xl mb-3">
          {image ? (
            <img
              src={image}
              className="h-full w-full rounded-xl object-cover"
              alt={name}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full rounded-xl bg-brand-500 text-white text-4xl font-bold">
              {getInitials()}
            </div>
          )}
          
          <div 
            className={`absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex gap-3">
              <button className="p-2 bg-white rounded-full text-brand-500 hover:bg-gray-100">
                <MdEdit className="h-5 w-5" />
              </button>
              <button className="p-2 bg-white rounded-full text-red-500 hover:bg-gray-100">
                <MdDelete className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-col">
          <p className="text-lg font-bold text-navy-700 dark:text-white">
            {name}
          </p>
          
          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MdPhone className="mr-1" />
            <span>{phone}</span>
          </div>
          
          <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <MdCalendarToday className="mr-1" />
            <span>Last Purchase: {formatDate(lastPurchase)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex">
            <p className="mb-2 text-sm font-bold text-brand-500 dark:text-white">
              Recent Spent:<br />
              ₹{totalSpent}
            </p>
          </div>
          <button
            onClick={handleViewClick}
            className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
          >
            View
          </button>
        </div>
      </div>
    </Card>
  );
};

export default CustomerCard;
