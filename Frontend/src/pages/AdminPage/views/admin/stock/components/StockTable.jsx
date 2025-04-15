import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "components/card";
import Checkbox from "components/checkbox";
import { MdEdit, MdDelete, MdWarning } from "react-icons/md";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const StockTable = ({ tableData, selectedItems, setSelectedItems, filter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const PAGE_SIZE = 15;
  
  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Check if a product is expiring soon (within 60 days)
  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 60 && diffDays > 0;
  };
  
  // Check if a product is expired
  const isExpired = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };
  
  // Get filtered and sorted data
  const getProcessedData = () => {
    let processedData = [...tableData];
    
    // Apply category filter
    if (filter.category) {
      processedData = processedData.filter(item => item.category === filter.category);
    }
    
    // Apply expiry status filter
    if (filter.expiryStatus) {
      processedData = processedData.filter(item => {
        if (filter.expiryStatus === 'expired') return isExpired(item.expiryDate);
        if (filter.expiryStatus === 'expiring-soon') return isExpiringSoon(item.expiryDate);
        if (filter.expiryStatus === 'good') return !isExpired(item.expiryDate) && !isExpiringSoon(item.expiryDate);
        return true;
      });
    }
    
    // Apply stock level filter
    if (filter.stockLevel) {
      processedData = processedData.filter(item => {
        if (filter.stockLevel === 'low') return item.quantity <= 15;
        if (filter.stockLevel === 'out') return item.quantity === 0;
        if (filter.stockLevel === 'normal') return item.quantity > 15;
        return true;
      });
    }
    
    // Apply sorting
    if (sortConfig.key) {
      processedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return processedData;
  };
  
  const processedData = getProcessedData();
  
  // Pagination
  const pageCount = Math.ceil(processedData.length / PAGE_SIZE);
  const paginatedData = processedData.slice(
    (currentPage - 1) * PAGE_SIZE, 
    currentPage * PAGE_SIZE
  );
  
  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);
  
  // Handle checkbox changes for selecting items
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // Handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedData.map(item => item.id));
    }
  };
  
  // Handle edit button click
  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };
  
  // Handle delete button click
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      console.log("Deleting item:", id);
      // Here you would implement the actual deletion logic
    }
  };
  
  // Generate pagination numbers with ellipsis for readability
  const generatePaginationNumbers = () => {
    const pages = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Always show first page
    pages.push(1);
    
    // Calculate range of pages to show around current page
    let start = Math.max(2, currentPage - 2);
    let end = Math.min(pageCount - 1, currentPage + 2);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < pageCount - 1) {
      pages.push('...');
    }
    
    // Always show last page
    pages.push(pageCount);
    
    return pages;
  };
  
  return (
    <Card extra="w-full pb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-navy-700">
              <th className="py-3 px-3 text-left">
                <Checkbox
                  checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th 
                className="py-3 px-3 text-left cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                    Product Name
                  </span>
                  {sortConfig.key === 'name' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-brand-500" /> : <FaSortDown className="ml-1 text-brand-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
              <th 
                className="py-3 px-3 text-left cursor-pointer"
                onClick={() => handleSort('manufacturer')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                    Manufacturer
                  </span>
                  {sortConfig.key === 'manufacturer' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-brand-500" /> : <FaSortDown className="ml-1 text-brand-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
              <th 
                className="py-3 px-3 text-left cursor-pointer"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                    Category
                  </span>
                  {sortConfig.key === 'category' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-brand-500" /> : <FaSortDown className="ml-1 text-brand-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
              <th 
                className="py-3 px-3 text-left cursor-pointer"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                    Price
                  </span>
                  {sortConfig.key === 'price' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-brand-500" /> : <FaSortDown className="ml-1 text-brand-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
              <th 
                className="py-3 px-3 text-left cursor-pointer"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                    Stock
                  </span>
                  {sortConfig.key === 'quantity' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-brand-500" /> : <FaSortDown className="ml-1 text-brand-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
              <th 
                className="py-3 px-3 text-left cursor-pointer"
                onClick={() => handleSort('expiryDate')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                    Expiry Date
                  </span>
                  {sortConfig.key === 'expiryDate' ? (
                    sortConfig.direction === 'asc' ? <FaSortUp className="ml-1 text-brand-500" /> : <FaSortDown className="ml-1 text-brand-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                </div>
              </th>
              <th className="py-3 px-3 text-left">
                <span className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              paginatedData.map((product) => {
                const isExpired_ = isExpired(product.expiryDate);
                const isExpiringSoon_ = isExpiringSoon(product.expiryDate);
                
                return (
                  <tr 
                    key={product.id} 
                    className={`border-b border-gray-200 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700 ${
                      isExpired_ ? 'bg-red-50 dark:bg-red-900/20' : 
                      isExpiringSoon_ ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <Checkbox 
                        checked={selectedItems.includes(product.id)}
                        onChange={() => handleSelectItem(product.id)}
                      />
                    </td>
                    <td className="py-3 px-3 font-medium">
                      <Link 
                        to={`/admin/product/${product.id}`}
                        className="font-medium text-brand-500 hover:underline"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-sm">
                      {product.manufacturer}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-gray-100 dark:bg-navy-700 px-2 py-1 rounded-full text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-medium ${product.quantity < 10 ? 'text-red-500' : ''}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center">
                        {(isExpired_ || isExpiringSoon_) && (
                          <MdWarning 
                            className={`mr-1 ${isExpired_ ? 'text-red-500' : 'text-yellow-500'}`} 
                            title={isExpired_ ? 'Expired' : 'Expiring Soon'}
                          />
                        )}
                        <span className={isExpired_ ? 'text-red-500' : isExpiringSoon_ ? 'text-yellow-600' : ''}>
                          {new Date(product.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
                          title="Edit"
                        >
                          <MdEdit className="text-brand-500" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
                          title="Delete"
                        >
                          <MdDelete className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="mt-5 flex justify-center">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-full border dark:border-navy-600 disabled:opacity-50 ${
              currentPage === 1
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700"
            }`}
          >
            &lt;
          </button>
          
          {generatePaginationNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? setCurrentPage(page) : null}
              className={`h-9 w-9 rounded-full flex items-center justify-center ${
                currentPage === page
                  ? "bg-brand-500 text-white"
                  : typeof page === 'number'
                    ? "bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600"
                    : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {page}
            </button>
          ))}
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
            disabled={currentPage === pageCount || pageCount === 0}
            className={`px-3 py-1 rounded-full border dark:border-navy-600 disabled:opacity-50 ${
              currentPage === pageCount || pageCount === 0
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700"
            }`}
          >
            &gt;
          </button>
        </div>
      </div>
      
      {/* Edit Modal - Keep the same as before */}
      {editModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-xl w-full max-w-lg p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Edit Product
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  defaultValue={editingProduct.name}
                  className="w-full px-3 py-2 border rounded-md dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  defaultValue={editingProduct.manufacturer}
                  className="w-full px-3 py-2 border rounded-md dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  defaultValue={editingProduct.category}
                  className="w-full px-3 py-2 border rounded-md dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                >
                  <option value="tablet">Tablet</option>
                  <option value="syrup">Syrup</option>
                  <option value="powder">Powder</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  defaultValue={editingProduct.price}
                  className="w-full px-3 py-2 border rounded-md dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  defaultValue={editingProduct.quantity}
                  className="w-full px-3 py-2 border rounded-md dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  defaultValue={editingProduct.expiryDate}
                  className="w-full px-3 py-2 border rounded-md dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:border-navy-600 dark:hover:bg-navy-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log("Saving changes for product:", editingProduct.id);
                  // Here you would implement the actual update logic
                  setEditModalOpen(false);
                }}
                className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default StockTable;
