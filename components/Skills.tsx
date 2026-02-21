
import React from 'react';
import Section from './Section';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Briefcase, 
  Calculator, 
  Cloud, 
  FileSpreadsheet, 
  TrendingUp, 
  CheckCircle2,
  Award,
  Sparkles
} from 'lucide-react';

interface SkillsProps {
  skills: string[];
}

const getIconForSkill = (skill: string) => {
  const s = skill.toLowerCase();
  if (s.includes('leader') || s.includes('team')) return <Users size={24} />;
  if (s.includes('debate') || s.includes('speak') || s.includes('communicat')) return <MessageSquare size={24} />;
  if (s.includes('bookkeep') || s.includes('audit') || s.includes('tax')) return <Calculator size={24} />;
  if (s.includes('virtual') || s.includes('cloud') || s.includes('remote')) return <Cloud size={24} />;
  if (s.includes('analy') || s.includes('report') || s.includes('growth')) return <TrendingUp size={24} />;
  if (s.includes('excel') || s.includes('sheet') || s.includes('data')) return <FileSpreadsheet size={24} />;
  if (s.includes('account') || s.includes('manage') || s.includes('business')) return <Briefcase size={24} />;
  if (s.includes('certif') || s.includes('award')) return <Award size={24} />;
  return <CheckCircle2 size={24} />;
};

const Skills: React.FC<SkillsProps> = ({ skills }) => {
  return (
    <Section id="skills" className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} /> My Expertise
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter"
          >
             Specialized <span className="text-blue-600">Skillset.</span>
          </motion.h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {skills.map((skill, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            whileHover={{ y: -10 }}
            className="relative group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all flex flex-col items-center text-center"
          >
            <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 transform group-hover:rotate-[360deg] shadow-lg group-hover:shadow-blue-500/40">
                {getIconForSkill(skill)}
            </div>
            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter text-sm group-hover:text-blue-600 transition-colors">{skill}</h3>
            
            {/* Background Glow */}
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity blur-xl -z-10"></div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Skills;
