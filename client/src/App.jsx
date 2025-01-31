import { useState } from 'react'
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUpPage from './containers/SignUpPage.jsx';
import LoginPage from './containers/LoginPage.jsx';
import TodoPage from './containers/TodoPage.jsx';
import ThemePage from './containers/ThemePage.jsx';
import './assets/styles/todoMain.scss';
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/todos" element={<TodoPage />} />
        <Route path="/theme" element={<ThemePage />} />

      </Routes>
      </BrowserRouter>
  )
}

export default App
