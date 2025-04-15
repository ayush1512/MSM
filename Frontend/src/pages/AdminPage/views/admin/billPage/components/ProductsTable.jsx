import React, { useState } from "react";
import Card from "components/card";
import { MdSearch, MdAdd, MdEdit, MdDeleteOutline } from "react-icons/md";

const ProductsTable = ({ products = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter products by search term
  const filteredProducts = products.filter(product => {
    const searchString = searchTerm.toLowerCase();
    return (
      (product.product_name && product.product_name.toLowerCase().includes(searchString)) ||
      (product.batch_number && product.batch_number.toLowerCase().includes(searchString))
    );
  });
  
  // Helper function to format expiry date
  const formatExpiryDate = (expDate) => {
    return expDate || "N/A";
  };
  
  return (
    <Card extra={"w-full h-full p-4"}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Products ({filteredProducts.length})
        </div>
        <button className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 text-sm rounded-lg">
          <MdAdd className="h-4 w-4" />
          Add Product
        </button>
      </div>
      
      {/* Search Box */}
      <div className="mb-4 mt-2">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-navy-600 dark:bg-navy-700 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      
      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-navy-700">
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Product Name
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Batch Number
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  ExpD.
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  MRP
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Qty.
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Packaging
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Type
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Category
                </p>
              </th>
              <th className="py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Actions
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-navy-700 last:border-none">
                  <td className="py-3">
                    <p className="text-sm font-medium text-navy-700 dark:text-white">
                      {product.product_name || "N/A"}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {product.batch_number || "N/A"}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {formatExpiryDate(product.exp_date)}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      ₹{product.mrp || product.price || "N/A"}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {product.quantity || "N/A"}
                    </p>
                  </td>
                  <td className="py-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {product.packaging || "N/A"}
                    </p>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium 
                      ${product.type === 'Strip' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                      product.type === 'Bottle' || product.type === 'Syrup' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                      product.type === 'Powder' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}
                    >
                      {product.type || "N/A"}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`rounded-md px-2 py-1 text-xs font-medium 
                      ${product.category === 'Ayurvedic' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      product.category === 'Generic' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      product.category === 'Ethical' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 
                      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}
                    >
                      {product.category || "N/A"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-600 hover:text-navy-700 dark:text-gray-400 dark:hover:text-white">
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <MdDeleteOutline className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No products match your search" : "No products listed in this bill"}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ProductsTable;
