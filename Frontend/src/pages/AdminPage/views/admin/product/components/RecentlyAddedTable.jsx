import React, { useMemo } from "react";
import Card from "components/card";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper
} from "@tanstack/react-table";

const RecentlyAddedTable = ({ columnsData, tableData }) => {
  const columnHelper = createColumnHelper();
  
  // Convert columnsData to the format required by @tanstack/react-table
  const columns = useMemo(() => {
    return columnsData.map(column => {
      return columnHelper.accessor(column.accessor, {
        header: column.Header,
        cell: info => {
          const value = info.getValue();
          // Format price values to use ₹ instead of $
          if (column.accessor === "price") {
            return formatPrice(value);
          }
          return value;
        }
      });
    });
  }, [columnsData, columnHelper]);
  
  const data = useMemo(() => tableData, [tableData]);

  // Price formatter function
  const formatPrice = (price) => {
    // Change from $ to ₹
    return price.startsWith('$') ? price.replace('$', '₹') : price;
  };

  // Set up the table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6 rounded-xl"}>
      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700"
                  >
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <span>
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === "desc" ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-gray-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )
                        ) : (
                          ""
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="pt-[14px] pb-3 text-[14px] dark:border-navy-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Updated Pagination - Customer Section Style */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-navy-700">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                !table.getCanPreviousPage()
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-navy-800"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                !table.getCanNextPage()
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 dark:text-white dark:hover:bg-navy-800"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-white">
                Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    data.length
                  )}
                </span>{" "}
                of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                    !table.getCanPreviousPage()
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {Array.from(
                  { length: Math.min(5, table.getPageCount()) },
                  (_, i) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    let page = i;
                    
                    // If there are more than 5 pages and we're not at the start
                    if (table.getPageCount() > 5 && pageIndex > 1) {
                      if (pageIndex >= table.getPageCount() - 2) {
                        // Near the end, show the last 5 pages
                        page = table.getPageCount() - 5 + i;
                      } else {
                        // In the middle, show current and surrounding pages
                        page = pageIndex - 2 + i;
                      }
                    }
                    
                    // Don't render if page is out of bounds
                    if (page >= table.getPageCount()) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => table.setPageIndex(page)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                          pageIndex === page
                            ? "z-10 bg-indigo-600 text-white dark:bg-navy-600"
                            : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800"
                        }`}
                      >
                        {page + 1}
                      </button>
                    );
                  }
                )}
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                    !table.getCanNextPage()
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-navy-800"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RecentlyAddedTable;
