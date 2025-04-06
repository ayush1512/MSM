import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Loader } from 'lucide-react';

export default function Prescription({ externalOpen, onClose, hideButton }) {
    // State management
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
    
    // Determine if popup should be open based on internal or external state
    const isPopupOpen = externalOpen !== undefined ? externalOpen : isInternalOpen;

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
    const processImage = (imageData) => {
        setIsProcessing(true);
        // Simulate processing delay
        setTimeout(() => {
            setIsProcessing(false);
            setResult("Prescription analysis complete! Drug: Paracetamol, Dosage: 500mg, Frequency: 3 times daily");
        }, 3000);
    };

    // Handle camera capture
    const handleCameraCapture = () => {
        fileInputRef.current.setAttribute('capture', 'user');
        fileInputRef.current.click();
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
        setIsProcessing(false);
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

    return (
        <div className="p-4">
            {/* Main page with button to open popup (optional) */}
            {!hideButton && (
                <div className="flex justify-center">
                    <button 
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors"
                        onClick={() => setIsInternalOpen(true)}
                    >
                        Scan Prescription
                    </button>
                </div>
            )}

            {/* Popup overlay */}
            {isPopupOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50'>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Popup header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-semibold">Prescription Scanner</h2>
                            <button 
                                onClick={closePopup}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Popup body */}
                        <div className="p-6">
                            {!image && !isProcessing && !result && (
                                <div className="flex flex-col items-center gap-6">
                                    <p className="text-center text-gray-600">
                                        Upload a prescription image or take a photo to get started
                                    </p>
                                    <div className="flex gap-4">
                                        <button 
                                            onClick={handleCameraCapture}
                                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                                        >
                                            <Camera size={18} />
                                            Camera
                                        </button>
                                        <button 
                                            onClick={handleUpload}
                                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                        >
                                            <Upload size={18} />
                                            Upload
                                        </button>
                                    </div>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                    />
                                </div>
                            )}

                            {image && !isProcessing && !result && (
                                <div className="flex flex-col items-center gap-4">
                                    <img src={image} alt="Uploaded prescription" className="max-h-64 object-contain" />
                                    <p>Processing your prescription...</p>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="animate-spin mb-4">
                                        <Loader size={48} className="text-blue-500" />
                                    </div>
                                    <p className="text-gray-600">Analyzing your prescription...</p>
                                </div>
                            )}

                            {result && (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full">
                                        <h3 className="font-semibold text-green-700 mb-2">Analysis Complete</h3>
                                        <p className="text-gray-700">{result}</p>
                                    </div>
                                    <img src={image} alt="Processed prescription" className="max-h-48 object-contain" />
                                    <button 
                                        onClick={resetPopup} 
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                    >
                                        Scan Another
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}