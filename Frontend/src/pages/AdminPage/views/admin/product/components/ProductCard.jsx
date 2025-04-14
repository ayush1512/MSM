import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

// Components
import ProductHeader from "./components/ProductHeader";
import ManufacturerSection from "./components/ManufacturerSection";
import PerformanceSection from "./components/PerformanceSection";
import MarketInsightsSection from "./components/MarketInsightsSection";
import ProductDescriptionSection from "./components/ProductDescriptionSection";
import AiRecommendationsSection from "./components/AiRecommendationsSection";

// Layout components
import Card from "components/card";
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Mock data (replace with API call later)
import { getSingleProductData } from "./variables/productData";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // For now use mock data
        // Replace with actual API call in production
        // const response = await axios.get(`http://localhost:5000/products/${id}`);
        // setProductData(response.data);
        
        // Mock data with timeout to simulate API call
        setTimeout(() => {
          const data = getSingleProductData(id);
          if (data) {
            setProductData(data);
            setLoading(false);
          } else {
            setError("Product not found");
            setLoading(false);
          }
        }, 800);
      } catch (error) {
        console.error("Error fetching product data:", error);
        setError("Failed to load product data");
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-5">
      {/* Header with back button */}
      <div className="flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <h4 className="text-xl font-bold text-black dark:text-white">
          Product Details
        </h4>
      </div>
      
      {/* Product Header - Basic Info & Action Buttons */}
      <ProductHeader product={productData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column - Description & Manufacturer */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          <ProductDescriptionSection product={productData} />
          <ManufacturerSection product={productData} />
        </div>
        
        {/* Right Column - Performance, Market & AI */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <PerformanceSection product={productData} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <MarketInsightsSection product={productData} />
            <AiRecommendationsSection product={productData} />
          </div>
        </div>
      </div>

      {/* Link to specific product */}
      <Link 
        to={`/admin/product/${productData?.id}`}
        className="text-brand-500 hover:text-brand-600 font-medium"
      >
        View Details
      </Link>
    </div>
  );
};

export default ProductPage;