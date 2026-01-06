import React from 'react';
import Navbar from '../components/Navbar';
import Background from '../components/Background';
import { Github, ExternalLink } from 'lucide-react';
import './AboutUsPage.css';

function AboutUsPage() {
    const teamMembers = [
        {
            name: 'Koushik Mondal',
            github: 'https://github.com/Koushikmondal06',
            twitter: 'https://x.com/Koushikmondal69',
            role: 'Developer'
        },
        {
            name: 'Himanshu Malik',
            github: 'https://github.com/HimanshuM685',
            twitter: 'https://x.com/HimanshuM685',
            role: 'Developer'
        }
    ];

    return (
        <div className="app-container">
            <Background />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <Navbar />

                <section className="about-us-section">
                    <div className="about-us-container">
                        <h1 className="about-us-title">About Us</h1>
                        <p className="about-us-description">
                            We are a passionate team building BlockOff - a revolutionary decentralized mesh network protocol
                            for offline blockchain transactions using Bluetooth Low Energy technology.
                        </p>

                        <div className="team-section">
                            <h2 className="section-heading">Our Team</h2>
                            <div className="team-grid">
                                {teamMembers.map((member, index) => (
                                    <div key={index} className="team-card">
                                        <div className="avatar">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <h3 className="member-name">{member.name}</h3>
                                        <p className="member-role">{member.role}</p>
                                        <div className="social-links">
                                            <a
                                                href={member.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link"
                                            >
                                                <Github size={20} />
                                                <span>GitHub</span>
                                            </a>
                                            <a
                                                href={member.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link twitter-link"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                </svg>
                                                <span>X / Twitter</span>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="project-section">
                            <h2 className="section-heading">Project Repository</h2>
                            <div className="project-card">
                                <h3>BlockOff</h3>
                                <p>Decentralized Mesh Network Protocol for Offline Blockchain Transactions</p>
                                <a
                                    href="https://github.com/HimanshuM685/BlockOff"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="repo-link"
                                >
                                    <Github size={24} />
                                    <span>View on GitHub</span>
                                    <ExternalLink size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <footer style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '0.9rem' }}>
                    &copy; {new Date().getFullYear()} BlockOff. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

export default AboutUsPage;
