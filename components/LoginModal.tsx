import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, Fingerprint, AlertCircle, User, Building, ArrowLeft } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [view, setView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [name, setName] = useState('');
  const [institute, setInstitute] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate API call with credential check
    setTimeout(() => {
      setIsLoading(false);
      
      // Hardcoded credentials as requested for demo
      if (email.toLowerCase() === 'kunaljoshi98@gmail.com' && password === 'admin') {
        onLogin();
      } else {
        setError('Invalid email or password. Access denied.');
      }
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      setTimeout(() => {
          setIsLoading(false);
          setSuccessMsg('Registration successful! Please log in with your credentials.');
          setView('LOGIN');
          // Pre-fill login for convenience
          setEmail(regEmail);
      }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
            <X size={20} />
        </button>

        <div className="p-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 border border-blue-100">
                    <Lock size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {view === 'LOGIN' ? 'Researcher Access' : 'Join the Network'}
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                    {view === 'LOGIN' ? 'Log in to access the National Surveillance Grid' : 'Register to contribute surveillance data'}
                </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-pulse">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-2 text-green-700 text-sm animate-fade-in">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{successMsg}</span>
                </div>
            )}

            {view === 'LOGIN' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                placeholder="researcher@institute.edu.in"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                        <div className="relative">
                            <Fingerprint className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="text-xs text-blue-600 hover:underline">Forgot password?</button>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>Sign In <ArrowRight size={18} /></>
                        )}
                    </button>

                    <div className="mt-6 text-center border-t border-slate-100 pt-4">
                        <p className="text-sm text-slate-500">
                            Don't have an account? <button type="button" onClick={() => { setView('REGISTER'); setError(''); }} className="text-blue-600 font-bold hover:underline">Register Now</button>
                        </p>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Dr. Jane Doe"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Institute / Organization</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                required
                                value={institute}
                                onChange={(e) => setInstitute(e.target.value)}
                                placeholder="e.g. AIIMS Delhi"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="email" 
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                placeholder="researcher@institute.edu.in"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Create Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                required
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>Create Account</>
                        )}
                    </button>

                    <div className="mt-4 text-center">
                        <button type="button" onClick={() => { setView('LOGIN'); setSuccessMsg(''); setError(''); }} className="text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto">
                            <ArrowLeft size={14} /> Back to Login
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-6 text-center">
                <p className="text-[10px] text-slate-400 leading-tight">
                    By accessing IRIS, you agree to the National Data Sharing Policy.
                    <br/>Unauthroized access is a punishable offense.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;