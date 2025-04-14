// Import the product page component
import ProductPage from "pages/AdminPage/views/admin/productPage";

// Inside your routes array, add a route for the product page
const routes = [
  {
    name: "Product Details",
    layout: "/admin",
    path: "product/:id",
    component: <ProductPage />,
    secondary: true, // Makes it not show in the sidebar
  },
];

export default routes;