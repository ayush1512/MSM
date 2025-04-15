import React from "react";
import Card from "components/card";
import Chart from "react-apexcharts";

const PerformanceSection = ({ product }) => {
  // Sales data chart
  const salesChartOptions = {
    chart: {
      id: "sales-chart",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false
      },
    },
    tooltip: {
      theme: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: product.performance.months,
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
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
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
    },
    grid: {
      strokeDashArray: 5,
      borderColor: "#E2E8F0",
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    colors: ["#4318FF", "#39B8FF"]
  };

  // Inventory flow chart
  const inventoryChartOptions = {
    chart: {
      id: "inventory-chart",
      type: "bar",
      toolbar: {
        show: false,
      },
      stacked: true,
    },
    tooltip: {
      theme: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: product.performance.months,
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
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
      labels: {
        style: {
          colors: "#A3AED0",
          fontSize: "12px",
          fontWeight: "500",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
    },
    grid: {
      strokeDashArray: 5,
      borderColor: "#E2E8F0",
    },
    colors: ["#4318FF", "#FF5733"]
  };

  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-bold text-navy-700 dark:text-white text-lg">
          Performance Insights
        </h4>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Sales & Demand Trend
            </h5>
            <div className="h-64">
              <Chart
                options={salesChartOptions}
                series={[
                  {
                    name: "Units Sold",
                    data: product.performance.unitsSold,
                  },
                  {
                    name: "Demand Forecast",
                    data: product.performance.demandForecast,
                  },
                ]}
                type="area"
                width="100%"
                height="100%"
              />
            </div>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Inventory Movement
            </h5>
            <div className="h-64">
              <Chart
                options={inventoryChartOptions}
                series={[
                  {
                    name: "Inflow",
                    data: product.performance.inventoryInflow,
                  },
                  {
                    name: "Outflow",
                    data: product.performance.inventoryOutflow.map(val => -val), // Negative values for outflow
                  },
                ]}
                type="bar"
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="grid grid-cols-1 gap-4">
            {/* Key Performance Indicators */}
            <div className="bg-gray-50 dark:bg-navy-800 p-4 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Key Metrics
              </h5>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Units Sold (YTD)</p>
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {product.performance.totalUnitsSold.toLocaleString()}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full" 
                      style={{ width: `${(product.performance.totalUnitsSold / product.performance.targetUnits) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                    Target: {product.performance.targetUnits.toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Return Rate</p>
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {product.performance.returnRate}%
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        product.performance.returnRate < 2 
                          ? 'bg-green-500' 
                          : product.performance.returnRate < 5 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`} 
                      style={{ width: `${product.performance.returnRate * 10}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                    Industry avg: 2.7%
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-navy-900 rounded-md">
                  <h6 className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase mb-2">
                    Best Selling Month
                  </h6>
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center mr-3">
                      <p className="text-brand-500 dark:text-brand-400 font-bold">{product.performance.bestMonth.substring(0, 3)}</p>
                    </div>
                    <div>
                      <p className="text-navy-700 dark:text-white font-bold">
                        {product.performance.bestMonthUnits.toLocaleString()} Units
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.performance.bestMonthRevenue}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white dark:bg-navy-900 rounded-md">
                  <h6 className="text-xs font-semibold text-gray-800 dark:text-gray-200 uppercase mb-2">
                    Similar Product Comparison
                  </h6>
                  {product.performance.similarProducts.map((item, index) => (
                    <div key={index} className="flex justify-between items-center mb-1 last:mb-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                      <p className="text-xs font-medium text-navy-700 dark:text-white">{item.sales} units</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PerformanceSection;
