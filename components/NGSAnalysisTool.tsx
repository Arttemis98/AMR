import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Dna, 
  Activity, 
  CheckCircle, 
  BarChart2, 
  Network, 
  FileText,
  Microscope,
  Cpu,
  AlignLeft,
  Search
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { GeneExpression, EnrichmentTerm, BlastHit } from '../types';
import AdvancedNGSAnalytics from './AdvancedNGSAnalytics';
import GeneMechanismTable from './GeneMechanismTable';

// --- MOCK DATA ---

const MOCK_GENE_DATA: GeneExpression[] = [
  { gene: 'mexA', log2FoldChange: 2.5, pvalue: 0.0001, significance: 'UP', function: 'Efflux Pump' },
  { gene: 'mexB', log2FoldChange: 2.8, pvalue: 0.00001, significance: 'UP', function: 'Efflux Pump' },
  { gene: 'oprM', log2FoldChange: 2.1, pvalue: 0.002, significance: 'UP', function: 'Outer Membrane Protein' },
  { gene: 'recA', log2FoldChange: 3.2, pvalue: 0.000001, significance: 'UP', function: 'SOS Response' },
  { gene: 'lexA', log2FoldChange: 1.5, pvalue: 0.01, significance: 'UP', function: 'SOS Repressor' },
  { gene: 'rpoS', log2FoldChange: 1.8, pvalue: 0.005, significance: 'UP', function: 'Sigma Factor' },
  { gene: 'oxyR', log2FoldChange: 1.2, pvalue: 0.03, significance: 'UP', function: 'Oxidative Stress' },
  { gene: 'ompF', log2FoldChange: -2.1, pvalue: 0.001, significance: 'DOWN', function: 'Porin' },
  { gene: 'rpsL', log2FoldChange: -0.5, pvalue: 0.4, significance: 'NS', function: 'Ribosomal Protein' },
  { gene: 'gyrA', log2FoldChange: 0.2, pvalue: 0.8, significance: 'NS', function: 'DNA Gyrase' },
  { gene: 'katG', log2FoldChange: 1.9, pvalue: 0.004, significance: 'UP', function: 'Catalase' },
  ...Array.from({ length: 50 }, (_, i) => ({
    gene: `gene_${i}`,
    log2FoldChange: (Math.random() * 4) - 2,
    pvalue: Math.random(),
    significance: 'NS' as const,
    function: 'Hypothetical'
  }))
];

const MOCK_ENRICHMENT: EnrichmentTerm[] = [
  { term: 'Efflux transmembrane transporter activity', count: 12, pvalue: 0.001 },
  { term: 'Response to oxidative stress', count: 8, pvalue: 0.004 },
  { term: 'SOS response / DNA repair', count: 6, pvalue: 0.012 },
  { term: 'Cell outer membrane', count: 15, pvalue: 0.02 },
  { term: 'Antibiotic metabolic process', count: 5, pvalue: 0.045 },
];

const MOCK_BLAST_HITS: BlastHit[] = [
  { accession: 'NC_002516.2', organism: 'Pseudomonas aeruginosa PAO1', identity: 99.8, eValue: 0.0, score: 2450 },
  { accession: 'NZ_CP01234.1', organism: 'Pseudomonas aeruginosa strain VRFPA04', identity: 99.5, eValue: 0.0, score: 2410 },
  { accession: 'NC_011770.1', organism: 'Pseudomonas putida KT2440', identity: 88.2, eValue: 1e-120, score: 1800 },
  { accession: 'NC_00913.3', organism: 'Escherichia coli str. K-12', identity: 45.3, eValue: 1e-5, score: 320 },
];

const MOCK_ANTIBIOGRAM = [
  { antibiotic: 'Ciprofloxacin', Control: 28, Treated: 18, Breakpoint: 21 },
  { antibiotic: 'Gentamicin', Control: 22, Treated: 12, Breakpoint: 15 },
  { antibiotic: 'Ceftazidime', Control: 25, Treated: 15, Breakpoint: 18 },
  { antibiotic: 'Imipenem', Control: 30, Treated: 28, Breakpoint: 20 },
  { antibiotic: 'Meropenem', Control: 29, Treated: 27, Breakpoint: 20 },
];

