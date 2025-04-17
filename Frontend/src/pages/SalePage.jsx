import React, { useState, useEffect } from "react";
import { MdAdd, MdDelete, MdPrint, MdSave } from "react-icons/md";

const SalePage = () => {
  // Customer form state
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });
  
  // Medicines state
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState({
    name: "",
    quantity: 1,
    price: 0,
    batch: "",
    expiry: ""
  });
  
  // Stock items for autocomplete (this would come from MongoDB)
  const [stockItems, setStockItems] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  
  // Total amount calculation
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  
  // Fetch stock items from MongoDB (mock data for now)
  useEffect(() => {
    // This would be replaced with actual API call to MongoDB
    const mockStock = [
      { id: "1", name: "Amoxicillin 500mg", price: 99.99, batch: "AMX001", expiry: "2025-06-15", quantity: 100 },
      { id: "2", name: "Paracetamol 650mg", price: 49.99, batch: "PCM002", expiry: "2024-12-20", quantity: 200 },
      { id: "3", name: "Azithromycin 250mg", price: 129.99, batch: "AZI003", expiry: "2025-03-10", quantity: 80 },
      { id: "4", name: "Vitamin C 500mg", price: 79.99, batch: "VTC004", expiry: "2024-09-05", quantity: 150 },
      { id: "5", name: "Ibuprofen 400mg", price: 59.99, batch: "IBU005", expiry: "2025-01-30", quantity: 120 },
    ];
    setStockItems(mockStock);
  }, []);
  
  // Calculate totals whenever medicines change
  useEffect(() => {
    const subtotal = medicines.reduce((sum, medicine) => sum + (medicine.price * medicine.quantity), 0);
    setTotalAmount(subtotal);
    setFinalAmount(subtotal - discount);
  }, [medicines, discount]);
  
  // Handle customer form changes
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails({
      ...customerDetails,
      [name]: value
    });
  };
  
  // Handle medicine search and autocomplete
  const handleMedicineSearch = (e) => {
    const searchValue = e.target.value;
    setSelectedMedicine({
      ...selectedMedicine,
      name: searchValue
    });
    
    if (searchValue.trim().length > 0) {
      const filtered = stockItems.filter(item => 
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredStock(filtered);
      setShowAutocomplete(true);
    } else {
      setFilteredStock([]);
      setShowAutocomplete(false);
    }
  };
  
  // Select medicine from autocomplete
  const handleSelectMedicine = (item) => {
    setSelectedMedicine({
      name: item.name,
      price: item.price,
      batch: item.batch,
      expiry: item.expiry,
      quantity: 1,
      stock: item.quantity,
      id: item.id
    });
    setShowAutocomplete(false);
  };
  
  // Handle medicine quantity change
  const handleQuantityChange = (e) => {
    const qty = parseInt(e.target.value) || 1;
    setSelectedMedicine({
      ...selectedMedicine,
      quantity: qty
    });
  };
  
  // Add medicine to list
  const addMedicine = () => {
    if (!selectedMedicine.name || selectedMedicine.quantity <= 0) {
      alert("Please select a medicine and provide a valid quantity");
      return;
    }
    
    // Check if quantity is available in stock
    if (selectedMedicine.quantity > selectedMedicine.stock) {
      alert(`Only ${selectedMedicine.stock} units available in stock!`);
      return;
    }
    
    // Add to medicines list
    setMedicines([
      ...medicines, 
      { 
        ...selectedMedicine,
        total: selectedMedicine.price * selectedMedicine.quantity
      }
    ]);
    
    // Reset selection
    setSelectedMedicine({
      name: "",
      quantity: 1,
      price: 0,
      batch: "",
      expiry: ""
    });
  };
  
  // Remove medicine from list
  const removeMedicine = (index) => {
    const updatedMedicines = [...medicines];
    updatedMedicines.splice(index, 1);
    setMedicines(updatedMedicines);
  };
  
  // Handle discount change
  const handleDiscountChange = (e) => {
    const discountValue = parseFloat(e.target.value) || 0;
    setDiscount(discountValue);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (medicines.length === 0) {
      alert("Please add at least one medicine to the bill");
      return;
    }
    
    // Create the final sale object
    const saleData = {
      customer: customerDetails,
      medicines: medicines,
      totalAmount: totalAmount,
      discount: discount,
      finalAmount: finalAmount,
      date: new Date().toISOString()
    };
    
    // Save to database (would be replaced with actual API call)
    console.log("Sale data to be saved:", saleData);
    
    alert("Sale recorded successfully!");
    
    // Reset the form
    setCustomerDetails({
      name: "",
      phone: "",
      email: "",
      address: ""
    });
    setMedicines([]);
    setDiscount(0);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-navy-700 dark:text-white mb-6">
        New Sale
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Details */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">Customer Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Customer Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Phone Number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleCustomerChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Email Address (Optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={customerDetails.address}
                  onChange={handleCustomerChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Customer Address (Optional)"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Medicine Addition and Bill */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">Add Medicines</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Medicine Name with Autocomplete */}
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Medicine Name
                </label>
                <input
                  type="text"
                  value={selectedMedicine.name}
                  onChange={handleMedicineSearch}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                  placeholder="Search medicine..."
                />
                
                {/* Autocomplete dropdown */}
                {showAutocomplete && filteredStock.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-navy-700 mt-1 border border-gray-200 dark:border-navy-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredStock.map((item) => (
                      <div
                        key={item.id}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-navy-600 cursor-pointer"
                        onClick={() => handleSelectMedicine(item)}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.price)} | Stock: {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Quantity Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={selectedMedicine.quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                />
              </div>
            </div>
            
            {/* Medicine Details and Add Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
              <div className="flex flex-wrap gap-4 mb-2 md:mb-0">
                {selectedMedicine.price > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Price:</span>
                    <span className="ml-1 font-medium text-navy-700 dark:text-white">
                      {formatCurrency(selectedMedicine.price)}
                    </span>
                  </div>
                )}
                
                {selectedMedicine.batch && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Batch:</span>
                    <span className="ml-1 font-medium text-navy-700 dark:text-white">
                      {selectedMedicine.batch}
                    </span>
                  </div>
                )}
                
                {selectedMedicine.expiry && (
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Expiry:</span>
                    <span className="ml-1 font-medium text-navy-700 dark:text-white">
                      {new Date(selectedMedicine.expiry).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MdAdd className="text-xl" />
                Add Medicine
              </button>
            </div>
            
            {/* Selected Medicines Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-navy-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
                  {medicines.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                        No medicines added yet
                      </td>
                    </tr>
                  ) : (
                    medicines.map((medicine, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-navy-700 dark:text-white">
                            {medicine.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Exp: {new Date(medicine.expiry).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {medicine.batch}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {formatCurrency(medicine.price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {medicine.quantity}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatCurrency(medicine.total)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => removeMedicine(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <MdDelete className="text-xl" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Bill Summary */}
          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">Bill Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-navy-700">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="font-medium text-navy-700 dark:text-white">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">Discount:</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={handleDiscountChange}
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-right"
                  />
                </div>
                <span className="font-medium text-navy-700 dark:text-white">
                  {formatCurrency(discount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-navy-700 text-lg font-bold">
                <span className="text-gray-800 dark:text-white">Total Amount:</span>
                <span className="text-navy-700 dark:text-white">
                  {formatCurrency(finalAmount)}
                </span>
              </div>
              
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  className="flex items-center gap-2 bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <MdPrint className="text-xl" />
                  Print
                </button>
                
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <MdSave className="text-xl" />
                  Save Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalePage;