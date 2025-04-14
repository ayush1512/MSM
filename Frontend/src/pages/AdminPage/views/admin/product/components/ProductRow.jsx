import React from "react";
import { useNavigate } from "react-router-dom";

const ProductRow = ({ product }) => {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/admin/product/${product.id}`);
  };

  return (
    <tr onClick={handleRowClick} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700">
      {/* Row content */}
    </tr>
  );
};

export default ProductRow;