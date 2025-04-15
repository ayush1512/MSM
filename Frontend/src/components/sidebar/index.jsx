/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import routes from "routes.js";
import { useSidebar } from 'context/SidebarContext';

const Sidebar = (props) => {
  const { open, closeSidebar } = useSidebar();
  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all overflow-y-auto dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={closeSidebar}
      >
        <HiX className="h-6 w-6" />
      </span>

      <div className="px-4 pt-[50px] flex items-center justify-center">
        <div className="mt-1 h-2.5 font-poppins text-[22px] font-bold uppercase text-navy-700 dark:text-white text-center">
          Medical Store <span className="font-medium">Management</span>
        </div>
      </div>
      <div className="mt-[40px] mb-7 h-px bg-gray-300 dark:bg-white/30" />
      
      {/* Nav items */}
      <div className="w-full px-4">
        <ul className="mb-auto pt-1">
          <Links routes={routes} />
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
