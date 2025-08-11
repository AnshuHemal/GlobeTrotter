import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Globe, 
  Home, 
  PlusCircle, 
  MapPin, 
  Calendar,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/my-trips', label: 'My Trips', icon: MapPin },
    { path: '/book-trip', label: 'Book Trip', icon: PlusCircle },
    { path: '/activities', label: 'Activities', icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Globe className="brand-icon" />
          <span className="brand-text">GlobeTrotter</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <Link to="/profile" className={`user-profile ${isActive('/profile') ? 'active' : ''}`}>
            <User size={20} />
            <span className="user-name">{user?.name}</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`mobile-nav-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/profile"
            className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>
          <button 
            onClick={() => {
              handleLogout();
              setIsMobileMenuOpen(false);
            }} 
            className="mobile-logout-btn"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
