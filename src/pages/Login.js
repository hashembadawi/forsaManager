import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!phoneNumber || !password) {
      setError('Please enter both phone number and password');
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        phoneNumber: phoneNumber,
        password: password,
      };

      const response = await fetch('https://sahbo-app-api.onrender.com/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // Check if user is admin before storing data and navigating
        if (data.userIsAdmin) {
          // Store user data in localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('userName', data.userName);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('userPhone', data.userPhone);
          localStorage.setItem('userProfileImage', data.userProfileImage || '');
          localStorage.setItem('userAccountNumber', data.userAccountNumber || '');
          localStorage.setItem('userIsVerified', data.userIsVerified);
          localStorage.setItem('userIsAdmin', data.userIsAdmin);
          
          // Navigate to home page
          navigate('/home');
        } else {
          setError('You do not have admin access to this application.');
        }
      } else {
        setError(data.message || 'Invalid phone number or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forsa Manager</h2>
        <p>sign in to your account</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number (e.g., 963xxxxxxxxx)"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
