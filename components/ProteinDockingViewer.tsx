import React, { useState } from 'react';
import { Box, RefreshCw, Zap, Shield, Info, UploadCloud, Search, Play, ArrowRight, ArrowLeft } from 'lucide-react';

const ProteinDockingViewer: React.FC = () => {
  const [view, setView] = useState<'UPLOAD' | 'ANALYSIS'>('UPLOAD');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  // Existing state
  const [target, setTarget] = useState('Gyrase');
  const [isMutant, setIsMutant] = useState(true); // Default to mutant after upload for "What it is now"

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setFileName(e.target.files[0].name);
        setIsUploading(true);
        // Simulate processing
        setTimeout(() => {
            setIsUploading(false);
            setView('ANALYSIS');
            setIsMutant(true); // Auto-detect mutation
        }, 2000);
    }
  };

  const handleLoadSample = () => {
      setFileName("demo_gyrA_D87N.pdb");
      setIsUploading(true);
      setTimeout(() => {
          setIsUploading(false);
          setView('ANALYSIS');
          setIsMutant(true);
      }, 1500);
  };

  const renderUpload = () => (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center animate-fade-in max-w-4xl mx-auto mt-8">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3 mb-2">
                <Box className="text-cyan-600" size={32}/> Protein Structure Analysis
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
                Upload a protein sequence (FASTA) or structure file (PDB) to analyze binding pocket integrity and detect resistance-conferring mutations via molecular docking simulation.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FILE UPLOAD CARD */}
            <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center relative min-h-[280px] group hover:bg-cyan-50 hover:border-cyan-300 transition-all">
                <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={handleFileUpload} 
                    accept=".fasta,.fa,.pdb,.txt"
                    disabled={isUploading}
                />
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <RefreshCw className="text-cyan-600 animate-spin mb-4" size={48}/>
                        <span className="font-bold text-slate-700 text-lg">Analyzing Structure...</span>
                        <span className="text-slate-500 mt-2">Modeling ligand interaction & identifying SNPs</span>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
                            <UploadCloud size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Upload Protein Data</h3>
                        <p className="text-slate-500 mb-6 text-sm">Drag & drop .FASTA or .PDB files</p>
                        <span className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm group-hover:border-cyan-200 group-hover:text-cyan-700">
                            Select File
                        </span>
                    </>
                )}
            </div>

            {/* DEMO CARD */}
            <div 
                onClick={handleLoadSample}
                className="border-2 border-transparent bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all min-h-[280px] relative overflow-hidden"
            >
                {!isUploading && (
                    <>
                        <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                            SAMPLE DATA
                        </div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 mb-6 shadow-sm">
                            <Play size={32} className="ml-1"/>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-2">Load Demo Structure</h3>
                        <p className="text-slate-500 mb-6 text-sm max-w-[200px] text-center">
                            Visualize <strong>Fluoroquinolone Resistance</strong> in <em>E. coli</em> (GyrA D87N Mutation)
                        </p>
                        <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-100">
                            View Simulation <ArrowRight size={16}/>
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
  );

  const renderAnalysis = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      
      {/* VISUALIZER PANEL */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
         <div className="flex justify-between w-full mb-6 items-center">
            <div>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Box className="text-indigo-600"/> Molecular Docking Simulation
                </h3>
                <p className="text-xs text-slate-500 mt-1">Target: {target === 'Gyrase' ? 'DNA Gyrase (gyrA)' : 'PBP2a (mecA)'}</p>
            </div>
            <div className="flex gap-2 text-xs">
               <button onClick={() => setTarget('Gyrase')} className={`px-3 py-1 rounded-full border ${target==='Gyrase' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'text-slate-500'}`}>DNA Gyrase</button>
               <button onClick={() => setTarget('PBP')} className={`px-3 py-1 rounded-full border ${target==='PBP' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'text-slate-500'}`}>PBP (Beta-Lactam)</button>
            </div>
         </div>

         {/* THE DOCKING CANVAS */}
         <div className="relative w-80 h-80 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 300 300" className="w-full h-full">
               {/* Definitions for filters */}
               <defs>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                     <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#cbd5e1"/>
                  </filter>
               </defs>

               {/* 1. PROTEIN SURFACE (The Receptor) */}
               <path 
                  d={isMutant 
                     ? "M 50 150 Q 100 150 120 120 L 150 100 L 180 120 Q 200 150 250 150 L 250 250 L 50 250 Z" // MUTANT (Shallower/Blocked)
                     : "M 50 150 Q 100 150 120 180 L 150 200 L 180 180 Q 200 150 250 150 L 250 250 L 50 250 Z" // WILD TYPE (Deep Pocket)
                  } 
                  fill="#e2e8f0" 
                  stroke="#94a3b8" 
                  strokeWidth="2"
                  className="transition-all duration-1000 ease-in-out"
               />
               <text x="150" y="270" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="bold">
                  {target === 'Gyrase' ? 'DNA Gyrase (Subunit A)' : 'Penicillin Binding Protein'}
               </text>

               {/* 2. THE MUTATION (The Blocker) */}
               {isMutant && (
                  <g className="animate-bounce">
                     <circle cx="150" cy="130" r="15" fill="#ef4444" opacity="0.8" />
                     <text x="150" y="134" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">D87N</text>
                  </g>
               )}

               {/* 3. THE ANTIBIOTIC (The Ligand) */}
               <g 
                  className="transition-all duration-1000 ease-in-out"
                  transform={isMutant ? "translate(0, -60) rotate(15, 150, 150)" : "translate(0, 0)"} // Mutant: Float away. WT: Sit in pocket.
               >
                  <path 
                     d="M 130 140 L 150 160 L 170 140 L 160 110 L 140 110 Z" 
                     fill="#3b82f6" 
                     stroke="#1d4ed8" 
                     strokeWidth="2"
                     filter="url(#shadow)"
                  />
                  <text x="150" y="135" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Cipro</text>
               </g>

               {/* STATUS INDICATOR */}
               <g transform="translate(10, 10)">
                  {isMutant ? (
                     <>
                        <circle cx="10" cy="10" r="5" fill="#ef4444" />
                        <text x="20" y="14" fontSize="10" fontWeight="bold" fill="#ef4444">RESISTANT (No Binding)</text>
                     </>
                  ) : (
                     <>
                        <circle cx="10" cy="10" r="5" fill="#10b981" />
                        <text x="20" y="14" fontSize="10" fontWeight="bold" fill="#10b981">SENSITIVE (Bound)</text>
                     </>
                  )}
               </g>
            </svg>
         </div>

         {/* CONTROLS */}
         <div className="mt-6 flex gap-4 w-full">
            <button 
               onClick={() => setIsMutant(false)} 
               className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center border-2 ${!isMutant ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
            >
               <span>Wild Type Reference</span>
               <span className="text-[10px] font-normal">What it should be</span>
            </button>
            <button 
               onClick={() => setIsMutant(true)} 
               className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex flex-col items-center justify-center border-2 ${isMutant ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
            >
               <span>Identified Variant</span>
               <span className="text-[10px] font-normal">What it is now (Upload)</span>
            </button>
         </div>
      </div>

      {/* INFO PANEL */}
      <div className="space-y-6">
         {/* Analysis Header */}
         <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 flex items-start gap-3">
            <Search className="text-blue-600 mt-1" size={20} />
            <div>
                <h3 className="font-bold text-blue-900">Analysis Complete</h3>
                <p className="text-sm text-blue-800">
                    File <strong>{fileName}</strong> processed. A critical structural variation was detected in the Quinologone Resistance Determining Region (QRDR).
                </p>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Info className="text-blue-600" size={20}/> Biophysical Mechanism
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
               <strong>Ciprofloxacin</strong> targets the DNA Gyrase enzyme. It normally fits into a specific binding pocket, stabilizing the DNA-cleavage complex.
            </p>
            <div className="p-4 bg-slate-50 border-l-4 border-slate-400 rounded text-sm">
               <strong>Normal Interaction:</strong> The drug relies on a "Water-Metal Ion Bridge" anchored by residues Ser83 and Asp87.
            </div>
         </div>

         <div className={`p-6 rounded-xl border shadow-sm transition-colors ${isMutant ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${isMutant ? 'text-red-800' : 'text-green-800'}`}>
               {isMutant ? <Shield size={20}/> : <Zap size={20}/>}
               {isMutant ? 'Detected: Steric Hindrance' : 'Reference: Susceptible Conformation'}
            </h3>
            <p className={`text-sm ${isMutant ? 'text-red-700' : 'text-green-700'}`}>
               {isMutant 
                  ? "The uploaded sequence contains the D87N mutation (Aspartate → Asparagine). The large side chain of Asparagine physically blocks the binding pocket, preventing the antibiotic from docking. This results in high-level resistance." 
                  : "In the wild-type conformation, the binding pocket is open and accessible. Ciprofloxacin docks with high affinity (Kd < 0.1 µM), effectively inhibiting bacterial replication."}
            </p>
         </div>
         
         <button onClick={() => setView('UPLOAD')} className="flex items-center gap-1 text-slate-500 text-sm hover:text-slate-800 hover:underline">
            <ArrowLeft size={16}/> Upload different file
         </button>
      </div>
    </div>
  );

  return view === 'UPLOAD' ? renderUpload() : renderAnalysis();
};

export default ProteinDockingViewer;