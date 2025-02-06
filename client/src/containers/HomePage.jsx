import React, { useState, useEffect } from 'react';
import '../assets/styles/home.scss';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavbarPart';

const HomePage = () => {
    return(
        <div className="home_container">
            <div className="navbar-home">
                <NavBar />
            </div>
            <div className="home_structure-left-right">
                <div className="text-container1">
                    <h1>Plan. Check. Achieve. Your tasks, your way!</h1>
                    <p className='p-1'> Hey, Goal-Getter! 🎯
You’ve got dreams, deadlines, and daily missions—so why not make checking off tasks a little more exciting? Whether it’s a tiny win or a massive milestone, every completed task is a step forward.

Start your day, week, or month with a plan, and let’s turn that checklist into a celebration of progress! 🎉
Ready? Add a new task and let’s get things done! 🚀</p>
                </div>
            </div>
        </div>
    )
}

export default HomePage;