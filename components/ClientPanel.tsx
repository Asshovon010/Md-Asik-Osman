import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  Clock, 
  LogOut,
  Bell,
  Upload,
  File,
  X,
  Send,
  Search,
  LayoutGrid,
  List,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Filter,
  Trash2,
  Film,
  Image as ImageIcon,
  AlertTriangle,
  Paperclip
} from 'lucide-react';
import { ClientDocument, PortalMessage, SiteConfig } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

interface ClientPanelProps {
  onLogout: () => void;
  documents: ClientDocument[];
  onUpload: (doc: ClientDocument) => void;
  onDelete: (id: string) => void;
  messages: PortalMessage[];
  onSendMessage: (text: string) => void;
  onMarkRead: () => void;
  config: SiteConfig;
  currentUser?: any;
}

const ClientPanel: React.FC<ClientPanelProps> = ({ 
    onLogout, 
    documents, 
    onUpload,
    onDelete,
    messages, 
    onSendMessage,
    onMarkRead,
    config,
    currentUser
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents, searchTerm, statusFilter]);

  // Ensure strict chronological sorting for chat view
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        if (isNaN(timeA) || isNaN(timeB)) return a.id.localeCompare(b.id);
        if (timeA === timeB) return a.id.localeCompare(b.id);
        return timeA - timeB;
    });
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages, isChatOpen]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;

    // File Size Check (50MB Limit for Supabase Standard)
    const FILE_SIZE_LIMIT = 50 * 1024 * 1024; 
    if (selectedFile.size > FILE_SIZE_LIMIT) {
        alert("File is too large. Please upload files smaller than 50MB.");
        return;
    }

    setIsUploading(true);
    setUploadProgress(10); // Start progress

    try {
        const fileExt = selectedFile.name.split('.').pop();
        const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const path = `${currentUser.id}/documents/${Date.now()}/${uuid}.${fileExt}`;
        
        const { error } = await supabase.storage.from('app-files').upload(path, selectedFile);
        if (error) throw error;

        setUploadProgress(50); // Upload done

        const { data } = await supabase.storage.from('app-files').createSignedUrl(path, 315360000); // 10 years
        if (!data?.signedUrl) throw new Error("Failed to sign URL");

        setUploadProgress(100);

        // Determine friendly type
        let docType = 'FILE';
        if (selectedFile.type.startsWith('image/')) docType = 'IMAGE';
        else if (selectedFile.type === 'application/pdf') docType = 'PDF';
        else if (selectedFile.type.startsWith('video/')) docType = 'VIDEO';
        else docType = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';

        const newDoc: ClientDocument = {
            id: Date.now().toString(),
            name: selectedFile.name,
            type: docType,
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: "Submitted",
            description: description || "Accounting document submission",
            fileUrl: data.signedUrl
        };
        
        onUpload(newDoc);
        setSelectedFile(null);
        setDescription('');
        alert("Document uploaded successfully.");

    } catch (err: any) {
        console.error(err);
        alert(`Upload failed: ${err.message}`);
    } finally {
        setIsUploading(false);
        setUploadProgress(0);
    }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-500">
      {/* Premium Header */}
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 h-20 flex items-center px-6 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-[1rem] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-600/30">
                    O
                </div>
                <div>
                    <h2 className="font-black tracking-tighter text-xl block leading-tight">Client Portal</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Digital Accounting Service</p>
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end">
                    <p className="text-sm font-black">{currentUser?.user_metadata?.full_name || currentUser?.email || 'Valued Client'}</p>
                    <p className="text-[10px] text-green-500 font-black uppercase">Standard Member</p>
                </div>
                <button onClick={onLogout} className="p-3 text-slate-400 hover:text-red-500 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <LogOut size={22} />
                </button>
            </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Quick Stats & Upload */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
                <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-blue-600">
                    <Upload size={22} /> {config.uploadCardTitle || "Secure Upload"}
                </h3>
                <form onSubmit={handleFileUpload} className="space-y-6">
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center hover:border-blue-500 transition-all relative overflow-hidden group bg-slate-50/50 dark:bg-slate-800/50">
                        {!selectedFile ? (
                            <>
                                <File size={40} className="mx-auto mb-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 whitespace-pre-wrap">{config.uploadCardHelper || "Drop Business Docs"}</p>
                                <label className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:scale-105 transition-all inline-block">Browse</label>
                                <input type="file" accept="image/*,application/pdf,video/*,.doc,.docx,.xls,.xlsx" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                {selectedFile.type.startsWith('video/') ? (
                                    <Film size={48} className="text-blue-600 mb-3" />
                                ) : (
                                    <FileText size={48} className="text-blue-600 mb-3" />
                                )}
                                <p className="text-sm font-bold truncate max-w-full mb-1">{selectedFile.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{(selectedFile.size / (1024*1024)).toFixed(2)} MB</p>
                                <button type="button" onClick={() => setSelectedFile(null)} className="mt-4 p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                    <input 
                        type="text" 
                        placeholder="Purpose (e.g., Monthly VAT)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none border border-transparent focus:border-blue-500/30 transition-all"
                    />
                    {isUploading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                <span>Securing Data</span>
                                <span>{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-blue-600 shadow-[0_0_10px_#3b82f6]" />
                            </div>
                        </div>
                    )}
                    <button type="submit" disabled={!selectedFile || isUploading} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 disabled:opacity-50 active:scale-[0.98] transition-all">
                        {isUploading ? 'Securing...' : 'Send to Asik'}
                    </button>
                </form>
            </div>
            
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                <ShieldCheck className="absolute -right-10 -bottom-10 w-48 h-48 text-white/5 group-hover:text-white/10 transition-all duration-700" />
                <h3 className="font-black text-xl mb-4 relative z-10 tracking-tighter">Portal Security</h3>
                <p className="text-sm text-slate-400 relative z-10 font-medium leading-relaxed mb-6">
                    All document uploads are encrypted using military-grade standards and stored in compliance with local financial regulations.
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400">
                    <CheckCircle2 size={14} /> System Encrypted
                </div>
            </div>
        </div>

        {/* Right Column: Archives */}
        <div className="lg:col-span-8 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-10">
                <div>
                    <h3 className="text-4xl font-black tracking-tighter mb-2">Data Archives.</h3>
                    <p className="text-slate-500 font-medium italic">Tracking all financial submissions</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400'}`}>
                        <List size={20} />
                    </button>
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-blue-600' : 'text-slate-400'}`}>
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-5 top-4 text-slate-400" size={18} />
                    <input type="text" placeholder="Search archive..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none" />
                </div>
                
                <div className="relative w-full md:w-56">
                    <Filter className="absolute left-4 top-4 text-slate-400 pointer-events-none" size={18} />
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full appearance-none pl-12 pr-10 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-200"
                    >
                        <option value="All">All Status</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Solved">Solved</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                </div>
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="popLayout">
                    {filteredDocs.length > 0 ? (
                        <div className={viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 gap-6"}>
                            {filteredDocs.map(doc => (
                                <DocCard key={doc.id} doc={doc} viewMode={viewMode} onDelete={onDelete} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                            <File size={48} className="text-slate-200 mb-6" />
                            <h4 className="text-xl font-black mb-2">No Records Found</h4>
                            <p className="text-slate-400 text-sm max-w-xs font-medium">Any documents you submit for review will appear here in your business archive.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
      </main>

      {/* Modern Floating Chat */}
      <div className="fixed bottom-10 right-10 z-40">
        <AnimatePresence>
            {isChatOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="mb-6 w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                        <h3 className="font-black flex items-center gap-3 uppercase tracking-widest text-xs">
                            <MessageSquare size={18} className="text-blue-500" /> Account Support
                        </h3>
                        <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
                        {sortedMessages.length > 0 ? sortedMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${
                                    msg.sender === 'client' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                }`}>
                                    {msg.text}
                                    <p className="text-[9px] mt-2 opacity-60 font-black uppercase">{formatMessageTime(msg.timestamp)}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">Start a conversation with Asik.</div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); if(chatInput.trim()){ onSendMessage(chatInput); setChatInput(''); }}} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onFocus={onMarkRead} placeholder="Message the partner..." className="flex-1 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm outline-none" />
                        <button type="submit" disabled={!chatInput.trim()} className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20">
                            <Send size={20} />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
        <motion.button onClick={() => { setIsChatOpen(!isChatOpen); if(!isChatOpen) onMarkRead(); }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-[0_20px_40px_rgba(37,99,235,0.4)] flex items-center justify-center relative">
             {isChatOpen ? <X size={32} /> : <MessageSquare size={32} />}
             {!isChatOpen && messages.filter(m => m.sender === 'admin' && !m.read).length > 0 && (
                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 animate-bounce">
                     {messages.filter(m => m.sender === 'admin' && !m.read).length}
                 </span>
             )}
        </motion.button>
      </div>
    </div>
  );
};

const DocCard: React.FC<{ doc: ClientDocument, viewMode: string, onDelete: (id: string) => void }> = ({ doc, viewMode, onDelete }) => {
    // Determine if the document is a video based on type
    const isVideo = doc.type === 'VIDEO' || doc.type.includes('MP4') || doc.type.includes('MOV') || doc.type.includes('WEBM');
    const isImage = doc.type === 'IMAGE' || doc.type.includes('JPG') || doc.type.includes('PNG');

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group ${viewMode === 'list' ? 'flex flex-col sm:flex-row sm:items-center gap-6' : 'flex flex-col h-full'}`}>
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${doc.status === 'Solved' ? 'bg-green-50 dark:bg-green-900/10 text-green-600' : 'bg-blue-50 dark:bg-blue-900/10 text-blue-600'}`}>
                    {isVideo ? <Film size={28} /> : (isImage ? <ImageIcon size={28} /> : <FileText size={28} />)}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors tracking-tight">{doc.name}</h4>
                    <div className="flex items-center gap-4 mt-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${doc.status === 'Solved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {doc.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{doc.date}</span>
                    </div>
                </div>
            </div>
            
            {/* Show solution if solved */}
            {doc.status === 'Solved' && (
                <div className={`mt-4 sm:mt-0 ${viewMode === 'list' ? 'sm:ml-auto sm:mr-6 flex-1' : 'w-full'} bg-green-50/50 dark:bg-green-900/10 p-3 rounded-xl border border-green-100 dark:border-green-900/20`}>
                     <p className="text-xs text-green-700 dark:text-green-400 font-medium mb-1 flex items-center gap-1"><CheckCircle2 size={12}/> Admin Resolution:</p>
                     <p className="text-sm text-slate-600 dark:text-slate-300 italic">{doc.solutionNote || "No notes provided."}</p>
                     {doc.solvedFile && (
                         <a href={doc.solvedFile} download className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                             <Paperclip size={12} /> Download Solution File
                         </a>
                     )}
                </div>
            )}

            <div className={`flex items-center gap-2 ${viewMode === 'list' && doc.status !== 'Solved' ? 'ml-auto' : 'mt-4 sm:mt-0'}`}>
                {doc.fileUrl && doc.fileUrl !== '#' && (
                    <a 
                        href={doc.fileUrl} 
                        download={doc.name}
                        className="p-3 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all"
                        title="Download"
                    >
                        <Download size={20} />
                    </a>
                )}
                {doc.status !== 'Solved' && (
                    <button 
                        onClick={() => onDelete(doc.id)}
                        className="p-3 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-all"
                        title="Delete"
                    >
                        <Trash2 size={20}/>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ClientPanel;