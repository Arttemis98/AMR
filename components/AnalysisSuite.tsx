import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
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
  Search,
  ArrowLeft,
  Download,
  Printer
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
import { GeneExpression, EnrichmentTerm, BlastHit, AMRReport } from '../types';
import GeneMechanismTable from './GeneMechanismTable';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import AdvancedNGSAnalytics from './AdvancedNGSAnalytics';
import PCRAnalysisSuite from './PCRAnalysisSuite';

// --- MOCK DATA ---
const MOCK_GENE_DATA: GeneExpression[] = [
  { gene: 'mexA', log2FoldChange: 2.5, pvalue: 0.0001, significance: 'UP', function: 'Efflux Pump' },
  { gene: 'mexB', log2FoldChange: 2.8, pvalue: 0.00001, significance: 'UP', function: 'Efflux Pump' },
  { gene: 'recA', log2FoldChange: 3.2, pvalue: 0.000001, significance: 'UP', function: 'SOS Response' },
  { gene: 'ompF', log2FoldChange: -2.1, pvalue: 0.001, significance: 'DOWN', function: 'Porin' },
  { gene: 'lexA', log2FoldChange: 1.5, pvalue: 0.02, significance: 'UP', function: 'Repressor' },
  ...Array.from({ length: 40 }, (_, i) => ({
    gene: `gene_${i}`,
    log2FoldChange: (Math.random() * 4) - 2,
    pvalue: Math.random(),
    significance: 'NS' as const
  }))
];

const MOCK_ANTIBIOGRAM = [
  { antibiotic: 'Ciprofloxacin', Control: 28, Treated: 18, Breakpoint: 21 },
  { antibiotic: 'Gentamicin', Control: 22, Treated: 12, Breakpoint: 15 },
  { antibiotic: 'Ceftazidime', Control: 25, Treated: 15, Breakpoint: 18 },
  { antibiotic: 'Imipenem', Control: 30, Treated: 28, Breakpoint: 20 },
];

type AnalysisTab = 'antibiogram' | 'genomics' | 'molecular' | 'report';

