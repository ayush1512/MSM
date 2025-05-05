import React, { useEffect, useState } from "react";
import Card from "components/card";
import { MdBarChart } from "react-icons/md";
import BarChart from "components/charts/BarChart";

const InventoryMovementChart = ({ title = "Inventory Movement", timeframe = "This Week" }) => {
  const [chartData, setChartData] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchInventoryMovement = async () => {
      try {
        const response = await fetch(`${API_URL}/stock/inventory-movement`, {
          credentials: "include",
        });
        const data = await response.json();

        const inflow = data.inflow.map((item) => item.total);
        const outflow = data.outflow.map((item) => -item.total);

        setChartData([
          { name: "Inflow", data: inflow, color: "#0D9488" },
          { name: "Outflow", data: outflow, color: "#14B8A6" },
        ]);
      } catch (error) {
        console.error("Error fetching inventory movement:", error);
      }
    };

    fetchInventoryMovement();
  }, [API_URL]);

  const barChartOptions = {
    chart: { stacked: true, toolbar: { show: false } },
    xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    yaxis: { labels: { formatter: (val) => Math.abs(val) } },
  };

  return (
    <Card>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">{title}</h2>
        <MdBarChart className="h-6 w-6 text-brand-500" />
      </div>
      <BarChart chartData={chartData} chartOptions={barChartOptions} />
    </Card>
  );
};

export default InventoryMovementChart;
