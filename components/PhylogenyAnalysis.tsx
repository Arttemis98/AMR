import React, { useState } from 'react';
import { Network, Search, Activity, FileText, Settings, ChevronRight, Check, ArrowLeft } from 'lucide-react';

// --- MOCK BLAST DATA ---
const BLAST_HITS = [
  { accession: 'NR_026078.1', desc: 'Pseudomonas aeruginosa strain DSM 50071', score: 2860, cover: '100%', evalue: '0.0', identity: 99.93, distance: 0.001 },
  { accession: 'NR_117678.1', desc: 'Pseudomonas otitidis strain MCC10330', score: 2750, cover: '99%', evalue: '0.0', identity: 98.45, distance: 0.015 },
  { accession: 'NR_114471.1', desc: 'Pseudomonas resinovorans strain LMG 2274', score: 2680, cover: '99%', evalue: '2e-150', identity: 97.20, distance: 0.028 },
  { accession: 'NR_043289.1', desc: 'Pseudomonas alcaligenes strain NBRC 14159', score: 2540, cover: '98%', evalue: '5e-120', identity: 95.50, distance: 0.045 },
  { accession: 'NR_074828.1', desc: 'Escherichia coli strain U 5/41 (Outgroup)', score: 1200, cover: '85%', evalue: '4e-50', identity: 82.10, distance: 0.180 },
];

interface PhylogenyAnalysisProps {
  onBack?: () => void;
}

