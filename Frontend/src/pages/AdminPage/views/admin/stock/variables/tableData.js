// Sample data for stock table
export const stockTableData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    manufacturer: "Cipla Ltd.",
    category: "tablet",
    price: 25.50,
    quantity: 120,
    expiryDate: "2025-06-15"
  },
  {
    id: 2,
    name: "Amoxicillin 250mg",
    manufacturer: "Sun Pharma",
    category: "tablet",
    price: 75.00,
    quantity: 85,
    expiryDate: "2024-11-30"
  },
  {
    id: 3,
    name: "Cough Syrup",
    manufacturer: "GSK",
    category: "syrup",
    price: 110.25,
    quantity: 32,
    expiryDate: "2024-09-20"
  },
  {
    id: 4,
    name: "Vitamin C 500mg",
    manufacturer: "Himalaya",
    category: "tablet",
    price: 120.00,
    quantity: 200,
    expiryDate: "2025-12-01"
  },
  {
    id: 5,
    name: "Azithromycin 500mg",
    manufacturer: "Alkem",
    category: "tablet",
    price: 175.50,
    quantity: 45,
    expiryDate: "2025-03-15"
  },
  {
    id: 6,
    name: "Ranitidine 150mg",
    manufacturer: "Zydus",
    category: "tablet",
    price: 48.75,
    quantity: 75,
    expiryDate: "2024-04-22"
  },
  {
    id: 7,
    name: "Multivitamin Syrup",
    manufacturer: "Pfizer",
    category: "syrup",
    price: 156.00,
    quantity: 28,
    expiryDate: "2024-05-10"
  },
  {
    id: 8,
    name: "Ibuprofen 400mg",
    manufacturer: "Abbott",
    category: "tablet",
    price: 35.25,
    quantity: 140,
    expiryDate: "2025-08-18"
  },
  {
    id: 9,
    name: "Protein Powder",
    manufacturer: "HealthVit",
    category: "powder",
    price: 450.00,
    quantity: 15,
    expiryDate: "2025-01-30"
  },
  {
    id: 10,
    name: "Zinc Supplement",
    manufacturer: "Nestle",
    category: "tablet",
    price: 78.50,
    quantity: 90,
    expiryDate: "2025-07-12"
  },
  {
    id: 11,
    name: "Cetirizine 10mg",
    manufacturer: "Lupin",
    category: "tablet",
    price: 42.30,
    quantity: 110,
    expiryDate: "2024-12-01"
  },
  {
    id: 12,
    name: "Antacid Suspension",
    manufacturer: "Torrent",
    category: "syrup",
    price: 89.00,
    quantity: 38,
    expiryDate: "2024-08-15"
  },
  {
    id: 13,
    name: "Antiseptic Cream",
    manufacturer: "Hindustan Unilever",
    category: "cream",
    price: 60.75,
    quantity: 45,
    expiryDate: "2025-02-28"
  },
  {
    id: 14,
    name: "Diclofenac Gel",
    manufacturer: "Novartis",
    category: "cream",
    price: 85.25,
    quantity: 30,
    expiryDate: "2024-10-05"
  },
  {
    id: 15,
    name: "Calcium Tablets",
    manufacturer: "Cadila",
    category: "tablet",
    price: 145.00,
    quantity: 80,
    expiryDate: "2025-04-20"
  },
  {
    id: 16,
    name: "Iron Supplement",
    manufacturer: "Emcure",
    category: "tablet",
    price: 95.50,
    quantity: 65,
    expiryDate: "2025-05-10"
  },
  {
    id: 17,
    name: "Insulin Injection",
    manufacturer: "Biocon",
    category: "injection",
    price: 450.00,
    quantity: 8,
    expiryDate: "2024-06-15"
  },
  {
    id: 18,
    name: "B-Complex Syrup",
    manufacturer: "Abbott",
    category: "syrup",
    price: 126.75,
    quantity: 22,
    expiryDate: "2024-07-30"
  },
  {
    id: 19,
    name: "Aspirin 75mg",
    manufacturer: "GSK",
    category: "tablet",
    price: 28.30,
    quantity: 150,
    expiryDate: "2025-09-22"
  },
  {
    id: 20,
    name: "Rehydration Salts",
    manufacturer: "Cipla Ltd.",
    category: "powder",
    price: 32.00,
    quantity: 95,
    expiryDate: "2025-10-15"
  }
];

// Products to purchase alerts
export const purchaseAlerts = [
  {
    name: "Insulin Injection",
    currentStock: 8,
    minStock: 15,
    purchaseQty: 20,
    lastOrdered: "3 months ago"
  },
  {
    name: "Protein Powder",
    currentStock: 15,
    minStock: 20,
    purchaseQty: 10,
    lastOrdered: "2 months ago"
  },
  {
    name: "B-Complex Syrup",
    currentStock: 22,
    minStock: 25,
    purchaseQty: 15,
    lastOrdered: "45 days ago"
  },
  {
    name: "Cough Syrup",
    currentStock: 32,
    minStock: 30,
    purchaseQty: 10,
    lastOrdered: "1 month ago"
  },
  {
    name: "Antacid Suspension",
    currentStock: 38,
    minStock: 40,
    purchaseQty: 15,
    lastOrdered: "2 months ago"
  }
];

// Expiring soon alerts
export const expiryAlerts = [
  {
    name: "Ranitidine 150mg",
    manufacturer: "Zydus",
    quantity: 75,
    daysToExpiry: 25,
    expiryDate: "2024-04-22"
  },
  {
    name: "Multivitamin Syrup",
    manufacturer: "Pfizer",
    quantity: 28,
    daysToExpiry: 43,
    expiryDate: "2024-05-10"
  },
  {
    name: "Insulin Injection",
    manufacturer: "Biocon",
    quantity: 8,
    daysToExpiry: 79,
    expiryDate: "2024-06-15"
  },
  {
    name: "B-Complex Syrup",
    manufacturer: "Abbott",
    quantity: 22,
    daysToExpiry: 124,
    expiryDate: "2024-07-30"
  },
  {
    name: "Antacid Suspension",
    manufacturer: "Torrent",
    quantity: 38,
    daysToExpiry: 140,
    expiryDate: "2024-08-15"
  }
];
