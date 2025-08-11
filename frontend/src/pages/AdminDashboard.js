import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Activity,
  Search,
  Filter,
  Download,
  Eye,
  UserX,
  Shield,
  AlertTriangle
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics data
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalTrips: 0,
    activeUsers: 0,
    totalRevenue: 0,
    userGrowth: [],
    tripsByMonth: [],
    topDestinations: [],
    popularActivities: []
  });
  
  // User management data
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  
  // Trip data
  const [trips, setTrips] = useState([]);
  const [tripSearch, setTripSearch] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.isAdmin) {
        fetchAnalytics();
        fetchUsers();
        fetchTrips();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Admin access denied:', error);
      navigate('/');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/trips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTrips(response.data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/users/${userId}/${action}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      setError(`Failed to ${action} user`);
    }
  };

  const exportData = async (type) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesFilter = userFilter === 'all' || 
                         (userFilter === 'active' && user.status === 'active') ||
                         (userFilter === 'inactive' && user.status === 'inactive') ||
                         (userFilter === 'banned' && user.status === 'banned');
    return matchesSearch && matchesFilter;
  });

  const filteredTrips = trips.filter(trip =>
    trip.name.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.destinations?.some(dest => dest.toLowerCase().includes(tripSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <Shield size={28} />
            Admin Dashboard
          </h1>
          <div className="header-actions">
            <button onClick={() => exportData('analytics')} className="export-btn">
              <Download size={20} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          Users
        </button>
        <button 
          className={`tab ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => setActiveTab('trips')}
        >
          <MapPin size={20} />
          Trips
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <Users size={32} />
              </div>
              <div className="stat-info">
                <h3>{analytics.totalUsers.toLocaleString()}</h3>
                <p>Total Users</p>
                <span className="stat-change positive">+12% this month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon trips">
                <MapPin size={32} />
              </div>
              <div className="stat-info">
                <h3>{analytics.totalTrips.toLocaleString()}</h3>
                <p>Total Trips</p>
                <span className="stat-change positive">+8% this month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">
                <Activity size={32} />
              </div>
              <div className="stat-info">
                <h3>{analytics.activeUsers.toLocaleString()}</h3>
                <p>Active Users</p>
                <span className="stat-change positive">+15% this month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon revenue">
                <DollarSign size={32} />
              </div>
              <div className="stat-info">
                <h3>${analytics.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
                <span className="stat-change positive">+22% this month</span>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>User Growth</h3>
              <div className="chart-placeholder">
                <BarChart3 size={48} />
                <p>User growth chart would be rendered here</p>
                <div className="mock-chart">
                  {analytics.userGrowth.map((month, index) => (
                    <div key={index} className="chart-bar" style={{height: `${month.users / 100}px`}}>
                      <span className="bar-label">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Trips by Month</h3>
              <div className="chart-placeholder">
                <TrendingUp size={48} />
                <p>Trip creation trends would be rendered here</p>
                <div className="mock-chart">
                  {analytics.tripsByMonth.map((month, index) => (
                    <div key={index} className="chart-bar" style={{height: `${month.trips / 10}px`}}>
                      <span className="bar-label">{month.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="insights-grid">
            <div className="insight-card">
              <h3>Top Destinations</h3>
              <div className="destination-list">
                {analytics.topDestinations.map((dest, index) => (
                  <div key={index} className="destination-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{dest.name}</span>
                    <span className="count">{dest.trips} trips</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="insight-card">
              <h3>Popular Activities</h3>
              <div className="activity-list">
                {analytics.popularActivities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="name">{activity.name}</span>
                    <span className="count">{activity.bookings} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-content">
          <div className="users-header">
            <div className="search-filters">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>
              <select 
                value={userFilter} 
                onChange={(e) => setUserFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <button onClick={() => exportData('users')} className="export-btn">
              <Download size={20} />
              Export Users
            </button>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Trips</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        {user.photo ? (
                          <img src={user.photo} alt={user.name} className="user-avatar" />
                        ) : (
                          <div className="avatar-placeholder">
                            <Users size={20} />
                          </div>
                        )}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status ${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>{user.tripCount || 0}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => navigate(`/admin/user/${user.id}`)}
                          className="action-btn view"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {user.status !== 'banned' && (
                          <button 
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="action-btn ban"
                            title="Ban User"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                        {user.status === 'banned' && (
                          <button 
                            onClick={() => handleUserAction(user.id, 'unban')}
                            className="action-btn unban"
                            title="Unban User"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="trips-content">
          <div className="trips-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search trips..."
                value={tripSearch}
                onChange={(e) => setTripSearch(e.target.value)}
              />
            </div>
            <button onClick={() => exportData('trips')} className="export-btn">
              <Download size={20} />
              Export Trips
            </button>
          </div>

          <div className="trips-grid">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="trip-card">
                <div className="trip-header">
                  <h4>{trip.name}</h4>
                  <span className={`trip-status ${trip.status}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="trip-info">
                  <p className="trip-destinations">
                    <MapPin size={16} />
                    {trip.destinations?.join(', ') || 'No destinations'}
                  </p>
                  <p className="trip-duration">
                    <Calendar size={16} />
                    {trip.duration} days
                  </p>
                  <p className="trip-budget">
                    <DollarSign size={16} />
                    ${trip.budget?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="trip-meta">
                  <span>Created by: {trip.userName}</span>
                  <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="trip-actions">
                  <button 
                    onClick={() => navigate(`/shared-itinerary/${trip.id}`)}
                    className="action-btn view"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
