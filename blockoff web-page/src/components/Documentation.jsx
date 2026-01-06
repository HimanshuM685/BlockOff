import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import { FileText, Shield, Network, Zap, Code } from 'lucide-react';
import './Documentation.css';

const Documentation = () => {
    const [activeSection, setActiveSection] = useState('abstract');

    // Observer to detect which section is in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-20% 0px -60% 0px',
                threshold: 0.1
            }
        );

        // Observe all section elements
        const sections = document.querySelectorAll('.doc-section');
        sections.forEach((section) => observer.observe(section));

        return () => {
            sections.forEach((section) => observer.unobserve(section));
        };
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const tocItems = [
        { id: 'abstract', label: 'Abstract', icon: <FileText size={16} /> },
        { id: 'introduction', label: 'Introduction', icon: <Zap size={16} /> },
        { id: 'architecture', label: 'System Architecture', icon: <Network size={16} /> },
        { id: 'protocol', label: 'Protocol Specification', icon: <Code size={16} /> },
        { id: 'security', label: 'Security', icon: <Shield size={16} /> },
        { id: 'use-cases', label: 'Use Cases', icon: <FileText size={16} /> },
    ];

    return (
        <section className="documentation" id="documentation">
            <div className="doc-header">
                <SectionHeading align="left">Technical Documentation</SectionHeading>
                <p className="doc-subtitle">BlockOff Whitepaper v1.0</p>
            </div>

            <div className="doc-layout">
                {/* Table of Contents Sidebar */}
                <aside className="doc-toc">
                    <h3>Contents</h3>
                    <nav>
                        {tocItems.map((item) => (
                            <button
                                key={item.id}
                                className={`toc-item ${activeSection === item.id ? 'active' : ''}`}
                                onClick={() => scrollToSection(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Documentation Content */}
                <div className="doc-content">
                    {/* Abstract */}
                    <motion.div id="abstract" className="doc-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2>Abstract</h2>
                        <p>
                            BlockOff introduces a revolutionary mesh networking protocol that enables blockchain transactions in offline environments
                            through Bluetooth Low Energy (BLE) communication. By implementing a novel packet fragmentation and reassembly system,
                            BlockOff allows cryptocurrency transactions to propagate through a peer-to-peer network until reaching an internet-connected
                            node, which then broadcasts the transaction to the blockchain.
                        </p>
                    </motion.div>

                    {/* Introduction */}
                    <motion.div id="introduction" className="doc-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2>1. Introduction</h2>

                        <h3>1.1 Problem Statement</h3>
                        <p>
                            Traditional blockchain transactions require constant internet connectivity, creating barriers in areas with poor network
                            coverage or during network outages. This limitation prevents widespread adoption of cryptocurrency in developing regions
                            and emergency scenarios where internet infrastructure is compromised.
                        </p>

                        <h3>1.2 Solution Overview</h3>
                        <p>
                            BlockOff solves this problem by creating a mesh network using Bluetooth Low Energy (BLE) technology, allowing devices
                            to relay transaction data through multiple hops until reaching an internet-connected node.
                        </p>

                        <div className="highlight-box">
                            <h4>Key Innovations</h4>
                            <ul>
                                <li><strong>BLE Mesh Protocol:</strong> Custom protocol for reliable data transmission over BLE GAP</li>
                                <li><strong>Packet Fragmentation:</strong> Efficient chunking system for large transaction payloads</li>
                                <li><strong>Multi-Chain Support:</strong> Compatible with EVM-based blockchains (Ethereum, Flow, Hedera)</li>
                                <li><strong>EIP-3009 Integration:</strong> Gasless transactions using meta-transactions</li>
                                <li><strong>Offline-First Architecture:</strong> Transactions queue and propagate without internet dependency</li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* System Architecture */}
                    <motion.div id="architecture" className="doc-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2>2. System Architecture</h2>

                        <h3>2.1 Network Topology</h3>
                        <p>BlockOff operates as a decentralized mesh network where each node can function as:</p>
                        <ul>
                            <li><strong>Originator:</strong> Creates and broadcasts new transactions</li>
                            <li><strong>Relay:</strong> Forwards received packets to extend network reach</li>
                            <li><strong>Gateway:</strong> Internet-connected node that submits transactions to blockchain</li>
                        </ul>

                        <div className="topology-diagram">
                            <div className="topology-node">
                                <div className="node-label">[Device A]</div>
                                <div className="node-role">(Sender)</div>
                            </div>
                            <div className="topology-arrow">--BLE--&gt;</div>
                            <div className="topology-node">
                                <div className="node-label">[Device B]</div>
                                <div className="node-role">(Relay)</div>
                            </div>
                            <div className="topology-arrow">--BLE--&gt;</div>
                            <div className="topology-node">
                                <div className="node-label">[Device C]</div>
                                <div className="node-role">(Gateway)</div>
                            </div>
                            <div className="topology-arrow">--Internet--&gt;</div>
                            <div className="topology-node topology-blockchain">
                                <div className="node-label">[Blockchain]</div>
                            </div>
                        </div>

                        <h3>2.2 Core Components</h3>
                        <div className="component-grid">
                            <div className="component-card">
                                <h4>BLE Context Manager</h4>
                                <p>Manages Bluetooth operations, device scanning, and network topology</p>
                            </div>
                            <div className="component-card">
                                <h4>Message State Manager</h4>
                                <p>Tracks packet fragments, implements acknowledgment system</p>
                            </div>
                            <div className="component-card">
                                <h4>Multi-Chain Engine</h4>
                                <p>Supports multiple blockchains, handles signing and validation</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Protocol Specification */}
                    <motion.div id="protocol" className="doc-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2>3. Protocol Specification</h2>

                        <h3>3.1 Packet Structure</h3>
                        <p>Each BlockOff packet consists of an 11-byte payload transmitted over BLE:</p>

                        <div className="packet-diagram">
                            <div className="packet-field packet-id">
                                <div className="field-label">ID</div>
                                <div className="field-size">1 Byte</div>
                                <div className="field-range">(0-255)</div>
                            </div>
                            <div className="packet-field packet-total">
                                <div className="field-label">Total Chunks</div>
                                <div className="field-size">1 Byte</div>
                                <div className="field-range">(0-255)</div>
                            </div>
                            <div className="packet-field packet-index">
                                <div className="field-label">Chunk Index</div>
                                <div className="field-size">1 Byte</div>
                                <div className="field-range">(0-127)</div>
                            </div>
                            <div className="packet-field packet-data">
                                <div className="field-label">Data</div>
                                <div className="field-size">8 Bytes</div>
                                <div className="field-range">(Payload)</div>
                            </div>
                        </div>

                        <h3>3.2 Message Fragmentation</h3>
                        <div className="code-block">
                            <pre>
                                {`const HEADER_SIZE = 3;
const DATA_PER_CHUNK = 8;
const MAX_PAYLOAD_SIZE = HEADER_SIZE + DATA_PER_CHUNK;

// Fragment large messages into 8-byte chunks
for (let i = 0; i < totalChunks; i++) {
  const chunk = createChunk(messageId, totalChunks, i, data);
  broadcastChunk(chunk);
}`}
                            </pre>
                        </div>
                    </motion.div>

                    {/* Security */}
                    <motion.div id="security" className="doc-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2>6. Security Architecture</h2>

                        <h3>6.1 Cryptographic Security</h3>
                        <p>All transactions use ECDSA signatures for authentication:</p>
                        <ul>
                            <li><strong>Private Key:</strong> 256-bit random number</li>
                            <li><strong>Public Key:</strong> Derived using elliptic curve multiplication</li>
                            <li><strong>Signature:</strong> Proves ownership without revealing private key</li>
                        </ul>

                        <h3>6.2 Replay Attack Prevention</h3>
                        <div className="highlight-box">
                            <ul>
                                <li><strong>Unique Nonces:</strong> Each transaction uses cryptographically secure nonce</li>
                                <li><strong>Nonce Tracking:</strong> Smart contract maintains used nonce registry</li>
                                <li><strong>Time Bounds:</strong> Transactions have validity windows</li>
                            </ul>
                        </div>

                        <h3>6.3 Privacy Considerations</h3>
                        <ul>
                            <li><strong>Non-Custodial:</strong> Users maintain full control of private keys</li>
                            <li><strong>Local Storage:</strong> Keys encrypted and stored on device</li>
                            <li><strong>Minimal Data:</strong> Only transaction data transmitted over mesh</li>
                        </ul>
                    </motion.div>

                    {/* Use Cases */}
                    <motion.div id="use-cases" className="doc-section" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2>9. Use Cases and Applications</h2>

                        <div className="use-case-grid">
                            <div className="use-case-card">
                                <h3>Rural and Remote Areas</h3>
                                <p>Enable cryptocurrency transactions in areas with poor internet connectivity</p>
                                <ul>
                                    <li>Agricultural payments</li>
                                    <li>Cross-border remittances</li>
                                    <li>Informal economy integration</li>
                                </ul>
                            </div>

                            <div className="use-case-card">
                                <h3>Emergency Scenarios</h3>
                                <p>Critical transactions during internet infrastructure failures</p>
                                <ul>
                                    <li>Natural disaster response</li>
                                    <li>Emergency payments</li>
                                    <li>Humanitarian aid distribution</li>
                                </ul>
                            </div>

                            <div className="use-case-card">
                                <h3>Privacy-Focused Transactions</h3>
                                <p>Reduced digital footprint and surveillance resistance</p>
                                <ul>
                                    <li>Anonymous payments</li>
                                    <li>Censorship resistance</li>
                                    <li>Decentralized routing</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <div className="doc-footer">
                        <p><strong>Document Version:</strong> 1.0</p>
                        <p><strong>Last Updated:</strong> January 2026</p>
                        <p className="doc-note">
                            This whitepaper presents the technical architecture and specifications of the BlockOff protocol.
                            For implementation details and code examples, visit our GitHub repository.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Documentation;
