import productImg from "assets/img/samples/product-sample.jpg";

// This function returns mock data for a single product
// In a real app, this would be fetched from an API
export const getSingleProductData = (id) => {
  // In real implementation, use the ID to fetch the specific product
  // For now, return a mock product with rich data
  return {
    id: id || "PRD001",
    name: "Azithromycin 500mg",
    genericName: "Azithromycin",
    categoryName: "Antibiotics",
    dosageForm: "Tablets",
    strength: "500mg",
    packSize: "6 Tablets",
    price: "299.99",
    stock: 45,
    image: productImg,
    
    // Manufacturer details
    manufacturer: {
      name: "MediPharma Ltd.",
      location: "Mumbai, India",
      logo: null, // URL to manufacturer logo
      website: "https://medipharma.example.com",
      contact: "+91 1234567890",
      registrationNo: "MFG-12345-IN"
    },
    
    // Supply chain information
    suppliers: [
      {
        name: "National Pharma Distributors",
        price: "275.50",
        minOrder: "20 packs",
        lastSupplied: "15 days ago",
        contact: "+91 9876543210",
        leadTime: "3-5 days"
      },
      {
        name: "MediMart Wholesalers",
        price: "280.00",
        minOrder: "10 packs",
        lastSupplied: "1 month ago",
        contact: "+91 8765432109",
        leadTime: "2-3 days"
      }
    ],
    
    // Batch information
    batches: [
      {
        number: "AZ500-2023-06A",
        quantity: 25,
        manufactureDate: "2023-06-15",
        expiryDate: "2025-06-14",
        expired: false,
        expiringSoon: false
      },
      {
        number: "AZ500-2022-11B",
        quantity: 20,
        manufactureDate: "2022-11-23",
        expiryDate: "2024-11-22",
        expired: false,
        expiringSoon: true
      }
    ],
    
    // Product description and medical information
    description: {
      uses: "Azithromycin is used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria. This medication belongs to a class of drugs known as macrolide antibiotics. This drug will not work for viral infections (such as common cold, flu).",
      mechanism: "Azithromycin binds to the 50S subunit of the bacterial ribosome, inhibiting translation of mRNA, thereby preventing bacterial protein synthesis.",
      conditions: ["Respiratory Infections", "Skin Infections", "Ear Infections", "Sexually Transmitted Diseases"],
      precautions: "Before taking azithromycin, tell your doctor or pharmacist if you are allergic to it; or to other antibiotics (such as erythromycin, clarithromycin, telithromycin); or if you have any other allergies.",
      sideEffects: [
        "Diarrhea",
        "Nausea",
        "Abdominal pain",
        "Vomiting",
        "Headache"
      ],
      storage: "Store at room temperature away from moisture and heat. Keep the bottle tightly closed.",
      storageConditions: "Store below 30°C in a dry place"
    },
    
    // Performance metrics and statistics
    performance: {
      totalUnitsSold: 1245,
      targetUnits: 1500,
      returnRate: 1.8,
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      unitsSold: [105, 98, 112, 120, 135, 142, 130, 125, 115, 105, 98, 110],
      demandForecast: [110, 105, 115, 125, 140, 150, 145, 140, 130, 115, 105, 120],
      inventoryInflow: [50, 0, 60, 0, 75, 0, 80, 0, 65, 0, 55, 0],
      inventoryOutflow: [45, 48, 52, 55, 60, 62, 58, 55, 50, 45, 43, 50],
      bestMonth: "June",
      bestMonthUnits: 142,
      bestMonthRevenue: "₹42,600",
      similarProducts: [
        { name: "Azithral 500", sales: 1050 },
        { name: "Zithromax 500", sales: 920 },
        { name: "Aziwin 500", sales: 780 }
      ]
    },
    
    // Market insights
    market: {
      ranking: 3,
      totalProducts: 25,
      rankHistory: [5, 4, 4, 3, 3, 3, 2, 3],
      approvals: [
        { name: "CDSCO", status: "approved", date: "2020-06-15" },
        { name: "FDA", status: "approved", date: "2020-08-22" },
        { name: "WHO", status: "approved", date: "2020-07-30" },
        { name: "EMA", status: "pending", date: "2023-04-10" }
      ],
      countries: [
        "India", "USA", "UK", "Canada", "Australia", 
        "Germany", "France", "Japan", "Brazil", "South Africa"
      ],
      news: [
        {
          title: "New study shows Azithromycin effective against respiratory infections",
          date: "2023-08-15",
          url: "#"
        },
        {
          title: "MediPharma announces increased production of Azithromycin",
          date: "2023-07-22",
          url: "#"
        }
      ]
    },
    
    // AI-generated insights and recommendations
    ai: {
      restockAlert: {
        message: "Current stock will last approximately 28 days based on current sales velocity. Consider restocking soon.",
        severity: "moderate",
        recommendedQuantity: 50
      },
      pricingSuggestion: {
        message: "Competitor prices have increased by 8% on average. Consider a price adjustment for better margin.",
        action: "increase",
        percentage: "5",
        suggestedPrice: "314.99"
      },
      salesForecast: {
        projectedUnits: 138,
        changePercentage: "12",
        trend: "up"
      },
      similarProducts: [
        {
          name: "Clarithromycin 500mg",
          price: "340.50",
          reason: "Often prescribed for similar conditions"
        },
        {
          name: "Doxycycline 100mg",
          price: "195.75",
          reason: "Alternative antibiotic with good sales"
        },
        {
          name: "Levofloxacin 500mg",
          price: "275.25",
          reason: "Growing demand, complementary product"
        }
      ]
    }
  };
};

// For a product listing page, if needed later
export const getProductListData = () => {
  return [
    {
      id: "PRD001",
      name: "Azithromycin 500mg",
      manufacturer: "MediPharma Ltd.",
      category: "Antibiotics",
      price: "299.99",
      stock: 45
    },
    {
      id: "PRD002",
      name: "Paracetamol 500mg",
      manufacturer: "HealthCare Pharma",
      category: "Analgesics",
      price: "49.99",
      stock: 120
    },
    // Add more products as needed
  ];
};
