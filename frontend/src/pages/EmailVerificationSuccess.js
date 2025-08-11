import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import './Auth.css';

const EmailVerificationSuccess = () => {
  const navigate = useNavigate();

  // Redirect to login after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button 
          onClick={() => navigate('/')}
          className="back-button"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="auth-header">
          <div className="success-icon">
            <CheckCircle size={48} color="#4CAF50" />
          </div>
          <h2>Email Verified Successfully!</h2>
          <p>Your email has been verified. You will be redirected to the login page shortly.</p>
        </div>
        
        <div className="auth-footer">
          <p>
            <button 
              className="text-link"
              onClick={() => navigate('/login')}
            >
              Click here
            </button>{' '}
            if you are not redirected automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
