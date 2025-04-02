import React, { useState } from "react";

const ProductScanner = () => {
  const [serverUrl] = useState('http://localhost:5000');

  return (
    <div className="w-full h-[calc(100vh-4rem)]">  {/* Adjust height to account for navbar */}
      <iframe
        src={serverUrl}
        className="w-full h-full border-none mt-16" /* Add margin-top to push below navbar */
        title="Server Frontend"
        allow="cross-origin-isolated"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default ProductScanner;
