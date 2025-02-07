//   # Todo app page (integrates TodoList, TodoForm)

import React, { useReducer, useEffect, Suspense, useState  } from "react";
import todoReducer, { initialState } from "../context/TodoReducer";
import axios from "axios";
import '../assets/styles/todoMain.scss';
import NavBar from '../components/NavbarPart';
import confetti from "canvas-confetti";


// Add this to your app


// Lazy load the TodoList component
const TodoList = React.lazy(() => import('../components/TodoList'));




const TodoPage = () => {


  const [todos, dispatch] = useReducer(todoReducer, initialState);
  const [showCompleted, setShowCompleted] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('selectedTheme') || 'theme-light');


  // Fetch all todos from the server on component mount
  useEffect(() => {
    const fetchTodos = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        console.log("No token found, redirecting to login...");
        if (!token) {
          console.log("No token found, redirecting to login...");
          return;
        }
        try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/todos`, {
          headers:{
            Authorization: `Bearer ${token}`,
          },
        });
       // Filter the todos into completed and uncompleted
       const completedTodos = response.data.filter(todo => todo.completed);
       const uncompletedTodos = response.data.filter(todo => !todo.completed);
       
       
       // Dispatch both completed and uncompleted todos
       dispatch({ type: "SET_TODOS", payload: { completedTodos, uncompletedTodos } });

     } catch (err) {
       console.error("Error fetching todos:", err);
     }
   } else {
     console.log("No token found, user might not be authenticated");
   }
 };

    fetchTodos();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);  // ✅ Apply theme to body
  }, [theme]);
  
  return (
    <div className={`container ${theme}`}>
      <NavBar />
      <h1 className={`my-4 ${theme}`}>Todo App</h1>
      <Suspense fallback={<div>Loading List...</div>}>
        <TodoList todos={todos} dispatch={dispatch} />
      </Suspense>
    </div>
  );
};

export default TodoPage;
