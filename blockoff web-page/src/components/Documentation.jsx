import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from './SectionHeading';
import './Documentation.css';

const docs = [
    {
        question: "What hardware is required?",
        answer: "You can use two smartphones: one online (your daily driver) and one offline (an old phone in airplane mode). No expensive hardware wallets needed."
    },
    {
        question: "Is it open source?",
        answer: "Yes, BlockOff is 100% open source. You can verify the code on GitHub and build it yourself for maximum trust."
    },
    {
        question: "Which networks are supported?",
        answer: "Currently, we support Ethereum Mainnet, Sepolia, and Goerli testnets. Layer-2 support (Arbitrum, Optimism) is coming soon."
    }
];

const Documentation = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggle = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="documentation" id="documentation">
            <div className="features-header" style={{ marginBottom: '60px', paddingLeft: '0', border: 'none' }}>
                <SectionHeading align="left">FAQ & Documentation</SectionHeading>
            </div>

            <div className="doc-container">
                {docs.map((doc, index) => (
                    <div className="accordion-item" key={index}>
                        <button className="accordion-header" onClick={() => toggle(index)}>
                            {doc.question}
                            <motion.span
                                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                ▼
                            </motion.span>
                        </button>
                        <AnimatePresence>
                            {activeIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="accordion-content"
                                >
                                    <p>{doc.answer}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Documentation;
