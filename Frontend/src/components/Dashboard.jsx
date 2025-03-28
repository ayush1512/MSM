import React from 'react';
import backgroundImage from '../assets/051886b3-1079-4adf-9267-79863cf2f229.jpg';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <section
        className="bg-contain bg-center bg-no-repeat h-[80vh] flex items-center justify-center margin mt-12"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="bg-[#2C3E50] bg-opacity-80 p-8 text-center rounded">
          <h1 className="text-4xl font-bold text-white mb-4">
            Medical Store Management
          </h1>
          <p className="text-white text-lg">
            Streamline your medical store management with ease and efficiency.
          </p>
        </div>
      </section>

      {/* Products / Services Section */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">
          Our Products
        </h2>
        {/* Changed grid-cols-3 to grid-cols-2 and added max-w-4xl mx-auto for centering */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Product Card 1 - Prescription Reader */}
          <div className="bg-white shadow p-8 rounded hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-4">Prescription Reader</h3>
            <p className="text-gray-600 text-lg">
              Manage and digitize patient prescriptions seamlessly.
            </p>
            <button className="mt-6 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700"
            onClick={() => navigate('/prescription-reader')}>
              Scan Now
            </button>
          </div>

          {/* Product Card 2 - Product Scanner */}
          <div className="bg-white shadow p-8 rounded hover:shadow-lg transition">
            <h3 className="text-2xl font-semibold mb-4">Product Scanner</h3>
            <p className="text-gray-600 text-lg">
              Track inventory with ease using our efficient product scanner.
            </p>
            <button className="mt-6 px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700"
             onClick={() => navigate('/product-scanner')}>
              Scan Now
            </button>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Why Choose Our Solutions?
          </h2>
          <p className="text-gray-600 mb-6">
            We provide robust, user-friendly, and cost-effective software
            solutions for the healthcare industry.
          </p>
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-500"
           onClick={() => navigate('/contact-us')}>
            Request a Quote
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
