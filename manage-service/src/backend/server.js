import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 5000;

// To get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store uploaded files outside the backend folder
const uploadPath = path.join(__dirname, '..', 'uploads');

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save files in the uploads folder outside backend
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// POST route to process the prescription image
app.post('/prescription/process', upload.single('prescription'), (req, res) => {
  try {
    console.log('Uploaded File:', req.file); // Debugging log

    // Simulated JSON data extraction
    const extractedData = {
      patientName: 'John Doe',
      age: '30',
      prescribedMedicines: 'Paracetamol, Vitamin C',
      doctorName: 'Dr. Smith',
    };

    console.log('Generated Data:', extractedData); // Debugging log
    res.json(extractedData);
  } catch (error) {
    console.error('Error processing prescription:', error);
    res.status(500).json({ error: 'Failed to process prescription.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
