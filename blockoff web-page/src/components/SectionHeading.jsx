import React from 'react';
import { motion } from 'framer-motion';
import './SectionHeading.css';

const SectionHeading = ({ children, align = 'center', className = '' }) => {
    return (
        <div className={`section-heading-wrapper ${align} ${className}`}>
            <motion.h2
                className="section-heading-text"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {children}
            </motion.h2>
            <motion.div
                className="section-heading-dots"
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: '100%', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
        </div>
    );
};

export default SectionHeading;
