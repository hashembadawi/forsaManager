import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [activeSection, setActiveSection] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://sahbo-app-api.onrender.com/api/manager/dashboard-data', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === 'dashboard') {
      fetchDashboardData();
    }
  };

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
        <h1>Forsa Manager</h1>
        <div className="header-user-section">
          <span className="username">{userInfo.name}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>
      
      <div className="main-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('dashboard')}
                >
                  <span className="nav-icon">📊</span>
                  Dashboard
                </button>
                <button 
                  className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('settings')}
                >
                  <span className="nav-icon">⚙️</span>
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="home-content">
          <div className="content-header">
            <h2>{activeSection ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Home'}</h2>
          </div>
          <div className="content-body">
            {!activeSection && (
              <div className="welcome-content">
                <h2>Welcome to Forsa Manager</h2>
              </div>
            )}
            
            {activeSection === 'dashboard' && (
              <div className="dashboard-content">
                {loading ? (
                  <div className="loading">Loading dashboard data...</div>
                ) : (
                  <div className="dashboard-grid">
                    <div 
                      className="dashboard-card clickable" 
                      onClick={() => navigate('/users')}
                    >
                      <h3>👥 Users Count</h3>
                      <p className="dashboard-number">{dashboardData ? dashboardData.userCount : '-'}</p>
                      <p>Total number of registered users in the system</p>
                    </div>
                    <div 
                      className="dashboard-card clickable" 
                      onClick={() => navigate('/not-approved-ads')}
                    >
                      <h3>❌ NotApproved Ads</h3>
                      <p className="dashboard-number">{dashboardData ? dashboardData.notApprovedAdsCount : '-'}</p>
                      <p>Advertisements waiting for approval</p>
                    </div>
                    <div className="dashboard-card">
                      <h3>✅ Approved Ads</h3>
                      <p className="dashboard-number">{dashboardData ? dashboardData.approvedAdsCount : '-'}</p>
                      <p>All approved advertisements</p>
                    </div>
                  </div>
                )}
              </div>
            )}
              {activeSection === 'settings' && (
                <div className="settings-content">
                  <div className="dashboard-card clickable" onClick={() => navigate('/images-mgm')}>
                    <h3>🖼️ Application Images</h3>
                    <p>Update and manage application images</p>
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
