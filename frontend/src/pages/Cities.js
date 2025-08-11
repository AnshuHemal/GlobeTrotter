import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Star, DollarSign, Globe, Navigation } from 'lucide-react';
import './Cities.css';

const Cities = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: 'all', // 'all', 'city', 'destination'
    sort: 'popularity' // 'popularity', 'name', 'country'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get('/api/destinations/all-places');
        if (response.data.success) {
          setPlaces(response.data.places || []);
        } else {
          setError('Failed to load places. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching places:', err);
        setError('Failed to connect to the server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const filteredPlaces = places.filter(place => {
    const matchesSearch = place.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                        place.country.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || place.type === filters.type;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (filters.sort === 'name') {
      return a.name.localeCompare(b.name);
    } else if (filters.sort === 'country') {
      return a.country.localeCompare(b.country);
    }
    // Default sort by popularity
    return b.popularity - a.popularity;
  });

  const handlePlaceClick = (place) => {
    if (place.type === 'city') {
      navigate(`/city/${place.id}`);
    } else {
      navigate(`/destination/${place.id}`);
    }
  };

  if (loading) {
    return (
      <div className="cities-loading">
        <div className="loading-spinner"></div>
        <p>Loading amazing places...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cities-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="cities">
      <div className="cities-header">
        <h1>Explore Amazing Places</h1>
        <p>Discover cities and destinations around the world</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search by name or country..."
              className="search-input"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <select
            className="filter-select"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="all">All Places</option>
            <option value="city">Cities</option>
            <option value="destination">Destinations</option>
          </select>
          
          <select
            className="filter-select"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
          >
            <option value="popularity">Sort by: Popularity</option>
            <option value="name">Sort by: Name (A-Z)</option>
            <option value="country">Sort by: Country</option>
          </select>
        </div>
      </div>

      {filteredPlaces.length === 0 ? (
        <div className="no-results">
          <p>No places found matching your criteria.</p>
        </div>
      ) : (
        <div className="places-grid">
          {filteredPlaces.map((place) => (
            <div 
              key={`${place.type}-${place.id}`} 
              className="place-card"
              onClick={() => handlePlaceClick(place)}
            >
              <div className="place-image-container">
                <img 
                  src={place.image_url || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={place.name}
                  className="place-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                  }}
                />
                <div className="place-type-badge">
                  {place.type === 'city' ? (
                    <><Globe size={14} /> City</>
                  ) : (
                    <><Navigation size={14} /> Destination</>
                  )}
                </div>
              </div>
              
              <div className="place-details">
                <div className="place-header">
                  <h3 className="place-name">{place.name}</h3>
                  <div className="place-rating">
                    <Star size={16} fill="#F59E0B" color="#F59E0B" />
                    <span>{place.popularity}%</span>
                  </div>
                </div>
                
                <div className="place-location">
                  <MapPin size={16} />
                  <span>{place.country}</span>
                </div>
                
                <p className="place-description">
                  {place.description || `Explore the beautiful ${place.type} of ${place.name}`}
                </p>
                
                <div className="place-footer">
                  {place.average_cost > 0 && (
                    <div className="place-cost">
                      <DollarSign size={16} />
                      <span>${place.average_cost.toFixed(2)}/day</span>
                    </div>
                  )}
                  <button 
                    className="explore-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaceClick(place);
                    }}
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cities;
