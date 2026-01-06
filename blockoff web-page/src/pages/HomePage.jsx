import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Background from '../components/Background';

function HomePage() {
    return (
        <div className="app-container">
            <Background />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />
                <Hero />
                <About />
                <Features />
                <HowItWorks />

                <footer style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} BlockOff. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

export default HomePage;
