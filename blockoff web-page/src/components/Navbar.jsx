import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobile = () => setMobileOpen(!mobileOpen);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="logo">BlockOff</div>

            <div className={`menu-toggle ${mobileOpen ? 'open' : ''}`} onClick={toggleMobile}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>

            <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
                <a href="#home" className="nav-item" onClick={() => setMobileOpen(false)}>Home</a>
                <a href="#about" className="nav-item" onClick={() => setMobileOpen(false)}>About</a>
                <a href="#features" className="nav-item" onClick={() => setMobileOpen(false)}>Features</a>
                <a href="#documentation" className="nav-item" onClick={() => setMobileOpen(false)}>Docs</a>
                <button className="btn-download">App Download</button>
            </div>
        </nav>
    );
};

export default Navbar;
