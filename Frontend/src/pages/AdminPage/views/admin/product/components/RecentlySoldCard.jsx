import React from "react";
import Card from "components/card";
import ProductPieChart from "./ProductPieChart";

const RecentlySoldCard = () => {
  // Sample data for recently sold products with pharma categories
  const recentlySoldProducts = [
    {
      id: 1,
      name: "Amoxicillin 500mg",
      category: "Tablets",
      price: "99.99",
      percentageOfTotal: 12,
      pieChartData: [12, 88]
    },
    {
      id: 2,
      name: "Cold & Flu Relief",
      category: "Syrup",
      price: "129.99",
      percentageOfTotal: 9,
      pieChartData: [9, 91]
    },
    {
      id: 3,
      name: "Protein Supplement",
      category: "Powder",
      price: "49.99",
      percentageOfTotal: 6,
      pieChartData: [6, 94]
    },
    {
      id: 4,
      name: "Ibuprofen 200mg",
      category: "Tablets",
      price: "39.99",
      percentageOfTotal: 5,
      pieChartData: [5, 95]
    }
  ];

  return (
    <Card extra={"flex flex-col"}>
      <div className="mb-3 flex items-center justify-between px-4 pt-4">
        <h4 className="text-lg font-bold text-navy-700 dark:text-white">
          Recently Sold Products
        </h4>
      </div>

      <div className="flex flex-col px-4 pb-4">
        {recentlySoldProducts.map((product, index) => (
          <div 
            key={product.id}
            className={`flex items-center justify-between ${
              index !== recentlySoldProducts.length - 1 ? "mb-4" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-14">
                <ProductPieChart 
                  data={product.pieChartData}
                  index={(index + 2) % 3} 
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
                ₹{product.price}
              </p>
              <p className="text-xs text-gray-600 dark:text-white">
                {product.percentageOfTotal}% of revenue
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentlySoldCard;
