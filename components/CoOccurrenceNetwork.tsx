import React from 'react';
import { Share2 } from 'lucide-react';

const CoOccurrenceNetwork: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6 animate-fade-in">
       <div className="flex items-center gap-2 mb-4">
          <Share2 className="text-purple-600" size={20} />
          <h3 className="font-bold text-slate-800">Genetic Co-Occurrence Network</h3>
       </div>
       <div className="h-64 border border-slate-100 rounded-lg bg-slate-50 flex items-center justify-center relative overflow-hidden">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Links */}
            <line x1="100" y1="100" x2="200" y2="50" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="100" y1="100" x2="200" y2="150" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="200" y1="50" x2="300" y2="100" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="200" y1="150" x2="300" y2="100" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="200" y1="50" x2="200" y2="150" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
            
            {/* Nodes */}
            <circle cx="100" cy="100" r="15" fill="#3b82f6" />
            <text x="100" y="105" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">Sample</text>
            
            <circle cx="200" cy="50" r="12" fill="#ef4444" />
            <text x="200" y="54" textAnchor="middle" fill="white" fontSize="7">mexA</text>
            
            <circle cx="200" cy="150" r="12" fill="#ef4444" />
            <text x="200" y="154" textAnchor="middle" fill="white" fontSize="7">mexB</text>
            
            <circle cx="300" cy="100" r="10" fill="#a855f7" />
            <text x="300" y="104" textAnchor="middle" fill="white" fontSize="6">Plasmid</text>
          </svg>
          <div className="absolute bottom-2 right-2 text-[10px] text-slate-400">
             Nodes: Genes (Red), Plasmids (Purple)
          </div>
       </div>
    </div>
  );
};
export default CoOccurrenceNetwork;