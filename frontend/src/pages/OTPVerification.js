import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './OTPVerification.css';

const OTPVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState({ text: '', isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState(1); // 1: Email input, 2: OTP input
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOtp } = useAuth();
  
  // Check if email is passed from previous page (e.g., signup)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setStep(2); // Skip to OTP step if email is provided
      startCountdown();
    }
  }, [location]);
  
  const startCountdown = () => {
    setCountdown(60); // 1 minute cooldown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Email is required', isError: true });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', isError: false });
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      if (response.data.success) {
        setStep(2);
        startCountdown();
      } else {
        setMessage({ text: response.data.message || 'Failed to send OTP', isError: true });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to send OTP. Please try again.',
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOTPChange = (e, index) => {
    const value = e.target.value;
    
    // Only allow numbers and limit to 1 character
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last character
    setOtp(newOtp);
    
    // Auto-focus to next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };
  
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setMessage({ text: 'Please enter a valid 6-digit code', isError: true });
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', isError: false });
    
    try {
      const result = await verifyOtp(email, otpCode);
      
      if (result.success) {
        // Show success message and redirect to dashboard
        setMessage({
          text: result.message || 'Email verified successfully!',
          isError: false
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setMessage({
          text: result.message || 'Invalid OTP. Please try again.',
          isError: true
        });
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage({
        text: error.message || 'An error occurred. Please try again.',
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setMessage({ text: '', isError: false });
    
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/send-otp`, { email });
      setMessage({ text: 'A new OTP has been sent to your email', isError: false });
      startCountdown();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to resend OTP. Please try again.',
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Email input form
  if (step === 1) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Your Email</h2>
          
          {message.text && (
            <div className={`alert ${message.isError ? 'alert-error' : 'alert-success'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Already have an account? <a href="/login">Log in</a></p>
          </div>
        </div>
      </div>
    );
  }
  
  // OTP input form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Enter Verification Code</h2>
        
        <p className="otp-instructions">
          We've sent a 6-digit verification code to <strong>{email}</strong>.
          Please enter it below to verify your email address.
        </p>
        
        {message.text && (
          <div className={`alert ${message.isError ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleOTPSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOTPChange(e, index)}
                maxLength={1}
                className="otp-input"
                autoFocus={index === 0}
                required
              />
            ))}
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
          
          <div className="resend-otp">
            <p>
              Didn't receive the code?{' '}
              <button 
                type="button" 
                className="btn-link" 
                onClick={handleResendOTP}
                disabled={countdown > 0 || isLoading}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </p>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>Entered the wrong email? <button type="button" className="btn-link" onClick={() => setStep(1)}>Change email</button></p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
