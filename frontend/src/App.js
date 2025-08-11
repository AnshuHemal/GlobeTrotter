import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import TripBudget from './pages/TripBudget';
import TripCalendar from './pages/TripCalendar';
import SharedItinerary from './pages/SharedItinerary';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/shared/:tripId" element={<SharedItinerary />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Navbar />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/create-trip" element={<CreateTrip />} />
                    <Route path="/my-trips" element={<MyTrips />} />
                    <Route path="/trip/:tripId/build" element={<ItineraryBuilder />} />
                    <Route path="/trip/:tripId/view" element={<ItineraryView />} />
                    <Route path="/trip/:tripId/budget" element={<TripBudget />} />
                    <Route path="/trip/:tripId/calendar" element={<TripCalendar />} />
                    <Route path="/cities" element={<CitySearch />} />
                    <Route path="/activities" element={<ActivitySearch />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
