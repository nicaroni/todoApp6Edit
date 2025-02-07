import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import '../assets/styles/loginSignUp.scss'; // Import the same SCSS file as SignUp for consistent styling

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/login`, { // Note the full URL

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Save the token to localStorage
        localStorage.setItem('authToken', data.token);  // Store the token

        console.log('Login successful');
        navigate('/todos');  // Navigate to the todos page after login
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='container'>
      <div className="header">
        <div className='text'>Login</div>
        <div className='underline'></div>
      </div>
      <form onSubmit={handleSubmit} className="inputs">
        <div className="input">
          <span className="icon">
            <i className="bi bi-envelope"></i>
          </span>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="input">
          <span className="icon">
            <i className="bi bi-eye"></i>
          </span>
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div className="submit-container">
          <button type="submit" className="submit">Log In</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