type AnalysisTab = 'upload' | 'antibiogram' | 'phylogeny' | 'rnaseq' | 'report';

const NGSAnalysisTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const runPipeline = () => {
    setIsProcessing(true);
    setUploadProgress(0);
    
    const steps = [
      { pct: 10, msg: "Quality Control (FastQC) & Trimming..." },
      { pct: 30, msg: "De novo Assembly & Contig Generation..." },
      { pct: 50, msg: "Local BLAST Alignment & Identification..." },
      { pct: 70, msg: "Phylogenetic Tree Construction (Maximum Likelihood)..." },
      { pct: 85, msg: "Read Mapping (HISAT2) & Quantification..." },
      { pct: 100, msg: "Differential Expression Analysis (DESeq2)..." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setUploadProgress(steps[currentStep].pct);
      setProcessingStep(steps[currentStep].msg);
      currentStep++;
      
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setActiveTab('antibiogram');
        }, 800);
      }
    }, 1200);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: AnalysisTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      disabled={activeTab === 'upload' && id !== 'upload'} // Disable tabs until upload done
      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600 font-medium' 
          : 'border-transparent text-slate-500 hover:text-slate-700'
      } ${activeTab === 'upload' && id !== 'upload' ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  // --- SUB-COMPONENTS ---

  const renderUpload = () => (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
      {!isProcessing ? (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Genomic Data Upload */}
          <div 
            className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer hover:bg-indigo-50 transition-colors"
            onClick={runPipeline}
          >
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Dna size={32} />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Upload Genomic Data</h3>
            <p className="text-sm text-slate-500 mt-2 mb-4">Raw FASTQ, FASTA, or BAM files</p>
            <span className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium shadow-sm">
              Select NGS Files
            </span>
          </div>

          {/* Phenotypic Data Upload */}
          <div 
            className="border-2 border-dashed border-teal-200 bg-teal-50/50 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer hover:bg-teal-50 transition-colors"
            onClick={runPipeline}
          >
            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
              <Activity size={32} />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Upload Phenotypic Data</h3>
            <p className="text-sm text-slate-500 mt-2 mb-4">Zone of Inhibition CSV / Excel</p>
            <span className="px-4 py-2 bg-white border border-teal-200 text-teal-700 rounded-lg text-sm font-medium shadow-sm">
              Select AST Data
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl text-center">
          <Cpu className="mx-auto text-blue-600 animate-pulse mb-6" size={48} />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Running Bio-informatics Pipeline</h3>
          <p className="text-slate-500 mb-8 font-mono text-sm">{processingStep}</p>
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAntibiogram = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Microscope className="mr-2 text-teal-600" size={20}/>
          Comparative Antibiogram (In-silico & In-vitro)
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_ANTIBIOGRAM} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="antibiotic" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Zone of Inhibition (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
              <Legend />
              <ReferenceLine y={18} label="Resistant Breakpoint (<18mm)" stroke="red" strokeDasharray="3 3" />
              <Bar dataKey="Control" fill="#10b981" name="Pre-Chlorination" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Treated" fill="#f43f5e" name="Post-Chlorination" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <strong>Observation:</strong> Significant reduction in zone size for Ciprofloxacin and Ceftazidime post-treatment, indicating acquired resistance or phenotypic adaptation.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-4 w-full text-left">Resistance Radar</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_ANTIBIOGRAM}>
                <PolarGrid />
                <PolarAngleAxis dataKey="antibiotic" tick={{fontSize: 10}} />
                <PolarRadiusAxis angle={30} domain={[0, 35]} />
                <Radar name="Control" dataKey="Control" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="Treated" dataKey="Treated" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                <Legend />
              </RadarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPhylogeny = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Alignment Results */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Search className="mr-2 text-indigo-600" size={20}/>
            BLASTN Identification Results
          </h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Query Coverage: 99.9%</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500 font-medium border-b border-slate-100 bg-slate-50">
              <tr>
                <th className="p-3">Accession</th>
                <th className="p-3">Organism Description</th>
                <th className="p-3">Max Score</th>
                <th className="p-3">E-Value</th>
                <th className="p-3">Identity (%)</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BLAST_HITS.map((hit, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-blue-600 hover:underline cursor-pointer">{hit.accession}</td>
                  <td className="p-3 font-medium text-slate-800">{hit.organism}</td>
                  <td className="p-3 text-slate-600">{hit.score}</td>
                  <td className="p-3 text-slate-600">{hit.eValue}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${hit.identity > 99 ? 'text-green-600' : 'text-amber-600'}`}>{hit.identity}%</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{width: `${hit.identity}%`}}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phylogenetic Tree Simulation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <Network className="mr-2 text-indigo-600" size={20}/>
          Phylogenetic Tree (Neighbor-Joining)
        </h3>
        <div className="flex justify-center py-4">
          {/* Simple SVG Tree */}
          <svg width="600" height="300" className="border border-slate-100 bg-slate-50 rounded-lg p-4">
            <style>{`.tree-text { font-size: 12px; font-family: monospace; fill: #475569; } .tree-line { stroke: #94a3b8; stroke-width: 2; fill: none; }`}</style>
            
            {/* Root */}
            <path d="M50 150 L100 150" className="tree-line" />
            
            {/* Branch 1 (Outgroup) */}
            <path d="M100 150 L100 250 L150 250" className="tree-line" />
            <text x="160" y="254" className="tree-text">Escherichia coli K-12</text>

            {/* Branch 2 (Pseudomonas Clade) */}
            <path d="M100 150 L100 50 L150 50" className="tree-line" />
            
            {/* Sub-branch 2a */}
            <path d="M150 50 L150 20 L200 20" className="tree-line" />
            <text x="210" y="24" className="tree-text">P. putida KT2440</text>

            {/* Sub-branch 2b */}
            <path d="M150 50 L150 100 L200 100" className="tree-line" />
            
            {/* Target Clade */}
            <path d="M200 100 L200 80 L250 80" className="tree-line" />
            <text x="260" y="84" className="tree-text text-blue-600 font-bold" fill="#2563eb !important">Your Isolate (Sample_001)</text>
            <circle cx="250" cy="80" r="4" fill="#2563eb" />

            <path d="M200 100 L200 120 L250 120" className="tree-line" />
            <text x="260" y="124" className="tree-text">P. aeruginosa PAO1</text>
          </svg>
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">
          Bootstrapping (1000 replicates). Your isolate clusters closely with <em>P. aeruginosa</em> PAO1.
        </p>
      </div>
    </div>
  );

  const renderRNASeq = () => (
    <div className="space-y-6 animate-fade-in">
       {/* Volcano Plot - Keeping as primary overview */}
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Differential Expression (Volcano Plot)</h3>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="log2FoldChange" name="Log2FC" />
                  <YAxis type="number" dataKey="pvalue" name="p-value" tickFormatter={() => ""} label={{value: '-Log10(P)', angle: -90, position: 'insideLeft'}} />
                  <Tooltip content={() => null} />
                  <Scatter data={MOCK_GENE_DATA} fill="#8884d8">
                    {MOCK_GENE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.significance === 'UP' ? '#ef4444' : entry.significance === 'DOWN' ? '#3b82f6' : '#cbd5e1'} />
                    ))}
                  </Scatter>
                  <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3"/>
                </ScatterChart>
              </ResponsiveContainer>
           </div>
           <div className="flex justify-center space-x-6 text-sm mt-2">
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Upregulated (Stress)</div>
              <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Downregulated</div>
           </div>
        </div>

       {/* Integrated Advanced Analytics (Heatmap, Pathway, SNP) */}
       <AdvancedNGSAnalytics dataType="RNA_SEQ" />

       {/* Gene Mechanism Table */}
       <GeneMechanismTable data={MOCK_GENE_DATA} />
    </div>
  );

  const renderReport = () => (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-fade-in max-w-4xl mx-auto">
       <div className="flex items-center space-x-3 mb-6 border-b border-slate-100 pb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl text-white">
             <FileText size={32} />
          </div>
          <div>
             <h2 className="text-2xl font-bold text-slate-800">Integrated Research Report</h2>
             <p className="text-slate-500">Auto-generated by ChlorineResist Analysis Pipeline</p>
          </div>
       </div>

       <div className="space-y-6">
          <section>
             <h3 className="text-lg font-bold text-indigo-900 mb-2">1. Genomic Identification</h3>
             <p className="text-slate-700 leading-relaxed">
                The isolated strain (Sample_001) shows <strong>99.8% identity to <em>Pseudomonas aeruginosa</em> PAO1</strong> based on local alignment of the 16S rRNA region extracted from RNA-seq data. Phylogenetic analysis places it firmly within the <em>Pseudomonas</em> clade, distinct from enteric pathogens like <em>E. coli</em>.
             </p>
          </section>

          <section>
             <h3 className="text-lg font-bold text-indigo-900 mb-2">2. Phenotypic Resistance (Antibiogram)</h3>
             <p className="text-slate-700 leading-relaxed">
                Post-chlorination survivors exhibited a marked decrease in susceptibility to <strong>Ciprofloxacin</strong> (Zone reduction: 28mm → 18mm) and <strong>Ceftazidime</strong>. This shift crosses the CLSI breakpoint, classifying the survivors as resistant, whereas the pre-chlorination population was sensitive.
             </p>
          </section>

          <section>
             <h3 className="text-lg font-bold text-indigo-900 mb-2">3. Transcriptomic Mechanism (RNA-seq)</h3>
             <p className="text-slate-700 leading-relaxed">
                Differential expression analysis reveals the mechanism of this acquired resistance. We observe:
             </p>
             <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-700">
                <li><strong>Upregulation of Efflux Pumps:</strong> <em>mexA</em> (2.5-fold) and <em>mexB</em> (2.8-fold) are significantly overexpressed, likely pumping out antibiotics.</li>
                <li><strong>SOS Response Activation:</strong> <em>recA</em> (3.2-fold) and <em>lexA</em> upregulation confirms DNA damage stress from chlorine.</li>
                <li><strong>Porin Downregulation:</strong> <em>ompF</em> is downregulated, reducing membrane permeability to toxic agents.</li>
             </ul>
          </section>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-8">
             <h4 className="font-bold text-yellow-800 mb-1">Conclusion</h4>
             <p className="text-yellow-800 text-sm">
                The data strongly supports the hypothesis that sub-lethal chlorine stress induces multidrug resistance via the activation of the MexAB-OprM efflux system and the SOS response network in <em>P. aeruginosa</em>.
             </p>
          </div>
       </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border-b border-slate-200 px-6 pt-4 sticky top-0 z-10 shadow-sm rounded-t-xl overflow-x-auto">
        <div className="flex space-x-6 min-w-max">
           <TabButton id="upload" label="Data Upload" icon={UploadCloud} />
           <TabButton id="antibiogram" label="Antibiogram Analysis" icon={Activity} />
           <TabButton id="phylogeny" label="ID & Phylogeny" icon={Network} />
           <TabButton id="rnaseq" label="Transcriptomics" icon={Dna} />
           <TabButton id="report" label="Final Report" icon={FileText} />
        </div>
      </div>

      <div className="min-h-[500px]">
         {activeTab === 'upload' && renderUpload()}
         {activeTab === 'antibiogram' && renderAntibiogram()}
         {activeTab === 'phylogeny' && renderPhylogeny()}
         {activeTab === 'rnaseq' && renderRNASeq()}
         {activeTab === 'report' && renderReport()}
      </div>
    </div>
  );
};

export default NGSAnalysisTool;