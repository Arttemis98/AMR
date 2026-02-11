import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { SamplePoint, AntibioticData } from '../types';

const bacterialLoadData: SamplePoint[] = [
  { stage: 'Influent', cfuPerMl: 1200000, description: 'High Load' },
  { stage: 'Primary Tx', cfuPerMl: 800000, description: 'Reduced' },
  { stage: 'Pre-Chlorine', cfuPerMl: 450000, description: 'Before Disinfection' },
  { stage: 'Post-Chlorine', cfuPerMl: 50000, description: 'Survivors (Persistent)' },
];

const antibioticData: AntibioticData[] = [
  { antibiotic: 'Amoxicillin', zoneBeforeChlorine: 22, zoneAfterChlorine: 14, class: 'Penicillin' },
  { antibiotic: 'Ciprofloxacin', zoneBeforeChlorine: 28, zoneAfterChlorine: 18, class: 'Fluoroquinolone' },
  { antibiotic: 'Gentamicin', zoneBeforeChlorine: 19, zoneAfterChlorine: 12, class: 'Aminoglycoside' },
  { antibiotic: 'Tetracycline', zoneBeforeChlorine: 24, zoneAfterChlorine: 20, class: 'Tetracycline' },
  { antibiotic: 'Ceftriaxone', zoneBeforeChlorine: 26, zoneAfterChlorine: 16, class: 'Cephalosporin' },
];

const DataCharts: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Bacterial Load Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Microbial Load Reduction Profile</h3>
        <p className="text-sm text-slate-500 mb-6">Log reduction observed, but significant survival population persists post-chlorination.</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bacterialLoadData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'CFU/mL', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="cfuPerMl" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Bacterial Load (CFU)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Antibiotic Susceptibility Change */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Impact of Chlorine Stress on Antibiotic Susceptibility</h3>
        <p className="text-sm text-slate-500 mb-6">
          Comparison of Zone of Inhibition (mm) before and after 30 min chlorine exposure. 
          <br/>
          <span className="text-rose-500 font-medium">Smaller zone = Higher Resistance.</span>
        </p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={antibioticData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} />
              <XAxis type="number" domain={[0, 35]} />
              <YAxis dataKey="antibiotic" type="category" width={100} tick={{ fontSize: 12, fontWeight: 500 }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
              <Legend />
              <Bar dataKey="zoneBeforeChlorine" fill="#10b981" name="Zone Before Chlorine (mm)" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="zoneAfterChlorine" fill="#f43f5e" name="Zone After Chlorine (mm)" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Radar Chart Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center">
         <h3 className="text-lg font-bold text-slate-800 mb-2 w-full text-left">Resistance Pattern Shift</h3>
         <div className="h-80 w-full max-w-lg">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={antibioticData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="antibiotic" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 30]} />
              <Radar name="Before Stress" dataKey="zoneBeforeChlorine" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="After Stress" dataKey="zoneAfterChlorine" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              <Legend />
              <Tooltip contentStyle={{ borderRadius: '8px' }}/>
            </RadarChart>
          </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default DataCharts;
