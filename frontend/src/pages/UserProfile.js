import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userApi } from '../services/api';
import { 
  User, 
  Mail, 
  Globe, 
  Camera, 
  Save, 
  Trash2, 
  MapPin, 
  Settings,
  LogOut,
  AlertTriangle,
  Heart
} from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: '',
    email: '',
    photo: '',
    language: 'en',
    bio: ''
  });
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchSavedDestinations();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Fallback to old API URL if needed
      let response;
      try {
        response = await userApi.getProfile();
        setUser(response.data.user || response.data);
        setPhotoPreview((response.data.user?.photo || response.data?.photo) || '');
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        const fallbackResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(fallbackResponse.data.user || fallbackResponse.data);
        setPhotoPreview((fallbackResponse.data.user?.photo || fallbackResponse.data?.photo) || '');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedDestinations = async () => {
    try {
      let response;
      try {
        // Try new API service first
        response = await userApi.getSavedDestinations();
        setSavedDestinations(response.data.destinations || response.data || []);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to old API URL
        const fallbackResponse = await axios.get('http://localhost:5000/api/user/saved-destinations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSavedDestinations(fallbackResponse.data.destinations || fallbackResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching saved destinations:', error);
      setError('Failed to load saved destinations');
      // Set empty array as fallback
      setSavedDestinations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setUser(prev => ({
          ...prev,
          photo: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let response;
      try {
        // Try new API service first
        response = await userApi.updateProfile(user);
        setUser(response.data.user || response.data);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to old API URL
        response = await axios.put('http://localhost:5000/api/auth/me', user, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        setUser(response.data.user || response.data);
      }
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDestination = async (destinationId) => {
    if (!window.confirm('Are you sure you want to remove this destination from your saved list?')) {
      return;
    }

    try {
      try {
        // Try new API service first
        await userApi.removeSavedDestination(destinationId);
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to old API URL
        await axios.delete(`http://localhost:5000/api/user/saved-destinations/${destinationId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      // Update the UI by filtering out the removed destination
      setSavedDestinations(prev => prev.filter(dest => dest.id !== destinationId));
      setSuccess('Destination removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing destination:', error);
      setError(error.response?.data?.message || 'Failed to remove destination');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      try {
        // Try new API service first if available
        if (userApi.deleteAccount) {
          await userApi.deleteAccount();
        } else {
          // Fallback to direct URL
          await axios.delete('http://localhost:5000/api/user/account', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        }
      } catch (apiError) {
        console.warn('Primary API failed, falling back to direct URL', apiError);
        // Fallback to old API URL
        await axios.delete('http://localhost:5000/api/user/account', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="user-profile">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="header-content">
          <h1>
            <Settings size={28} />
            Profile & Settings
          </h1>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Save size={20} />
          {success}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2>Personal Information</h2>
          
          <div className="photo-section">
            <div className="photo-container">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-photo" />
              ) : (
                <div className="photo-placeholder">
                  <User size={48} />
                </div>
              )}
              <label className="photo-upload">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  hidden
                />
                Change Photo
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>
              <User size={20} />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>
              <Mail size={20} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={user.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>
              <Globe size={20} />
              Language Preference
            </label>
            <select
              name="language"
              value={user.language}
              onChange={handleInputChange}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
              <option value="ja">Japanese</option>
              <option value="ko">Korean</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <button 
            onClick={handleSaveProfile} 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="profile-section">
          <h2>
            <Heart size={24} />
            Saved Destinations ({savedDestinations.length})
          </h2>
          
          {savedDestinations.length === 0 ? (
            <div className="empty-state">
              <MapPin size={48} />
              <p>No saved destinations yet</p>
              <p className="empty-subtitle">Start exploring and save places you'd like to visit!</p>
            </div>
          ) : (
            <div className="destinations-grid">
              {savedDestinations.map((destination) => (
                <div key={destination.id} className="destination-card">
                  <div className="destination-image">
                    {destination.image ? (
                      <img src={destination.image} alt={destination.name} />
                    ) : (
                      <div className="image-placeholder">
                        <MapPin size={32} />
                      </div>
                    )}
                  </div>
                  <div className="destination-info">
                    <h4>{destination.name}</h4>
                    <p>{destination.country}</p>
                    <p className="saved-date">
                      Saved on {new Date(destination.saved_date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveDestination(destination.id)}
                    className="remove-btn"
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-section danger-zone">
          <h2>
            <AlertTriangle size={24} />
            Danger Zone
          </h2>
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              <Trash2 size={20} />
              Delete Account
            </button>
          ) : (
            <div className="delete-confirm">
              <p><strong>Are you absolutely sure?</strong></p>
              <p>This will permanently delete your account and all associated data.</p>
              <div className="confirm-buttons">
                <button 
                  onClick={handleDeleteAccount}
                  className="btn-danger"
                >
                  Yes, Delete My Account
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
