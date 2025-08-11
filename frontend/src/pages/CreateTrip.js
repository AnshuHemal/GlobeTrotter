import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, FileText, Image, Save } from 'lucide-react';
import './CreateTrip.css';

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    coverImage: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('startDate', formData.startDate);
      formDataToSend.append('endDate', formData.endDate);
      if (formData.coverImage) {
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const response = await axios.post('/api/trips/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate(`/trip/${response.data.trip.id}/build`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-trip">
      <div className="container">
        <div className="create-trip-header">
          <h1>Plan Your Next Adventure</h1>
          <p>Start by giving your trip a name and setting the basic details</p>
        </div>

        <div className="create-trip-content">
          <form onSubmit={handleSubmit} className="trip-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <MapPin size={18} />
                Trip Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., European Adventure 2024"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate" className="form-label">
                  <Calendar size={18} />
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate" className="form-label">
                  <Calendar size={18} />
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="form-input"
                  min={formData.startDate}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                <FileText size={18} />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Tell us about your trip plans, goals, or any special requirements..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="coverImage" className="form-label">
                <Image size={18} />
                Cover Image (Optional)
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  onChange={handleChange}
                  className="file-input"
                  accept="image/*"
                />
                <label htmlFor="coverImage" className="file-input-label">
                  <Image size={20} />
                  {formData.coverImage ? formData.coverImage.name : 'Choose an image'}
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Save size={18} />
                {loading ? 'Creating Trip...' : 'Create Trip'}
              </button>
            </div>
          </form>

          <div className="trip-preview">
            <div className="preview-card">
              <div className="preview-image">
                {formData.coverImage ? (
                  <img 
                    src={URL.createObjectURL(formData.coverImage)} 
                    alt="Trip preview" 
                  />
                ) : (
                  <div className="preview-placeholder">
                    <MapPin size={32} />
                    <span>Trip Preview</span>
                  </div>
                )}
              </div>
              <div className="preview-content">
                <h3>{formData.name || 'Your Trip Name'}</h3>
                <div className="preview-dates">
                  {formData.startDate && formData.endDate ? (
                    <span>
                      {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>Select your travel dates</span>
                  )}
                </div>
                <p>{formData.description || 'Add a description to your trip...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTrip;
