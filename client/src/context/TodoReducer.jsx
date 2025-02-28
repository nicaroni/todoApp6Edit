export const initialState = {
  completedTodos: [],
  uncompletedTodos: [],
};


const todoReducer = (state, action) => {
  switch (action.type) {
    case "SET_TODOS":
      return {
        completedTodos: action.payload.completedTodos || [],
        uncompletedTodos: action.payload.uncompletedTodos || [],
      };
    case "ADD_TODO":
      return {
        ...state,
        uncompletedTodos: [...state.uncompletedTodos, action.payload],
      };
    case "DELETE_TODO":
      return {
        ...state,
        completedTodos: state.completedTodos.filter(todo => todo.todo_id !== action.payload),
        uncompletedTodos: state.uncompletedTodos.filter(todo => todo.todo_id !== action.payload),
      };
    case "TOGGLE_TODO_COMPLETED":
      return {
        ...state,
        completedTodos: action.payload.completed
          ? [...state.completedTodos, action.payload]
          : state.completedTodos.filter(todo => todo.todo_id !== action.payload.todo_id),
        uncompletedTodos: action.payload.completed
          ? state.uncompletedTodos.filter(todo => todo.todo_id !== action.payload.todo_id)
          : [...state.uncompletedTodos, action.payload],
      };
    case "UPDATE_TODO":
      return {
        ...state,
        completedTodos: state.completedTodos.map(todo =>
          todo.todo_id === action.payload.todo_id
            ? { ...todo, description: action.payload.description }
            : todo
        ),
        uncompletedTodos: state.uncompletedTodos.map(todo =>
          todo.todo_id === action.payload.todo_id
            ? { ...todo, description: action.payload.description }
            : todo
        ),
      };
      case "UPDATE_TIME_SPENT":
        return {
          completedTodos: state.completedTodos.map(todo =>
            todo.todo_id === action.payload.todoId
              ? { ...todo, time_spent: action.payload.newTimeSpent }
              : todo
          ),
          uncompletedTodos: state.uncompletedTodos.map(todo =>
            todo.todo_id === action.payload.todoId
              ? { ...todo, time_spent: action.payload.newTimeSpent }
              : todo
          ),
        };
  

    default:
      return state;
  }
};

export default todoReducer;
