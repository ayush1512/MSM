import React from "react";
import Card from "components/card";
import ProductPieChart from "./ProductPieChart";
import Chart from "react-apexcharts";
import Nft4 from "assets/img/nfts/Nft4.png";

const ProductBanner = () => {
  // Sample top product data
  const topProducts = [
    {
      id: 1,
      name: "Azithromycin 500mg",
      category: "Tablets",
      price: "₹299.99",
      revenue: 45000,
      percentageOfTotal: 32,
      pieChartData: [32, 68],
      lineChartData: [12, 15, 20, 25, 30, 35, 32],
      rank: 1
    },
    {
      id: 2,
      name: "Cefixime Suspension",
      category: "Syrup",
      price: "₹249.99",
      revenue: 38000,
      percentageOfTotal: 27,
      pieChartData: [27, 73],
      lineChartData: [10, 12, 18, 22, 24, 27, 27],
      rank: 2
    },
    {
      id: 3,
      name: "Protein Supplement",
      category: "Powder",
      price: "₹199.99",
      revenue: 25000,
      percentageOfTotal: 18,
      pieChartData: [18, 82],
      lineChartData: [8, 10, 12, 14, 16, 18, 18],
      rank: 3
    }
  ];

  // Mini line chart options
  const lineChartOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    tooltip: {
      enabled: false,
    },
    colors: ["#4318FF"],
    grid: { show: false },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      show: false,
    },
  };

  // Trophy icon component with different colors based on rank
  const TrophyIcon = ({ rank }) => {
    let color;
    if (rank === 1) color = "#FFD700"; // Gold
    else if (rank === 2) color = "#C0C0C0"; // Silver
    else if (rank === 3) color = "#CD7F32"; // Bronze
    
    return (
      <div className="absolute top-2 right-2 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill={color}>
          <path d="M5 16.93a8 8 0 1 1 14 0l-7-2.1-7 2.1Z"></path>
          <path d="M12 14.93V21M17.36 20.5 12 14.93l-5.36 5.57"></path>
        </svg>
        <span className="text-xs font-bold" style={{color}}>{rank}</span>
      </div>
    );
  };

  return (
    <Card extra={"w-full p-4 h-full shadow-xl rounded-xl"} style={{
      backgroundImage: `url(${Nft4})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      backgroundColor: 'rgba(255, 255, 255, 0.85)'
    }}>
      <div className="mb-3 flex items-center justify-between px-1">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Top Products of the Month
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topProducts.map((product, index) => (
          <div 
            key={product.id}
            className="flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-3 dark:!border-navy-700 dark:!bg-navy-800 shadow-lg relative"
          >
            <TrophyIcon rank={product.rank} />
            
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
                  <Chart
                    options={lineChartOptions}
                    series={[{ data: product.lineChartData }]}
                    type="line"
                    width="100%"
                    height="100%"
                  />
                </div>
                <div className="ml-4">
                  <h5 className="text-base font-bold text-navy-700 dark:text-white">
                    {product.name}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-white">
                    {product.category}
                  </p>
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {product.price}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    Revenue: ₹{(product.revenue/1000).toFixed(1)}K
                  </p>
                  <p className="text-sm text-gray-600 dark:text-white">
                    {product.percentageOfTotal}% of total
                  </p>
                </div>
                <div className="h-20 w-20">
                  <ProductPieChart 
                    data={product.pieChartData}
                    index={index} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProductBanner;
