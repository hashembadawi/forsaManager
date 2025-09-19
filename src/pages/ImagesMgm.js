import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ImagesMgm.css';

const ImagesMgm = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]); // Array of image URLs/base64
  const [imageObjs, setImageObjs] = useState([]); // Array of image objects with _id and content
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    // Fetch stored images on mount
    fetch('https://sahbo-app-api.onrender.com/api/manager/images-mgm', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(data => {
        // Store both image objects and src strings
        if (Array.isArray(data)) {
          setImageObjs(data);
          const imgSrcs = data.map(item => `data:image/*;base64,${item.content}`);
          setImages(imgSrcs);
        } else {
          setImageObjs([]);
          setImages([]);
        }
      })
      .catch(() => {
        setImageObjs([]);
        setImages([]);
      });
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/home');
  };

  // Handle file selection and upload
  const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Resize image to 200x300 px before upload
  const resizeImage = (base64Str, width = 200, height = 300) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // JPEG, quality 0.8
      };
      img.src = base64Str;
    });
  };

  const reader = new FileReader();
  reader.onloadend = async () => {
    const originalBase64 = reader.result;
    const resizedBase64 = await resizeImage(originalBase64, 200, 300);
    const base64 = resizedBase64.split(',')[1]; // Remove data:image/jpeg;base64,
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://sahbo-app-api.onrender.com/api/manager/images-mgm', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: base64 })
      });
      if (res.ok) {
        const newData = await res.json();
        if (newData && newData._id && newData.content) {
          setImageObjs(prev => [...prev, newData]);
          setImages(prev => [...prev, `data:image/*;base64,${newData.content}`]);
        } else {
          setImages(prev => [...prev, `data:image/*;base64,${base64}`]);
        }
      }
    } catch (err) {
      // Handle error
    } finally {
      setUploading(false);
    }
  };
  reader.readAsDataURL(file);
};

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Delete image by _id
  const handleDeleteImage = async (idx) => {
    const token = localStorage.getItem('token');
    const imageObj = imageObjs[idx];
    if (!imageObj || !imageObj._id) return;
    try {
      const res = await fetch(`https://sahbo-app-api.onrender.com/api/manager/images-mgm/${imageObj._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        // Remove image from state
        setImages(prev => prev.filter((_, i) => i !== idx));
        setImageObjs(prev => prev.filter((_, i) => i !== idx));
      }
    } catch (err) {
      // Handle error
    }
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
              <div className="image-cell" key={idx} style={{ position: 'relative', width: 200, height: 200 }}>
                <img
                  src={img.startsWith('data:') ? img : `data:image/*;base64,${img}`}
                  alt={`img-${idx}`}
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
                <button
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(255,0,0,0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  onClick={() => handleDeleteImage(idx)}
                >
                  Delete
                </button>
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