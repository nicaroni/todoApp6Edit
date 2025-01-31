import React from "react";
import {Routes, Route} from 'react-router-dom';
import SignUpPage from '../containers/SignUpPage';
import LoginPage from '../containers/LoginPage';
import TodoPage from '../containers/TodoPage';
import ThemePage from '../containers/ThemePage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/theme" element={<ThemePage />} />
        </Routes>
    )
}