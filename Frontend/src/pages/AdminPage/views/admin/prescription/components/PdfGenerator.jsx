import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePrescriptionPDF = (prescriptionData) => {
  try {
    // Create a new document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const brandColor = [20, 184, 166]; // RGB for brand-500 (teal)
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(...brandColor);
    doc.text("Prescription Details", pageWidth / 2, 20, { align: 'center' });
    
    // Add prescription ID and date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Prescription ID: ${prescriptionData._id || 'N/A'}`, 14, 30);
    doc.text(`Date: ${prescriptionData.prescription_details?.date || 'N/A'}`, 14, 36);
    
    // Add prescription image on the first page if available
    if (prescriptionData.image_data?.url) {
      try {
        // Add a new page for the image
        doc.addImage(prescriptionData.image_data.url, 'JPEG', 15, 45, 180, 220);
        doc.addPage();
      } catch (error) {
        console.error("Error adding image to PDF:", error);
        
        // Add placeholder text if image fails to load
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("(Image could not be loaded)", pageWidth / 2, 100, { align: 'center' });
        doc.addPage();
      }
    }
    
    // Add prescription content to the second page
    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    
    // Add Hospital Information
    if (prescriptionData.hospital_info) {
      doc.text("Hospital Information", 14, 20);
      const hospitalData = [];
      Object.entries(prescriptionData.hospital_info).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        hospitalData.push([formattedKey, value || 'Not specified']);
      });
      
      doc.autoTable({
        startY: 25,
        head: [['Field', 'Value']],
        body: hospitalData,
        theme: 'grid',
        headStyles: { fillColor: brandColor, textColor: [255, 255, 255] },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      });
    }
    
    // Add Doctor Information
    if (prescriptionData.doctor_info) {
      const lastY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 25;
      doc.text("Doctor Information", 14, lastY);
      const doctorData = [];
      Object.entries(prescriptionData.doctor_info).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        doctorData.push([formattedKey, value || 'Not specified']);
      });
      
      doc.autoTable({
        startY: lastY + 5,
        head: [['Field', 'Value']],
        body: doctorData,
        theme: 'grid',
        headStyles: { fillColor: brandColor, textColor: [255, 255, 255] },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      });
    }
    
    // Add Patient Information
    if (prescriptionData.patient_info) {
      const lastY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 25;
      doc.text("Patient Information", 14, lastY);
      const patientData = [];
      Object.entries(prescriptionData.patient_info).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        patientData.push([formattedKey, value || 'Not specified']);
      });
      
      doc.autoTable({
        startY: lastY + 5,
        head: [['Field', 'Value']],
        body: patientData,
        theme: 'grid',
        headStyles: { fillColor: brandColor, textColor: [255, 255, 255] },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      });
    }
    
    // Add a new page if needed
    if (doc.previousAutoTable && doc.previousAutoTable.finalY > 240) {
      doc.addPage();
    }
    
    // Add Medications
    if (prescriptionData.medications && prescriptionData.medications.length > 0) {
      const lastY = doc.previousAutoTable ? (doc.previousAutoTable.finalY > 240 ? 20 : doc.previousAutoTable.finalY + 10) : 25;
      doc.text("Medications", 14, lastY);
      
      const medicationsData = [];
      prescriptionData.medications.forEach((med, index) => {
        medicationsData.push([
          index + 1,
          med.name || 'Not specified',
          med.dosage || 'Not specified',
          med.frequency || 'Not specified',
          med.duration || 'Not specified',
          med.instructions || 'Not specified'
        ]);
      });
      
      doc.autoTable({
        startY: lastY + 5,
        head: [['#', 'Name', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
        body: medicationsData,
        theme: 'grid',
        headStyles: { fillColor: brandColor, textColor: [255, 255, 255] },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: 10 } },
      });
    }
    
    // Add Additional Notes
    if (prescriptionData.additional_notes) {
      // Add a new page if needed
      if (doc.previousAutoTable && doc.previousAutoTable.finalY > 240) {
        doc.addPage();
      }
      
      const lastY = doc.previousAutoTable ? (doc.previousAutoTable.finalY > 240 ? 20 : doc.previousAutoTable.finalY + 10) : 25;
      doc.text("Additional Notes", 14, lastY);
      const notesData = [];
      Object.entries(prescriptionData.additional_notes).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
        notesData.push([formattedKey, value || 'Not specified']);
      });
      
      doc.autoTable({
        startY: lastY + 5,
        head: [['Field', 'Value']],
        body: notesData,
        theme: 'grid',
        headStyles: { fillColor: brandColor, textColor: [255, 255, 255] },
        styles: { overflow: 'linebreak' },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      });
    }
    
    // Save PDF
    const date = new Date().toISOString().slice(0, 10);
    doc.save(`prescription-${date}.pdf`);
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF");
  }
};
