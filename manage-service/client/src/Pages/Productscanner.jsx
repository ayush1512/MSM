import React, { useState, useCallback } from 'react';
import { Upload, X, ImagePlus, Check, Sun, Moon } from 'lucide-react';

const getThemeStyles = (isDarkMode) => ({
  container: {
    minHeight: '100vh',
    backgroundColor: isDarkMode ? '#111827' : '#f9fafb',
    padding: '2rem',
    transition: 'background-color 0.3s ease'
  },
  wrapper: {
    maxWidth: '42rem',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  themeToggle: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: isDarkMode ? '#e5e7eb' : '#4b5563',
    transition: 'color 0.3s ease'
  },
  card: {
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    borderRadius: '0.5rem',
    boxShadow: isDarkMode 
      ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)' 
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    padding: '1.5rem',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: isDarkMode ? '#e5e7eb' : '#1f2937',
    transition: 'color 0.3s ease'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  dropzone: {
    position: 'relative',
    border: `2px dashed ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '0.5rem',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    backgroundColor: isDarkMode ? '#374151' : 'white'
  },
  dropzoneDragging: {
    borderColor: '#3b82f6',
    backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff'
  },
  dropzoneHasFile: {
    backgroundColor: isDarkMode ? '#374151' : '#f9fafb'
  },
  fileInput: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer'
  },
  uploadIcon: {
    margin: '0 auto',
    color: isDarkMode ? '#9ca3af' : '#6b7280',
    marginBottom: '1rem'
  },
  dropzoneText: {
    color: isDarkMode ? '#e5e7eb' : '#4b5563',
    marginBottom: '0.5rem'
  },
  dropzoneSubtext: {
    fontSize: '0.875rem',
    color: isDarkMode ? '#9ca3af' : '#6b7280'
  },
  previewContainer: {
    position: 'relative',
    maxWidth: '20rem',
    margin: '0 auto'
  },
  previewImage: {
    borderRadius: '0.5rem',
    maxHeight: '12rem',
    margin: '0 auto'
  },
  removeButton: {
    position: 'absolute',
    top: '-0.5rem',
    right: '-0.5rem',
    padding: '0.25rem',
    backgroundColor: '#ef4444',
    borderRadius: '9999px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#dc2626'
    }
  },
  submitButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    color: 'white',
    fontWeight: '500',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  },
  submitButtonEnabled: {
    backgroundColor: '#2563eb',
    ':hover': {
      backgroundColor: '#1d4ed8'
    }
  },
  submitButtonDisabled: {
    backgroundColor: isDarkMode ? '#4b5563' : '#9ca3af',
    cursor: 'not-allowed'
  },
  loadingSpinner: {
    width: '1.25rem',
    height: '1.25rem',
    border: '2px solid white',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  responseContainer: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
    borderRadius: '0.5rem',
    transition: 'background-color 0.3s ease'
  },
  responseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  responseTitle: {
    fontWeight: '500',
    color: isDarkMode ? '#e5e7eb' : '#1f2937'
  },
  responsePre: {
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    padding: '1rem',
    borderRadius: '0.375rem',
    border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    fontSize: '0.875rem',
    overflowX: 'auto',
    color: isDarkMode ? '#e5e7eb' : '#1f2937',
    transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
  }
});

const ProductScanner = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const styles = getThemeStyles(isDarkMode);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h2 style={styles.title}>Product Scanner</h2>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div style={styles.card}>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                ...styles.dropzone,
                ...(isDragging && styles.dropzoneDragging),
                ...(file && styles.dropzoneHasFile)
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                style={styles.fileInput}
              />
              
              {!file ? (
                <div>
                  <Upload style={styles.uploadIcon} size={48} />
                  <p style={styles.dropzoneText}>
                    Drag and drop your image here, or click to browse
                  </p>
                  <p style={styles.dropzoneSubtext}>
                    Supports: JPG, PNG, GIF
                  </p>
                </div>
              ) : (
                <div style={styles.previewContainer}>
                  {preview && (
                    <>
                      <img src={preview} alt="Preview" style={styles.previewImage} />
                      <button
                        type="button"
                        onClick={removeFile}
                        style={styles.removeButton}
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!file || isLoading}
              style={{
                ...styles.submitButton,
                ...(file && !isLoading ? styles.submitButtonEnabled : styles.submitButtonDisabled)
              }}
            >
              {isLoading ? (
                <div style={styles.loadingSpinner} />
              ) : (
                <>
                  <ImagePlus size={20} />
                  <span>Scan Product</span>
                </>
              )}
            </button>
          </form>

          {response && (
            <div style={styles.responseContainer}>
              <div style={styles.responseHeader}>
                <Check size={20} color="#22c55e" />
                <h3 style={styles.responseTitle}>Scan Results:</h3>
              </div>
              <pre style={styles.responsePre}>
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductScanner;