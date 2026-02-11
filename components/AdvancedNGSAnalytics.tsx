import React from 'react';
import { Network, Layers, GitCommit, Dna, AlignJustify } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// --- MOCK DATA FOR ADVANCED VISUALS ---
const HEATMAP_DATA = [
  { gene: 'mexA', influent: -0.5, effluent: 2.1, postChlorine: 4.5 },
  { gene: 'mexB', influent: -0.2, effluent: 2.3, postChlorine: 4.8 },
  { gene: 'recA', influent: 0.1, effluent: 1.5, postChlorine: 3.2 },
  { gene: 'lexA', influent: 0.0, effluent: 1.2, postChlorine: 2.8 },
  { gene: 'ompF', influent: 1.2, effluent: -1.5, postChlorine: -3.5 }, // Downregulated
  { gene: 'gyrA', influent: 0.1, effluent: 0.2, postChlorine: 0.5 },    // No change in expression
];

const PATHWAY_DATA = [
  { pathway: 'Efflux Pump Complex', count: 12, pval: 0.001, enrichment: 85 },
  { pathway: 'SOS Response', count: 8, pval: 0.005, enrichment: 72 },
  { pathway: 'Biofilm Formation', count: 15, pval: 0.02, enrichment: 60 },
  { pathway: 'Quorum Sensing', count: 5, pval: 0.04, enrichment: 45 },
  { pathway: 'Cell Wall Synthesis', count: 2, pval: 0.45, enrichment: 10 }, // Not significant
];

// --- MOCK DATA FOR WGS ---
const GENOME_FEATURES = [
    { start: 50, width: 40, type: 'CDS', name: 'dnaA' },
    { start: 120, width: 30, type: 'RES', name: 'blaNDM-1' },
    { start: 200, width: 60, type: 'CDS', name: 'gyrA' },
    { start: 350, width: 40, type: 'RES', name: 'mcr-1' },
    { start: 450, width: 30, type: 'CDS', name: 'recA' },
    { start: 600, width: 50, type: 'RNA', name: '16S rRNA' },
    { start: 800, width: 45, type: 'CDS', name: 'mexB' },
 ];

const RESISTOME_INVENTORY = [
    { gene: 'blaNDM-1', class: 'Beta-lactamase', identity: 100, coverage: 100, location: 'Plasmid (IncX3)' },
    { gene: 'mcr-1', class: 'Colistin Resistance', identity: 99.8, coverage: 100, location: 'Plasmid' },
    { gene: 'tet(A)', class: 'Tetracycline Efflux', identity: 100, coverage: 98, location: 'Chromosome' },
    { gene: 'sul1', class: 'Sulfonamide', identity: 95.4, coverage: 100, location: 'Integron' },
    { gene: 'aadA2', class: 'Aminoglycoside', identity: 100, coverage: 100, location: 'Integron' },
];

interface AdvancedNGSAnalyticsProps {
    dataType: 'WGS' | 'RNA_SEQ' | 'AST_ONLY' | 'PCR';
}

