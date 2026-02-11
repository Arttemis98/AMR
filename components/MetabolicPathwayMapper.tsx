import React, { useState } from 'react';
import { Activity, ArrowRight, RefreshCw, GitMerge, FileText, UploadCloud, Play, ArrowLeft, CheckCircle, Table, Layers, ZoomIn } from 'lucide-react';

// --- MOCK DATA: Detailed Transcriptome & Pathway Data ---
const DEMO_TRANSCRIPTOME = [
  { id: 'murA', name: 'murA', fc: 0.8, pval: 0.45, status: 'NS', desc: 'UDP-N-acetylglucosamine 1-carboxyvinyltransferase', pathway: 'Early Synthesis' },
  { id: 'murC', name: 'murC', fc: 1.1, pval: 0.32, status: 'NS', desc: 'L-alanine adding enzyme', pathway: 'Early Synthesis' },
  { id: 'murD', name: 'murD', fc: 0.9, pval: 0.51, status: 'NS', desc: 'D-glutamate adding enzyme', pathway: 'Early Synthesis' },
  { id: 'murE', name: 'murE', fc: 1.0, pval: 0.88, status: 'NS', desc: 'Meso-diaminopimelate adding enzyme', pathway: 'Early Synthesis' },
  { id: 'murF', name: 'murF', fc: 1.2, pval: 0.21, status: 'NS', desc: 'D-alanyl-D-alanine adding enzyme', pathway: 'Late Synthesis' },
  { id: 'ddl', name: 'ddl', fc: -2.8, pval: 0.001, status: 'DOWN', desc: 'D-Ala-D-Ala ligase (Host target)', pathway: 'Target Synthesis' },
  { id: 'vanS', name: 'vanS', fc: 3.5, pval: 0.008, status: 'UP', desc: 'Sensor histidine kinase (Membrane)', pathway: 'Regulation' },
  { id: 'vanR', name: 'vanR', fc: 3.1, pval: 0.010, status: 'UP', desc: 'Response regulator (Transcription Factor)', pathway: 'Regulation' },
  { id: 'vanH', name: 'vanH', fc: 5.8, pval: 0.00001, status: 'UP', desc: 'D-lactate dehydrogenase', pathway: 'Resistance Shunt' },
  { id: 'vanA', name: 'vanA', fc: 6.4, pval: 0.00001, status: 'UP', desc: 'D-Ala-D-Lac ligase (Alternative)', pathway: 'Resistance Shunt' },
  { id: 'vanX', name: 'vanX', fc: 4.9, pval: 0.0005, status: 'UP', desc: 'D-Ala-D-Ala dipeptidase (Cleavage)', pathway: 'Target Removal' },
  { id: 'vanY', name: 'vanY', fc: 2.1, pval: 0.045, status: 'UP', desc: 'D,D-carboxypeptidase', pathway: 'Target Removal' },
];

