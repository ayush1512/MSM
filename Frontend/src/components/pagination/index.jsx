import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const generatePageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range of pages to show around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }
    
    // Add pages in range
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center space-x-1">
      <button 
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`h-9 w-9 rounded-full flex items-center justify-center ${
          currentPage === 1
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700"
        }`}
      >
        &lt;
      </button>
      
      {generatePageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
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
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`h-9 w-9 rounded-full flex items-center justify-center ${
          currentPage === totalPages
            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
            : "text-navy-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700"
        }`}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
