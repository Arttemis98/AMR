import React from 'react';
import { MapPin, Activity, AlertTriangle, Droplets, Building2, ChevronRight, FileText } from 'lucide-react';
import { AMRReport } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const MOCK_REPORTS: AMRReport[] = [
  { id: 'R-101', location: { state: 'Gujarat', city: 'Vadodara', siteName: 'Muni. WWTP A' }, date: '2024-05-12', source: 'WWTP', dataType: 'RNA_SEQ', organism: 'P. aeruginosa', resistanceFlag: 'HIGH', summary: 'Chlorine-induced multidrug resistance' },
  { id: 'R-102', location: { state: 'Gujarat', city: 'Anand', siteName: 'Civil Hospital' }, date: '2024-05-10', source: 'CLINICAL', dataType: 'AST_ONLY', organism: 'K. pneumoniae', resistanceFlag: 'HIGH', summary: 'Carbapenem resistant isolate' },
  { id: 'R-103', location: { state: 'Maharashtra', city: 'Mumbai', siteName: 'Mithi River' }, date: '2024-05-08', source: 'RIVER', dataType: 'PCR', organism: 'E. coli', resistanceFlag: 'MEDIUM', summary: 'blaNDM-1 gene detected' },
  { id: 'R-104', location: { state: 'Karnataka', city: 'Bengaluru', siteName: 'Lake Bellandur' }, date: '2024-05-05', source: 'RIVER', dataType: 'WGS', organism: 'A. baumannii', resistanceFlag: 'HIGH', summary: 'Extensively drug resistant' },
  { id: 'R-105', location: { state: 'Delhi', city: 'New Delhi', siteName: 'AIIMS' }, date: '2024-05-01', source: 'CLINICAL', dataType: 'AST_ONLY', organism: 'S. aureus', resistanceFlag: 'LOW', summary: 'MRSA screening positive' },
];

const SOURCE_DATA = [
  { name: 'Clinical', value: 45 },
  { name: 'Wastewater', value: 30 },
  { name: 'Environmental', value: 25 },
];

