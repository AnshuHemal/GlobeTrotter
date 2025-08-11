import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  MapPin,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Edit3
} from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './TripBudget.css';

const TripBudget = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // overview, breakdown, daily

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];

  const categoryIcons = {
    'Transportation': Plane,
    'Accommodation': Hotel,
    'Food & Dining': Utensils,
    'Activities': Camera,
    'Shopping': DollarSign,
    'Other': DollarSign
  };

  useEffect(() => {
    fetchBudgetData();
  }, [tripId]);

  const fetchBudgetData = async () => {
    try {
      const [tripRes, budgetRes] = await Promise.all([
        axios.get(`/api/trips/${tripId}`),
        axios.get(`/api/trips/${tripId}/budget`)
      ]);
      
      setTrip(tripRes.data.trip);
      setBudgetData(budgetRes.data.budget);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalBudget = () => {
    if (!budgetData) return 0;
    return budgetData.categories?.reduce((total, category) => total + category.amount, 0) || 0;
  };

  const calculateDailyAverage = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? calculateTotalBudget() / days : 0;
  };

  const getBudgetStatus = () => {
    const total = calculateTotalBudget();
    const planned = trip?.plannedBudget || 0;
    
    if (total > planned * 1.1) return 'over';
    if (total > planned * 0.9) return 'warning';
    return 'under';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#22c55e';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'over': return 'Over Budget';
      case 'warning': return 'Near Budget Limit';
      default: return 'Within Budget';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const pieData = budgetData?.categories?.map((category, index) => ({
    name: category.name,
    value: category.amount,
    color: COLORS[index % COLORS.length]
  })) || [];

  const dailyData = budgetData?.dailyBreakdown || [];

  return (
    <div className="trip-budget">
      <div className="container">
        {/* Budget Header */}
        <div className="budget-header">
          <div className="header-content">
            <h1>Trip Budget</h1>
            <h2>{trip?.name}</h2>
            <div className="trip-dates">
              <Calendar size={16} />
              {trip?.startDate && new Date(trip.startDate).toLocaleDateString()} - {trip?.endDate && new Date(trip.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/trip/${tripId}/build`} className="btn btn-secondary">
              <Edit3 size={18} />
              Edit Trip
            </Link>
            <Link to={`/trip/${tripId}/view`} className="btn btn-primary">
              View Itinerary
            </Link>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="budget-overview">
          <div className="overview-card total-budget">
            <div className="card-icon">
              <DollarSign className="icon-primary" />
            </div>
            <div className="card-content">
              <h3>${calculateTotalBudget().toLocaleString()}</h3>
              <p>Total Estimated Cost</p>
            </div>
          </div>

          <div className="overview-card planned-budget">
            <div className="card-icon">
              <TrendingUp className="icon-info" />
            </div>
            <div className="card-content">
              <h3>${trip?.plannedBudget?.toLocaleString() || 0}</h3>
              <p>Planned Budget</p>
            </div>
          </div>

          <div className="overview-card daily-average">
            <div className="card-icon">
              <Calendar className="icon-success" />
            </div>
            <div className="card-content">
              <h3>${calculateDailyAverage().toFixed(0)}</h3>
              <p>Daily Average</p>
            </div>
          </div>

          <div className="overview-card budget-status">
            <div className="card-icon">
              <AlertTriangle style={{ color: getStatusColor(getBudgetStatus()) }} />
            </div>
            <div className="card-content">
              <h3 style={{ color: getStatusColor(getBudgetStatus()) }}>
                {getStatusMessage(getBudgetStatus())}
              </h3>
              <p>Budget Status</p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="view-controls">
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'overview' ? 'active' : ''}`}
              onClick={() => setViewMode('overview')}
            >
              <PieChart size={16} />
              Overview
            </button>
            <button
              className={`toggle-btn ${viewMode === 'breakdown' ? 'active' : ''}`}
              onClick={() => setViewMode('breakdown')}
            >
              <DollarSign size={16} />
              Breakdown
            </button>
            <button
              className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              <Calendar size={16} />
              Daily View
            </button>
          </div>
        </div>

        {/* Budget Content */}
        <div className="budget-content">
          {viewMode === 'overview' && (
            <div className="overview-view">
              <div className="chart-section">
                <div className="chart-card">
                  <h3>Budget Distribution</h3>
                  <div className="pie-chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="categories-summary">
                  <h3>Category Summary</h3>
                  <div className="categories-list">
                    {budgetData?.categories?.map((category, index) => {
                      const IconComponent = categoryIcons[category.name] || DollarSign;
                      return (
                        <div key={category.name} className="category-item">
                          <div className="category-info">
                            <div 
                              className="category-color" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <IconComponent size={20} />
                            <span className="category-name">{category.name}</span>
                          </div>
                          <div className="category-amount">
                            <span>${category.amount.toLocaleString()}</span>
                            <span className="category-percentage">
                              {((category.amount / calculateTotalBudget()) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'breakdown' && (
            <div className="breakdown-view">
              <div className="breakdown-cards">
                {budgetData?.categories?.map((category, index) => {
                  const IconComponent = categoryIcons[category.name] || DollarSign;
                  return (
                    <div key={category.name} className="breakdown-card">
                      <div className="breakdown-header">
                        <div className="breakdown-icon">
                          <IconComponent size={24} />
                        </div>
                        <div className="breakdown-info">
                          <h3>{category.name}</h3>
                          <p>${category.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {category.items && category.items.length > 0 && (
                        <div className="breakdown-items">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="breakdown-item">
                              <span className="item-name">{item.name}</span>
                              <span className="item-amount">${item.amount.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'daily' && (
            <div className="daily-view">
              <div className="daily-chart">
                <h3>Daily Spending Breakdown</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar dataKey="amount" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="daily-details">
                <h3>Daily Breakdown</h3>
                <div className="daily-list">
                  {dailyData.map((day, index) => (
                    <div key={index} className="daily-item">
                      <div className="daily-date">
                        <Calendar size={16} />
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                      <div className="daily-amount">
                        <DollarSign size={16} />
                        ${day.amount.toLocaleString()}
                      </div>
                      <div className="daily-activities">
                        {day.activities?.slice(0, 2).map((activity, actIndex) => (
                          <span key={actIndex} className="activity-tag">
                            {activity}
                          </span>
                        ))}
                        {day.activities?.length > 2 && (
                          <span className="more-activities">
                            +{day.activities.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripBudget;
