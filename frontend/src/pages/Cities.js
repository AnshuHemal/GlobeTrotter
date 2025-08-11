import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Clock, DollarSign, Loader2 } from 'lucide-react';
import './Cities.css';

const Cities = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: '',
    category: '',
    sort: '-popularity_score',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
  });

  // Fetch destinations with current filters and pagination
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: pagination.page,
        page_size: pagination.pageSize,
        ...(filters.country && { country: filters.country }),
        ...(filters.category && { category: filters.category }),
        sort: filters.sort,
      });

      const response = await axios.get(`/api/destinations/?${params}`);
      const { results, count, page, page_size, total_pages } = response.data;
      
      setDestinations(results);
      setPagination(prev => ({
        ...prev,
        total: count,
        totalPages: total_pages,
        page: page,
        pageSize: page_size,
      }));
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch destinations when component mounts or filters/pagination changes
  useEffect(() => {
    fetchDestinations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage,
      }));
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Extract unique categories for filter dropdown
  const categories = [
    'beach', 'mountain', 'city', 'historical', 'adventure', 'cultural'
  ];
  
  // Format category for display (capitalize first letter)
  const formatCategory = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading && destinations.length === 0) {
    return (
      <div className="loading-container">
        <Loader2 className="animate-spin" size={48} />
        <p>Loading destinations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={fetchDestinations}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="cities-container">
      <header className="cities-header">
        <div className="header-content">
          <h1>Explore Amazing Destinations</h1>
          <p>Discover your next adventure in these beautiful locations around the world</p>
        </div>
      </header>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            placeholder="Filter by country..."
            value={filters.country}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {formatCategory(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort">Sort By:</label>
          <select
            id="sort"
            name="sort"
            value={filters.sort}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="-popularity_score">Most Popular</option>
            <option value="name">Name (A-Z)</option>
            <option value="-name">Name (Z-A)</option>
            <option value="average_cost_per_day">Price: Low to High</option>
            <option value="-average_cost_per_day">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="destinations-grid">
        {destinations.map((destination) => (
          <div key={destination.id} className="destination-card">
            <div className="card-image">
              {destination.image_url ? (
                <img 
                  src={destination.image_url} 
                  alt={destination.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Available';
                  }}
                />
              ) : (
                <div className="image-placeholder">
                  <MapPin size={32} />
                  <span>No Image Available</span>
                </div>
              )}
              {destination.category && (
                <span className="category-badge">
                  {destination.category}
                </span>
              )}
            </div>
            <div className="card-content">
              <div className="card-header">
                <h3>{destination.name}</h3>
                <div className="location">
                  <MapPin size={16} />
                  <span>{destination.country}</span>
                </div>
              </div>
              
              <p className="description">
                {destination.description?.substring(0, 100)}
                {destination.description?.length > 100 ? '...' : ''}
              </p>
              
              <div className="card-details">
                <div className="detail-item">
                  <DollarSign size={16} />
                  <span>${destination.average_cost_per_day || 'N/A'}/day</span>
                </div>
                {destination.best_time_to_visit && (
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>Best time: {destination.best_time_to_visit}</span>
                  </div>
                )}
              </div>
              
              <Link 
                to={`/destinations/${destination.id}`} 
                className="view-details-button"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-button"
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-number ${pagination.page === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <span className="ellipsis">...</span>
            )}
            
            {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className={`pagination-number ${pagination.page === pagination.totalPages ? 'active' : ''}`}
              >
                {pagination.totalPages}
              </button>
            )}
          </div>
          
          <button 
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
      
      {destinations.length === 0 && !loading && (
        <div className="no-results">
          <h3>No destinations found</h3>
          <p>Try adjusting your filters or search criteria</p>
          <button 
            onClick={() => {
              setFilters({
                country: '',
                category: '',
                sort: '-popularity_score',
              });
              setPagination(prev => ({
                ...prev,
                page: 1,
              }));
            }}
            className="clear-filters-button"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Cities;
