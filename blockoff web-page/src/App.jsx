import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Documentation from './components/Documentation';
import Background from './components/Background';
import './index.css';

function App() {
    return (
        <div className="app-container">
            <Background />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />
                <Hero />
                <About />
                <Features />
                <HowItWorks />
                <Documentation />

                <footer style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} BlockOff. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

export default App;
