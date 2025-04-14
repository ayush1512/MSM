import ProductBanner from "./components/ProductBanner";
import TrendingProducts from "./components/TrendingProducts";
import RecentlyAddedTable from "./components/RecentlyAddedTable";
import TopProductsCard from "./components/TopProductsCard";
import RecentlySoldCard from "./components/RecentlySoldCard";

// Import data files
import tableDataRecentlyAdded from "./variables/tableDataRecentlyAdded.json";
import trendingProductsData from "./variables/trendingProductsData.json";
import topProductsData from "./variables/topProductsData.json";

import {
  columnsDataRecentlyAdded,
  columnsDataTopProducts,
  columnsDataRecentlySold,
} from "./variables/columnsData";

const ProductPlace = () => {
  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        {/* Product Banner - Top 3 products this month */}
        <ProductBanner />

        {/* Trending Products Section - Heading moved inside component */}
        <TrendingProducts products={trendingProductsData} />

        {/* Recently Added Products Section */}
        <div className="mb-5 mt-5 flex items-center justify-between px-[26px]">
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            Recently Added
          </h4>
        </div>
        <RecentlyAddedTable 
          columnsData={columnsDataRecentlyAdded} 
          tableData={tableDataRecentlyAdded} 
        />
      </div>

      {/* Right side section */}
      <div className="col-span-1 h-full w-full rounded-xl 2xl:col-span-1">
        <TopProductsCard
          title="Top Products (Last 6 Months)"
          data={topProductsData}
          extra="mb-5"
        />
        <RecentlySoldCard />
      </div>
    </div>
  );
};

export default ProductPlace;
