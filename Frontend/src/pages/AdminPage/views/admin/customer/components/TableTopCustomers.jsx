import React from "react";
import Card from "components/card";
import { MdPerson } from "react-icons/md";

const TableTopCustomers = (props) => {
  const { tableData, columnsData, extra } = props;

  // Generate initials for customer avatar when no image
  const getInitials = (name) => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <Card extra={`${extra}`}>
      <div className="relative flex items-center justify-between pt-4 pb-3 px-4">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Top Customers
        </h4>
      </div>

      <div className="w-full overflow-x-scroll px-4 md:overflow-x-hidden">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr>
              {columnsData.map((column, index) => (
                <th
                  key={index}
                  className="border-b border-gray-200 pb-[10px] pr-14 text-start dark:!border-navy-700"
                >
                  <p className="text-xs font-bold tracking-wide text-gray-600 lg:text-xs dark:text-white">
                    {column.Header}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => {
              return (
                <tr key={index}>
                  <td className="flex items-center gap-2 pt-[14px] pb-[18px] sm:text-[14px]">
                    {row.image ? (
                      <div className="h-8 w-8 rounded-full">
                        <img
                          className="h-full w-full rounded-full"
                          src={row.image}
                          alt={row.name}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-500 text-white text-xs font-bold">
                        {getInitials(row.name)}
                      </div>
                    )}
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {row.name}
                    </p>
                  </td>
                  <td className="pt-[14px] pb-[18px] sm:text-[14px]">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full text-xl">
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                          {row.orders}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="pt-[14px] pb-[18px] sm:text-[14px]">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      ${row.value}
                    </p>
                  </td>
                  <td className="pt-[14px] pb-[18px] sm:text-[14px]">
                    <button
                      className="linear rounded-[20px] bg-brand-900 px-4 py-2 text-base font-medium text-white transition duration-200 hover:bg-brand-800 active:bg-brand-700 dark:bg-brand-400 dark:hover:bg-brand-300 dark:active:opacity-90"
                      size="sm"
                    >
                      Contact
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TableTopCustomers;
