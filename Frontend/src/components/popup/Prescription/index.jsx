import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Loader, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import PrescriptionPreview from './PrescriptionPreview';

export default function Prescription({ externalOpen, onClose, hideButton, onPrescriptionProcessed }) {
    // State management
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
    
    // New state for camera handling
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    
    // Add camera loading state
    const [isCameraLoading, setIsCameraLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    
    // Add state for the preview
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [prescriptionPreviewData, setPrescriptionPreviewData] = useState(null);
    
    // Determine if popup should be open based on internal or external state
    const isPopupOpen = externalOpen !== undefined ? externalOpen : isInternalOpen;

    const navigate = useNavigate(); // Add this

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
            formData.append('image', blob, 'prescription.jpg');

            // Make API call to backend
            const response = await fetch('http://localhost:5000/prescription/process', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for authentication
            });

            if (!response.ok) {
                throw new Error(`Failed to process prescription: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Extract prescription ID for navigation
            const prescriptionId = data.prescription_data?.data?._id;
            
            // Set the result from the API
            setIsProcessing(false);
            setResult(`Successfully processed prescription: ${data.prescription_data?.data?.medications?.length || 0} medications found.`);
            
            // Open the preview instead of immediately calling the callback
            if (data.prescription_data) {
                setPrescriptionPreviewData(data.prescription_data);
                setIsPreviewOpen(true);
                return;
            }
            
            // If no callback and no preview, navigate after delay
            if (!onPrescriptionProcessed && externalOpen === undefined) {
                setTimeout(() => {
                    closePopup();
                    navigate('/admin/prescription', {
                        state: { 
                            prescriptionData: data.prescription_data,
                            prescriptionId: prescriptionId 
                        }
                    });
                }, 1500);
            } else if (externalOpen !== undefined) {
                // If we're in popup mode, just close after a delay
                setTimeout(() => {
                    closePopup();
                }, 1500);
            }
        } catch (error) {
            console.error('Error processing prescription:', error);
            setIsProcessing(false);
            setResult(`Error: ${error.message || 'Failed to process prescription'}`);
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

    // Handle saving the preview data
    const handlePreviewSave = (editedPrescriptionData) => {
        // Close the preview
        setIsPreviewOpen(false);
        
        // Call the onPrescriptionProcessed callback with the edited data
        if (onPrescriptionProcessed) {
            onPrescriptionProcessed(editedPrescriptionData);
        }
        
        // Reset the prescription preview data
        setPrescriptionPreviewData(null);
    };
    
    // Handle canceling the preview
    const handlePreviewCancel = () => {
        setIsPreviewOpen(false);
        setPrescriptionPreviewData(null);
    };

    // Reset the popup state
    const resetPopup = () => {
        setImage(null);
        setResult(null);
        setIsProcessing(false);
        stopCameraStream();
        setIsPreviewOpen(false);
        setPrescriptionPreviewData(null);
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
                                    {isCameraOpen ? "Take Photo" : "Prescription Scanner"}
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
                                                Position your prescription in the frame and take a photo
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
                                                Upload a prescription image or take a photo to get started
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
                                                <img src={image} alt="Uploaded prescription" className="max-h-64 object-contain rounded-md mx-auto" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg pointer-events-none"/>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">Processing your prescription...</p>
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
                                                Analyzing your prescription...
                                            </motion.p>
                                        </motion.div>
                                    )}

                                    {!isCameraOpen && result && (
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
                                                    <h3 className="font-semibold text-green-700 dark:text-green-400">Analysis Complete</h3>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{result}</p>
                                            </motion.div>
                                            <div className="relative w-full max-w-sm bg-gray-100 dark:bg-navy-700 rounded-lg p-2">
                                                <img src={image} alt="Processed prescription" className="max-h-48 object-contain rounded-md mx-auto" />
                                            </div>
                                            <motion.button 
                                                onClick={resetPopup} 
                                                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-500 text-white dark:text-gray-900 dark:hover:text-navy-900 px-4 py-2 rounded-full shadow-md shadow-gray-900/30 dark:shadow-green-600/20"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Scan Another
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Prescription Preview */}
            <AnimatePresence>
                {isPreviewOpen && prescriptionPreviewData && (
                    <PrescriptionPreview
                        prescriptionData={prescriptionPreviewData}
                        onSave={handlePreviewSave}
                        onCancel={handlePreviewCancel}
                        onClose={handlePreviewCancel}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}