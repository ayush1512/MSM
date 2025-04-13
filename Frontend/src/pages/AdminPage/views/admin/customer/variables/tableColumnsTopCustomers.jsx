import React from "react";

export const tableColumnsTopCustomers = [
  {
    Header: "Name",
    accessor: "name",
    Cell: ({ value, row }) => {
      const { image, initials } = row.original;
      
      return (
        <div className="flex items-center gap-2">
          {image ? (
            <img 
              src={image} 
              className="h-10 w-10 rounded-full object-cover"
              alt={value}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {initials}
            </div>
          )}
          <p className="text-sm font-bold text-navy-700 dark:text-white">{value}</p>
        </div>
      );
    },
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Spent",
    accessor: "spent",
  },
  {
    Header: "Orders",
    accessor: "orders",
  },
  {
    Header: "Status",
    accessor: "status",
    Cell: ({ value }) => (
      <div className={`rounded-[10px] px-2 py-1 text-center text-xs font-medium ${
        value === "Active" 
          ? "bg-green-100 text-green-500 dark:bg-green-50/10" 
          : value === "Inactive"
          ? "bg-red-100 text-red-500 dark:bg-red-50/10"
          : "bg-amber-100 text-amber-500 dark:bg-amber-50/10"
      }`}>
        {value}
      </div>
    ),
  },
];
