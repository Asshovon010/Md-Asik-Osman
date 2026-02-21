import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  FileCheck, 
  Menu, 
  ChevronRight, 
  Eye, 
  MessageSquare, 
  Send, 
  Plus, 
  Trash2, 
  Clock, 
  Activity, 
  Camera, 
  User as UserIcon, 
  RefreshCcw, 
  Check, 
  Briefcase, 
  Quote, 
  GraduationCap, 
  FolderGit2, 
  Award, 
  Star, 
  Type, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Lock,
  Loader2,
  Download,
  Upload,
  Film,
  MessageCircle,
  Filter,
  Save,
  CheckCircle2,
  FileText,
  Search,
  X
} from 'lucide-react';
import { ResumeData, ClientDocument, PortalMessage, SiteConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

interface AdminPanelProps {
  onLogout: () => void;
  currentData?: ResumeData;
  onUpdateData?: (data: ResumeData) => void;
  currentConfig?: SiteConfig;
  onUpdateConfig?: (config: SiteConfig) => void;
  documents?: ClientDocument[];
  onUpdateStatus?: (id: string, status: ClientDocument['status'], note?: string, solvedFile?: string) => void;
  messages?: PortalMessage[];
  onSendMessage?: (text: string, targetUserId?: string) => void;
  onMarkRead?: (userId?: string) => void;
  currentUser?: any;
}

const TabContent = ({ children, id }: { children?: React.ReactNode, id: string }) => (
  <motion.div
    key={id}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="h-full flex flex-col"
  >
    {children}
  </motion.div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onLogout, 
    currentData, 
    onUpdateData, 
    currentConfig,
    onUpdateConfig,
    documents = [], 
    onUpdateStatus,
    messages = [],
    onSendMessage,
    onMarkRead,
    currentUser
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingData, setEditingData] = useState<ResumeData | null>(currentData ? JSON.parse(JSON.stringify(currentData)) : null);
  const [editingConfig, setEditingConfig] = useState<SiteConfig | null>(currentConfig ? JSON.parse(JSON.stringify(currentConfig)) : null);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  
  // Realtime Notes Count
  const [notesCount, setNotesCount] = useState(0);

  // Sorting & Filtering State
  const [sortConfig, setSortConfig] = useState<{ key: keyof ClientDocument; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState('All');
  const [clientSearchTerm, setClientSearchTerm] = useState('');

  // Modals & Popups
  const [resolvingDocId, setResolvingDocId] = useState<string | null>(null);
  const [solutionNote, setSolutionNote] = useState('');
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);

  // Password Management
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<{type: 'success' | 'error' | '', msg: string}>({ type: '', msg: '' });

  // Chat
  const [chatInput, setChatInput] = useState('');
  const [selectedChatClientId, setSelectedChatClientId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const unreadMessagesCount = messages.filter(m => m.sender === 'client' && !m.read).length;

  // Mark Read when selecting a client
  useEffect(() => {
    if (activeTab === 'messages' && selectedChatClientId && onMarkRead) {
        onMarkRead(selectedChatClientId);
    }
  }, [activeTab, selectedChatClientId, messages]);

  useEffect(() => {
    if (activeTab === 'messages' && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab, selectedChatClientId]);

  // Sync editingData with currentData when currentData changes
  useEffect(() => {
      if (currentData) {
          const currentStr = JSON.stringify(currentData);
          const editingStr = JSON.stringify(editingData);
          if (currentStr !== editingStr) {
               setEditingData(JSON.parse(currentStr));
          }
      }
      if (currentConfig) {
          const currentConfigStr = JSON.stringify(currentConfig);
          const editingConfigStr = JSON.stringify(editingConfig);
          if (currentConfigStr !== editingConfigStr) {
               setEditingConfig(JSON.parse(currentConfigStr));
          }
      }
  }, [currentData, currentConfig]);

  // Fetch real note count from Supabase
  useEffect(() => {
    const initNotesCount = async () => {
        let uid = currentUser?.id;
        if (!uid) {
            const { data } = await supabase.auth.getUser();
            uid = data.user?.id;
        }
        
        if (!uid) return;

        const fetchCount = async () => {
            const { count, error } = await supabase
                .from('notes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', uid);
            
            if (!error && count !== null) {
                setNotesCount(count);
            }
        };

        fetchCount();

        const channel = supabase
            .channel('dashboard_notes_count')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${uid}` },
                () => { fetchCount(); }
            )
            .subscribe();
            
        return () => { supabase.removeChannel(channel); }
    };
    initNotesCount();
  }, [currentUser]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(currentData) !== JSON.stringify(editingData) || 
           JSON.stringify(currentConfig) !== JSON.stringify(editingConfig);
  }, [currentData, editingData, currentConfig, editingConfig]);

  const handleSaveContent = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    if (editingData && onUpdateData) onUpdateData(editingData);
    if (editingConfig && onUpdateConfig) onUpdateConfig(editingConfig);
    setIsSaving(false);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleResetChanges = () => {
    if (currentData) setEditingData(JSON.parse(JSON.stringify(currentData)));
    if (currentConfig) setEditingConfig(JSON.parse(JSON.stringify(currentConfig)));
  };

  const handlePasswordUpdate = () => {
      setPasswordStatus({ type: '', msg: '' });
      const currentStored = localStorage.getItem('admin_password') || 'admin123456';
      
      if (passwordForm.current !== currentStored) {
          setPasswordStatus({ type: 'error', msg: 'Current password incorrect' });
          return;
      }
      if (passwordForm.new !== passwordForm.confirm) {
          setPasswordStatus({ type: 'error', msg: 'New passwords do not match' });
          return;
      }
      if (passwordForm.new.length < 6) {
          setPasswordStatus({ type: 'error', msg: 'Password must be at least 6 characters' });
          return;
      }

      localStorage.setItem('admin_password', passwordForm.new);
      setPasswordStatus({ type: 'success', msg: 'Password updated successfully' });
      setPasswordForm({ current: '', new: '', confirm: '' });
  };

  // Storage and List helpers...
  const uploadToStorage = async (file: File, folder: string, itemId: string, targetUserId?: string): Promise<string | null> => {
     if (!currentUser) {
         alert("You must be logged in to upload files.");
         return null;
     }
     const uid = targetUserId || currentUser.id;
     const fileExt = file.name.split('.').pop();
     const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
     const path = `${uid}/${folder}/${itemId}/${uuid}.${fileExt}`;
     const { error } = await supabase.storage.from('app-files').upload(path, file);
     if (error) {
         console.error('Upload Error:', error);
         alert(`Upload failed: ${error.message}`);
         return null;
     }
     const { data } = await supabase.storage.from('app-files').createSignedUrl(path, 315360000);
     return data?.signedUrl || null;
  };

  const deleteFromStorage = async (signedUrl: string) => {
     try {
         const url = new URL(signedUrl);
         const parts = url.pathname.split('/sign/app-files/');
         if (parts.length === 2) {
             const path = decodeURIComponent(parts[1]);
             await supabase.storage.from('app-files').remove([path]);
         }
     } catch (e) {
         console.warn("Could not delete file from storage, might be external link", e);
     }
  };

  const updateListItem = (listName: keyof ResumeData, index: number, field: string, value: string) => {
    if (!editingData) return;
    const list = [...(editingData[listName] as any[])];
    list[index] = { ...list[index], [field]: value };
    setEditingData({ ...editingData, [listName]: list });
  };

  const deleteListItem = async (listName: keyof ResumeData, index: number) => {
    if (!editingData) return;
    const list = [...(editingData[listName] as any[])];
    const item = list[index];
    if (listName === 'projects' && item.image) {
        await deleteFromStorage(item.image);
    }
    list.splice(index, 1);
    setEditingData({ ...editingData, [listName]: list });
  };

  const addListItem = (listName: keyof ResumeData, newItem: any) => {
    if (!editingData) return;
    const list = [...(editingData[listName] as any[])];
    list.push(newItem);
    setEditingData({ ...editingData, [listName]: list });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingData) {
      setMediaUploading(true);
      const url = await uploadToStorage(file, 'profile', 'main');
      if (url) {
          const newData = { ...editingData, profileImage: url };
          setEditingData(newData);
          if (onUpdateData) onUpdateData(newData);
      }
      setMediaUploading(false);
      e.target.value = ''; 
    }
  };

  const handleProjectImageUpload = async (file: File, index: number) => {
     if(file && editingData) {
         setMediaUploading(true);
         const url = await uploadToStorage(file, 'projects', index.toString());
         if(url) {
             const list = [...editingData.projects];
             if (list[index].image) await deleteFromStorage(list[index].image);
             list[index] = { ...list[index], image: url };
             const newData = { ...editingData, projects: list };
             setEditingData(newData);
             if (onUpdateData) onUpdateData(newData);
         }
         setMediaUploading(false);
     }
  };

  const handleSkillChange = (index: number, value: string) => {
      if (!editingData) return;
      const newSkills = [...editingData.skills];
      newSkills[index] = value;
      setEditingData({ ...editingData, skills: newSkills });
  };

  const handleAddSkill = () => {
      if (!editingData) return;
      setEditingData({ ...editingData, skills: [...editingData.skills, "New Skill"] });
  };

  const handleDeleteSkill = (index: number) => {
      if (!editingData) return;
      setEditingData({ ...editingData, skills: editingData.skills.filter((_, i) => i !== index) });
  };

  // Helper to format timestamps for display
  const formatMessageTime = (isoString: string) => {
      try {
          // If it's already a time string (legacy data), just return it
          if (!isoString.includes('T')) return isoString;
          const date = new Date(isoString);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
          return isoString;
      }
  };

  // Dynamic Data Processing
  const filteredAndSortedDocuments = useMemo(() => {
    if (!documents) return [];
    const filtered = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(docSearchTerm.toLowerCase());
        const matchesStatus = docStatusFilter === 'All' || doc.status === docStatusFilter;
        return matchesSearch && matchesStatus;
    });
    return filtered.sort((a, b) => {
      let aVal: any = a[sortConfig.key] || "";
      let bVal: any = b[sortConfig.key] || "";
      if (sortConfig.key === 'date') { aVal = new Date(a.date).getTime(); bVal = new Date(b.date).getTime(); }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [documents, sortConfig, docSearchTerm, docStatusFilter]);

  const derivedClients = useMemo(() => {
      const clientMap = new Map();
      const getClient = (id: string) => {
          if (!clientMap.has(id)) {
              clientMap.set(id, {
                  id,
                  name: `Client ${id.substring(0, 5)}...`,
                  status: 'Active',
                  joined: new Date().toLocaleDateString(),
                  uploads: 0,
                  messagesCount: 0,
                  unreadCount: 0,
                  pendingCount: 0,
                  lastActive: 'Never'
              });
          }
          return clientMap.get(id);
      };

      documents.forEach(doc => {
          if (!doc.userId) return;
          const client = getClient(doc.userId);
          client.uploads += 1;
          client.joined = doc.date; // Approximation
          if (doc.status !== 'Solved') client.pendingCount += 1;
          if (client.lastActive === 'Never' || new Date(doc.date) > new Date(client.lastActive)) {
              client.lastActive = doc.date;
          }
      });

      messages.forEach(msg => {
          if (!msg.userId) return;
          const client = getClient(msg.userId);
          client.messagesCount += 1;
          if (msg.sender === 'client' && !msg.read) {
              client.unreadCount += 1;
          }
          // Assuming msg.timestamp is ISO or date-parsable for most recent
          const msgDate = new Date(msg.timestamp);
          const currentLast = client.lastActive === 'Never' ? new Date(0) : new Date(client.lastActive);
          
          if (!isNaN(msgDate.getTime()) && msgDate > currentLast) {
              client.lastActive = msg.timestamp; 
          }
      });
      return Array.from(clientMap.values());
  }, [documents, messages]);

  const filteredClients = useMemo(() => {
      return derivedClients.filter(client => 
          client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) || 
          client.id.toLowerCase().includes(clientSearchTerm.toLowerCase())
      );
  }, [derivedClients, clientSearchTerm]);

  const stats = useMemo(() => {
    if (!documents) return { total: 0, pending: 0, solved: 0, activeClients: 0 };
    return {
        total: documents.length,
        pending: documents.filter(d => d.status !== 'Solved').length,
        solved: documents.filter(d => d.status === 'Solved').length,
        activeClients: derivedClients.length
    };
  }, [documents, derivedClients]);

  const activeChatMessages = useMemo(() => {
      if (!selectedChatClientId) return [];
      const msgs = messages.filter(m => m.userId === selectedChatClientId);
      // Ensure strict sorting for the view
      return msgs.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          if (isNaN(timeA) || isNaN(timeB)) return a.id.localeCompare(b.id);
          return timeA - timeB;
      });
  }, [messages, selectedChatClientId]);

  const handleResolveSubmit = async () => {
      if(resolvingDocId && onUpdateStatus) {
         setIsUploading(true);
         let fileUrl = '';
         if (solutionFile) {
             const doc = documents.find(d => d.id === resolvingDocId);
             if (doc && doc.userId) {
                 const uploadedUrl = await uploadToStorage(solutionFile, 'solutions', resolvingDocId, doc.userId);
                 if (uploadedUrl) fileUrl = uploadedUrl;
             } else {
                 const uploadedUrl = await uploadToStorage(solutionFile, 'solutions', resolvingDocId);
                 if (uploadedUrl) fileUrl = uploadedUrl;
             }
         }
         
         // Use setTimeout to allow UI to show spinner briefly
         setTimeout(() => {
             onUpdateStatus(resolvingDocId, 'Solved', solutionNote, fileUrl);
             setIsUploading(false);
             setResolvingDocId(null);
             setSolutionFile(null);
             setSolutionNote('');
         }, 800);
      }
  };

  const handleOpenChat = (clientId: string) => {
      setSelectedChatClientId(clientId);
      setActiveTab('messages');
      if (window.innerWidth < 768) setMobileMenuOpen(false);
  };

  const sidebarGroups = [
    {
        title: "Overview",
        items: [
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'messages', icon: MessageSquare, label: 'Messages', badge: unreadMessagesCount },
            { id: 'documents', icon: FileCheck, label: 'Client Docs', badge: stats.pending },
            { id: 'clients', icon: Users, label: 'Client Audit' },
        ]
    },
    {
        title: "Content Management",
        items: [
            { id: 'profile', icon: UserIcon, label: 'Profile & Hero' },
            { id: 'site_content', icon: Type, label: 'Portal Labels' },
            { id: 'services', icon: Briefcase, label: 'Services' },
            { id: 'skills', icon: Star, label: 'Skills & Expertise' },
            { id: 'projects', icon: FolderGit2, label: 'Projects' },
            { id: 'certifications', icon: Award, label: 'Certifications' },
            { id: 'experience', icon: GraduationCap, label: 'Experience' },
            { id: 'testimonials', icon: Quote, label: 'Testimonials' },
        ]
    },
    {
        title: "System",
        items: [
            { id: 'settings', icon: Settings, label: 'Settings' },
        ]
    }
  ];

  const SidebarContent = () => (
      <>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 overflow-hidden whitespace-nowrap h-20">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-600/20">A</div>
          <span className="font-bold text-lg tracking-tight">Admin Panel</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {sidebarGroups.map((group, idx) => (
                <div key={idx}>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 px-2">{group.title}</h4>
                    <div className="space-y-1">
                        {group.items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSelectedChatClientId(null); if (window.innerWidth < 768) setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group ${
                                    activeTab === item.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <item.icon size={20} className={activeTab === item.id ? 'fill-blue-600/10' : ''} />
                                <span className="text-sm font-medium">{item.label}</span>
                                {item.badge ? (
                                    <span className="absolute right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </>
  );

  const SaveBar = () => (
      <div className={`sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center transition-all ${hasChanges ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 absolute w-full'}`}>
          <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              You have unsaved changes
          </div>
          <div className="flex gap-3">
              <button 
                  onClick={handleResetChanges}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                  Discard
              </button>
              <button 
                  onClick={handleSaveContent}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
              >
                  {isSaving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}
                  {saveStatus === 'success' ? 'Published!' : 'Publish Changes'}
              </button>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col z-20 transition-all duration-300 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 overflow-hidden whitespace-nowrap h-20">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-blue-600/20">A</div>
          {sidebarOpen && <span className="font-bold text-lg tracking-tight">Admin Panel</span>}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
            {sidebarGroups.map((group, idx) => (
                <div key={idx}>
                    {sidebarOpen && <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 px-2">{group.title}</h4>}
                    <div className="space-y-1">
                        {group.items.map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSelectedChatClientId(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group ${
                                    activeTab === item.id 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                } ${!sidebarOpen ? 'justify-center' : ''}`}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <item.icon size={20} className={activeTab === item.id ? 'fill-blue-600/10' : ''} />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                                {item.badge ? (
                                    <span className={`absolute ${sidebarOpen ? 'right-2' : 'top-2 right-2'} w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900`}>
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={onLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 rounded-lg transition-colors text-sm font-medium ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {mobileMenuOpen && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }} 
             className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
             onClick={() => setMobileMenuOpen(false)}
           >
              <motion.aside
                 initial={{ x: "-100%" }}
                 animate={{ x: 0 }}
                 exit={{ x: "-100%" }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                 className="absolute top-0 left-0 w-72 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
                 onClick={e => e.stopPropagation()}
              >
                  <SidebarContent />
              </motion.aside>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
           <div className="flex items-center gap-4">
                {/* Desktop Menu Toggle */}
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg hidden md:block">
                    <Menu size={20} />
                </button>
                {/* Mobile Menu Toggle */}
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden">
                    <Menu size={20} />
                </button>

                <h2 className="text-lg md:text-xl font-bold capitalize flex items-center gap-2 truncate">
                    {activeTab.replace('_', ' ').replace('-', ' ')}
                    {hasChanges && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wide border border-orange-200 hidden sm:inline-block">Unsaved</span>}
                </h2>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                  onClick={handleSaveContent}
                  disabled={!hasChanges || isSaving}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-sm font-bold transition-all ${
                      hasChanges 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 active:scale-95' 
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600 cursor-not-allowed opacity-50'
                  }`}
              >
                  {isSaving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>

              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">System Online</span>
              </div>
           </div>
        </header>
        
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 relative">
            <SaveBar />
            
            <div className="p-4 md:p-10 max-w-7xl mx-auto pb-32">
                <AnimatePresence mode="wait">
                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <TabContent id="dashboard">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard label="Total Docs" value={stats.total} icon={<FileText size={24}/>} color="blue" onClick={() => setActiveTab('documents')} />
                                <StatCard label="Pending Review" value={stats.pending} icon={<Clock size={24}/>} color="orange" onClick={() => { setActiveTab('documents'); setDocStatusFilter('Submitted'); }} />
                                <StatCard label="Active Clients" value={stats.activeClients} icon={<Users size={24}/>} color="purple" onClick={() => setActiveTab('clients')} />
                                <StatCard label="Resolution Rate" value={`${stats.total ? Math.round((stats.solved / stats.total) * 100) : 0}%`} icon={<CheckCircle2 size={24}/>} color="green" />
                            </div>
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                                <h3 className="font-bold mb-6 flex items-center gap-2"><Activity size={20} className="text-blue-500"/> Recent Activity</h3>
                                <div className="space-y-4">
                                    {documents.slice(0, 5).map(doc => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => setActiveTab('documents')}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-blue-600"><FileText size={20} /></div>
                                                <div>
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</p>
                                                    <p className="text-xs text-slate-500">{doc.date}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${doc.status === 'Solved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{doc.status}</span>
                                        </div>
                                    ))}
                                    {documents.length === 0 && <div className="text-center text-slate-400 py-4 text-sm">No recent activity.</div>}
                                </div>
                            </div>
                        </TabContent>
                    )}

                    {/* MESSAGES */}
                    {activeTab === 'messages' && (
                        <TabContent id="messages">
                             <div className="flex h-[70vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex-col md:flex-row">
                                 {/* Sidebar List */}
                                 <div className={`w-full md:w-1/3 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900 ${selectedChatClientId ? 'hidden md:flex' : 'flex'}`}>
                                     <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-500 uppercase tracking-wider">Recent Conversations</div>
                                     <div className="flex-1 overflow-y-auto">
                                         {derivedClients.map(client => (
                                             <button 
                                                key={client.id}
                                                onClick={() => setSelectedChatClientId(client.id)}
                                                className={`w-full p-4 flex items-center gap-3 transition-colors ${selectedChatClientId === client.id ? 'bg-blue-50 dark:bg-slate-800 border-r-4 border-blue-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                             >
                                                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 uppercase text-xs relative">
                                                     {client.id.slice(0,2)}
                                                     {client.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900"></span>}
                                                 </div>
                                                 <div className="text-left overflow-hidden flex-1">
                                                     <p className="font-bold text-sm text-slate-900 dark:text-white truncate">Client {client.id.slice(0,5)}</p>
                                                     <p className={`text-xs truncate ${client.unreadCount > 0 ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                                                        {client.unreadCount > 0 ? `${client.unreadCount} unread messages` : 'Click to chat'}
                                                     </p>
                                                 </div>
                                                 {/* Last active indicator */}
                                                 <div className="text-[10px] text-slate-400 whitespace-nowrap">
                                                     {client.lastActive !== 'Never' ? formatMessageTime(client.lastActive) : ''}
                                                 </div>
                                             </button>
                                         ))}
                                         {derivedClients.length === 0 && <div className="p-4 text-center text-slate-400 text-xs">No active clients</div>}
                                     </div>
                                 </div>

                                 {/* Chat Area */}
                                 <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 ${!selectedChatClientId ? 'hidden md:flex' : 'flex'}`}>
                                     {selectedChatClientId ? (
                                         <>
                                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shadow-sm z-10">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => setSelectedChatClientId(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="rotate-180" size={20} /></button>
                                                    <h3 className="font-bold flex items-center gap-2 text-sm md:text-base"><MessageSquare size={18} className="text-blue-500"/> Chat with Client {selectedChatClientId.slice(0,5)}</h3>
                                                </div>
                                            </div>
                                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950">
                                                {activeChatMessages.length > 0 ? activeChatMessages.map((msg, i) => (
                                                    <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                                                            <p>{msg.text}</p>
                                                            <p className="text-[10px] mt-1 opacity-70 text-right">{formatMessageTime(msg.timestamp)}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                                        <MessageSquare size={40} className="mb-2 opacity-20" />
                                                        <p>No messages yet.</p>
                                                    </div>
                                                )}
                                                <div ref={chatEndRef} />
                                            </div>
                                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                                <form onSubmit={(e) => { e.preventDefault(); if(chatInput.trim() && onSendMessage) { onSendMessage(chatInput, selectedChatClientId); setChatInput(''); }}} className="flex gap-2">
                                                    <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} type="text" placeholder="Type a reply..." className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm" />
                                                    <button type="submit" disabled={!chatInput.trim()} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"><Send size={20}/></button>
                                                </form>
                                            </div>
                                         </>
                                     ) : (
                                         <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 dark:bg-slate-900">
                                             <MessageCircle size={48} className="opacity-20 mb-4" />
                                             <p>Select a client from the left to start chatting</p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </TabContent>
                    )}

                    {/* DOCUMENTS */}
                    {activeTab === 'documents' && (
                         <TabContent id="docs">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                               <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                                   <h3 className="font-bold flex items-center gap-2"><FileCheck className="text-blue-600"/> Client Documents</h3>
                                   <div className="flex flex-wrap items-center gap-2">
                                       {/* Search */}
                                       <div className="relative">
                                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                           <input 
                                                type="text" 
                                                placeholder="Search docs..." 
                                                value={docSearchTerm}
                                                onChange={e => setDocSearchTerm(e.target.value)}
                                                className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 w-32 md:w-40"
                                           />
                                       </div>
                                       {/* Filter */}
                                       <div className="relative">
                                           <select 
                                               value={docStatusFilter}
                                               onChange={e => setDocStatusFilter(e.target.value)}
                                               className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 text-slate-600 dark:text-slate-300"
                                           >
                                               <option value="All">All Status</option>
                                               <option value="Submitted">Submitted</option>
                                               <option value="Under Review">Under Review</option>
                                               <option value="Solved">Solved</option>
                                           </select>
                                           <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                                       </div>
                                       <button onClick={() => setSortConfig({key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors hidden sm:block">
                                           Sort {sortConfig.direction === 'asc' ? 'Oldest' : 'Newest'}
                                       </button>
                                   </div>
                               </div>
                               <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                   {filteredAndSortedDocuments.map(doc => {
                                        const isVideo = doc.type === 'VIDEO' || doc.type.includes('MP4') || doc.type.includes('MOV');
                                        return (
                                            <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shrink-0">
                                                        {isVideo ? <Film size={20}/> : <FileText size={20}/>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{doc.name}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${doc.status === 'Solved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{doc.status}</span>
                                                            <span className="text-xs text-slate-400">{doc.date}</span>
                                                        </div>
                                                        {doc.solutionNote && <p className="text-xs text-green-600 mt-1 italic max-w-md truncate">Solution: {doc.solutionNote}</p>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 self-end sm:self-auto">
                                                        {doc.status !== 'Solved' && <button onClick={() => setResolvingDocId(doc.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Resolve</button>}
                                                        <button onClick={() => setPreviewDoc(doc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18}/></button>
                                                </div>
                                            </div>
                                        );
                                   })}
                                   {filteredAndSortedDocuments.length === 0 && <div className="p-8 text-center text-slate-500">No documents found matching filters.</div>}
                               </div>
                           </div>
                         </TabContent>
                    )}

                    {/* CLIENTS (AUDIT) */}
                    {activeTab === 'clients' && (
                        <TabContent id="clients">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="font-bold flex items-center gap-2"><Users className="text-blue-600" size={20}/> Client Audit & Management</h3>
                                    <div className="relative">
                                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                           <input 
                                                type="text" 
                                                placeholder="Search ID or Name..." 
                                                value={clientSearchTerm}
                                                onChange={e => setClientSearchTerm(e.target.value)}
                                                className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 w-36 md:w-56"
                                           />
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredClients.length > 0 ? filteredClients.map(client => (
                                        <div key={client.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold uppercase relative">
                                                    {client.id.substring(0,2)}
                                                    {client.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900"></span>}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">ID: {client.id}</h4>
                                                    <p className="text-xs text-slate-500">Active since: {client.joined}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Documents</span>
                                                    <span className="font-bold">{client.uploads} Uploads</span>
                                                </div>
                                                
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Messages</span>
                                                    <span className={`font-bold ${client.unreadCount > 0 ? 'text-blue-500' : ''}`}>
                                                        {client.unreadCount > 0 ? `${client.unreadCount} New` : 'Caught up'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">Audit Status</span>
                                                    <span className={`font-bold ${client.pendingCount > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                                        {client.pendingCount > 0 ? `${client.pendingCount} Pending` : 'All Solved'}
                                                    </span>
                                                </div>

                                                <button 
                                                    onClick={() => handleOpenChat(client.id)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
                                                        client.unreadCount > 0 
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20' 
                                                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                                                    }`}
                                                >
                                                    <MessageCircle size={14} /> 
                                                    {client.unreadCount > 0 ? `Chat (${client.unreadCount})` : 'Message'}
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-8 text-center text-slate-500">No active clients found matching search.</div>
                                    )}
                                </div>
                            </div>
                        </TabContent>
                    )}
                    
                    {/* ... Content Management Tabs ... */}
                    {activeTab === 'profile' && editingData && (
                        <TabContent id="profile">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                                <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    <div className="relative group w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                        <img src={editingData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            {mediaUploading ? <Loader2 className="animate-spin text-white" /> : <Camera className="text-white" />}
                                            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                        </label>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">Profile Picture</h3>
                                        <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP. Max 2MB.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Full Name" value={editingData.name} onChange={(v) => setEditingData({...editingData, name: v})} />
                                    <InputGroup label="Professional Title" value={editingData.title} onChange={(v) => setEditingData({...editingData, title: v})} />
                                </div>
                                <InputGroup label="Professional Summary" value={editingData.summary || ''} type="textarea" onChange={(v) => setEditingData({...editingData, summary: v})} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <InputGroup label="Email" value={editingData.contact.email} onChange={(v) => setEditingData({...editingData, contact: {...editingData.contact, email: v}})} icon={<LinkIcon size={14}/>} />
                                    <InputGroup label="Phone" value={editingData.contact.phone} onChange={(v) => setEditingData({...editingData, contact: {...editingData.contact, phone: v}})} icon={<LinkIcon size={14}/>} />
                                    <InputGroup label="Location" value={editingData.contact.location} onChange={(v) => setEditingData({...editingData, contact: {...editingData.contact, location: v}})} icon={<LinkIcon size={14}/>} />
                                    <InputGroup label="LinkedIn" value={editingData.contact.linkedin} onChange={(v) => setEditingData({...editingData, contact: {...editingData.contact, linkedin: v}})} icon={<LinkIcon size={14}/>} />
                                </div>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'site_content' && editingConfig && (
                        <TabContent id="site_content">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Type size={20} className="text-blue-500" /> 
                                    Client Portal Interface Text
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup label="Welcome Title" value={editingConfig.portalWelcomeTitle} onChange={(v) => setEditingConfig({...editingConfig, portalWelcomeTitle: v})} />
                                    <InputGroup label="Welcome Subtitle" value={editingConfig.portalWelcomeSubtitle} onChange={(v) => setEditingConfig({...editingConfig, portalWelcomeSubtitle: v})} />
                                    
                                    <InputGroup label="Upload Card Title" value={editingConfig.uploadCardTitle} onChange={(v) => setEditingConfig({...editingConfig, uploadCardTitle: v})} />
                                    <InputGroup label="Upload Helper Text" type="textarea" value={editingConfig.uploadCardHelper} onChange={(v) => setEditingConfig({...editingConfig, uploadCardHelper: v})} />
                                    
                                    <InputGroup label="Support Card Title" value={editingConfig.supportCardTitle} onChange={(v) => setEditingConfig({...editingConfig, supportCardTitle: v})} />
                                    <InputGroup label="Support Card Text" value={editingConfig.supportCardText} onChange={(v) => setEditingConfig({...editingConfig, supportCardText: v})} />
                                    
                                    <InputGroup label="Success Notification" value={editingConfig.notificationUploadSuccess} onChange={(v) => setEditingConfig({...editingConfig, notificationUploadSuccess: v})} />
                                    <InputGroup label="Maintenance Message" value={editingConfig.notificationMaintenance} onChange={(v) => setEditingConfig({...editingConfig, notificationMaintenance: v})} />
                                </div>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'services' && editingData && (
                        <TabContent id="services">
                            <div className="space-y-4">
                                {editingData.services.map((service, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 group">
                                        <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-xl h-fit text-blue-600"><Briefcase size={20}/></div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-sm text-slate-400">Service #{index + 1}</h4>
                                                <button onClick={() => deleteListItem('services', index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputGroup label="Title" value={service.title} onChange={(v) => updateListItem('services', index, 'title', v)} />
                                                <InputGroup label="Price" value={service.price || ''} onChange={(v) => updateListItem('services', index, 'price', v)} />
                                            </div>
                                            <InputGroup label="Description" value={service.description} type="textarea" onChange={(v) => updateListItem('services', index, 'description', v)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addListItem('services', { title: 'New Service', description: 'Description here...', price: 'Starting at $100' })} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add New Service
                                </button>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'skills' && editingData && (
                        <TabContent id="skills">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className="font-bold mb-6 flex items-center gap-2"><Star className="text-blue-500" size={20}/> Core Competencies</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {editingData.skills.map((skill, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input 
                                                value={skill} 
                                                onChange={(e) => handleSkillChange(index, e.target.value)}
                                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                                            />
                                            <button onClick={() => handleDeleteSkill(index)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    ))}
                                    <button onClick={handleAddSkill} className="px-4 py-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                        <Plus size={16} /> Add Skill
                                    </button>
                                </div>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'projects' && editingData && (
                        <TabContent id="projects">
                             <div className="space-y-6">
                                {editingData.projects.map((project, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 group">
                                        <div className="w-full md:w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl relative overflow-hidden group/img shrink-0">
                                            {project.image ? <img src={project.image} alt="Project" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={24}/></div>}
                                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                                                <Camera className="text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handleProjectImageUpload(f, index);
                                                }} />
                                            </label>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-sm text-slate-400">Project #{index + 1}</h4>
                                                <button onClick={() => deleteListItem('projects', index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                            <InputGroup label="Project Title" value={project.title} onChange={(v) => updateListItem('projects', index, 'title', v)} />
                                            <InputGroup label="Description" value={project.description} type="textarea" onChange={(v) => updateListItem('projects', index, 'description', v)} />
                                            <InputGroup label="Link (Optional)" value={project.link || ''} onChange={(v) => updateListItem('projects', index, 'link', v)} icon={<LinkIcon size={14}/>} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addListItem('projects', { title: 'New Project', description: 'Project details...', link: '' })} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add New Project
                                </button>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'certifications' && editingData && (
                        <TabContent id="certifications">
                            <div className="space-y-4">
                                {editingData.certifications.map((cert, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 group">
                                        <div className="p-3 bg-teal-50 dark:bg-slate-800 rounded-xl h-fit text-teal-600"><Award size={20}/></div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-sm text-slate-400">Certification #{index + 1}</h4>
                                                <button onClick={() => deleteListItem('certifications', index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                            <InputGroup label="Title" value={cert.title} onChange={(v) => updateListItem('certifications', index, 'title', v)} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputGroup label="Issuer" value={cert.issuer} onChange={(v) => updateListItem('certifications', index, 'issuer', v)} />
                                                <InputGroup label="Year" value={cert.year || ''} onChange={(v) => updateListItem('certifications', index, 'year', v)} />
                                            </div>
                                            <InputGroup label="Link (Credential URL)" value={cert.link || ''} onChange={(v) => updateListItem('certifications', index, 'link', v)} icon={<LinkIcon size={14}/>} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addListItem('certifications', { title: 'New Certificate', issuer: 'Issuing Organization', year: new Date().getFullYear().toString(), link: '' })} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add Certification
                                </button>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'experience' && editingData && (
                        <TabContent id="experience">
                            <div className="space-y-4">
                                {editingData.education.map((edu, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 group">
                                        <div className="p-3 bg-purple-50 dark:bg-slate-800 rounded-xl h-fit text-purple-600"><GraduationCap size={20}/></div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-sm text-slate-400">Education #{index + 1}</h4>
                                                <button onClick={() => deleteListItem('education', index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                            <InputGroup label="Institution" value={edu.institution} onChange={(v) => updateListItem('education', index, 'institution', v)} />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputGroup label="Degree" value={edu.degree} onChange={(v) => updateListItem('education', index, 'degree', v)} />
                                                <InputGroup label="Year" value={edu.year || ''} onChange={(v) => updateListItem('education', index, 'year', v)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addListItem('education', { institution: 'University Name', degree: 'Degree Name', year: '2020 - 2024' })} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add Education
                                </button>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'testimonials' && editingData && (
                        <TabContent id="testimonials">
                            <div className="space-y-4">
                                {editingData.testimonials.map((item, index) => (
                                    <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-4 group">
                                        <div className="p-3 bg-yellow-50 dark:bg-slate-800 rounded-xl h-fit text-yellow-600"><Quote size={20}/></div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-sm text-slate-400">Testimonial #{index + 1}</h4>
                                                <button onClick={() => deleteListItem('testimonials', index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputGroup label="Client Name" value={item.name} onChange={(v) => updateListItem('testimonials', index, 'name', v)} />
                                                <InputGroup label="Role / Company" value={item.role} onChange={(v) => updateListItem('testimonials', index, 'role', v)} />
                                            </div>
                                            <InputGroup label="Quote" value={item.quote} type="textarea" onChange={(v) => updateListItem('testimonials', index, 'quote', v)} />
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addListItem('testimonials', { name: 'Client Name', role: 'CEO', quote: 'Great service!' })} className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add Testimonial
                                </button>
                            </div>
                        </TabContent>
                    )}
                    {activeTab === 'settings' && (
                        <TabContent id="settings">
                            <div className="max-w-2xl mx-auto space-y-8">
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><Lock size={20} className="text-blue-500"/> Security Settings</h3>
                                    <div className="space-y-4">
                                        <InputGroup label="Current Password" type="password" value={passwordForm.current} onChange={(v) => setPasswordForm({...passwordForm, current: v})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputGroup label="New Password" type="password" value={passwordForm.new} onChange={(v) => setPasswordForm({...passwordForm, new: v})} />
                                            <InputGroup label="Confirm Password" type="password" value={passwordForm.confirm} onChange={(v) => setPasswordForm({...passwordForm, confirm: v})} />
                                        </div>
                                        {passwordStatus.msg && (
                                            <div className={`text-sm font-bold ${passwordStatus.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                                                {passwordStatus.msg}
                                            </div>
                                        )}
                                        <button onClick={handlePasswordUpdate} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold mt-2 hover:opacity-90 transition-opacity">Update Password</button>
                                    </div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 p-8">
                                    <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                                    <p className="text-sm text-slate-500 mb-6">Resetting will revert all content to the default template. This cannot be undone.</p>
                                    <button className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">Reset to Defaults</button>
                                </div>
                            </div>
                        </TabContent>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>
      
      {/* Resolving Modal - Updated with File Upload */}
      {resolvingDocId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl max-w-md w-full shadow-2xl">
                  <h3 className="font-bold mb-4">Complete Task</h3>
                  <textarea value={solutionNote} onChange={(e) => setSolutionNote(e.target.value)} className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 h-32 resize-none outline-none" placeholder="Resolution notes..." />
                  
                  {/* Resolution File Upload */}
                  <div className="mb-4">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Attach Solution File (Optional)</label>
                      <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
                          <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer"
                             onChange={(e) => e.target.files && setSolutionFile(e.target.files[0])} 
                          />
                          <div className="flex flex-col items-center justify-center text-slate-400">
                             {solutionFile ? (
                                 <>
                                    <FileText size={24} className="text-blue-500 mb-2" />
                                    <span className="text-sm text-slate-900 dark:text-white font-bold truncate max-w-[200px]">{solutionFile.name}</span>
                                    <span className="text-xs">{(solutionFile.size / 1024).toFixed(0)} KB</span>
                                 </>
                             ) : (
                                 <>
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-sm font-bold">Click to Upload</span>
                                    <span className="text-xs">PDF, Excel, Images</span>
                                 </>
                             )}
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-end gap-2">
                      <button onClick={() => { setResolvingDocId(null); setSolutionFile(null); }} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                      <button onClick={handleResolveSubmit} disabled={isUploading} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-50">
                          {isUploading ? <RefreshCcw className="animate-spin" size={16}/> : <Check size={16}/>} Mark Solved
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewDoc(null)}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                        <div>
                            <h3 className="font-bold text-lg dark:text-white">{previewDoc.name}</h3>
                            <p className="text-xs text-slate-500">{previewDoc.type} • {previewDoc.size}</p>
                        </div>
                        <div className="flex gap-2">
                             {previewDoc.fileUrl && previewDoc.fileUrl !== '#' && (
                                <a 
                                    href={previewDoc.fileUrl} 
                                    download={previewDoc.name}
                                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    title="Download"
                                >
                                    <Download size={20} />
                                </a>
                             )}
                             <button 
                                onClick={() => setPreviewDoc(null)}
                                className="p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                             >
                                <X size={20} />
                             </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 flex items-center justify-center relative">
                        {/* File Preview Logic */}
                        {['JPG','JPEG','PNG','GIF','WEBP','SVG'].some(t => previewDoc.type.includes(t)) || previewDoc.type.includes('IMAGE') ? (
                            <img src={previewDoc.fileUrl} alt={previewDoc.name} className="max-w-full max-h-full object-contain shadow-lg rounded-lg" />
                        ) : ['MP4', 'MOV', 'AVI', 'WEBM', 'VIDEO'].some(t => previewDoc.type.includes(t)) ? (
                            <video controls src={previewDoc.fileUrl} className="max-w-full max-h-[80vh] rounded-lg shadow-lg" />
                        ) : previewDoc.type === 'PDF' ? (
                            <iframe src={previewDoc.fileUrl} className="w-full h-full min-h-[60vh] rounded-lg border border-slate-200 dark:border-slate-800" title="Document Preview" />
                        ) : (
                            <div className="text-center p-10">
                                <FileText size={64} className="mx-auto text-slate-300 mb-4"/>
                                <p className="text-slate-500">No preview available for this file type.</p>
                                {previewDoc.fileUrl && previewDoc.fileUrl !== '#' && <a href={previewDoc.fileUrl} download className="mt-4 inline-block text-blue-600 hover:underline">Download File</a>}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, type = "text", icon }: { label: string, value: string, onChange: (val: string) => void, type?: "text" | "textarea" | "password", icon?: React.ReactNode }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-3.5 text-slate-400">{icon}</div>}
            {type === 'textarea' ? (
                <textarea 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm min-h-[100px] resize-y ${icon ? 'pl-10' : ''}`}
                />
            ) : (
                <input 
                    type={type}
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm ${icon ? 'pl-10' : ''}`}
                />
            )}
        </div>
    </div>
);

const StatCard = ({ label, value, icon, color, onClick }: { label: string, value: string | number, icon: any, color: 'blue' | 'orange' | 'purple' | 'green', onClick?: () => void }) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-500',
        orange: 'bg-orange-50 dark:bg-orange-900/10 text-orange-500',
        purple: 'bg-purple-50 dark:bg-purple-900/10 text-purple-500',
        green: 'bg-green-50 dark:bg-green-900/10 text-green-500',
    };

    return (
        <div onClick={onClick} className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''}`}>
            <div className={`p-4 rounded-xl ${colorClasses[color]}`}>{icon}</div>
            <div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</p>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h4>
            </div>
        </div>
    );
};

export default AdminPanel;