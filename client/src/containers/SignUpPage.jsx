import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

import '../assets/styles/loginSignUp.scss';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const validatePassword = (password) => {
    password = password.trim();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d^@$!%*?&(){}:;<>,.?~_+\\/-]{10,}$/;
   
    if (!passwordRegex.test(password)) {
      console.log("Password does NOT pass validation");
      alert (
       "Please try again. Your password must include at least:\n" +
        "- One uppercase letter (A)\n" +
        "- One lowercase letter (a)\n" +
        "- One number (5)\n" +
        "- One special character (*)\n" +
        "- Minimum 10 characters in total." 
      );
      return false;
    }
    console.log("Password PASSES validation");
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if(!validatePassword(password)){
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });
  
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        // Store the JWT token in localStorage after sign-up
        localStorage.setItem('authToken', data.token);  // Store token after successful sign-up
  
        console.log('Sign-up successful');
        navigate('/todos');  // Navigate to the Todo page after sign-up
      } else {
        if (data.error === 'Email already exists') {
          alert('This email is already registered. Please use a different email.')
        } else {
          alert(`Sign-up failed: ${data.error}`);
        }
         // Show error message if sign-up fails
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during sign-up. Please try again later.');
    }
  };
  

  // Remove handleSignup that is not used and just use handleSubmit

  return (
    <div className='container'>
      <div className="header">
        <div className='text'>Sign Up</div>
        <div className='underline'></div>

      </div>
      <form onSubmit={handleSubmit} className="inputs">
        <div className="input">
          <span className="icon">
            <i className="bi bi-person-circle"></i>
          </span>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
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
          <button type="submit" className="submit">Sign Up</button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
