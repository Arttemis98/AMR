import React, { useState } from 'react';
import { X, User, Briefcase, MapPin, Mail, Phone, Link as LinkIcon, Save, Camera } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-start text-white">
          <div className="flex items-center gap-4">
             <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold border-4 border-white/30 shadow-lg">
                   {formData.avatarInitials}
                </div>
                {isEditing && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={20} className="text-white"/>
                    </div>
                )}
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
                  <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                     Edit Details
                  </button>
               ) : (
                  <button onClick={handleSave} className="flex items-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-sm">
                     <Save size={16}/> Save Changes
                  </button>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Full Name */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <User size={12}/> Full Name
                  </label>
                  {isEditing ? (
                     <input name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
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
                     <input name="designation" value={formData.designation} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
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
                     <input name="institute" value={formData.institute} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
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
                     <input name="address" value={formData.address} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="text-slate-600">{formData.address}</p>
                  )}
               </div>

               {/* Email */}
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <Mail size={12}/> Email ID
                  </label>
                  {isEditing ? (
                     <input name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
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
                     <input name="mobile" value={formData.mobile} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <p className="text-slate-700 font-mono text-sm">{formData.mobile}</p>
                  )}
               </div>

               {/* ORCID */}
               <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                     <LinkIcon size={12}/> ORCID iD
                  </label>
                  {isEditing ? (
                     <input name="orcid" value={formData.orcid} onChange={handleChange} className="w-full border border-slate-300 rounded p-2 text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                  ) : (
                     <a href={`https://orcid.org/${formData.orcid}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono text-sm flex items-center gap-1">
                        {formData.orcid}
                     </a>
                  )}
               </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <p className="text-xs text-slate-400 italic">User verification status: <span className="text-green-600 font-bold not-italic">Verified</span></p>
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