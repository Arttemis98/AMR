import React from 'react';
import { Beaker, MapPin, Activity, Dna } from 'lucide-react';

const ResearchContext: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <MapPin size={24} />
          </div>
          <h3 className="font-semibold text-slate-800">Study Location</h3>
        </div>
        <p className="text-sm text-slate-600">
          Municipal domestic wastewater treatment plants in <strong>Vadodara</strong> and <strong>Anand</strong> districts, Gujarat.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
            <Beaker size={24} />
          </div>
          <h3 className="font-semibold text-slate-800">Methodology</h3>
        </div>
        <p className="text-sm text-slate-600">
          Sampling at primary effluent, treatment, and post-chlorination. In-vitro reproduction of chlorine stress (30 min exposure).
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
            <Activity size={24} />
          </div>
          <h3 className="font-semibold text-slate-800">Key Observation</h3>
        </div>
        <p className="text-sm text-slate-600">
          Post-chlorination survivors exhibit <strong>increased resistance</strong> (lower zone of inhibition) to major antibiotics.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <Dna size={24} />
          </div>
          <h3 className="font-semibold text-slate-800">Proposed Analysis</h3>
        </div>
        <p className="text-sm text-slate-600">
          <strong>NGS Total RNA-seq</strong> (rRNA depleted) to study active gene expression and stress-induced horizontal gene transfer.
        </p>
      </div>
    </div>
  );
};

export default ResearchContext;
