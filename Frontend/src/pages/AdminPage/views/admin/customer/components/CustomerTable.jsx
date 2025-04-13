import React from "react";

const CustomerTable = ({ customers, onEdit, onDelete }) => {
  return (
    <table className="min-w-full bg-white dark:bg-navy-800">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b dark:border-navy-700">Name</th>
          <th className="py-2 px-4 border-b dark:border-navy-700">Email</th>
          <th className="py-2 px-4 border-b dark:border-navy-700">Phone</th>
          <th className="py-2 px-4 border-b dark:border-navy-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td className="py-2 px-4 border-b dark:border-navy-700">{customer.name}</td>
            <td className="py-2 px-4 border-b dark:border-navy-700">{customer.email}</td>
            <td className="py-2 px-4 border-b dark:border-navy-700">{customer.phone}</td>
            <td className="py-2 px-4 border-b dark:border-navy-700">
              <button
                onClick={() => onEdit(customer.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(customer.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors ml-2"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CustomerTable;