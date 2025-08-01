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
        <h1>Syria Market Manager</h1>
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
              </li>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'advertisements' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('advertisements')}
                >
                  <span className="nav-icon">📢</span>
                  Advertisements
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'sales' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('sales')}
                >
                  <span className="nav-icon">💰</span>
                  Sales
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`}
                  onClick={() => handleSectionChange('customers')}
                >
                  <span className="nav-icon">👥</span>
                  Customers
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
                <h2>Welcome to Syria Market Manager</h2>
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
            
            {activeSection === 'advertisements' && (
              <div className="section-content">
                <div className="dashboard-card">
                  <h3>📢 Ad Management</h3>
                  <p>Create, edit, and manage your advertisement campaigns</p>
                </div>
                <div className="dashboard-card">
                  <h3>📊 Ad Performance</h3>
                  <p>Monitor advertisement performance and analytics</p>
                </div>
                <div className="dashboard-card">
                  <h3>🎯 Target Audience</h3>
                  <p>Manage target audiences and demographic settings</p>
                </div>
              </div>
            )}
            
            {activeSection === 'sales' && (
              <div className="section-content">
                <div className="dashboard-card">
                  <h3>💰 Sales Overview</h3>
                  <p>View daily, weekly, and monthly sales summaries</p>
                </div>
                <div className="dashboard-card">
                  <h3>🧾 Transactions</h3>
                  <p>Manage and track all sales transactions</p>
                </div>
                <div className="dashboard-card">
                  <h3>📈 Sales Analytics</h3>
                  <p>Analyze sales trends and performance</p>
                </div>
              </div>
            )}
            
            {activeSection === 'customers' && (
              <div className="section-content">
                <div className="dashboard-card">
                  <h3>👥 Customer Database</h3>
                  <p>Manage customer information and profiles</p>
                </div>
                <div className="dashboard-card">
                  <h3>🎯 Customer Insights</h3>
                  <p>View customer behavior and purchase history</p>
                </div>
                <div className="dashboard-card">
                  <h3>📞 Customer Support</h3>
                  <p>Handle customer inquiries and support tickets</p>
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
