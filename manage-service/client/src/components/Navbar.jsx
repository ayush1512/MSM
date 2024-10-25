import { NavLink } from "react-router-dom";
import "./Navbar.css"
import { useAuth } from "../store/auth";

export const Navbar = () => {
    const { isLoggedIn } = useAuth();
    return (
        <>
            <header>
                <div className="container">
                    <div className="logo-brand">
                        <a href="/">Medical Store Management</a>
                    </div>
                    <nav>
                        <ul>
                            <li><NavLink to="/">Home</NavLink></li>
                            <li><NavLink to="/about">About</NavLink></li>
                            {/* <li><NavLink to="/service">Service</NavLink></li> */}
                            <li><NavLink to="/contact">Contact</NavLink></li>
                            {/* <li><NavLink to="/medicinsection">Medicine</NavLink></li> */}
                            <li><NavLink to="/product">Product Scanner</NavLink></li>
                            <li><NavLink to="/prescription">Prescription Scanner</NavLink></li>
                            {isLoggedIn ? <li><NavLink to="/logout">Logout</NavLink></li> : <>
                                {/* <li><NavLink to="/register">Register</NavLink></li> */}
                                {/* <li><NavLink to="/register">Register_Local</NavLink></li> */}
                                <li><NavLink to="/login">Login</NavLink></li>
                            </>
                            } 
                            {/* agr log in h to log out wali link show kare ya fir register or log in wali show kare */}
                        </ul>
                    </nav>
                </div>
                <hr />
            </header>
        </>
    )
}