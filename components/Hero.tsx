import React, { useEffect, useState } from 'react';
import { ResumeData } from '../types';
import { motion, Variants } from 'framer-motion';
import { Briefcase, LogIn, Sparkles, TrendingUp, Calculator, ShieldCheck, ArrowRight } from 'lucide-react';

interface HeroProps {
  data: ResumeData;
  onOpenContact: () => void;
  onOpenLogin?: () => void;
}

const Hero: React.FC<HeroProps> = ({ data, onOpenContact, onOpenLogin }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }
    })
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 text-white overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.5)_0%,rgba(15,23,42,1)_100%)] z-0" />

        {/* Interactive Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <motion.div 
                animate={{ 
                    x: (mousePos.x - window.innerWidth / 2) * 0.05,
                    y: (mousePos.y - window.innerHeight / 2) * 0.05,
                }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[100px]" 
             />
             <motion.div 
                animate={{ 
                    x: (mousePos.x - window.innerWidth / 2) * -0.05,
                    y: (mousePos.y - window.innerHeight / 2) * -0.05,
                }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] bg-teal-500/10 rounded-full blur-[100px]" 
             />
        </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-blue-400 text-[10px] font-black tracking-[0.2em] uppercase mb-12 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-default"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
            Certified QuickBooks Partner
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] md:leading-[0.85]"
          >
            <motion.span custom={1} initial="hidden" animate="visible" variants={textVariants} className="block text-white drop-shadow-2xl">Financial</motion.span>
            <motion.span 
              custom={2} initial="hidden" animate="visible" variants={textVariants}
              className="bg-gradient-to-r from-blue-400 via-teal-300 to-blue-500 bg-clip-text text-transparent inline-block pb-2"
            >
              Precision.
            </motion.span>
          </motion.h1>

          <motion.p
            custom={3} initial="hidden" animate="visible" variants={textVariants}
            className="text-base sm:text-lg md:text-2xl text-slate-300 mb-12 md:mb-16 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md px-4"
          >
            Modernizing growing businesses with <span className="text-white font-bold">expert bookkeeping</span> and high-impact virtual accounting partnerships.
          </motion.p>

          <motion.div
            custom={4} initial="hidden" animate="visible" variants={textVariants}
            className="flex flex-wrap justify-center gap-6 items-center"
          >
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenContact}
                className="group px-12 py-5 bg-blue-600 text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.5)] border border-transparent"
            >
                <Briefcase size={22} />
                <span>Work with Asik</span>
            </motion.button>

            <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenLogin}
                className="px-12 py-5 bg-white/5 text-white rounded-2xl font-black transition-all flex items-center gap-3 border border-white/10 backdrop-blur-xl hover:border-white/20"
            >
                <LogIn size={22} className="text-slate-300 group-hover:text-white" />
                <span>Client Portal</span>
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
             <HeroStat icon={<TrendingUp size={18}/>} label="Business Growth" />
             <HeroStat icon={<Calculator size={18}/>} label="Cloud Auditing" />
             <HeroStat icon={<ShieldCheck size={18}/>} label="Secure Systems" />
             <HeroStat icon={<ArrowRight size={18}/>} label="Virtual Partner" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const HeroStat = ({ icon, label }: { icon: any, label: string }) => (
    <div className="flex flex-col items-center gap-3 group cursor-default">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 group-hover:scale-110 backdrop-blur-sm">
            {icon}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-hover:text-slate-200 transition-colors shadow-black/50 drop-shadow-md">{label}</span>
    </div>
);

export default Hero;