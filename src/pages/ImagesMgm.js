
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ImagesMgm.css';

const ImagesMgm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);


  const [images, setImages] = useState([]); // Array of image URLs/base64
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleBackToDashboard = () => {
    navigate('/home');
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1]; // Remove data:image/*;base64,
      setUploading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:10000/api/manager/images-mgm', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: base64 })
        });
        if (response.ok) {
          alert('Image uploaded successfully!');
          // Optionally add image to grid
          setImages(prev => [...prev, reader.result]);
        } else {
          alert('Failed to upload image.');
        }
      } catch (err) {
        alert('Error uploading image.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="images-mgm-container">
      <div className="images-header">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to home
        </button>
        <h1>Images Manager</h1>
      </div>
      <h3>Welcome to Images Manager</h3>
      <div className="images-grid">
        {images.length === 0 ? (
          <div className="no-images">No images uploaded yet.</div>
        ) : (
          <div className="grid-wrapper">
            {images.map((img, idx) => (
              <div className="image-cell" key={idx}>
                <img src={img} alt={`img-${idx}`} />
              </div>
            ))}
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="upload-section">
        <button className="upload-btn" onClick={openFileDialog} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
    </div>
  );
};

export default ImagesMgm;
