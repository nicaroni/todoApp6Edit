import React from "react";
import {Link} from 'react-router-dom';
import '../assets/styles/navBar.scss';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li> <Link to="/">Home</Link></li>
                <li> <Link to="/todos">Todo</Link></li>
                <li> <Link to="/about">About</Link></li>
                <li> <Link to="/theme">Customize</Link></li>

                

            </ul>
        </nav>
    )
}

export default Navbar;