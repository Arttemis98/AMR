import React, { Suspense, lazy, useState, useEffect } from 'react';
import {
  Dna,
  Activity,
  FileText,
  Microscope,
  ArrowLeft,
  Printer,
  AlertTriangle,
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
} from 'recharts';
import { GeneExpression, AMRReport } from '../types';
import GeneMechanismTable from './GeneMechanismTable';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import AdvancedNGSAnalytics from './AdvancedNGSAnalytics';

const PCRAnalysisSuite = lazy(() => import('./PCRAnalysisSuite'));

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
    significance: 'NS' as const,
  })),
];

const MOCK_ANTIBIOGRAM = [
  { antibiotic: 'Ciprofloxacin', Control: 28, Treated: 18, Breakpoint: 21 },
  { antibiotic: 'Gentamicin', Control: 22, Treated: 12, Breakpoint: 15 },
  { antibiotic: 'Ceftazidime', Control: 25, Treated: 15, Breakpoint: 18 },
  { antibiotic: 'Imipenem', Control: 30, Treated: 28, Breakpoint: 20 },
];

type AnalysisTab = 'antibiogram' | 'genomics' | 'molecular' | 'report';

const SampleDataBanner: React.FC<{ detail?: string }> = ({ detail }) => (
  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2.5 text-amber-900 text-xs">
    <AlertTriangle size={16} className="text-amber-600 shrink-0" />
    <span>
      <strong>Illustrative sample data, not derived from this report</strong>
      {detail ? ` — ${detail}` : '.'}
    </span>
  </div>
);

function getDefaultTab(report: AMRReport | null): AnalysisTab {
  if (report?.dataType === 'AST_ONLY') return 'antibiogram';
  if (report?.dataType === 'RNA_SEQ' || report?.dataType === 'WGS') return 'genomics';
  if (report?.dataType === 'PCR') return 'molecular';
  return 'report';
}

