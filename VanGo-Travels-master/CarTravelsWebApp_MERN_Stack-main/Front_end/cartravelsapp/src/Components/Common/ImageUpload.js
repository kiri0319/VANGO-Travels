import React, { useState, useRef } from 'react';
import { Form, Button, Image, Alert } from 'react-bootstrap';
import './ImageUpload.css';

const ImageUpload = ({ 
  onImageChange, 
  currentImageUrl = '', 
  label = 'Upload Image',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  required = false,
  preview = true
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');
    
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(currentImageUrl);
      onImageChange(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Notify parent component
    onImageChange(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageChange(null);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <Form.Group className="mb-3">
        <Form.Label>
          {label}
          {required && <span className="text-danger"> *</span>}
        </Form.Label>
        
        <div className="d-flex flex-column gap-2">
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              onClick={handleButtonClick}
              className="flex-shrink-0"
            >
              {selectedFile ? 'Change Image' : 'Select Image'}
            </Button>
            
            {selectedFile && (
              <Button 
                variant="outline-danger" 
                onClick={handleRemoveImage}
                size="sm"
              >
                Remove
              </Button>
            )}
          </div>

          <Form.Control
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {error && (
            <Alert variant="danger" className="py-2 mb-0">
              <small>{error}</small>
            </Alert>
          )}

          {preview && previewUrl && (
            <div className="image-preview-container">
              <Image
                src={previewUrl}
                alt="Preview"
                className="img-thumbnail"
                style={{ 
                  maxWidth: '200px', 
                  maxHeight: '150px',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="mt-1">
                <small className="text-muted">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Current image'}
                </small>
              </div>
            </div>
          )}
        </div>
      </Form.Group>
    </div>
  );
};

export default ImageUpload;
