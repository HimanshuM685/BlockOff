import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import './About.css';

const About = () => {
    return (
        <section className="about" id="about">
            <div className="about-container">
                <motion.div
                    className="about-text"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <SectionHeading align="left">Power in Your Pocket, <br /> Security in the Air.</SectionHeading>

                    <div style={{ marginTop: '30px' }}>
                        <p>
                            BlockOff redefines how you interact with the Ethereum blockchain.
                            By keeping your private keys strictly on your mobile device and offline,
                            we eliminate the risk of remote attacks.
                        </p>
                        <p>
                            Transactions are prepared online, transferred via QR code or Bluetooth
                            to your offline device for signing, and then broadcasted securely.
                            It's the cold storage security you trust, with the convenience you need.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="about-visual"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    {/* Abstract geometric animation representing offline signing */}
                    <motion.div className="abstract-circle c1" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
                    <motion.div className="abstract-circle c2" animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} />
                    <motion.div className="abstract-circle c3" />

                    <motion.div
                        className="floating-icon"
                        style={{ top: '20%', right: '20%' }}
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        🔒
                    </motion.div>

                    <motion.div
                        className="floating-icon"
                        style={{ bottom: '20%', left: '20%' }}
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        📶
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default About;
