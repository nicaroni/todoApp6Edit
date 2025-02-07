import React, { useState } from "react";
import axios from "axios";

const TodoItem = ({ todo, dispatch }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(todo.description);
  const [isCompleted, setIsCompleted] = useState(todo.completed);


  const handleComplete = async () => { // Make it async
    const updatedTodo = { ...todo, completed: !isCompleted };
  
    try {
      // Send PUT request to update the completed status in the backend
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/todos/${todo.todo_id}`,
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
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/todos/${todo.todo_id}`, {
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
       `${import.meta.env.VITE_BACKEND_URL}/todos/${todo.todo_id}`,
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

  return (
    <tr className={`todo-item-row ${isCompleted ? "completed" : ""}`}>
      <td className="circle" onClick={handleComplete}>
        {todo.completed ? "✓" : ""}
        
      </td>
      <td className="todo-date">{formatDate(todo.created_at)}</td>
      <td className="todo-description">
        {isEditing ? (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveEdit(); // Save on "Enter" key press
              }
            }}
            className="form-control"
          />
        ) : (
          <span onClick={() => setIsEditing(true)}>{todo.description}</span>
        )}
      </td>
      <td className="delete-btn-cell">
        <button className="delete-btn" onClick={handleDelete}>
          Delete
        </button>
      </td>
    </tr>
  );
};


export default TodoItem;
