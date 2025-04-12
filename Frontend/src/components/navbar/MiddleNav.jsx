import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Home, ScrollText, Barcode } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MiddleNav = () => {
  const [activeTab, setActiveTab] = useState(0);
  const location = useLocation();
  
  const navItems = [
    { icon: <Home size={20} />, name: 'Home', link: "/" },
    { icon: <ScrollText size={20} />, name: 'Prescription', link: "/prescription-reader" },
    { icon: <Barcode size={20} />, name: 'Product', link: "/product-scanner" },
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', link: "/admin" },
  ];

   // Update active tab based on current path whenever location changes
   useEffect(() => {
    const currentPath = location.pathname;
    
    // Special handling for nested routes
    const activeIndex = navItems.findIndex(item => {
      // Home route should only match exactly
      if (item.link === "/" && currentPath !== "/") {
        return false;
      }
      // For other routes, check if current path starts with the link
      return currentPath.startsWith(item.link);
    });
    
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [location.pathname]);
    // {/* Added bg-white and shadow styling to match search box */}
  return (
      <nav className="relative mt-[3px] flex h-[61px] sm-max:w-full  xl:w-[465px] items-center justify-between rounded-full bg-white px-2 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
        {navItems.map((item, index) => (
          <div key={index} className="relative">
            <Link
              to={item.link}
              className={`flex items-center justify-center rounded-full px-3 py-2 transition-colors ${
                activeTab === index 
                  ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800' 
                  : 'text-gray-600 hover:text-gray-800 dark:hover:text-white '
              }`}
              onClick={() => setActiveTab(index)}
            >
              <span className="flex items-center">
                {item.icon}
                <span className={`ml-2 text-sm font-medium ${
                  activeTab === index ? 'block' : 'hidden xl:block'
                }`}>
                  {item.name}
                </span>
              </span>
            </Link>
          </div>
        ))}
      </nav>
  );
};

export default MiddleNav;