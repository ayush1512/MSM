import React from "react";
import Card from "components/card";
import Chart from "react-apexcharts";
import { MdVerified, MdInfoOutline } from "react-icons/md";
import { FaGlobe } from "react-icons/fa";

const MarketInsightsSection = ({ product }) => {
  // Market rank chart options
  const rankChartOptions = {
    chart: {
      sparkline: {
        enabled: true,
      },
      toolbar: {
        show: false,
      },
    },
    grid: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
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
    colors: ["#4318FF"],
  };

  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-bold text-navy-700 dark:text-white text-lg">
          Market Insights
        </h4>
      </div>

      <div className="space-y-4">
        {/* Market Ranking */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-navy-800 p-3 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Market Ranking</p>
            <div className="flex items-center">
              <h3 className="font-bold text-2xl text-navy-700 dark:text-white mr-2">
                #{product.market.ranking}
              </h3>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                of {product.market.totalProducts} in {product.categoryName}
              </p>
            </div>
          </div>
          <div className="h-16 w-24">
            <Chart
              options={rankChartOptions}
              series={[{
                name: "Rank Position",
                data: product.market.rankHistory,
              }]}
              type="line"
              width="100%"
              height="100%"
            />
          </div>
        </div>

        {/* Regulatory Approvals */}
        <div className="bg-gray-50 dark:bg-navy-800 p-3 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Regulatory Approvals</p>
          <div className="flex flex-wrap gap-2">
            {product.market.approvals.map((approval, index) => (
              <div 
                key={index}
                className="flex items-center bg-white dark:bg-navy-900 py-1 px-2 rounded border border-gray-200 dark:border-navy-700"
              >
                <MdVerified 
                  className={`mr-1 ${
                    approval.status === 'approved' 
                      ? 'text-green-500' 
                      : approval.status === 'pending' 
                      ? 'text-yellow-500' 
                      : 'text-red-500'
                  }`}
                />
                <span className="text-xs font-medium text-navy-700 dark:text-white">
                  {approval.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Global Presence */}
        <div className="bg-gray-50 dark:bg-navy-800 p-3 rounded-lg">
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Global Presence</p>
            <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 py-0.5 px-2 rounded-full">
              {product.market.countries.length} Countries
            </span>
          </div>
          
          <div className="relative h-32 mb-2 bg-gray-100 dark:bg-navy-900 rounded overflow-hidden">
            {/* This would ideally be a proper world map component.
                For now, just a visual placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <FaGlobe className="text-5xl text-gray-300 dark:text-gray-700" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {product.market.countries.slice(0, 5).map((country, index) => (
              <span key={index} className="text-xs bg-white dark:bg-navy-900 py-0.5 px-1.5 rounded border border-gray-200 dark:border-navy-700">
                {country}
              </span>
            ))}
            {product.market.countries.length > 5 && (
              <span className="text-xs bg-white dark:bg-navy-900 py-0.5 px-1.5 rounded border border-gray-200 dark:border-navy-700">
                +{product.market.countries.length - 5} more
              </span>
            )}
          </div>
        </div>
        
        {/* Latest News */}
        {product.market.news && product.market.news.length > 0 && (
          <div className="bg-gray-50 dark:bg-navy-800 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Recent Updates
            </p>
            <div className="space-y-2">
              {product.market.news.slice(0, 2).map((item, index) => (
                <div key={index} className="bg-white dark:bg-navy-900 p-2 rounded border border-gray-200 dark:border-navy-700">
                  <p className="text-xs font-medium text-navy-700 dark:text-white mb-1">
                    {item.title}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.date}
                    </p>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-brand-500 hover:underline"
                    >
                      Read more
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MarketInsightsSection;
