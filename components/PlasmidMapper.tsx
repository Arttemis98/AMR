import React, { useState } from 'react';
import { Disc, Plus, Trash2, Save, FileCode, UploadCloud, Play, CheckCircle, Dna, Activity, Search } from 'lucide-react';

interface PlasmidFeature {
  id: string;
  name: string;
  start: number; // Base pairs
  end: number;   // Base pairs
  strand: 1 | -1;
  color: string;
  type: 'RESISTANCE' | 'ORIGIN' | 'VIRULENCE' | 'REGULATOR' | 'OTHER';
  function?: string;
  identity?: number;
}

const MOCK_ANALYSIS_RESULTS: PlasmidFeature[] = [
  { id: '1', name: 'blaNDM-1', start: 150, end: 980, strand: 1, color: '#ef4444', type: 'RESISTANCE', function: 'Carbapenem hydrolysis (Metallo-beta-lactamase)', identity: 99.9 },
  { id: '2', name: 'repA', start: 1200, end: 1800, strand: 1, color: '#3b82f6', type: 'ORIGIN', function: 'Plasmid replication initiation', identity: 98.5 },
  { id: '3', name: 'parA', start: 1900, end: 2400, strand: -1, color: '#8b5cf6', type: 'REGULATOR', function: 'Plasmid partitioning', identity: 95.2 },
  { id: '4', name: 'tet(A)', start: 3100, end: 3800, strand: -1, color: '#f59e0b', type: 'RESISTANCE', function: 'Tetracycline efflux pump', identity: 100 },
  { id: '5', name: 'traF', start: 4100, end: 4600, strand: 1, color: '#10b981', type: 'VIRULENCE', function: 'Conjugative transfer', identity: 92.1 },
];

