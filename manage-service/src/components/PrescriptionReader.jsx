// import React from "react";

// const PrescriptionReader = () => {
//   return <h1 className="text-center mt-10">Prescription Reader Page</h1>;
// };

// export default PrescriptionReader;
// // // import React, { useState } from "react";
// // // import axios from "axios";

// // // function PrescriptionUploader() {
// // //   const [selectedFile, setSelectedFile] = useState(null);
// // //   const [formData, setFormData] = useState(null);
// // //   const [loading, setLoading] = useState(false);

// // //   const handleFileChange = (event) => {
// // //     setSelectedFile(event.target.files[0]);
// // //   };

// // //   const handleUpload = async () => {
// // //     if (!selectedFile) {
// // //       alert("Please select a file first.");
// // //       return;
// // //     }

// // //     setLoading(true);
// // //     const uploadData = new FormData();
// // //     uploadData.append("file", selectedFile);

// // //     try {
// // //       const response = await axios.post(
// // //         "http://127.0.0.1:5000/prescription/process",
// // //         uploadData,
// // //         {
// // //           headers: {
// // //             "Content-Type": "multipart/form-data",
// // //           },
// // //         }
// // //       );

// // //       if (response.data.success) {
// // //         setFormData(response.data.prescription_data.data);
// // //       } else {
// // //         alert("Failed to process the prescription. Please try again.");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error uploading file:", error);
// // //       alert("An error occurred while uploading. Please try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleInputChange = (event) => {
// // //     const { name, value } = event.target;
// // //     const keys = name.split(".");
// // //     setFormData((prevData) => {
// // //       const newData = { ...prevData };
// // //       let obj = newData;
// // //       for (let i = 0; i < keys.length - 1; i++) {
// // //         obj = obj[keys[i]];
// // //       }
// // //       obj[keys[keys.length - 1]] = value;
// // //       return newData;
// // //     });
// // //   };

// // //   return (
// // //     <div className="p-4 max-w-xl mx-auto">
// // //       <h1 className="text-xl font-bold mb-4">Upload Prescription</h1>
// // //       <input
// // //         type="file"
// // //         onChange={handleFileChange}
// // //         className="mb-4 border p-2 w-full"
// // //       />
// // //       <button
// // //         onClick={handleUpload}
// // //         className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
// // //         disabled={loading}
// // //       >
// // //         {loading ? "Uploading..." : "Upload and Extract"}
// // //       </button>

// // //       {formData && (
// // //         <div className="border p-4 rounded mt-4">
// // //           <h2 className="text-lg font-semibold mb-2">Extracted Data</h2>
// // //           <form>
// // //             {/* Patient Info */}
// // //             <div className="mb-4">
// // //               <h3 className="font-medium">Patient Information</h3>
// // //               <label className="block">Name:</label>
// // //               <input
// // //                 type="text"
// // //                 name="patient_info.name"
// // //                 value={formData.patient_info?.name || ""}
// // //                 onChange={handleInputChange}
// // //                 className="border p-2 w-full rounded"
// // //               />
// // //               <label className="block">Age:</label>
// // //               <input
// // //                 type="text"
// // //                 name="patient_info.age"
// // //                 value={formData.patient_info?.age || ""}
// // //                 onChange={handleInputChange}
// // //                 className="border p-2 w-full rounded"
// // //               />
// // //               <label className="block">Gender:</label>
// // //               <input
// // //                 type="text"
// // //                 name="patient_info.gender"
// // //                 value={formData.patient_info?.gender || ""}
// // //                 onChange={handleInputChange}
// // //                 className="border p-2 w-full rounded"
// // //               />
// // //             </div>

// // //             {/* Doctor Info */}
// // //             <div className="mb-4">
// // //               <h3 className="font-medium">Doctor Information</h3>
// // //               <label className="block">Name:</label>
// // //               <input
// // //                 type="text"
// // //                 name="doctor_info.name"
// // //                 value={formData.doctor_info?.name || ""}
// // //                 onChange={handleInputChange}
// // //                 className="border p-2 w-full rounded"
// // //               />
// // //               <label className="block">License Number:</label>
// // //               <input
// // //                 type="text"
// // //                 name="doctor_info.license_number"
// // //                 value={formData.doctor_info?.license_number || ""}
// // //                 onChange={handleInputChange}
// // //                 className="border p-2 w-full rounded"
// // //               />
// // //               <label className="block">Specialization:</label>
// // //               <input
// // //                 type="text"
// // //                 name="doctor_info.specialization"
// // //                 value={formData.doctor_info?.specialization || ""}
// // //                 onChange={handleInputChange}
// // //                 className="border p-2 w-full rounded"
// // //               />
// // //             </div>

// // //             {/* Medications */}
// // //             <div className="mb-4">
// // //               <h3 className="font-medium">Medications</h3>
// // //               {formData.medications?.map((medication, index) => (
// // //                 <div key={index} className="border p-2 mb-2 rounded">
// // //                   <label className="block">Name:</label>
// // //                   <input
// // //                     type="text"
// // //                     name={`medications[${index}].name`}
// // //                     value={medication.name || ""}
// // //                     onChange={handleInputChange}
// // //                     className="border p-2 w-full rounded"
// // //                   />
// // //                   <label className="block">Dosage:</label>
// // //                   <input
// // //                     type="text"
// // //                     name={`medications[${index}].dosage`}
// // //                     value={medication.dosage || ""}
// // //                     onChange={handleInputChange}
// // //                     className="border p-2 w-full rounded"
// // //                   />
// // //                   <label className="block">Frequency:</label>
// // //                   <input
// // //                     type="text"
// // //                     name={`medications[${index}].frequency`}
// // //                     value={medication.frequency || ""}
// // //                     onChange={handleInputChange}
// // //                     className="border p-2 w-full rounded"
// // //                   />
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           </form>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // export default PrescriptionUploader;


// // // import React, { useState } from "react";
// // // import axios from "axios";

// // // function PrescriptionUploader() {
// // //   const [selectedFile, setSelectedFile] = useState(null);
// // //   const [formData, setFormData] = useState(null);
// // //   const [loading, setLoading] = useState(false);

// // //   const handleFileChange = (event) => {
// // //     setSelectedFile(event.target.files[0]);
// // //   };

// // // //   const handleUpload = async () => {
// // // //     if (!selectedFile) {
// // // //       alert("Please select a file first.");
// // // //       return;
// // // //     }

// // // //     setLoading(true);
// // // //     const uploadData = new FormData();
// // // //     uploadData.append("file", selectedFile);

// // // //     try {
// // // //       const response = await axios.post(
// // // //         "http://localhost:5001/prescription/process",
// // // //         uploadData,
// // // //         {
// // // //           headers: {
// // // //             "Content-Type": "multipart/form-data",
// // // //           },
// // // //         }
// // // //       );

// // // //       if (response.data.success) {
// // // //         setFormData(response.data.prescription_data.data);
// // // //       } else {
// // // //         alert("Failed to process the prescription.");
// // // //       }
// // // //     } catch (error) {
// // // //       console.error("Error uploading file:", error);
// // // //       alert("An error occurred while uploading.");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleInputChange = (event) => {
// // // //     const { name, value } = event.target;
// // // //     setFormData((prev) => ({ ...prev, [name]: value }));
// // // //   };

// // // //   return (
// // // //     <div className="p-4 max-w-xl mx-auto">
// // // //       <h1 className="text-xl font-bold mb-4">Upload Prescription</h1>
// // // //       <input type="file" onChange={handleFileChange} className="mb-4 border p-2" />
// // // //       <button
// // // //         onClick={handleUpload}
// // // //         className="bg-blue-500 text-white py-2 px-4 rounded"
// // // //         disabled={loading}
// // // //       >
// // // //         {loading ? "Uploading..." : "Upload"}
// // // //       </button>

// // // //       {formData && (
// // // //         <div className="mt-4">
// // // //           <h2 className="text-lg font-semibold">Extracted Data</h2>
// // // //           <form>
// // // //             <label>Name:</label>
// // // //             <input
// // // //               type="text"
// // // //               name="patient_info.name"
// // // //               value={formData.patient_info.name}
// // // //               onChange={handleInputChange}
// // // //               className="block border p-2 mb-2"
// // // //             />
// // // //             {/* Repeat similar fields for other data */}
// // // //           </form>
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }

// // // // export default PrescriptionUploader;


// // // import React, { useState } from "react";

// // // const PrescriptionUploader = () => {
// // //   const [image, setImage] = useState(null);
// // //   const [formData, setFormData] = useState(null);

// // //   const handleImageUpload = (e) => {
// // //     const file = e.target.files[0];
// // //     if (file) {
// // //       setImage(file);
// // //       uploadImage(file);
// // //     }
// // //   };

