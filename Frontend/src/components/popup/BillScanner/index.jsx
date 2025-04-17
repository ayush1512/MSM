import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Camera, Loader, CheckCircle, RefreshCw, FileText, Edit, ChevronLeft, ChevronRight, Save, Trash2, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BillScanner({ externalOpen, onClose, hideButton }) {
    // State management
    const [isInternalOpen, setIsInternalOpen] = useState(false);
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [billData, setBillData] = useState(null);
    const [billDataList, setBillDataList] = useState([]);
    const [currentBillIndex, setCurrentBillIndex] = useState(0);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedBill, setEditedBill] = useState(null);
    const [viewMode, setViewMode] = useState('scan'); // 'scan', 'edit', 'list'
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

    // Handle file upload - modified for multiple files
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setIsProcessing(true);
            
            // Process each file
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = () => {
                    processImage(reader.result, file.type, file.name, index === files.length - 1);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Process the uploaded image - modified to support multiple bills
    const processImage = async (imageData, fileType, filename = "bill.jpg", isLastFile = true) => {
        try {
            const base64Response = await fetch(imageData);
            const blob = await base64Response.blob();
            
            let extension = 'jpg'; // default
            if (fileType) {
                if (fileType === 'application/pdf') extension = 'pdf';
                else if (fileType === 'image/png') extension = 'png';
                else if (fileType === 'image/jpeg') extension = 'jpg';
            }

            const formData = new FormData();
            formData.append('bill', blob, `bill.${extension}`);
            
            if (fileType) {
                formData.append('file_type', fileType);
            }

            const response = await fetch('http://localhost:5000/bill-scanner/upload', {
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
            
            // Handle results - can be one or multiple bills
            if (data.results && data.results.length > 0) {
                const newBills = data.results.map(result => {
                    const billDetails = result.bill_details || {};
                    const products = result.products || [];
                    
                    return {
                        id: result.bill_id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        imageUrl: result.image_url,
                        originalFilename: result.original_filename || filename || "Unknown",
                        extractedText: result.extracted_text || "",
                        uploadDate: new Date().toISOString(),
                        details: {
                            billNumber: billDetails.bill_number || "N/A",
                            billDate: billDetails.bill_date || new Date().toISOString().split('T')[0],
                            drawingParty: billDetails.drawing_party || "Unknown Vendor",
                            totalAmount: billDetails.total_amount || "0.00"
                        },
                        products: products.map(product => ({
                            productName: product.product_name || "",
                            quantity: product.quantity || 1,
                            batchNumber: product.batch_number || "",
                            mrp: product.mrp || 0,
                            rate: product.rate || 0,
                            amount: product.amount || 0,
                            expDate: product.exp_date || ""
                        })),
                        isSaved: false
                    };
                });
                
                setBillDataList(prevList => [...prevList, ...newBills]);
                setCurrentBillIndex(billDataList.length);
                setImage(newBills[0]?.imageUrl || null);
                
                if (isLastFile) {
                    setViewMode('list');
                    setResult(`Successfully processed ${newBills.length} bill(s)`);
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error('Error processing bill:', error);
            setResult(`Error: ${error.message}`);
            setIsProcessing(false);
        }
    };

    // Enable edit mode
    const enableEditMode = () => {
        if (billDataList[currentBillIndex]) {
            setEditedBill(JSON.parse(JSON.stringify(billDataList[currentBillIndex])));
            setViewMode('edit');
            setIsEditMode(true);
        }
    };
    
    // Save edited bill
    const saveEditedBill = () => {
        if (!editedBill) return;
        
        setBillDataList(prevList => {
            const newList = [...prevList];
            newList[currentBillIndex] = editedBill;
            return newList;
        });
        
        setIsEditMode(false);
        setEditedBill(null);
        setViewMode('list');
    };
    
    // Cancel editing
    const cancelEditing = () => {
        setIsEditMode(false);
        setEditedBill(null);
        setViewMode('list');
    };
    
    // Update edited bill field
    const updateEditedBill = (field, value) => {
        if (!editedBill) return;
        
        if (field.startsWith('details.')) {
            const detailField = field.split('.')[1];
            setEditedBill(prev => ({
                ...prev,
                details: {
                    ...prev.details,
                    [detailField]: value
                }
            }));
        } else {
            setEditedBill(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };
    
    // Update product in edited bill
    const updateProduct = (index, field, value) => {
        if (!editedBill) return;
        
        setEditedBill(prev => {
            const updatedProducts = [...prev.products];
            updatedProducts[index] = {
                ...updatedProducts[index],
                [field]: value
            };
            
            return {
                ...prev,
                products: updatedProducts
            };
        });
    };
    
    // Add new product to edited bill
    const addNewProduct = () => {
        if (!editedBill) return;
        
        setEditedBill(prev => ({
            ...prev,
            products: [
                ...prev.products,
                {
                    productName: "",
                    quantity: 1,
                    batchNumber: "",
                    mrp: 0,
                    rate: 0,
                    amount: 0,
                    expDate: ""
                }
            ]
        }));
    };
    
    // Remove product from edited bill
    const removeProduct = (index) => {
        if (!editedBill) return;
        
        setEditedBill(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index)
        }));
    };

    // Save current bill
    const saveBill = async (billIndex = currentBillIndex) => {
        try {
            const billToSave = billDataList[billIndex];
            
            if (!billToSave) {
                throw new Error("No bill selected to save");
            }
            
            // Format products data for the API
            const productsData = billToSave.products.map(p => ({
                product_name: p.productName,
                quantity: p.quantity,
                batch_number: p.batchNumber,
                mrp: p.mrp,
                rate: p.rate,
                amount: p.amount,
                exp_date: p.expDate
            }));
            
            // Format request payload
            const requestData = {
                auto_enrich: true,
                products: productsData,
                bill_data: {
                    bill_id: billToSave.id.startsWith('temp-') ? undefined : billToSave.id,
                    original_filename: billToSave.originalFilename,
                    image_url: billToSave.imageUrl,
                    extracted_text: billToSave.extractedText,
                    bill_details: {
                        bill_number: billToSave.details.billNumber,
                        bill_date: billToSave.details.billDate,
                        drawing_party: billToSave.details.drawingParty,
                        total_amount: billToSave.details.totalAmount
                    },
                    products: productsData
                }
            };
            
            // Make API call to save-products endpoint
            const response = await fetch('http://localhost:5000/bill-scanner/save-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Failed to save bill: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Update bill list to mark this bill as saved
            setBillDataList(prevList => {
                return prevList.map((bill, idx) => {
                    if (idx === billIndex) {
                        return { 
                            ...bill, 
                            id: data.bill_id || bill.id, 
                            isSaved: true 
                        };
                    }
                    return bill;
                });
            });
            
            return true;
        } catch (error) {
            console.error('Error saving bill:', error);
            alert(`Error: ${error.message || 'Failed to save bill'}`);
            return false;
        }
    };
    
    // Save all bills - send them one by one to the API
    const saveAllBills = async () => {
        let successCount = 0;
        let failCount = 0;
        
        // Save bills one by one to avoid overwhelming the server
        for (let i = 0; i < billDataList.length; i++) {
            if (!billDataList[i].isSaved) {
                const success = await saveBill(i);
                if (success) {
                    successCount++;
                } else {
                    failCount++;
                }
                
                // Small delay between requests to avoid rate limiting
                if (i < billDataList.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        }
        
        alert(`${successCount} bills saved successfully. ${failCount} bills failed to save.`);
    };
    
    // Delete bill
    const deleteBill = (index) => {
        if (billDataList.length <= 1) {
            alert("Cannot delete the only bill.");
            return;
        }
        
        if (window.confirm("Are you sure you want to delete this bill?")) {
            setBillDataList(prevList => {
                const newList = [...prevList];
                newList.splice(index, 1);
                return newList;
            });
            
            if (currentBillIndex >= index && currentBillIndex > 0) {
                setCurrentBillIndex(currentBillIndex - 1);
            } else if (currentBillIndex >= billDataList.length - 1) {
                setCurrentBillIndex(billDataList.length - 2);
            }
        }
    };
    
    // Navigate to previous bill
    const prevBill = () => {
        if (currentBillIndex > 0) {
            setCurrentBillIndex(currentBillIndex - 1);
        }
    };
    
    // Navigate to next bill
    const nextBill = () => {
        if (currentBillIndex < billDataList.length - 1) {
            setCurrentBillIndex(currentBillIndex + 1);
        }
    };

    // Handle camera access
    const handleCameraCapture = async () => {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            fileInputRef.current.setAttribute('capture', 'environment');
            fileInputRef.current.click();
            return;
        }
        
        setIsCameraLoading(true);
        setCameraError(null);
        setIsCameraOpen(true);
        
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true
            });
            
            setStream(mediaStream);
            
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play()
                        .then(() => {
                            setIsCameraLoading(false);
                        })
                        .catch(err => {
                            setCameraError("Could not play video stream");
                            setIsCameraLoading(false);
                        });
                };
                
                videoRef.current.onerror = (err) => {
                    setCameraError("Video element encountered an error");
                    setIsCameraLoading(false);
                };
            }
        } catch (error) {
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
            return;
        }
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        if (video.paused || video.videoWidth === 0) {
            return;
        }
        
        try {
            canvas.width = video.videoWidth || video.clientWidth;
            canvas.height = video.videoHeight || video.clientHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = canvas.toDataURL('image/png');
            
            if (imageData === 'data:,') {
                alert("Could not capture image. Please try again.");
                return;
            }
            
            setImage(imageData);
            processImage(imageData, 'image/png');
            
            stopCameraStream();
        } catch (error) {
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

    // Handle regular upload - modified for multiple files
    const handleUpload = () => {
        fileInputRef.current.removeAttribute('capture');
        fileInputRef.current.multiple = true; // Enable multiple file selection
        fileInputRef.current.click();
    };

    // Reset the popup state
    const resetPopup = () => {
        setImage(null);
        setResult(null);
        setBillData(null);
        setBillDataList([]);
        setCurrentBillIndex(0);
        setIsProcessing(false);
        setIsEditMode(false);
        setEditedBill(null);
        setViewMode('scan');
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

    useEffect(() => {
        if (!isPopupOpen) {
            stopCameraStream();
        }
    }, [isPopupOpen]);

    // Render bill editor form
    const renderBillEditor = () => {
        if (!editedBill) return null;
        
        return (
            <div className="w-full">
                <h3 className="text-lg font-semibold mb-4 text-navy-700 dark:text-white">Edit Bill Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vendor/Drawing Party
                        </label>
                        <input
                            type="text"
                            value={editedBill.details.drawingParty}
                            onChange={(e) => updateEditedBill('details.drawingParty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bill Number
                        </label>
                        <input
                            type="text"
                            value={editedBill.details.billNumber}
                            onChange={(e) => updateEditedBill('details.billNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            value={editedBill.details.billDate.split('T')[0]}
                            onChange={(e) => updateEditedBill('details.billDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Total Amount
                        </label>
                        <input
                            type="number"
                            value={editedBill.details.totalAmount}
                            onChange={(e) => updateEditedBill('details.totalAmount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white"
                        />
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-navy-700 dark:text-white">Products</h4>
                        <button
                            onClick={addNewProduct}
                            className="flex items-center gap-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1 rounded"
                        >
                            <PlusCircle size={14} /> Add Product
                        </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-navy-600 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-navy-700">
                                <tr>
                                    <th className="px-2 py-2 text-left">Product</th>
                                    <th className="px-2 py-2 text-center w-16">Qty</th>
                                    <th className="px-2 py-2 text-right w-20">Rate</th>
                                    <th className="px-2 py-2 text-right w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {editedBill.products.map((product, idx) => (
                                    <tr key={idx} className="border-t border-gray-100 dark:border-navy-600">
                                        <td className="px-2 py-1">
                                            <input
                                                type="text"
                                                value={product.productName}
                                                onChange={(e) => updateProduct(idx, 'productName', e.target.value)}
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-navy-600 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-xs"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) => updateProduct(idx, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-navy-600 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-xs text-center"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <input
                                                type="number"
                                                value={product.rate}
                                                onChange={(e) => updateProduct(idx, 'rate', parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 border border-gray-300 dark:border-navy-600 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-navy-700 dark:text-white text-xs text-right"
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <button
                                                onClick={() => removeProduct(idx)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="flex justify-between">
                    <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-700 dark:text-white rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveEditedBill}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2"
                    >
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>
        );
    };
    
    // Render bill details view
    const renderBillDetails = () => {
        const bill = billDataList[currentBillIndex];
        if (!bill) return null;
        
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
                        Bill {currentBillIndex + 1} of {billDataList.length}
                    </h3>
                    <div className="flex gap-2">
                        <button
                            onClick={prevBill}
                            disabled={currentBillIndex === 0}
                            className={`p-1 rounded ${currentBillIndex === 0 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextBill}
                            disabled={currentBillIndex === billDataList.length - 1}
                            className={`p-1 rounded ${currentBillIndex === billDataList.length - 1 ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                
                <div className="mb-4">
                    <div className="relative mb-3 rounded-lg overflow-hidden h-48 bg-gray-100 dark:bg-navy-700 flex justify-center">
                        {bill.imageUrl ? (
                            <img
                                src={bill.imageUrl}
                                alt="Bill"
                                className="h-full object-contain"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full">
                                <p className="text-gray-500 dark:text-gray-400">No image available</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Vendor/Drawing Party</p>
                            <p className="font-medium">{bill.details.drawingParty}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Bill Number</p>
                            <p className="font-medium">{bill.details.billNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                            <p className="font-medium">{bill.details.billDate}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="font-medium">₹{bill.details.totalAmount}</p>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <h4 className="font-medium mb-2">Products</h4>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-navy-600 rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-navy-700">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Product</th>
                                        <th className="px-3 py-2 text-center">Qty</th>
                                        <th className="px-3 py-2 text-right">Rate</th>
                                        <th className="px-3 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.products.map((product, idx) => (
                                        <tr key={idx} className="border-t border-gray-100 dark:border-navy-600">
                                            <td className="px-3 py-2">{product.productName}</td>
                                            <td className="px-3 py-2 text-center">{product.quantity}</td>
                                            <td className="px-3 py-2 text-right">₹{product.rate}</td>
                                            <td className="px-3 py-2 text-right">₹{product.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 justify-between">
                        <button
                            onClick={() => deleteBill(currentBillIndex)}
                            className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-1"
                        >
                            <Trash2 size={16} /> Delete
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={enableEditMode}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-700 dark:text-white rounded-lg flex items-center gap-1"
                            >
                                <Edit size={16} /> Edit
                            </button>
                            <button
                                onClick={() => saveBill()}
                                disabled={bill.isSaved}
                                className={`px-4 py-2 ${bill.isSaved ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-brand-500 hover:bg-brand-600'} text-white rounded-lg flex items-center gap-1`}
                            >
                                <Save size={16} /> {bill.isSaved ? "Saved" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
                
                {billDataList.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-navy-600 flex justify-between">
                        <button
                            onClick={() => setViewMode('list')}
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm flex items-center gap-1"
                        >
                            View All Bills
                        </button>
                        <button
                            onClick={saveAllBills}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1"
                        >
                            <Save size={16} /> Save All Bills
                        </button>
                    </div>
                )}
            </div>
        );
    };
    
    // Render bill list view
    const renderBillList = () => {
        if (billDataList.length === 0) {
            return (
                <div className="py-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No bills have been scanned yet</p>
                    <button
                        onClick={() => setViewMode('scan')}
                        className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
                    >
                        Scan Your First Bill
                    </button>
                </div>
            );
        }
        
        return (
            <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-navy-700 dark:text-white">
                        Processed Bills ({billDataList.length})
                    </h3>
                    <button
                        onClick={saveAllBills}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 text-sm"
                    >
                        <Save size={14} /> Save All
                    </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                    {billDataList.map((bill, idx) => (
                        <div 
                            key={idx} 
                            className="flex gap-3 p-3 border-b border-gray-100 dark:border-navy-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-navy-700 cursor-pointer"
                            onClick={() => {
                                setCurrentBillIndex(idx);
                                setViewMode('view');
                            }}
                        >
                            <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-navy-700">
                                {bill.imageUrl ? (
                                    <img 
                                        src={bill.imageUrl}
                                        alt="Bill thumbnail" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FileText size={24} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between">
                                    <h4 className="font-medium text-navy-700 dark:text-white truncate">
                                        {bill.details.drawingParty}
                                    </h4>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${bill.isSaved ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                                        {bill.isSaved ? "Saved" : "Unsaved"}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    Bill #{bill.details.billNumber} • {bill.details.billDate}
                                </p>
                                <div className="flex justify-between mt-1">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {bill.products.length} products
                                    </span>
                                    <span className="text-sm font-medium">
                                        ₹{bill.details.totalAmount}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-between mt-4">
                    <button
                        onClick={() => setViewMode('scan')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-700 dark:text-white rounded-lg"
                    >
                        Scan Another
                    </button>
                    <button
                        onClick={() => {
                            if (billDataList.length > 0) {
                                setCurrentBillIndex(0);
                                setViewMode('view');
                            }
                        }}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
                    >
                        View First Bill
                    </button>
                </div>
            </div>
        );
    };

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
                                    {isCameraOpen ? "Take Photo" : 
                                     viewMode === 'edit' ? "Edit Bill" :
                                     viewMode === 'list' ? "Bills" :
                                     viewMode === 'view' ? "Bill Details" : "Bill Scanner"}
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
                                    {/* Camera view */}
                                    {isCameraOpen && (
                                        <motion.div>Camera view</motion.div>
                                    )}
                                    
                                    {/* Upload view */}
                                    {viewMode === 'scan' && !isCameraOpen && !isProcessing && (
                                        <motion.div 
                                            className="flex flex-col items-center gap-6"
                                            key="upload"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <p className="text-center text-gray-600 dark:text-gray-300">
                                                Upload one or more bill images to scan and process
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
                                                multiple
                                                className="hidden" 
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                            
                                            {billDataList.length > 0 && (
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className="mt-4 text-brand-500 hover:underline"
                                                >
                                                    View {billDataList.length} scanned bills
                                                </button>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Processing spinner */}
                                    {isProcessing && (
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
                                                Processing your bills...
                                            </motion.p>
                                        </motion.div>
                                    )}
                                    
                                    {/* List view */}
                                    {!isCameraOpen && !isProcessing && viewMode === 'list' && (
                                        <motion.div
                                            key="billList"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {renderBillList()}
                                        </motion.div>
                                    )}
                                    
                                    {/* Bill details view */}
                                    {!isCameraOpen && !isProcessing && viewMode === 'view' && (
                                        <motion.div
                                            key="billDetails"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {renderBillDetails()}
                                        </motion.div>
                                    )}
                                    
                                    {/* Bill edit view */}
                                    {!isCameraOpen && !isProcessing && viewMode === 'edit' && (
                                        <motion.div
                                            key="billEditor"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            {renderBillEditor()}
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