
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsersPage.css';

const UsersPage = () => {
  const [allUsers, setAllUsers] = useState([]); // Store all fetched users
  const [filteredUsers, setFilteredUsers] = useState([]); // Store filtered users for display
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // 'name' or 'phone'
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load
  const [updatingSpecial, setUpdatingSpecial] = useState(null); // Track user being updated
  // Update user's isSpecial status
  const updateSpecialStatus = async (userId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    setUpdatingSpecial(userId);
    try {
      const response = await fetch('https://sahbo-app-api.onrender.com/api/manager/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, isSpecial: newStatus })
      });
      if (response.ok) {
        // Update user in state
        setAllUsers(prev => prev.map(user => (user._id || user.id) === userId ? { ...user, isSpecial: newStatus } : user));
        setFilteredUsers(prev => prev.map(user => (user._id || user.id) === userId ? { ...user, isSpecial: newStatus } : user));
        alert('User special status updated!');
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Failed to update status: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Error updating special status.');
    } finally {
      setUpdatingSpecial(null);
    }
  };
  const navigate = useNavigate();

  const usersPerPage = 200;

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://sahbo-app-api.onrender.com/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userId })
      });

      if (response.ok) {
        alert('User deleted successfully!');
        // Remove the deleted user from both arrays
        setAllUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
        setFilteredUsers(prev => prev.filter(user => (user._id || user.id) !== userId));
        // Recalculate pagination
        const updatedFiltered = filteredUsers.filter(user => (user._id || user.id) !== userId);
        setTotalPages(Math.ceil(updatedFiltered.length / usersPerPage));
        // Adjust current page if necessary
        if (currentPage > Math.ceil(updatedFiltered.length / usersPerPage)) {
          setCurrentPage(Math.max(1, Math.ceil(updatedFiltered.length / usersPerPage)));
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.clear();
        navigate('/');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user. Please try again.');
    }
  };

  useEffect(() => {
    // Check for token on component mount
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    // Define fetchUsers function inside useEffect to avoid dependency issues
    const fetchUsersData = async () => {
      setLoading(true);
      try {
        const url = new URL('https://sahbo-app-api.onrender.com/api/manager/users-list');
        
        // Fetch users with limit of 200
        url.searchParams.append('page', 1);
        url.searchParams.append('limit', 200);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched users:', data);
          
          let users = [];
          // Handle different response structures
          if (Array.isArray(data)) {
            users = data;
          } else if (data.users && Array.isArray(data.users)) {
            users = data.users;
          } else if (data.data && Array.isArray(data.data)) {
            users = data.data;
          } else {
            users = data || [];
          }
          
          setAllUsers(users);
          setFilteredUsers(users); // Initially show all users
          setTotalPages(Math.ceil(users.length / usersPerPage));
          setIsInitialLoad(false); // Mark initial load as complete
        } else if (response.status === 401) {
          // Token expired or invalid
          localStorage.clear();
          navigate('/');
        } else {
          console.error('Failed to fetch users:', response.status);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsersData();
  }, [navigate]);

  // Trigger search when searchTerm or searchField changes (but not on initial load)
  useEffect(() => {
    // Only perform search if we have users loaded and it's not the initial load
    if (allUsers.length > 0 && !isInitialLoad) {
      // Define performSearch function inside useEffect to avoid dependency issues
      const doSearch = () => {
        if (!searchTerm.trim()) {
          setFilteredUsers(allUsers);
          setTotalPages(Math.ceil(allUsers.length / usersPerPage));
          setCurrentPage(1);
          return;
        }

        const filtered = allUsers.filter(user => {
          const searchValue = searchTerm.toLowerCase().trim();
          
          if (searchField === 'name') {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            return fullName.includes(searchValue) || 
                   (user.firstName || '').toLowerCase().includes(searchValue) ||
                   (user.lastName || '').toLowerCase().includes(searchValue);
          } else if (searchField === 'phone') {
            return (user.phoneNumber || '').toLowerCase().includes(searchValue);
          }
          
          return false;
        });

        setFilteredUsers(filtered);
        setTotalPages(Math.ceil(filtered.length / usersPerPage));
        setCurrentPage(1);
      };
      
      doSearch();
    }
  }, [searchTerm, searchField, allUsers, isInitialLoad]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Trigger search by updating searchTerm, which will trigger the useEffect
    setSearchTerm(searchTerm); // This will trigger the useEffect to perform search
  };

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
    const delta = 2; // Number of pages to show on each side of current page
    
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    
    return range;
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to home
        </button>
        <h1>Users Management</h1>
        
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <select 
              value={searchField} 
              onChange={(e) => setSearchField(e.target.value)}
              className="search-field-select"
            >
              <option value="name">Search by Name</option>
              <option value="phone">Search by Phone</option>
            </select>
            
            <input
              type="text"
              placeholder={`Enter ${searchField}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <button type="submit" className="search-button">
              Search
            </button>
            
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="clear-search-button"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <>
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Verified</th>
                  <th>Special</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const startIndex = (currentPage - 1) * usersPerPage;
                  const endIndex = startIndex + usersPerPage;
                  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
                  
                  return paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user._id || user.id}>
                        <td>{user._id || user.id}</td>
                        <td>{user.firstName + ' ' + user.lastName || '-'}</td>
                        <td>{user.phoneNumber || '-'}</td>
                        <td>
                          <span className={`status ${user.isVerified ? 'verified' : 'not-verified'}`}>
                            {user.isVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <span className={`status ${user.isSpecial ? 'special' : 'not-special'}`}>
                            {user.isSpecial ? 'True' : 'False'}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            onClick={() => deleteUser(user._id || user.id)}
                            className="delete-button"
                            title="Delete User"
                          >
                            🗑️ Delete
                          </button>
                          <button
                            onClick={() => updateSpecialStatus(user._id || user.id, !user.isSpecial)}
                            className="special-button"
                            disabled={updatingSpecial === (user._id || user.id)}
                            title={user.isSpecial ? 'Unset Special' : 'Set as Special'}
                          >
                            {updatingSpecial === (user._id || user.id) ? 'Updating...' : (user.isSpecial ? 'Unset Special' : 'Set Special')}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
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
    </div>
  );
};

export default UsersPage;
