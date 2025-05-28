import React, { useState, useEffect, useRef } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const EVENTS_PER_PAGE = 5; // Number of events to show per page
  const [sliderPosition, setSliderPosition] = useState(0);
  const eventsContainerRef = useRef(null);

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
        // Extract date parts directly without letting JavaScript apply timezone conversion
        const dateParts = event.event_date.split('T')[0].split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        
        // THIS IS THE KEY FIX - add 1 to the day to correct the timezone shift
        // Only if your database is consistently showing events one day earlier
        const day = parseInt(dateParts[2]) + 1;
        
        console.log("Processing event:", {
          original: event.event_date,
          adjusted: `${day}-${month}-${year}`,
          name: event.event_name
        });
        
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
    // First update the selected date info
    setSelectedDateInfo({
      day: day,
      month: currentMonth,
      year: currentYear
    });
    
    // Then update the selected day (for UI highlighting)
    setSelectedDay(day);
    
    // Set the modal to show a form for adding a new event
    setShowModal(false);
    setSelectedEventDate(null);
    
    // Reset slider position and scroll
    setSliderPosition(0);
    if (eventsContainerRef.current) {
      eventsContainerRef.current.scrollTop = 0;
    }
    
    // Reset form fields
    setEventName("");
    setEventTime("");
    setEventEmoji("📌");
    
    // Add debug log to verify the correct date is selected
    console.log("Selected date:", day, months[currentMonth], currentYear);
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
      
      // Format date for API - use the selectedDateInfo object
      const { day, month, year } = selectedDateInfo;
      
      // Manually format the date string without timezone issues
      // Month is 0-indexed in JS Date, so add 1 and ensure 2 digits
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      console.log("Adding event for:", {
        day: day,
        month: months[month],
        year: year,
        formattedDate: formattedDate
      });
      
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
                    {eventList.slice(0,1).map((event, idx) => (
                      <div key={idx} className="event-item-container" 
  onClick={(e) => e.stopPropagation()}  
  onMouseEnter={(e) => {
    const eventRect = e.currentTarget.getBoundingClientRect();
    const calendarRect = document.querySelector(".custom-calendar").getBoundingClientRect();
    
    // Get all events for this day instead of just the hovered event
    const allDayEvents = events[`${day}-${currentMonth}-${currentYear}`] || [];
    
    // Set all events for the day as the hovered content
    setHoveredEvent({
      dayEvents: allDayEvents,
      day: day,
      month: currentMonth,
      year: currentYear
    });
    
    setHoverPosition({
      x: eventRect.left - calendarRect.left + 30,
      y: eventRect.top - calendarRect.top - 50,
    });
  }}
  onMouseLeave={() => setHoveredEvent(null)}
>
  <div className="event-item">
    {event.emoji}<strong>{eventList.length}</strong>
  </div>
</div>
                    ))}
                    
                    
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
    <div className="events-scroll-container">
      <div 
        className="events-wrapper" 
        ref={eventsContainerRef}
        onScroll={(e) => {
          if (eventsContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            const maxScroll = scrollHeight - clientHeight;
            if (maxScroll > 0) {
              setSliderPosition((scrollTop / maxScroll) * 100);
            }
          }
        }}
      >
        <table className="events-table">
          <thead>
            <tr>
              <th>Emoji</th>
              <th>Name</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {getSelectedDateEvents().map((event, idx) => (
              <tr key={idx} className="event-row">
                <td className="event-emoji">{event.emoji}</td>
                <td className="event-name">{event.name}</td>
                <td className="event-time">{event.time || "—"}</td>
                <td>
                  <button 
                    className="delete-event-btn" 
                    onClick={() => deleteEvent(event.id)}
                    title="Delete event"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {getSelectedDateEvents().length > 4 && (
        <div className="scroll-slider-container">
          <div 
            className="scroll-slider-track"
            onClick={(e) => {
              // Calculate click position relative to track height
              const trackRect = e.currentTarget.getBoundingClientRect();
              const clickPosition = e.clientY - trackRect.top;
              const trackHeight = trackRect.height;
              const percentage = (clickPosition / trackHeight) * 100;
              
              setSliderPosition(percentage);
              
              // Set scroll position
              if (eventsContainerRef.current) {
                const { scrollHeight, clientHeight } = eventsContainerRef.current;
                const maxScroll = scrollHeight - clientHeight;
                eventsContainerRef.current.scrollTop = (percentage / 100) * maxScroll;
              }
            }}
          >
            <div 
              className="scroll-slider-thumb"
              style={{ top: `${sliderPosition}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                
                const trackRect = e.currentTarget.parentElement.getBoundingClientRect();
                const thumbHeight = e.currentTarget.offsetHeight;
                
                const handleMouseMove = (moveEvent) => {
                  // Calculate position within constraints
                  const mouseY = moveEvent.clientY;
                  const trackTop = trackRect.top;
                  const trackHeight = trackRect.height;
                  
                  let newPosition = ((mouseY - trackTop) / trackHeight) * 100;
                  newPosition = Math.max(0, Math.min(newPosition, 100));
                  
                  setSliderPosition(newPosition);
                  
                  // Update scroll position
                  if (eventsContainerRef.current) {
                    const { scrollHeight, clientHeight } = eventsContainerRef.current;
                    const maxScroll = scrollHeight - clientHeight;
                    eventsContainerRef.current.scrollTop = (newPosition / 100) * maxScroll;
                  }
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </div>
        </div>
      )}
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
              <button 
                onClick={addEvent}
                className="save-event-btn"
                style={{
                  backgroundColor: "#6f42c1",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  border: "none",
                  marginTop: "10px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Save Event
              </button>
            </>
          )}
          <button onClick={() => { setShowModal(false); setSelectedEventDate(null); }}>Close</button>
        </div>
      )}
        {hoveredEvent && (
  <div className="hovar-container">
    <div className="hover-modal" style={{ left: `${hoverPosition.x}px`, top: `${hoverPosition.y}px` }}>
      <h4>Events on {hoveredEvent.day} {months[hoveredEvent.month]} {hoveredEvent.year}</h4>
      <table className="hover-events-table">
        <thead>
          <tr>
            <th>Emoji</th>
            <th>Event</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {hoveredEvent.dayEvents.map((event, idx) => (
            <tr key={idx}>
              <td>{event.emoji}</td>
              <td>{event.name}</td>
              <td>{event.time || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

    </div>
  );
};
export default Calendar;



/// TODO made a complex container for todo app, calendar app and pomodoro, to look like
// TODO like thay are sma thing