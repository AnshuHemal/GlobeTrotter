import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { tripsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Eye, 
  Trash2, 
  PlusCircle,
  Search,
  AlertCircle
} from 'lucide-react';
import './MyTrips.css';

const MyTrips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      setLoading(false);
      setError('Please log in to view your trips');
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      try {
        // Try new API service first
        response = await tripsApi.getTrips({ user: true });
        // Handle both array response and nested data structure
        const tripsData = Array.isArray(response.data) ? response.data : (response.data?.trips || []);
        setTrips(tripsData);
        return; // Exit if successful
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to direct axios call
        const fallbackResponse = await axios.get('/api/trips/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const fallbackData = Array.isArray(fallbackResponse.data) ? 
          fallbackResponse.data : 
          (fallbackResponse.data?.trips || []);
        setTrips(fallbackData);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError(error.response?.data?.message || 'Failed to load your trips. Please try again.');
      
      // Set dummy data if API fails
      setTrips([
        {
          id: '1',
          title: 'Summer Vacation',
          destination: 'Bali, Indonesia',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'upcoming',
          total_budget: 2500,
          image_url: 'https://example.com/bali.jpg'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrips = useCallback(() => {
    let filtered = trips.filter(trip => {
      const matchesSearch = (trip.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trip.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (trip.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const now = new Date();
      const startDate = trip.start_date ? new Date(trip.start_date) : null;
      const endDate = trip.end_date ? new Date(trip.end_date) : null;
      
      let matchesFilter = true;
      if (filterStatus === 'upcoming') {
        matchesFilter = startDate && startDate > now;
      } else if (filterStatus === 'ongoing') {
        matchesFilter = startDate && endDate && startDate <= now && endDate >= now;
      } else if (filterStatus === 'completed') {
        matchesFilter = endDate && endDate < now;
      }
      
      return matchesSearch && matchesFilter;
    });

    // Sort trips
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'startDate':
          return (new Date(a.start_date || 0) - new Date(b.start_date || 0));
        case 'price':
          return (b.price || 0) - (a.price || 0);
        default: // created
          return (new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }
    });

    setFilteredTrips(filtered);
  }, [trips, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    filterAndSortTrips();
  }, [filterAndSortTrips]);

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      try {
        // Try new API service first
        await tripsApi.deleteTrip(tripId);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to direct axios call
        await axios.delete(`/api/trips/${tripId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      // Refresh trips after successful deletion
      await fetchTrips();
      
      // Show success message
      setError('');
      // You might want to add a success toast/notification here
    } catch (error) {
      console.error('Error deleting trip:', error);
      setError(error.response?.data?.message || 'Failed to delete trip. Please try again.');
    }
  };

  const getTripStatus = (trip) => {
    if (!trip.start_date || !trip.end_date) return 'upcoming';
    
    const now = new Date();
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    
    if (startDate > now) return 'upcoming';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'completed';
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming': return 'status-badge-upcoming';
      case 'ongoing': return 'status-badge-ongoing';
      case 'completed': return 'status-badge-completed';
      default: return 'status-badge-upcoming';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'ongoing': return '#22c55e';
      case 'completed': return '#64748b';
      default: return '#64748b';
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <AlertCircle size={48} className="auth-icon" />
        <h2>Authentication Required</h2>
        <p>Please log in to view your trips.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your trips...</div>;
  }

  return (
    <div className="my-trips">
      <div className="container">
        <div className="trips-header">
          <div className="header-content">
            <h1>My Trips</h1>
            <p>Manage and organize all your travel plans</p>
          </div>
          <Link to="/create-trip" className="btn btn-primary">
            <PlusCircle size={20} />
            New Trip
          </Link>
        </div>

        <div className="trips-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Trips</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="created">Recently Created</option>
              <option value="startDate">Start Date</option>
              <option value="name">Name</option>
              <option value="budget">Budget</option>
            </select>
          </div>
        </div>

        {filteredTrips.length > 0 ? (
          <div className="trips-grid">
            {filteredTrips.map((trip) => {
              const status = getTripStatus(trip);
              const duration = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + ' days';
              
              return (
                <div key={trip.id} className="trip-card-modern">
                  <div className="trip-card-header">
                    <div className="trip-image-modern">
                      {trip.coverImage ? (
                        <img src={trip.coverImage} alt={trip.name} />
                      ) : (
                        <div className="trip-placeholder-modern">
                          <MapPin size={32} />
                        </div>
                      )}
                      <div 
                        className="trip-status-badge"
                        style={{ 
                          backgroundColor: getStatusColor(status),
                          color: status === 'upcoming' ? '#1E40AF' : status === 'ongoing' ? '#166534' : '#1F2937'
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="trip-card-body">
                    <div className="trip-title-section">
                      <h3 className="trip-title">{trip.name}</h3>
                      <div className="trip-location">
                        <MapPin size={16} />
                        <span>{trip.destination || 'No destination set'}</span>
                      </div>
                    </div>
                    
                    <div className="trip-details">
                      <div className="trip-detail-item">
                        <Calendar size={16} />
                        <div className="detail-content">
                          <span className="detail-label">Duration</span>
                          <span className="detail-value">{duration}</span>
                        </div>
                      </div>
                      
                      <div className="trip-detail-item">
                        <DollarSign size={16} />
                        <div className="detail-content">
                          <span className="detail-label">Budget</span>
                          <span className="detail-value">
                            ${trip.budget?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="trip-actions-modern">
                      <Link to={`/trip/${trip.id}/view`} className="btn btn-outline">
                        <Eye size={16} />
                        <span>View</span>
                      </Link>
                      <Link to={`/trip/${trip.id}/edit`} className="btn btn-primary">
                        <Edit3 size={16} />
                        <span>Edit</span>
                      </Link>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="btn-delete"
                      aria-label="Delete trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>
              {searchTerm || filterStatus !== 'all' 
                ? 'No trips match your criteria' 
                : 'No trips yet'
              }
            </h3>
            <p>
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Start planning your first adventure!'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link to="/create-trip" className="btn btn-primary">
                <PlusCircle size={20} />
                Create Your First Trip
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;
