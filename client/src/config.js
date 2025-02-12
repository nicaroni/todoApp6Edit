const API_URL = import.meta.env.VITE_API_URL 
? import.meta.env.VITE_API_URL
: (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://react-cors-express-8fd026e00030.herokuapp.com");

export default API_URL;
