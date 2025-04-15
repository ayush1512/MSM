import React from "react";
import Card from "components/card";
import { MdAssistant, MdNotifications, MdArrowUpward, MdArrowDownward, MdLocalOffer } from "react-icons/md";
import { FaRobot, FaLightbulb } from "react-icons/fa";

const AiRecommendationsSection = ({ product }) => {
  return (
    <Card extra={"w-full p-4 h-full"}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <FaRobot className="text-brand-500 dark:text-brand-400 mr-2" />
          <h4 className="font-bold text-navy-700 dark:text-white text-lg">
            AI Insights
          </h4>
        </div>
        <span className="text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 py-1 px-2 rounded-full">
          Smart™
        </span>
      </div>

      <div className="space-y-4">
        {/* Restock Alert */}
        {product.ai.restockAlert && (
          <div className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-md mr-3">
              <MdNotifications className="text-lg text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
                Restock Alert
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                {product.ai.restockAlert.message}
              </p>
              <div className="flex items-center">
                <span className="text-xs font-medium bg-white dark:bg-navy-900 text-gray-800 dark:text-gray-200 py-0.5 px-2 rounded-full border border-gray-200 dark:border-navy-700">
                  Recommended: {product.ai.restockAlert.recommendedQuantity} Units
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Pricing Suggestions */}
        <div className="flex items-start p-3 bg-gray-50 dark:bg-navy-800 rounded-lg">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-md mr-3">
            <MdLocalOffer className="text-lg text-green-600 dark:text-green-400" />
          </div>
          <div className="w-full">
            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Pricing Analysis
            </h5>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              {product.ai.pricingSuggestion.message}
            </p>
            
            <div className="flex w-full justify-between items-center bg-white dark:bg-navy-900 p-2 rounded-md">
              <div className="flex items-center">
                <span className={`text-xs py-0.5 px-2 rounded-full font-medium mr-2 
                  ${product.ai.pricingSuggestion.action === 'increase' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {product.ai.pricingSuggestion.action === 'increase' 
                    ? <MdArrowUpward className="inline mr-0.5" /> 
                    : <MdArrowDownward className="inline mr-0.5" />
                  }
                  {product.ai.pricingSuggestion.percentage}%
                </span>
                <span className="text-xs font-bold text-navy-700 dark:text-white">
                  ₹{product.ai.pricingSuggestion.suggestedPrice} (Suggested)
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Current: ₹{product.price}</span>
            </div>
          </div>
        </div>
        
        {/* Sales Forecast */}
        <div className="flex items-start p-3 bg-gray-50 dark:bg-navy-800 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-md mr-3">
            <MdAssistant className="text-lg text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">
              Sales Forecast
            </h5>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              Projected sales for the next 30 days.
            </p>
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold text-navy-700 dark:text-white">
                {product.ai.salesForecast.projectedUnits} Units
              </div>
              <span className={`text-xs py-0.5 px-2 rounded-full 
                ${product.ai.salesForecast.trend === 'up' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {product.ai.salesForecast.trend === 'up' ? '+' : '-'}
                {product.ai.salesForecast.changePercentage}% vs last month
              </span>
            </div>
          </div>
        </div>
        
        {/* Similar Products Recommendation */}
        <div className="p-3 bg-gray-50 dark:bg-navy-800 rounded-lg">
          <div className="flex items-center mb-2">
            <FaLightbulb className="text-lg text-yellow-500 mr-2" />
            <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Similar Products to Consider
            </h5>
          </div>
          
          <div className="space-y-2">
            {product.ai.similarProducts.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white dark:bg-navy-900 p-2 rounded-md">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-100 dark:bg-navy-700 rounded flex items-center justify-center mr-2">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{item.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-navy-700 dark:text-white">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.reason}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-brand-500">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AiRecommendationsSection;
