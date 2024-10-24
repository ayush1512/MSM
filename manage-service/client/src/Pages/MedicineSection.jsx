// MedicinesPage.jsx
import React from 'react';
import "./MedicineSection.css"

const medicines = [
  { name: 'Paracetamol', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Ibuprofen', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Paracetamol', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Aspirin', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Amoxicillin', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Ibuprofen', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Aspirin', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s' },
  { name: 'Amoxicillin', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7i6ON3WuqX8Ed7OhieUzXLnBOLl3_sVSoGQ&s'},
];

const MedicinesPage = () => {
  return (
    <div className="medicine-container">
      {medicines.map((medicine, index) => (
        <><div className="medicine-item" key={index}>
              <img src={medicine.image} alt={medicine.name} className="medicine-image" />
              <p className="medicine-name">{medicine.name}</p>
          </div><div className="medicine-item" key={index}>
                  <img src={medicine.image} alt={medicine.name} className="medicine-image" />
                  <p className="medicine-name">{medicine.name}</p>
              </div></>
      
      ))}
      <br></br>
    <div>
    <a href="/services">
    <button className="btn secondary-btn">know more</button>
</a>
</div>
</div>
    
  );
};

export default MedicinesPage;
