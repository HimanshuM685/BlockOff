import React from 'react';
import Navbar from '../components/Navbar';
import Documentation from '../components/Documentation';
import Background from '../components/Background';

function DocPage() {
    return (
        <div className="app-container">
            <Background />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />
                <Documentation />

                <footer style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} BlockOff. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

export default DocPage;
