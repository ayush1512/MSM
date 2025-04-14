import React from "react";
import Card from "components/card";
import { MdBarChart } from "react-icons/md";
import BarChart from "components/charts/BarChart";

const InventoryMovementChart = ({ title = "Inventory Movement", timeframe = "This Month" }) => {
  // Sample data for inventory movement
  const barChartDataInventory = [
    {
      name: "Received",
      data: [340, 290, 410, 380, 320, 450, 520],
      color: "#0D9488", // Teal-600 (same color as in dashboard)
    },
    {
      name: "Dispensed",
      data: [220, 250, 310, 270, 300, 380, 400],
      color: "#14B8A6", // Teal-500
    },
    {
      name: "Adjusted",
      data: [30, 40, -20, -10, 25, -15, 10],
      color: "#99F6E4", // Teal-200
    },
  ];

  const barChartOptionsInventory = {
    chart: {
      stacked: true,
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
        backgroundColor: "#000000",
      },
      theme: "dark",
      onDatasetHover: {
        style: {
          fontSize: "12px",
          fontFamily: undefined,
        },
      },
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      show: false,
      labels: {
        show: true,
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
      color: "black",
      labels: {
        show: false,
      },
    },
    grid: {
      borderColor: "rgba(163, 174, 208, 0.3)",
      show: true,
      yaxis: {
        lines: {
          show: false,
          opacity: 0.5,
        },
      },
      row: {
        opacity: 0.5,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#0D9488", "#14B8A6", "#99F6E4"], // Teal color scheme
    },
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "20px",
      },
    },
  };

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2">
      <div className="mb-auto flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">{timeframe}</span>
          <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
            <MdBarChart className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="md:mt-16 lg:mt-0">
        <div className="h-[250px] w-full xl:h-[350px]">
          <BarChart
            chartData={barChartDataInventory}
            chartOptions={barChartOptionsInventory}
          />
        </div>
      </div>
    </Card>
  );
};

export default InventoryMovementChart;