const PhylogenyAnalysis: React.FC<PhylogenyAnalysisProps> = ({ onBack }) => {
  const [step, setStep] = useState(1);
  const [sequence, setSequence] = useState('>Sample_WWTP_01\nAGTCGAGCGGATGAAGGGAGCTTGCTCCTGGATTCAGCGGCGGACGGGTGAGTAATGCCT...');
  const [selectedHits, setSelectedHits] = useState<string[]>(BLAST_HITS.map(h => h.accession));
  const [treeLayout, setTreeLayout] = useState<'Rectangular' | 'Radial'>('Rectangular');

  // STEP 1: INPUT
  const renderInput = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4">1. Sequence Input & Database</h3>
          <textarea 
            value={sequence}
            onChange={(e) => setSequence(e.target.value)}
            className="w-full h-40 p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Paste FASTA sequence here..."
          />
          <div className="flex gap-4 mt-4">
             <select className="p-2 bg-white border border-slate-200 rounded text-sm flex-1">
                <option>16S ribosomal RNA (Bacteria and Archaea)</option>
                <option>Standard Nucleotide Collection (nr/nt)</option>
                <option>Whole Genome Shotgun (wgs)</option>
             </select>
             <button 
               onClick={() => setStep(2)}
               className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-bold"
             >
               <Search size={16} /> BLAST
             </button>
          </div>
       </div>
    </div>
  );

  // STEP 2: BLAST TABLE
  const renderBlast = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">2. BLAST Results (Homology Search)</h3>
             <button onClick={() => setStep(3)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-bold flex items-center gap-2">
                Build Tree <ChevronRight size={16}/>
             </button>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                   <tr>
                      <th className="p-3 w-10"><input type="checkbox" checked readOnly/></th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Max Score</th>
                      <th className="p-3">E-value</th>
                      <th className="p-3">Per. Ident</th>
                      <th className="p-3">Accession</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {/* USER SAMPLE ROW */}
                   <tr className="bg-blue-50">
                      <td className="p-3"><Check size={16} className="text-blue-600"/></td>
                      <td className="p-3 font-bold text-blue-800">Your Input Sequence (Unknown Isolate)</td>
                      <td className="p-3">-</td>
                      <td className="p-3">-</td>
                      <td className="p-3">100%</td>
                      <td className="p-3">Query</td>
                   </tr>
                   {BLAST_HITS.map((hit) => (
                      <tr key={hit.accession} className="hover:bg-slate-50">
                         <td className="p-3"><input type="checkbox" checked={selectedHits.includes(hit.accession)} onChange={()=>{}} /></td>
                         <td className="p-3 text-slate-700 font-medium">{hit.desc}</td>
                         <td className="p-3">{hit.score}</td>
                         <td className="p-3">{hit.evalue}</td>
                         <td className="p-3">{hit.identity}%</td>
                         <td className="p-3 text-blue-600 hover:underline cursor-pointer">{hit.accession}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  // STEP 3: TREE VISUALIZATION
  const renderTree = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* TREE PANEL */}
           <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="font-bold text-slate-800">Phylogenetic Tree Reconstruction</h3>
                    <p className="text-xs text-slate-500">Method: Neighbor-Joining (NJ) • Model: Jukes-Cantor • Bootstrap: 1000 reps</p>
                 </div>
                 <div className="flex bg-slate-100 rounded p-1">
                    <button onClick={()=>setTreeLayout('Rectangular')} className={`px-3 py-1 text-xs rounded ${treeLayout==='Rectangular' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500'}`}>Rectangular</button>
                    <button onClick={()=>setTreeLayout('Radial')} className={`px-3 py-1 text-xs rounded ${treeLayout==='Radial' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500'}`}>Radial</button>
                 </div>
              </div>
              
              <div className="border border-slate-100 rounded-lg p-4 bg-white flex justify-center h-[500px]">
                 {/* SVG TREE DRAWING */}
                 <svg viewBox="0 0 500 400" className="w-full h-full">
                    {/* Scale Bar */}
                    <line x1="20" y1="380" x2="70" y2="380" stroke="black" strokeWidth="2" />
                    <text x="45" y="395" fontSize="10" textAnchor="middle">0.02</text>
                    
                    {/* Root to E. coli */}
                    <path d="M 20 200 L 50 200" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                    {/* Branch Outgroup */}
                    <path d="M 50 200 L 50 350 L 100 350" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                    <text x="105" y="353" fontSize="12" fill="#64748b" fontStyle="italic">E. coli U 5/41</text>

                    {/* Branch Ingroup Main */}
                    <path d="M 50 200 L 50 100 L 100 100" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="45" y="150" fontSize="10" fontWeight="bold">100</text> {/* Bootstrap */}

                    {/* Split 1 */}
                    <path d="M 100 100 L 100 50 L 150 50" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="105" y="80" fontSize="10" fontWeight="bold">98</text>

                    {/* P. alcaligenes */}
                    <path d="M 150 50 L 250 50" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="255" y="53" fontSize="12" fill="#334155" fontStyle="italic">P. alcaligenes NBRC 14159</text>

                    {/* Split 2 (User Sample Cluster) */}
                    <path d="M 100 100 L 100 250 L 150 250" stroke="#334155" strokeWidth="2" fill="none" />
                    
                    {/* P. resinovorans */}
                    <path d="M 150 250 L 150 300 L 280 300" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="285" y="303" fontSize="12" fill="#334155" fontStyle="italic">P. resinovorans LMG 2274</text>

                    {/* The Tight Cluster */}
                    <path d="M 150 250 L 150 180 L 200 180" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="155" y="220" fontSize="10" fontWeight="bold">99</text>

                    {/* P. otitidis */}
                    <path d="M 200 180 L 200 220 L 320 220" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="325" y="223" fontSize="12" fill="#334155" fontStyle="italic">P. otitidis MCC10330</text>

                    {/* USER SAMPLE & PAO1 */}
                    <path d="M 200 180 L 200 140 L 250 140" stroke="#ef4444" strokeWidth="3" fill="none" />
                    
                    {/* PAO1 */}
                    <path d="M 250 140 L 250 160 L 380 160" stroke="#334155" strokeWidth="2" fill="none" />
                    <text x="385" y="163" fontSize="12" fill="#334155" fontStyle="italic">P. aeruginosa PAO1</text>

                    {/* USER SAMPLE */}
                    <path d="M 250 140 L 250 120 L 380 120" stroke="#ef4444" strokeWidth="3" fill="none" />
                    <circle cx="380" cy="120" r="4" fill="#ef4444" />
                    <text x="390" y="123" fontSize="12" fontWeight="bold" fill="#ef4444">Sample_WWTP_01 (Query)</text>
                 </svg>
              </div>
           </div>

           {/* MATRIX & INFO PANEL */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                 <h3 className="font-bold text-slate-800 mb-4">Distance Matrix</h3>
                 <p className="text-xs text-slate-500 mb-2">Pairwise evolutionary distance (substitutions per site).</p>
                 <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                       <thead>
                          <tr className="border-b"><th className="p-2">ID</th><th className="p-2">1</th><th className="p-2">2</th><th className="p-2">3</th></tr>
                       </thead>
                       <tbody className="divide-y">
                          <tr><td className="font-bold p-2">Query</td><td className="bg-slate-100 p-2">-</td><td className="p-2">0.001</td><td className="p-2">0.015</td></tr>
                          <tr><td className="font-bold p-2">PAO1</td><td className="p-2">0.001</td><td className="bg-slate-100 p-2">-</td><td className="p-2">0.014</td></tr>
                          <tr><td className="font-bold p-2">Otitidis</td><td className="p-2">0.015</td><td className="p-2">0.014</td><td className="bg-slate-100 p-2">-</td></tr>
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                 <div className="flex items-center gap-2 mb-2">
                    <Activity className="text-blue-600" size={20}/>
                    <h3 className="font-bold text-blue-800">Interpretation</h3>
                 </div>
                 <p className="text-sm text-blue-900 leading-relaxed">
                    The query sequence clusters tightly with <em>P. aeruginosa</em> strain DSM 50071 / PAO1 with <strong>99% Bootstrap support</strong>.
                 </p>
                 <div className="mt-4 pt-4 border-t border-blue-200 text-xs text-blue-800">
                    <strong>Conclusion:</strong> Confirmed ID as <em>Pseudomonas aeruginosa</em>.
                 </div>
              </div>
           </div>
        </div>
     </div>
  );

  return (
    <div className="min-h-[600px] animate-fade-in">
       <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                    <ArrowLeft size={20} />
                </button>
             )}
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Network className="text-purple-600" /> Molecular Phylogeny & ID
             </h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
             <span className={`px-3 py-1 rounded-full ${step>=1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1. Input</span>
             <div className="w-8 h-px bg-slate-300"></div>
             <span className={`px-3 py-1 rounded-full ${step>=2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2. BLAST</span>
             <div className="w-8 h-px bg-slate-300"></div>
             <span className={`px-3 py-1 rounded-full ${step>=3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3. Tree</span>
          </div>
       </div>

       {step === 1 && renderInput()}
       {step === 2 && renderBlast()}
       {step === 3 && renderTree()}
    </div>
  );
};

export default PhylogenyAnalysis;