import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Loader, CheckCircle, RefreshCw, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductUpload({ externalOpen, onClose, hideButton }) {
    // State management
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState('search'); // search > upload > form
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [productData, setProductData] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const fileInputRef = useRef(null);
    
    // Camera state management
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    
    // Determine if popup should be open based on internal or external state
    const isPopupOpen = externalOpen !== undefined ? externalOpen : isInternalOpen;

    // Handle search for medicine
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            // Make API call to search endpoint
            const response = await fetch(`http://localhost:5000/medicine/search?term=${encodeURIComponent(searchQuery)}&auto_enrich=true`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to search products: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform the API response to match our component's expected format
            const results = data.map(item => ({
                id: item._id,
                name: item.product_name,
                manufacturer: item.product_manufactured,
                category: item.sub_category || 'General'
            }));
            
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
            // Show empty results on error
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Select a product from search results
    const selectProduct = (product) => {
        setSelectedProduct(product);
        setCurrentStep('upload');
    };

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                processImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Process the uploaded image
    const processImage = async (imageData) => {
        setIsProcessing(true);
        
        try {
            // Convert base64 image to a Blob
            const base64Response = await fetch(imageData);
            const blob = await base64Response.blob();
            
            // Create form data for API request
            const formData = new FormData();
            formData.append('image', blob, 'product.jpg');
            formData.append('medicine_id', selectedProduct.id);

            // Make API call to backend
            const response = await fetch('http://localhost:5000/process_image', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to process product image: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Transform the API response into our product data format
            const productData = {
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                manufacturer: selectedProduct.manufacturer,
                category: selectedProduct.category,
                batchNumber: data.extracted_info?.batch_no || 'N/A',
                expiryDate: data.extracted_info?.exp_date || '',
                mfgDate: data.extracted_info?.mfg_date || '',
                price: data.extracted_info?.price || '₹0.00',
                quantity: data.extracted_info?.quantity || 1,
                composition: data.extracted_info?.composition || selectedProduct.composition || '',
                description: data.extracted_info?.description || 'No description available',
                storage: data.extracted_info?.storage || 'Store in a cool, dry place',
                imageUrl: imageData
            };
            
            setProductData(productData);
            setCurrentStep('form');
        } catch (error) {
            console.error('Error processing product image:', error);
            alert(`Error: ${error.message || 'Failed to process product image'}`);
            // Fallback to mock data in case of error
            const mockData = {
                productId: selectedProduct.id,
                productName: selectedProduct.name,
                manufacturer: selectedProduct.manufacturer,
                category: selectedProduct.category,
                batchNumber: 'BAT12345',
                expiryDate: '2025-12-31',
                mfgDate: '2023-01-15',
                price: '₹120.00',
                quantity: 10,
                description: 'For relief of mild to moderate pain and fever',
                composition: 'Paracetamol 500mg',
                storage: 'Store below 30°C',
                imageUrl: imageData
            };
            
            setProductData(mockData);
            setCurrentStep('form');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle camera access
    const handleCameraCapture = async () => {
        // For mobile devices, use the capture attribute
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            fileInputRef.current.setAttribute('capture', 'user');
            fileInputRef.current.click();
            return;
        }
        
        // Reset camera states
        setIsCameraLoading(true);
        setCameraError(null);
        setIsCameraOpen(true);
        
        // For desktop, use getUserMedia API
        try {
            console.log("Attempting to access camera...");
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true
            });
            
            console.log("Camera access granted, setting up video element");
            setStream(mediaStream);
            
            // Set up video element when stream is available
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    console.log("Video metadata loaded, playing video");
                    videoRef.current.play()
                        .then(() => {
                            console.log("Video playing successfully");
                            setIsCameraLoading(false);
                        })
                        .catch(err => {
                            console.error("Error playing video:", err);
                            setCameraError("Could not play video stream");
                            setIsCameraLoading(false);
                        });
                };
                
                // Add error handler
                videoRef.current.onerror = (err) => {
                    console.error("Video element error:", err);
                    setCameraError("Video element encountered an error");
                    setIsCameraLoading(false);
                };
            }
        } catch (error) {
            console.error("Error accessing camera:", error);
            setCameraError(error.message || "Could not access the camera");
            setIsCameraLoading(false);
        }
    };

    // Retry camera access
    const retryCameraAccess = () => {
        stopCameraStream();
        setTimeout(() => {
            handleCameraCapture();
        }, 500);
    };

    // Take photo from camera stream
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error("Video or canvas reference not available");
            return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Ensure video is playing and has dimensions
        if (video.paused || video.videoWidth === 0) {
            console.log("Video not ready yet");
            return;
        }
        
        try {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth || video.clientWidth;
            canvas.height = video.videoHeight || video.clientHeight;
            
            console.log("Capturing from video:", canvas.width, "x", canvas.height);
            
            // Draw video frame to canvas
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to data URL
            const imageData = canvas.toDataURL('image/png');
            
            if (imageData === 'data:,') {
                console.error("Failed to capture image - empty data URL");
                alert("Could not capture image. Please try again.");
                return;
            }
            
            console.log("Image captured successfully");
            setImage(imageData);
            processImage(imageData);
            
            // Stop camera stream and reset state
            stopCameraStream();
        } catch (error) {
            console.error("Error capturing photo:", error);
            alert("Failed to capture photo. Please try again.");
        }
    };

    // Stop camera stream
    const stopCameraStream = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setIsCameraOpen(false);
        }
    };

    // Handle regular upload
    const handleUpload = () => {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.click();
    };

    // Update product data form
    const handleFormChange = (key, value) => {
        setProductData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Save product data
    const handleSaveProduct = async () => {
        try {
            // API call to save product data
            const response = await fetch('http://localhost:5000/save_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(productData),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to save product: ${response.statusText}`);
            }

            const data = await response.json();
            
            alert(data.message || "Product saved successfully!");
            resetPopup();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error: ${error.message || 'Failed to save product'}`);
        }
    };

    // Go back to previous step
    const goBack = () => {
        if (currentStep === 'form') {
            setCurrentStep('upload');
        } else if (currentStep === 'upload') {
            setCurrentStep('search');
            setSelectedProduct(null);
            setImage(null);
        }
    };

    // Reset the popup state
    const resetPopup = () => {
        setCurrentStep('search');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedProduct(null);
        setImage(null);
        setProductData(null);
        setIsProcessing(false);
        stopCameraStream();
    };

    // Close the popup
    const closePopup = () => {
        if (onClose) {
            onClose();
        } else {
            setIsInternalOpen(false);
        }
        resetPopup();
    };

    // Cleanup camera stream when component unmounts or popup closes
    useEffect(() => {
        return () => {
            stopCameraStream();
        };
    }, []);

    // Cleanup camera stream when popup closes
    useEffect(() => {
        if (!isPopupOpen) {
            stopCameraStream();
        }
    }, [isPopupOpen]);

    return (
        <div className="p-4">
            {/* Popup overlay with animation */}
            <AnimatePresence>
                {isPopupOpen && (
                    <motion.div 
                        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closePopup();
                        }}
                    >
                        <motion.div 
                            className="bg-white dark:bg-navy-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-200 dark:border-navy-700"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                        >
                            {/* Popup header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-navy-700">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                    {isCameraOpen 
                                        ? "Take Photo" 
                                        : currentStep === 'search' 
                                            ? "Search Product" 
                                            : currentStep === 'upload' 
                                                ? `Upload Image for ${selectedProduct?.name}`
                                                : "Edit Product Details"
                                    }
                                </h2>
                                <motion.button 
                                    onClick={closePopup}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none"
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            {/* Popup body */}
                            <div className="p-6 dark:text-white">
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Search Product */}
                                    {currentStep === 'search' && (
                                        <motion.div 
                                            key="search"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col gap-4"
                                        >
                                            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                                                Search for the product you want to upload
                                            </p>
                                            
                                            <div className="flex gap-2 w-full">
                                                <input
                                                    type="text"
                                                    placeholder="Enter product name..."
                                                    className="flex-1 form-input px-4 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700 dark:text-white"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                />
                                                <motion.button
                                                    onClick={handleSearch}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={isSearching}
                                                >
                                                    {isSearching ? (
                                                        <Loader size={20} className="animate-spin" />
                                                    ) : (
                                                        <Search size={20} />
                                                    )}
                                                </motion.button>
                                            </div>
                                            
                                            {/* Search Results */}
                                            <div className="mt-4 max-h-64 overflow-y-auto">
                                                {isSearching ? (
                                                    <div className="flex justify-center py-8">
                                                        <motion.div 
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Loader size={30} className="text-blue-500" />
                                                        </motion.div>
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {searchResults.map((product) => (
                                                            <motion.div
                                                                key={product.id}
                                                                className="border border-gray-200 dark:border-navy-600 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-700"
                                                                onClick={() => selectProduct(product)}
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                            >
                                                                <h3 className="font-medium">{product.name}</h3>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.manufacturer} | {product.category}</p>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : searchQuery && !isSearching ? (
                                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                        No products found. Try a different search term.
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Upload Image */}
                                    {currentStep === 'upload' && !isCameraOpen && !image && !isProcessing && (
                                        <motion.div 
                                            key="upload"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center gap-6"
                                        >
                                            <div className="w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <h3 className="font-medium mb-1">{selectedProduct?.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedProduct?.manufacturer} | {selectedProduct?.category}</p>
                                            </div>
                                            
                                            <p className="text-center text-gray-600 dark:text-gray-300">
                                                Upload or take a photo of the product
                                            </p>
                                            
                                            <div className="flex gap-4">
                                                <motion.button 
                                                    onClick={handleCameraCapture}
                                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-500 text-white dark:text-gray-900 dark:hover:text-navy-900 px-4 py-2 rounded-full shadow-md shadow-gray-900/30 dark:shadow-green-600/20"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Camera size={18} />
                                                    Camera
                                                </motion.button>
                                                <motion.button 
                                                    onClick={handleUpload}
                                                    className="flex items-center gap-2 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-md shadow-gray-200/50 dark:shadow-brand-400/20 border border-gray-200 dark:border-opacity-0"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Upload size={18} />
                                                    Upload
                                                </motion.button>
                                            </div>
                                            
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                            
                                            <motion.div 
                                                className="w-full max-w-xs h-1 bg-gradient-to-r from-brand-300 via-purple-400 to-brand-500 rounded-full mt-4 opacity-70 dark:opacity-50"
                                                animate={{ 
                                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                                }}
                                                transition={{ 
                                                    duration: 5, 
                                                    ease: "linear", 
                                                    repeat: Infinity 
                                                }}
                                                style={{ backgroundSize: "200% 200%" }}
                                            />
                                            
                                            <motion.button
                                                onClick={goBack}
                                                className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                ← Back to search
                                            </motion.button>
                                        </motion.div>
                                    )}

                                    {/* Camera View */}
                                    {isCameraOpen && (
                                        <motion.div 
                                            className="flex flex-col items-center gap-4"
                                            key="camera"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="relative w-full bg-black rounded-lg overflow-hidden">
                                                {isCameraLoading && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70">
                                                        <motion.div 
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Loader size={40} className="text-white" />
                                                        </motion.div>
                                                        <p className="text-white ml-3">Accessing camera...</p>
                                                    </div>
                                                )}
                                                
                                                {cameraError && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/80 p-4 text-center">
                                                        <div className="text-red-500 mb-3">
                                                            <X size={40} />
                                                        </div>
                                                        <p className="text-white mb-4">{cameraError}</p>
                                                        <button 
                                                            onClick={retryCameraAccess}
                                                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
                                                        >
                                                            <RefreshCw size={16} />
                                                            Retry
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                <video 
                                                    ref={videoRef}
                                                    autoPlay
                                                    playsInline
                                                    muted
                                                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                                                />
                                                
                                                <canvas ref={canvasRef} className="hidden" />
                                                
                                                {/* Camera UI overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                                                    {/* Camera frame */}
                                                    <div className="absolute inset-0 border-2 border-white/30 m-4 rounded-lg"></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4 mt-2 w-full justify-center">
                                                <motion.button 
                                                    onClick={stopCameraStream}
                                                    className="flex items-center gap-2 bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-full shadow-md shadow-gray-200/50 dark:shadow-brand-400/20 border border-gray-200 dark:border-opacity-0"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Cancel
                                                </motion.button>
                                                <motion.button 
                                                    onClick={capturePhoto}
                                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-500 text-white dark:text-gray-900 dark:hover:text-navy-900 px-4 py-2 rounded-full shadow-md shadow-gray-900/30 dark:shadow-green-600/20"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    disabled={isCameraLoading || cameraError}
                                                >
                                                    Capture Photo
                                                </motion.button>
                                            </div>
                                            
                                            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                Position the product in the frame and take a photo
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Processing */}
                                    {currentStep === 'upload' && isProcessing && (
                                        <motion.div 
                                            className="flex flex-col items-center justify-center py-12"
                                            key="processing"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <motion.div 
                                                animate={{ rotate: 360 }}
                                                transition={{ 
                                                    duration: 2, 
                                                    repeat: Infinity, 
                                                    ease: "linear" 
                                                }}
                                                className="mb-4"
                                            >
                                                <Loader size={48} className="text-brand-500 dark:text-brand-400" />
                                            </motion.div>
                                            <motion.p 
                                                className="text-gray-600 dark:text-gray-300"
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ 
                                                    duration: 1.5, 
                                                    repeat: Infinity,
                                                }}
                                            >
                                                Processing product image...
                                            </motion.p>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Edit Form */}
                                    {currentStep === 'form' && productData && (
                                        <motion.div 
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="flex gap-4 mb-2">
                                                <div className="w-1/3 bg-gray-100 dark:bg-navy-700 rounded-lg p-2 flex items-center justify-center">
                                                    <img 
                                                        src={productData.imageUrl} 
                                                        alt={productData.productName} 
                                                        className="max-h-24 object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-lg">{productData.productName}</h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{productData.manufacturer}</p>
                                                    <p className="mt-2 text-blue-500 font-medium">{productData.price}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="max-h-72 overflow-y-auto pr-2">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Product Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.productName}
                                                            onChange={(e) => handleFormChange('productName', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Manufacturer
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.manufacturer}
                                                            onChange={(e) => handleFormChange('manufacturer', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Category
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.category}
                                                            onChange={(e) => handleFormChange('category', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Batch Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.batchNumber}
                                                            onChange={(e) => handleFormChange('batchNumber', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Expiry Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={productData.expiryDate}
                                                            onChange={(e) => handleFormChange('expiryDate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Manufacturing Date
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={productData.mfgDate}
                                                            onChange={(e) => handleFormChange('mfgDate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Price
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.price}
                                                            onChange={(e) => handleFormChange('price', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Quantity
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={productData.quantity}
                                                            onChange={(e) => handleFormChange('quantity', parseInt(e.target.value))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Composition
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.composition}
                                                            onChange={(e) => handleFormChange('composition', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                    
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Description
                                                        </label>
                                                        <textarea
                                                            value={productData.description}
                                                            onChange={(e) => handleFormChange('description', e.target.value)}
                                                            rows="3"
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        ></textarea>
                                                    </div>
                                                    
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Storage Instructions
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={productData.storage}
                                                            onChange={(e) => handleFormChange('storage', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-navy-700"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-navy-700">
                                                <motion.button
                                                    onClick={goBack}
                                                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-md text-gray-700 dark:text-gray-300"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    Back
                                                </motion.button>
                                                <motion.button
                                                    onClick={handleSaveProduct}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                >
                                                    <CheckCircle size={18} />
                                                    Save Product
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}