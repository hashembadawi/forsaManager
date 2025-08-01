import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotApprovedAds.css';

const NotApprovedAds = () => {
  const [allAds, setAllAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAd, setSelectedAd] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  const adsPerPage = 18; // 18 cards per page (3 rows × 6 cards per row)

  const fetchNotApprovedAds = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://sahbo-app-api.onrender.com/api/manager/notApproved-ads', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched not approved ads:', data);
        
        let ads = [];
        // Handle different response structures
        if (Array.isArray(data)) {
          ads = data;
        } else if (data.ads && Array.isArray(data.ads)) {
          ads = data.ads;
        } else if (data.data && Array.isArray(data.data)) {
          ads = data.data;
        } else {
          ads = data || [];
        }
        
        setAllAds(ads);
        setTotalPages(Math.ceil(ads.length / adsPerPage));
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        console.error('Failed to fetch not approved ads:', response.status);
      }
    } catch (error) {
      console.error('Error fetching not approved ads:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const approveAd = async (adId) => {
    if (!window.confirm('Are you sure you want to approve this advertisement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://sahbo-app-api.onrender.com/api/manager/approve-ad/${adId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Advertisement approved successfully!');
        // Remove the approved ad from the array
        setAllAds(prev => prev.filter(ad => ad._id !== adId));
        // Recalculate pagination
        const updatedAds = allAds.filter(ad => ad._id !== adId);
        setTotalPages(Math.ceil(updatedAds.length / adsPerPage));
        // Adjust current page if necessary
        if (currentPage > Math.ceil(updatedAds.length / adsPerPage)) {
          setCurrentPage(Math.max(1, Math.ceil(updatedAds.length / adsPerPage)));
        }
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Failed to approve ad: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving ad:', error);
      alert('An error occurred while approving the ad. Please try again.');
    }
  };

  const rejectAd = async (adId) => {
    if (!window.confirm('Are you sure you want to reject this advertisement? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://sahbo-app-api.onrender.com/api/manager/reject-ad/${adId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Advertisement rejected successfully!');
        // Remove the rejected ad from the array
        setAllAds(prev => prev.filter(ad => ad._id !== adId));
        // Recalculate pagination
        const updatedAds = allAds.filter(ad => ad._id !== adId);
        setTotalPages(Math.ceil(updatedAds.length / adsPerPage));
        // Adjust current page if necessary
        if (currentPage > Math.ceil(updatedAds.length / adsPerPage)) {
          setCurrentPage(Math.max(1, Math.ceil(updatedAds.length / adsPerPage)));
        }
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Failed to reject ad: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error rejecting ad:', error);
      alert('An error occurred while rejecting the ad. Please try again.');
    }
  };

  const convertBase64ToImage = (base64String) => {
    if (!base64String) return null;
    // If it's already a data URL, return as is
    if (base64String.startsWith('data:')) return base64String;
    // Otherwise, add the data URL prefix
    return `data:image/jpeg;base64,${base64String}`;
  };

  const openDialog = (ad) => {
    setSelectedAd(ad);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setSelectedAd(null);
  };

  const getAllAdImages = (ad) => {
    const images = [];
    for (let i = 1; i <= 6; i++) {
      const picKey = `pic${i}`;
      if (ad[picKey]) {
        images.push(convertBase64ToImage(ad[picKey]));
      } else {
        images.push(null);
      }
    }
    return images;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    fetchNotApprovedAds();
  }, [navigate, fetchNotApprovedAds]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/home');
  };

  const getPaginationRange = () => {
    const range = [];
    const delta = 2;
    
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    
    return range;
  };

  return (
    <div className="ads-page">
      <div className="ads-header">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to home
        </button>
        <h1>Not Approved Advertisements</h1>
      </div>

      {loading ? (
        <div className="loading">Loading advertisements...</div>
      ) : (
        <>
          <div className="ads-grid">
            {(() => {
              const startIndex = (currentPage - 1) * adsPerPage;
              const endIndex = startIndex + adsPerPage;
              const paginatedAds = allAds.slice(startIndex, endIndex);
              
              return paginatedAds.length > 0 ? (
                paginatedAds.map((ad) => (
                  <div key={ad._id} className="ad-card" onClick={() => openDialog(ad)}>
                    <div className="ad-image">
                      {ad.pic1 ? (
                        <img 
                          src={convertBase64ToImage(ad.pic1)} 
                          alt={ad.adTitle}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="no-image" style={{display: ad.pic1 ? 'none' : 'flex'}}>
                        📷 No Image
                      </div>
                    </div>
                    
                    <div className="ad-content">
                      <h3 className="ad-title">{ad.adTitle}</h3>
                      <p className="ad-price">{ad.price} {ad.currencyName}</p>
                      
                      <div className="ad-details">
                        <p><strong>User:</strong> {ad.userName}</p>
                        <p><strong>Phone:</strong> {ad.userPhone}</p>
                        <p><strong>Category:</strong> {ad.categoryName}</p>
                        <p><strong>Sub-Category:</strong> {ad.subCategoryName}</p>
                        <p><strong>Location:</strong> {ad.cityName}, {ad.regionName}</p>
                        <p><strong>Description:</strong> {ad.description}</p>
                        <p><strong>Posted:</strong> {new Date(ad.createDate).toLocaleDateString()}</p>
                      </div>
                      
                      <div className="ad-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            approveAd(ad._id);
                          }}
                          className="approve-button"
                          title="Approve Advertisement"
                        >
                          ✅ Approve
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            rejectAd(ad._id);
                          }}
                          className="reject-button"
                          title="Reject Advertisement"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  No not approved advertisements found.
                </div>
              );
            })()}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                First
              </button>
              
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>

              {getPaginationRange().map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
              
              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Last
              </button>

              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </>
      )}

      {/* Image Dialog */}
      {showDialog && selectedAd && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h2>{selectedAd.adTitle}</h2>
              <button className="close-button" onClick={closeDialog}>×</button>
            </div>
            
            <div className="dialog-body">
              <div className="ad-info">
                <p><strong>Price:</strong> {selectedAd.price} {selectedAd.currencyName}</p>
                <p><strong>User:</strong> {selectedAd.userName}</p>
                <p><strong>Phone:</strong> {selectedAd.userPhone}</p>
                <p><strong>Location:</strong> {selectedAd.cityName}, {selectedAd.regionName}</p>
              </div>
              
              <div className="images-grid">
                {getAllAdImages(selectedAd).map((image, index) => (
                  <div key={index} className="image-slot">
                    {image ? (
                      <img 
                        src={image} 
                        alt={`${selectedAd.adTitle} - Image ${index + 1}`}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="no-image-slot" style={{display: image ? 'none' : 'flex'}}>
                      📷 No Image
                    </div>
                    <span className="image-number">{index + 1}</span>
                  </div>
                ))}
              </div>
              
              <div className="dialog-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    approveAd(selectedAd._id);
                    closeDialog();
                  }}
                  className="approve-button dialog-approve"
                >
                  ✅ Approve Advertisement
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    rejectAd(selectedAd._id);
                    closeDialog();
                  }}
                  className="reject-button dialog-reject"
                >
                  ❌ Reject Advertisement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotApprovedAds;
