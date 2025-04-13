import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MdArrowBack, 
  MdPhone, 
  MdEmail, 
  MdLocationOn, 
  MdShoppingCart, 
  MdCalendarToday,
  MdEdit,
  MdDelete,
  MdAssignment,
  MdAttachMoney,
  MdLocalOffer,
  MdReceipt,
  MdSearch,
  MdDownload,
  MdOutlineFileDownload,
  MdFilePresent
} from "react-icons/md";
import Card from "components/card";
import avatar1 from "assets/img/avatars/avatar1.png";
import prescriptionSample from "assets/img/samples/prescription-sample.jpg";

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // This would normally be fetched from an API based on the ID
  const customer = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 123-456-7890",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    lastPurchase: "2023-04-15",
    customerSince: "2021-08-10",
    totalSpent: "2,345.00",
    customerType: "Premium",
    image: avatar1,
    orders: [
      { id: "#ORD-7893", date: "2023-04-15", amount: "345.00", status: "Completed" },
      { id: "#ORD-6523", date: "2023-03-22", amount: "180.50", status: "Completed" },
      { id: "#ORD-5219", date: "2023-02-18", amount: "420.75", status: "Completed" },
      { id: "#ORD-4781", date: "2023-01-05", amount: "95.20", status: "Completed" }
    ],
    notes: "Prefers email communication. Allergic to penicillin.",
    prescriptions: [
      {
        id: "PRE-001",
        date: "2023-04-15",
        doctor: "Dr. Sarah Miller",
        hospital: "City Medical Center",
        medications: [
          { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily", days: 7 },
          { name: "Ibuprofen", dosage: "400mg", frequency: "As needed", days: 5 }
        ],
        imageUrl: prescriptionSample
      },
      {
        id: "PRE-002",
        date: "2023-02-10",
        doctor: "Dr. James Wilson",
        hospital: "Downtown Clinic",
        medications: [
          { name: "Hydrocodone", dosage: "5mg", frequency: "Twice daily", days: 5 },
          { name: "Promethazine", dosage: "25mg", frequency: "At bedtime", days: 5 }
        ],
        imageUrl: prescriptionSample
      },
      {
        id: "PRE-003",
        date: "2022-12-05",
        doctor: "Dr. Robert Brown",
        hospital: "Family Health Center",
        medications: [
          { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", days: 30 },
          { name: "Atorvastatin", dosage: "20mg", frequency: "Once daily", days: 30 }
        ],
        imageUrl: prescriptionSample
      }
    ],
    bills: [
      {
        id: "BILL-7893",
        date: "2023-04-15",
        items: [
          { name: "Amoxicillin 500mg", quantity: 21, price: 175.00 },
          { name: "Ibuprofen 400mg", quantity: 15, price: 65.00 },
          { name: "Vitamin C", quantity: 1, price: 105.00 }
        ],
        total: 345.00,
        paymentMethod: "Credit Card",
        prescriptionId: "PRE-001"
      },
      {
        id: "BILL-6523",
        date: "2023-03-22",
        items: [
          { name: "Multivitamin", quantity: 1, price: 80.50 },
          { name: "Band-Aids", quantity: 1, price: 45.00 },
          { name: "Pain Relief Gel", quantity: 1, price: 55.00 }
        ],
        total: 180.50,
        paymentMethod: "Cash",
        prescriptionId: null
      },
      {
        id: "BILL-5219",
        date: "2023-02-18",
        items: [
          { name: "Hydrocodone 5mg", quantity: 10, price: 120.75 },
          { name: "Promethazine 25mg", quantity: 5, price: 95.00 },
          { name: "Cold & Flu Medicine", quantity: 1, price: 205.00 }
        ],
        total: 420.75,
        paymentMethod: "Credit Card",
        prescriptionId: "PRE-002"
      },
      {
        id: "BILL-4781",
        date: "2023-01-05",
        items: [
          { name: "Face Masks", quantity: 1, price: 45.20 },
          { name: "Hand Sanitizer", quantity: 1, price: 50.00 }
        ],
        total: 95.20,
        paymentMethod: "Cash",
        prescriptionId: null
      }
    ]
  };
  
  // Generate initials when no image is available
  const getInitials = (name) => {
    if (!name) return "NA";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-3">
      {/* Header with back button */}
      <div className="flex items-center mb-5">
        <button 
          onClick={() => navigate(-1)}
          className="mr-4 flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-navy-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
        </button>
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Customer Details
        </h4>
      </div>
      
      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-navy-700">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'overview'
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'prescriptions'
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Prescriptions
            </button>
          </li>
          <li className="mr-2">
            <button
              onClick={() => setActiveTab('bills')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'bills'
                  ? 'border-b-2 border-brand-500 text-brand-500'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              Purchase History
            </button>
          </li>
        </ul>
      </div>
      
      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Customer profile card */}
          <div className="col-span-1">
            <Card extra={"w-full p-4"}>
              <div className="flex flex-col items-center">
                <div className="mb-3 h-28 w-28 rounded-full">
                  {customer.image ? (
                    <img
                      src={customer.image}
                      className="h-full w-full rounded-full object-cover"
                      alt={customer.name}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full rounded-full bg-brand-500 text-white text-4xl font-bold">
                      {getInitials(customer.name)}
                    </div>
                  )}
                </div>
                
                <h4 className="mb-1 text-xl font-bold text-navy-700 dark:text-white">
                  {customer.name}
                </h4>
                
                <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {customer.customerType} Customer
                </p>
                
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition-colors">
                    <MdEdit className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors">
                    <MdDelete className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-navy-600">
                <div className="mb-3 flex items-center">
                  <MdPhone className="mr-2 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {customer.phone}
                  </p>
                </div>
                
                <div className="mb-3 flex items-center">
                  <MdEmail className="mr-2 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {customer.email}
                  </p>
                </div>
                
                <div className="mb-3 flex items-center">
                  <MdLocationOn className="mr-2 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
                  </p>
                </div>
                
                <div className="mb-3 flex items-center">
                  <MdCalendarToday className="mr-2 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Customer since {formatDate(customer.customerSince)}
                  </p>
                </div>
              </div>
            </Card>
            
            {/* Customer metrics card */}
            <Card extra={"w-full p-4 mt-4"}>
              <h5 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
                Customer Metrics
              </h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 dark:bg-navy-700 p-3">
                  <div className="flex items-center gap-2">
                    <MdShoppingCart className="h-5 w-5 text-brand-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Orders
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-bold text-navy-700 dark:text-white">
                    {customer.orders.length}
                  </p>
                </div>
                
                <div className="rounded-lg bg-gray-50 dark:bg-navy-700 p-3">
                  <div className="flex items-center gap-2">
                    <MdAttachMoney className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Spent
                    </p>
                  </div>
                  <p className="mt-2 text-xl font-bold text-navy-700 dark:text-white">
                    ${customer.totalSpent}
                  </p>
                </div>
                
                <div className="rounded-lg bg-gray-50 dark:bg-navy-700 p-3">
                  <div className="flex items-center gap-2">
                    <MdCalendarToday className="h-5 w-5 text-orange-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Last Purchase
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-navy-700 dark:text-white">
                    {formatDate(customer.lastPurchase)}
                  </p>
                </div>
                
                <div className="rounded-lg bg-gray-50 dark:bg-navy-700 p-3">
                  <div className="flex items-center gap-2">
                    <MdLocalOffer className="h-5 w-5 text-purple-500" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Customer Type
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-navy-700 dark:text-white">
                    {customer.customerType}
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Order history and notes section */}
          <div className="col-span-1 lg:col-span-2">
            {/* Order history */}
            <Card extra={"w-full p-4"}>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-lg font-bold text-navy-700 dark:text-white">
                  Order History
                </h5>
                <button 
                  onClick={() => setActiveTab('bills')}
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                >
                  View All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-navy-700">
                      <th className="py-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                          Order ID
                        </p>
                      </th>
                      <th className="py-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                          Date
                        </p>
                      </th>
                      <th className="py-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                          Amount
                        </p>
                      </th>
                      <th className="py-3 text-left">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-white">
                          Status
                        </p>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-200 dark:border-navy-700 last:border-none">
                        <td className="py-3">
                          <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {order.id}
                          </p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {formatDate(order.date)}
                          </p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            ${order.amount}
                          </p>
                        </td>
                        <td className="py-3">
                          <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-400">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            {/* Notes */}
            <Card extra={"w-full p-4 mt-4"}>
              <div className="flex items-center mb-3">
                <MdAssignment className="mr-2 text-gray-600 dark:text-gray-400" />
                <h5 className="text-lg font-bold text-navy-700 dark:text-white">
                  Notes
                </h5>
              </div>
              
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {customer.notes || "No notes available for this customer."}
              </p>
              
              <div className="mt-4">
                <textarea 
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm dark:border-navy-600 dark:bg-navy-700 dark:text-white"
                  placeholder="Add a note about this customer..."
                  rows={3}
                />
                <button className="mt-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
                  Add Note
                </button>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* Prescriptions Tab Content */}
      {activeTab === 'prescriptions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold text-navy-700 dark:text-white">
              Prescription History
            </h5>
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search prescriptions..."
                className="w-full py-2 pl-10 pr-4 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-sm"
              />
              <MdSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {customer.prescriptions.map((prescription, index) => (
              <Card key={index} extra="p-4">
                <div className="flex justify-between mb-3">
                  <h6 className="font-bold text-navy-700 dark:text-white">
                    Prescription #{prescription.id}
                  </h6>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(prescription.date)}
                  </span>
                </div>
                
                <div className="mb-4 relative">
                  <img 
                    src={prescription.imageUrl} 
                    alt="Prescription" 
                    className="w-full h-40 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute top-2 right-2">
                    <button className="bg-white dark:bg-navy-800 rounded-full p-1.5 shadow-md text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700">
                      <MdOutlineFileDownload size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Doctor: {prescription.doctor}
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Hospital: {prescription.hospital}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 dark:border-navy-600 pt-3 mt-2">
                  <p className="text-sm font-semibold text-navy-700 dark:text-white mb-2">
                    Medications ({prescription.medications.length}):
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    {prescription.medications.map((med, idx) => (
                      <li key={idx} className="flex justify-between items-start bg-gray-50 dark:bg-navy-700 p-2 rounded">
                        <div>
                          <span className="font-medium">{med.name}</span>
                          <p className="text-xs">{med.dosage}, {med.frequency}, {med.days} days</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <button className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm font-medium flex items-center gap-1">
                    <MdFilePresent size={16} />
                    View Details
                  </button>
                  {prescription.id === customer.bills[0].prescriptionId && (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs py-1 px-2 rounded-full">
                      Latest Purchase
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Bills Tab Content */}
      {activeTab === 'bills' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-lg font-bold text-navy-700 dark:text-white">
              Purchase History
            </h5>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search bills..."
                  className="w-full py-2 pl-10 pr-4 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-sm"
                />
                <MdSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <button className="flex items-center gap-1 bg-brand-500 hover:bg-brand-600 text-white px-3 py-2 rounded-lg text-sm">
                <MdDownload size={16} />
                Export All
              </button>
            </div>
          </div>
          
          {customer.bills.map((bill, index) => (
            <Card key={index} extra="p-4 mb-4">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h6 className="font-bold text-lg text-navy-700 dark:text-white">
                      Invoice #{bill.id}
                    </h6>
                    {bill.prescriptionId && (
                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs py-1 px-2 rounded-full">
                        Prescription #{bill.prescriptionId}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Date: {formatDate(bill.date)}
                  </p>
                </div>
                
                <div className="mt-2 md:mt-0 flex items-center gap-2">
                  <div className="bg-gray-100 dark:bg-navy-700 py-1 px-3 rounded-full">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment: {bill.paymentMethod}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-700 dark:text-white px-3 py-1 rounded-full text-sm">
                    <MdReceipt size={16} />
                    Receipt
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] mb-3">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-navy-700">
                      <th className="py-2 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Item
                      </th>
                      <th className="py-2 text-center text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="py-2 text-right text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 dark:border-navy-700 last:border-b-0">
                        <td className="py-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                          {item.name}
                        </td>
                        <td className="py-2 text-sm text-center text-gray-600 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-sm text-right text-gray-600 dark:text-gray-400">
                          ₹{item.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-navy-700">
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Subtotal: ₹{bill.total.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Tax: ₹0.00
                  </p>
                  <p className="text-base font-bold text-navy-700 dark:text-white mt-1">
                    Total: ₹{bill.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