const PlasmidMapper: React.FC = () => {
  const [mode, setMode] = useState<'MANUAL' | 'SEQUENCE'>('SEQUENCE');
  const [plasmidName, setPlasmidName] = useState('pAMR_Vadodara_01');
  const [size, setSize] = useState(5000); // Base pairs
  const [sequence, setSequence] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  
  const [features, setFeatures] = useState<PlasmidFeature[]>([
    { id: '1', name: 'blaNDM-1', start: 150, end: 980, strand: 1, color: '#ef4444', type: 'RESISTANCE' },
    { id: '2', name: 'OriC', start: 2000, end: 2200, strand: 1, color: '#3b82f6', type: 'ORIGIN' },
  ]);

  // Helper to draw arcs based on BP
  const describeArc = (x: number, y: number, radius: number, startBp: number, endBp: number) => {
    // Convert BP to Degrees
    const startAngle = (startBp / size) * 360;
    const endAngle = (endBp / size) * 360;
    
    // SVG coordinate conversion
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    
    const arcLength = endAngle - startAngle;
    const largeArcFlag = arcLength <= 180 ? "0" : "1";
    
    return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const handleAnalyze = () => {
      if (!sequence && mode === 'SEQUENCE') {
          alert("Please enter a sequence or upload a file.");
          return;
      }
      setIsAnalyzing(true);
      
      // Simulate API processing time
      setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisDone(true);
          setFeatures(MOCK_ANALYSIS_RESULTS);
          setSize(5200); // Update size based on "actual" sequence
      }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setPlasmidName(e.target.files[0].name.split('.')[0]);
          setSequence(">Mock_Sequence_Loaded\nATGCGT...");
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
       {/* TOP CONTROLS */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: MAP VISUALIZER */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative min-h-[400px]">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 absolute top-6 left-6">
                    <Disc className="text-purple-600"/> Plasmid Map: {plasmidName}
                </h3>
                
                {isAnalyzing ? (
                    <div className="flex flex-col items-center">
                        <Activity className="text-purple-600 animate-spin mb-4" size={48} />
                        <p className="text-slate-600 font-medium">Annotating Sequence...</p>
                        <p className="text-slate-400 text-xs mt-1">Finding ORFs and Resistance Genes</p>
                    </div>
                ) : (
                    <div className="relative w-80 h-80">
                        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                            {/* Backbone */}
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                            
                            {/* Features */}
                            {features.map(feat => (
                                <g key={feat.id} className="group cursor-pointer hover:opacity-80">
                                    <path 
                                    d={describeArc(100, 100, 80, feat.start, feat.end)} 
                                    fill="none" 
                                    stroke={feat.color} 
                                    strokeWidth="12"
                                    className="transition-all"
                                    />
                                    {/* Arrowhead simulation for strand direction could go here */}
                                </g>
                            ))}
                        </svg>
                        {/* Center Text (Not rotated) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-slate-700 font-bold text-sm">{plasmidName}</div>
                            <div className="text-slate-500 text-xs">{size} bp</div>
                            <div className="text-slate-400 text-[10px] mt-1">{features.length} Features</div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 mt-8 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Resistance</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Origin</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded-full"></div> Regulator</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Virulence</span>
                </div>
            </div>

            {/* RIGHT: INPUT & CONFIG */}
            <div className="space-y-6">
                {/* MODE TABS */}
                <div className="bg-slate-100 p-1 rounded-lg inline-flex">
                    <button 
                        onClick={() => setMode('SEQUENCE')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'SEQUENCE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Sequence Analysis (AI)
                    </button>
                    <button 
                        onClick={() => setMode('MANUAL')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${mode === 'MANUAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Manual Configuration
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    {mode === 'SEQUENCE' ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">Input Plasmid Sequence</h3>
                                <label className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-bold cursor-pointer hover:bg-indigo-100 flex items-center gap-1">
                                    <UploadCloud size={14}/> Upload FASTA
                                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".fasta,.fa,.txt"/>
                                </label>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plasmid Name</label>
                                <input 
                                    type="text" 
                                    value={plasmidName} 
                                    onChange={e => setPlasmidName(e.target.value)} 
                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Raw Sequence (FASTA)</label>
                                <textarea 
                                    value={sequence} 
                                    onChange={e => { setSequence(e.target.value); setSize(e.target.value.length || 5000); }}
                                    className="w-full h-32 p-3 border border-slate-300 rounded-lg text-xs font-mono bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder=">Plasmid_01&#10;ATGCGT..."
                                />
                            </div>

                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !sequence}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold shadow-md hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isAnalyzing ? 'Processing...' : <><Search size={18}/> Analyze Plasmid</>}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800">Manual Feature Editor</h3>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Total Size (bp)</label>
                                <input 
                                    type="number" 
                                    value={size} 
                                    onChange={e => setSize(Number(e.target.value))} 
                                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900" 
                                />
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50">
                                {features.map(feat => (
                                    <div key={feat.id} className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 text-sm shadow-sm">
                                        <div>
                                            <span className="font-bold text-slate-800 block">{feat.name}</span>
                                            <span className="text-xs text-slate-500">{feat.start} - {feat.end} bp</span>
                                        </div>
                                        <button onClick={() => setFeatures(features.filter(f => f.id !== feat.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2">
                                <Plus size={16}/> Add Feature Manually
                            </button>
                        </div>
                    )}
                </div>
            </div>
       </div>

       {/* DETAILED ANALYSIS TABLE (Shown after analysis) */}
       {(analysisDone || mode === 'MANUAL') && (
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center gap-2">
                    <FileCode className="text-blue-600" size={24} />
                    <div>
                        <h3 className="font-bold text-slate-800">Plasmid Annotation Table</h3>
                        <p className="text-xs text-slate-500">Detected Open Reading Frames (ORFs) and Resistance Factors</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-4">Feature Name</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Location (bp)</th>
                                <th className="p-4">Strand</th>
                                <th className="p-4">Predicted Function</th>
                                <th className="p-4">% Identity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {features.map((feat) => (
                                <tr key={feat.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-mono font-bold text-slate-800">{feat.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            feat.type === 'RESISTANCE' ? 'bg-red-100 text-red-700' :
                                            feat.type === 'ORIGIN' ? 'bg-blue-100 text-blue-700' :
                                            feat.type === 'REGULATOR' ? 'bg-purple-100 text-purple-700' :
                                            feat.type === 'VIRULENCE' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {feat.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 font-mono text-xs">
                                        {feat.start} .. {feat.end} <span className="text-slate-400">({feat.end - feat.start} bp)</span>
                                    </td>
                                    <td className="p-4">
                                        {feat.strand === 1 ? <span className="text-slate-400">Forward (+)</span> : <span className="text-slate-400">Reverse (-)</span>}
                                    </td>
                                    <td className="p-4 text-slate-800">
                                        {feat.function || 'Hypothetical Protein'}
                                    </td>
                                    <td className="p-4">
                                        {feat.identity ? <span className="text-green-600 font-bold">{feat.identity}%</span> : <span className="text-slate-400">-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           </div>
       )}
    </div>
  );
};
export default PlasmidMapper;