import React, { useState } from 'react';
import axios from 'axios';

const PrescriptionReader = () => {
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setError(null); // Clear any previous errors
  };

  const handleUpload = async () => {
    if (!image) {
      setError('Please upload a prescription image.');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        'http://127.0.0.1:5000/prescription/process',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
          validateStatus: (status) => status < 500
        }
      );

      if (response.data.success) {
        setFormData(response.data.prescription_data);
      } else {
        setError(response.data.error || 'Failed to process the prescription.');
        console.error('Processing error:', response.data);
      }
    } catch (error) {
      console.error('Upload error:', error.response || error);
      setError(error.response?.data?.error || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/prescription/${formData.data._id}`,
        formData.data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.success) {
        alert('Prescription updated successfully!');
      } else {
        setError(response.data.error || 'Failed to update prescription.');
      }
    } catch (error) {
      console.error('Save error:', error.response || error);
      setError(error.response?.data?.error || 'Failed to save changes.');
    }
  };

  const renderFormSection = (title, data, fields) => {
    if (!data) return null;
    return (
      <div className="mb-8 p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.key} className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}:
              </label>
              <input
                type="text"
                value={data[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value, field.section)}
                className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderImagePreview = (imageData) => {
    if (!imageData) return null;
    return (
      <div className="mb-8 p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-medium mb-4">Prescription Image</h3>
        <div className="relative aspect-[3/4] w-full max-w-md mx-auto">
          <img
            src={imageData.url}
            alt="Prescription"
            className="object-contain w-full h-full rounded-lg shadow"
          />
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <p>Public ID: {imageData.public_id}</p>
        </div>
      </div>
    );
  };

  const renderAdditionalNotes = (notes) => {
    if (!notes) return null;
    return (
      <div className="mb-8 p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-medium mb-4">Additional Notes</h3>
        <div className="grid grid-cols-1 gap-4">
          {['follow_up_date', 'review_instructions', 'special_instructions'].map((field) => (
            <div key={field} className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.replace('_', ' ')}:
              </label>
              <input
                type="text"
                value={notes[field] || ''}
                onChange={(e) => handleFieldChange(field, e.target.value, 'additional_notes')}
                className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Not specified"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMedicationForm = (medication, index) => (
    <div key={index} className="border p-4 rounded mb-4 bg-white shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">Medication {index + 1}</h4>
        {medication.suggested && (
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Suggested Name
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'name', label: 'Name' },
          { key: 'original_name', label: 'Original Name', show: medication.suggested },
          { key: 'dosage', label: 'Dosage' },
          { key: 'frequency', label: 'Frequency' },
          { key: 'duration', label: 'Duration' },
          { key: 'instructions', label: 'Instructions' }
        ].filter(field => field.show !== false).map(field => (
          <div key={field.key} className="form-group">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}:
            </label>
            <input
              type="text"
              value={medication[field.key] || ''}
              onChange={(e) => handleMedicationChange(index, field.key, e.target.value)}
              className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              readOnly={field.key === 'original_name'}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const handleFieldChange = (key, value, section) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [section]: {
          ...prev.data[section],
          [key]: value
        }
      }
    }));
  };

  const handleMedicationChange = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      data: {
        ...prev.data,
        medications: prev.data.medications.map((med, i) =>
          i === index ? { ...med, [key]: value } : med
        )
      }
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Prescription Upload</h1>

      <div className="mb-6">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50 hover:bg-blue-600 transition-colors"
      >
        {loading ? 'Processing...' : 'Upload Prescription'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      {formData && formData.data && (
        <div className="mt-8 space-y-6">
          <h2 className="text-xl font-semibold mb-6">Prescription Details</h2>
          
          {renderImagePreview(formData.data.image_data)}
          
          {renderFormSection('Hospital Information', formData.data.hospital_info, [
            { key: 'name', label: 'Name', section: 'hospital_info' },
            { key: 'address', label: 'Address', section: 'hospital_info' },
            { key: 'contact', label: 'Contact', section: 'hospital_info' },
            { key: 'registration', label: 'Registration', section: 'hospital_info' }
          ])}

          {renderFormSection('Prescription Details', formData.data.prescription_details, [
            { key: 'date', label: 'Date', section: 'prescription_details' },
            { key: 'type', label: 'Type', section: 'prescription_details' }
          ])}

          {renderFormSection('Patient Information', formData.data.patient_info, [
            { key: 'name', label: 'Name', section: 'patient_info' },
            { key: 'age', label: 'Age', section: 'patient_info' },
            { key: 'gender', label: 'Gender', section: 'patient_info' }
          ])}

          {renderFormSection('Doctor Information', formData.data.doctor_info, [
            { key: 'name', label: 'Name', section: 'doctor_info' },
            { key: 'specialization', label: 'Specialization', section: 'doctor_info' },
            { key: 'license_number', label: 'License Number', section: 'doctor_info' },
            { key: 'contact', label: 'Contact', section: 'doctor_info' }
          ])}

          <div className="mb-8 p-4 bg-white shadow rounded-lg">
            <h3 className="text-lg font-medium mb-4">Medications</h3>
            {formData.data.medications?.map((med, index) => 
              renderMedicationForm(med, index)
            )}
          </div>

          {renderAdditionalNotes(formData.data.additional_notes)}

          <div className="flex justify-between">
            <p className="text-sm text-gray-500">
              Prescription ID: {formData.data._id}
            </p>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionReader;
