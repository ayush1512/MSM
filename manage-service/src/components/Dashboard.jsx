import React from "react";


const Dashboard = () => {
  return (
    <div>
      <section
        className="bg-cover bg-center bg-no-repeat h-[60vh] flex items-center justify-center"> 
        <div className="bg-black bg-opacity-50 p-8 text-center rounded">
          <h1 className="text-4xl font-bold text-white mb-4">
            Medical Billing Software
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product Card 1 */}
          <div className="bg-white shadow p-6 rounded hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">Hospital Care Software</h3>
            <p className="text-gray-600">
              Manage patient records, appointments, and billing in one place.
            </p>
            <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
              Learn More
            </button>
          </div>

          {/* Product Card 2 */}
          <div className="bg-white shadow p-6 rounded hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">Medical Store Software</h3>
            <p className="text-gray-600">
              Track inventory, sales, and daily orders seamlessly.
            </p>
            <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
              Learn More
            </button>
          </div>

          {/* Product Card 3 */}
          <div className="bg-white shadow p-6 rounded hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-4">Billing & Invoicing System</h3>
            <p className="text-gray-600">
              Generate invoices and track payments with ease.
            </p>
            <button className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">
              Learn More
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
          <button className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-500">
            Request a Quote
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
