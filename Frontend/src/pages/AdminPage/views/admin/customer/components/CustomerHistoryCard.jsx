import React from "react";
import Card from "components/card";
import { MdAttachMoney } from "react-icons/md";
import avatar1 from "assets/img/avatars/avatar1.png";
import avatar2 from "assets/img/avatars/avatar2.png";
import avatar3 from "assets/img/avatars/avatar3.png";

const CustomerHistoryCard = () => {
  const HistoryData = [
    {
      image: avatar1,
      name: "John Doe",
      action: "Placed Order",
      value: 240.0,
      time: "30s",
    },
    {
      image: null,
      name: "Jane Smith",
      action: "Subscribed",
      value: 120.0,
      time: "50m",
    },
    {
      image: avatar2,
      name: "Robert Brown",
      action: "Refund Requested",
      value: 350.0,
      time: "20s",
    },
    {
      image: avatar3,
      name: "Emily Johnson",
      action: "Renewed Subscription",
      value: 60.0,
      time: "4h",
    },
    {
      image: null,
      name: "Michael Wilson",
      action: "Placed Order",
      value: 189.0,
      time: "30s",
    },
    {
      image: null,
      name: "Amanda Davis",
      action: "Account Created",
      value: 0.0,
      time: "2m",
    },
  ];

  // Generate initials when no image is available
  const getInitials = (name) => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <Card extra={"mt-3 !z-5 overflow-hidden"}>
      {/* HistoryCard Header */}
      <div className="flex items-center justify-between rounded-t-3xl p-3">
        <div className="text-lg font-bold text-navy-700 dark:text-white">
          Recent Activities
        </div>
        <button className="linear rounded-[20px] bg-lightPrimary px-4 py-2 text-base font-medium text-brand-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:active:bg-white/20">
          See all
        </button>
      </div>

      {/* Customer History Data */}
      {HistoryData.map((data, index) => (
        <div key={index} className="flex h-full w-full items-start justify-between bg-white px-3 py-[20px] hover:shadow-2xl dark:!bg-navy-800 dark:shadow-none dark:hover:!bg-navy-700">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center">
              {data.image ? (
                <img
                  className="h-full w-full rounded-xl object-cover"
                  src={data.image}
                  alt={data.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full rounded-xl bg-brand-500 text-white text-xl font-bold">
                  {getInitials(data.name)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h5 className="text-base font-bold text-navy-700 dark:text-white">
                {data.name}
              </h5>
              <p className="mt-1 text-sm font-normal text-gray-600 dark:text-gray-400">
                {data.action}
              </p>
            </div>
          </div>

          <div className="mt-1 flex items-center justify-center">
            <div className="flex items-center">
              <MdAttachMoney className="h-4 w-4 text-brand-500 dark:text-white" />
              <div className="ml-1 flex items-center text-sm font-bold text-navy-700 dark:text-white">
                {data.value.toFixed(2)}
              </div>
            </div>
            <div className="ml-2 flex items-center text-sm font-normal text-gray-600 dark:text-gray-400">
              <p>{data.time}</p>
              <p className="ml-1">ago</p>
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default CustomerHistoryCard;
