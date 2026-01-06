import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DocPage from './pages/DocPage';
import AboutUsPage from './pages/AboutUsPage';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/docs" element={<DocPage />} />
                <Route path="/about" element={<AboutUsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
