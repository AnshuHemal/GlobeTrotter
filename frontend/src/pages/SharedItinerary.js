import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Copy, 
  Share2, 
  Heart,
  User,
  Globe,
  ExternalLink
} from 'lucide-react';
import './SharedItinerary.css';

const SharedItinerary = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    fetchSharedTrip();
  }, [tripId]);

  const fetchSharedTrip = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/trips/shared/${tripId}`);
      setTrip(response.data.trip);
      setLikeCount(response.data.trip.likes || 0);
      setError('');
    } catch (error) {
      console.error('Error fetching shared trip:', error);
      setError('Trip not found or not publicly shared');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/trips/copy/${tripId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
        navigate(`/itinerary-builder/${response.data.newTripId}`);
      }
    } catch (error) {
      console.error('Error copying trip:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleShareTrip = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trip.name} - Travel Itinerary`,
          text: `Check out this amazing ${trip.duration} day trip to ${trip.destinations?.join(', ')}!`,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  };

  const handleLike = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/api/trips/like/${tripId}`);
      setLiked(!liked);
      setLikeCount(response.data.likeCount);
    } catch (error) {
      console.error('Error liking trip:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalBudget = () => {
    if (!trip?.stops) return 0;
    return trip.stops.reduce((total, stop) => {
      const stopTotal = stop.activities?.reduce((sum, activity) => sum + (activity.cost || 0), 0) || 0;
      return total + stopTotal + (stop.accommodation_cost || 0) + (stop.transport_cost || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="shared-itinerary">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-itinerary">
        <div className="error-container">
          <Globe size={64} />
          <h2>Oops! Trip not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-itinerary">
      <div className="shared-header">
        <div className="trip-hero">
          <div className="trip-info">
            <h1>{trip.name}</h1>
            <p className="trip-description">{trip.description}</p>
            
            <div className="trip-meta">
              <div className="meta-item">
                <Calendar size={20} />
                <span>{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</span>
              </div>
              <div className="meta-item">
                <MapPin size={20} />
                <span>{trip.destinations?.join(' → ') || 'Multiple destinations'}</span>
              </div>
              <div className="meta-item">
                <DollarSign size={20} />
                <span>${calculateTotalBudget().toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <Clock size={20} />
                <span>{trip.duration} days</span>
              </div>
            </div>

            <div className="creator-info">
              <User size={20} />
              <span>Created by {trip.creator_name || 'Anonymous Traveler'}</span>
            </div>
          </div>

          <div className="trip-actions">
            <button 
              onClick={handleLike} 
              className={`btn-secondary ${liked ? 'liked' : ''}`}
            >
              <Heart size={20} fill={liked ? '#e74c3c' : 'none'} />
              {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
            </button>
            
            <button onClick={handleShareTrip} className="btn-secondary">
              <Share2 size={20} />
              Share
            </button>
            
            <button onClick={handleCopyTrip} className="btn-primary">
              <Copy size={20} />
              Copy Trip
            </button>
          </div>
        </div>

        {copySuccess && (
          <div className="success-message">
            <p>✓ Link copied to clipboard!</p>
          </div>
        )}
      </div>

      <div className="itinerary-content">
        <div className="itinerary-timeline">
          {trip.stops?.map((stop, index) => (
            <div key={stop.id} className="timeline-stop">
              <div className="stop-header">
                <div className="stop-number">{index + 1}</div>
                <div className="stop-info">
                  <h3>{stop.city_name}</h3>
                  <p className="stop-dates">
                    {formatDate(stop.start_date)} - {formatDate(stop.end_date)}
                  </p>
                </div>
                <div className="stop-budget">
                  <DollarSign size={16} />
                  <span>${(stop.accommodation_cost + stop.transport_cost + 
                    (stop.activities?.reduce((sum, act) => sum + (act.cost || 0), 0) || 0)).toLocaleString()}</span>
                </div>
              </div>

              {stop.activities && stop.activities.length > 0 && (
                <div className="activities-list">
                  <h4>Activities & Experiences</h4>
                  {stop.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="activity-card">
                      <div className="activity-info">
                        <h5>{activity.name}</h5>
                        <p>{activity.description}</p>
                        <div className="activity-meta">
                          <span className="activity-type">{activity.type}</span>
                          <span className="activity-duration">{activity.duration}h</span>
                          <span className="activity-cost">${activity.cost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="trip-summary">
          <div className="summary-card">
            <h3>Trip Summary</h3>
            <div className="summary-stats">
              <div className="stat">
                <MapPin size={24} />
                <div>
                  <span className="stat-number">{trip.stops?.length || 0}</span>
                  <span className="stat-label">Destinations</span>
                </div>
              </div>
              <div className="stat">
                <Calendar size={24} />
                <div>
                  <span className="stat-number">{trip.duration}</span>
                  <span className="stat-label">Days</span>
                </div>
              </div>
              <div className="stat">
                <DollarSign size={24} />
                <div>
                  <span className="stat-number">${calculateTotalBudget().toLocaleString()}</span>
                  <span className="stat-label">Total Budget</span>
                </div>
              </div>
            </div>
          </div>

          <div className="social-sharing">
            <h4>Share this trip</h4>
            <div className="social-buttons">
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this amazing trip: ${trip.name}&url=${window.location.href}`, '_blank')}
                className="social-btn twitter"
              >
                <ExternalLink size={16} />
                Twitter
              </button>
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                className="social-btn facebook"
              >
                <ExternalLink size={16} />
                Facebook
              </button>
              <button 
                onClick={() => copyToClipboard(window.location.href)}
                className="social-btn copy"
              >
                <Copy size={16} />
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;
