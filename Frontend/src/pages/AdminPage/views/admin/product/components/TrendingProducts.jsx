import React, { useRef, useState, useEffect } from "react";
import Card from "components/card";
import ProductBarChart from "./ProductBarChart";
import Chart from "react-apexcharts";

const TrendingProducts = ({ products }) => {
  const scrollContainerRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const scrollAmount = 400; // Amount to scroll per click
  
  // Calculate max scroll width on mount and resize
  useEffect(() => {
    const updateMaxScroll = () => {
      if (scrollContainerRef.current) {
        setMaxScroll(
          scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
        );
      }
    };
    
    updateMaxScroll();
    window.addEventListener('resize', updateMaxScroll);
    
    return () => {
      window.removeEventListener('resize', updateMaxScroll);
    };
  }, [products]);

  // Calculate if we can scroll further in each direction
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const newPosition = direction === 'left' 
      ? Math.max(scrollPosition - scrollAmount, 0)
      : Math.min(scrollPosition + scrollAmount, maxScroll);
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };

  // Update scroll position when user manually scrolls
  const handleScrollEvent = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  // Mini area chart options for product card
  const areaChartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    tooltip: {
      enabled: false,
    },
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

  return (
    <div className="w-full">
      {/* Header with buttons moved here */}
      <div className="mb-4 mt-5 flex flex-row justify-between items-center px-4">
        <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
          Trending Products
        </h4>
        
        {/* Navigation buttons moved here */}
        <div className="flex gap-2 z-10">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 p-0 text-white shadow-md ${!canScrollLeft ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 p-0 text-white shadow-md ${!canScrollRight ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Card removed, using just a div with the scrolling container */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScrollEvent}
          className="flex overflow-x-auto pb-4 hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-4 min-w-max">
            {products.map((product, index) => (
              <div key={product.id} className="w-60 flex-shrink-0">
                <div className="relative !p-4 3xl:p-![18px] overflow-hidden rounded-[20px] border-2 border-gray-100 bg-white dark:border-navy-700 dark:bg-navy-800 shadow-lg h-[380px]">
                  {/* Make area chart container rounded and only it has gray background */}
                  <div className="h-40 rounded-xl bg-gray-100 dark:bg-navy-700">
                    {/* Area chart */}
                    <Chart
                      options={{
                        ...areaChartOptions,
                        colors: [index % 2 === 0 ? "#4318FF" : "#6AD2FF"]
                      }}
                      series={[{ 
                        name: "Trend", 
                        data: product.weeklyRevenue.map(val => val/100) 
                      }]}
                      type="area"
                      width="100%"
                      height="100%"
                    />
                  </div>

                  <div className="">
                    <div className=" flex items-center justify-between">
                      <div className="mr-2 max-w-[63%]">
                        <p className="text-md font-bold text-navy-700 dark:text-white truncate">
                          {product.name}
                        </p>
                        <p className="text-sm font-medium text-gray-600 dark:text-white mt-1">
                          {product.category}
                        </p>
                      </div>
                      <div className="bg-gray-100 dark:bg-navy-700 rounded-md px-2 py-1">
                        <p className="text-sm font-bold text-navy-700 dark:text-white">
                          ₹{product.price}
                        </p>
                      </div>
                    </div>

                    {/* Increased the height of bar chart section */}
                    <div className="h-full w-full mt-2">
                      <ProductBarChart 
                        chartData={product.weeklyRevenue} 
                        barColor={index % 2 === 0 ? "#4318FF" : "#6AD2FF"}
                        showLabels={true} // Show week labels
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingProducts;
