import React, { Suspense, lazy, useState } from 'react';
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
  Beaker,
  Scale
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

// Lazy-load specialized tool modules
const NGSAnalysisTool = lazy(() => import('./NGSAnalysisTool'));
const PhylogenyAnalysis = lazy(() => import('./PhylogenyAnalysis'));
const PlasmidMapper = lazy(() => import('./PlasmidMapper'));
const MetabolicPathwayMapper = lazy(() => import('./MetabolicPathwayMapper'));
const ProteinDockingViewer = lazy(() => import('./ProteinDockingViewer'));
const PCRAnalysisSuite = lazy(() => import('./PCRAnalysisSuite'));

// --- COMPREHENSIVE CLSI M100-S25 DATABASE (Enterobacteriaceae & Nonfastidious) ---
// Data extracted from CLSI document M100-S25 Tables 2A-2C
const ANTIBIOTIC_DB = [
  {
    name: 'Cell Wall Synthesis Inhibitors',
    classes: [
      {
        name: 'Penicillins',
        antibiotics: [
          { name: 'Ampicillin', disk: '10 µg', bpS: 17, bpR: 13, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Piperacillin', disk: '100 µg', bpS: 21, bpR: 17, defaultConc: '100', defaultUnit: 'µg' },
          { name: 'Ticarcillin', disk: '75 µg', bpS: 20, bpR: 14, defaultConc: '75', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'β-Lactam/β-Lactamase Inhibitor Combinations',
        antibiotics: [
          { name: 'Amoxicillin-clavulanate', disk: '20/10 µg', bpS: 18, bpR: 13, defaultConc: '20/10', defaultUnit: 'µg' },
          { name: 'Ampicillin-sulbactam', disk: '10/10 µg', bpS: 15, bpR: 11, defaultConc: '10/10', defaultUnit: 'µg' },
          { name: 'Piperacillin-tazobactam', disk: '100/10 µg', bpS: 21, bpR: 17, defaultConc: '100/10', defaultUnit: 'µg' },
          { name: 'Ticarcillin-clavulanate', disk: '75/10 µg', bpS: 20, bpR: 14, defaultConc: '75/10', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'Cephems (Parenteral)',
        antibiotics: [
          { name: 'Cefazolin', disk: '30 µg', bpS: 23, bpR: 19, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Ceftaroline', disk: '30 µg', bpS: 23, bpR: 19, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Cefepime', disk: '30 µg', bpS: 25, bpR: 18, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Cefotaxime', disk: '30 µg', bpS: 26, bpR: 22, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Ceftriaxone', disk: '30 µg', bpS: 23, bpR: 19, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Ceftazidime', disk: '30 µg', bpS: 21, bpR: 17, defaultConc: '30', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'Cephems (Oral)',
        antibiotics: [
          { name: 'Cefuroxime (oral)', disk: '30 µg', bpS: 23, bpR: 14, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Cefaclor', disk: '30 µg', bpS: 18, bpR: 14, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Cefdinir', disk: '5 µg', bpS: 20, bpR: 16, defaultConc: '5', defaultUnit: 'µg' },
          { name: 'Cefixime', disk: '5 µg', bpS: 19, bpR: 15, defaultConc: '5', defaultUnit: 'µg' },
          { name: 'Cefpodoxime', disk: '10 µg', bpS: 21, bpR: 17, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Cefprozil', disk: '30 µg', bpS: 18, bpR: 14, defaultConc: '30', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'Monobactams',
        antibiotics: [
          { name: 'Aztreonam', disk: '30 µg', bpS: 21, bpR: 17, defaultConc: '30', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'Carbapenems',
        antibiotics: [
          { name: 'Doripenem', disk: '10 µg', bpS: 23, bpR: 19, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Ertapenem', disk: '10 µg', bpS: 22, bpR: 18, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Imipenem', disk: '10 µg', bpS: 23, bpR: 19, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Meropenem', disk: '10 µg', bpS: 23, bpR: 19, defaultConc: '10', defaultUnit: 'µg' }
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
          { name: 'Gentamicin', disk: '10 µg', bpS: 15, bpR: 12, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Tobramycin', disk: '10 µg', bpS: 15, bpR: 12, defaultConc: '10', defaultUnit: 'µg' },
          { name: 'Amikacin', disk: '30 µg', bpS: 17, bpR: 14, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Kanamycin', disk: '30 µg', bpS: 18, bpR: 13, defaultConc: '30', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'Tetracyclines',
        antibiotics: [
          { name: 'Tetracycline', disk: '30 µg', bpS: 15, bpR: 11, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Doxycycline', disk: '30 µg', bpS: 14, bpR: 10, defaultConc: '30', defaultUnit: 'µg' },
          { name: 'Minocycline', disk: '30 µg', bpS: 16, bpR: 12, defaultConc: '30', defaultUnit: 'µg' }
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
          { name: 'Ciprofloxacin', disk: '5 µg', bpS: 21, bpR: 15, defaultConc: '5', defaultUnit: 'µg' },
          { name: 'Levofloxacin', disk: '5 µg', bpS: 17, bpR: 13, defaultConc: '5', defaultUnit: 'µg' }
        ]
      }
    ]
  },
  {
    name: 'Other Class Inhibitors',
    classes: [
      {
        name: 'Folate Pathway Inhibitors',
        antibiotics: [
          { name: 'Trimethoprim-sulfamethoxazole', disk: '1.25/23.75 µg', bpS: 16, bpR: 10, defaultConc: '1.25/23.75', defaultUnit: 'µg' }
        ]
      },
      {
        name: 'Nitrofurans (Urine only)',
        antibiotics: [
          { name: 'Nitrofurantoin', disk: '300 µg', bpS: 17, bpR: 14, defaultConc: '300', defaultUnit: 'µg' }
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
  disk: string;
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

  const determineResult = (val: number, s: number, r: number) => {
    if (isNaN(val) || isNaN(s) || isNaN(r)) return 'Intermediate';
    // Zone interpretation: Larger zone = more susceptible
    if (val >= s) return 'Susceptible';
    if (val <= r) return 'Resistant';
    return 'Intermediate';
  };

  const handleAddAST = () => {
    if(!selectedAntibiotic) return;
    
    // Find the antibiotic in the database to get its breakpoints
    const mech = ANTIBIOTIC_DB.find(m => m.name === selectedMech);
    const cls = mech?.classes.find(c => c.name === selectedClass);
    const drug = cls?.antibiotics.find(a => a.name === selectedAntibiotic);

    if (drug) {
      setAstEntries([...astEntries, {
        id: Date.now(),
        antibiotic: drug.name,
        disk: drug.disk,
        concValue: drug.defaultConc,
        concUnit: drug.defaultUnit,
        zone: 0,
        bpS: drug.bpS,
        bpR: drug.bpR,
        result: 'Resistant' // Default for 0mm zone
      }]);
    }
    
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
    const res = val <= s ? 'Susceptible' : val >= r ? 'Resistant' : 'Intermediate';

    setMicEntries([...micEntries, {
      id: Date.now(),
      antibiotic: micInput.antibiotic,
      micValue: val,
      bpS: s,
      bpR: r,
      result: res
    }]);
    setMicInput({ ...micInput, antibiotic: '', value: '', s: '', r: '' });
  };

  const loadSampleData = () => {
    if (astMode === 'DISK') {
        setAstEntries([
            { id: 1, antibiotic: 'Ampicillin', disk: '10 µg', concValue: '10', concUnit: 'µg', zone: 12, bpS: 17, bpR: 13, result: 'Resistant' },
            { id: 2, antibiotic: 'Ciprofloxacin', disk: '5 µg', concValue: '5', concUnit: 'µg', zone: 24, bpS: 21, bpR: 15, result: 'Susceptible' },
            { id: 3, antibiotic: 'Gentamicin', disk: '10 µg', concValue: '10', concUnit: 'µg', zone: 14, bpS: 15, bpR: 12, result: 'Intermediate' }
        ]);
    } else {
        setMicEntries([
            { id: 1, antibiotic: 'Vancomycin', micValue: 1, bpS: 2, bpR: 8, result: 'Susceptible' },
            { id: 2, antibiotic: 'Meropenem', micValue: 16, bpS: 1, bpR: 4, result: 'Resistant' }
        ]);
    }
  };

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
          <div key={tool.id} onClick={() => setActiveModule(tool.id as ToolModule)} className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-left">
            <div className={`w-12 h-12 ${tool.bg} ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><tool.icon size={24} /></div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">{tool.name}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{tool.desc}</p>
            <div className="flex items-center text-blue-600 text-sm font-bold">Launch Tool <ChevronRight size={16} /></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAST = () => (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4 text-left">
            <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600 border border-slate-200 bg-white shadow-sm"><ArrowLeft size={20} /></button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">AST Phenotype</h2>
                <p className="text-slate-500">CLSI M100-S25 Interpretive Engine</p>
            </div>
         </div>
         <button onClick={loadSampleData} className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-bold text-xs border border-teal-200 hover:bg-teal-100 flex items-center gap-2 transition-colors"><RefreshCw size={14}/> Load Sample Data</button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-8">
            <button onClick={() => setAstMode('DISK')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${astMode === 'DISK' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Disk Diffusion (Zone)</button>
            <button onClick={() => setAstMode('MIC')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${astMode === 'MIC' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>MIC Concentration</button>
         </div>

         {astMode === 'DISK' ? (
           <div className="space-y-8 text-left">
             {/* AUTOMATED SELECTION UI */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Mechanism</label>
                  <select 
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 shadow-sm" 
                    value={selectedMech} 
                    onChange={e => { setSelectedMech(e.target.value); setSelectedClass(''); setSelectedAntibiotic(''); }}
                  >
                    <option value="">Select Mechanism...</option>
                    {ANTIBIOTIC_DB.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Class</label>
                  <select 
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-slate-100 disabled:text-slate-400" 
                    disabled={!selectedMech} 
                    value={selectedClass} 
                    onChange={e => { setSelectedClass(e.target.value); setSelectedAntibiotic(''); }}
                  >
                    <option value="">Select Class...</option>
                    {selectedMech && ANTIBIOTIC_DB.find(m => m.name === selectedMech)?.classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">3. Antibiotic</label>
                  <select 
                    className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 shadow-sm disabled:bg-slate-100 disabled:text-slate-400" 
                    disabled={!selectedClass} 
                    value={selectedAntibiotic} 
                    onChange={e => setSelectedAntibiotic(e.target.value)}
                  >
                    <option value="">Select Drug...</option>
                    {selectedClass && ANTIBIOTIC_DB.find(m => m.name === selectedMech)?.classes.find(c => c.name === selectedClass)?.antibiotics.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAddAST} 
                    disabled={!selectedAntibiotic} 
                    className="w-full bg-teal-600 text-white font-black py-2.5 rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:grayscale uppercase text-xs tracking-widest"
                  >
                    <Plus size={18}/> Add to Panel
                  </button>
                </div>
             </div>

             {/* INTERACTIVE DATA TABLE */}
             <div className="overflow-hidden border border-slate-100 rounded-2xl shadow-inner">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Antibiotic</th>
                      <th className="p-4 text-center">Disk Content (Conc)</th>
                      <th className="p-4 text-center">Measured Zone (mm)</th>
                      <th className="p-4 text-center">Breakpoints (S | R)</th>
                      <th className="p-4 text-center">Category Result</th>
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {astEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{entry.antibiotic}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1">
                             <input 
                                type="text" 
                                className="w-16 p-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-mono text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                value={entry.concValue}
                                onChange={e => updateAST(entry.id, 'concValue', e.target.value)}
                             />
                             <input 
                                type="text" 
                                className="w-10 p-1.5 border border-slate-200 rounded-lg bg-white text-[11px] font-mono text-center focus:ring-2 focus:ring-teal-500 outline-none"
                                value={entry.concUnit}
                                onChange={e => updateAST(entry.id, 'concUnit', e.target.value)}
                             />
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-2">
                             <input 
                                type="number" 
                                min="0"
                                max="50"
                                className="w-20 p-2 border border-slate-200 rounded-lg bg-white text-sm font-black text-blue-600 focus:ring-2 focus:ring-blue-400 outline-none text-center shadow-sm" 
                                value={entry.zone || ''} 
                                onChange={e => updateAST(entry.id, 'zone', e.target.value)} 
                                placeholder="0"
                             />
                             <span className="text-xs text-slate-400 font-bold">mm</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <div className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-black border border-green-100">S: ≥{entry.bpS}</div>
                                <div className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-black border border-red-100">R: ≤{entry.bpR}</div>
                            </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm transition-all ${
                            entry.result === 'Resistant' ? 'bg-red-50 text-red-700 border-red-200' : 
                            entry.result === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {entry.result}
                          </span>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => setAstEntries(astEntries.filter(e => e.id !== entry.id))} 
                            className="text-slate-300 hover:text-red-500 transition-colors p-2"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {astEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-30">
                            <Scale size={48} />
                            <p className="text-slate-500 italic font-medium">Antibiotic panel is empty. Add drugs above to begin automated interpretation.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>

             {astEntries.length > 0 && (
                <div className="mt-8 p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                   <div className="flex items-center justify-between mb-8">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base"><BarChart2 className="text-teal-600"/> Resistance Spectrum Visualization</h3>
                       <div className="flex gap-4 text-[9px] font-black uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Susceptible</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Intermediate</span>
                          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Resistant</span>
                       </div>
                   </div>
                   <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={astEntries} layout="vertical" margin={{ left: 50, right: 80, bottom: 25, top: 10 }}>
                            <XAxis type="number" domain={[0, 40]} axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis dataKey="antibiotic" type="category" width={160} axisLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#475569' }} />
                            <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                            <Bar dataKey="zone" radius={[0, 8, 8, 0]} barSize={24}>
                               {astEntries.map((e, i) => <Cell key={i} fill={e.result === 'Resistant' ? '#ef4444' : e.result === 'Intermediate' ? '#f59e0b' : '#10b981'} />)}
                               <LabelList dataKey="zone" position="right" offset={15} fontSize={12} fontStyle="italic" fontWeight="black" fill="#334155" formatter={(v: number) => `${v} mm`} />
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             )}
           </div>
         ) : (
           <div className="space-y-8 text-left animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 items-end shadow-sm">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Antibiotic Selection</label>
                  <select className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500" value={micInput.antibiotic} onChange={e => setMicInput({...micInput, antibiotic: e.target.value})}>
                    <option value="">Select drug...</option>
                    {ANTIBIOTIC_DB.flatMap(m => m.classes).flatMap(c => c.antibiotics).map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MIC Value (µg/mL)</label>
                  <input type="number" className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 font-mono" value={micInput.value} onChange={e => setMicInput({...micInput, value: e.target.value})} placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">S (≤) | R (≥)</label>
                  <div className="flex gap-2">
                    <input type="number" className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-green-500 font-mono" value={micInput.s} onChange={e => setMicInput({...micInput, s: e.target.value})} placeholder="S ≤" />
                    <input type="number" className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-red-500 font-mono" value={micInput.r} onChange={e => setMicInput({...micInput, r: e.target.value})} placeholder="R ≥" />
                  </div>
                </div>
                <button onClick={addMIC} className="bg-teal-600 text-white font-black py-2.5 rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-100 transition-all text-xs tracking-widest uppercase">Add Result</button>
              </div>

              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                 <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase tracking-wider">
                    <tr><th className="p-4">Antibiotic</th><th className="p-4 text-center">MIC Value</th><th className="p-4 text-center">Interpretive Criteria</th><th className="p-4 text-center">Result</th><th className="p-4 w-10"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {micEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-slate-700">{entry.antibiotic}</td>
                        <td className="p-4 text-center font-mono font-black text-blue-600 text-lg">{entry.micValue}</td>
                        <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <div className="px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold">S: ≤{entry.bpS}</div>
                                <div className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-bold">R: ≥{entry.bpR}</div>
                            </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm ${
                            entry.result === 'Resistant' ? 'bg-red-50 text-red-700 border-red-200' : 
                            entry.result === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>{entry.result}</span>
                        </td>
                        <td className="p-4"><button onClick={() => setMicEntries(micEntries.filter(m => m.id !== entry.id))} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                    {micEntries.length === 0 && <tr><td colSpan={5} className="p-20 text-center text-slate-400 italic font-medium">MIC panel is empty.</td></tr>}
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
      
      {/* INTEGRATED FULL TOOLS WITH TOP NAVIGATION */}
      <Suspense
        fallback={
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            Loading bioinformatics module...
          </div>
        }
      >
        {activeModule === 'QC' && <NGSAnalysisTool onBack={() => setActiveModule('HUB')} />}
        {activeModule === 'PHYLO' && <PhylogenyAnalysis onBack={() => setActiveModule('HUB')} />}
        {activeModule === 'PCR' && <PCRAnalysisSuite onBack={() => setActiveModule('HUB')} />}
        {activeModule === 'PLASMID' && (
          <div className="space-y-6">
              <div className="flex items-center gap-4 text-left">
                  <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600 border border-slate-200 bg-white shadow-sm"><ArrowLeft size={20} /></button>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Plasmid Mapper</h2>
                      <p className="text-slate-500">Circular DNA Visualization Engine</p>
                  </div>
              </div>
              <PlasmidMapper />
          </div>
        )}
        {activeModule === 'METABOLIC' && (
          <div className="space-y-6">
              <div className="flex items-center gap-4 text-left">
                  <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600 border border-slate-200 bg-white shadow-sm"><ArrowLeft size={20} /></button>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Pathway Mapper</h2>
                      <p className="text-slate-500">Transcriptomic Flux Visualization</p>
                  </div>
              </div>
              <MetabolicPathwayMapper />
          </div>
        )}
        {activeModule === 'DOCKING' && (
          <div className="space-y-6 text-left">
              <div className="flex items-center gap-4">
                  <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600 border border-slate-200 bg-white shadow-sm"><ArrowLeft size={20} /></button>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800">Docking Viewer</h2>
                      <p className="text-slate-500">Structural Mutation &amp; Ligand Simulation</p>
                  </div>
              </div>
              <ProteinDockingViewer />
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default OpenToolkit;
