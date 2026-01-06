import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobile = () => setMobileOpen(!mobileOpen);

    // Check if we're on the home page
    const isHomePage = location.pathname === '/';

    const handleDownload = () => {
        window.open('https://github.com/Koushikmondal06/BlockOff/releases/tag/BlockOff-app', '_blank');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <Link to="/" className="logo">BlockOff</Link>

            <div className={`menu-toggle ${mobileOpen ? 'open' : ''}`} onClick={toggleMobile}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
                {isHomePage ? (
                    <>
                        <a href="#home" className="nav-item" onClick={() => setMobileOpen(false)}>Home</a>
                        <Link to="/about" className="nav-item" onClick={() => setMobileOpen(false)}>About</Link>
                        <a href="#features" className="nav-item" onClick={() => setMobileOpen(false)}>Features</a>
                        <a href="#how-it-works" className="nav-item" onClick={() => setMobileOpen(false)}>How It Works</a>
                    </>
                ) : (
                    <Link to="/" className="nav-item" onClick={() => setMobileOpen(false)}>Back to Home</Link>
                )}
                <Link to="/docs" className="nav-item" onClick={() => setMobileOpen(false)}>Docs</Link>
                <button className="btn-download" onClick={handleDownload}>App Download</button>
            </div>
        </nav>
    );
};

export default Navbar;
