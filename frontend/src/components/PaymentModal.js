import React from 'react';
import { X } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, packageDetails }) => {
  if (!isOpen) return null;

  const handlePayment = async () => {
    try {
      // Simulate API call to process payment
      // In a real app, this would integrate with a payment gateway
      await new Promise(resolve => setTimeout(resolve, 1000));
      onPaymentSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Complete Your Booking</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="booking-summary">
            <h4>{packageDetails.title}</h4>
            <p>{packageDetails.subtitle}</p>
            <p>Duration: {packageDetails.duration}</p>
            <p className="price">
              ₹{packageDetails.current_price?.toLocaleString('en-IN')}
              {packageDetails.old_price && (
                <span className="original-price">₹{packageDetails.old_price.toLocaleString('en-IN')}</span>
              )}
            </p>
          </div>
          
          <div className="payment-form">
            <h4>Payment Details</h4>
            <div className="form-group">
              <label>Card Number</label>
              <input 
                type="text" 
                placeholder="1234 5678 9012 3456"
                className="form-control"
                disabled
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY"
                  className="form-control"
                  disabled
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input 
                  type="text" 
                  placeholder="123"
                  className="form-control"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-primary"
            onClick={handlePayment}
          >
            Mark as Paid
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
