import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { tripsApi } from '../services/api';
import { Calendar, MapPin, Star, Users, DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/PaymentModal';
import './BookTrip.css';

const BookTrip = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingStatus, setBookingStatus] = useState({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [filters, setFilters] = useState({
    destination: '',
    duration: '',
    budget: '',
    category: ''
  });
  const navigate = useNavigate();

  // Handle package selection and open payment modal
  const handleBookNow = (pkg) => {
    setSelectedPackage(pkg);
    setShowPaymentModal(true);
  };

  // Handle successful payment and trip creation
  const handlePaymentSuccess = async () => {
    if (!selectedPackage) return;

    try {
      setBookingStatus(prev => ({ ...prev, [selectedPackage.id]: 'booking' }));
      
      // Prepare trip data
      const tripData = {
        package_id: selectedPackage.id,
        title: selectedPackage.title,
        description: selectedPackage.description,
        start_date: new Date(), // You might want to make this dynamic
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
        destination: selectedPackage.subtitle?.split('with ')[1] || selectedPackage.title,
        total_budget: selectedPackage.current_price
      };

      let response;
      try {
        // Try new API service first
        response = await tripsApi.bookPackage(tripData);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to direct axios call
        response = await axios.post('/api/trips/user/book', tripData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.data?.success || response.status === 200) {
        setBookingStatus(prev => ({ ...prev, [selectedPackage.id]: 'success' }));
        // Redirect to My Trips after a short delay
        setTimeout(() => {
          navigate('/my-trips');
        }, 1500);
      } else {
        throw new Error(response.data?.message || 'Failed to book trip');
      }
    } catch (err) {
      console.error('Error booking trip:', err);
      setError('Failed to book the trip. Please try again.');
      setBookingStatus(prev => ({ ...prev, [selectedPackage.id]: 'error' }));
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [selectedPackage.id]: null }));
        setError('');
      }, 3000);
    } finally {
      setShowPaymentModal(false);
      setSelectedPackage(null);
    }
  };

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        let response;
        try {
          // Try new API service first
          response = await tripsApi.getPackages();
          console.log('Packages API response:', response);
          
          // Handle both array response and nested data structure
          let packagesData = Array.isArray(response.data) ? response.data : (response.data?.packages || []);
          
          // Process each package to ensure consistent data structure
          packagesData = packagesData.map(pkg => ({
            ...pkg,
            // Ensure price fields are numbers and have fallbacks
            current_price: parseFloat(pkg.current_price || pkg.currentPrice || 0),
            old_price: parseFloat(pkg.old_price || pkg.originalPrice || 0),
            save_amount: parseFloat(pkg.save_amount || pkg.savings || 0),
            // Ensure image URL is properly set
            image_url: pkg.image_url || pkg.image || '',
            // Ensure rating is a number
            rating: parseFloat(pkg.rating) || 0
          }));
          
          console.log('Processed packages data:', packagesData);
          setPackages(packagesData);
        } catch (apiError) {
          console.warn('Primary API failed, falling back to direct URL', apiError);
          // Fallback to direct axios call
          const fallbackResponse = await axios.get('/api/packages', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          setPackages(Array.isArray(fallbackResponse.data) ? fallbackResponse.data : (fallbackResponse.data?.packages || []));
        }
      } catch (err) {
        console.error('Error fetching packages:', err);
        setError(err.response?.data?.message || 'Failed to load packages. Please try again later.');
        
        // Set dummy data if API fails
        setPackages([
          {
            id: '1',
            title: 'Adventure Package',
            subtitle: 'Explore the mountains with Adventure Package',
            current_price: 999,
            original_price: 1299,
            rating: 4.8,
            review_count: 124,
            duration: '7 days',
            destinations: ['Mountain Peak', 'Forest Trail'],
            image_url: 'https://example.com/adventure.jpg',
            category: 'adventure'
          },
          // Add more dummy packages as needed
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleBookPackage = async (packageId) => {
    // Find the package being booked
    const packageToBook = packages.find(pkg => pkg.id === packageId);
    
    if (!packageToBook) {
      setError('Package not found');
      return;
    }
    
    // Update booking status to show loading
    setBookingStatus(prev => ({ ...prev, [packageId]: 'booking' }));
    
    try {
      // Send booking request to backend
      const response = await axios.post('/api/trips/user/book', {
        package_id: packageId
      });
      
      if (response.data.success) {
        // Update booking status to show success
        setBookingStatus(prev => ({ ...prev, [packageId]: 'success' }));
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setBookingStatus(prev => ({ ...prev, [packageId]: null }));
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to book trip');
      }
    } catch (err) {
      console.error('Error booking package:', err);
      setError('Failed to book the package. Please try again.');
      setBookingStatus(prev => ({ ...prev, [packageId]: 'error' }));
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setBookingStatus(prev => ({ ...prev, [packageId]: null }));
        setError('');
      }, 3000);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    return (
      (filters.destination === '' || pkg.title.toLowerCase().includes(filters.destination.toLowerCase())) &&
      (filters.category === '' || pkg.category === filters.category) &&
      (filters.budget === '' || 
        (filters.budget === 'low' && pkg.currentPrice < 30000) ||
        (filters.budget === 'medium' && pkg.currentPrice >= 30000 && pkg.currentPrice < 50000) ||
        (filters.budget === 'high' && pkg.currentPrice >= 50000)
      )
    );
  });

  if (loading) {
    return (
      <div className="book-trip">
        <div className="container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading amazing travel packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-trip">
      <div className="container">
        <div className="book-trip-header">
          <h1>Book Your Dream Trip</h1>
          <p>Discover amazing travel packages curated just for you</p>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search destinations..."
              value={filters.destination}
              onChange={(e) => handleFilterChange('destination', e.target.value)}
              className="filter-input"
            />
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Adventure">Adventure</option>
              <option value="Cultural">Cultural</option>
              <option value="Beach">Beach</option>
              <option value="Nature">Nature</option>
            </select>
            <select
              value={filters.budget}
              onChange={(e) => handleFilterChange('budget', e.target.value)}
              className="filter-select"
            >
              <option value="">All Budgets</option>
              <option value="low">Under ₹30,000</option>
              <option value="medium">₹30,000 - ₹50,000</option>
              <option value="high">Above ₹50,000</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="packages-grid">
          {filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="package-card"
              onClick={() => navigate(`/trip/${pkg.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="package-image">
                <img src={pkg.image_url || pkg.image} alt={pkg.title} />
                <div className="package-rating">
                  <Star size={14} fill="#FFD700" color="#FFD700" />
                  <span>{pkg.rating || 4.5}</span>
                </div>
              </div>
              
              <div className="package-content">
                <div className="package-duration">{pkg.duration}</div>
                <h3 className="package-title">{pkg.title}</h3>
                <p className="package-subtitle">{pkg.subtitle || pkg.location}</p>
                
                <div className="package-savings">
                  Save ₹{(pkg.save_amount || pkg.savings || 0).toLocaleString('en-IN')}
                </div>
                
                <div className="package-pricing">
                  <span className="current-price">₹ {(pkg.current_price || pkg.currentPrice || 0).toLocaleString('en-IN')}</span>
                  {(pkg.old_price || pkg.originalPrice) > (pkg.current_price || pkg.currentPrice) && (
                    <span className="original-price">₹ {(pkg.old_price || pkg.originalPrice || 0).toLocaleString('en-IN')}</span>
                  )}
                </div>
                
                <button 
                  className="book-btn"
                  onClick={(e) => { e.stopPropagation(); handleBookPackage(pkg.id); }}
                  disabled={bookingStatus[pkg.id] === 'booking'}
                >
                  {bookingStatus[pkg.id] === 'booking' ? (
                    <>
                      <div className="spinner-small"></div>
                      Booking...
                    </>
                  ) : bookingStatus[pkg.id] === 'success' ? (
                    <>
                      <CheckCircle size={16} />
                      Booked!
                    </>
                  ) : (
                    'Book Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>No packages found</h3>
            <p>Try adjusting your filters to see more options</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookTrip;
