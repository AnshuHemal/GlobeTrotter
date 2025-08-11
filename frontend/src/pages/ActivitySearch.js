import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Search, 
  Camera,
  Utensils,
  Mountain,
  Building,
  Music,
  Heart,
  Plus
} from 'lucide-react';
import './ActivitySearch.css';

const ActivitySearch = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    minCost: '',
    maxCost: '',
    duration: '',
    sortBy: 'popularity'
  });
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);

  const categoryIcons = {
    'Sightseeing': Camera,
    'Food & Drink': Utensils,
    'Adventure': Mountain,
    'Culture': Building,
    'Entertainment': Music,
    'Nature': Mountain
  };

  useEffect(() => {
    fetchActivities();
    fetchFilters();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/activities');
      setActivities(response.data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        axios.get('/api/activities/categories'),
        axios.get('/api/cities')
      ]);
      
      setCategories(categoriesRes.data.categories || []);
      setCities(citiesRes.data.cities || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const filterAndSortActivities = useCallback(() => {
    let filtered = activities.filter(activity => {
      const matchesSearch = (activity.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (activity.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || activity.category === filters.category;
      const matchesCity = !filters.city || activity.cityId === filters.city;
      
      const cost = activity.cost || 0;
      const matchesMinCost = !filters.minCost || cost >= parseInt(filters.minCost);
      const matchesMaxCost = !filters.maxCost || cost <= parseInt(filters.maxCost);
      
      const matchesDuration = !filters.duration || activity.duration === filters.duration;
      
      return matchesSearch && matchesCategory && matchesCity && matchesMinCost && matchesMaxCost && matchesDuration;
    });

    // Sort activities
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost-low':
          return (a.cost || 0) - (b.cost || 0);
        case 'cost-high':
          return (b.cost || 0) - (a.cost || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'duration':
          return (a.durationMinutes || 0) - (b.durationMinutes || 0);
        default: // popularity
          return (b.popularity || 0) - (a.popularity || 0);
      }
    });

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      minCost: '',
      maxCost: '',
      duration: '',
      sortBy: 'popularity'
    });
    setSearchTerm('');
  };

  const addActivityToTrip = async (activityId) => {
    // This would typically open a modal to select which trip/stop to add the activity to
    console.log('Add activity to trip:', activityId);
    alert('Feature coming soon! You can add activities when building your itinerary.');
  };

  const toggleFavorite = async (activityId) => {
    try {
      await axios.post(`/api/activities/${activityId}/favorite`);
      // Update local state
      setActivities(activities.map(activity => 
        activity.id === activityId 
          ? { ...activity, isFavorite: !activity.isFavorite }
          : activity
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
    <div className="activity-search">
      <div className="container">
        <div className="search-header">
          <div className="header-content">
            <h1>Discover Activities</h1>
            <p>Find amazing experiences and activities for your trip</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-section">
            <div className="filters-row">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="filter-select"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}, {city.country}
                  </option>
                ))}
              </select>

              <select
                value={filters.duration}
                onChange={(e) => handleFilterChange('duration', e.target.value)}
                className="filter-select"
              >
                <option value="">Any Duration</option>
                <option value="1-2 hours">1-2 hours</option>
                <option value="3-4 hours">3-4 hours</option>
                <option value="Half day">Half day</option>
                <option value="Full day">Full day</option>
                <option value="Multi-day">Multi-day</option>
              </select>

              <div className="cost-range">
                <input
                  type="number"
                  placeholder="Min cost"
                  value={filters.minCost}
                  onChange={(e) => handleFilterChange('minCost', e.target.value)}
                  className="cost-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max cost"
                  value={filters.maxCost}
                  onChange={(e) => handleFilterChange('maxCost', e.target.value)}
                  className="cost-input"
                />
              </div>

              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
                <option value="cost-low">Cost: Low to High</option>
                <option value="cost-high">Cost: High to Low</option>
                <option value="duration">Duration</option>
              </select>

              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="search-results">
          <div className="results-header">
            <h3>{filteredActivities.length} activities found</h3>
          </div>

          {filteredActivities.length > 0 ? (
            <div className="activities-grid">
              {filteredActivities.map((activity) => {
                const CategoryIcon = categoryIcons[activity.category] || Camera;
                return (
                  <div key={activity.id} className="activity-card">
                    <div className="activity-image">
                      {activity.image ? (
                        <img src={activity.image} alt={activity.name} />
                      ) : (
                        <div className="activity-placeholder">
                          <CategoryIcon size={32} />
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(activity.id)}
                        className={`favorite-btn ${activity.isFavorite ? 'active' : ''}`}
                      >
                        <Heart size={16} fill={activity.isFavorite ? 'currentColor' : 'none'} />
                      </button>
                      <div className="activity-rating">
                        <Star size={14} fill="currentColor" />
                        {activity.rating || 4.5}
                      </div>
                    </div>

                    <div className="activity-content">
                      <div className="activity-header">
                        <div className="category-badge">
                          <CategoryIcon size={14} />
                          {activity.category}
                        </div>
                        <h3>{activity.name}</h3>
                        <div className="activity-location">
                          <MapPin size={14} />
                          {activity.city?.name}
                        </div>
                      </div>

                      <p className="activity-description">{activity.description}</p>

                      <div className="activity-details">
                        <div className="detail-item">
                          <Clock size={16} />
                          <span>{activity.duration || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <DollarSign size={16} />
                          <span>${activity.cost || 0}</span>
                        </div>
                      </div>

                      {activity.highlights && activity.highlights.length > 0 && (
                        <div className="activity-highlights">
                          {activity.highlights.slice(0, 3).map((highlight, index) => (
                            <span key={index} className="highlight-tag">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="activity-actions">
                        <button
                          onClick={() => addActivityToTrip(activity.id)}
                          className="btn btn-primary"
                        >
                          <Plus size={16} />
                          Add to Trip
                        </button>
                        <button className="btn btn-secondary">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={64} />
              <h3>No activities found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button onClick={clearFilters} className="btn btn-primary">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitySearch;
