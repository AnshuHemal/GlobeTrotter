import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Globe, Mail, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Check for token in URL and auto-login if present
  useEffect(() => {
    const token = searchParams.get('token');
    const verified = searchParams.get('verified');
    
    if (token) {
      // Remove token from URL without page reload
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Auto-login with token
      const autoLogin = async () => {
        try {
          setLoading(true);
          setError('');
          
          // Store token in local storage
          localStorage.setItem('token', token);
          
          // Get user profile using the token
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            // Update auth context
            login(formData.email, formData.password, token);
            
            // Show success message if coming from verification
            if (verified === 'true') {
              setSuccess('Email verified successfully! Redirecting to dashboard...');
            }
            
            // Redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            throw new Error('Invalid token');
          }
        } catch (err) {
          console.error('Auto-login error:', err);
          setError('Invalid or expired verification link. Please log in manually.');
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      };
      
      autoLogin();
    } else if (searchParams.get('error') === 'invalid_token') {
      setError('Invalid or expired verification link. Please request a new one.');
    } else if (searchParams.get('error') === 'verification_failed') {
      setError('Email verification failed. Please try again or request a new verification email.');
    }
  }, [searchParams, navigate, login]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.redirectTo) {
        // Redirect to OTP verification page if email needs verification
        navigate(result.redirectTo);
        return;
      }
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <Globe className="brand-icon" />
            <h1>GlobeTrotter</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your travel planning journey</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              <CheckCircle size={18} style={{ marginRight: '8px' }} />
              {success}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={18} />
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className="form-actions">
            <div className="remember-me">
              <input type="checkbox" id="remember" name="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="text-link">
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="text-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
