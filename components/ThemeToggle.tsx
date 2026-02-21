import * as React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className={`relative p-2.5 rounded-full border transition-all duration-300 z-50 ${
        isDark 
          ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
      }`}
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-5 h-5">
        <motion.div
            initial={false}
            animate={{ 
                scale: isDark ? 0 : 1,
                rotate: isDark ? 90 : 0,
                opacity: isDark ? 0 : 1 
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
        >
            <Sun size={20} />
        </motion.div>
        
        <motion.div
            initial={false}
            animate={{ 
                scale: isDark ? 1 : 0,
                rotate: isDark ? 0 : -90,
                opacity: isDark ? 1 : 0
            }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
        >
            <Moon size={20} />
        </motion.div>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;