const MetabolicPathwayMapper: React.FC = () => {
  const [view, setView] = useState<'UPLOAD' | 'ANALYSIS'>('UPLOAD');
  const [activeTab, setActiveTab] = useState<'MAP' | 'TABLE'>('MAP');
  const [isUploading, setIsUploading] = useState(false);

  const getGeneColor = (geneId: string) => {
    const gene = DEMO_TRANSCRIPTOME.find(g => g.id === geneId);
    if (!gene) return '#e2e8f0'; // slate-200 default
    if (gene.status === 'UP') return '#fecaca'; // red-200 background
    if (gene.status === 'DOWN') return '#bfdbfe'; // blue-200 background
    return '#f1f5f9'; // slate-100
  };

  const getBorderColor = (geneId: string) => {
    const gene = DEMO_TRANSCRIPTOME.find(g => g.id === geneId);
    if (!gene) return '#94a3b8';
    if (gene.status === 'UP') return '#ef4444'; // red-500
    if (gene.status === 'DOWN') return '#3b82f6'; // blue-500
    return '#cbd5e1'; // slate-300
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setView('ANALYSIS');
        }, 1500);
    }
  };

  const renderUpload = () => (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center animate-fade-in">
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-3 mb-2">
                   <GitMerge className="text-orange-600" size={32}/> Metabolic Pathway Mapper
                </h2>
                <p className="text-slate-500">
                    Integrate transcriptomic (RNA-seq) or proteomic data to visualize metabolic flux shifts.
                    Identify resistance mechanisms by mapping gene expression changes to KEGG-style pathways.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all relative min-h-[250px] group">
                    <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={handleFileUpload} 
                        accept=".csv,.xlsx,.txt"
                        disabled={isUploading}
                    />
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <RefreshCw className="text-blue-600 animate-spin mb-4" size={40}/>
                            <span className="font-bold text-slate-700">Mapping Genes...</span>
                            <span className="text-xs text-slate-400 mt-1">Calculating fold changes</span>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Upload Gene Expression Data</h3>
                            <p className="text-xs text-slate-500 mb-4">Supported: DESeq2 Output (.csv)</p>
                            <span className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm group-hover:border-blue-300 group-hover:text-blue-600">
                                Select File
                            </span>
                        </>
                    )}
                </div>

                <div 
                    onClick={() => setView('ANALYSIS')}
                    className="border-2 border-transparent bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all min-h-[250px] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                        POPULAR
                    </div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                        <Play size={32} className="ml-1"/>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">Load Demo Dataset</h3>
                    <p className="text-xs text-slate-500 mb-4 max-w-[200px] text-center">
                        Vancomycin Resistance (VRE) in <em>Enterococcus faecium</em> post-chlorination.
                    </p>
                    <button className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        View Analysis <ArrowRight size={16}/>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6 animate-fade-in">
       {/* HEADER */}
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('UPLOAD')} 
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                title="Back to Upload"
              >
                  <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <GitMerge className="text-orange-600"/> Pathway Analysis: Vancomycin Resistance
                </h2>
                <p className="text-xs text-slate-500">Mapping Transcriptome (RNA-seq) to KEGG Pathway: Peptidoglycan Biosynthesis</p>
              </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('MAP')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'MAP' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Layers size={16}/> Pathway Map
             </button>
             <button 
                onClick={() => setActiveTab('TABLE')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'TABLE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
                <Table size={16}/> Transcriptome Profile
             </button>
          </div>
       </div>

       {activeTab === 'MAP' && (
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 text-sm">Metabolic Map: Peptidoglycan & Vancomycin Resistance (map00550)</h3>
                        <div className="flex gap-3 text-[10px]">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 border border-red-500 rounded-sm"></div> Upregulated (FC &gt; 2.0)</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-200 border border-blue-500 rounded-sm"></div> Downregulated (FC &lt; -2.0)</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-100 border border-slate-300 rounded-sm"></div> No Change</span>
                        </div>
                    </div>
                    
                    <div className="relative h-[600px] w-full overflow-auto bg-white p-4 flex justify-center">
                        {/* KEGG STYLE SVG MAP */}
                        <svg viewBox="0 0 800 550" className="w-full h-full max-w-[800px]">
                            <defs>
                                <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
                                </marker>
                                <marker id="inhibitHead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
                                    <path d="M0,0 L0,10 M9,0 L9,10" stroke="#ef4444" strokeWidth="2" />
                                </marker>
                            </defs>

                            {/* --- REGULATORY SYSTEM (Top Right) --- */}
                            <g transform="translate(550, 20)">
                                <rect x="0" y="0" width="220" height="100" rx="4" fill="#f8fafc" stroke="#cbd5e1" strokeDasharray="4"/>
                                <text x="10" y="20" fontSize="10" fontWeight="bold" fill="#64748b">Two-Component Regulation</text>
                                
                                {/* VanS */}
                                <rect x="20" y="40" width="60" height="25" rx="2" fill={getGeneColor('vanS')} stroke={getBorderColor('vanS')} strokeWidth="2" />
                                <text x="50" y="56" textAnchor="middle" fontSize="10" fontWeight="bold">VanS</text>
                                <text x="50" y="35" textAnchor="middle" fontSize="9" fill="#64748b">Sensor</text>

                                {/* VanR */}
                                <rect x="120" y="40" width="60" height="25" rx="2" fill={getGeneColor('vanR')} stroke={getBorderColor('vanR')} strokeWidth="2" />
                                <text x="150" y="56" textAnchor="middle" fontSize="10" fontWeight="bold">VanR</text>
                                
                                {/* Signal */}
                                <line x1="80" y1="52" x2="120" y2="52" stroke="#64748b" strokeWidth="1" strokeDasharray="2" markerEnd="url(#arrowHead)"/>
                                <text x="100" y="48" textAnchor="middle" fontSize="8">P</text>

                                {/* Activation */}
                                <path d="M 150 65 L 150 90 L 100 90" stroke="#ef4444" strokeWidth="1.5" markerEnd="url(#arrowHead)"/>
                                <text x="180" y="85" fontSize="9" fill="#ef4444" fontStyle="italic">Activates Operon</text>
                            </g>

                            {/* --- MAIN PATHWAY (Left Column) --- */}
                            
                            {/* UDP-N-acetylmuramate */}
                            <circle cx="100" cy="50" r="6" fill="#fff" stroke="#000"/>
                            <text x="115" y="53" fontSize="10">UDP-MurNAc</text>

                            {/* MurC */}
                            <line x1="100" y1="56" x2="100" y2="100" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrowHead)"/>
                            <rect x="80" y="70" width="40" height="20" rx="2" fill={getGeneColor('murC')} stroke={getBorderColor('murC')} />
                            <text x="100" y="83" textAnchor="middle" fontSize="10">MurC</text>
                            <text x="130" y="83" fontSize="9" fill="#64748b">+ L-Ala</text>

                            {/* MurD */}
                            <line x1="100" y1="100" x2="100" y2="150" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrowHead)"/>
                            <rect x="80" y="120" width="40" height="20" rx="2" fill={getGeneColor('murD')} stroke={getBorderColor('murD')} />
                            <text x="100" y="133" textAnchor="middle" fontSize="10">MurD</text>
                            <text x="130" y="133" fontSize="9" fill="#64748b">+ D-Glu</text>

                            {/* MurE */}
                            <line x1="100" y1="150" x2="100" y2="200" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrowHead)"/>
                            <rect x="80" y="170" width="40" height="20" rx="2" fill={getGeneColor('murE')} stroke={getBorderColor('murE')} />
                            <text x="100" y="183" textAnchor="middle" fontSize="10">MurE</text>
                            <text x="130" y="183" fontSize="9" fill="#64748b">+ L-Lys</text>

                            {/* Tripeptide */}
                            <circle cx="100" cy="210" r="6" fill="#fff" stroke="#000"/>
                            <text x="115" y="213" fontSize="10" fontWeight="bold">UDP-MurNAc-Tripeptide</text>

                            {/* --- BRANCH POINT (Center) --- */}
                            
                            {/* Path A: Standard (MurF) */}
                            <line x1="100" y1="216" x2="100" y2="350" stroke="#475569" strokeWidth="2" strokeDasharray="4"/>
                            
                            <rect x="80" y="260" width="40" height="20" rx="2" fill={getGeneColor('murF')} stroke={getBorderColor('murF')} />
                            <text x="100" y="273" textAnchor="middle" fontSize="10">MurF</text>

                            {/* Input: D-Ala-D-Ala (Standard) */}
                            <path d="M 180 250 L 130 270" stroke="#475569" strokeWidth="1" markerEnd="url(#arrowHead)"/>
                            
                            {/* UDP-MurNAc-Pentapeptide (Susceptible Target) */}
                            <rect x="50" y="350" width="100" height="30" rx="4" fill="#f1f5f9" stroke="#94a3b8" />
                            <text x="100" y="365" textAnchor="middle" fontSize="10">Pentapeptide</text>
                            <text x="100" y="375" textAnchor="middle" fontSize="9" fill="#64748b">(D-Ala-D-Ala)</text>

                            {/* Vancomycin Binding */}
                            <path d="M 50 365 L 20 365" stroke="#ef4444" strokeWidth="3" />
                            <rect x="10" y="355" width="5" height="20" fill="#ef4444" />
                            <text x="10" y="345" fontSize="10" fill="#ef4444" fontWeight="bold">Vancomycin</text>
                            <text x="10" y="395" fontSize="9" fill="#ef4444">Binding</text>


                            {/* --- D-Ala Branch (Middle) --- */}
                            <g transform="translate(250, 150)">
                                <text x="0" y="0" fontSize="12" fontWeight="bold">Peptidoglycan Precursors</text>
                                
                                {/* L-Ala -> D-Ala */}
                                <rect x="-20" y="20" width="40" height="20" rx="2" fill="#fff" stroke="#94a3b8" />
                                <text x="0" y="33" textAnchor="middle" fontSize="10">Alr</text>
                                
                                <circle cx="0" cy="60" r="5" fill="#e2e8f0"/>
                                <text x="10" y="63" fontSize="10">D-Ala</text>

                                {/* Ddl (Ligase) */}
                                <line x1="0" y1="65" x2="0" y2="120" stroke={getGeneColor('ddl') === '#bfdbfe' ? '#3b82f6' : '#475569'} strokeWidth="3" markerEnd="url(#arrowHead)"/>
                                <rect x="-20" y="85" width="40" height="20" rx="2" fill={getGeneColor('ddl')} stroke={getBorderColor('ddl')} strokeWidth="2"/>
                                <text x="0" y="98" textAnchor="middle" fontSize="10" fontWeight="bold">Ddl</text>

                                {/* D-Ala-D-Ala */}
                                <circle cx="0" cy="130" r="6" fill="#fff" stroke="#000"/>
                                <text x="10" y="133" fontSize="10" fontWeight="bold">D-Ala-D-Ala</text>

                                {/* VanX Cleavage */}
                                <path d="M 10 130 L 60 130" stroke="#ef4444" strokeWidth="2" markerEnd="url(#inhibitHead)"/>
                                <rect x="30" y="115" width="40" height="20" rx="2" fill={getGeneColor('vanX')} stroke={getBorderColor('vanX')} strokeWidth="2"/>
                                <text x="50" y="128" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#7f1d1d">VanX</text>
                                <text x="50" y="150" textAnchor="middle" fontSize="8" fill="#ef4444">Hydrolysis</text>
                            </g>


                            {/* --- RESISTANCE SHUNT (Right) --- */}
                            <g transform="translate(450, 150)">
                                {/* Pyruvate */}
                                <text x="0" y="15" textAnchor="middle" fontSize="10">Pyruvate</text>
                                
                                {/* VanH */}
                                <line x1="0" y1="20" x2="0" y2="60" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowHead)"/>
                                <rect x="-20" y="30" width="40" height="20" rx="2" fill={getGeneColor('vanH')} stroke={getBorderColor('vanH')} strokeWidth="2"/>
                                <text x="0" y="43" textAnchor="middle" fontSize="10" fontWeight="bold">VanH</text>

                                {/* D-Lac */}
                                <circle cx="0" cy="70" r="6" fill="#fee2e2" stroke="#ef4444"/>
                                <text x="10" y="73" fontSize="10" fontWeight="bold" fill="#7f1d1d">D-Lactate</text>

                                {/* VanA */}
                                <path d="M -50 70 Q -25 100 0 120" stroke="#ef4444" strokeWidth="2" fill="none" markerEnd="url(#arrowHead)"/>
                                <rect x="-40" y="90" width="40" height="20" rx="2" fill={getGeneColor('vanA')} stroke={getBorderColor('vanA')} strokeWidth="2"/>
                                <text x="-20" y="103" textAnchor="middle" fontSize="10" fontWeight="bold">VanA</text>

                                {/* D-Ala input line */}
                                <path d="M -150 60 Q -100 80 -45 95" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2" markerEnd="url(#arrowHead)"/>

                                {/* D-Ala-D-Lac */}
                                <rect x="-20" y="130" width="80" height="25" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="2"/>
                                <text x="20" y="146" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#991b1b">D-Ala-D-Lac</text>
                            </g>

                            {/* Integration of Resistant Precursor */}
                            <path d="M 450 290 L 350 350" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arrowHead)" strokeDasharray="4"/>
                            <text x="420" y="310" fontSize="9" fill="#ef4444">Incorporation</text>

                            {/* Resistant Product */}
                            <rect x="300" y="350" width="120" height="30" rx="4" fill="#fef2f2" stroke="#ef4444" strokeWidth="2"/>
                            <text x="360" y="365" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#b91c1c">Resistant Wall</text>
                            <text x="360" y="375" textAnchor="middle" fontSize="9" fill="#7f1d1d">(D-Ala-D-Lac end)</text>

                            {/* No Binding */}
                            <path d="M 430 365 L 460 365" stroke="#10b981" strokeWidth="2"/>
                            <text x="470" y="365" fontSize="10" fill="#10b981" fontWeight="bold">No Binding</text>
                            <text x="470" y="375" fontSize="9" fill="#10b981">Survival ✓</text>

                        </svg>
                        
                        {/* Legend Overlay */}
                        <div className="absolute top-4 right-4 bg-white/90 p-2 rounded border border-slate-200 text-[10px] shadow-sm">
                            <div className="font-bold mb-1">Map Legend</div>
                            <div className="flex items-center gap-1 mb-1"><div className="w-3 h-2 bg-white border border-slate-400 rounded-sm"></div> Enzyme</div>
                            <div className="flex items-center gap-1 mb-1"><div className="w-2 h-2 rounded-full border border-black"></div> Metabolite</div>
                            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-red-500"></div> Resistance Flow</div>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR ANALYSIS */}
                <div className="space-y-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity size={18} className="text-blue-600"/> Flux Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600">Standard Pathway</span>
                                    <span className="font-bold text-slate-800">12%</span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-slate-400 h-full" style={{width: '12%'}}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-rose-600 font-bold">Resistance Shunt</span>
                                    <span className="font-bold text-rose-700">88%</span>
                                </div>
                                <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full" style={{width: '88%'}}></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                High expression of <strong>vanH/A/X</strong> effectively diverts metabolic flux away from the Vancomycin-susceptible D-Ala-D-Ala terminus.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-800 text-white p-5 rounded-xl shadow-sm">
                        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                            <FileText size={16}/> Mechanism Summary
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-300">
                            <strong>Target Modification:</strong> The substitution of the terminal amide bond with an ester bond (D-Ala-D-Lac) removes a critical hydrogen bond donor.
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-emerald-400 font-mono">
                            Affinity Loss: &gt;1000-fold
                        </div>
                    </div>
                </div>
           </div>
       )}

       {activeTab === 'TABLE' && (
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 bg-slate-50">
                   <h3 className="font-bold text-slate-800">Transcriptome Profile: Peptidoglycan Biosynthesis Genes</h3>
               </div>
               <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                           <tr>
                               <th className="p-4">Gene ID</th>
                               <th className="p-4">Pathway Step</th>
                               <th className="p-4">Description</th>
                               <th className="p-4">Log2 Fold Change</th>
                               <th className="p-4">P-Value</th>
                               <th className="p-4">Status</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {DEMO_TRANSCRIPTOME.map((gene) => (
                               <tr key={gene.id} className="hover:bg-slate-50">
                                   <td className="p-4 font-mono font-bold text-slate-700">{gene.name}</td>
                                   <td className="p-4 text-xs text-slate-500 uppercase font-bold tracking-wide">{gene.pathway}</td>
                                   <td className="p-4 text-slate-600">{gene.desc}</td>
                                   <td className="p-4 font-mono">
                                       <span className={gene.fc > 0 ? 'text-red-600' : 'text-blue-600'}>
                                           {gene.fc > 0 ? '+' : ''}{gene.fc}
                                       </span>
                                   </td>
                                   <td className="p-4 font-mono text-slate-500">{gene.pval}</td>
                                   <td className="p-4">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                                           gene.status === 'UP' ? 'bg-red-100 text-red-700' :
                                           gene.status === 'DOWN' ? 'bg-blue-100 text-blue-700' :
                                           'bg-slate-100 text-slate-600'
                                       }`}>
                                           {gene.status}
                                       </span>
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

  return view === 'UPLOAD' ? renderUpload() : renderAnalysis();
};

export default MetabolicPathwayMapper;