const AnalysisSuite: React.FC<{ report: AMRReport | null; onBack: () => void }> = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>(() => getDefaultTab(report));

  useEffect(() => {
    setActiveTab(getDefaultTab(report));
  }, [report]);

  const handleDownload = () => {
    window.print();
  };

  if (!report) return <div>No report selected</div>;

  const TabButton = ({ id, label, icon: Icon }: { id: AnalysisTab; label: string; icon: any }) => (
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

  const renderAntibiogram = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <SampleDataBanner detail="Zone measurements below are reference demo values" />
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Microscope className="mr-2 text-teal-600" size={20} />
          Antibiogram Profile: {report.organism}
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_ANTIBIOGRAM} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="antibiotic" tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Zone of Inhibition (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
              <Legend />
              <ReferenceLine y={18} label="Resistant Breakpoint" stroke="red" strokeDasharray="3 3" />
              <Bar dataKey="Control" fill="#10b981" name="Standard" radius={[4, 4, 0, 0]} />
              {report.source === 'WWTP' && <Bar dataKey="Treated" fill="#f43f5e" name="Post-Chlorination" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-2">Report Metadata</h3>
        <p className="text-sm text-slate-600 mb-4">
          {report.summary}
        </p>
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
          <span className="text-xs font-bold text-rose-700 uppercase">Alert Level</span>
          <p className="text-xl font-bold text-rose-800">{report.resistanceFlag}</p>
        </div>
      </div>
    </div>
  );

  const renderGenomics = () => {
    if (report.dataType === 'RNA_SEQ') {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SampleDataBanner detail="Differential expression points are synthetic demo values" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Transcriptomic Response (Volcano Plot)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="log2FoldChange" name="Log2FC" />
                  <YAxis type="number" dataKey="pvalue" name="p-value" tickFormatter={() => ''} label={{ value: '-Log10(P)', angle: -90, position: 'insideLeft' }} />
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

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SampleDataBanner detail="Gene mechanism table & co-occurrence network show reference sample patterns" />
            <div className="flex flex-col gap-0">
              <GeneMechanismTable data={MOCK_GENE_DATA} />
              <CoOccurrenceNetwork />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SampleDataBanner detail="Advanced RNA-Seq charts below use illustrative sample profiles" />
            <AdvancedNGSAnalytics dataType="RNA_SEQ" />
          </div>
        </div>
      );
    } else if (report.dataType === 'WGS') {
      return (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl flex items-start gap-4">
            <Dna size={32} className="text-blue-600 shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-900">Whole Genome Sequence Summary</h3>
              <p className="text-blue-700 text-sm mt-1">
                Submitted organism: <strong>{report.organism}</strong> ({report.standard || 'CLSI M100'}). Reported findings: {report.summary}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <SampleDataBanner detail="WGS charts below use illustrative sample profiles" />
            <AdvancedNGSAnalytics dataType="WGS" />
          </div>
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

      <div className="bg-white border-b border-slate-200 px-6 pt-4 sticky top-0 z-10 shadow-sm rounded-t-xl overflow-x-auto print:hidden">
        <div className="flex space-x-6 min-w-max">
          <TabButton id="antibiogram" label="Phenotypic (AST)" icon={Activity} />
          {(report.dataType === 'RNA_SEQ' || report.dataType === 'WGS') && (
            <TabButton id="genomics" label={report.dataType === 'WGS' ? 'Genomics (WGS)' : 'Transcriptomics'} icon={Dna} />
          )}
          {report.dataType === 'PCR' && (
            <TabButton id="molecular" label="Molecular (PCR)" icon={Dna} />
          )}
          <TabButton id="report" label="Summary" icon={FileText} />
        </div>
      </div>

      <div className="min-h-[400px]" id="downloadable-report">
        {activeTab === 'antibiogram' && renderAntibiogram()}
        {activeTab === 'genomics' && renderGenomics()}
        {activeTab === 'molecular' && (
          <div className="space-y-4">
            <SampleDataBanner detail="In-silico PCR amplification curve uses illustrative demo parameters" />
            <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading PCR Suite...</div>}>
              <PCRAnalysisSuite geneTarget={report.summary.match(/blaNDM-1|mecA|tetA|16S rRNA/)?.[0] || 'blaNDM-1'} />
            </Suspense>
          </div>
        )}
        {activeTab === 'report' && (
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-fade-in print:border-0 print:shadow-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Surveillance Report Summary</h3>
              <div className="text-right">
                <p className="text-xs text-slate-500">Report ID: {report.id}</p>
                <p className="text-xs text-slate-500">Date: {report.date}</p>
                <p className="text-xs text-slate-500">Submitted By: {report.submittedBy}</p>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4 text-justify">
              Based on the submitted data from <strong>{report.location.siteName}</strong>, the isolate identified as <em>{report.organism}</em> carries a <strong>{report.resistanceFlag}</strong> risk flag. Reported summary: {report.summary}
            </p>
            {report.fileName && (
              <p className="text-xs text-slate-500 mb-4 font-mono">
                Attached dataset: {report.fileName} {report.filePath ? `(Stored at ${report.filePath})` : ''}
              </p>
            )}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6 text-xs text-amber-900">
              <strong>Note:</strong> Supplemental charts in this suite render illustrative reference datasets alongside your stored report metadata.
            </div>

            <div className="hidden print:block space-y-8">
              <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2">Supplemental Illustrative Data</h4>
              <div className="break-inside-avoid">
                <h5 className="text-sm font-bold text-slate-600 mb-2">Genomic Analysis</h5>
                {report.dataType === 'RNA_SEQ' && <GeneMechanismTable data={MOCK_GENE_DATA} />}
                {report.dataType === 'WGS' && <AdvancedNGSAnalytics dataType="WGS" />}
                {report.dataType === 'PCR' && (
                  <Suspense fallback={null}>
                    <PCRAnalysisSuite geneTarget={report.summary.match(/blaNDM-1|mecA|tetA|16S rRNA/)?.[0] || 'blaNDM-1'} />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSuite;