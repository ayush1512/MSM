# Bill Scanner

A web application that converts PDF bills into images, extracts text using AI, and processes the data into meaningful structured information.

## Features

- PDF to image conversion
- Image text extraction with Together AI's Vision model
- Structured data extraction from bill text
- Database storage of processed bills
- Web interface for uploading and viewing bills

## Requirements

- Python 3.8+
- MongoDB
- Cloudinary account
- Together AI API key

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/BillScanner.git
cd BillScanner
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. PDF Processing Options

The application offers two methods for PDF processing:

#### Option A: pdf2image with Poppler (recommended for better quality)

This method requires the Poppler PDF rendering library:

**Windows:**
1. Download the latest Poppler release from [here](http://blog.alivate.com.au/poppler-windows/)
2. Extract the downloaded file to a folder (e.g., `C:\Program Files\poppler`)
3. Add the `bin` folder to your PATH environment variable

**macOS:**
```bash
brew install poppler
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils

# Fedora
sudo dnf install poppler-utils

# Arch
sudo pacman -S poppler
```

#### Option B: PyMuPDF (easier setup)

PyMuPDF is already included in the requirements.txt and doesn't need external dependencies.

### 4. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
TOGETHER_API_KEY=your_together_ai_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
MONGODB_URI=your_mongodb_connection_string
```

## Running the Application

```bash
python app.py
```

The application will be available at http://localhost:5000

## Customizing Prompts

You can customize the AI prompts by modifying the following variables in the `ImageProcessor` class:

- `text_extraction_prompt`: Used for extracting text from bill images
- `data_processing_prompt`: Used for processing extracted text into structured data

## Troubleshooting

### PDF Processing Issues

If you encounter errors when uploading PDF files:

1. Check the `/status` endpoint to verify which PDF processing methods are available
2. If neither method is available:
   - For pdf2image: Ensure Poppler is correctly installed and in your PATH
   - For PyMuPDF: Try reinstalling with `pip install pymupdf`

### API Connection Issues

If you have issues connecting to Together AI or Cloudinary:
- Verify your API keys are correctly set in the `.env` file
- Check your network connectivity and firewall settings