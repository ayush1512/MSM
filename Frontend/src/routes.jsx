import React from "react";

// Admin Imports
import MainDashboard from "./pages/AdminPage/views/admin/default";
import NFTMarketplace from "./pages/AdminPage/views/admin/marketplace";
import Profile from "./pages/AdminPage/views/admin/profile";
import DataTables from "./pages/AdminPage/views/admin/tables";
import Productplace from "./pages/AdminPage/views/admin/product";
import CustomerDashboard from "./pages/AdminPage/views/admin/customer";
import CustomerDetails from "./pages/AdminPage/views/admin/customer/views/CustomerDetails";
import StockManagement from "./pages/AdminPage/views/admin/stock";

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdPeople,
  MdInventory,
} from "react-icons/md";
import { GiMedicinePills } from "react-icons/gi";

const routes = [
  {
    name: "Home",
    layout: "",
    path: "",
  },
  {
    name: "Prescription reader",
    layout: "",
    path: "prescription-reader",
  },
  {
    name: "Product scanner",
    layout: "",
    path: "product-scanner",
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
    name: "Product Place",
    layout: "/admin",
    path: "product-place",
    icon: <GiMedicinePills className="h-6 w-6" />,
    component: <Productplace />,
  },
  {
    name: "Stock Management",
    layout: "/admin",
    path: "stock",
    icon: <MdInventory className="h-6 w-6" />,
    component: <StockManagement />,
  },
  {
    name: "Customers",
    layout: "/admin",
    path: "customers",
    icon: <MdPeople className="h-6 w-6" />,
    component: <CustomerDashboard />,
  },
  {
    name: "Customer Details",
    layout: "/admin",
    path: "customers/:id",
    component: <CustomerDetails />,
    hidden: true,
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
  },
];
export default routes;
