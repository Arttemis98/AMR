import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessagesSquare,
  Menu,
  X,
  Upload,
  PenTool,
  FolderOpen,
  LogIn,
  LogOut,
  MailCheck,
  RefreshCw,
} from 'lucide-react';
import { onAuthStateChanged, sendEmailVerification, signOut, User } from 'firebase/auth';
import { AppView, AMRReport, ThemePreference, UserProfile } from './types';
import { auth } from './services/firebase';
import {
  applyThemePreference,
  buildFallbackProfile,
  fetchOrCreateUserProfile,
  getStoredThemePreference,
  saveUserProfile,
  saveUserThemePreference,
} from './services/irisFirestore';
import NationalOverview from './components/NationalOverview';
import SubmissionPortal from './components/SubmissionPortal';
import AIConsultant from './components/AIConsultant';
import UserProfileModal from './components/UserProfileModal';
import MyReports from './components/MyReports';
import LoginModal from './components/LoginModal';

const AnalysisSuite = lazy(() => import('./components/AnalysisSuite'));
const OpenToolkit = lazy(() => import('./components/OpenToolkit'));

// Custom IRIS Logo: Eye in between Globe lines
const IrisLogo = ({ size = 28, className = "" }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2.5 12c0-3.5 4-7 9.5-7s9.5 3.5 9.5 7-4 7-9.5 7-9.5-3.5-9.5-7Z" fill="var(--iris-surface)" stroke="currentColor" strokeWidth="2" />
    <path d="M2.5 12c0-3.5 4-7 9.5-7s9.5 3.5 9.5 7-4 7-9.5 7-9.5-3.5-9.5-7Z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-blue-700" />
  </svg>
);

const EMPTY_PROFILE: UserProfile = {
  name: 'Researcher',
  designation: 'Researcher',
  institute: 'IRIS Network Member',
  address: '',
  email: '',
  mobile: '',
  orcid: '',
  avatarInitials: 'IR',
};

