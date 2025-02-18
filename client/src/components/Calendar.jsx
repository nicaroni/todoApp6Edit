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
  const [eventTime, setEventTime] = useState("");
  const [eventEmoji, setEventEmoji] = useState("📌");

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
  };

  const openMoreEvents =  (events) => {
    
  }
  // ✅ Save new event
  const addEvent = () => {
    const eventKey = `${selectedDay}-${currentMonth}-${currentYear}`; // ✅ This is correctly defined
    const newEvent = { name: eventName, emoji: eventEmoji }; // ✅ Store name & emoji only
  
    setEvents((prev) => ({
      ...prev,
      [eventKey]: prev[eventKey] ? [...prev[eventKey], newEvent] : [newEvent], // ✅ Use `eventKey` instead of `eventDate`
    }));
  

    setEventName("");
    setShowModal(false);
  };

  return (
    <div className="calendar-container">
      {/* Sidebar: Events List */}
     
      {/* Main Calendar */}
      <div className="custom-calendar">
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
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
           <div id="days-conrainer" className={day === selectedDay ? "active" : ""}
           onClick={() => openEventModal(day)}>
              <div className="num-all">
              <div className="num">
                    {day}
              </div>
            <div className="events-written">
            {events[`${day}-${currentMonth}-${currentYear}`]?.map((event, idx) => (
              <div className="event-item-container ">
                    <p key={idx} className="event-item">
                      {event.emoji} <strong>{event.name}</strong>
                    </p>
                    </div>
                  ))}
          </div>
        </div>
              <button className="show-more" >more</button>
        </div>
          ))}
        </div>

        {/* Selected Date Display */}
        <div className="selected-date">
          📅 Selected: <strong>{selectedDay} {months[currentMonth]} {currentYear}</strong>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="event-modal">
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
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};
export default Calendar;