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
    { icon: <LayoutDashboard size={20} />, name: 'Dashboard', link: "/admin/default" },
  ];

  // Update active tab based on current path whenever location changes
  useEffect(() => {
    const currentPath = location.pathname;
    const activeIndex = navItems.findIndex(item => currentPath === item.link);
    if (activeIndex !== -1) {
      setActiveTab(activeIndex);
    }
  }, [location.pathname]);

  return (
    <div className="flex justify-center">
      {/* Added bg-white and shadow styling to match search box */}
      <nav className="relative flex h-[61px] w-[465px] items-center justify-between rounded-full bg-white px-4 py-2 shadow-xl shadow-shadow-500 dark:!bg-navy-800 dark:shadow-none">
        {navItems.map((item, index) => (
          <div key={index} className="relative">
            <Link
              to={item.link}
              className={`flex items-center justify-center rounded-full px-3 py-2 transition-colors ${
                activeTab === index 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab(index)}
            >
              <span className="flex items-center">
                {item.icon}
                <span className={`ml-2 text-sm font-medium ${
                  activeTab === index ? 'block' : 'hidden sm:block'
                }`}>
                  {item.name}
                </span>
              </span>
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MiddleNav;