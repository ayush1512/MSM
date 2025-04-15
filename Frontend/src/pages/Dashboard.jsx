import React from 'react';
import backgroundImage from '../assets/051886b3-1079-4adf-9267-79863cf2f229.jpg';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <section
        className="bg-contain bg-center bg-no-repeat h-[60vh] sm:h-[80vh] flex items-center justify-center mt-4 sm:mt-12 px-4"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="bg-[#2C3E50] bg-opacity-80 p-4 sm:p-8 text-center rounded w-full max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">
            Medical Store Management
          </h1>
          <p className="text-white text-sm sm:text-lg">
            Streamline your medical store management with ease and efficiency.
          </p>
        </div>
      </section>

      {/* Products / Services Section */}
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center">
          Our Products
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {/* Product Card 1 - Prescription Reader */}
          <div className="bg-white shadow p-6 sm:p-8 rounded hover:shadow-lg transition">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Prescription Reader</h3>
            <p className="text-gray-600 text-base sm:text-lg">
              Manage and digitize patient prescriptions seamlessly.
            </p>
            <button className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded hover:bg-gray-700 w-full sm:w-auto"
            onClick={() => navigate('/prescription-reader')}>
              Scan Now
            </button>
          </div>

          {/* Product Card 2 - Product Scanner */}
          <div className="bg-white shadow p-6 sm:p-8 rounded hover:shadow-lg transition">
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">Product Scanner</h3>
            <p className="text-gray-600 text-base sm:text-lg">
              Track inventory with ease using our efficient product scanner.
            </p>
            <button className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 text-white rounded hover:bg-gray-700 w-full sm:w-auto"
             onClick={() => navigate('/product-scanner')}>
              Scan Now
            </button>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section className="bg-gray-100 py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Why Choose Our Solutions?
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
            We provide robust, user-friendly, and cost-effective software
            solutions for the healthcare industry.
          </p>
          <button className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded hover:bg-blue-500 w-full sm:w-auto max-w-xs mx-auto"
           onClick={() => navigate('/contact-us')}>
            Request a Quote
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
