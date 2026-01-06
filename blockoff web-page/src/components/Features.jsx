import React from 'react';
import { motion } from 'framer-motion';
import SectionHeading from './SectionHeading';
import './Features.css';

const featuresData = [
    {
        icon: "📡",
        title: "Offline Signing",
        description: "Your private keys never touch the internet. Transactions are signed in a completely air-gapped environment."
    },
    {
        icon: "📶",
        title: "Bluetooth & QR",
        description: "Seamlessly transfer transaction data between your online watcher and offline signer using standard protocols."
    },
    {
        icon: "🛡️",
        title: "Non-Custodial",
        description: "You have complete control. We never store, access, or transmit your private keys or mnemonic phrases."
    },
    {
        icon: "⚡",
        title: "Encrypted Storage",
        description: "Local key storage is protected by industry-standard AES encryption and biometric authentication."
    }
];

const Features = () => {
    return (
        <section className="features" id="features">
            <div className="features-header">
                <SectionHeading align="left">Built for Security</SectionHeading>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                    style={{ marginTop: '20px' }}
                >
                    A fortress for your digital assets.
                </motion.p>
            </div>

            <div className="features-grid">
                {featuresData.map((feature, index) => (
                    <motion.div
                        className="feature-card"
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="feature-icon">{feature.icon}</div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Features;
