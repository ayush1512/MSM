import React, { useState } from "react";
import CustomerCard from "./components/CustomerCard";
import TableTopCustomers from "./components/TableTopCustomers";
import CustomerHistoryCard from "./components/CustomerHistoryCard";
import CustomerFilter from "./components/CustomerFilter";
import Pagination from "./components/Pagination";
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";

import tableDataTopCustomers from "./variables/tableDataTopCustomers.json";
import { tableColumnsTopCustomers } from "./variables/tableColumnsTopCustomers";

const CustomerDashboard = () => {
  // Customer data state
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    startDate: null,
    endDate: null,
    alphabetFilter: '',
    customerType: 'all'
  });
  
  // Sample customers data with more entries to demonstrate pagination
  const customers = [
    {
      id: 1,
      name: "John Doe",
      phone: "+1 123-456-7890",
      email: "john@example.com",
      lastPurchase: "2023-04-15",
      totalSpent: "345.00",
      image: avatar1 
    },
    {
      id: 2,
      name: "Jane Smith",
      phone: "+1 234-567-8901",
      email: "jane@example.com",
      lastPurchase: "2023-04-10",
      totalSpent: "190.00",
      image: null
    },
    {
      id: 3,
      name: "Robert Brown",
      phone: "+1 345-678-9012",
      email: "robert@example.com",
      lastPurchase: "2023-04-05",
      totalSpent: "567.00",
      image: avatar2
    },
    {
      id: 4,
      name: "Emily Johnson",
      phone: "+1 456-789-0123",
      email: "emily@example.com", 
      lastPurchase: "2023-03-28",
      totalSpent: "87.00",
      image: avatar3
    },
    {
      id: 5,
      name: "Michael Wilson",
      phone: "+1 567-890-1234",
      email: "michael@example.com",
      lastPurchase: "2023-03-20",
      totalSpent: "210.00",
      image: null
    },
    {
      id: 6,
      name: "Amanda Davis",
      phone: "+1 678-901-2345",
      email: "amanda@example.com",
      lastPurchase: "2023-03-15",
      totalSpent: "145.00",
      image: null
    },
    {
      id: 7,
      name: "David Miller",
      phone: "+1 789-012-3456",
      email: "david@example.com",
      lastPurchase: "2023-03-12",
      totalSpent: "320.00",
      image: avatar1
    },
    {
      id: 8,
      name: "Sarah Thompson",
      phone: "+1 890-123-4567",
      email: "sarah@example.com",
      lastPurchase: "2023-03-08",
      totalSpent: "175.00",
      image: null
    },
    {
      id: 9,
      name: "James Anderson",
      phone: "+1 901-234-5678",
      email: "james@example.com",
      lastPurchase: "2023-03-05",
      totalSpent: "430.00",
      image: avatar2
    },
    {
      id: 10,
      name: "Jennifer Lee",
      phone: "+1 012-345-6789",
      email: "jennifer@example.com",
      lastPurchase: "2023-03-01",
      totalSpent: "265.00",
      image: null
    },
    {
      id: 11,
      name: "Thomas Clark",
      phone: "+1 123-456-7890",
      email: "thomas@example.com",
      lastPurchase: "2023-02-25",
      totalSpent: "190.00",
      image: avatar3
    },
    {
      id: 12,
      name: "Elizabeth White",
      phone: "+1 234-567-8901",
      email: "elizabeth@example.com",
      lastPurchase: "2023-02-20",
      totalSpent: "350.00",
      image: null
    },
    {
      id: 13,
      name: "Daniel Lewis",
      phone: "+1 345-678-9012",
      email: "daniel@example.com",
      lastPurchase: "2023-02-15",
      totalSpent: "275.00",
      image: null
    },
    {
      id: 14,
      name: "Patricia Walker",
      phone: "+1 456-789-0123",
      email: "patricia@example.com",
      lastPurchase: "2023-02-10",
      totalSpent: "410.00",
      image: avatar1
    },
    {
      id: 15,
      name: "Richard Hall",
      phone: "+1 567-890-1234",
      email: "richard@example.com",
      lastPurchase: "2023-02-05",
      totalSpent: "185.00",
      image: null
    },
    {
      id: 16,
      name: "Linda Young",
      phone: "+1 678-901-2345",
      email: "linda@example.com",
      lastPurchase: "2023-02-01",
      totalSpent: "290.00",
      image: avatar2
    },
    {
      id: 17,
      name: "William Turner",
      phone: "+1 789-012-3456",
      email: "william@example.com",
      lastPurchase: "2023-01-28",
      totalSpent: "230.00",
      image: null
    },
    {
      id: 18,
      name: "Karen Allen",
      phone: "+1 890-123-4567",
      email: "karen@example.com",
      lastPurchase: "2023-01-25",
      totalSpent: "375.00",
      image: avatar3
    }
  ];

  // Items per page - changed from 6 to 9 to accommodate three rows
  const customersPerPage = 9;

  // Calculate pagination indexes
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(customers.length / customersPerPage);

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {/* Customer Dashboard Header */}
        <div className="mb-4 flex flex-col justify-between md:flex-row md:items-center">
          <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
            Customer Management
          </h4>
          
          {/* Filter Component */}
          <CustomerFilter filter={filter} setFilter={setFilter} />
        </div>

        {/* Customer Cards - kept the same grid layout but will show more per page */}
        <div className="z-20 grid grid-cols-1 gap-5 md:grid-cols-3">
          {currentCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id}
              name={customer.name}
              phone={customer.phone}
              lastPurchase={customer.lastPurchase}
              totalSpent={customer.totalSpent}
              image={customer.image}
            />
          ))}
        </div>

        {/* Pagination Component */}
        <div className="mt-5 flex justify-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* right side section */}
      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        <TableTopCustomers
          extra="mb-5"
          tableData={tableDataTopCustomers}
          columnsData={tableColumnsTopCustomers}
        />
        <CustomerHistoryCard />
      </div>
    </div>
  );
};

export default CustomerDashboard;
