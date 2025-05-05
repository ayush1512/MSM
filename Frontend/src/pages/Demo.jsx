// import React, { useEffect, useState } from "react";

// const DemoPage = () => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   return (
//     <div
//       className={`bg-gradient-to-r from-blue-50 via-white to-blue-50 min-h-screen py-16 transition-opacity ${
//         isVisible ? "opacity-100" : "opacity-0"
//       }`}
//     >
//       <div className="container mx-auto px-4 text-center">
//         {/* Header Section */}
//         <h1 className="text-5xl font-bold text-gray-800 mb-6 animate__animated animate__fadeIn">
//           Welcome to Our Website!
//         </h1>
//         <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 animate__animated animate__fadeIn animate__delay-1s">
//           Your one-stop solution for managing medical stores efficiently. We
//           bring advanced features to make your operations seamless and
//           professional.
//         </p>

//         {/* Features Section */}
//         <div className="flex flex-wrap justify-center gap-8">
//           {/* Feature Card 1: Prescription Reader */}
//           <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
//             <div className="bg-blue-100 p-6">
//               <h2 className="text-2xl font-bold text-gray-800">Prescription Reader</h2>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600">
//                 Easily read and process medical prescriptions with our advanced
//                 AI-based solution. Extract data and manage it efficiently.
//               </p>
//             </div>
//           </div>

//           {/* Feature Card 2: Product Scanner */}
//           <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
//             <div className="bg-blue-100 p-6">
//               <h2 className="text-2xl font-bold text-gray-800">Product Scanner</h2>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600">
//                 Scan products instantly to retrieve details, including pricing
//                 and stock availability. Simplify your inventory operations.
//               </p>
//             </div>
//           </div>

//           {/* Feature Card 3: Stock Management */}
//           <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
//             <div className="bg-blue-100 p-6">
//               <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600">
//                 Keep track of your inventory with real-time updates. Manage
//                 stock levels efficiently and avoid overstocking or shortages.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Call-to-Action Section */}
//         <div className="mt-12">
//           <button className="px-6 py-3 bg-[#2C3E50] text-white rounded-lg shadow hover:shadow-xl transform hover:scale-105 transition-transform duration-300">
//             Get Started
//           </button>
//         </div>
//       </div>

//       {/* Footer Section */}
//       <footer className="bg-gray-800 text-white py-6 mt-16">
//         <div className="container mx-auto text-center">
//           <p className="text-sm">© 2025 Your Website. All Rights Reserved.</p>
//           <p className="text-sm mt-2">Designed with ❤️ for your medical needs.</p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default DemoPage;



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


At Medical Store, we provide a seamless and efficient way to manage your medical store. Our platform combines powerful features with an intuitive interface to ensure smooth operations. From managing prescriptions with our Prescription Reader to quickly scanning products with our Product Scanner, we offer cutting-edge tools to simplify your daily tasks.

Key Features:

Prescription Reader: Quickly scan and extract data from prescriptions for accurate record-keeping.

Product Scanner: Instantly retrieve product details, pricing, and stock levels by scanning barcodes.

Stock Management: Keep track of your inventory in real-time, ensuring you never run out of stock or overstock.
        </p>

        {/* Feature Cards Section */}
        <div className="flex flex-wrap justify-center gap-8">
          {/* Dashboard Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Get a quick overview of your business with real-time analytics
                and insights to monitor key performance metrics.
              </p>
              <a
                href="/"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View
              </a>
            </div>
          </div>

          {/* Product Place Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Product Place</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Analyze product performance, identify top-selling products, and
                access comprehensive product analysis for smarter decisions.
              </p>
              <a
                href="/product-place-demo"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View 
              </a>
            </div>
          </div>

          {/* Stock Management Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Stock Management</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Keep track of your inventory with real-time updates, manage
                stock levels efficiently, and avoid overstocking or shortages.
              </p>
              <a
                href="/admin"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View 
              </a>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Manage customer data and track their orders to ensure seamless
                customer service and satisfaction.
              </p>
              <a
                href="/customers-demo"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View
              </a>
            </div>
          </div>

          {/* Our Products Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Our Products</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Explore our extensive range of products designed to meet your
                medical store's needs with detailed descriptions and pricing.
              </p>
              <a
                href="/our-products-demo"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View 
              </a>
            </div>
          </div>

          {/* Prescription Scanner Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Prescription Scanner</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Scan and process medical prescriptions quickly and accurately.
              </p>
              <a
                href="/prescription-scanner-demo"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View 
              </a>
            </div>
          </div>

          {/* Product Scanner Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Product Scanner</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Scan products instantly to retrieve details and manage inventory.
              </p>
              <a
                href="/product-scanner-demo"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View 
              </a>
            </div>
          </div>

          {/* Bill Scanner Card */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col w-full sm:w-1/2 lg:w-1/3 transform hover:scale-105 transition-transform duration-500">
            <div className="bg-blue-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800">Bill Scanner</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Scan bills for faster processing and integration with your
                inventory system.
              </p>
              <a
                href="/bill-scanner-demo"
                className="text-blue-600 underline hover:text-blue-800"
              >
                View 
              </a>
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
