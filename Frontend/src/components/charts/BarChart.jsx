import React from "react";
import Chart from "react-apexcharts";

const BarChart = (props) => {
  const { chartData, chartOptions } = props;
  
  return (
    <Chart
      options={chartOptions}
      series={chartData}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default BarChart;