// // //   const uploadImage = async (file) => {
// // //     const data = new FormData();
// // //     data.append("image", file);

// // //     try {
// // //       const response = await fetch("http://localhost:5000/prescription/process", {
// // //         method: "POST",
// // //         body: data,
// // //       });

// // //       if (response.ok) {
// // //         const jsonResponse = await response.json();
// // //         setFormData(jsonResponse); // Store JSON response in state
// // //       } else {
// // //         console.error("Failed to upload image");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error uploading image:", error);
// // //     }
// // //   };

// // //   const handleInputChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setFormData((prev) => ({
// // //       ...prev,
// // //       [name]: value,
// // //     }));
// // //   };

// // //   return (
// // //     <div>
// // //       <h1>Upload Prescription</h1>
// // //       <input type="file" accept="image/*" onChange={handleImageUpload} />
// // //       {formData && (
// // //         <form>
// // //           {Object.keys(formData).map((key) => (
// // //             <div key={key}>
// // //               <label>{key}</label>
// // //               <input
// // //                 type="text"
// // //                 name={key}
// // //                 value={formData[key]}
// // //                 onChange={handleInputChange}
// // //               />
// // //             </div>
// // //           ))}
// // //         </form>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // export default PrescriptionUploader;




// // import React, { useState } from "react";

// // const PrescriptionUploader = () => {
// //   const [selectedImage, setSelectedImage] = useState(null);
// //   const [jsonData, setJsonData] = useState(null); // To store the JSON response

// //   const handleImageChange = (e) => {
// //     setSelectedImage(e.target.files[0]);
// //   };

// //   const handleImageUpload = async (e) => {
// //     e.preventDefault();

// //     if (!selectedImage) {
// //       alert("Please select an image before uploading.");
// //       return;
// //     }

// //     const formData = new FormData();
// //     formData.append("image", selectedImage);

// //     try {
// //       const response = await fetch("http://localhost:5000/prescription/process", {
// //         method: "POST",
// //         body: formData,
// //       });

// //       if (!response.ok) {
// //         throw new Error("Failed to upload image");
// //       }

// //       const data = await response.json();
// //       setJsonData(data); // Store JSON data to display
// //     } catch (error) {
// //       console.error("Error uploading image:", error);
// //     }
// //   };

// //   const renderField = (label, value) => (
// //     <div className="flex flex-col mb-4">
// //       <label className="text-sm font-medium mb-1">{label}</label>
// //       <input
// //         type="text"
// //         value={value || "N/A"}
// //         readOnly
// //         className="border p-2 rounded bg-white"
// //       />
// //     </div>
// //   );

// //   const renderList = (label, items, fields) => (
// //     <div className="mb-6">
// //       <h3 className="font-semibold text-lg mb-2">{label}</h3>
// //       {items.map((item, index) => (
// //         <div key={index} className="border p-3 rounded bg-gray-50 mb-4">
// //           {fields.map((field) =>
// //             renderField(field.label, item[field.key])
// //           )}
// //         </div>
// //       ))}
// //     </div>
// //   );

// //   return (
// //     <div className="p-4 max-w-3xl mx-auto">
// //       <h1 className="text-xl font-bold mb-4">Prescription Uploader</h1>

// //       {/* File Input */}
// //       <form onSubmit={handleImageUpload}>
// //         <input
// //           type="file"
// //           accept="image/*"
// //           onChange={handleImageChange}
// //           className="mb-4 border p-2 w-full"
// //         />
// //         <button
// //           type="submit"
// //           className="bg-blue-500 text-white px-4 py-2 rounded"
// //         >
// //           Upload Image
// //         </button>
// //       </form>

// //       {/* Render JSON Data */}
// //       {jsonData && (
// //         <div className="mt-6 border p-4 rounded bg-gray-50">
// //           <h2 className="text-lg font-semibold mb-4">Extracted Data</h2>

// //           {/* Image Data */}
// //           {jsonData.image_data && (
// //             <div className="mb-6">
// //               <h3 className="font-semibold text-lg mb-2">Image Data</h3>
// //               {renderField("Public ID", jsonData.image_data.public_id)}
// //               {renderField("URL", jsonData.image_data.url)}
// //             </div>
// //           )}

// //           {/* Prescription Data */}
// //           {jsonData.prescription_data && jsonData.prescription_data.data && (
// //             <>
// //               <h3 className="font-semibold text-lg mb-2">Prescription Details</h3>

