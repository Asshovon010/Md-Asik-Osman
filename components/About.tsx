
import React, { useState } from 'react';
import Section from './Section';
import { motion } from 'framer-motion';
import { ResumeData } from '../types';
import { User, CheckCircle2, TrendingUp, Award, Clock, GraduationCap } from 'lucide-react';

interface AboutProps {
  data: ResumeData;
}

const About: React.FC<AboutProps> = ({ data }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Section id="about" className="bg-white dark:bg-slate-950 transition-colors duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left: Professional Image Card */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5 relative"
        >
            <motion.div 
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 rounded-[3rem] overflow-hidden aspect-[4/5] bg-slate-200 dark:bg-slate-900 border-8 border-white dark:border-slate-900 shadow-2xl"
            >
                {data.profileImage && !imgError ? (
                    <motion.img 
                        initial={{ scale: 1.1 }}
                        whileInView={{ scale: 1 }}
                        transition={{ duration: 0.7 }}
                        src={data.profileImage} 
                        alt={data.name} 
                        className="w-full h-full object-cover" 
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                        <User size={120} strokeWidth={1} />
                    </div>
                )}
            </motion.div>
            
            {/* Experience Floating Badge */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
                className="absolute -bottom-6 -right-6 z-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 md:p-8 rounded-[2rem] shadow-[0_20px_40px_rgba(37,99,235,0.4)] border-4 border-white dark:border-slate-950"
            >
                <div className="text-3xl md:text-5xl font-black">7+</div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-widest opacity-90 leading-tight mt-1">Years Of<br/>Accounting</div>
            </motion.div>

            {/* Background Decor */}
            <motion.div 
                animate={{ rotate: [3, 6, 3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-10 w-full h-full bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] -z-10 border border-blue-100 dark:border-blue-900/20"
            ></motion.div>
        </motion.div>

        {/* Right: Narrative Content */}
        <div className="lg:col-span-7 space-y-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <div className="inline-flex items-center gap-3 mb-6">
                    <span className="w-12 h-0.5 bg-blue-600 rounded-full"></span>
                    <h3 className="text-blue-600 font-black tracking-[0.3em] uppercase text-xs">The Expert Behind the Numbers</h3>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[0.9] mb-8">
                    Turning Complex Data <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Into Clear Strategy.</span>
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {data.summary}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoItem icon={<TrendingUp size={22}/>} title="Growth Obsessed" text="Scaling your ROI" />
                <InfoItem icon={<Award size={22}/>} title="QuickBooks Pro" text="Intuit Certified Expert" />
                <InfoItem icon={<Clock size={22}/>} title="Global Support" text="Reliable Virtual Service" />
                <InfoItem icon={<CheckCircle2 size={22}/>} title="Error-Free" text="Precise Data Clean-up" />
            </div>
            
            <div className="pt-6">
                <motion.div 
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg hover:shadow-blue-900/5"
                >
                    <div className="shrink-0 w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Background</p>
                        <p className="text-slate-900 dark:text-white font-bold text-lg">{data.education[0]?.degree}</p>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
    </Section>
  );
};

const InfoItem = ({ icon, title, text }: { icon: any, title: string, text: string }) => (
    <motion.div 
        whileHover={{ x: 5 }}
        className="flex items-start gap-4 group"
    >
        <div className="mt-1 text-blue-600 bg-blue-50 dark:bg-slate-900 p-3 rounded-2xl border border-blue-100 dark:border-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            {icon}
        </div>
        <div>
            <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm mb-1">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight">{text}</p>
        </div>
    </motion.div>
);

export default About;
