import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit3, 
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye
} from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import './TripCalendar.css';

const TripCalendar = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // calendar or timeline

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      const [tripRes, itineraryRes] = await Promise.all([
        axios.get(`/api/trips/${tripId}`),
        axios.get(`/api/trips/${tripId}/itinerary`)
      ]);
      
      setTrip(tripRes.data.trip);
      setItinerary(itineraryRes.data.itinerary || []);
      
      // Set initial selected date to trip start date
      if (tripRes.data.trip.startDate) {
        setSelectedDate(new Date(tripRes.data.trip.startDate));
      }
    } catch (error) {
      console.error('Error fetching trip data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivitiesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return itinerary.filter(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      return itemDate === dateStr;
    });
  };

  const getTripDates = () => {
    if (!trip?.startDate || !trip?.endDate) return [];
    
    const dates = [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date));
    }
    
    return dates;
  };

  const isDateInTrip = (date) => {
    if (!trip?.startDate || !trip?.endDate) return false;
    
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    
    return date >= start && date <= end;
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    
    const classes = [];
    
    if (isDateInTrip(date)) {
      classes.push('trip-date');
    }
    
    const activities = getActivitiesForDate(date);
    if (activities.length > 0) {
      classes.push('has-activities');
    }
    
    if (date.toDateString() === selectedDate.toDateString()) {
      classes.push('selected-date');
    }
    
    return classes.join(' ');
  };

  const getTileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const activities = getActivitiesForDate(date);
    if (activities.length === 0) return null;
    
    return (
      <div className="date-activities">
        <div className="activity-count">{activities.length}</div>
      </div>
    );
  };

  const selectedDateActivities = getActivitiesForDate(selectedDate);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="trip-calendar">
      <div className="container">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="header-content">
            <h1>Trip Calendar</h1>
            <h2>{trip?.name}</h2>
            <div className="trip-dates">
              <CalendarIcon size={16} />
              {trip?.startDate && new Date(trip.startDate).toLocaleDateString()} - {trip?.endDate && new Date(trip.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/trip/${tripId}/build`} className="btn btn-secondary">
              <Edit3 size={18} />
              Edit Trip
            </Link>
            <Link to={`/trip/${tripId}/view`} className="btn btn-primary">
              <Eye size={18} />
              View Itinerary
            </Link>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="view-controls">
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={16} />
              Calendar View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              <Clock size={16} />
              Timeline View
            </button>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="calendar-content">
          {viewMode === 'calendar' ? (
            <div className="calendar-view">
              <div className="calendar-section">
                <div className="calendar-wrapper">
                  <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    tileClassName={getTileClassName}
                    tileContent={getTileContent}
                    minDate={trip?.startDate ? new Date(trip.startDate) : undefined}
                    maxDate={trip?.endDate ? new Date(trip.endDate) : undefined}
                    showNeighboringMonth={false}
                  />
                </div>
                
                <div className="calendar-legend">
                  <div className="legend-item">
                    <div className="legend-color trip-date"></div>
                    <span>Trip Days</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color has-activities"></div>
                    <span>Days with Activities</span>
                  </div>
                </div>
              </div>

              <div className="day-details">
                <div className="day-header">
                  <h3>{selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</h3>
                  {isDateInTrip(selectedDate) && (
                    <span className="day-status">Day {Math.ceil((selectedDate - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1}</span>
                  )}
                </div>

                {selectedDateActivities.length > 0 ? (
                  <div className="activities-list">
                    {selectedDateActivities.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-time">
                          <Clock size={16} />
                          {activity.time || 'All Day'}
                        </div>
                        <div className="activity-content">
                          <h4>{activity.name}</h4>
                          <div className="activity-meta">
                            <span className="activity-location">
                              <MapPin size={14} />
                              {activity.location || activity.city}
                            </span>
                            {activity.cost && (
                              <span className="activity-cost">
                                <DollarSign size={14} />
                                ${activity.cost}
                              </span>
                            )}
                          </div>
                          {activity.description && (
                            <p className="activity-description">{activity.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-activities">
                    {isDateInTrip(selectedDate) ? (
                      <>
                        <CalendarIcon size={48} />
                        <h4>No activities planned</h4>
                        <p>Add some activities to make the most of this day!</p>
                        <Link to={`/trip/${tripId}/build`} className="btn btn-primary">
                          <Plus size={16} />
                          Add Activities
                        </Link>
                      </>
                    ) : (
                      <>
                        <CalendarIcon size={48} />
                        <h4>Outside trip dates</h4>
                        <p>This date is not part of your trip itinerary.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="timeline-view">
              <div className="timeline-container">
                {getTripDates().map((date, index) => {
                  const dayActivities = getActivitiesForDate(date);
                  const dayNumber = index + 1;
                  
                  return (
                    <div key={date.toISOString()} className="timeline-day">
                      <div className="timeline-marker">
                        <div className="marker-dot">{dayNumber}</div>
                        {index < getTripDates().length - 1 && <div className="marker-line"></div>}
                      </div>
                      
                      <div className="timeline-content">
                        <div className="day-card">
                          <div className="day-header">
                            <h3>Day {dayNumber}</h3>
                            <span className="day-date">
                              {date.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          {dayActivities.length > 0 ? (
                            <div className="day-activities">
                              {dayActivities.map((activity, actIndex) => (
                                <div key={actIndex} className="timeline-activity">
                                  <div className="activity-time">
                                    <Clock size={14} />
                                    {activity.time || 'All Day'}
                                  </div>
                                  <div className="activity-info">
                                    <h4>{activity.name}</h4>
                                    <div className="activity-details">
                                      {activity.location && (
                                        <span>
                                          <MapPin size={12} />
                                          {activity.location}
                                        </span>
                                      )}
                                      {activity.cost && (
                                        <span>
                                          <DollarSign size={12} />
                                          ${activity.cost}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="no-day-activities">
                              <p>No activities planned for this day</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripCalendar;
