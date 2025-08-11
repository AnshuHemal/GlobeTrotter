import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit3, 
  Share2,
  List,
  Grid
} from 'lucide-react';
import './ItineraryView.css';

const ItineraryView = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline'); // timeline or list

  const fetchTripData = React.useCallback(async () => {
    try {
      const [tripRes, stopsRes] = await Promise.all([
        axios.get(`/api/trips/${tripId}`),
        axios.get(`/api/trips/${tripId}/stops`)
      ]);
      
      setTrip(tripRes.data.trip);
      setStops(stopsRes.data.stops || []);
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  const calculateTotalBudget = () => {
    return stops.reduce((total, stop) => {
      const stopBudget = (stop.accommodationCost || 0) + 
                         (stop.transportCost || 0) + 
                         (stop.activities?.reduce((sum, activity) => sum + (activity.cost || 0), 0) || 0);
      return total + stopBudget;
    }, 0);
  };

  const getTripDuration = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    return Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: trip.name,
        text: `Check out my travel itinerary for ${trip.name}`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="itinerary-view">
      <div className="container">
        {/* Trip Header */}
        <div className="trip-header">
          <div className="trip-cover">
            {trip?.coverImage ? (
              <img src={trip.coverImage} alt={trip.name} />
            ) : (
              <div className="cover-placeholder">
                <MapPin size={48} />
              </div>
            )}
          </div>
          
          <div className="trip-info">
            <h1>{trip?.name}</h1>
            <p className="trip-description">{trip?.description}</p>
            
            <div className="trip-meta">
              <div className="meta-item">
                <Calendar size={18} />
                <span>
                  {trip?.startDate && new Date(trip.startDate).toLocaleDateString()} - {trip?.endDate && new Date(trip.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="meta-item">
                <Clock size={18} />
                <span>{getTripDuration()} days</span>
              </div>
              <div className="meta-item">
                <MapPin size={18} />
                <span>{stops.length} destinations</span>
              </div>
              <div className="meta-item">
                <DollarSign size={18} />
                <span>${calculateTotalBudget().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="trip-actions">
            <Link to={`/trip/${tripId}/build`} className="btn btn-primary">
              <Edit3 size={18} />
              Edit Trip
            </Link>
            <button onClick={handleShare} className="btn btn-secondary">
              <Share2 size={18} />
              Share
            </button>
            <Link to={`/trip/${tripId}/calendar`} className="btn btn-secondary">
              <Calendar size={18} />
              Calendar View
            </Link>
          </div>
        </div>

        {/* View Controls */}
        <div className="view-controls">
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <List size={16} />
              Timeline
            </button>
            <button
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <Grid size={16} />
              List View
            </button>
          </div>
        </div>

        {/* Itinerary Content */}
        <div className={`itinerary-content ${viewMode}`}>
          {stops.length > 0 ? (
            viewMode === 'timeline' ? (
              <div className="timeline-view">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="timeline-item">
                    <div className="timeline-marker">
                      <div className="marker-dot">{index + 1}</div>
                      {index < stops.length - 1 && <div className="marker-line"></div>}
                    </div>
                    
                    <div className="timeline-content">
                      <div className="stop-card">
                        <div className="stop-header">
                          <div className="stop-location">
                            <h3>{stop.location}</h3>
                          </div>
                          <div className="stop-dates">
                            <Calendar size={16} />
                            {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                          </div>
                        </div>

                        {stop.activities && stop.activities.length > 0 && (
                          <div className="stop-activities">
                            <h4>Activities</h4>
                            <div className="activities-grid">
                              {stop.activities.map((activity) => (
                                <div key={activity.id} className="activity-card">
                                  <div className="activity-info">
                                    <h5>{activity.name}</h5>
                                    <p>{activity.description}</p>
                                  </div>
                                  <div className="activity-details">
                                    {activity.duration && (
                                      <span className="activity-duration">
                                        <Clock size={14} />
                                        {activity.duration}
                                      </span>
                                    )}
                                    <span className="activity-cost">
                                      <DollarSign size={14} />
                                      ${activity.cost || 0}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="list-view">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="list-item">
                    <div className="list-header">
                      <div className="stop-number">{index + 1}</div>
                      <div className="stop-info">
                        <h3>{stop.location}</h3>
                        <div className="stop-dates">
                          <Calendar size={16} />
                          {new Date(stop.startDate).toLocaleDateString()} - {new Date(stop.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {stop.activities && stop.activities.length > 0 && (
                      <div className="activities-list">
                        {stop.activities.map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <div className="activity-content">
                              <h5>{activity.name}</h5>
                              <p>{activity.description}</p>
                              <div className="activity-meta">
                                {activity.duration && (
                                  <span>
                                    <Clock size={14} />
                                    {activity.duration}
                                  </span>
                                )}
                                <span>
                                  <DollarSign size={14} />
                                  ${activity.cost || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="empty-itinerary">
              <MapPin size={64} />
              <h3>No destinations added yet</h3>
              <p>Start building your itinerary by adding destinations and activities</p>
              <Link to={`/trip/${tripId}/build`} className="btn btn-primary">
                <Edit3 size={20} />
                Build Itinerary
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
