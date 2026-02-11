import React from 'react';
import { ArrowRight, Droplets, FlaskConical, Microscope, Database, FileText } from 'lucide-react';

const WorkflowDiagram: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8 overflow-x-auto">
      <h3 className="text-lg font-bold text-slate-800 mb-6">Experimental Workflow</h3>
      <div className="flex items-start min-w-[800px] justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-8 left-0 w-full h-1 bg-slate-100 -z-0"></div>

        {/* Step 1 */}
        <div className="flex flex-col items-center z-10 w-48 text-center group">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 ring-4 ring-white group-hover:scale-110 transition-transform">
            <MapIcon />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">Field Sampling</h4>
          <p className="text-xs text-slate-500">Vadodara & Anand WWTPs.<br/>Influent -> Effluent</p>
        </div>

        {/* Arrow */}
        <div className="pt-6 text-slate-300">
            <ArrowRight size={24} />
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center z-10 w-48 text-center group">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-4 ring-4 ring-white group-hover:scale-110 transition-transform">
            <FlaskConical size={32} />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">Lab Stress Test</h4>
          <p className="text-xs text-slate-500">In-vitro Chlorination<br/>(30 mins exposure)</p>
        </div>

        {/* Arrow */}
        <div className="pt-6 text-slate-300">
            <ArrowRight size={24} />
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center z-10 w-48 text-center group">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4 ring-4 ring-white group-hover:scale-110 transition-transform">
            <Microscope size={32} />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">AST Profiling</h4>
          <p className="text-xs text-slate-500">Zone of Inhibition<br/>Comparison</p>
        </div>

         {/* Arrow */}
         <div className="pt-6 text-slate-300">
            <ArrowRight size={24} />
        </div>

        {/* Step 4 */}
        <div className="flex flex-col items-center z-10 w-48 text-center group">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 ring-4 ring-white group-hover:scale-110 transition-transform">
            <Database size={32} />
          </div>
          <h4 className="font-semibold text-slate-800 mb-1">NGS (RNA-seq)</h4>
          <p className="text-xs text-slate-500">rRNA Depletion<br/>Transcriptomics</p>
        </div>
      </div>
    </div>
  );
};

// Simple internal icon for variety
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

export default WorkflowDiagram;
