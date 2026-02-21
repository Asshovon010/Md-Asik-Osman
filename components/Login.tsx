import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowLeft, ShieldCheck, Briefcase, LogIn, AlertCircle, Eye, EyeOff, User, UserPlus, CheckCircle, HelpCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (role: 'admin' | 'client', user?: any) => void;
  onBack: () => void;
  initialRole?: 'admin' | 'client';
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack, initialRole = 'client' }) => {
  const [currentRole, setCurrentRole] = useState(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update local role if prop changes
  useEffect(() => {
    setCurrentRole(initialRole);
  }, [initialRole]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
        if (isSignUp) {
            // ADMINS cannot sign up via UI (Security)
            if (currentRole === 'admin') {
                throw new Error("Admin registration is disabled. Please contact system owner.");
            }

            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (signUpError) throw signUpError;

            if (data.session) {
                onLogin('client', data.user);
                return;
            }

            setIsSignUp(false);
            setPassword('');
            setSuccessMessage("Account created! Please check your email and verify your address.");
            
        } else {
            // Sign In
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (signInError) {
                if (signInError.message.includes('Email not confirmed')) {
                    throw new Error("Please verify your email address. Check your inbox.");
                }
                throw signInError;
            }

            if (data.session) {
                const user = data.user;
                // Determine if the logged-in user is actually the admin based on email
                const isAdmin = user.email === 'asikosman010@gmail.com' || user.user_metadata?.role === 'admin';
                
                if (currentRole === 'admin') {
                     if (isAdmin) {
                        onLogin('admin', user);
                     } else {
                        throw new Error("Access denied: You do not have administrator privileges.");
                     }
                } else {
                     onLogin('client', user);
                }
            }
        }
    } catch (err: any) {
        const msg = err.message?.toLowerCase() || '';

        if (msg.includes('rate limit') || msg.includes('too many requests') || err.status === 429) {
            setError("Security limit reached. Please wait 60s.");
        }
        else if (msg.includes('invalid login credentials')) {
            setError("Invalid email or password.");
        }
        else {
            setError(err.message || "Authentication failed. Please try again.");
        }
    } finally {
        setLoading(false);
    }
  };

  const toggleRole = () => {
    setCurrentRole(prev => prev === 'admin' ? 'client' : 'admin');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]"></div>
      
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <button onClick={onBack} className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white mb-8 transition-colors group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Site
        </button>

        <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl mb-4 shadow-2xl transition-colors duration-500 ${currentRole === 'admin' ? 'bg-slate-800 text-white border border-slate-700' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
                {currentRole === 'admin' ? <ShieldCheck size={32} /> : (isSignUp ? <UserPlus size={32} /> : <Briefcase size={32} />)}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter">
                {isSignUp ? 'Create Account' : (currentRole === 'admin' ? 'Admin Access' : 'Business Portal')}
            </h2>
            <p className="text-slate-500 mt-1 font-medium text-sm italic">
                {isSignUp ? 'Join for secure document handling' : (currentRole === 'admin' ? 'Login to Manage Site' : 'Secure financial management gateway')}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {/* Success Message Area */}
          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, height: 0 }} 
                animate={{ opacity: 1, scale: 1, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-xs font-bold flex items-center gap-3 mb-4 overflow-hidden"
              >
                  <CheckCircle size={18} className="shrink-0"/> 
                  <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isSignUp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-600" size={18} />
                    <input 
                        type="text" required={isSignUp} value={fullName} onChange={(e) => setFullName(e.target.value)} 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-2xl outline-none text-white transition-all font-medium" 
                        placeholder="John Doe" 
                    />
                </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
            <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-600" size={18} />
                <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-2xl outline-none text-white transition-all font-medium" 
                    placeholder={currentRole === 'admin' ? "asikosman010@gmail.com" : "name@company.com"} 
                />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
            <div className="relative">
                <Lock className="absolute left-4 top-4 text-slate-600" size={18} />
                <input 
                    type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} 
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800 border-2 border-transparent focus:border-blue-500/30 rounded-2xl outline-none text-white transition-all font-medium" 
                    placeholder="••••••••" 
                />
                <button 
                    type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-600 hover:text-blue-600 transition-colors"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>

          {/* Error Message Area */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, height: 0 }} 
                animate={{ opacity: 1, scale: 1, height: 'auto' }} 
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-3 overflow-hidden"
              >
                  <AlertCircle size={18} className="shrink-0"/> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" disabled={loading} 
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${currentRole === 'admin' ? 'bg-slate-700 hover:bg-slate-600 text-white shadow-slate-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isSignUp ? 'Create Account' : 'Sign In'} {isSignUp ? <UserPlus size={18}/> : <LogIn size={18} />}</>}
          </button>
        </form>

        {/* Role Toggle & Signup Links */}
        <div className="mt-8 space-y-4">
            {/* Role Switcher */}
            {!isSignUp && (
                <div className="text-center">
                    <button 
                        type="button"
                        onClick={toggleRole}
                        className="text-xs text-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {currentRole === 'admin' ? 'Go to Client Portal' : 'Are you an Administrator?'}
                        {currentRole === 'admin' ? <Briefcase size={12}/> : <ShieldCheck size={12}/>}
                    </button>
                </div>
            )}

            {currentRole !== 'admin' && (
                <div className="text-center">
                    <p className="text-slate-500 text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <button 
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccessMessage(''); }}
                            className="ml-2 text-blue-500 hover:text-blue-400 font-bold hover:underline transition-all"
                        >
                            {isSignUp ? "Sign In" : "Create Account"}
                        </button>
                    </p>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;