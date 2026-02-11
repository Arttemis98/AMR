import React, { useState } from 'react';
import { LayoutDashboard, LineChart, MessagesSquare, FileText, Menu, X, Dna, Upload, Globe, PenTool, FolderOpen } from 'lucide-react';
import { AppView, AMRReport, UserProfile } from './types';
import NationalOverview from './components/NationalOverview';
import SubmissionPortal from './components/SubmissionPortal';
import AnalysisSuite from './components/AnalysisSuite';
import AIConsultant from './components/AIConsultant';
import OpenToolkit from './components/OpenToolkit';
import UserProfileModal from './components/UserProfileModal';
import MyReports from './components/MyReports';

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
    {/* Outer Globe Circle */}
    <circle cx="12" cy="12" r="10" />
    {/* Central Meridian (Top and Bottom only) */}
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    {/* Eye Shape replacing the Equator area */}
    <path d="M2.5 12c0-3.5 4-7 9.5-7s9.5 3.5 9.5 7-4 7-9.5 7-9.5-3.5-9.5-7Z" fill="white" stroke="currentColor" strokeWidth="2"/>
    <path d="M2.5 12c0-3.5 4-7 9.5-7s9.5 3.5 9.5 7-4 7-9.5 7-9.5-3.5-9.5-7Z" fill="none" stroke="currentColor" strokeWidth="2"/>
    {/* Pupil */}
    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-blue-700" />
  </svg>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AMRReport | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // User State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Kunal Joshi',
    designation: 'Research Scholar',
    institute: 'ISTAR College, The CVM University, Vallabh Vidyanagar, Anand',
    address: 'Vadodara',
    email: 'kunaljoshi98@gmail.com',
    mobile: '+91 98765 43210',
    orcid: '0009-0008-6551-5757',
    avatarInitials: 'KJ'
  });

  const handleReportSelect = (report: AMRReport) => {
      setSelectedReport(report);
      setCurrentView(AppView.ANALYSIS_SUITE);
  };

  const handleSubmissionComplete = () => {
      // In a real app, this would append data to the list
      setCurrentView(AppView.DASHBOARD);
      // Optional: Show a toast/notification
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setSelectedReport(null); // Reset report when changing main views
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

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="p-6 border-b border-slate-100">
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
        
        {/* User Section - Interactive */}
        <div className="p-6 border-t border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setIsUserModalOpen(true)}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm">
              {userProfile.avatarInitials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{userProfile.name}</p>
              <p className="text-xs text-slate-500 truncate">{userProfile.designation}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-slate-200 z-30 px-4 py-3 flex justify-between items-center shadow-sm">
         <div className="flex items-center space-x-2 text-blue-700">
            <IrisLogo size={24} />
            <h1 className="text-lg font-bold">IRIS</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
            {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-20 pt-16 px-4 pb-4 space-y-2">
           <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="National Overview" />
           <NavItem view={AppView.SUBMISSION} icon={Upload} label="Submit Data" />
           <NavItem view={AppView.MY_REPORTS} icon={FolderOpen} label="My Reports" />
           <NavItem view={AppView.OPEN_TOOLS} icon={PenTool} label="Research Tools" />
           <NavItem view={AppView.AI_CONSULTANT} icon={MessagesSquare} label="AI Consultant" />
           <div className="border-t border-slate-100 mt-4 pt-4 flex items-center gap-3" onClick={() => setIsUserModalOpen(true)}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                 {userProfile.avatarInitials}
              </div>
              <div>
                 <p className="font-bold text-slate-800">{userProfile.name}</p>
                 <p className="text-xs text-slate-500">{userProfile.designation}</p>
              </div>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 transition-all duration-300">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {currentView === AppView.DASHBOARD && 'National Surveillance Dashboard'}
            {currentView === AppView.SUBMISSION && 'Data Submission Portal'}
            {currentView === AppView.MY_REPORTS && 'My Research Reports'}
            {currentView === AppView.ANALYSIS_SUITE && 'Deep Analysis Suite'}
            {currentView === AppView.OPEN_TOOLS && 'Research Analysis Workbench'}
            {currentView === AppView.AI_CONSULTANT && 'AI Policy & Research Advisor'}
          </h2>
          <p className="text-slate-500 mt-1">
             {currentView === AppView.DASHBOARD && 'Real-time tracking of antimicrobial resistance across clinical and environmental sectors in India.'}
             {currentView === AppView.SUBMISSION && 'Upload AST, PCR, or NGS data from your facility to the central repository.'}
             {currentView === AppView.MY_REPORTS && 'View and manage your submitted data history and analysis results.'}
             {currentView === AppView.ANALYSIS_SUITE && 'Detailed bio-informatics breakdown of specific surveillance reports.'}
             {currentView === AppView.OPEN_TOOLS && 'Analyze your own data privately with professional QA/QC, AST, and Phylogeny tools.'}
             {currentView === AppView.AI_CONSULTANT && 'Consult the Gemini-3 model for data interpretation and public health recommendations.'}
          </p>
        </header>

        {currentView === AppView.DASHBOARD && (
          <NationalOverview onSelectReport={handleReportSelect} />
        )}

        {currentView === AppView.SUBMISSION && (
           <SubmissionPortal onComplete={handleSubmissionComplete} />
        )}

        {currentView === AppView.MY_REPORTS && (
           <MyReports user={userProfile} onSelectReport={handleReportSelect} />
        )}

        {currentView === AppView.ANALYSIS_SUITE && (
          <AnalysisSuite 
            report={selectedReport} 
            onBack={() => setCurrentView(AppView.DASHBOARD)} 
          />
        )}

        {currentView === AppView.OPEN_TOOLS && (
           <OpenToolkit />
        )}

        {currentView === AppView.AI_CONSULTANT && (
          <div className="animate-fade-in max-w-4xl mx-auto">
             <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-sm flex items-start space-x-3">
                <MessagesSquare size={20} className="shrink-0 mt-0.5" />
                <div>
                    <strong>Advisor Mode Active:</strong> The AI has access to the national aggregate data. You can ask questions like 
                    "What are the emerging resistance trends in Gujarat wastewater?" or "Suggest an intervention for carbapenem-resistant E. coli in Mumbai."
                </div>
             </div>
             <AIConsultant />
          </div>
        )}
      </main>

      {/* User Profile Modal */}
      <UserProfileModal 
         user={userProfile} 
         isOpen={isUserModalOpen} 
         onClose={() => setIsUserModalOpen(false)} 
         onSave={(updatedUser) => {
            setUserProfile(updatedUser);
            // In a real app, send to backend here
         }}
      />
    </div>
  );
};

export default App;