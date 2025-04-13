import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Loader, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillScanner({ externalOpen, onClose, hideButton }) {
    // State management
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [billData, setBillData] = useState(null);
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

    // Handle file upload
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result);
                processImage(reader.result, file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    // Process the uploaded image
    const processImage = async (imageData, fileType) => {
        setIsProcessing(true);
        
        try {
            // Convert base64 image to a Blob
            const base64Response = await fetch(imageData);
            const blob = await base64Response.blob();
            
            // Create form data for API request
            const formData = new FormData();
            formData.append('image', blob, 'bill.jpg');
            
            // Add file type if provided
            if (fileType) {
                formData.append('file_type', fileType);
            }

            // Make API call to backend
            const response = await fetch('http://localhost:5000/scan_bill', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to process bill: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Format the bill data from API response
            const billData = {
                vendor: data.vendor_name || "Unknown Vendor",
                billNumber: data.bill_number || "N/A",
                date: data.date || new Date().toISOString().split('T')[0],
                items: data.items || [],
                taxDetails: {
                    subTotal: data.subtotal || "₹0.00",
                    gst: data.tax || "₹0.00",
                    total: data.total_amount || "₹0.00"
                }
            };
            
            setBillData(billData);
            setResult(`Successfully processed bill from ${billData.vendor}`);
        } catch (error) {
            console.error('Error processing bill:', error);
            
            // Fallback to mock data in case of error for demo purposes
            const mockBillData = {
                vendor: "Medical Supplies Co.",
                billNumber: "INV-2025-1234",
                date: "2025-04-10",
                totalAmount: "₹15,450.00",
                items: [
                    { name: "Surgical Mask (Box of 50)", quantity: 10, price: "₹250.00", total: "₹2,500.00" },
                    { name: "Disposable Gloves (Box of 100)", quantity: 5, price: "₹650.00", total: "₹3,250.00" },
                    { name: "Hand Sanitizer (500ml)", quantity: 15, price: "₹180.00", total: "₹2,700.00" },
                    { name: "Digital Thermometer", quantity: 5, price: "₹1,200.00", total: "₹6,000.00" },
                    { name: "Antiseptic Solution (1L)", quantity: 5, price: "₹200.00", total: "₹1,000.00" }
                ],
                taxDetails: {
                    subTotal: "₹14,450.00",
                    gst: "₹1,000.00",
                    total: "₹15,450.00"
                }
            };
            
            setBillData(mockBillData);
            setResult(`Error: ${error.message}. Using sample data for preview.`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Add function to save bill data
    const saveBillData = async () => {
        try {
            // API call to save bill data
            const response = await fetch('http://localhost:5000/save_bill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    bill_data: billData,
                    image: image
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to save bill: ${response.statusText}`);
            }

            const data = await response.json();
            
            alert(data.message || "Bill saved successfully!");
            resetPopup();
        } catch (error) {
            console.error('Error saving bill:', error);
            alert(`Error: ${error.message || 'Failed to save bill'}`);
        }
    };

    // Handle camera access
    const handleCameraCapture = async () => {
        // For mobile devices, use the capture attribute
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            fileInputRef.current.setAttribute('capture', 'environment');
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
            processImage(imageData, 'image/png');
            
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

    // Reset the popup state
    const resetPopup = () => {
        setImage(null);
        setResult(null);
        setBillData(null);
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
            {/* Button to open the scanner (only shown when not in popup mode) */}
            {!hideButton && (
                <button 
                    onClick={() => setIsInternalOpen(true)}
                    className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    Scan Bill
                </button>
            )}
            
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
                                    {isCameraOpen ? "Take Photo" : "Bill Scanner"}
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
                                    {/* Camera view for desktop */}
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
                                                Position the bill in the frame and take a photo
                                            </p>
                                        </motion.div>
                                    )}
                                    
                                    {!isCameraOpen && !image && !isProcessing && !result && (
                                        <motion.div 
                                            className="flex flex-col items-center gap-6"
                                            key="upload"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <p className="text-center text-gray-600 dark:text-gray-300">
                                                Upload a bill image or PDF to scan and process
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
                                                accept="image/*,.pdf" 
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
                                        </motion.div>
                                    )}

                                    {!isCameraOpen && image && !isProcessing && !result && (
                                        <motion.div 
                                            className="flex flex-col items-center gap-4"
                                            key="preview"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="relative w-full max-w-sm bg-gray-100 dark:bg-navy-700 rounded-lg p-2">
                                                <img src={image} alt="Uploaded bill" className="max-h-64 object-contain rounded-md mx-auto" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg pointer-events-none"/>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">Processing your bill...</p>
                                        </motion.div>
                                    )}

                                    {!isCameraOpen && isProcessing && (
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
                                                Analyzing your bill...
                                            </motion.p>
                                        </motion.div>
                                    )}

                                    {!isCameraOpen && result && billData && (
                                        <motion.div 
                                            className="flex flex-col items-center gap-4"
                                            key="result"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <motion.div 
                                                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 w-full"
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", damping: 15 }}
                                            >
                                                <div className="flex items-center mb-2">
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ delay: 0.2, type: "spring", damping: 10 }}
                                                    >
                                                        <CheckCircle className="text-green-600 dark:text-green-400 mr-2" size={20} />
                                                    </motion.div>
                                                    <h3 className="font-semibold text-green-700 dark:text-green-400">Bill Scanned Successfully</h3>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{result}</p>
                                            </motion.div>
                                            
                                            {/* Bill Information */}
                                            <div className="w-full bg-white dark:bg-navy-700 rounded-lg p-4 shadow-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h3 className="font-bold text-lg">{billData.vendor}</h3>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">{billData.date}</span>
                                                </div>
                                                
                                                <div className="text-sm mb-4">
                                                    <p>Bill #: <span className="font-semibold">{billData.billNumber}</span></p>
                                                </div>
                                                
                                                <div className="mb-4">
                                                    <h4 className="font-semibold mb-2 text-sm uppercase text-gray-600 dark:text-gray-400">Items</h4>
                                                    <div className="max-h-40 overflow-y-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b border-gray-200 dark:border-navy-600">
                                                                    <th className="text-left py-2">Item</th>
                                                                    <th className="text-center py-2">Qty</th>
                                                                    <th className="text-right py-2">Price</th>
                                                                    <th className="text-right py-2">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {billData.items.map((item, i) => (
                                                                    <tr key={i} className="border-b border-gray-100 dark:border-navy-700/50">
                                                                        <td className="py-2">{item.name}</td>
                                                                        <td className="py-2 text-center">{item.quantity}</td>
                                                                        <td className="py-2 text-right">{item.price}</td>
                                                                        <td className="py-2 text-right">{item.total}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-navy-600">
                                                    <div className="text-sm">
                                                        <p>Subtotal: <span className="font-semibold">{billData.taxDetails.subTotal}</span></p>
                                                        <p>Tax: <span className="font-semibold">{billData.taxDetails.gst}</span></p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold">{billData.taxDetails.total}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex w-full justify-between mt-2">
                                                <motion.button 
                                                    onClick={resetPopup}
                                                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-500 text-white dark:text-gray-900 dark:hover:text-navy-900 px-4 py-2 rounded-full shadow-md shadow-gray-900/30 dark:shadow-green-600/20"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Scan Another
                                                </motion.button>
                                                
                                                <motion.button 
                                                    onClick={saveBillData}
                                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-md shadow-green-600/30"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <CheckCircle size={18} />
                                                    Save Bill
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