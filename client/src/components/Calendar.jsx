import React, { useState, useEffect } from "react"; // ✅ Add useEffect

import "../assets/styles/calendar.scss"; // Custom styles

const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [daysInMonth, setDaysInMonth] = useState(
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  );
  const [events, setEvents] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [eventName, setEventName] = useState("");
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const [eventTime, setEventTime] = useState("");
  const [eventEmoji, setEventEmoji] = useState("📌");
  const [selectedEventDate, setSelectedEventDate] = useState(null);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // ✅ Update days when month/year changes
  useEffect(() => {
    setDaysInMonth(new Date(currentYear, currentMonth + 1, 0).getDate());
  }, [currentMonth, currentYear]);

  // ✅ Check if today has events → Trigger alert
  useEffect(() => {
    const todayStr = `${today.getDate()}-${today.getMonth()}-${today.getFullYear()}`;
    if (events[todayStr] && events[todayStr].length > 0) {
      alert(`You have ${events[todayStr].length} event(s) today!`);
    }
  }, [events]);

  // ✅ Open modal when clicking a date
  const openEventModal = (day) => {
    setSelectedDay(day);
    setShowModal(true);
    setSelectedEventDate(null);
  };

  const openMoreEvents =  (day) => {
    setSelectedEventDate(`${day}-${currentMonth}-${currentYear}`);
    setShowModal(true);
    
  }
  // ✅ Save new event
  const addEvent = () => {
    const eventKey = `${selectedDay}-${currentMonth}-${currentYear}`; // ✅ This is correctly defined
    const newEvent = { name: eventName, time: eventTime, emoji: eventEmoji };
  
    setEvents((prev) => ({
      ...prev,
      [eventKey]: prev[eventKey] ? [...prev[eventKey], newEvent] : [newEvent], // ✅ Use `eventKey` instead of `eventDate`
    }));
  

    setEventName("");
    setEventTime("");
    setShowModal(false);
  };

  return (
    <div className="calendar-container">
      {/* Sidebar: Events List */}
     
      {/* Main Calendar */}
      <div className="custom-calendar" >
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
              <div key={day} id="days-container" className={day === selectedDay ? "active" : ""}>
                <div className="num-all">
                  <div className="num">{day}</div>
                  <div className="events-written">
                    {eventList.slice(0,3).map((event, idx) => (
                      <div key={idx} className="event-item-container"     onMouseEnter={(e) => {
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
                    {eventList.length > 3 && (
                      <div className="show-more-container">
                      
                      <button className="show-more" onClick={() => openMoreEvents(day)}>
                      +{eventList.length - 3} more
                      </button> 
                      <button className="add-event-btn" onClick={() => openEventModal(day)}>+</button>
                      </div>
                    )}
                    {eventList.length < 4 && (
                      <div className="show-more-container">
                      <button className="add-event-btn" onClick={() => openEventModal(day)}>+</button>
                     
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
                  </tr>
                </thead>
                <tbody>
                  {events[selectedEventDate].sort((a, b) => a.time.localeCompare(b.time)).map((event, idx) => (
                    <tr key={idx}>
                      <td>{event.emoji}</td>
                      <td>{event.name}</td>
                      <td>{event.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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