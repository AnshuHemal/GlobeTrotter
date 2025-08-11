import React, { useState } from 'react';
import Header2 from '../components/Header2';
import { useUser } from '../contexts/UserContext';
import { 
  BsSearch, 
  BsFilter, 
  BsSortDown, 
  BsPlus,
  BsArrowLeft,
  BsArrowRight,
  BsGlobe,
  BsStar,
  BsHeart,
  BsGrid3X3
} from 'react-icons/bs';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { userData, loading } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data for regional selections (4 cards as shown in wireframe)
  const regionalSelections = [
    {
      id: 1,
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898534-47d3c0c8705b?w=300&h=200&fit=crop',
      rating: 4.8,
      price: '$1,200',
      duration: '5 days'
    },
    {
      id: 2,
      name: 'Tokyo, Japan',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop',
      rating: 4.9,
      price: '$2,100',
      duration: '7 days'
    },
    {
      id: 3,
      name: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop',
      rating: 4.7,
      price: '$1,800',
      duration: '6 days'
    },
    {
      id: 4,
      name: 'Sydney, Australia',
      image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=300&h=200&fit=crop',
      rating: 4.6,
      price: '$2,500',
      duration: '8 days'
    }
  ];

  // Mock data for previous trips (3 cards as shown in wireframe)
  const previousTrips = [
    {
      id: 1,
      name: 'European Adventure',
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=250&fit=crop',
      date: 'March 2024',
      duration: '12 days',
      countries: ['France', 'Italy', 'Spain'],
      rating: 5.0
    },
    {
      id: 2,
      name: 'Asian Discovery',
      image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=250&fit=crop',
      date: 'January 2024',
      duration: '15 days',
      countries: ['Japan', 'South Korea', 'Thailand'],
      rating: 4.9
    },
    {
      id: 3,
      name: 'American Road Trip',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
      date: 'November 2023',
      duration: '18 days',
      countries: ['USA', 'Canada'],
      rating: 4.7
    }
  ];

  // Featured destination for banner
  const featuredDestination = {
    name: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=400&fit=crop',
    description: 'Experience the magic of the Mediterranean',
    price: '$2,300',
    duration: '7 days',
    rating: 4.9
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    toast.success(`Filtered by: ${filter}`);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    toast.success(`Sorted by: ${sort}`);
  };

  const handlePlanTrip = () => {
    toast.success('Opening trip planner...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header2 />
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Section */}
        {userData && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {userData.name}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to explore your next adventure? Discover amazing destinations and plan your perfect trip.
            </p>
          </div>
        )}

        {/* Banner Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
          <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600">
            <img 
              src={featuredDestination.image} 
              alt={featuredDestination.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                <BsStar className="text-yellow-400" />
                <span className="text-sm">{featuredDestination.rating} Rating</span>
              </div>
              <h1 className="text-4xl font-bold mb-2">{featuredDestination.name}</h1>
              <p className="text-lg mb-4 opacity-90">{featuredDestination.description}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MdAccessTime className="text-xl" />
                  <span>{featuredDestination.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BsGlobe className="text-xl" />
                  <span className="text-2xl font-bold">{featuredDestination.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="flex-1 w-full">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search destinations, activities, or experiences..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </form>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Destinations</option>
                <option value="beach">Beach</option>
                <option value="mountain">Mountain</option>
                <option value="city">City</option>
                <option value="cultural">Cultural</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top Regional Selections */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Top Regional Selections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regionalSelections.map((destination) => (
              <div key={destination.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                    <BsHeart className="text-gray-600 hover:text-red-500" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1">
                      <BsStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-semibold">{destination.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{destination.name}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <MdAccessTime />
                      {destination.duration}
                    </span>
                    <span className="font-semibold text-blue-600">{destination.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Previous Trips */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Previous Trips</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {previousTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={trip.image} 
                    alt={trip.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white bg-opacity-90 rounded-lg px-2 py-1">
                    <div className="flex items-center gap-1">
                      <BsStar className="text-yellow-400 text-sm" />
                      <span className="text-sm font-semibold">{trip.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{trip.name}</h3>
                  <p className="text-gray-600 mb-3">{trip.date} • {trip.duration}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.countries.map((country, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan a Trip Button - Fixed Position */}
      <button
        onClick={handlePlanTrip}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Plan a trip"
      >
        <BsPlus className="text-2xl" />
      </button>

      {/* Navigation Arrows */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-4 z-40">
        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <BsArrowLeft className="text-gray-600" />
        </button>
        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
          <BsArrowRight className="text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;