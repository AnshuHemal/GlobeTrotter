import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Trash2
} from 'lucide-react';
import './ItineraryBuilder.css';

const ItineraryBuilder = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [activities, setActivities] = useState([]);
  const [newStop, setNewStop] = useState({
    location: '',
    startDate: '',
    endDate: '',
    activities: []
  });

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



  const fetchActivities = async (location) => {
    try {
      const response = await axios.get(`/api/activities?location=${encodeURIComponent(location)}`);
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleAddStop = async () => {
    if (!newStop.location || !newStop.startDate || !newStop.endDate) return;
    
    try {
      const response = await axios.post(`/api/trips/${tripId}/stops`, {
        location: newStop.location,
        start_date: newStop.startDate,
        end_date: newStop.endDate,
        activities: newStop.activities
      });
      
      setStops([...stops, response.data.stop]);
      setNewStop({ location: '', startDate: '', endDate: '', activities: [] });
      setShowAddStop(false);
    } catch (error) {
      console.error('Error adding stop:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStop = async (stopId) => {
    if (!window.confirm('Are you sure you want to delete this stop?')) return;

    try {
      await axios.delete(`/api/trips/${tripId}/stops/${stopId}`);
      setStops(stops.filter(stop => stop.id !== stopId));
    } catch (error) {
      console.error('Error deleting stop:', error);
    }
  };

  const handleAddActivity = async (stopId, activityId) => {
    try {
      const response = await axios.post(`/api/trips/${tripId}/stops/${stopId}/activities`, {
        activityId
      });
      
      setStops(stops.map(stop => 
        stop.id === stopId 
          ? { ...stop, activities: [...(stop.activities || []), response.data.activity] }
          : stop
      ));
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const handleRemoveActivity = async (stopId, activityId) => {
    try {
      await axios.delete(`/api/trips/${tripId}/stops/${stopId}/activities/${activityId}`);
      
      setStops(stops.map(stop => 
        stop.id === stopId 
          ? { ...stop, activities: stop.activities?.filter(a => a.id !== activityId) || [] }
          : stop
      ));
    } catch (error) {
      console.error('Error removing activity:', error);
    }
  };

  const calculateStopBudget = (stop) => {
    const accommodationCost = stop.accommodationCost || 0;
    const transportCost = stop.transportCost || 0;
    const activitiesCost = stop.activities?.reduce((sum, activity) => sum + (activity.cost || 0), 0) || 0;
    return accommodationCost + transportCost + activitiesCost;
  };

  const calculateTotalBudget = () => {
    return stops.reduce((total, stop) => total + calculateStopBudget(stop), 0);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="itinerary-builder">
      <div className="container">
        <div className="builder-header">
          <div className="header-content">
            <h1>Build Your Itinerary</h1>
            <h2>{trip?.name}</h2>
            <p>Add destinations and activities to create your perfect trip</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate(`/trip/${tripId}/view`)}
              className="btn btn-secondary"
            >
              <Eye size={18} />
              Preview
            </button>
            <button
              onClick={() => setShowAddStop(true)}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Add Stop
            </button>
          </div>
        </div>

        <div className="builder-content">
          <div className="stops-list">
            {stops.length > 0 ? (
              stops.map((stop, index) => (
                <div key={stop.id} className="stop-card">
                  <div className="stop-header">
                    <div className="stop-number">{index + 1}</div>
                    <div className="stop-info">
                      <h3>{stop.location}</h3>
                      <div className="stop-dates">
                        <Calendar size={16} />
                        {new Date(stop.start_date).toLocaleDateString()} - {new Date(stop.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="stop-budget">
                      <DollarSign size={16} />
                      ${calculateStopBudget(stop).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleDeleteStop(stop.id)}
                      className="delete-stop-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="stop-activities">
                    <div className="activities-header">
                      <h4>Activities</h4>
                      <button
                        onClick={() => fetchActivities(stop.location)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Plus size={16} />
                        Add Activity
                      </button>
                    </div>

                    {stop.activities && stop.activities.length > 0 ? (
                      <div className="activities-list">
                        {stop.activities.map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <div className="activity-info">
                              <h5>{activity.name}</h5>
                              <p>{activity.description}</p>
                              <div className="activity-meta">
                                <span className="activity-duration">
                                  <Clock size={14} />
                                  {activity.duration || 'N/A'}
                                </span>
                                <span className="activity-cost">
                                  <DollarSign size={14} />
                                  ${activity.cost || 0}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveActivity(stop.id, activity.id)}
                              className="remove-activity-btn"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-activities">
                        <p>No activities added yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-stops">
                <MapPin size={48} />
                <h3>No stops added yet</h3>
                <p>Start building your itinerary by adding your first destination</p>
                <button
                  onClick={() => setShowAddStop(true)}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  Add Your First Stop
                </button>
              </div>
            )}
          </div>

          <div className="trip-summary">
            <div className="summary-card">
              <h3>Trip Summary</h3>
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Total Stops</span>
                  <span className="stat-value">{stops.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Budget</span>
                  <span className="stat-value">${calculateTotalBudget().toLocaleString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Duration</span>
                  <span className="stat-value">
                    {trip?.start_date && trip?.end_date 
                      ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24))
                      : 0
                    } days
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Stop Modal */}
        {showAddStop && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Add New Stop</h3>
                <button
                  onClick={() => setShowAddStop(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              <div className="modal-content">
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter destination name"
                    value={newStop.location}
                    onChange={(e) => setNewStop({ ...newStop, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      value={newStop.startDate}
                      onChange={(e) => setNewStop({ ...newStop, startDate: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      value={newStop.endDate}
                      onChange={(e) => setNewStop({ ...newStop, endDate: e.target.value })}
                      className="form-input"
                      min={newStop.startDate}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowAddStop(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStop}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Adding...' : 'Add Stop'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItineraryBuilder;