// Calculated approximate percentages for India Map Projection (Top/Left)
// Based on Bounding Box: N37-N6, E67-E98
const MAP_LOCATIONS = [
  // GUJARAT CLUSTER
  { id: 1, top: '47%', left: '20%', city: 'Vadodara', state: 'Gujarat', risk: 'CRITICAL', organism: 'P. aeruginosa', color: 'bg-rose-500' },
  { id: 5, top: '45%', left: '18%', city: 'Ahmedabad', state: 'Gujarat', risk: 'HIGH', organism: 'K. pneumoniae', color: 'bg-rose-500' },
  { id: 16, top: '47%', left: '12%', city: 'Rajkot', state: 'Gujarat', risk: 'MEDIUM', organism: 'E. coli', color: 'bg-amber-500' },
  
  // NORTH
  { id: 2, top: '27%', left: '33%', city: 'New Delhi', state: 'Delhi', risk: 'LOW', organism: 'S. aureus', color: 'bg-green-500' },
  { id: 15, top: '20%', left: '31%', city: 'Chandigarh', state: 'Punjab', risk: 'HIGH', organism: 'P. aeruginosa', color: 'bg-rose-500' },
  { id: 9, top: '32%', left: '28%', city: 'Jaipur', state: 'Rajasthan', risk: 'HIGH', organism: 'MRSA', color: 'bg-rose-500' },
  { id: 10, top: '33%', left: '45%', city: 'Lucknow', state: 'Uttar Pradesh', risk: 'HIGH', organism: 'E. coli (ESBL)', color: 'bg-rose-500' },

  // WEST / CENTRAL
  { id: 3, top: '58%', left: '19%', city: 'Mumbai', state: 'Maharashtra', risk: 'MEDIUM', organism: 'E. coli', color: 'bg-amber-500' },
  { id: 12, top: '60%', left: '22%', city: 'Pune', state: 'Maharashtra', risk: 'HIGH', organism: 'A. baumannii', color: 'bg-rose-500' },
  { id: 13, top: '45%', left: '34%', city: 'Bhopal', state: 'Madhya Pradesh', risk: 'LOW', organism: 'Salmonella', color: 'bg-green-500' },

  // SOUTH
  { id: 4, top: '78%', left: '34%', city: 'Bengaluru', state: 'Karnataka', risk: 'HIGH', organism: 'A. baumannii', color: 'bg-rose-500' },
  { id: 6, top: '77%', left: '43%', city: 'Chennai', state: 'Tamil Nadu', risk: 'CRITICAL', organism: 'C. auris', color: 'bg-rose-500' },
  { id: 7, top: '64%', left: '37%', city: 'Hyderabad', state: 'Telangana', risk: 'HIGH', organism: 'A. baumannii', color: 'bg-rose-500' },
  { id: 11, top: '87%', left: '30%', city: 'Kochi', state: 'Kerala', risk: 'CRITICAL', organism: 'K. pneumoniae', color: 'bg-rose-500' },

  // EAST
  { id: 8, top: '47%', left: '69%', city: 'Kolkata', state: 'West Bengal', risk: 'MEDIUM', organism: 'V. cholerae', color: 'bg-amber-500' },
  { id: 14, top: '35%', left: '80%', city: 'Guwahati', state: 'Assam', risk: 'MEDIUM', organism: 'Shigella', color: 'bg-amber-500' },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Green, Amber

const NationalOverview: React.FC<{ onSelectReport: (r: AMRReport) => void }> = ({ onSelectReport }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Reports</h3>
                <Activity className="text-blue-600" size={20} />
             </div>
             <p className="text-2xl font-bold text-slate-800">1,248</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">High Risk Alerts</h3>
                <AlertTriangle className="text-rose-600" size={20} />
             </div>
             <p className="text-2xl font-bold text-slate-800">86</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Contributing Labs</h3>
                <Building2 className="text-indigo-600" size={20} />
             </div>
             <p className="text-2xl font-bold text-slate-800">42</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-2">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Env. Samples</h3>
                <Droplets className="text-teal-600" size={20} />
             </div>
             <p className="text-2xl font-bold text-slate-800">315</p>
          </div>
      </div>

      {/* 2. MAP & PIE CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center">
             <MapPin className="mr-2 text-blue-600" size={20}/>
             Surveillance Map: Resistance Hotspots
           </h3>
           
           {/* MAP CONTAINER - Fixed Aspect Ratio for Accuracy */}
           <div className="w-full flex justify-center bg-slate-50 rounded-xl border border-slate-100 py-4">
              <div className="relative w-full max-w-[450px]" style={{ aspectRatio: '0.88' }}>
                  {/* BASE MAP */}
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bh/India_location_map.svg/862px-India_location_map.svg.png" 
                    alt="Map of India" 
                    className="w-full h-full object-contain mix-blend-multiply opacity-60 grayscale contrast-125" 
                  />
                  
                  {/* OVERLAY GRID (Optional for tech feel) */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

                  {/* DYNAMIC MARKERS */}
                  {MAP_LOCATIONS.map((loc) => (
                    <div 
                        key={loc.id} 
                        className="absolute group cursor-pointer z-10 transform -translate-x-1/2 -translate-y-1/2" 
                        style={{ top: loc.top, left: loc.left }}
                    >
                        <div className="relative flex items-center justify-center">
                            {/* Ping animation for Critical/High */}
                            {(loc.risk === 'CRITICAL' || loc.risk === 'HIGH') && (
                                <div className={`absolute w-6 h-6 ${loc.color} rounded-full opacity-40 animate-ping`}></div>
                            )}
                            
                            {/* The Dot */}
                            <div className={`w-3 h-3 ${loc.color} border-2 border-white rounded-full shadow-md z-20 hover:scale-125 transition-transform`}></div>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-3 rounded-lg shadow-xl w-48 opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none scale-95 group-hover:scale-100 origin-bottom">
                                <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-sm font-bold">{loc.city}</p>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 ${
                                        loc.risk === 'CRITICAL' || loc.risk === 'HIGH' ? 'bg-rose-500 text-white' :
                                        loc.risk === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'
                                    }`}>{loc.risk}</span>
                                </div>
                                <p className="text-[10px] text-slate-300 font-medium mb-1">{loc.organism}</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-wide">{loc.state}</p>
                            </div>
                        </div>
                    </div>
                  ))}
              </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
           <h3 className="font-bold text-slate-800 mb-4">Sample Sources</h3>
           <div className="h-48 shrink-0">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie 
                    data={SOURCE_DATA} 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                 >
                   {SOURCE_DATA.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           
           <div className="space-y-3 mt-4 mb-6">
             {SOURCE_DATA.map((entry, index) => (
               <div key={index} className="flex justify-between text-sm items-center p-2 rounded hover:bg-slate-50 transition-colors">
                 <div className="flex items-center">
                    <div 
                        className="w-3 h-3 rounded-full mr-3 shadow-sm" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-slate-600 font-medium">{entry.name}</span>
                 </div>
                 <span className="font-bold text-slate-800">{entry.value}%</span>
               </div>
             ))}
           </div>

           {/* Risk Distribution Summary */}
           <div className="mt-auto pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Risk Distribution</h4>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm p-1">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> High / Critical</span>
                        <span className="font-bold text-slate-800">86</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-1">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Medium</span>
                        <span className="font-bold text-slate-800">450</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-1">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Low / Surveillance</span>
                        <span className="font-bold text-slate-800">712</span>
                    </div>
                </div>
           </div>
        </div>
      </div>

      {/* 3. RECENT REPORTS LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-600"/> Recently Submitted Reports
             </h3>
             <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                   <tr>
                      <th className="p-4 pl-6">Report ID</th>
                      <th className="p-4">Location</th>
                      <th className="p-4">Organism</th>
                      <th className="p-4">Data Type</th>
                      <th className="p-4">Risk Level</th>
                      <th className="p-4 text-left w-40">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {MOCK_REPORTS.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 group transition-colors">
                         <td className="p-4 pl-6 font-mono font-medium text-slate-600">{report.id}</td>
                         <td className="p-4">
                            <div className="font-medium text-slate-800">{report.location.city}</div>
                            <div className="text-xs text-slate-500">{report.location.siteName}</div>
                         </td>
                         <td className="p-4 font-bold text-slate-700 italic">{report.organism}</td>
                         <td className="p-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                               {report.dataType.replace('_', ' ')}
                            </span>
                         </td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                               report.resistanceFlag === 'HIGH' ? 'bg-rose-100 text-rose-700' : 
                               report.resistanceFlag === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 
                               'bg-green-100 text-green-700'
                            }`}>
                               {report.resistanceFlag}
                            </span>
                         </td>
                         <td className="p-4">
                            <button 
                               onClick={() => onSelectReport(report)}
                               className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-medium text-xs px-4 py-2 rounded-lg transition-colors flex items-center justify-center w-full gap-2"
                            >
                               View Report <ChevronRight size={14}/>
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};
export default NationalOverview;