import React, { useState } from "react";
import axios from "axios";

const TodoForm = ({ dispatch }) => {
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Get the token from localStorage
    const token = localStorage.getItem("authToken"); // Retrieve the token from localStorage
    if (!token) {
      console.error("No token found, please log in.");
      return; // Prevent submitting if there's no token
    }
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/todos`,  // The backend API to create a todo
        { description: input },  // The data (todo description)
        {
          headers: {
            "Authorization": `Bearer ${token}`,  // Attach token here
          },
        }
      );
  
      dispatch({ type: "ADD_TODO", payload: response.data });  // Dispatch the new todo to the state
      setInput(""); // Clear input after submitting
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="table-like-row">
        <div className="circle add-circle">+</div>
        <input
          type="text"
          className="form-control todo-input"
          placeholder="Add a new todo..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-primary add-todo-btn" type="submit">Add</button>
      </div>
    </form>
  );
};

export default TodoForm;
