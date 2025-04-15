import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { MdArrowBack, MdDownload } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import Card from "components/card";
import PrescriptionSection from "./components/PrescriptionSection";
import EditSectionPopup from "./components/EditSectionPopup";
import MedicationsSection from "./components/MedicationsSection";
import EditMedicationPopup from "./components/EditMedicationPopup";
import { generatePrescriptionPDF } from "./components/PdfGenerator";

const PrescriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: urlParamId } = useParams(); // Extract ID from URL params
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for edit popups
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  
  // State for medication edit popup
  const [isEditMedicationPopupOpen, setIsEditMedicationPopupOpen] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);
  const [medicationIndex, setMedicationIndex] = useState(null);
  
  useEffect(() => {
    // First check: If prescription data was passed via location state, use it
    if (location.state?.prescriptionData) {
      setPrescriptionData(location.state.prescriptionData);
      setLoading(false);
    } 
    // Second check: If prescription ID in location state
    else if (location.state?.prescriptionId) {
      fetchPrescription(location.state.prescriptionId);
    } 
    // Third check: If prescription ID in URL parameters
    else if (urlParamId) {
      fetchPrescription(urlParamId);
    } 
    // Otherwise, show error
    else {
      setError("No prescription data or ID provided");
      setLoading(false);
    }
  }, [location, urlParamId]);
  
  const fetchPrescription = async (id) => {
    try {
      setLoading(true);
      console.log(`Fetching prescription with ID: ${id}`);
      
      const response = await axios.get(`http://localhost:5000/prescription/${id}`, {
        withCredentials: true
      });
      
      console.log("API Response:", response.data);
      
      if (response.data && response.data.data) {
        setPrescriptionData({ data: response.data.data });
      } else if (response.data && response.data.success) {
        // Alternative response format from the API
        setPrescriptionData({ data: response.data });
      } else {
        throw new Error("Invalid prescription data format");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setError("Failed to load prescription data");
      setLoading(false);
    }
  };
  
  const handleEditClick = (section, data) => {
    setCurrentSection(section);
    setSectionData(data);
    setIsEditPopupOpen(true);
  };
  
  const handleEditMedicationClick = (medication, index) => {
    setCurrentMedication(medication);
    setMedicationIndex(index);
    setIsEditMedicationPopupOpen(true);
  };

  const handleAddMedication = () => {
    // Create a new empty medication template
    const newMedication = {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    };
    
    // Set the current medication for editing
    setCurrentMedication(newMedication);
    setMedicationIndex(prescriptionData.data.medications.length);
    setIsEditMedicationPopupOpen(true);
  };
  
  const handleDeleteMedication = async (index) => {
    try {
      if (!confirm("Are you sure you want to delete this medication?")) {
        return;
      }
      
      // Make a deep copy of prescription data
      const updatedPrescription = JSON.parse(JSON.stringify(prescriptionData));
      
      // Remove the medication at specified index
      updatedPrescription.data.medications.splice(index, 1);
      
      // Save changes to the server
      const prescriptionId = prescriptionData.data._id;
      await axios.put(`http://localhost:5000/prescription/${prescriptionId}`, updatedPrescription.data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      // Update local state
      setPrescriptionData(updatedPrescription);
      
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert("Failed to delete medication");
    }
  };
  
  const handleEditSectionSave = async (section, updatedData) => {
    try {
      // Make a deep copy of prescription data
      const updatedPrescription = JSON.parse(JSON.stringify(prescriptionData));
      
      // Update the specified section
      updatedPrescription.data[section] = updatedData;
      
      // Save changes to the server
      const prescriptionId = prescriptionData.data._id;
      await axios.put(`http://localhost:5000/prescription/${prescriptionId}`, updatedPrescription.data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      // Update local state
      setPrescriptionData(updatedPrescription);
      setIsEditPopupOpen(false);
    } catch (error) {
      console.error("Error updating prescription:", error);
      alert("Failed to save changes");
    }
  };
  
  const handleEditMedicationSave = async (updatedMedication) => {
    try {
      // Make a deep copy of prescription data
      const updatedPrescription = JSON.parse(JSON.stringify(prescriptionData));
      
      // Check if we're adding a new medication or updating existing one
      if (medicationIndex === updatedPrescription.data.medications.length) {
        // Add new medication
        updatedPrescription.data.medications.push(updatedMedication);
      } else {
        // Update existing medication
        updatedPrescription.data.medications[medicationIndex] = updatedMedication;
      }
      
      // Save changes to the server
      const prescriptionId = prescriptionData.data._id;
      await axios.put(`http://localhost:5000/prescription/${prescriptionId}`, updatedPrescription.data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      
      // Update local state
      setPrescriptionData(updatedPrescription);
      setIsEditMedicationPopupOpen(false);
    } catch (error) {
      console.error("Error updating medication:", error);
      alert("Failed to save changes");
    }
  };
  
  const handleDownloadPDF = () => {
    if (prescriptionData) {
      generatePrescriptionPDF(prescriptionData.data);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-4">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }
  
  if (!prescriptionData) {
    return (
      <div className="bg-gray-50 dark:bg-navy-900/20 border border-gray-200 dark:border-navy-800 p-4 rounded-xl mb-4">
        <p className="text-gray-700 dark:text-gray-400">No prescription data available</p>
      </div>
    );
  }
  
  const data = prescriptionData.data;
  
  return (
    <div className="mt-3 flex flex-col gap-5">
      {/* Header with back button and download button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
          >
            <MdArrowBack className="h-5 w-5" />
          </button>
          <h4 className="text-xl font-bold text-black dark:text-white">
            Prescription Details
          </h4>
        </div>
        
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 shadow-md shadow-brand-500/30 transition-all"
        >
          <MdDownload className="h-5 w-5" />
          Download PDF
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column - Image + Prescription Details */}
        <div className="lg:col-span-1">
          {/* Prescription Image */}
          <Card extra="mb-5 p-4 border border-gray-200 dark:border-navy-700 shadow-lg">
            <h5 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Prescription Image</h5>
            {data.image_data?.url ? (
              <div className="relative aspect-[3/4] w-full">
                <img
                  src={data.image_data.url}
                  alt="Prescription"
                  className="object-contain w-full h-full rounded-xl shadow-md border border-gray-200 dark:border-navy-600"
                />
                <a 
                  href={data.image_data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-2 right-2 flex items-center justify-center p-2 rounded-full bg-white/80 hover:bg-white text-brand-700 shadow hover:shadow-lg transition-all"
                >
                  <MdDownload className="h-5 w-5" />
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-navy-800 rounded-xl border border-dashed border-gray-300 dark:border-navy-600">
                <p className="text-gray-500 dark:text-gray-400">No image available</p>
              </div>
            )}
          </Card>
          
          {/* Prescription Details - Not Editable */}
          <PrescriptionSection
            title="Prescription Details"
            data={data.prescription_details}
            nonEditable={true}
          />
        </div>
        
        {/* Right column - All other sections */}
        <div className="lg:col-span-2">
          {/* Hospital Information */}
          <PrescriptionSection
            title="Hospital Information" 
            data={data.hospital_info}
            onEdit={() => handleEditClick("hospital_info", data.hospital_info)}
          />
          
          {/* Doctor Information */}
          <PrescriptionSection
            title="Doctor Information"
            data={data.doctor_info}
            onEdit={() => handleEditClick("doctor_info", data.doctor_info)}
          />
          
          {/* Patient Information */}
          <PrescriptionSection
            title="Patient Information"
            data={data.patient_info}
            onEdit={() => handleEditClick("patient_info", data.patient_info)}
          />
          
          {/* Medications Section */}
          <MedicationsSection
            medications={data.medications}
            onEditMedication={handleEditMedicationClick}
            onAddMedication={handleAddMedication}
            onDeleteMedication={handleDeleteMedication}
          />
          
          {/* Additional Notes */}
          <PrescriptionSection
            title="Additional Notes"
            data={data.additional_notes}
            onEdit={() => handleEditClick("additional_notes", data.additional_notes)}
          />
        </div>
      </div>
      
      {/* Edit Section Popup */}
      {isEditPopupOpen && (
        <EditSectionPopup
          isOpen={isEditPopupOpen}
          onClose={() => setIsEditPopupOpen(false)}
          sectionTitle={currentSection === "hospital_info" ? "Hospital Information" : 
                        currentSection === "doctor_info" ? "Doctor Information" : 
                        currentSection === "patient_info" ? "Patient Information" : 
                        "Additional Notes"}
          sectionData={sectionData}
          onSave={(updatedData) => handleEditSectionSave(currentSection, updatedData)}
        />
      )}
      
      {/* Edit Medication Popup */}
      {isEditMedicationPopupOpen && (
        <EditMedicationPopup
          isOpen={isEditMedicationPopupOpen}
          onClose={() => setIsEditMedicationPopupOpen(false)}
          medication={currentMedication}
          onSave={handleEditMedicationSave}
        />
      )}
    </div>
  );
};

export default PrescriptionPage;
