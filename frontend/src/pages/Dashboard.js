import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusCircle, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Globe,
  Clock,
  Users
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    totalBudget: 0,
    visitedCities: 0
  });
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tripsRes, statsRes, destinationsRes] = await Promise.all([
        axios.get('/api/trips/recent'),
        axios.get('/api/dashboard/stats'),
        axios.get('/api/destinations/popular')
      ]);

      setTrips(tripsRes.data.trips || []);
      setStats(statsRes.data.stats || stats);
      setPopularDestinations(destinationsRes.data.destinations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Ready to plan your next adventure?</p>
          </div>
          <Link to="/create-trip" className="btn btn-primary">
            <PlusCircle size={20} />
            Plan New Trip
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <MapPin className="icon-primary" />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTrips}</h3>
              <p>Total Trips</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Clock className="icon-success" />
            </div>
            <div className="stat-content">
              <h3>{stats.upcomingTrips}</h3>
              <p>Upcoming Trips</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <DollarSign className="icon-warning" />
            </div>
            <div className="stat-content">
              <h3>${stats.totalBudget?.toLocaleString() || 0}</h3>
              <p>Total Budget</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Globe className="icon-info" />
            </div>
            <div className="stat-content">
              <h3>{stats.visitedCities}</h3>
              <p>Cities Visited</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Recent Trips */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Trips</h2>
              <Link to="/my-trips" className="view-all-link">
                View All
              </Link>
            </div>
            
            {trips.length > 0 ? (
              <div className="trips-grid">
                {trips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="trip-card">
                    <div className="trip-image">
                      {trip.coverImage ? (
                        <img src={trip.coverImage} alt={trip.name} />
                      ) : (
                        <div className="trip-placeholder">
                          <MapPin size={32} />
                        </div>
                      )}
                    </div>
                    <div className="trip-content">
                      <h3>{trip.name}</h3>
                      <div className="trip-meta">
                        <span className="trip-dates">
                          <Calendar size={16} />
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                        <span className="trip-budget">
                          <DollarSign size={16} />
                          ${trip.budget?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="trip-actions">
                        <Link to={`/trip/${trip.id}/view`} className="btn btn-secondary">
                          View
                        </Link>
                        <Link to={`/trip/${trip.id}/build`} className="btn btn-primary">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <MapPin size={48} />
                <h3>No trips yet</h3>
                <p>Start planning your first adventure!</p>
                <Link to="/create-trip" className="btn btn-primary">
                  <PlusCircle size={20} />
                  Create Your First Trip
                </Link>
              </div>
            )}
          </div>

          {/* Popular Destinations */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Popular Destinations</h2>
              <Link to="/cities" className="view-all-link">
                Explore More
              </Link>
            </div>
            
            <div className="destinations-grid">
              {popularDestinations.slice(0, 6).map((destination) => (
                <div key={destination.id} className="destination-card">
                  <div className="destination-image">
                    {destination.image ? (
                      <img src={destination.image} alt={destination.name} />
                    ) : (
                      <div className="destination-placeholder">
                        <Globe size={24} />
                      </div>
                    )}
                  </div>
                  <div className="destination-content">
                    <h4>{destination.name}</h4>
                    <p>{destination.country}</p>
                    <div className="destination-stats">
                      <span>
                        <Users size={14} />
                        {destination.popularity || 0} travelers
                      </span>
                      <span>
                        <TrendingUp size={14} />
                        ${destination.avgCost || 0}/day
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
