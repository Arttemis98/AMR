import React, { useState } from 'react';
import { X, Lock, Mail, ArrowRight, Fingerprint, AlertCircle, User, Building, ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { savePendingRegistrationProfile } from '../services/irisFirestore';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

function mapFirebaseAuthError(err: unknown): string {
  const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in or resetting your password.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled yet in Firebase Console (Authentication > Sign-in method). Please enable it or use Google Sign-In.';
    default:
      return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  }
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

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onLogin();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, regEmail.trim(), regPassword);
      await updateProfile(credential.user, { displayName: name.trim() });
      savePendingRegistrationProfile(credential.user.uid, {
        name: name.trim(),
        institute: institute.trim(),
        email: regEmail.trim(),
      });
      await sendEmailVerification(credential.user).catch(() => {
        // Non-fatal if verification email rate-limited
      });
      onLogin();
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccessMsg('');
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Enter your email address above first, then click Forgot password.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccessMsg(`Password reset link sent to ${targetEmail}. Check your inbox or spam folder.`);
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative max-h-[95vh] overflow-y-auto">
        <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
            <X size={20} />
        </button>

        <div className="p-8">
            <div className="text-center mb-6">
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
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-700 text-sm animate-fade-in">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"/>
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"/>
              </svg>
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">or with email</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

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
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isLoading}
                          className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                        >
                          Forgot password?
                        </button>
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
                            Don't have an account? <button type="button" onClick={() => { setView('REGISTER'); setError(''); setSuccessMsg(''); }} className="text-blue-600 font-bold hover:underline">Register Now</button>
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
                                maxLength={120}
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
                                maxLength={200}
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
                                maxLength={160}
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
                                minLength={6}
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                placeholder="Min. 6 characters"
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
                    <br/>Unauthorized access is a punishable offense.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;