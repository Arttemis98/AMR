import React from 'react';
import { AMRReport, UserProfile } from '../types';
import { FileText, MapPin, Calendar, Activity, ChevronRight, Dna } from 'lucide-react';

interface MyReportsProps {
  user: UserProfile;
  onSelectReport: (report: AMRReport) => void;
}

const MY_MOCK_REPORTS: AMRReport[] = [
  { id: 'R-101', location: { state: 'Gujarat', city: 'Vadodara', siteName: 'Muni. WWTP A' }, date: '2024-05-12', source: 'WWTP', dataType: 'RNA_SEQ', organism: 'P. aeruginosa', resistanceFlag: 'HIGH', summary: 'Chlorine-induced multidrug resistance', submittedBy: 'Kunal Joshi' },
  { id: 'R-103', location: { state: 'Maharashtra', city: 'Mumbai', siteName: 'Mithi River' }, date: '2024-05-08', source: 'RIVER', dataType: 'PCR', organism: 'E. coli', resistanceFlag: 'MEDIUM', summary: 'blaNDM-1 gene detected', submittedBy: 'Kunal Joshi' },
];

const MyReports: React.FC<MyReportsProps> = ({ user, onSelectReport }) => {
  return (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-2">My Submissions</h3>
          <p className="text-slate-500 text-sm">
             Tracking history for <strong>{user.name}</strong>. You have submitted <strong>{MY_MOCK_REPORTS.length}</strong> reports to the national grid.
          </p>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
             <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report History</div>
             <button className="text-xs text-blue-600 font-medium hover:underline">Download CSV</button>
          </div>
          <div className="divide-y divide-slate-100">
             {MY_MOCK_REPORTS.length > 0 ? (
                MY_MOCK_REPORTS.map((report) => (
                   <div 
                      key={report.id} 
                      onClick={() => onSelectReport(report)}
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                   >
                      <div className="flex items-center justify-between">
                         <div className="flex items-start gap-4">
                            <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center ${report.resistanceFlag === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-yellow-100 text-yellow-600'}`}>
                               <Activity size={20} />
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                  {report.organism} <span className="text-xs font-normal text-slate-400">({report.id})</span>
                               </h4>
                               <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                  <span className="flex items-center gap-1"><MapPin size={10} /> {report.location.city}</span>
                                  <span className="flex items-center gap-1"><Calendar size={10} /> {report.date}</span>
                                  <span className="flex items-center gap-1"><Dna size={10} /> {report.dataType}</span>
                               </div>
                               <p className="text-xs text-slate-600 mt-2 italic">"{report.summary}"</p>
                            </div>
                         </div>
                         <div className="text-right">
                             <div className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-block ${report.resistanceFlag === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-yellow-50 text-yellow-700 border border-yellow-100'}`}>
                                {report.resistanceFlag} RISK
                             </div>
                             <div className="flex items-center text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                View Analysis <ChevronRight size={14} />
                             </div>
                         </div>
                      </div>
                   </div>
                ))
             ) : (
                <div className="p-8 text-center text-slate-500">
                   No reports submitted yet. Go to "Submit Data" to get started.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default MyReports;