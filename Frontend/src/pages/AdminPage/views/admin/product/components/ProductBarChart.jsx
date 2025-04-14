import React from "react";
import Chart from "react-apexcharts";

const ProductBarChart = ({ chartData, barColor, showLabels = false }) => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];
  
  // Chart options
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      type: "bar",
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
      theme: "dark",
      y: {
        formatter: function (value) {
          return "$" + value;
        },
      },
    },
    xaxis: {
      categories: weeks,
      labels: {
        show: showLabels, // Show week labels based on prop
        style: {
          colors: "#A3AED0",
          fontSize: "11px", // Slightly larger font for better readability
          fontWeight: "500",
        },
        offsetY: 0, // Adjust if needed for better visibility
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
    },
    grid: {
      show: false,
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: false,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "60%",
        dataLabels: {
          position: "top",
        }
      },
    },
    colors: [barColor],
  };

  // Chart series
  const series = [
    {
      name: "Revenue",
      data: chartData,
    },
  ];

  return (
    <Chart
      options={options}
      series={series}
      type="bar"
      width="100%"
      height="85%"
    />
  );
};

export default ProductBarChart;
