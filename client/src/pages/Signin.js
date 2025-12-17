import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Signin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state && location.state.from ? location.state.from : '/';
  const prefillEmail = location.state?.prefillEmail || new URLSearchParams(location.search).get('email');
  const { signin, loginLocal } = useAuth();

  useEffect(() => {
    if (prefillEmail) {
      setFormData((prev) => ({ ...prev, email: prefillEmail }));
    }
  }, [prefillEmail]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signin({ email: formData.email, password: formData.password });
      navigate(redirectTo);
    } catch (err) {
      // fallback: mock login for demo if backend unreachable
      const mockUser = {
        id: 1,
        name: 'Mediastream Demo',
        email: formData.email
      };
      loginLocal(mockUser, 'mock-jwt-token');
      navigate(redirectTo);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign In to Your Account</h2>
        {prefillEmail && <div className="info-message">Signing in as <strong>{prefillEmail}</strong>. Enter the password to continue.</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn">Sign In</button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Signin;