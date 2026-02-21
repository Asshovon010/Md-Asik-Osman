
import React from 'react';
import { Mail, Phone, Linkedin, MapPin, Lock } from 'lucide-react';
import { ResumeData } from '../types';
import { motion } from 'framer-motion';

interface ContactProps {
    data: ResumeData;
    onLoginClick?: () => void;
}

const Contact: React.FC<ContactProps> = ({ data, onLoginClick }) => {
  return (
    <footer id="contact" className="bg-slate-900 text-white py-24 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Let's Work Together.</h2>
                        <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
                            Ready to streamline your financials? Reach out for a professional consultation today.
                        </p>
                    </motion.div>
                    
                    <div className="flex gap-4">
                        <a 
                            href={`https://${data.contact.linkedin}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-4 bg-white/5 hover:bg-blue-600 rounded-2xl transition-all hover:scale-110 border border-white/10"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={24} />
                        </a>
                        <a 
                            href={`mailto:${data.contact.email}`} 
                            className="p-4 bg-white/5 hover:bg-teal-600 rounded-2xl transition-all hover:scale-110 border border-white/10"
                            aria-label="Email"
                        >
                            <Mail size={24} />
                        </a>
                    </div>
                </div>

                <div className="space-y-4">
                    <ContactCard 
                        icon={<Phone size={20}/>} 
                        label="Call Directly" 
                        value={data.contact.phone} 
                        color="text-blue-400"
                        bg="bg-blue-500/10"
                    />
                    <ContactCard 
                        icon={<Mail size={20}/>} 
                        label="Email Address" 
                        value={data.contact.email} 
                        color="text-teal-400"
                        bg="bg-teal-500/10"
                    />
                    <ContactCard 
                        icon={<MapPin size={20}/>} 
                        label="Location" 
                        value={data.contact.location} 
                        color="text-purple-400"
                        bg="bg-purple-500/10"
                    />
                </div>
            </div>

            {/* Footer Bar */}
            <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 gap-4">
                <p>© {new Date().getFullYear()} Md Asik Osman. All rights reserved.</p>
                {onLoginClick && (
                    <button 
                        onClick={onLoginClick}
                        className="flex items-center gap-2 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-lg"
                    >
                        <Lock size={14} /> Admin Access
                    </button>
                )}
            </div>
        </div>
    </footer>
  );
};

const ContactCard = ({ icon, label, value, color, bg }: { icon: any, label: string, value: string, color: string, bg: string }) => (
    <motion.div 
        whileHover={{ x: 5 }}
        className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
    >
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-white font-medium">{value}</p>
        </div>
    </motion.div>
);

export default Contact;
