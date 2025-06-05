import React, { useState } from "react";
import axios from "axios";
import API_URL from '../config';


const TodoItem = ({ todo, dispatch, startPomodoro }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(todo.description);
  const [isCompleted, setIsCompleted] = useState(todo.completed);
  
  const [hoveredEvent, setHoveredEvent] = useState(null);
   const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });


  const handleComplete = async () => { // Make it async
    const updatedTodo = { ...todo, completed: !isCompleted };
  
    try {
      // Send PUT request to update the completed status in the backend
      await axios.put(
        `${API_URL}/todos/${todo.todo_id}`,
        { description: todo.description, completed: updatedTodo.completed },
        { headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` } }
      );
      
  
      // Dispatch to update the local state with the new completed status
      dispatch({
        type: "TOGGLE_TODO_COMPLETED",
        payload: { ...todo, completed: updatedTodo.completed },
      });
      setIsCompleted(updatedTodo.completed); // Update the completed status locally
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };
  

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken"); // Get the token from localStorage
    if (!token) {
      console.error("No token found, please log in.");
      return; // Prevent the request from being sent if there's no token
    }

    try {
      // Send DELETE request to the backend to delete the todo
      await axios.delete(`${API_URL}/todos/${todo.todo_id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,  // Attach token here
        },
      });

      dispatch({ type: "DELETE_TODO", payload: todo.todo_id });  // Update state after successful deletion
    } catch (err) {
      console.error("Error deleting todo:", err);
    }
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found, please log in.");
      return;
    }
  
    try {
      // Send PUT request to update the todo's description on the backend
      const response = await axios.put(
       `${API_URL}/todos/${todo.todo_id}`,
        { description: input,
          completed: isCompleted,
         },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      // Dispatch to update the local state with the new description
      dispatch({
        type: "UPDATE_TODO",
        payload: { ...todo, description: response.data.description, completed: response.data.completed }, // Update with backend response
      });
      setIsEditing(false); // Exit edit mode
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };
  
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handlePomodoroEnd = async (todoId) => {
    try {
      await axios.put(
        `${API_URL}/todos/${todoId}/time`,
        { minutes: 25 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
  
      console.log(`Added 25 minutes to todo ${todoId}`);
    } catch (err) {
      console.error("Error updating time:", err);
    }
  };
  

  

  return (
    <tr className={`todo-item-row ${isCompleted ? "completed" : ""}`}>
      <td className="circle" onClick={handleComplete} onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredEvent(true);
          setHoverPosition({ x: rect.left + 30, y: rect.top - 10 });
        }}
        onMouseLeave={() => {
          setTimeout(() => setHoveredEvent(false), 700);
        }}>
        {todo.completed ? "✓" : ""}
      </td>
      <td className="todo-content-cell">
        <div className="todo-date-container">
          <div className="todo-date">{formatDate(todo.created_at)}</div>
          <div className="todo-description">
            {isEditing ? (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit();
                  }
                }}
                className="form-control"
              />
            ) : (
              <span onClick={() => setIsEditing(true)}>{todo.description}</span>
            )}
          </div>
        </div>
      </td>
      <td className="todo-time-spent">
        <div className="emoji-timer">⏳</div>
        <div className="time-spent-text">{todo.time_spent || 0} min</div>
      </td>
      <td className="delete-btn-cell">
        <button className="delete-btn" onClick={handleDelete}>Delete</button>
      </td>
      
      {/* Show clock icon on hover */}
      
      {hoveredEvent && (
        <div
          className="hover-pom-container"
          onMouseEnter={() => setHoveredEvent(true)} // Prevent disappearance when moving to the icon
          onMouseLeave={() => setHoveredEvent(false)} // Hide when leaving
          style={{
            position: "absolute",
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            background: "#fff",
            padding: "6px",
            borderRadius: "5px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            cursor: "pointer",
            maxWidth: "100px"
          }}
          onClick={() => startPomodoro(todo.todo_id)} // Start Pomodoro with todo ID
        >
          <div className="hover-pom">
            <div className="pom-activat-circle">
              <div className="timer-icon">
                <i className="bi bi-clock"></i> {/* Bootstrap Clock Icon */}
              </div>
            </div>
          </div>
        </div>
      )}
    </tr>


    
  );
  
};


export default TodoItem;
