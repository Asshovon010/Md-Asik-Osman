import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldCheck, Menu, X, ChevronRight, Home, Briefcase, Award, FolderGit2, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenLogin: (role: 'admin' | 'client') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['about', 'skills', 'services', 'projects', 'certifications'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'About', id: 'about', icon: <User size={20} /> },
    { name: 'Expertise', id: 'skills', icon: <Award size={20} /> },
    { name: 'Services', id: 'services', icon: <Layers size={20} /> },
    { name: 'Projects', id: 'projects', icon: <FolderGit2 size={20} /> },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 md:px-6 py-2 md:py-4 flex justify-center ${isScrolled ? 'pt-2 md:pt-4' : 'pt-4 md:pt-8'}`}>
        <motion.div 
          layout
          className={`flex items-center justify-between w-full max-w-6xl px-4 md:px-6 py-3 rounded-2xl border transition-all duration-500 backdrop-blur-xl ${
            isScrolled 
              ? 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-xl' 
              : 'bg-white/40 dark:bg-slate-900/40 border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20">A</div>
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg">OSMAN.</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`text-sm font-bold transition-all hover:text-blue-600 ${
                  activeSection === link.id ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop Admin Button */}
            <button 
                onClick={() => onOpenLogin('admin')}
                className="hidden md:flex items-center justify-center p-2.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                title="Admin Access"
            >
                <ShieldCheck size={20} />
            </button>

            <button 
              onClick={() => onOpenLogin('client')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              Portal Access <ChevronRight size={14} />
            </button>
            
            <button 
              className="md:hidden p-2 text-slate-800 dark:text-slate-200 active:scale-90 transition-transform bg-white/50 dark:bg-slate-800/50 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <Menu size={26} />
            </button>
          </div>
        </motion.div>
      </nav>

      {/* Full Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl md:hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/50">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">A</div>
                 <span className="font-black text-slate-900 dark:text-white text-lg">Menu</span>
               </div>
               <button 
                 onClick={() => setMobileMenuOpen(false)}
                 className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
               >
                 <X size={24} />
               </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
               <div className="grid grid-cols-2 gap-3 mb-6">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollTo(link.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                        activeSection === link.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      } active:scale-95`}
                    >
                      {link.icon}
                      <span className="font-bold text-sm">{link.name}</span>
                    </button>
                  ))}
               </div>

               <div className="space-y-3">
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest pl-2">Account Access</p>
                  <button 
                    onClick={() => { onOpenLogin('client'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 active:scale-98 transition-transform"
                  >
                    <span className="flex items-center gap-3"><Briefcase size={20}/> Client Portal</span>
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    onClick={() => { onOpenLogin('admin'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-medium active:scale-98 transition-transform"
                  >
                     <span className="flex items-center gap-3"><ShieldCheck size={20}/> Admin Access</span>
                  </button>
               </div>
            </div>

            {/* Footer */}
            <div className="p-6 text-center text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800/50">
               © {new Date().getFullYear()} Md Asik Osman.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;