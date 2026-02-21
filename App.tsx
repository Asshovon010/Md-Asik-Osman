import React, { useState, useEffect, useCallback } from 'react';
import { RESUME_DATA, INITIAL_SITE_CONFIG } from './constants';
import { ResumeData, ClientDocument, PortalMessage, SiteConfig } from './types';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Certifications from './components/Certifications';
import Education from './components/Education';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ChatWidget from './components/ChatWidget';
import ContactForm from './components/ContactForm';
import ScrollToTop from './components/ScrollToTop';
import ThemeToggle from './components/ThemeToggle';
import Navbar from './components/Navbar';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ClientPanel from './components/ClientPanel';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import { Loader2 } from 'lucide-react';

type ViewState = 'portfolio' | 'login' | 'admin' | 'client';

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('portfolio');
  const [loginRole, setLoginRole] = useState<'admin' | 'client'>('client');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Initialize data from LocalStorage (fallback)
  const [websiteData, setWebsiteData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem('resumeData');
      return saved ? JSON.parse(saved) : RESUME_DATA;
    } catch (e) {
      return RESUME_DATA;
    }
  });

  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('siteConfig');
      return saved ? JSON.parse(saved) : INITIAL_SITE_CONFIG;
    } catch (e) {
      return INITIAL_SITE_CONFIG;
    }
  });

  const [clientDocs, setClientDocs] = useState<ClientDocument[]>([]);
  const [portalMessages, setPortalMessages] = useState<PortalMessage[]>([]);

  // 1. SUPABASE AUTH LISTENER & SESSION RESTORATION
  useEffect(() => {
    const initAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentUser(session.user);
                
                // Determine Role
                const userRole = session.user.email === 'asikosman010@gmail.com' || session.user.user_metadata?.role === 'admin' ? 'admin' : 'client';
                
                setLoginRole(userRole);
                setCurrentView(userRole);
            }
        } catch (e) {
            console.error("Session check error", e);
        } finally {
            setIsAuthChecking(false);
        }
    };

    initAuth();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
            setCurrentUser(session.user);
            const userRole = session.user.email === 'asikosman010@gmail.com' || session.user.user_metadata?.role === 'admin' ? 'admin' : 'client';
            setLoginRole(userRole);
            setCurrentView(userRole);
        } else {
            setCurrentUser(null);
            setCurrentView(prev => (prev === 'admin' || prev === 'client') ? 'portfolio' : prev);
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. REVALIDATE ON FOCUS (Handle Inactivity/Wake)
  useEffect(() => {
    const handleFocus = async () => {
        // When user returns to tab, verify session is still valid (or trigger refresh)
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            if (currentUser) {
                // Session expired while inactive/background
                await supabase.auth.signOut();
                setCurrentUser(null);
                setCurrentView('portfolio');
            }
        }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser]);

  // 3. FETCH GLOBAL SITE DATA
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      
      if (data) {
        if (data.data) {
            setWebsiteData(data.data);
            localStorage.setItem('resumeData', JSON.stringify(data.data));
        }
        if (data.config) {
            setSiteConfig(data.config);
            localStorage.setItem('siteConfig', JSON.stringify(data.config));
        }
      } else if (!data && !error) {
         // Attempt to seed data if empty
         const { error: insertError } = await supabase.from('site_settings').insert([{ data: RESUME_DATA, config: INITIAL_SITE_CONFIG }]);
         if (insertError) console.error("Error initializing site settings:", insertError);
      }
    };
    fetchSettings();
  }, []);

  // 4. DATA FETCHING & REALTIME SUBSCRIPTION
  const fetchData = useCallback(async () => {
      if (!currentUser) return;

      // 1. Load LocalStorage Backup first (Keep existing local content for offline/fallback)
      let localDocs: ClientDocument[] = [];
      let localMsgs: PortalMessage[] = [];
      try {
          const storedDocs = localStorage.getItem('mock_client_documents');
          if (storedDocs) localDocs = JSON.parse(storedDocs);
          
          const storedMsgs = localStorage.getItem('mock_portal_messages');
          if (storedMsgs) localMsgs = JSON.parse(storedMsgs);
      } catch(e) {}

      // 2. Try Supabase
      let dbDocs: ClientDocument[] = [];
      let dbMsgs: PortalMessage[] = [];

      const { data: docs } = await supabase.from('client_documents').select('*');
      if (docs) {
          dbDocs = docs.map((d: any) => ({
              id: d.id,
              userId: d.user_id,
              name: d.name,
              type: d.type || 'FILE',
              size: d.size || '0 MB',
              date: d.date,
              status: d.status,
              description: d.description,
              solutionNote: d.solution_note,
              solvedFile: d.solved_file,
              fileUrl: d.file_url
          }));
      }

      const { data: msgs } = await supabase.from('portal_messages').select('*');
      if (msgs) {
          dbMsgs = msgs.map((m: any) => ({
              id: m.id,
              userId: m.user_id,
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp,
              read: m.read
          }));
      }

      // 3. MERGE (Prefer DB data and de-duplicate)
      const mergedDocsMap = new Map<string, ClientDocument>();
      // Add DB docs first
      dbDocs.forEach(d => mergedDocsMap.set(d.id, d));
      // Add local docs only if they don't look like duplicates of DB docs (by name/date similarity)
      localDocs.forEach(d => {
          if (mergedDocsMap.has(d.id)) return;
          // Check for "ghost" duplicates (temp ID but same content)
          const isDuplicate = dbDocs.some(dbD => 
            dbD.name === d.name && 
            dbD.userId === d.userId &&
            dbD.date === d.date // Simple check
          );
          if (!isDuplicate) mergedDocsMap.set(d.id, d);
      });
      
      const mergedMsgsMap = new Map<string, PortalMessage>();
      // Add DB messages first
      dbMsgs.forEach(m => mergedMsgsMap.set(m.id, m));
      // Add local messages only if not duplicate
      localMsgs.forEach(m => {
          if (mergedMsgsMap.has(m.id)) return;
          
          // Fuzzy match to prevent duplicates during sync (within 1 second)
          const isDuplicate = dbMsgs.some(dbM => 
              dbM.text === m.text && 
              dbM.userId === m.userId && 
              dbM.sender === m.sender &&
              Math.abs(new Date(dbM.timestamp).getTime() - new Date(m.timestamp).getTime()) < 2000 
          );

          if (!isDuplicate) mergedMsgsMap.set(m.id, m);
      });

      // 4. Set State & Sort
      const finalDocs = Array.from(mergedDocsMap.values()).sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          return dateB - dateA;
      });

      // Strict Chronological Sort for Messages
      const finalMsgs = Array.from(mergedMsgsMap.values()).sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          // Fallback to ID comparison if invalid date (legacy data) or equal time
          if (isNaN(timeA) || isNaN(timeB)) return a.id.localeCompare(b.id);
          if (timeA === timeB) return a.id.localeCompare(b.id);
          return timeA - timeB;
      });

      if (loginRole === 'client') {
          setClientDocs(finalDocs.filter(d => d.userId === currentUser.id));
          setPortalMessages(finalMsgs.filter(m => m.userId === currentUser.id));
      } else {
          setClientDocs(finalDocs);
          setPortalMessages(finalMsgs);
      }

  }, [currentUser, loginRole]);

  useEffect(() => {
    fetchData();
    if (!currentUser) return;

    const channel = supabase.channel('app_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'client_documents' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_messages' }, () => fetchData())
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, currentUser]);


  // THEME MANAGEMENT
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) setIsDark(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ACTIONS

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView('portfolio');
  };

  const handleClientUpload = async (newDoc: ClientDocument) => {
    setClientDocs(prev => [newDoc, ...prev]);
    // Save to local storage
    try {
        const stored = localStorage.getItem('mock_client_documents');
        const docs = stored ? JSON.parse(stored) : [];
        const docWithUser = { ...newDoc, userId: currentUser?.id };
        docs.push(docWithUser);
        localStorage.setItem('mock_client_documents', JSON.stringify(docs));
    } catch (e) {}

    if (currentUser) {
        const { data } = await supabase.from('client_documents').insert([{
            user_id: currentUser.id,
            name: newDoc.name,
            type: newDoc.type,
            size: newDoc.size,
            date: newDoc.date,
            status: newDoc.status,
            description: newDoc.description,
            file_url: newDoc.fileUrl
        }]).select();

        if (data && data[0]) {
            const realId = data[0].id;
            // Update State
            setClientDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, id: realId } : d));
            // Update Local Storage
            try {
                const stored = localStorage.getItem('mock_client_documents');
                if (stored) {
                    const docs = JSON.parse(stored).map((d: ClientDocument) => 
                        d.id === newDoc.id ? { ...d, id: realId } : d
                    );
                    localStorage.setItem('mock_client_documents', JSON.stringify(docs));
                }
            } catch (e) {}
        }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    setClientDocs(prev => prev.filter(doc => doc.id !== id));
    // Remove from local backup
    try {
        const stored = localStorage.getItem('mock_client_documents');
        if (stored) {
            const docs = JSON.parse(stored).filter((d: ClientDocument) => d.id !== id);
            localStorage.setItem('mock_client_documents', JSON.stringify(docs));
        }
    } catch (e) {}
    if (currentUser) {
        await supabase.from('client_documents').delete().eq('id', id);
    }
  };

  const handleStatusUpdate = async (id: string, status: ClientDocument['status'], note?: string, solvedFile?: string) => {
    setClientDocs(prev => prev.map(doc => doc.id === id ? { ...doc, status, solutionNote: note, solvedFile: solvedFile } : doc));
    try {
        const stored = localStorage.getItem('mock_client_documents');
        if (stored) {
            const docs = JSON.parse(stored).map((d: ClientDocument) => 
                d.id === id ? { ...d, status, solutionNote: note, solvedFile: solvedFile } : d
            );
            localStorage.setItem('mock_client_documents', JSON.stringify(docs));
        }
    } catch (e) {}
    if (currentUser) { 
        await supabase.from('client_documents').update({ status, solution_note: note, solved_file: solvedFile }).eq('id', id);
    }
  };

  const handleSendMessage = async (text: string, targetUserId?: string) => {
    const tempId = Date.now().toString();
    const effectiveUserId = loginRole === 'admin' ? targetUserId : currentUser?.id;

    if (!effectiveUserId) return;

    // Use ISO string for strict ordering
    const timestampISO = new Date().toISOString();

    const newMessage: PortalMessage = {
      id: tempId,
      userId: effectiveUserId,
      sender: loginRole === 'admin' ? 'admin' : 'client',
      text,
      timestamp: timestampISO,
      read: false
    };

    setPortalMessages(prev => [...prev, newMessage]);
    
    try {
        const stored = localStorage.getItem('mock_portal_messages');
        const msgs = stored ? JSON.parse(stored) : [];
        msgs.push(newMessage);
        localStorage.setItem('mock_portal_messages', JSON.stringify(msgs));
    } catch(e) {}

    if (currentUser) {
        const { data } = await supabase.from('portal_messages').insert([{
            user_id: effectiveUserId,
            sender: newMessage.sender,
            text: newMessage.text,
            timestamp: newMessage.timestamp,
            read: false
        }]).select();

        if (data && data[0]) {
            const realId = data[0].id;
            
            // Update State with Real ID
            setPortalMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: realId } : m));
            
            // Update Local Storage with Real ID to prevent duplicates on next fetch
            try {
                const stored = localStorage.getItem('mock_portal_messages');
                if (stored) {
                    const msgs = JSON.parse(stored).map((m: PortalMessage) => 
                        m.id === tempId ? { ...m, id: realId } : m
                    );
                    localStorage.setItem('mock_portal_messages', JSON.stringify(msgs));
                }
            } catch(e) {}
        }
    }
  };

  const handleMarkRead = async (specificUserId?: string) => {
    if (!currentUser) return;
    const targetSender = loginRole === 'admin' ? 'client' : 'admin';

    setPortalMessages(prev => prev.map(msg => {
        const isTargetSender = msg.sender === targetSender;
        const isCorrectUser = loginRole === 'client' ? true : (specificUserId ? msg.userId === specificUserId : true);
        
        return (isTargetSender && isCorrectUser && !msg.read) ? { ...msg, read: true } : msg;
    }));

    // Update local backup
    try {
        const stored = localStorage.getItem('mock_portal_messages');
        if (stored) {
             const msgs = JSON.parse(stored).map((msg: PortalMessage) => {
                const isTargetSender = msg.sender === targetSender;
                const isCorrectUser = loginRole === 'client' ? (msg.userId === currentUser.id) : (specificUserId ? msg.userId === specificUserId : true);
                return (isTargetSender && isCorrectUser) ? { ...msg, read: true } : msg;
             });
             localStorage.setItem('mock_portal_messages', JSON.stringify(msgs));
        }
    } catch(e) {}

    // Supabase Update
    let query = supabase
        .from('portal_messages')
        .update({ read: true })
        .eq('sender', targetSender);
    
    if (loginRole === 'client') {
        query = query.eq('user_id', currentUser.id);
    } else if (specificUserId) {
        query = query.eq('user_id', specificUserId);
    }

    await query;
  };

  const handleWebsiteDataUpdate = async (newData: ResumeData) => {
    setWebsiteData(newData);
    localStorage.setItem('resumeData', JSON.stringify(newData));
    try {
        const { data } = await supabase.from('site_settings').select('id').limit(1).single();
        if (data) {
            await supabase.from('site_settings').update({ data: newData }).eq('id', data.id);
        } else {
             await supabase.from('site_settings').insert([{ data: newData, config: siteConfig }]);
        }
    } catch (e) {
        console.error(e);
    }
  };

  const handleConfigUpdate = async (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    localStorage.setItem('siteConfig', JSON.stringify(newConfig));
    try {
        const { data } = await supabase.from('site_settings').select('id').limit(1).single();
        if (data) {
             await supabase.from('site_settings').update({ config: newConfig }).eq('id', data.id);
        }
    } catch (e) {
        console.error(e);
    }
  };

  if (isAuthChecking) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Verifying Session...</p>
          </div>
      );
  }

  if (currentView === 'login') return <Login initialRole={loginRole} onLogin={(r, u) => { setCurrentUser(u); setCurrentView(r); }} onBack={() => setCurrentView('portfolio')} />;
  
  if (currentView === 'admin') return (
    <AdminPanel 
      onLogout={handleLogout} 
      currentData={websiteData} 
      currentConfig={siteConfig} 
      onUpdateData={handleWebsiteDataUpdate} 
      onUpdateConfig={handleConfigUpdate} 
      documents={clientDocs}
      onUpdateStatus={handleStatusUpdate}
      messages={portalMessages} 
      onSendMessage={handleSendMessage}
      onMarkRead={handleMarkRead}
      currentUser={currentUser}
    />
  );
  
  if (currentView === 'client') return (
    <ClientPanel 
      onLogout={handleLogout} 
      config={siteConfig} 
      documents={clientDocs} 
      onUpload={handleClientUpload}
      onDelete={handleDeleteDocument}
      messages={portalMessages} 
      onSendMessage={(txt) => handleSendMessage(txt)} 
      onMarkRead={() => handleMarkRead()} 
      currentUser={currentUser} 
    />
  );

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-[60]" style={{ scaleX }} />
      <Navbar onOpenLogin={(role) => { setLoginRole(role); setCurrentView('login'); }} />
      <div className="fixed bottom-6 left-6 z-40"><ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} /></div>
      <AnimatePresence>{isContactOpen && <ContactForm onClose={() => setIsContactOpen(false)} />}</AnimatePresence>
      <main className="overflow-hidden">
        <Hero data={websiteData} onOpenContact={() => setIsContactOpen(true)} onOpenLogin={() => { setLoginRole('client'); setCurrentView('login'); }} />
        <div className="relative space-y-0">
          <About data={websiteData} />
          <Skills skills={websiteData.skills} />
          <Services services={websiteData.services} />
          <Certifications certifications={websiteData.certifications} />
          <Education education={websiteData.education} />
          <Projects projects={websiteData.projects} />
          <Testimonials testimonials={websiteData.testimonials} />
          <Contact data={websiteData} onLoginClick={() => { setLoginRole('admin'); setCurrentView('login'); }} />
        </div>
      </main>
      <ScrollToTop />
      <ChatWidget data={websiteData} />
    </div>
  );
}