
import React from 'react';
import Section from './Section';
import { motion, Variants } from 'framer-motion';
import { ServiceItem } from '../types';
import { 
  Calculator, 
  BarChart3, 
  Database, 
  FileSpreadsheet, 
  Briefcase, 
  Settings, 
  TrendingUp, 
  ShieldCheck 
} from 'lucide-react';

interface ServicesProps {
  services: ServiceItem[];
}

// Helper to map title keywords to icons dynamically
const getIconForService = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('bookkeep')) return <Calculator size={32} />;
  if (t.includes('report') || t.includes('analytic')) return <BarChart3 size={32} />;
  if (t.includes('data') || t.includes('clean')) return <Database size={32} />;
  if (t.includes('reconciliation') || t.includes('audit')) return <ShieldCheck size={32} />;
  if (t.includes('receivable') || t.includes('payable') || t.includes('billing')) return <FileSpreadsheet size={32} />;
  if (t.includes('setup') || t.includes('migration') || t.includes('software')) return <Settings size={32} />;
  if (t.includes('growth') || t.includes('strategy')) return <TrendingUp size={32} />;
  return <Briefcase size={32} />;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  },
  hover: {
    y: -8,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
    } 
  },
  hover: {
    scale: 1.15,
    rotate: 15,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
};

const Services: React.FC<ServicesProps> = ({ services }) => {
  if (!services || services.length === 0) return null;

  return (
    <Section id="services" className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center mb-12 text-center">
        <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
             className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3"
        >
             <span className="w-10 h-1.5 bg-blue-600 block rounded-full"></span>
             Services Offered
             <span className="w-10 h-1.5 bg-blue-600 block rounded-full"></span>
        </motion.h2>
        <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="text-slate-600 dark:text-slate-400 max-w-2xl"
        >
          Tailored financial solutions to streamline your operations and provide clarity for your business decisions.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {services.map((service, index) => (
          <motion.div
            key={service.id || index}
            variants={cardVariants}
            whileHover="hover"
            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group"
          >
            <motion.div 
              variants={iconVariants}
              className="mb-6 inline-block p-4 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300"
            >
              {getIconForService(service.title)}
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {service.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {service.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
};

export default Services;
