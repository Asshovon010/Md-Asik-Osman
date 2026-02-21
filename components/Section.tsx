
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  delay?: number;
}

const Section: React.FC<SectionProps> = ({ children, className = "", id, delay = 0 }) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden ${className}`}
    >
      {children}
    </motion.section>
  );
};

export default Section;