const AnalysisSuite: React.FC<{ report: AMRReport | null, onBack: () => void }> = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('antibiogram');
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    // Simulate initial loading/processing of the selected report
    const timer = setTimeout(() => {
        setIsSimulating(false);
        // Auto-select tab based on report type
        if (report?.dataType === 'AST_ONLY') setActiveTab('antibiogram');
        else if (report?.dataType === 'RNA_SEQ' || report?.dataType === 'WGS') setActiveTab('genomics');
        else if (report?.dataType === 'PCR') setActiveTab('molecular');
        else setActiveTab('report');
    }, 1500);
    return () => clearTimeout(timer);
  }, [report]);

  const handleDownload = () => {
    window.print();
  };

  if (!report) return <div>No report selected</div>;

  const TabButton = ({ id, label, icon: Icon }: { id: AnalysisTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
        activeTab === id 
          ? 'border-blue-600 text-blue-600 font-medium' 
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );

  const renderSimulating = () => (
      <div className="flex flex-col items-center justify-center h-[500px]">
          <Cpu className="text-blue-600 animate-pulse mb-6" size={48} />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing {report.dataType} Data</h3>
          <p className="text-slate-500 font-mono text-sm">Loading pipeline for {report.id} ({report.organism})...</p>
      </div>
  );

  const renderAntibiogram = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Microscope className="mr-2 text-teal-600" size={20}/>
          Antibiogram Profile: {report.organism}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_ANTIBIOGRAM} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="antibiotic" tick={{fontSize: 12}} />
              <YAxis label={{ value: 'Zone of Inhibition (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
              <Legend />
              <ReferenceLine y={18} label="Resistant Breakpoint" stroke="red" strokeDasharray="3 3" />
              <Bar dataKey="Control" fill="#10b981" name="Standard" radius={[4, 4, 0, 0]} />
              {report.source === 'WWTP' && <Bar dataKey="Treated" fill="#f43f5e" name="Post-Chlorination" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-800 mb-2">Interpretation</h3>
           <p className="text-sm text-slate-600 mb-4">
               The isolate shows clear resistance to Fluoroquinolones and Cephalosporins. 
               {report.source === 'WWTP' && " The post-chlorination samples indicate a stress-hardened phenotype."}
           </p>
           <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
               <span className="text-xs font-bold text-rose-700 uppercase">Alert Level</span>
               <p className="text-xl font-bold text-rose-800">{report.resistanceFlag}</p>
           </div>
       </div>
    </div>
  );

  const renderGenomics = () => {
      // Logic split for RNA-Seq vs WGS
      if (report.dataType === 'RNA_SEQ') {
          return (
             <div className="space-y-6 animate-fade-in">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Transcriptomic Response (Volcano Plot)</h3>
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
                          </ScatterChart>
                        </ResponsiveContainer>
                     </div>
                 </div>
                 
                 <div className="flex flex-col gap-0">
                     <GeneMechanismTable data={MOCK_GENE_DATA} />
                     <CoOccurrenceNetwork />
                 </div>

                 {/* Advanced Visuals for RNA-Seq */}
                 <AdvancedNGSAnalytics dataType="RNA_SEQ" />
             </div>
          );
      } else if (report.dataType === 'WGS') {
          return (
            <div className="space-y-6 animate-fade-in">
               <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start gap-4">
                   <Dna size={32} className="text-blue-600 shrink-0 mt-1" />
                   <div>
                       <h3 className="text-lg font-bold text-blue-900">Whole Genome Sequence Analysis</h3>
                       <p className="text-blue-700 text-sm mt-1">
                           Analysis of the <strong>{report.organism}</strong> genome reveals multiple acquired resistance mechanisms. 
                           Chromosomal mutations in QRDR regions and plasmid-borne beta-lactamases suggest a high-risk MDR clone.
                       </p>
                   </div>
               </div>

               {/* Advanced Visuals for WGS */}
               <AdvancedNGSAnalytics dataType="WGS" />
            </div>
          );
      }
      return null;
  };

  return (
    <div className="space-y-6 print:p-8">
      <div className="flex items-center justify-between mb-4 print:hidden">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Report Analysis: {report.id}</h2>
                <div className="flex gap-3 text-slate-500 text-sm">
                   <span>{report.location.city}</span>
                   <span>•</span>
                   <span>{report.source}</span>
                   <span>•</span>
                   <span>{report.dataType}</span>
                </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <button 
                onClick={handleDownload} 
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-sm mb-2"
             >
                <Printer size={18} />
                <span>Print / Save PDF</span>
             </button>
             <div className="text-right text-xs text-slate-500">
                <p>Submitted by: <span className="font-semibold text-slate-700">{report.submittedBy || 'Unknown User'}</span></p>
                <p>Date: <span className="font-semibold text-slate-700">{report.date}</span></p>
             </div>
          </div>
      </div>

      {isSimulating ? renderSimulating() : (
          <>
            <div className="bg-white border-b border-slate-200 px-6 pt-4 sticky top-0 z-10 shadow-sm rounded-t-xl overflow-x-auto print:hidden">
                <div className="flex space-x-6 min-w-max">
                    <TabButton id="antibiogram" label="Phenotypic (AST)" icon={Activity} />
                    {(report.dataType === 'RNA_SEQ' || report.dataType === 'WGS') && (
                        <TabButton id="genomics" label={report.dataType === 'WGS' ? 'Genomics (WGS)' : 'Transcriptomics'} icon={Dna} />
                    )}
                    {report.dataType === 'PCR' && (
                        <TabButton id="molecular" label="Molecular (PCR)" icon={Dna} />
                    )}
                    <TabButton id="report" label="AI Summary" icon={FileText} />
                </div>
            </div>

            <div className="min-h-[400px]" id="downloadable-report">
                {activeTab === 'antibiogram' && renderAntibiogram()}
                {activeTab === 'genomics' && renderGenomics()}
                {activeTab === 'molecular' && <PCRAnalysisSuite geneTarget={report.summary.match(/blaNDM-1|mecA|tetA|16S rRNA/)?.[0] || 'blaNDM-1'} />}
                {activeTab === 'report' && (
                    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-fade-in print:border-0 print:shadow-none">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Automated Surveillance Report</h3>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Report ID: {report.id}</p>
                                <p className="text-xs text-slate-500">Date: {report.date}</p>
                                <p className="text-xs text-slate-500">Submitted By: {report.submittedBy}</p>
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed mb-4 text-justify">
                            Based on the submitted data from <strong>{report.location.siteName}</strong>, the isolate identified as <em>{report.organism}</em> exhibits a <strong>{report.resistanceFlag}</strong> resistance profile. 
                            {report.dataType === 'RNA_SEQ' && " Genomic analysis confirms the activation of intrinsic resistance mechanisms triggered by environmental stress (Chlorine)."}
                            {report.dataType === 'WGS' && " Whole genome sequencing confirms the presence of high-risk plasmid-mediated resistance genes (e.g., blaNDM-1)."}
                            {report.dataType === 'PCR' && " Molecular screening via PCR has confirmed the presence of specific resistance markers, validating the phenotypic findings."}
                        </p>
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg mb-6">
                            <h4 className="font-bold text-blue-900 mb-1">Recommendation</h4>
                            <p className="text-sm text-blue-800">
                                Immediate review of chlorination protocols at the WWTP is advised. Environmental containment measures should be enacted to prevent downstream contamination of the river system.
                            </p>
                        </div>
                        
                        {/* Include components in report view for printing */}
                        <div className="hidden print:block space-y-8">
                             <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Supplemental Data</h4>
                             <div className="break-inside-avoid">
                                <h5 className="text-sm font-bold text-slate-600 mb-2">Genomic Analysis</h5>
                                {report.dataType === 'RNA_SEQ' && <GeneMechanismTable data={MOCK_GENE_DATA} />}
                                {report.dataType === 'WGS' && <AdvancedNGSAnalytics dataType="WGS" />}
                                {report.dataType === 'PCR' && <PCRAnalysisSuite geneTarget={report.summary.match(/blaNDM-1|mecA|tetA|16S rRNA/)?.[0] || 'blaNDM-1'} />}
                             </div>
                        </div>
                    </div>
                )}
            </div>
          </>
      )}
    </div>
  );
};

export default AnalysisSuite;