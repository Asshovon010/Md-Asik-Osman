
import React from 'react';
import Section from './Section';
import { motion, Variants } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { TestimonialItem } from '../types';

interface TestimonialsProps {
  testimonials: TestimonialItem[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 50,
      damping: 20
    }
  }
};

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <Section id="testimonials" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="flex flex-col items-center mb-16 text-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
           whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="p-4 bg-blue-50 dark:bg-slate-800 rounded-full text-blue-600 dark:text-blue-400 mb-6 border border-blue-100 dark:border-slate-700"
         >
            <Quote size={28} />
         </motion.div>
         
         <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white"
         >
             Client Stories
        </motion.h2>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg"
        >
          Hear from the businesses I've helped streamline and grow.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4"
      >
        {testimonials.map((item, index) => (
          <motion.div
            key={item.id || index}
            variants={itemVariants}
            whileHover={{ y: -12, transition: { duration: 0.3 } }}
            className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl relative border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-blue-900/20 group"
          >
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-100/50 dark:bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="flex gap-1 mb-6 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" className="drop-shadow-sm" />
                ))}
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8 relative z-10 italic text-lg">
                "{item.quote}"
            </p>

            <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {item.name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{item.role}</p>
                </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

export default Testimonials;
