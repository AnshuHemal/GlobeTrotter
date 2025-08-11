import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  Users, 
  Star, 
  Search,
  DollarSign,
  Globe,
  Plus
} from 'lucide-react';
import './CitySearch.css';

const CitySearch = () => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    region: '',
    minCost: '',
    maxCost: '',
    sortBy: 'popularity'
  });
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetchCities();
    fetchFilters();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get('/api/cities');
      setCities(response.data.cities || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [countriesRes, regionsRes] = await Promise.all([
        axios.get('/api/cities/countries'),
        axios.get('/api/cities/regions')
      ]);
      
      setCountries(countriesRes.data.countries || []);
      setRegions(regionsRes.data.regions || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      country: '',
      region: '',
      minCost: '',
      maxCost: '',
      sortBy: 'popularity'
    });
    setSearchTerm('');
  };

  const addCityToTrip = async (cityId) => {
    // This would typically open a modal to select which trip to add the city to
    console.log('Add city to trip:', cityId);
    // For now, just show an alert
    alert('Feature coming soon! You can add cities when building your itinerary.');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="city-search">
      <div className="container">
        <div className="search-header">
          <div className="header-content">
            <h1>Explore Cities</h1>
            <p>Discover amazing destinations for your next adventure</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-controls">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search cities or countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-section">
            <div className="filters-row">
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="filter-select"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="filter-select"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
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
                <option value="country">Country</option>
                <option value="cost-low">Cost: Low to High</option>
                <option value="cost-high">Cost: High to Low</option>
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
            <h3>{filteredCities.length} cities found</h3>
          </div>

          {filteredCities.length > 0 ? (
            <div className="cities-grid">
              {filteredCities.map((city) => (
                <div key={city.id} className="city-card">
                  <div className="city-image">
                    {city.image ? (
                      <img src={city.image} alt={city.name} />
                    ) : (
                      <div className="city-placeholder">
                        <MapPin size={32} />
                      </div>
                    )}
                    <div className="city-rating">
                      <Star size={14} fill="currentColor" />
                      {city.rating || 4.5}
                    </div>
                  </div>

                  <div className="city-content">
                    <div className="city-header">
                      <h3>{city.name}</h3>
                      <span className="city-country">{city.country}</span>
                    </div>

                    <p className="city-description">{city.description}</p>

                    <div className="city-stats">
                      <div className="stat-item">
                        <Users size={16} />
                        <span>{city.popularity || 0} travelers</span>
                      </div>
                      <div className="stat-item">
                        <DollarSign size={16} />
                        <span>${city.averageCostPerDay || 0}/day</span>
                      </div>
                      <div className="stat-item">
                        <Globe size={16} />
                        <span>{city.region}</span>
                      </div>
                    </div>

                    <div className="city-highlights">
                      {city.highlights && city.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="highlight-tag">
                          {highlight}
                        </span>
                      ))}
                    </div>

                    <div className="city-actions">
                      <button
                        onClick={() => addCityToTrip(city.id)}
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
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={64} />
              <h3>No cities found</h3>
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

export default CitySearch;
