import React from "react";
import Card from "components/card";
import ProductPieChart from "./ProductPieChart";

const TopProductsCard = ({ title, data, extra }) => {
  return (
    <Card extra={`flex flex-col rounded-xl ${extra}`}>
      <div className="mb-3 flex items-center justify-between px-4 pt-4">
        <h4 className="text-lg font-bold text-navy-700 dark:text-white">
          {title}
        </h4>
      </div>

      <div className="flex flex-col px-4 pb-4">
        {data.map((product, index) => (
          <div 
            key={product.id}
            className={`flex items-center justify-between ${
              index !== data.length - 1 ? "mb-4" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14">
                <ProductPieChart 
                  data={product.pieChartData}
                  index={index % 3} 
                />
              </div>
              <div>
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  {product.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-white">
                  {product.category}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-navy-700 dark:text-white">
                ${product.price}
              </p>
              <p className="text-xs text-gray-600 dark:text-white">
                {product.percentageOfTotal}% of total
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopProductsCard;
