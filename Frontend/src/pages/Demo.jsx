import React, { useEffect, useState } from "react";

const DemoPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen py-16 transition-opacity ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Header Section */}
        <h1 className="text-5xl font-bold text-gray-800 mb-6 animate__animated animate__fadeIn">
          Welcome to Our Website!
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 animate__animated animate__fadeIn animate__delay-1s">
          Your one-stop solution for managing medical stores efficiently. We
          bring advanced features to make your operations seamless and
          professional.
        </p>

        {/* Features Section */}
        <div className="flex flex-wrap justify-center gap-8">
          {/* Feature Card 1: Prescription Reader */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Prescription Reader</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Easily read and process medical prescriptions with our advanced
                AI-based solution. Extract data and manage it efficiently.
              </p>
            </div>
          </div>

          {/* Feature Card 2: Product Scanner */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Product Scanner</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Scan products instantly to retrieve details, including pricing
                and stock availability. Simplify your inventory operations.
              </p>
            </div>
          </div>

          {/* Feature Card 3: Stock Management */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Keep track of your inventory with real-time updates. Manage
                stock levels efficiently and avoid overstocking or shortages.
              </p>
            </div>
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="mt-12">
          <button className="px-6 py-3 bg-[#2C3E50] text-white rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition-transform duration-300">
            Get Started
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-6 mt-16">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2025 Your Website. All Rights Reserved.</p>
          <p className="text-sm mt-2">Designed with ❤️ for your medical needs.</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoPage;
