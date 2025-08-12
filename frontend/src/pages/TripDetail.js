import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Star, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/BookingModal.jsx';
import './TripDetail.css';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/packages/${id}`);
        if (res.data?.success && res.data?.trip) {
          setTrip(res.data.trip);
        } else {
          setError(res.data?.message || 'Failed to load trip details');
        }
      } catch (err) {
        console.error('Error fetching trip details:', err);
        setError('Failed to load trip details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTripDetails();
  }, [id]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/trip/${id}` } });
      return;
    }
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async ({ start_date, end_date }) => {
    if (!trip) return;
    try {
      const payload = {
        trip_id: trip.id || id,
        package_id: trip.id || id,
        title: trip.title,
        image_url: trip.image_url || trip.image,
        start_date,
        end_date,
      };
      const response = await axios.post('/api/trips/user/book', payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.data?.success) {
        setShowBookingModal(false);
        navigate('/my-trips');
      } else {
        throw new Error(response.data?.message || 'Failed to book trip');
      }
    } catch (e) {
      console.error('Booking failed:', e);
      alert('Failed to book the trip. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="trip-detail-loading">
        <div className="spinner" />
        <p>Loading trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-detail-error">
        <p>{error || 'Trip not found'}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="trip-detail">
      <button onClick={() => navigate(-1)} className="back-button">
        <ChevronLeft size={20} /> Back to Trips
      </button>

      <div className="trip-header">
        <div className="trip-gallery">
          <img
            src={trip.image_url || trip.image}
            alt={trip.title}
            className="trip-main-image"
          />
        </div>

        <div className="trip-info">
          <h1>{trip.title}</h1>
          <p className="trip-subtitle">{trip.subtitle}</p>

          <div className="trip-meta">
            <span className="trip-rating">
              <Star size={18} fill="#FFD700" color="#FFD700" />
              {trip.rating} ({trip.review_count || 0} reviews)
            </span>
            <span><MapPin size={16} /> {trip.destination || trip.subtitle}</span>
            <span><Calendar size={16} /> {trip.duration}</span>
          </div>

          <div className="trip-pricing">
            <div className="price-container">
              <span className="current-price">
                ₹{(trip.current_price || trip.currentPrice || 0).toLocaleString('en-IN')}
              </span>
              {(trip.old_price || trip.originalPrice) > (trip.current_price || trip.currentPrice) && (
                <span className="original-price">
                  ₹{(trip.old_price || trip.originalPrice || 0).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <button className="book-now-btn" onClick={handleBookNow}>
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* <div className="trip-details full-bleed"> */}
        {/* <div className="trip-description">
          <h2>About This Trip</h2>
          <p>{trip.description || 'No description available.'}</p>
        </div> */}

        {Array.isArray(trip.itinerary) && trip.itinerary.length > 0 && (
          <div className="trip-itinerary">
            <h2>Itinerary</h2>
            <div className="itinerary-grid">
              {trip.itinerary.map((item, idx) => (
                <div key={idx} className="itinerary-card">
                  <div className="itinerary-image-wrap">
                    <img
                      src={item.image_url}
                      alt={`${item.day} - ${item.title}`}
                      className="itinerary-image"
                    />
                    <span className="itinerary-day-badge">{item.day || `Day ${idx + 1}`}</span>
                  </div>
                  <div className="itinerary-content">
                    <h3 className="itinerary-title">{item.title}</h3>
                    <p className="itinerary-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      {/* </div> */}
      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
        trip={trip}
      />
    </div>
  );
};

export default TripDetail;
