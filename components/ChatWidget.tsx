
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, ResumeData } from '../types';

import { sendMessageToGemini } from '../services/geminiService';

interface ChatWidgetProps {
    data: ResumeData;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi! I'm ${data.name.split(' ')[0]}'s AI assistant. Ask me anything about his skills, education, or certifications!` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Lock body scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Reset chat greeting if name changes
  useEffect(() => {
     if (messages.length === 1 && messages[0].role === 'model') {
         setMessages([{ role: 'model', text: `Hi! I'm ${data.name.split(' ')[0]}'s AI assistant. Ask me anything about his skills, education, or certifications!` }]);
     }
  }, [data.name]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    // Optimistically update UI
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await sendMessageToGemini(messages, currentInput, data);
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
        console.error("Error getting response:", error);
        setMessages(prev => [...prev, { 
            role: 'model', 
            text: "I'm having trouble connecting right now. Please try again later." 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="pointer-events-auto fixed inset-0 sm:inset-auto sm:relative w-full h-[100dvh] sm:w-[400px] sm:h-[500px] bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden origin-bottom-right z-50"
                >
                    {/* Header */}
                    <div className="p-4 bg-slate-900 text-white flex justify-between items-center shadow-md shrink-0 safe-top">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-yellow-400" />
                            <h3 className="font-semibold">Chat with my AI</h3>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-slate-700 rounded-full transition-colors active:scale-90"
                        >
                            {window.innerWidth < 640 ? <X size={22} /> : <Minimize2 size={20} />}
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-2">
                                     <Loader2 size={16} className="animate-spin text-blue-500" />
                                     <span className="text-xs text-slate-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0 safe-bottom">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about Asik..."
                            className="flex-1 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-800 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 shadow-lg shadow-blue-600/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.button
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-colors z-50"
        >
            {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
        </motion.button>
      </div>
  );
};

export default ChatWidget;
