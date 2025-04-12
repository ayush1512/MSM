import React from "react";

// Admin Imports
import MainDashboard from "./pages/AdminPage/views/admin/default";
import NFTMarketplace from "./pages/AdminPage/views/admin/marketplace";
import Profile from "./pages/AdminPage/views/admin/profile";
import DataTables from "./pages/AdminPage/views/admin/tables";

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
} from "react-icons/md";

const routes = [
  {
    name:"Home",
    layout:"",
    path:""
  },
  {
    name:"Prescription reader",
    layout:"",
    path:"prescription-reader"
  },
  {
    name:"Product scanner",
    layout:"",
    path:"product-scanner"
  },
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "NFT Marketplace",
    layout: "/admin",
    path: "nft-marketplace",
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: "Data Tables",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "data-tables",
    component: <DataTables />,
  },
  {
    name: "Profile",
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  }
];
export default routes;
