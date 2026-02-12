import React, { useState } from 'react';
import { 
  Microscope, 
  Dna, 
  Activity, 
  Network, 
  Plus, 
  Trash2, 
  ChevronRight, 
  BarChart2, 
  ArrowLeft, 
  Layers, 
  Cpu, 
  UploadCloud, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Disc, 
  GitMerge, 
  Box, 
  Download,
  AlertTriangle,
  Settings,
  Database,
  Beaker
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList
} from 'recharts';

// Import our specialized tools
import NGSAnalysisTool from './NGSAnalysisTool';
import PhylogenyAnalysis from './PhylogenyAnalysis';
import PlasmidMapper from './PlasmidMapper';
import MetabolicPathwayMapper from './MetabolicPathwayMapper';
import ProteinDockingViewer from './ProteinDockingViewer';
import PCRAnalysisSuite from './PCRAnalysisSuite';

// --- COMPREHENSIVE ANTIBIOTIC DATABASE (70+ DRUGS) ---
const ANTIBIOTIC_DB = [
  {
    name: 'Cell Wall Synthesis Inhibitors',
    classes: [
      {
        name: 'Natural Penicillins',
        antibiotics: [
          { name: 'Penicillin G', defaultConc: '10', defaultUnit: 'units' },
          { name: 'Penicillin V', defaultConc: '10', defaultUnit: 'units' },
          { name: 'Procaine Penicillin G', defaultConc: '300k', defaultUnit: 'units' },
          { name: 'Benzathine Penicillin G', defaultConc: '1.2m', defaultUnit: 'units' }
        ]
      },
      {
        name: 'Antistaphylococcal Penicillins',
        antibiotics: [
          { name: 'Methicillin', defaultConc: '5', defaultUnit: 'mcg' },
          { name: 'Nafcillin', defaultConc: '1', defaultUnit: 'mcg' },
          { name: 'Oxacillin', defaultConc: '1', defaultUnit: 'mcg' },
          { name: 'Cloxacillin', defaultConc: '1', defaultUnit: 'mcg' },
          { name: 'Dicloxacillin', defaultConc: '1', defaultUnit: 'mcg' },
          { name: 'Flucloxacillin', defaultConc: '1', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Aminopenicillins',
        antibiotics: [
          { name: 'Ampicillin', defaultConc: '10', defaultUnit: 'mcg' },
          { name: 'Amoxicillin', defaultConc: '10', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Broad Spectrum Penicillins',
        antibiotics: [
          { name: 'Ampicillin/Sulbactam', defaultConc: '10/10', defaultUnit: 'mcg' },
          { name: 'Sultamicillin', defaultConc: '375', defaultUnit: 'mg' },
          { name: 'Co-Amoxiclav', defaultConc: '20/10', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Anti-Pseudomonal Penicillins',
        antibiotics: [
          { name: 'Ticarcillin', defaultConc: '75', defaultUnit: 'mcg' },
          { name: 'Carbenicillin', defaultConc: '100', defaultUnit: 'mcg' },
          { name: 'Piperacillin', defaultConc: '100', defaultUnit: 'mcg' },
          { name: 'Mezlocillin', defaultConc: '75', defaultUnit: 'mcg' },
          { name: 'Azlocillin', defaultConc: '75', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Cephalosporins (1st Gen)',
        antibiotics: [
          { name: 'Cefadroxil', defaultConc: '30', defaultUnit: 'mcg' },
          { name: 'Cephalexin', defaultConc: '30', defaultUnit: 'mcg' },
          { name: 'Cefazolin', defaultConc: '30', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Cephalosporins (3rd Gen)',
        antibiotics: [
          { name: 'Ceftriaxone', defaultConc: '30', defaultUnit: 'mcg' },
          { name: 'Cefotaxime', defaultConc: '30', defaultUnit: 'mcg' },
          { name: 'Ceftazidime', defaultConc: '30', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Carbapenems',
        antibiotics: [
          { name: 'Imipenem/Cilastatin', defaultConc: '10', defaultUnit: 'mcg' },
          { name: 'Meropenem', defaultConc: '10', defaultUnit: 'mcg' },
          { name: 'Ertapenem', defaultConc: '10', defaultUnit: 'mcg' }
        ]
      }
    ]
  },
  {
    name: 'Protein Synthesis Inhibitors',
    classes: [
      {
        name: 'Aminoglycosides',
        antibiotics: [
          { name: 'Amikacin', defaultConc: '30', defaultUnit: 'mcg' },
          { name: 'Gentamicin', defaultConc: '10', defaultUnit: 'mcg' },
          { name: 'Tobramycin', defaultConc: '10', defaultUnit: 'mcg' }
        ]
      },
      {
        name: 'Macrolides',
        antibiotics: [
          { name: 'Erythromycin', defaultConc: '15', defaultUnit: 'mcg' },
          { name: 'Azithromycin', defaultConc: '15', defaultUnit: 'mcg' }
        ]
      }
    ]
  },
  {
    name: 'Nucleic Acid Inhibitors',
    classes: [
      {
        name: 'Fluoroquinolones',
        antibiotics: [
          { name: 'Ciprofloxacin', defaultConc: '5', defaultUnit: 'mcg' },
          { name: 'Norfloxacin', defaultConc: '10', defaultUnit: 'mcg' },
          { name: 'Ofloxacin', defaultConc: '5', defaultUnit: 'mcg' },
          { name: 'Levofloxacin', defaultConc: '5', defaultUnit: 'mcg' },
          { name: 'Moxifloxacin', defaultConc: '5', defaultUnit: 'mcg' },
          { name: 'Gatifloxacin', defaultConc: '5', defaultUnit: 'mcg' }
        ]
      }
    ]
  }
];

type ToolModule = 'HUB' | 'AST' | 'QC' | 'PHYLO' | 'PCR' | 'PLASMID' | 'METABOLIC' | 'DOCKING';
type ASTMode = 'DISK' | 'MIC';

interface ASTEntry {
  id: number;
  antibiotic: string;
  concValue: string;
  concUnit: string;
  zone: number;
  bpS: number;
  bpR: number;
  result: 'Resistant' | 'Intermediate' | 'Susceptible';
}

interface MICEntry {
  id: number;
  antibiotic: string;
  micValue: number;
  bpS: number;
  bpR: number;
  result: 'Resistant' | 'Intermediate' | 'Susceptible';
}

const OpenToolkit: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ToolModule>('HUB');
  const [astMode, setAstMode] = useState<ASTMode>('DISK');
  
  // AST State
  const [astEntries, setAstEntries] = useState<ASTEntry[]>([]);
  const [selectedMech, setSelectedMech] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAntibiotic, setSelectedAntibiotic] = useState('');

  // MIC State
  const [micEntries, setMicEntries] = useState<MICEntry[]>([]);
  const [micInput, setMicInput] = useState({ antibiotic: '', value: '', s: '', r: '' });

  // --- LOGIC CALCULATOR (Higher is Better / Susceptible) ---
  const determineResult = (val: number, s: number, r: number) => {
    if (isNaN(val) || isNaN(s) || isNaN(r)) return 'Intermediate';
    if (val >= s) return 'Susceptible';
    if (val <= r) return 'Resistant';
    return 'Intermediate';
  };

  const handleAddAST = () => {
    if(!selectedAntibiotic) return;
    setAstEntries([...astEntries, {
      id: Date.now(),
      antibiotic: selectedAntibiotic,
      concValue: '10',
      concUnit: 'mcg',
      zone: 0,
      bpS: 19,
      bpR: 13,
      result: 'Resistant'
    }]);
    setSelectedAntibiotic('');
  };

  const updateAST = (id: number, field: keyof ASTEntry, value: any) => {
    setAstEntries(prev => prev.map(e => {
      if(e.id !== id) return e;
      const updated = { ...e, [field]: value };
      updated.result = determineResult(Number(updated.zone), Number(updated.bpS), Number(updated.bpR));
      return updated;
    }));
  };

  const addMIC = () => {
    if(!micInput.antibiotic || !micInput.value) return;
    const val = Number(micInput.value);
    const s = Number(micInput.s);
    const r = Number(micInput.r);
    const res = determineResult(val, s, r);

    setMicEntries([...micEntries, {
      id: Date.now(),
      antibiotic: micInput.antibiotic,
      micValue: val,
      bpS: s,
      bpR: r,
      result: res
    }]);
    setMicInput({ ...micInput, value: '', s: '', r: '' });
  };

  const loadSampleData = () => {
    if (astMode === 'DISK') {
        setAstEntries([
            { id: 1, antibiotic: 'Ampicillin', concValue: '10', concUnit: 'mcg', zone: 12, bpS: 17, bpR: 13, result: 'Resistant' },
            { id: 2, antibiotic: 'Ciprofloxacin', concValue: '5', concUnit: 'mcg', zone: 24, bpS: 21, bpR: 15, result: 'Susceptible' },
            { id: 3, antibiotic: 'Gentamicin', concValue: '10', concUnit: 'mcg', zone: 14, bpS: 15, bpR: 12, result: 'Intermediate' }
        ]);
    } else {
        setMicEntries([
            { id: 1, antibiotic: 'Vancomycin', micValue: 22, bpS: 20, bpR: 10, result: 'Susceptible' },
            { id: 2, antibiotic: 'Meropenem', micValue: 5, bpS: 15, bpR: 10, result: 'Resistant' },
            { id: 3, antibiotic: 'Linezolid', micValue: 14, bpS: 18, bpR: 12, result: 'Intermediate' }
        ]);
    }
  };

  // --- RENDERERS ---

  const renderHub = () => (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Research Analysis Workbench</h2>
        <p className="text-slate-500">Professional standalone tools for integrated resistance research.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'AST', name: 'AST Phenotype', icon: Microscope, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Interpretation engine for Disk Diffusion and MIC concentration data.' },
          { id: 'QC', name: 'NGS Pipeline', icon: Dna, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Automated QC, assembly, and transcriptomics for genomic reads.' },
          { id: 'PHYLO', name: 'Cloud Phylogeny', icon: Network, color: 'text-rose-600', bg: 'bg-rose-50', desc: '16S rRNA identification and evolutionary tree construction.' },
          { id: 'PCR', name: 'In-Silico PCR', icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Modeling amplification protocols and virtual gel electrophoresis.' },
          { id: 'PLASMID', name: 'Plasmid Mapper', icon: Disc, color: 'text-pink-600', bg: 'bg-pink-50', desc: 'Circular mapping and annotation for AMR plasmids.' },
          { id: 'METABOLIC', name: 'Pathway Mapper', icon: GitMerge, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Mapping transcriptomic flux to visualize metabolic shifts.' },
          { id: 'DOCKING', name: 'Docking Viewer', icon: Box, color: 'text-cyan-600', bg: 'bg-cyan-50', desc: 'Molecular simulation of drug-protein binding and mutation impact.' }
        ].map(tool => (
          <div key={tool.id} onClick={() => setActiveModule(tool.id as ToolModule)} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
            <div className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><tool.icon size={24} /></div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{tool.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{tool.desc}</p>
            <div className="flex items-center text-blue-600 text-sm font-bold">Launch Tool <ChevronRight size={16} /></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAST = () => (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"><ArrowLeft size={20} /></button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">AST Phenotype</h2>
                <p className="text-slate-500">Automated Breakpoint Engine & Resistance Profiler</p>
            </div>
         </div>
         <button onClick={loadSampleData} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-bold text-xs border border-teal-200 hover:bg-teal-100 flex items-center gap-2"><RefreshCw size={14}/> Load Sample Data</button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-8">
            <button onClick={() => setAstMode('DISK')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${astMode === 'DISK' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Disk Diffusion (Zone)</button>
            <button onClick={() => setAstMode('MIC')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${astMode === 'MIC' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>MIC Concentration</button>
         </div>

         {astMode === 'DISK' ? (
           <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mechanism</label>
                  <select className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none" value={selectedMech} onChange={e => { setSelectedMech(e.target.value); setSelectedClass(''); setSelectedAntibiotic(''); }}>
                    <option value="">Mechanism...</option>
                    {ANTIBIOTIC_DB.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Class</label>
                  <select className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none" disabled={!selectedMech} value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedAntibiotic(''); }}>
                    <option value="">Class...</option>
                    {selectedMech && ANTIBIOTIC_DB.find(m => m.name === selectedMech)?.classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Antibiotic</label>
                  <select className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none" disabled={!selectedClass} value={selectedAntibiotic} onChange={e => setSelectedAntibiotic(e.target.value)}>
                    <option value="">Select Drug...</option>
                    {selectedClass && ANTIBIOTIC_DB.find(m => m.name === selectedMech)?.classes.find(c => c.name === selectedClass)?.antibiotics.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={handleAddAST} disabled={!selectedAntibiotic} className="w-full bg-teal-600 text-white font-bold py-2 rounded-lg hover:bg-teal-700 shadow-sm flex items-center justify-center gap-2"><Plus size={18}/> Add Drug</button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">Antibiotic</th>
                      <th className="p-4">Conc.</th>
                      <th className="p-4">Value (mm)</th>
                      <th className="p-4">Ref: S (≥) | R (≤)</th>
                      <th className="p-4">Interpretation</th>
                      <th className="p-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {astEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-700">{entry.antibiotic}</td>
                        <td className="p-4">
                           <div className="flex gap-1 items-center">
                              <input type="text" className="w-12 p-1 border border-slate-200 rounded bg-white text-xs" value={entry.concValue} onChange={e => updateAST(entry.id, 'concValue', e.target.value)} />
                              <span className="text-[10px] text-slate-400 font-bold">{entry.concUnit}</span>
                           </div>
                        </td>
                        <td className="p-4"><input type="number" className="w-16 p-1 border border-slate-200 rounded bg-white text-sm font-bold" value={entry.zone} onChange={e => updateAST(entry.id, 'zone', e.target.value)} /></td>
                        <td className="p-4 flex items-center gap-1 pt-6">
                            <input type="number" className="w-10 p-1 border border-slate-200 rounded text-[10px]" value={entry.bpS} onChange={e => updateAST(entry.id, 'bpS', e.target.value)} />
                            <span className="text-slate-300">|</span>
                            <input type="number" className="w-10 p-1 border border-slate-200 rounded text-[10px]" value={entry.bpR} onChange={e => updateAST(entry.id, 'bpR', e.target.value)} />
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                            entry.result === 'Resistant' ? 'bg-red-50 text-red-700 border-red-200' : 
                            entry.result === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>{entry.result}</span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => setAstEntries(astEntries.filter(e => e.id !== entry.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>

             {astEntries.length > 0 && (
                <div className="mt-8 p-8 bg-slate-50 rounded-3xl border border-slate-100">
                   <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2 text-base"><BarChart2 className="text-teal-600"/> Phenotypic Resistance Distribution</h3>
                   <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={astEntries.map(e => ({ ...e, label: `${e.antibiotic} (${e.concValue}${e.concUnit})` }))} layout="vertical" margin={{ left: 50, right: 60, bottom: 25, top: 10 }}>
                            <XAxis type="number" domain={[0, 40]} axisLine={{ stroke: '#94a3b8' }} tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Measured Value (mm)', position: 'insideBottom', offset: -15, style: { fontSize: '11px', fontWeight: 'bold', fill: '#475569' } }} />
                            <YAxis dataKey="label" type="category" width={160} axisLine={{ stroke: '#94a3b8' }} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                            <Bar dataKey="zone" radius={[0, 6, 6, 0]} barSize={28}>
                               {astEntries.map((e, i) => <Cell key={i} fill={e.result === 'Resistant' ? '#ef4444' : e.result === 'Intermediate' ? '#f59e0b' : '#10b981'} />)}
                               <LabelList dataKey="zone" position="right" offset={10} fontSize={12} fontWeight="bold" fill="#334155" formatter={(v: number) => `${v} mm`} />
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             )}
           </div>
         ) : (
           <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 items-end">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Antibiotic Selection</label>
                  <select className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none" value={micInput.antibiotic} onChange={e => setMicInput({...micInput, antibiotic: e.target.value})}>
                    <option value="">Select drug from database...</option>
                    {ANTIBIOTIC_DB.flatMap(m => m.classes).flatMap(c => c.antibiotics).map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Measured Value</label>
                  <input type="number" className="w-full p-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none" value={micInput.value} onChange={e => setMicInput({...micInput, value: e.target.value})} placeholder="Value" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ref: S (≥) | R (≤)</label>
                  <div className="flex gap-1">
                    <input type="number" className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg outline-none" value={micInput.s} onChange={e => setMicInput({...micInput, s: e.target.value})} placeholder="S ≥" />
                    <input type="number" className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg outline-none" value={micInput.r} onChange={e => setMicInput({...micInput, r: e.target.value})} placeholder="R ≤" />
                  </div>
                </div>
                <button onClick={addMIC} className="bg-teal-600 text-white font-bold py-2.5 rounded-lg hover:bg-teal-700 shadow-md">Add MIC</button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                  <thead className="text-slate-500 font-bold border-b border-slate-100">
                    <tr><th className="p-4">Antibiotic</th><th className="p-4">Value</th><th className="p-4">Criteria (S | R)</th><th className="p-4">Result</th><th className="p-4 w-10"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {micEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{entry.antibiotic}</td>
                        <td className="p-4 font-mono font-bold text-blue-600 text-lg">{entry.micValue}</td>
                        <td className="p-4 text-xs text-slate-400">S: ≥{entry.bpS} | R: ≤{entry.bpR}</td>
                        <td className="p-4">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                            entry.result === 'Resistant' ? 'bg-red-50 text-red-700 border-red-200' : 
                            entry.result === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>{entry.result}</span>
                        </td>
                        <td className="p-4"><button onClick={() => setMicEntries(micEntries.filter(m => m.id !== entry.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                    {micEntries.length === 0 && <tr><td colSpan={5} className="p-16 text-center text-slate-400 italic font-medium">Panel is empty.</td></tr>}
                  </tbody>
                 </table>
              </div>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {activeModule === 'HUB' && renderHub()}
      {activeModule === 'AST' && renderAST()}
      
      {/* INTEGRATED FULL TOOLS */}
      {activeModule === 'QC' && <NGSAnalysisTool onBack={() => setActiveModule('HUB')} />}
      {activeModule === 'PHYLO' && <PhylogenyAnalysis onBack={() => setActiveModule('HUB')} />}
      {activeModule === 'PCR' && <PCRAnalysisSuite />}
      {activeModule === 'PLASMID' && <PlasmidMapper />}
      {activeModule === 'METABOLIC' && <MetabolicPathwayMapper />}
      {activeModule === 'DOCKING' && <ProteinDockingViewer />}

      {activeModule !== 'HUB' && activeModule !== 'AST' && activeModule !== 'QC' && activeModule !== 'PHYLO' && (
        <div className="mt-8 flex justify-center">
            <button onClick={() => setActiveModule('HUB')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-all text-sm">
                <ArrowLeft size={16}/> Back to Research Workbench
            </button>
        </div>
      )}
    </div>
  );
};

export default OpenToolkit;