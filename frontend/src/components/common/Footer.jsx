import React from "react";
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div className="container">
                <p>Copyright &copy; 2024</p>
                <ul className="footer-links">
                    <li>
                        <Link className="footer-link" to="">About</Link>
                    </li>
                    <li>
                        <Link className="footer-link" to="">Services</Link>
                    </li>
                    <li>
                        <Link className="footer-link" to="">Contact Us</Link>
                    </li>
                    <li>
                        <Link className="footer-link" to="">Register</Link>
                    </li>
                    <li>
                        <Link className="footer-link" to="">Login</Link>
                    </li>
                </ul>
            </div>
        </footer>
    )
}

export default Footer;