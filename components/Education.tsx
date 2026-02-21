
import React from 'react';
import Section from './Section';
import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { EducationItem } from '../types';

interface EducationProps {
  education: EducationItem[];
}

const Education: React.FC<EducationProps> = ({ education }) => {
  return (
    <Section id="education" className="bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
           <motion.h2 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
             className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3"
           >
             <span className="w-8 h-1 bg-teal-500 block rounded-full"></span>
             Education
          </motion.h2>
          <motion.p 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="text-slate-600 dark:text-slate-300"
          >
            My academic background laid the foundation for my career in accounting and business administration.
          </motion.p>
        </div>
        
        <div className="md:w-2/3 relative pl-8 border-l-2 border-slate-200 dark:border-slate-700 space-y-12">
            {education.map((edu, index) => (
                <motion.div 
                    key={edu.id || index} 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    {/* Timeline Dot */}
                    <div className="absolute -left-[41px] top-1 bg-white dark:bg-slate-800 border-4 border-teal-500 w-6 h-6 rounded-full" />
                    
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{edu.institution}</h3>
                    <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mt-1">{edu.degree}</p>
                    {edu.year && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                            <GraduationCap size={16} />
                            {edu.year}
                        </p>
                    )}
                </motion.div>
            ))}
        </div>
      </div>
    </Section>
  );
};

export default Education;
