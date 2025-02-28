//   # Todo app page (integrates TodoList, TodoForm)

import React, { useReducer, useEffect, Suspense, useState  } from "react";
import todoReducer, { initialState } from "../context/TodoReducer";
import axios from "axios";
import '../assets/styles/todoMain.scss';
import NavBar from '../components/NavbarPart';
import confetti from "canvas-confetti";
import API_URL from '../config';
import PomodoroTimer from "../components/PomodoroTimerContainer";
import Calendar from "../components/Calendar";


// Add this to your app


// Lazy load the TodoList component
const TodoList = React.lazy(() => import('../components/TodoList'));




const TodoPage = () => {
  const [todos, dispatch] = useReducer(todoReducer, initialState);
  const [theme, setTheme] = useState(localStorage.getItem("selectedTheme") || "theme-light");
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false); 
  const [activeTodoId, setActiveTodoId] = useState(null);

  // ✅ Fetch all todos from the server on component mount
  
    const fetchTodos = async () => {
      const token = localStorage.getItem("authToken");
    
      if (!token) {
        console.log("No token found, redirecting to login...");
        return;
      }
    
      try {
        const response = await axios.get(`${API_URL}/todos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        console.log("Fetched Todos:", response.data); // ✅ Debugging
    
        const completedTodos = response.data.filter(todo => todo.completed);
        const uncompletedTodos = response.data.filter(todo => !todo.completed);
    
        dispatch({ type: "SET_TODOS", payload: { completedTodos, uncompletedTodos } });
        console.log("State after dispatch:", {
          completedTodos,
          uncompletedTodos,
        }); // ✅ Debug Redux/state update
    
      } catch (err) {
        console.error("Error fetching todos:", err);
      }
    }
    
    useEffect(() => {
      fetchTodos();
    }, []);
    
    const refreshTodos = (todoId, newTimeSpent) => {
      dispatch({
        type: "UPDATE_TIME_SPENT",
        payload: { todoId, newTimeSpent },
      });
    };
    

  useEffect(() => {
    document.body.setAttribute("data-theme", theme); // ✅ Apply theme to body
  }, [theme]);

  const startPomodoro = (todoId) => {
    setActiveTodoId(todoId); // Set the current todo ID
    setIsPomodoroRunning(true); // Start Pomodoro
};
  


  return (

  
      <div className="todos-page">
   <div className="calendar">
   
    <Calendar  />
        </div>
  
        <div className={`container todo-table ${theme}`}>
         
          <NavBar />
          <h1 className={`my-4 ${theme}`}>Todo App</h1>
          
          <Suspense fallback={<div>Loading List...</div>}>
            {todos && todos.completedTodos && todos.uncompletedTodos ? (
              <>
                {console.log("Rendering TodoList...")}
                <TodoList todos={[...todos.completedTodos, ...todos.uncompletedTodos]} dispatch={dispatch}  startPomodoro={startPomodoro}/>
              </>
            ) : (
              <div>No Todos Found</div>  // ❌ If this appears, `todos` is empty
            )}
          </Suspense>
        </div>
        <div className="pomodoro-timer">
     <PomodoroTimer theme={theme} 
    isRunning={isPomodoroRunning} 
    setIsRunning={setIsPomodoroRunning} 
    todoId={activeTodoId} refreshTodos={refreshTodos} />
        </div>
      </div>
   
  );
  
};

export default TodoPage;
