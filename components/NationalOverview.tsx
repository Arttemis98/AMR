import React from 'react';
import { MapPin, Activity, AlertTriangle, Droplets, Building2 } from 'lucide-react';
import { AMRReport } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const MOCK_REPORTS: AMRReport[] = [
  { id: 'R-101', location: { state: 'Gujarat', city: 'Vadodara', siteName: 'Muni. WWTP A' }, date: '2024-05-12', source: 'WWTP', dataType: 'RNA_SEQ', organism: 'P. aeruginosa', resistanceFlag: 'HIGH', summary: 'Chlorine-induced multidrug resistance', submittedBy: 'Kunal Joshi' },
  { id: 'R-102', location: { state: 'Gujarat', city: 'Anand', siteName: 'Civil Hospital' }, date: '2024-05-10', source: 'CLINICAL', dataType: 'AST_ONLY', organism: 'K. pneumoniae', resistanceFlag: 'HIGH', summary: 'Carbapenem resistant isolate', submittedBy: 'Dr. A. Sharma' },
  { id: 'R-103', location: { state: 'Maharashtra', city: 'Mumbai', siteName: 'Mithi River' }, date: '2024-05-08', source: 'RIVER', dataType: 'PCR', organism: 'E. coli', resistanceFlag: 'MEDIUM', summary: 'blaNDM-1 gene detected', submittedBy: 'Kunal Joshi' },
  { id: 'R-104', location: { state: 'Karnataka', city: 'Bengaluru', siteName: 'Lake Bellandur' }, date: '2024-05-05', source: 'RIVER', dataType: 'WGS', organism: 'A. baumannii', resistanceFlag: 'HIGH', summary: 'Extensively drug resistant', submittedBy: 'Env. Lab South' },
  { id: 'R-105', location: { state: 'Delhi', city: 'New Delhi', siteName: 'AIIMS' }, date: '2024-05-01', source: 'CLINICAL', dataType: 'AST_ONLY', organism: 'S. aureus', resistanceFlag: 'LOW', summary: 'MRSA screening positive', submittedBy: 'Central Path Lab' },
];

const SOURCE_DATA = [
  { name: 'Clinical', value: 45 },
  { name: 'Wastewater', value: 30 },
  { name: 'Environmental', value: 25 },
];

const NationalOverview: React.FC<{ onSelectReport: (r: AMRReport) => void }> = ({ onSelectReport }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Representation */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center">
             <MapPin className="mr-2 text-blue-600" size={20}/>
             Surveillance Map: Resistance Hotspots
           </h3>
           <div className="bg-slate-50 rounded-lg h-[600px] flex items-center justify-center relative overflow-hidden border border-slate-100 p-4">
              {/* Using a reliable background map image instead of complex SVG path */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/b/bv/India_location_map.svg" 
                    alt="India Map" 
                    className="h-full w-auto object-contain grayscale" 
                 />
              </div>

              {/* Markers positioned with percentages for responsiveness */}
              
              {/* Vadodara/Gujarat - Roughly West */}
              <div className="absolute top-[48%] left-[28%] group cursor-pointer z-10" onClick={() => alert('View Gujarat Report')}>
                 <span className="relative flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-rose-500 border-2 border-white shadow-md"></span>
                 </span>
                 <div className="absolute left-8 top-0 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    <p className="text-rose-600">Critical Hotspot</p>
                    Vadodara, Gujarat
                 </div>
              </div>

               {/* Delhi - North */}
               <div className="absolute top-[28%] left-[38%] group cursor-pointer z-10">
                 <span className="relative flex h-4 w-4">
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-400 border-2 border-white shadow-md"></span>
                 </span>
                 <div className="absolute left-6 top-0 bg-white px-2 py-1 rounded shadow-lg text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    New Delhi
                 </div>
              </div>

               {/* Mumbai - West Coast */}
               <div className="absolute top-[60%] left-[28%] group cursor-pointer z-10">
                 <span className="relative flex h-4 w-4">
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-400 border-2 border-white shadow-md"></span>
                 </span>
                 <div className="absolute left-6 top-0 bg-white px-2 py-1 rounded shadow-lg text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Mumbai
                 </div>
              </div>

               {/* Bengaluru - South */}
               <div className="absolute top-[75%] left-[40%] group cursor-pointer z-10">
                 <span className="relative flex h-4 w-4">
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400 border-2 border-white shadow-md"></span>
                 </span>
                 <div className="absolute left-6 top-0 bg-white px-2 py-1 rounded shadow-lg text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Bengaluru
                 </div>
              </div>

               {/* Kolkata - East */}
               <div className="absolute top-[45%] left-[65%] group cursor-pointer z-10">
                 <span className="relative flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400 border-2 border-white shadow-md"></span>
                 </span>
                 <div className="absolute left-6 top-0 bg-white px-2 py-1 rounded shadow-lg text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Kolkata (Monitoring)
                 </div>
              </div>

              <div className="absolute top-4 right-4 bg-white/95 p-4 rounded-xl text-xs text-slate-500 shadow-sm border border-slate-100 backdrop-blur-md w-48">
                  <div className="font-bold mb-3 text-slate-800 text-sm">Live Surveillance Feed</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></div> 
                        <span className="font-medium text-slate-700">Critical (Genomic Confirmed)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div> 
                        <span>High Risk (Phenotypic)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full"></div> 
                        <span>Moderate Risk</span>
                    </div>
                  </div>
              </div>
           </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4">Sample Sources</h3>
           <div className="h-48">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={SOURCE_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   <Cell fill="#3b82f6" />
                   <Cell fill="#10b981" />
                   <Cell fill="#f59e0b" />
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="space-y-3 mt-4">
             {SOURCE_DATA.map((entry, index) => (
               <div key={index} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                 <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="text-slate-600">{entry.name}</span>
                 </div>
                 <span className="font-bold text-slate-800">{entry.value}%</span>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Recent Reports List */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Surveillance Reports</h3>
            <button className="text-xs text-blue-600 font-medium hover:underline">View All Database</button>
          </div>
          <div className="divide-y divide-slate-100">
             {MOCK_REPORTS.map((report) => (
               <div key={report.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group" onClick={() => onSelectReport(report)}>
                  <div className="flex items-start space-x-4">
                     <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${report.resistanceFlag === 'HIGH' ? 'bg-rose-500' : report.resistanceFlag === 'MEDIUM' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                     <div>
                        <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                            {report.location.city} - {report.organism}
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200">{report.dataType}</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">{report.location.siteName} • {report.source} • <span className="font-medium text-slate-600">By: {report.submittedBy || 'Unknown'}</span></p>
                     </div>
                  </div>
                  <span className="text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                      Analyze Report <MapPin size={12} className="ml-1"/>
                  </span>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
};

export default NationalOverview;