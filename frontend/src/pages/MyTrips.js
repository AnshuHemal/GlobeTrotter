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

  // Helper function to extract trips from different response formats
  const extractTripsData = (data) => {
    if (Array.isArray(data)) return data;
    if (!data) return [];
    return data.trips || data.user_trips || data.userTrips || data.data || data.results || [];
  };

  // Helper function to normalize trip data structure
  const normalizeTrips = (trips) => {
    if (!Array.isArray(trips)) return [];
    
    return trips.map(trip => ({
      id: trip.id || trip._id || trip.trip_id || '',
      title: trip.title || trip.name || trip.package_name || 'Untitled Trip',
      image_url: trip.image_url || trip.image || trip.imageUrl || trip.thumbnail || '',
      start_date: trip.start_date || trip.startDate || trip.trip_start || '',
      end_date: trip.end_date || trip.endDate || trip.trip_end || '',
      status: trip.status || 'upcoming',
      // Include all original fields for debugging
      ...trip,
    }));
  };

  const fetchTrips = async () => {
    console.log('Starting to fetch trips...');
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      console.log('Using token from localStorage:', token ? 'yes' : 'no');
      
      const authConfig = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      };

      // Try the safe endpoint first (always returns 200)
      try {
        console.log('Trying /api/trips/user/safe...');
        const safeRes = await axios.get('http://localhost:5000/api/trips/user/safe', authConfig);
        console.log('Safe endpoint response:', safeRes.data);
        
        if (safeRes.data?.success && Array.isArray(safeRes.data.trips)) {
          console.log('Using data from safe endpoint');
          const normalizedTrips = normalizeTrips(safeRes.data.trips);
          console.log('Normalized trips:', normalizedTrips);
          setTrips(normalizedTrips);
          return;
        }
      } catch (safeErr) {
        console.warn('Safe endpoint failed, trying primary endpoint', safeErr);
      }

      // Fallback to primary endpoint
      try {
        console.log('Trying /api/trips/user...');
        const res = await axios.get('http://localhost:5000/api/trips/user', authConfig);
        console.log('Primary endpoint response:', res.data);
        
        const tripsData = extractTripsData(res.data);
        const normalizedTrips = normalizeTrips(tripsData);
        console.log('Normalized trips from primary:', normalizedTrips);
        setTrips(normalizedTrips);
      } catch (primaryErr) {
        console.warn('Primary endpoint failed, trying fallback...', primaryErr);
        
        // Final fallback to /api/trips?user=true
        try {
          console.log('Trying fallback /api/trips?user=true...');
          const fallbackRes = await axios.get('http://localhost:5000/api/trips', {
            params: { user: true },
            ...authConfig,
          });
          console.log('Fallback response:', fallbackRes.data);
          
          const tripsData = extractTripsData(fallbackRes.data);
          const normalizedTrips = normalizeTrips(tripsData);
          console.log('Normalized trips from fallback:', normalizedTrips);
          setTrips(normalizedTrips);
        } catch (fallbackErr) {
          console.error('All endpoints failed:', fallbackErr);
          setError('Failed to load your trips. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error in fetchTrips:', error);
      setError('An unexpected error occurred. Please try again.');
      // Set some sample data for development
      setTrips([{
        id: '1',
        title: 'Sample Trip',
        destination: 'Sample Destination',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'upcoming',
        total_budget: 2500,
        image_url: 'https://example.com/bali.jpg'
      }]);
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
              const duration = (trip.start_date && trip.end_date)
                ? Math.ceil((new Date(trip.end_date) - new Date(trip.start_date)) / (1000 * 60 * 60 * 24)) + ' days'
                : 'N/A';
              
              return (
                <div key={trip.id} className="trip-card-modern">
                  <div className="trip-card-header">
                    <div className="trip-image-modern">
                      {trip.image_url ? (
                        <img src={trip.image_url} alt={trip.title} />
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
                      <h3 className="trip-title">{trip.title || 'Trip'}</h3>
                      <div className="trip-location">
                        <MapPin size={16} />
                        <span>{trip.destination || 'Booked Trip'}</span>
                      </div>
                    </div>
                    
                    <div className="trip-details">
                      <div className="trip-detail-item">
                        <Calendar size={16} />
                        <div className="detail-content">
                          <span className="detail-label">Dates</span>
                          <span className="detail-value">{formatDate(trip.start_date)} → {formatDate(trip.end_date)}</span>
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
