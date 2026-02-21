
import React, { useState, useEffect } from 'react';
import Section from './Section';
import { Award, BadgeCheck, ExternalLink, Calendar, X, ZoomIn, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CertificationItem } from '../types';

interface CertificationsProps {
  certifications: CertificationItem[];
}

const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  const [selectedCert, setSelectedCert] = useState<CertificationItem | null>(null);
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');

  // Reset image state when a new certificate is selected
  useEffect(() => {
    if (selectedCert) {
      setImgState('loading');
    }
  }, [selectedCert]);

  const handleViewCertificate = (e: React.MouseEvent, cert: CertificationItem) => {
    e.preventDefault();
    setSelectedCert(cert);
  };

  const isValidLink = (link?: string) => {
      return link && link.trim() !== '' && link !== '#';
  };

  return (
    <>
      <Section id="certifications" className="bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="text-center mb-12">
           <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-slate-900 dark:text-white inline-flex items-center gap-3"
           >
              <Award className="text-blue-600" size={32} />
              Certifications & Training
           </motion.h2>
           <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-slate-600 dark:text-slate-400 mt-4"
           >
              Professional credentials validating my expertise in accounting and finance.
           </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                      <BadgeCheck size={28} />
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1">{cert.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{cert.issuer}</p>
                  </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      {cert.year && (
                          <>
                             <Calendar size={14} />
                             <span>{cert.year}</span>
                          </>
                      )}
                  </div>
                  
                  {isValidLink(cert.link) ? (
                      <button 
                          onClick={(e) => handleViewCertificate(e, cert)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white dark:hover:text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
                      >
                          View Certificate <ZoomIn size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                  ) : (
                      <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg text-sm font-medium border border-slate-100 dark:border-slate-700 cursor-default select-none">
                          <FileText size={14} />
                          <span>Credential Verified</span>
                      </div>
                  )}
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Animated Certificate Modal */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setSelectedCert(null)}
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
               className="bg-white dark:bg-slate-900 p-2 rounded-2xl max-w-4xl max-h-[90vh] w-full relative shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10"
               onClick={(e) => e.stopPropagation()}
             >
                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  {isValidLink(selectedCert.link) && !selectedCert.link!.startsWith('data:') && (
                    <a 
                      href={selectedCert.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-lg backdrop-blur-sm transition-colors"
                      title="Open Original Link"
                    >
                      <ExternalLink size={20} />
                    </a>
                  )}
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-200 rounded-full shadow-lg backdrop-blur-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[300px] p-4 relative">
                   {isValidLink(selectedCert.link) ? (
                     <>
                        {/* Loading Spinner */}
                        {imgState === 'loading' && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                <Loader2 size={32} className="animate-spin" />
                            </div>
                        )}
                        
                        {/* Fallback View */}
                        {imgState === 'error' && (
                             <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 max-w-sm">
                               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                  <FileText size={32} />
                                </div>
                               <h4 className="text-slate-900 dark:text-white font-semibold mb-2">Preview Not Available</h4>
                               <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                                 The format cannot be displayed directly. Please open the link to view the credential.
                               </p>
                               <a 
                                 href={selectedCert.link} 
                                 target="_blank" 
                                 rel="noreferrer" 
                                 className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-sm hover:shadow-md"
                               >
                                 Open Document <ExternalLink size={16} />
                               </a>
                             </div>
                        )}

                        {/* Image */}
                        <img 
                            src={selectedCert.link} 
                            alt={selectedCert.title} 
                            className={`max-w-full max-h-[80vh] object-contain shadow-md rounded-lg transition-opacity duration-300 ${imgState === 'loaded' ? 'opacity-100' : 'opacity-0 absolute'}`}
                            onLoad={() => setImgState('loaded')}
                            onError={() => setImgState('error')}
                        />
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center text-slate-400 p-8">
                        <Award size={48} className="mb-4 opacity-20" />
                        <p>No document source available</p>
                     </div>
                   )}
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                   <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedCert.title}</h3>
                   <p className="text-slate-500 dark:text-slate-400">{selectedCert.issuer} • {selectedCert.year}</p>
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Certifications;
