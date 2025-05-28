import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from '../config';
import "../assets/styles/calendar.scss";

const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [daysInMonth, setDaysInMonth] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  );
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [eventTime, setEventTime] = useState("");
  const [eventEmoji, setEventEmoji] = useState("📌");
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  const [selectedDateInfo, setSelectedDateInfo] = useState({
    day: today.getDate(),
    month: today.getMonth(),
    year: today.getFullYear()
  });

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Fetch events from the database
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Transform the data to match our current state structure
      const transformedEvents = {};
      
      response.data.forEach(event => {
        const eventDate = new Date(event.event_date);
        const day = eventDate.getDate();
        const month = eventDate.getMonth();
        const year = eventDate.getFullYear();
        
        const eventKey = `${day}-${month}-${year}`;
        
        if (!transformedEvents[eventKey]) {
          transformedEvents[eventKey] = [];
        }
        
        transformedEvents[eventKey].push({
          id: event.event_id,
          name: event.event_name,
          time: event.event_time,
          emoji: event.emoji || "📌",
        });
      });
      
      setEvents(transformedEvents);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
      setLoading(false);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Update days when month/year changes
  useEffect(() => {
    setDaysInMonth(new Date(currentYear, currentMonth + 1, 0).getDate());
  }, [currentMonth, currentYear]);

  // Check if today has events
  useEffect(() => {
    if (!loading) {
      const todayStr = `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`;
      if (events[todayStr] && events[todayStr].length > 0) {
        alert(`You have ${events[todayStr].length} event(s) today!`);
      }
    }
  }, [loading, events]);

  // Open modal when clicking a date
  const openEventModal = (day) => {
    setSelectedDay(day);
    setSelectedDateInfo({
      day: day,
      month: currentMonth,
      year: currentYear
    });
    setShowModal(false); // Don't show modal automatically
    setSelectedEventDate(null);
    
    // Reset form fields
    setEventName("");
    setEventTime("");
    setEventEmoji("📌");
  };

  // Add a new function to handle adding events from the sidebar
  const handleAddEventClick = () => {
    setShowModal(true);
    setSelectedEventDate(null);
  };

  // Get formatted events for the selected date
  const getSelectedDateEvents = () => {
    const { day, month, year } = selectedDateInfo;
    const eventKey = `${day}-${month}-${year}`;
    return events[eventKey] || [];
  };

  // Delete an event
  const deleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Refresh events after deletion
      fetchEvents();
      
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    }
  };

  // Save new event to database
  const addEvent = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please log in to save events");
        return;
      }
      
      // Format date for API
      const eventDate = new Date(currentYear, currentMonth, selectedDay);
      const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      await axios.post(
        `${API_URL}/events`,
        {
          event_name: eventName,
          event_date: formattedDate,
          event_time: eventTime,
          emoji: eventEmoji,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Reset form and close modal
      setEventName("");
      setEventTime("");
      setEventEmoji("📌");
      setShowModal(false);
      
      // Refresh events
      fetchEvents();
      
    } catch (err) {
      console.error("Error saving event:", err);
      alert("Failed to save event");
    }
  };

  // Check if a date is today
  const isToday = (day, month, year) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  // Go to today's date
  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
    setSelectedDateInfo({
      day: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear()
    });
  };

  return (
    <div className="calendar-container">
      {loading && <div className="loading-overlay">Loading events...</div>}
      
      {/* Sidebar: Events List for Selected Date */}
     
      
      {/* Main Calendar */}
      <div className="custom-calendar" >
      <div className="todayIs">
        <div className="todayIs-cont">
          <div className="dateToday-container">
            {isToday(selectedDateInfo.day, selectedDateInfo.month, selectedDateInfo.year) && 
              <div className="today-badge">TODAY</div>
            }
            <div className="dayNum">{selectedDateInfo.day}</div>
            <div className="dayMonth">{months[selectedDateInfo.month]}</div>
            <div className="dayYear">{selectedDateInfo.year}</div>
            {!isToday(selectedDateInfo.day, selectedDateInfo.month, selectedDateInfo.year) && 
              <button className="back-to-today" onClick={goToToday}>
                Back to Today
              </button>
            }
          </div>
        
        </div>
      </div>
        {/* Year Picker */}
        <div className="year-picker">
          <button onClick={() => setCurrentYear(currentYear - 1)}>‹</button>
          <span>{currentYear - 1}</span>
          <strong className="current-year">{currentYear}</strong>
          <span>{currentYear + 1}</span>
          <button onClick={() => setCurrentYear(currentYear + 1)}>›</button>
        </div>

        {/* Month Selector */}
        <div className="month-grid">
          {months.map((month, index) => (
            <button
              key={month}
              className={index === currentMonth ? "active" : ""}
              onClick={() => setCurrentMonth(index)}
            >
              {month}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div className="date-grid">
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const eventKey = `${day}-${currentMonth}-${currentYear}`;
            const eventList = events[eventKey] || [];

            return (
              <div 
                key={day} 
                id="days-container" 
                className={day === selectedDay ? "active" : ""}
                onClick={() => openEventModal(day)}  // Add this onClick handler
              >
                <div className="num-all">
                  <div className="num">{day}</div>
                  <div className="events-written">
                    {eventList.slice(0,2).map((event, idx) => (
                      <div key={idx} className="event-item-container" onClick={(e) => e.stopPropagation()}  onMouseEnter={(e) => {
                        const eventRect = e.currentTarget.getBoundingClientRect();
                        const calendarRect = document.querySelector(".custom-calendar").getBoundingClientRect();
                      
                        setHoveredEvent({ name: event.name, time: event.time, emoji: event.emoji });
                      
                        setHoverPosition({
                          x: eventRect.left - calendarRect.left + 30, // ✅ Keeps it inside the calendar
                          y: eventRect.top - calendarRect.top - 50, // ✅ Places it above the event item
                        });
                      }}
                      onMouseLeave={() => setHoveredEvent(null)}>
                        <div className="event-item">
                          {event.emoji} <strong>{event.name}</strong>
                        </div>
                      </div>
                    ))}
                    {eventList.length > 2 && (
                      <div className="show-more-container">
                        <button className="show-more" onClick={(e) => {
                          e.stopPropagation();
                          openMoreEvents(day);
                        }}>
                          {eventList.length - 2} more
                        </button>
                      </div>
                    )}
                    {eventList.length < 3 && (
                      <div className="show-more-container">
                      </div>
                    )}
                    
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>

        {/* Selected Date Display */}
        <div className="selected-date">
          📅 Selected: <strong>{selectedDay} {months[currentMonth]} {currentYear}</strong>
        </div>
        <div className="selectedDayEvents">
            <h3>Events</h3>
            {getSelectedDateEvents().length > 0 ? (
              <div className="events-list">
                {getSelectedDateEvents().map((event, idx) => (
                  <div key={idx} className="event-card">
                    <div className="event-emoji">{event.emoji}</div>
                    <div className="event-details">
                      <div className="event-name">{event.name}</div>
                      <div className="event-time">{event.time || "No time set"}</div>
                    </div>
                    <button 
                      className="delete-event-btn" 
                      onClick={() => deleteEvent(event.id)}
                      title="Delete event"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">No events scheduled</div>
            )}
            <button 
              className="add-event-sidebar-btn" 
              onClick={handleAddEventClick}
            >
              + Add Event
            </button>
          </div>
      </div>
 {/* Event Modal */}
 {showModal && (
        <div className="event-modal" >
          {selectedEventDate ? (
            <>
              <h3>Events on {selectedEventDate}</h3>
              <table className="event-table">
                <thead>
                  <tr>
                    <th>Emoji</th>
                    <th>Name</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events[selectedEventDate]?.map((event, idx) => (
                    <tr key={idx}>
                      <td>{event.emoji}</td>
                      <td>{event.name}</td>
                      <td>{event.time || "N/A"}</td>
                      <td>
                        <button onClick={() => deleteEvent(event.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => openEventModal(parseInt(selectedEventDate.split('-')[0]))}>
                Add New Event
              </button>
            </>
          ) : (
            <>
              <h3>Add Event for {selectedDay} {months[currentMonth]} {currentYear}</h3>
              <input
                type="text"
                placeholder="Event Name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
              <select value={eventEmoji} onChange={(e) => setEventEmoji(e.target.value)}>
                <option>📌</option>
                <option>🎉</option>
                <option>🏋️</option>
                <option>🎂</option>
                <option>🎭</option>
              </select>
              <button onClick={addEvent}>Save</button>
            </>
          )}
          <button onClick={() => { setShowModal(false); setSelectedEventDate(null); }}>Close</button>
        </div>
      )}
        {hoveredEvent && (
     <div className="hovar-container">
         <div className="hover-modal" style={{ left: `${hoverPosition.x}px`, top: `${hoverPosition.y}px` }} >
        <h4>{hoveredEvent.emoji} {hoveredEvent.name}</h4>00
        <p>Time: {hoveredEvent.time || "N/A"}</p>
      </div>
      
     </div>
     
    
    )}
  


    </div>
  );
};
export default Calendar;



/// TODO made a complex container for todo app, calendar app and pomodoro, to look like
// TODO like thay are sma thing