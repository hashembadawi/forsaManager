import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');
    const userIsVerified = localStorage.getItem('userIsVerified');
    const userIsAdmin = localStorage.getItem('userIsAdmin');
    
    if (token && userName) {
      setUserInfo({
        name: userName,
        phone: userPhone,
        isVerified: userIsVerified === 'true',
        isAdmin: userIsAdmin === 'true'
      });
    } else {
      // If no token found, redirect to login
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userProfileImage');
    localStorage.removeItem('userAccountNumber');
    localStorage.removeItem('userIsVerified');
    localStorage.removeItem('userIsAdmin');
    
    // Navigate back to login
    navigate('/');
  };

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Syria Market Manager</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="home-content">
        <div className="welcome-section">
          <div className="welcome-card">
            <h2>Welcome, {userInfo.name}!</h2>
            <div className="user-info">
              <p><strong>Email:</strong> {userInfo.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> {userInfo.phone}</p>
              <p><strong>Status:</strong> 
                <span className={`status ${userInfo.isVerified ? 'verified' : 'unverified'}`}>
                  {userInfo.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </p>
              {userInfo.isAdmin && (
                <p><strong>Role:</strong> <span className="admin-badge">Administrator</span></p>
              )}
            </div>
            <p className="welcome-message">You have successfully logged into the Syria Market Manager system.</p>
            <p>Here you can manage your market operations, track inventory, and monitor sales.</p>
          </div>
          
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>📊 Dashboard</h3>
              <p>View your sales analytics and performance metrics</p>
            </div>
            
            <div className="dashboard-card">
              <h3>📦 Inventory</h3>
              <p>Manage your product inventory and stock levels</p>
            </div>
            
            <div className="dashboard-card">
              <h3>💰 Sales</h3>
              <p>Track daily sales and revenue reports</p>
            </div>
            
            <div className="dashboard-card">
              <h3>👥 Customers</h3>
              <p>Manage customer information and relationships</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