const App: React.FC = () => {
  // Auth State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [verificationNotice, setVerificationNotice] = useState('');
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AMRReport | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredThemePreference());

  const isLoggedIn = Boolean(firebaseUser);

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  const loadUserProfile = async (user: User) => {
    setUserProfile(buildFallbackProfile(user));
    try {
      const profile = await fetchOrCreateUserProfile(user);
      setUserProfile(profile);
      if (profile.themePreference === 'dark' || profile.themePreference === 'light') {
        setTheme(profile.themePreference);
      }
    } catch (err) {
      console.error('Could not sync Firestore profile:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setEmailVerified(Boolean(user?.emailVerified));
      setAuthReady(true);
      if (user) {
        setShowLoginModal(false);
        loadUserProfile(user);
      } else {
        setUserProfile(EMPTY_PROFILE);
        setSelectedReport(null);
        setCurrentView(AppView.DASHBOARD);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleReportSelect = (report: AMRReport) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setSelectedReport(report);
    setCurrentView(AppView.ANALYSIS_SUITE);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentView(AppView.DASHBOARD);
    setIsMobileMenuOpen(false);
  };

  const handleRefreshVerification = async () => {
    if (!auth.currentUser) return;
    setIsCheckingVerification(true);
    setVerificationNotice('');
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      const current = auth.currentUser;
      setFirebaseUser(current);
      setEmailVerified(Boolean(current?.emailVerified));
      if (current?.emailVerified) {
        await loadUserProfile(current);
        setVerificationNotice('Email verified! Full repository access is now active.');
      } else {
        setVerificationNotice('Still awaiting verification. Please click the link sent to your email.');
      }
    } catch {
      setVerificationNotice('Could not refresh status. Please try again.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setVerificationNotice('');
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationNotice(`Verification email resent to ${auth.currentUser.email}. Check your inbox or spam folder.`);
    } catch {
      setVerificationNotice('Verification email was sent recently. Please wait a minute before requesting another.');
    }
  };

  const handleSaveProfile = async (updatedUser: UserProfile) => {
    if (!firebaseUser) return;
    const saved = await saveUserProfile(firebaseUser.uid, { ...updatedUser, themePreference: theme });
    setUserProfile(saved);
  };

  const handleToggleTheme = async (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    applyThemePreference(nextTheme);
    setUserProfile((prev) => ({ ...prev, themePreference: nextTheme }));
    if (firebaseUser) {
      try {
        await saveUserThemePreference(firebaseUser.uid, nextTheme);
      } catch (err) {
        console.error('Failed to sync theme preference:', err);
      }
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setSelectedReport(null);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors ${
        currentView === view
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Connecting to IRIS Surveillance Grid...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => setShowLoginModal(false)}
      />

      {/* HEADER / NAVIGATION */}
      {!isLoggedIn ? (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3 text-blue-700">
            <IrisLogo size={36} />
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">IRIS</h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">Indian Resistance Interpretation Surveillance</p>
            </div>
          </div>
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
          >
            <LogIn size={18} /> Researcher Login
          </button>
        </header>
      ) : (
        <div className="lg:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-2 text-blue-700">
            <IrisLogo size={24} />
            <h1 className="text-lg font-bold">IRIS</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className="flex flex-1">
        {isLoggedIn && (
          <>
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20 justify-between">
              <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="p-6 border-b border-slate-100 shrink-0">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <IrisLogo size={32} />
                    <h1 className="text-2xl font-bold tracking-tight">IRIS</h1>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium leading-tight">
                    Indian Resistance Interpretation Surveillance
                  </p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="National Overview" />
                  <NavItem view={AppView.SUBMISSION} icon={Upload} label="Submit Data" />
                  <NavItem view={AppView.MY_REPORTS} icon={FolderOpen} label="My Reports" />
                  <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tools
                  </div>
                  <NavItem view={AppView.OPEN_TOOLS} icon={PenTool} label="Research Tools" />
                  <NavItem view={AppView.AI_CONSULTANT} icon={MessagesSquare} label="AI Consultant" />
                </nav>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <div
                  className="flex items-center space-x-3 mb-4 p-2 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  onClick={() => setIsUserModalOpen(true)}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm shrink-0">
                    {userProfile.avatarInitials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
                    <p className="text-xs text-slate-500 truncate">{userProfile.designation}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-rose-600 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors text-sm font-medium shadow-sm"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>

            {isMobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 bg-white z-20 pt-16 px-4 pb-4 flex flex-col h-full">
                <div className="space-y-2 flex-1">
                  <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="National Overview" />
                  <NavItem view={AppView.SUBMISSION} icon={Upload} label="Submit Data" />
                  <NavItem view={AppView.MY_REPORTS} icon={FolderOpen} label="My Reports" />
                  <NavItem view={AppView.OPEN_TOOLS} icon={PenTool} label="Research Tools" />
                  <NavItem view={AppView.AI_CONSULTANT} icon={MessagesSquare} label="AI Consultant" />
                </div>

                <div className="border-t border-slate-100 mt-4 pt-4">
                  <div className="flex items-center gap-3 mb-4" onClick={() => setIsUserModalOpen(true)}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                      {userProfile.avatarInitials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{userProfile.name}</p>
                      <p className="text-xs text-slate-500">{userProfile.designation}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-rose-50 text-rose-700 rounded-lg font-bold"
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* MAIN CONTENT AREA */}
        <main
          className={`flex-1 p-4 lg:p-8 transition-all duration-300 ${
            isLoggedIn ? 'lg:ml-64 pt-20 lg:pt-8' : 'w-full max-w-7xl mx-auto'
          }`}
        >
          {/* Email Verification Banner for newly registered email/password accounts */}
          {isLoggedIn && !emailVerified && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-amber-900">
              <div className="flex items-start gap-3">
                <MailCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold">Verify your email to unlock submissions &amp; profile sync</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    We sent a verification link to <strong>{firebaseUser?.email}</strong>. Click the link, then refresh status.
                  </p>
                  {verificationNotice && <p className="text-xs font-semibold text-amber-900 mt-1">{verificationNotice}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResendVerification}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  Resend Email
                </button>
                <button
                  onClick={handleRefreshVerification}
                  disabled={isCheckingVerification}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1 disabled:opacity-60"
                >
                  <RefreshCw size={12} className={isCheckingVerification ? 'animate-spin' : ''} />
                  I&apos;ve Verified
                </button>
              </div>
            </div>
          )}

          {/* VIEW TITLE HEADER */}
          <header className="mb-8">
            {!isLoggedIn ? (
              <div className="bg-indigo-900 text-white p-8 rounded-2xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold mb-2">Public Health Surveillance Dashboard</h2>
                  <p className="text-indigo-200 max-w-2xl">
                    Tracking approved antimicrobial resistance reports across clinical and environmental sectors in India alongside reference baseline surveillance markers.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900">
                  {currentView === AppView.DASHBOARD && 'National Surveillance Dashboard'}
                  {currentView === AppView.SUBMISSION && 'Data Submission Portal'}
                  {currentView === AppView.MY_REPORTS && 'My Research Reports'}
                  {currentView === AppView.ANALYSIS_SUITE && 'Deep Analysis Suite'}
                  {currentView === AppView.OPEN_TOOLS && 'Research Analysis Workbench'}
                  {currentView === AppView.AI_CONSULTANT && 'AI Policy & Research Advisor'}
                </h2>
                <p className="text-slate-500 mt-1">
                  {currentView === AppView.DASHBOARD && 'Tracking approved antimicrobial resistance reports across clinical and environmental sectors in India.'}
                  {currentView === AppView.SUBMISSION && 'Upload AST, PCR, or NGS data from your facility to the central repository.'}
                  {currentView === AppView.MY_REPORTS && 'View and manage your submitted data history and analysis results.'}
                  {currentView === AppView.ANALYSIS_SUITE && 'Detailed bio-informatics breakdown of specific surveillance reports.'}
                  {currentView === AppView.OPEN_TOOLS && 'Analyze your own data privately with professional QA/QC, AST, and Phylogeny tools.'}
                  {currentView === AppView.AI_CONSULTANT && 'Consult the Gemini-4 model for data interpretation and public health recommendations.'}
                </p>
              </>
            )}
          </header>

          {/* VIEWS */}
          {(currentView === AppView.DASHBOARD || !isLoggedIn) && (
            <NationalOverview onSelectReport={handleReportSelect} />
          )}

          {isLoggedIn && firebaseUser && (
            <>
              {currentView === AppView.SUBMISSION && (
                <SubmissionPortal
                  uid={firebaseUser.uid}
                  userProfile={userProfile}
                  emailVerified={emailVerified}
                  onComplete={() => setCurrentView(AppView.MY_REPORTS)}
                  onViewReport={(report) => {
                    setSelectedReport(report);
                    setCurrentView(AppView.ANALYSIS_SUITE);
                  }}
                />
              )}

              {currentView === AppView.MY_REPORTS && (
                <MyReports user={userProfile} uid={firebaseUser.uid} onSelectReport={handleReportSelect} />
              )}

              {currentView === AppView.ANALYSIS_SUITE && (
                <Suspense
                  fallback={
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                      Loading Analysis Suite...
                    </div>
                  }
                >
                  <AnalysisSuite
                    report={selectedReport}
                    onBack={() => setCurrentView(AppView.DASHBOARD)}
                  />
                </Suspense>
              )}

              {currentView === AppView.OPEN_TOOLS && (
                <Suspense
                  fallback={
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
                      Loading Research Workbench...
                    </div>
                  }
                >
                  <OpenToolkit />
                </Suspense>
              )}

              {currentView === AppView.AI_CONSULTANT && (
                <div className="animate-fade-in max-w-4xl mx-auto">
                  <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-sm flex items-start space-x-3">
                    <MessagesSquare size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <strong>Advisor Mode Active:</strong> Ask general questions about antimicrobial resistance interpretation, molecular assays, or stewardship strategies — for example,
                      &quot;How should we validate suspected colistin resistance?&quot; or &quot;Suggest an intervention for carbapenem-resistant E. coli in hospital wastewater.&quot;
                    </div>
                  </div>
                  <AIConsultant />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={userProfile}
        emailVerified={emailVerified}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default App;