import React from "react";
import {Link, useLocation} from 'react-router-dom';
import '../assets/styles/navBar.scss';

const Navbar = () => {
    console.log("Navbar is rendering!"); 
    const location = useLocation();
    return (
        <nav>
            <ul>
            {location.pathname === "/todos" && <li> <Link to="/">Home</Link></li>}
                <li> <Link to="/about">About</Link></li>
                <li> <Link to="/theme">Customize</Link></li>
                {location.pathname === "/" && <li> <Link to="/todos">Todo</Link></li>}
                {location.pathname === "/" && <li> <Link to="/signup">SignUp</Link></li>}
                {location.pathname === "/" && <li> <Link to="/login">Login</Link></li>}
                

            </ul>
        </nav>
    )
}

export default Navbar;