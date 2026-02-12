
import React, { useState } from 'react';
import { 
  UploadCloud, 
  Dna, 
  Activity, 
  CheckCircle, 
  BarChart2, 
  Network, 
  FileText,
  Microscope,
  Cpu,
  Search,
  ArrowLeft,
  ChevronRight,
  Database,
  Filter,
  Zap,
  Shield,
  Layers,
  Table,
  LineChart as LineChartIcon,
  Globe,
  Play,
  Download,
  AlertTriangle,
  Info,
  ChevronDown,
  // Add missing icons
  Settings,
  RefreshCw
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
  AreaChart,
  Area,
  PieChart,
  Pie
} from 'recharts';
import { GeneExpression } from '../types';

// --- TYPES ---
type NGSToolType = 'WGS' | 'RNA_SEQ' | '16S' | 'METAGENOME';
type WorkflowStep = 'SELECT' | 'CONFIG' | 'PROCESSING' | 'RESULTS';

interface Metadata {
    sampleName: string;
    instrument: string;
    millionReads: string;
    fileFormat: string;
}

// --- MOCK DATA GENERATORS ---
const INSTRUMENTS = [
    "Illumina NovaSeq 6000", "Illumina NextSeq 2000", "Illumina MiSeq",
    "Oxford Nanopore MinION", "Oxford Nanopore GridION", "PacBio Sequel II"
];

const TAXONOMY_DATA = [
    { name: 'Pseudomonadota', value: 45, color: '#3b82f6' },
    { name: 'Bacteroidota', value: 25, color: '#10b981' },
    { name: 'Bacillota', value: 15, color: '#f59e0b' },
    { name: 'Actinomycetota', value: 10, color: '#8b5cf6' },
    { name: 'Others', value: 5, color: '#94a3b8' },
];

const METAGENOME_RESISTOME = [
    { class: 'Beta-lactams', abundance: 12.5, risk: 'CRITICAL' },
    { class: 'Aminoglycosides', abundance: 8.2, risk: 'HIGH' },
    { class: 'Fluoroquinolones', abundance: 5.4, risk: 'MEDIUM' },
    { class: 'Tetracyclines', abundance: 15.1, risk: 'LOW' },
];

const NGSAnalysisTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [workflow, setWorkflow] = useState<WorkflowStep>('SELECT');
  const [toolType, setToolType] = useState<NGSToolType | null>(null);
  const [metadata, setMetadata] = useState<Metadata>({
      sampleName: '',
      instrument: INSTRUMENTS[0],
      millionReads: '25',
      fileFormat: 'FASTQ'
  });
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [pipelineConfidence, setPipelineConfidence] = useState(98.4);

  // --- ACTIONS ---
  const handleSelectTool = (type: NGSToolType) => {
    setToolType(type);
    setWorkflow('CONFIG');
  };

  const startAnalysis = () => {
    setWorkflow('PROCESSING');
    setProgress(0);
    setProcessingLog([]);
    
    const steps = toolType === 'RNA_SEQ' 
        ? ["FastQC Quality Check...", "Adapter Trimming (Trimmomatic)...", "Alignment (STAR/HISAT2)...", "Read Counting (featureCounts)...", "DGE Analysis (DESeq2)...", "Pathway Mapping (KEGG)..."]
        : toolType === '16S'
        ? ["Demultiplexing...", "Denoising (DADA2)...", "Chimera Removal...", "Taxonomic Assignment (SILVA)...", "Alpha/Beta Diversity Analysis...", "Generating PCoA Plot..."]
        : toolType === 'WGS'
        ? ["QC Filtering...", "De-novo Assembly (SPAdes)...", "Contig Polishing...", "Prokka Annotation...", "ResFinder Screening...", "MLST Typing..."]
        : ["Host DNA Depletion...", "Metagenomic Assembly...", "Taxonomic Profiling (MetaPhlAn)...", "Functional Annotation...", "Resistome Quantification...", "Risk Assessment..."];

    let current = 0;
    const interval = setInterval(() => {
      setProcessingLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[current]}`]);
      setProgress(p => Math.min(p + (100 / steps.length), 100));
      current++;
      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => setWorkflow('RESULTS'), 800);
      }
    }, 1000);
  };

  const goBack = () => {
    if (workflow === 'RESULTS') setWorkflow('SELECT');
    else if (workflow === 'CONFIG') setWorkflow('SELECT');
    else onBack();
  };

  // --- RENDERERS ---

  const renderSelect = () => (
    <div className="space-y-8 animate-fade-in text-left">
      <div className="max-w-3xl">
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Core NGS Bioinformatics Pipeline</h3>
        <p className="text-slate-500 leading-relaxed">
            Select the specialized analysis module for your sequencing data. Our platform integrates gold-standard bioinformatics tools (BWA, STAR, DADA2, ResFinder) to identify resistance determinants with high confidence.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { id: 'WGS', name: 'Whole Genome (WGS)', icon: Dna, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Strain-level identification, SNP calling, and acquired AMR gene detection in pure isolates.' },
          { id: 'RNA_SEQ', name: 'Transcriptomics (RNA-Seq)', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Quantify active gene expression flux and transcriptional response to antibiotic stress (Chlorine).' },
          { id: '16S', name: '16S rRNA Identification', icon: Network, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Taxonomic profiling of bacterial communities from environmental or clinical samples.' },
          { id: 'METAGENOME', name: 'Shotgun Metagenomics', icon: Globe, color: 'text-teal-600', bg: 'bg-teal-50', desc: 'Direct analysis of community resistome, functional pathways, and MAGs from complex environments.' }
        ].map(tool => (
          <div key={tool.id} onClick={() => handleSelectTool(tool.id as NGSToolType)} className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex items-start gap-6">
            <div className={`w-16 h-16 shrink-0 ${tool.bg} ${tool.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <tool.icon size={32} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg mb-1">{tool.name}</h4>
              <p className="text-sm text-slate-500 mb-4">{tool.desc}</p>
              <div className="flex items-center text-blue-600 text-sm font-bold">Configure Analysis <ChevronRight size={16} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfig = () => (
    <div className="max-w-4xl animate-fade-in">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Settings size={24}/></div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Pipeline Configuration: {toolType?.replace('_', '-')}</h3>
                    <p className="text-sm text-slate-500">Provide sequencing metadata to initialize the analysis container.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Sample Identifier</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="e.g. VAD-WWTP-P01"
                            value={metadata.sampleName}
                            onChange={e => setMetadata({...metadata, sampleName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Sequencing Instrument</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={metadata.instrument}
                            onChange={e => setMetadata({...metadata, instrument: e.target.value})}
                        >
                            {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Sequencing Throughput</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="Million Reads"
                                value={metadata.millionReads}
                                onChange={e => setMetadata({...metadata, millionReads: e.target.value})}
                            />
                            <span className="absolute right-4 top-3 text-[10px] font-bold text-slate-400 pt-0.5">MILLION READS</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">File Format</label>
                        <div className="flex gap-2">
                            {['FASTQ', 'FASTA', 'BAM', 'SAM'].map(fmt => (
                                <button 
                                    key={fmt}
                                    onClick={() => setMetadata({...metadata, fileFormat: fmt})}
                                    className={`flex-1 py-3 rounded-xl border text-[10px] font-bold transition-all ${metadata.fileFormat === fmt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}
                                >
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer group mb-8">
                <UploadCloud size={48} className="mx-auto text-slate-300 group-hover:text-blue-500 transition-colors mb-4" />
                <h4 className="font-bold text-slate-700 text-lg">Upload Sequencing File</h4>
                <p className="text-slate-400 text-sm mt-1">Supports compressed .gz or .zip archives (Max 2GB per upload)</p>
                <div className="mt-6 flex justify-center gap-4">
                    <button onClick={startAnalysis} className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-900 shadow-lg">Upload & Execute Pipeline</button>
                    <button onClick={startAnalysis} className="bg-blue-50 text-blue-600 border border-blue-200 px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-100">Load Lab Sample Data</button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="max-w-2xl animate-fade-in">
        <div className="bg-slate-900 rounded-3xl p-10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Cpu size={120} className="text-blue-500 animate-pulse"/></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center animate-spin"><RefreshCw size={20}/></div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Pipeline Execution</h3>
                        <p className="text-blue-400 text-sm font-mono">Job ID: IRIS-NGS-{Math.floor(Math.random()*10000)}</p>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Total Progress</span>
                        <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="bg-black/50 rounded-2xl p-6 font-mono text-[11px] text-emerald-400 space-y-2 h-64 overflow-y-auto scrollbar-hide">
                    {processingLog.map((log, i) => (
                        <div key={i} className="flex gap-2">
                            <span className="text-emerald-800 shrink-0">#</span>
                            <span>{log}</span>
                        </div>
                    ))}
                    <div className="animate-pulse text-white">_</div>
                </div>
            </div>
        </div>
    </div>
  );

  const renderResults = () => {
    return (
        <div className="space-y-8 animate-fade-in max-w-6xl">
            {/* RESULTS HEADER */}
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <CheckCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">Final Analysis Report</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span className="font-bold text-slate-700">{metadata.sampleName || 'Laboratory_Isolate_01'}</span>
                            <span>•</span>
                            <span className="italic">{metadata.instrument}</span>
                            <span>•</span>
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{toolType?.replace('_',' ')}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex items-center gap-6">
                    <div className="px-6 border-r border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confidence</div>
                        <div className="text-2xl font-black text-blue-600">{pipelineConfidence}%</div>
                    </div>
                    <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 flex items-center gap-2 shadow-lg">
                        <Download size={18}/> Export Dataset
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. QUALITY CONTROL PANEL */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-8 flex items-center gap-2 uppercase tracking-wider text-sm">
                        <LineChartIcon className="text-blue-600" size={18}/> Read Quality Assessment (FastQC)
                    </h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={Array.from({ length: 150 }, (_, i) => ({ pos: i+1, q: 34 + Math.random() * 4 - (i > 120 ? (i-120)*0.5 : 0) }))}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="pos" hide />
                                <YAxis domain={[0, 40]} label={{ value: 'Phred (Q)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                                <Tooltip />
                                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" />
                                <Area type="monotone" dataKey="q" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-4 text-xs">
                        <div className="flex-1">
                            <span className="text-slate-500">Median Quality Score:</span>
                            <span className="font-bold ml-2 text-slate-800">Q36.2</span>
                        </div>
                        <div className="flex-1">
                            <span className="text-slate-500">Adapter Content:</span>
                            <span className="font-bold ml-2 text-green-600">PASSED</span>
                        </div>
                        <div className="flex-1">
                            <span className="text-slate-500">GC Content:</span>
                            <span className="font-bold ml-2 text-slate-800">54.2%</span>
                        </div>
                    </div>
                </div>

                {/* 2. SUMMARY STATS */}
                <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between">
                    <div>
                        <h4 className="font-bold mb-6 text-sm flex items-center gap-2 uppercase tracking-widest text-slate-400">
                           <Zap className="text-amber-400" size={18}/> Biological Insight
                        </h4>
                        <p className="text-lg leading-relaxed text-slate-300">
                            The analysis detected <strong className="text-white">high-level resistance markers</strong> indicating a stress-induced adaptive response.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                            <span className="text-xs text-slate-400">Detected Features</span>
                            <span className="font-bold text-xl">42</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-2">
                            <span className="text-xs text-slate-400">Identity with Ref</span>
                            <span className="font-bold text-xl text-emerald-400">99.8%</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-400">MLST Clade</span>
                            <span className="font-bold text-xl">ST131</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* DYNAMIC PIPELINE SPECIFIC VIEWS */}
            {toolType === 'RNA_SEQ' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 bg-white p-10 rounded-3xl border border-slate-200">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                                <Activity className="text-rose-600"/> Volcano Plot: Differentially Expressed Genes
                            </h4>
                            <div className="flex gap-4 text-[10px] font-bold">
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Up (log2FC &gt; 1.5)</span>
                                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Down (log2FC &lt; -1.5)</span>
                            </div>
                        </div>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="log2FoldChange" name="Log2FC" label={{ value: 'log2(Fold Change)', position: 'insideBottom', offset: -10 }} />
                                    <YAxis type="number" dataKey="pvalue" name="P-Value" tickFormatter={() => ''} label={{ value: '-log10(P)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <ReferenceLine x={1.5} stroke="#ef4444" strokeDasharray="3 3" />
                                    <ReferenceLine x={-1.5} stroke="#3b82f6" strokeDasharray="3 3" />
                                    <Scatter data={Array.from({ length: 100 }, (_, i) => ({ 
                                        gene: `g${i}`, 
                                        log2FoldChange: i < 15 ? 2 + Math.random() * 3 : i < 25 ? -2 - Math.random() * 2 : (Math.random() * 2) - 1, 
                                        pvalue: Math.random() * 0.1 
                                    }))}>
                                        {Array.from({ length: 100 }, (_, i) => i).map((i) => (
                                            <Cell key={i} fill={i < 15 ? '#ef4444' : i < 25 ? '#3b82f6' : '#cbd5e1'} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 text-xs uppercase mb-6 tracking-widest">Enriched Pathways</h4>
                        <div className="space-y-6">
                            {[
                                { name: 'Efflux Complex', val: 92, color: 'bg-rose-500' },
                                { name: 'Biofilm Matrix', val: 78, color: 'bg-amber-500' },
                                { name: 'Quorum Sensing', val: 45, color: 'bg-blue-500' },
                                { name: 'Metabolism', val: 22, color: 'bg-slate-300' }
                            ].map(p => (
                                <div key={p.name}>
                                    <div className="flex justify-between text-[10px] font-bold mb-2">
                                        <span className="text-slate-500 uppercase">{p.name}</span>
                                        <span className="text-slate-800">{p.val}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className={`${p.color} h-full`} style={{ width: `${p.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-8 italic leading-relaxed text-center">
                            Significant upregulation of MexAB-OprM efflux system observed post-chlorine exposure.
                        </p>
                    </div>
                </div>
            ) : toolType === '16S' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white p-10 rounded-3xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-10 flex items-center gap-2">
                            <Network className="text-indigo-600"/> Taxonomic Composition (Phylum Level)
                        </h4>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={TAXONOMY_DATA} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fontWeight: 'bold'}} />
                                    <Tooltip />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                        {TAXONOMY_DATA.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-10 rounded-3xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-10 flex items-center gap-2">
                            <PieChart className="text-teal-600"/> Community Diversity Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-8">
                             <div className="text-center p-6 bg-slate-50 rounded-3xl">
                                <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Shannon Index (H')</div>
                                <div className="text-3xl font-black text-slate-800">4.12</div>
                                <p className="text-[10px] text-slate-400 mt-2">High diversity community</p>
                             </div>
                             <div className="text-center p-6 bg-slate-50 rounded-3xl">
                                <div className="text-xs font-bold text-slate-400 mb-2 uppercase">Simpson's (D)</div>
                                <div className="text-3xl font-black text-slate-800">0.94</div>
                                <p className="text-[10px] text-slate-400 mt-2">Dominant species identified</p>
                             </div>
                             <div className="col-span-2 text-center p-6 border border-slate-100 rounded-3xl">
                                <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Identified ASVs</div>
                                <div className="text-4xl font-black text-indigo-600">842</div>
                                <p className="text-[10px] text-slate-400 mt-2">Post-Denoising via DADA2 Pipeline</p>
                             </div>
                        </div>
                    </div>
                </div>
            ) : toolType === 'WGS' ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-10 flex items-center gap-2">
                        <Info className="text-blue-600"/> Genomic Variant & MLST Profiling
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                                <tr>
                                    <th className="p-4">Gene / Locus</th>
                                    <th className="p-4">Variant Type</th>
                                    <th className="p-4">Impact</th>
                                    <th className="p-4">Clin. Interpretation</th>
                                    <th className="p-4">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { gene: 'gyrA (D87N)', type: 'Missense SNP', impact: 'HIGH', int: 'Ciprofloxacin Resistance', conf: '100%' },
                                    { gene: 'blaNDM-1', type: 'Acquired ARG', impact: 'CRITICAL', int: 'Carbapenem Hydrolysis', conf: '99.9%' },
                                    { gene: 'parC (S80I)', type: 'Missense SNP', impact: 'MEDIUM', int: 'Fluoroquinolone Resistance', conf: '100%' },
                                    { gene: 'mcr-1', type: 'Acquired ARG', impact: 'CRITICAL', int: 'Colistin Resistance (MCR)', conf: '98.5%' }
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-mono font-bold text-slate-700">{row.gene}</td>
                                        <td className="p-4 text-slate-600">{row.type}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.impact === 'CRITICAL' || row.impact === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {row.impact}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-slate-800">{row.int}</td>
                                        <td className="p-4 text-emerald-600 font-bold">{row.conf}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div className="bg-white p-10 rounded-3xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm mb-10 flex items-center gap-2">
                            <Layers className="text-teal-600"/> Resistome Abundance Matrix
                        </h4>
                        <div className="space-y-6">
                            {METAGENOME_RESISTOME.map(r => (
                                <div key={r.class} className="flex items-center gap-6">
                                    <div className="w-32 font-bold text-slate-600 text-xs uppercase">{r.class}</div>
                                    <div className="flex-1 bg-slate-100 h-8 rounded-lg overflow-hidden relative border border-slate-200 shadow-inner">
                                        <div className="bg-teal-500 h-full transition-all" style={{ width: `${r.abundance * 4}%` }}></div>
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">{r.abundance} RPKM</span>
                                    </div>
                                    <div className={`w-20 text-[10px] font-bold text-center py-1 rounded-full ${r.risk === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : r.risk === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {r.risk}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 text-white p-10 rounded-3xl flex flex-col justify-center">
                        <div className="text-center mb-8">
                            <div className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-2">Overall Community Risk</div>
                            <div className="text-6xl font-black">CRITICAL</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-sm italic leading-relaxed text-slate-400">
                            "The sample exhibits a multi-drug resistant population structure with a significant proportion of carbapenemase genes (blaKPC, blaNDM) linked to mobile genetic elements."
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 text-left">
        <button onClick={goBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">NGS Pipeline Analysis</h2>
          <p className="text-sm text-slate-500 italic">Advanced High-Throughput Sequencing & Bioinformatics Workbench</p>
        </div>
      </div>

      {workflow === 'SELECT' && renderSelect()}
      {workflow === 'CONFIG' && renderConfig()}
      {workflow === 'PROCESSING' && renderProcessing()}
      {workflow === 'RESULTS' && renderResults()}
    </div>
  );
};

export default NGSAnalysisTool;