const AdvancedNGSAnalytics: React.FC<AdvancedNGSAnalyticsProps> = ({ dataType }) => {
  if (dataType === 'RNA_SEQ') {
      return (
        <div className="space-y-6 mt-8 animate-fade-in">
          {/* 1. EXPRESSION HEATMAP */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Layers className="text-indigo-600" size={24} />
              <div>
                 <h3 className="font-bold text-slate-800">Differential Expression Heatmap</h3>
                 <p className="text-xs text-slate-500">Log2 Fold Change across treatment stages (Red = Upregulated, Blue = Downregulated)</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                 {/* Header */}
                 <div className="grid grid-cols-4 gap-1 mb-1 text-xs font-bold text-slate-500 text-center uppercase tracking-wider">
                    <div className="text-left pl-4">Gene</div>
                    <div>Influent</div>
                    <div>Effluent</div>
                    <div>Post-Cl2</div>
                 </div>
                 {/* Rows */}
                 {HEATMAP_DATA.map((row) => (
                   <div key={row.gene} className="grid grid-cols-4 gap-1 mb-1 items-center">
                      <div className="font-mono text-sm font-bold text-slate-700 pl-4">{row.gene}</div>
                      {[row.influent, row.effluent, row.postChlorine].map((val, i) => {
                         const intensity = Math.min(Math.abs(val) * 20, 100); 
                         const color = val > 0 
                            ? `rgba(239, 68, 68, ${intensity / 100})`  
                            : `rgba(59, 130, 246, ${intensity / 100})`; 
                         
                         return (
                           <div key={i} className="h-8 rounded flex items-center justify-center text-xs font-medium text-slate-800 transition-all hover:scale-105"
                                style={{ backgroundColor: Math.abs(val) < 0.5 ? '#f1f5f9' : color, color: Math.abs(val) > 2 ? 'white' : 'black' }}>
                              {val > 0 ? '+' : ''}{val}
                           </div>
                         );
                      })}
                   </div>
                 ))}
              </div>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-xs">
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded"></div> Upregulated (Resistance)</div>
               <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded"></div> Downregulated (Sensitivity)</div>
            </div>
          </div>
    
          {/* 2. PATHWAY ENRICHMENT ANALYSIS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Network className="text-teal-600" size={24} />
                  <div>
                     <h3 className="font-bold text-slate-800">Pathway Enrichment Analysis (GO Terms)</h3>
                     <p className="text-xs text-slate-500">Biological processes statistically overrepresented in resistant isolates.</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={PATHWAY_DATA.filter(p => p.pval < 0.05)}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis dataKey="pathway" type="category" width={140} tick={{fontSize: 11}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="enrichment" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#64748b', fontSize: 10, formatter: (val) => `${val}% Enriched` }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
          </div>
        </div>
      );
  }

  if (dataType === 'WGS') {
      return (
          <div className="space-y-6 mt-8 animate-fade-in">
              {/* 1. GENOME MAP */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                   <div className="flex items-center gap-2 mb-6">
                      <Dna className="text-blue-600" size={24} />
                      <div>
                         <h3 className="font-bold text-slate-800">Genome Annotation Map</h3>
                         <p className="text-xs text-slate-500">Visual location of identified resistance determinants.</p>
                      </div>
                   </div>
                   
                   <div className="relative h-32 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden flex items-center px-4">
                       <div className="absolute w-full h-1 bg-slate-300"></div>
                       {GENOME_FEATURES.map((feat, i) => (
                           <div 
                             key={i} 
                             className={`absolute h-8 rounded flex items-center justify-center text-[10px] text-white font-bold cursor-pointer hover:scale-110 transition-transform shadow-sm ${
                                 feat.type === 'RES' ? 'bg-rose-500 top-6 z-10' : feat.type === 'RNA' ? 'bg-green-500 top-14' : 'bg-blue-400 top-10 opacity-70'
                             }`}
                             style={{ left: `${feat.start / 10}%`, width: `${Math.max(feat.width, 30) / 10}%` }}
                             title={`${feat.name} (${feat.type})`}
                           >
                             {feat.name}
                           </div>
                       ))}
                   </div>
                   <div className="flex gap-4 mt-4 text-xs justify-center">
                       <span className="flex items-center"><div className="w-3 h-3 bg-rose-500 rounded mr-1"></div> Resistance Genes (ARG)</span>
                       <span className="flex items-center"><div className="w-3 h-3 bg-blue-400 rounded mr-1"></div> Coding Sequence (CDS)</span>
                       <span className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-1"></div> rRNA / tRNA</span>
                   </div>
               </div>

               {/* 2. RESISTOME INVENTORY TABLE */}
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex items-center gap-2 mb-4">
                      <AlignJustify className="text-indigo-600" size={24} />
                      <div>
                         <h3 className="font-bold text-slate-800">Detected Resistome Inventory</h3>
                         <p className="text-xs text-slate-500">Antimicrobial resistance genes identified with >95% identity.</p>
                      </div>
                   </div>
                   <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                               <tr>
                                   <th className="p-3">Gene</th>
                                   <th className="p-3">Resistance Class</th>
                                   <th className="p-3">% Identity</th>
                                   <th className="p-3">% Coverage</th>
                                   <th className="p-3">Genetic Context</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {RESISTOME_INVENTORY.map((gene, i) => (
                                   <tr key={i} className="hover:bg-slate-50">
                                       <td className="p-3 font-bold text-slate-800 font-mono">{gene.gene}</td>
                                       <td className="p-3">{gene.class}</td>
                                       <td className="p-3 text-green-600 font-medium">{gene.identity}%</td>
                                       <td className="p-3">{gene.coverage}%</td>
                                       <td className="p-3">
                                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${gene.location.includes('Plasmid') ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                                               {gene.location}
                                           </span>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
               </div>

               {/* 3. SNP VARIANT CALLER */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <GitCommit className="text-rose-600" size={24} />
                  <div>
                     <h3 className="font-bold text-slate-800">Chromosomal SNP Analysis</h3>
                     <p className="text-xs text-slate-500">Point mutations in Quinologone Resistance Determining Regions (QRDR).</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg">
                      <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-rose-800 text-sm">gyrA (D87N)</span>
                         <span className="bg-rose-200 text-rose-800 text-[10px] px-2 py-0.5 rounded-full font-bold">HIGH</span>
                      </div>
                      <p className="text-xs text-rose-700">Aspartate -> Asparagine. Confers fluoroquinolone resistance.</p>
                   </div>
    
                   <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                      <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-yellow-800 text-sm">parC (S80I)</span>
                         <span className="bg-yellow-200 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">MED</span>
                      </div>
                      <p className="text-xs text-yellow-700">Serine -> Isoleucine. Secondary mutation.</p>
                   </div>
    
                   <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                      <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-green-800 text-sm">rpoB</span>
                         <span className="bg-green-200 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">WT</span>
                      </div>
                      <p className="text-xs text-green-700">No resistance-conferring mutations detected.</p>
                   </div>
                </div>
             </div>
          </div>
      );
  }

  return null;
};

export default AdvancedNGSAnalytics;