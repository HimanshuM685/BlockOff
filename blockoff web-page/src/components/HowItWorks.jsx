import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import './HowItWorks.css';

const steps = [
    {
        title: "Step 1: Initiation",
        description: "Create a transaction on your online device (PC/Mobile) just like you normally would. The app prepares the unsigned transaction data."
    },
    {
        title: "Step 2: Transfer",
        description: "Transmit the unsigned data to your offline device via QR code scan or secure Bluetooth handshake."
    },
    {
        title: "Step 3: Signing",
        description: "Review and sign the transaction on the air-gapped offline device. Your private key acts in isolation."
    },
    {
        title: "Step 4: Broadcast",
        description: "Transfer the signed transaction back to the online device to broadcast it to the Ethereum network."
    }
];

const HowItWorks = () => {
    return (
        <section className="how-it-works" id="how-it-works">
            <div className="features-header" style={{ marginBottom: '60px' }}>
                {/* Override local style if needed by clean CSS, but simple wrapper works */}
                <div style={{ paddingLeft: '30px' }}>
                    <SectionHeading align="left">How It Works</SectionHeading>
                </div>
            </div>

            <div className="timeline-container">
                {steps.map((step, index) => (
                    <motion.div
                        className="timeline-step"
                        key={index}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="step-content">
                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                        </div>
                        <div className="step-marker"></div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default HowItWorks;