// //               {/* Patient Info */}
// //               {jsonData.prescription_data.data.patient_info && (
// //                 <div className="mb-6">
// //                   <h3 className="font-semibold text-lg mb-2">Patient Info</h3>
// //                   {renderField("Name", jsonData.prescription_data.data.patient_info.name)}
// //                   {renderField("Age", jsonData.prescription_data.data.patient_info.age)}
// //                   {renderField("Gender", jsonData.prescription_data.data.patient_info.gender)}
// //                 </div>
// //               )}

// //               {/* Doctor Info */}
// //               {jsonData.prescription_data.data.doctor_info && (
// //                 <div className="mb-6">
// //                   <h3 className="font-semibold text-lg mb-2">Doctor Info</h3>
// //                   {renderField("Name", jsonData.prescription_data.data.doctor_info.name)}
// //                   {renderField("Specialization", jsonData.prescription_data.data.doctor_info.specialization)}
// //                   {renderField("License Number", jsonData.prescription_data.data.doctor_info.license_number)}
// //                   {renderField("Contact", jsonData.prescription_data.data.doctor_info.contact)}
// //                 </div>
// //               )}

// //               {/* Hospital Info */}
// //               {jsonData.prescription_data.data.hospital_info && (
// //                 <div className="mb-6">
// //                   <h3 className="font-semibold text-lg mb-2">Hospital Info</h3>
// //                   {renderField("Name", jsonData.prescription_data.data.hospital_info.name)}
// //                   {renderField("Address", jsonData.prescription_data.data.hospital_info.address)}
// //                   {renderField("Contact", jsonData.prescription_data.data.hospital_info.contact)}
// //                   {renderField("Registration", jsonData.prescription_data.data.hospital_info.registration)}
// //                 </div>
// //               )}

// //               {/* Medications */}
// //               {jsonData.prescription_data.data.medications && (
// //                 renderList(
// //                   "Medications",
// //                   jsonData.prescription_data.data.medications,
// //                   [
// //                     { key: "name", label: "Name" },
// //                     { key: "dosage", label: "Dosage" },
// //                     { key: "frequency", label: "Frequency" },
// //                     { key: "instructions", label: "Instructions" },
// //                   ]
// //                 )
// //               )}
// //             </>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default PrescriptionUploader;









// import React, { useState } from 'react';
// import axios from 'axios';

// const PrescriptionUploader = () => {
//   const [image, setImage] = useState(null);
//   const [formData, setFormData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!image) {
//       alert('Please upload a prescription image.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('prescription', image);

//     try {
//       setLoading(true);
//       const response = await axios.post('http://127.0.0.1:5000/prescription/process', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       setFormData(response.data);
//     } catch (error) {
//       console.error('Error uploading prescription:', error);
//       alert('Failed to process the prescription.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Prescription Upload</h1>

//       <div className="mb-4">
//         <input type="file" onChange={handleFileChange} />
//       </div>

//       <button
//         onClick={handleUpload}
//         disabled={loading}
//         className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
//       >
//         {loading ? 'Uploading...' : 'Upload Prescription'}
//       </button>

//       {formData && (
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold">Extracted Data</h2>
//           <form className="mt-4 space-y-4">
//             {Object.entries(formData).map(([key, value]) => (
//               <div key={key} className="flex flex-col">
//                 <label className="font-medium capitalize">{key}</label>
//                 <input
//                   type="text"
//                   name={key}
//                   value={value}
//                   onChange={handleChange}
//                   className="border rounded-md p-2"
//                 />
//               </div>
//             ))}
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PrescriptionUploader;






import React, { useState } from 'react';
import axios from 'axios';

const PrescriptionReader = () => {
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!image) {
      alert('Please upload a prescription image.');
      return;
    }

    const formData = new FormData();
    formData.append('prescription', image);

    try {
      setLoading(true);
      const response = await axios.post(
        'http://127.0.0.1:5000/prescription/process',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log('API Response:', response.data); // Debugging log
      setFormData(response.data);
    } catch (error) {
      console.error('Error uploading prescription:', error);
      alert('Failed to process the prescription.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prescription Upload</h1>

      <div className="mb-4">
        <input type="file" onChange={handleFileChange} />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Prescription'}
      </button>

      {formData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Extracted Data</h2>
          <form className="mt-4 space-y-4">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="font-medium capitalize">{key}</label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="border rounded-md p-2"
                />
              </div>
            ))}
          </form>
        </div>
      )}
    </div>
  );
};

export default PrescriptionReader;
