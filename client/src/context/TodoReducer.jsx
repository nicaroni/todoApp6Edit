export const initialState = [];

const todoReducer = (state, action) => {
  switch (action.type) {
    case "SET_TODOS":
      return action.payload;  // Set todos from the backend
    case "ADD_TODO":
      return [...state, action.payload];  // Add new todo
    case "DELETE_TODO":
      return state.filter(todo => todo.todo_id !== action.payload);  // Remove deleted todo from state
    case "TOGGLE_TODO_COMPLETED":
      return state.map(todo =>
        todo.todo_id === action.payload.todo_id
          ? { ...todo, completed: action.payload.completed }
          : todo
      ); 
      case "UPDATE_TODO":
        return state.map(todo =>
          todo.todo_id === action.payload.todo_id
            ? { ...todo, description: action.payload.description }
            : todo
        );  // Update description of the todo // Toggle completed status locally
    default:
      return state;
  }
};

export default todoReducer;
