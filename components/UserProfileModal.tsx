import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, MapPin, Mail, Phone, Link as LinkIcon, Save, AlertCircle, Sun, Moon } from 'lucide-react';
import { ThemePreference, UserProfile } from '../types';

interface UserProfileModalProps {
  user: UserProfile;
  emailVerified: boolean;
  theme: ThemePreference;
  onToggleTheme: (nextTheme: ThemePreference) => void | Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => Promise<void>;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  emailVerified,
  theme,
  onToggleTheme,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    setFormData({ ...user, themePreference: theme });
    setSaveError('');
    if (!isOpen) setIsEditing(false);
  }, [user, theme, isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleThemeSwitch = () => {
    const nextTheme: ThemePreference = isDark ? 'light' : 'dark';
    setFormData((prev) => ({ ...prev, themePreference: nextTheme }));
    void onToggleTheme(nextTheme);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-start text-white">
          <div className="flex items-center gap-4">
             <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-lg shrink-0">
                {formData.avatarInitials}
             </div>
             <div>
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                <p className="text-blue-100">{formData.designation}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-slate-800">Researcher Profile</h3>
               {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={!emailVerified}
                    title={!emailVerified ? 'Verify your email first to edit and save your profile' : undefined}
                    className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                     Edit Details
                  </button>
               ) : (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-60"
                  >
                     <Save size={16}/> {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
               )}
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Full Name */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <User size={12}/> Full Name
                  </label>
                  {isEditing ? (
                     <input name="name" maxLength={120} value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="font-semibold text-slate-800 text-lg">{formData.name}</p>
                  )}
               </div>

               {/* Designation */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Briefcase size={12}/> Designation
                  </label>
                  {isEditing ? (
                     <input name="designation" maxLength={120} value={formData.designation} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="font-medium text-slate-700">{formData.designation}</p>
                  )}
               </div>

               {/* Institute */}
               <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <BuildingIcon /> Affiliation / Institute
                  </label>
                  {isEditing ? (
                     <input name="institute" maxLength={200} value={formData.institute} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="font-medium text-slate-700">{formData.institute}</p>
                  )}
               </div>

                {/* Address */}
               <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <MapPin size={12}/> Address
                  </label>
                  {isEditing ? (
                     <input name="address" maxLength={300} value={formData.address} onChange={handleChange} placeholder="City, State" className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="text-slate-600">{formData.address || 'Not provided'}</p>
                  )}
               </div>

               {/* Email */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Mail size={12}/> Email ID
                  </label>
                  {isEditing ? (
                     <input name="email" maxLength={160} value={formData.email} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="text-slate-700 font-mono text-sm">{formData.email}</p>
                  )}
               </div>

               {/* Mobile */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Phone size={12}/> Mobile Number
                  </label>
                  {isEditing ? (
                     <input name="mobile" maxLength={32} value={formData.mobile} onChange={handleChange} placeholder="+91 ..." className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="text-slate-700 font-mono text-sm">{formData.mobile || 'Not provided'}</p>
                  )}
               </div>

               {/* ORCID */}
               <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <LinkIcon size={12}/> ORCID iD
                  </label>
                  {isEditing ? (
                     <input name="orcid" maxLength={32} value={formData.orcid} onChange={handleChange} placeholder="0000-0000-0000-0000" className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : formData.orcid ? (
                     <a href={`https://orcid.org/${formData.orcid}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono text-sm flex items-center gap-1">
                        {formData.orcid}
                     </a>
                  ) : (
                     <p className="text-slate-400 text-sm">Not linked</p>
                  )}
               </div>
            </div>
            
            {/* Appearance / Theme Preference */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-100 text-amber-600'}`}>
                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">Dark Mode</span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {isDark ? 'Dark' : 'Light'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Switch between light and dark themes across IRIS.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isDark}
                  aria-label="Toggle dark mode"
                  onClick={handleThemeSwitch}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    isDark ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 flex items-center justify-center ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  >
                    {isDark ? (
                      <Moon size={12} className="text-blue-600" />
                    ) : (
                      <Sun size={12} className="text-amber-500" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <p className="text-xs text-slate-400 italic">
                  Email verification status:{' '}
                  <span className={`font-bold not-italic ${emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                    {emailVerified ? 'Verified' : 'Pending Verification'}
                  </span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

// Simple Building Icon for internal use
const BuildingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="22"></line>
    <line x1="15" y1="22" x2="15" y2="22"></line>
    <line x1="12" y1="22" x2="12" y2="22"></line>
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="20" y1="18" x2="4" y2="18"></line>
    <line x1="20" y1="14" x2="4" y2="14"></line>
    <line x1="20" y1="10" x2="4" y2="10"></line>
    <line x1="20" y1="6" x2="4" y2="6"></line>
  </svg>
);

export default UserProfileModal;