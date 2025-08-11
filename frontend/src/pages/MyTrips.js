import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit3, 
  Eye, 
  Trash2, 
  PlusCircle,
  Search
} from 'lucide-react';
import './MyTrips.css';

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get('/api/trips');
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTrips = useCallback(() => {
    let filtered = trips.filter(trip => {
      const matchesSearch = (trip.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (trip.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const now = new Date();
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      
      let matchesFilter = true;
      if (filterStatus === 'upcoming') {
        matchesFilter = startDate > now;
      } else if (filterStatus === 'ongoing') {
        matchesFilter = startDate <= now && endDate >= now;
      } else if (filterStatus === 'completed') {
        matchesFilter = endDate < now;
      }
      
      return matchesSearch && matchesFilter;
    });

    // Sort trips
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'startDate':
          return new Date(a.startDate) - new Date(b.startDate);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        default: // created
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredTrips(filtered);
  }, [trips, searchTerm, filterStatus, sortBy]);

  useEffect(() => {
    filterAndSortTrips();
  }, [filterAndSortTrips]);

  const deleteTrip = async (tripId) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    
    try {
      await axios.delete(`/api/trips/${tripId}`);
      setTrips(trips.filter(trip => trip.id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const getTripStatus = (trip) => {
    const now = new Date();
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);
    
    if (startDate > now) return 'upcoming';
    if (startDate <= now && endDate >= now) return 'ongoing';
    return 'completed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#3b82f6';
      case 'ongoing': return '#22c55e';
      case 'completed': return '#64748b';
      default: return '#64748b';
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
                      onClick={() => deleteTrip(trip.id)}
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
