'use client';

import React, { useState } from 'react';
import Image from 'next/image';

// Add productName to the component props
interface TryOnWidgetProps {
  productImage: string;
  initialTryOnImage: string | null; // Add this line
  productName: string; // Add this line
}

const TryOnWidget: React.FC<TryOnWidgetProps> = ({ 
  productImage, 
  initialTryOnImage, // Change this line
  productName
}) => {
  const [tryOnImage, setTryOnImage] = useState<string | null>(initialTryOnImage);
  const [isLoading, setIsLoading] = useState(false);

  const handleTryOn = async () => {
    setIsLoading(true);
    // For now, we'll just simulate a delay and use the original image
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTryOnImage(productImage); // Now productImage is defined
    setIsLoading(false);
  };

  return (
    <div className="try-on-widget bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{productName}</h2>
      <div className="mb-4">
        <Image
          src={tryOnImage || productImage}
          alt={productName}
          width={300}
          height={300}
        />
      </div>
      <button
        onClick={handleTryOn}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isLoading ? 'Processing...' : 'Try On Virtually'}
      </button>
    </div>
  );
};

export default TryOnWidget;
