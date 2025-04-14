import React from "react";
import Chart from "react-apexcharts";

const ProductPieChart = ({ data, index }) => {
  // Define color schemes for different charts
  const colorSchemes = [
    ["#4318FF", "#EFF4FB"],  // Blue scheme
    ["#6AD2FF", "#EFF4FB"],  // Light blue scheme
    ["#05CD99", "#EFF4FB"],  // Green scheme
  ];

  const colors = colorSchemes[index % colorSchemes.length];

  // Chart configuration
  const pieChartOptions = {
    chart: {
      type: "pie",
    },
    colors: colors,
    labels: ["Product", "Other Revenue"],
    states: {
      hover: {
        filter: {
          type: "none",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    hover: { mode: null },
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          size: "65%",
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
  };

  return (
    <Chart
      options={pieChartOptions}
      series={data}
      type="pie"
      width="100%"
      height="100%"
    />
  );
};

export default ProductPieChart;
