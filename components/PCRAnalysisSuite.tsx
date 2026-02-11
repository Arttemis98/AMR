import React from 'react';
import { Activity, CheckCircle, Settings, FileText, AlertCircle, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

export interface PCRProtocol {
  targetName: string;
  productSize: number;
  fwdPrimer: string;
  revPrimer: string;
  tm: number;
  cycles: number;
  cyclingProfile: { step: string; temp: number; time: string; stage: string }[];
  description?: string;
}

export interface QCData {
  conc: number;
  a260_280: number;
  a260_230: number;
}

// --- DATABASE OF PRIMERS (Fallback / Report View) ---
const PRIMER_DB = {
  'blaNDM-1': { 
    fwd: 'GGTTTGGCGATCTGGTTTTC', 
    rev: 'CGGAATGGCTCATCACGATC', 
    productSize: 621, 
    tm: 58,
    cycles: 30,
    desc: 'New Delhi Metallo-beta-lactamase (Carbapenem Resistance)' 
  },
  'mecA': { 
    fwd: 'TCCAGATTACAACTTCACCAgg', 
    rev: 'CCACTTCATATCTTGTAACG', 
    productSize: 162, 
    tm: 55,
    cycles: 35,
    desc: 'Methicillin Resistance (MRSA marker)' 
  },
  'tetA': { 
    fwd: 'GGTGTCGGGGCGCGTCAA', 
    rev: 'CGGTCGGTCGGTCGGTCG', 
    productSize: 954, 
    tm: 62,
    cycles: 30,
    desc: 'Tetracycline Efflux Pump' 
  },
  '16S rRNA': { 
    fwd: 'AGAGTTTGATCCTGGCTCAG', 
    rev: 'GGTTACCTTGTTACGACTT', 
    productSize: 1500, 
    tm: 55,
    cycles: 25,
    desc: 'Positive Control (Bacterial ID)' 
  }
};

// --- DEFAULT THERMOCYCLER DATA ---
const DEFAULT_CYCLING_DATA = [
  { step: 'Init Denat', temp: 95, time: '5:00', stage: 'Hold' },
  { step: 'Denature', temp: 95, time: '0:30', stage: 'Cycle' },
  { step: 'Anneal', temp: 58, time: '0:45', stage: 'Cycle' },
  { step: 'Extend', temp: 72, time: '1:00', stage: 'Cycle' },
  { step: 'Final Ext', temp: 72, time: '7:00', stage: 'Hold' },
  { step: 'Hold', temp: 4, time: '∞', stage: 'Hold' },
];

interface PCRAnalysisSuiteProps {
  geneTarget?: string; 
  customProtocol?: PCRProtocol;
  customQC?: QCData;
}

const PCRAnalysisSuite: React.FC<PCRAnalysisSuiteProps> = ({ geneTarget = 'blaNDM-1', customProtocol, customQC }) => {
  let displayData: PCRProtocol;

  if (customProtocol) {
      displayData = customProtocol;
  } else {
      // Logic for Report View (Look up from DB)
      let targetKey = 'blaNDM-1';
      if (geneTarget && PRIMER_DB[geneTarget as keyof typeof PRIMER_DB]) {
          targetKey = geneTarget;
      } else if (geneTarget && geneTarget.includes('blaNDM')) {
          targetKey = 'blaNDM-1';
      } else if (geneTarget && geneTarget.includes('mecA')) {
          targetKey = 'mecA';
      } else if (geneTarget && geneTarget.includes('tetA')) {
          targetKey = 'tetA';
      }

      const dbEntry = PRIMER_DB[targetKey as keyof typeof PRIMER_DB];
      
      // Update default cycling with specific Tm
      const cycling = DEFAULT_CYCLING_DATA.map(step => 
          step.step === 'Anneal' ? { ...step, temp: dbEntry.tm } : step
      );

      displayData = {
          targetName: targetKey,
          productSize: dbEntry.productSize,
          fwdPrimer: dbEntry.fwd,
          revPrimer: dbEntry.rev,
          tm: dbEntry.tm,
          cycles: dbEntry.cycles,
          cyclingProfile: cycling,
          description: dbEntry.desc
      };
  }
  
  // Use custom QC data if provided, else use mock data
  const qcData = customQC || { 
      conc: 145.2, 
      a260_280: 1.85, 
      a260_230: 2.10 
  };

  const calculateBandY = (bp: number) => {
      const ladder = [1500, 1000, 800, 600, 400, 200, 100];
      const yPositions = [50, 90, 130, 170, 210, 250, 290];
      
      if (bp >= 1500) return 50;
      if (bp <= 100) return 290;

      for (let i = 0; i < ladder.length - 1; i++) {
          if (bp <= ladder[i] && bp >= ladder[i+1]) {
             const range = ladder[i] - ladder[i+1];
             const offset = ladder[i] - bp;
             const frac = offset / range;
             return yPositions[i] + frac * (yPositions[i+1] - yPositions[i]);
          }
      }
      return 150; // Fallback
  };

  const bandY = calculateBandY(displayData.productSize);
  const isNoBand = displayData.productSize === 0;

  // QC Logic Helpers
  const isProteinContam = qcData.a260_280 < 1.8;
  const isSaltContam = qcData.a260_230 < 2.0;
  const isLowYield = qcData.conc < 10;
  const isGoodQC = !isProteinContam && !isSaltContam && !isLowYield;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. PRE-PCR QC */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <Activity className="text-teal-600" size={24} />
                <h3 className="font-bold text-slate-800">1. Quality Control (Nanodrop Spectrophotometry)</h3>
            </div>
            {!isGoodQC && (
                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                    <AlertTriangle size={12} /> Optimization Required
                </span>
            )}
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-4 rounded-lg border text-center ${isLowYield ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">Concentration</div>
               <div className="text-3xl font-mono font-bold text-slate-800">{qcData.conc} <span className="text-sm text-slate-400">ng/µL</span></div>
               {isLowYield ? (
                   <div className="mt-2 text-xs text-rose-600 flex items-center justify-center gap-1 font-bold">Low Yield (&lt;10)</div>
               ) : (
                   <div className="mt-2 text-xs text-green-600 flex items-center justify-center gap-1"><CheckCircle size={12}/> Yield OK</div>
               )}
            </div>
            <div className={`p-4 rounded-lg border text-center ${isProteinContam ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">A260/A280 (Purity)</div>
               <div className={`text-3xl font-mono font-bold ${!isProteinContam ? 'text-green-600' : 'text-amber-600'}`}>{qcData.a260_280}</div>
               {isProteinContam ? (
                   <div className="mt-2 text-xs text-amber-600 flex items-center justify-center gap-1 font-bold">Protein Contamination</div>
               ) : (
                   <div className="mt-2 text-xs text-slate-400">Target: 1.80 - 2.00</div>
               )}
            </div>
            <div className={`p-4 rounded-lg border text-center ${isSaltContam ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
               <div className="text-xs text-slate-500 uppercase font-bold mb-1">A260/A230 (Salts)</div>
               <div className={`text-3xl font-mono font-bold ${!isSaltContam ? 'text-slate-800' : 'text-amber-600'}`}>{qcData.a260_230}</div>
               {isSaltContam ? (
                   <div className="mt-2 text-xs text-amber-600 flex items-center justify-center gap-1 font-bold">Salt/Phenol Contamination</div>
               ) : (
                   <div className="mt-2 text-xs text-slate-400">Target: {'>'} 2.00</div>
               )}
            </div>
         </div>
      </div>

      {/* 2. PROTOCOL & CYCLING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="text-blue-600" size={24} />
              <h3 className="font-bold text-slate-800">2. Amplification Protocol</h3>
            </div>
            <div className="space-y-4 text-sm">
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Target Locus:</span>
                  <span className="font-mono font-bold text-blue-700">{displayData.targetName}</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Description:</span>
                  <span className="font-medium text-slate-800 text-right w-1/2">{displayData.description || 'Custom Amplification'}</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Expected Amplicon:</span>
                  <span className={`font-mono font-bold ${isNoBand ? 'text-red-500' : 'text-slate-800'}`}>
                      {isNoBand ? 'NO PRODUCT' : `${displayData.productSize} bp`}
                  </span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Primer (Fwd):</span>
                  <span className="font-mono text-xs text-slate-600 break-all">{displayData.fwdPrimer}</span>
               </div>
               <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Primer (Rev):</span>
                  <span className="font-mono text-xs text-slate-600 break-all">{displayData.revPrimer}</span>
               </div>
               <div className="flex justify-between pt-2">
                  <span className="text-slate-500">Cycling Condition:</span>
                  <span className="font-bold text-slate-800">{displayData.cycles} Cycles @ {displayData.tm}°C Annealing</span>
               </div>
            </div>
         </div>

         {/* Thermocycler Graph */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="font-bold text-slate-800 mb-4 text-sm">Thermocycler Profile</h3>
             <div className="h-48">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={displayData.cyclingProfile}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="step" tick={{fontSize: 10}} />
                   <YAxis domain={[0, 100]} hide />
                   <Tooltip />
                   <Line type="stepAfter" dataKey="temp" stroke="#2563eb" strokeWidth={2} dot={{r: 4}} />
                   <ReferenceLine y={displayData.tm} stroke="orange" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Anneal', fontSize: 10, fill: 'orange' }} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
         </div>
      </div>

      {/* 3. VIRTUAL GEL ELECTROPHORESIS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-2 mb-6">
            <FileText className="text-purple-600" size={24} />
            <h3 className="font-bold text-slate-800">3. Electrophoretic Separation (Agarose Gel)</h3>
         </div>
         
         <div className="flex flex-col md:flex-row gap-8 items-center justify-center bg-slate-900 p-8 rounded-xl shadow-inner">
            {/* The GEL SVG */}
            <svg width="300" height="400" className="bg-black/50 border-4 border-slate-700 rounded shadow-2xl">
               <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                     <feGaussianBlur stdDeviation="2" result="blur" />
                     <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
               </defs>
               
               {/* Wells */}
               <rect x="20" y="10" width="40" height="10" fill="#334155" />
               <rect x="80" y="10" width="40" height="10" fill="#334155" />
               <rect x="140" y="10" width="40" height="10" fill="#334155" />
               <rect x="200" y="10" width="40" height="10" fill="#334155" />

               {/* Labels */}
               <text x="40" y="35" fill="white" fontSize="10" textAnchor="middle">Ladder</text>
               <text x="100" y="35" fill="white" fontSize="10" textAnchor="middle">Neg Ctrl</text>
               <text x="160" y="35" fill="white" fontSize="10" textAnchor="middle">Sample</text>
               <text x="220" y="35" fill="white" fontSize="10" textAnchor="middle">Pos Ctrl</text>

               {/* LADDER BANDS */}
               {[1500, 1000, 800, 600, 400, 200, 100].map((bp, i) => (
                  <g key={i}>
                     <rect x="25" y={50 + i * 40} width="30" height="2" fill="white" opacity="0.4" />
                     <text x="15" y={54 + i * 40} fill="white" fontSize="8" textAnchor="end">{bp}</text>
                  </g>
               ))}

               {/* SAMPLE BAND */}
               {!isNoBand && (
                   <>
                    <rect x="145" y={bandY} width="30" height="4" fill="#38bdf8" filter="url(#glow)" />
                    <rect x="205" y={bandY} width="30" height="4" fill="#38bdf8" filter="url(#glow)" opacity="0.8" />
                    <text x="255" y={bandY + 4} fill="#38bdf8" fontSize="10" fontWeight="bold">◄ {displayData.productSize} bp</text>
                   </>
               )}
               
               {/* Primer Dimers */}
               <ellipse cx="160" cy="350" rx="15" ry="5" fill="white" opacity="0.2" filter="url(#glow)" />
               <ellipse cx="220" cy="350" rx="15" ry="5" fill="white" opacity="0.2" filter="url(#glow)" />

            </svg>

            {/* Interpretation Panel */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-white border border-white/20 w-full md:w-auto">
               <h4 className={`font-bold flex items-center gap-2 mb-2 ${isNoBand ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isNoBand ? <AlertCircle size={16}/> : <CheckCircle size={16} />} 
                  Result: {isNoBand ? 'NEGATIVE' : 'POSITIVE'}
               </h4>
               <p className="text-xs text-slate-300 mb-4 max-w-xs">
                  {isNoBand 
                    ? "No amplification observed. Primers did not anneal within range." 
                    : `A distinct band was observed at ~${displayData.productSize} bp in the sample lane.`}
               </p>
               <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-x-4 gap-y-1">
                  <span>Target:</span> <span className="text-white">{displayData.targetName}</span>
                  <span>Lane 1:</span> <span>100bp Ladder</span>
                  <span>Lane 2:</span> <span>NTC (Water)</span>
                  <span>Lane 3:</span> <span className={`${isNoBand ? 'text-slate-400' : 'text-emerald-300'} font-bold`}>Isolate DNA</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PCRAnalysisSuite;