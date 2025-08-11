import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

// Add some custom styles specific to the verify email page
const verifyEmailStyles = `
  .verify-email-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  
  .email-icon {
    background-color: #f0f7ff;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }
  
  .email-icon svg {
    color: #3b82f6;
  }
  
  .verification-steps {
    text-align: left;
    margin: 2rem 0;
    padding: 0 1rem;
  }
  
  .verification-step {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;
    color: #4b5563;
  }
  
  .step-number {
    background-color: #3b82f6;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    margin-right: 1rem;
    flex-shrink: 0;
  }
  
  .resend-button {
    background: none;
    border: none;
    color: #3b82f6;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }
  
  .resend-button:hover {
    background-color: #f0f7ff;
  }
  
  .resend-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .success-message {
    background-color: #ecfdf5;
    color: #047857;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`;

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();

  // Extract email from location state or query params
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleResendEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error resending verification email:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add the styles to the document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = verifyEmailStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <style>{verifyEmailStyles}</style>
        
        <div className="verify-email-container">
          <div className="email-icon">
            <Mail size={40} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          
          <p className="text-gray-600 mb-6">
            We've sent a verification link to <span className="font-semibold text-gray-800">{email || 'your email address'}</span>.
          </p>
          
          <div className="verification-steps">
            <div className="verification-step">
              <span className="step-number">1</span>
              <span>Check your email inbox (and spam/junk folders)</span>
            </div>
            <div className="verification-step">
              <span className="step-number">2</span>
              <span>Click on the verification link in the email</span>
            </div>
            <div className="verification-step">
              <span className="step-number">3</span>
              <span>You'll be automatically logged in and redirected to your dashboard</span>
            </div>
          </div>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          {message ? (
            <div className="success-message">
              <CheckCircle size={20} />
              <span>{message}</span>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">Haven't received the email yet?</p>
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="resend-button"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Resend Verification Email
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already verified?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Log in to your account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
