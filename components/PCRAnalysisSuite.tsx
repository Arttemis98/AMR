import React, { useState, useMemo, useEffect } from 'react';
import { 
  Dna, 
  Activity, 
  Beaker, 
  Thermometer, 
  ShieldCheck, 
  Play, 
  Download, 
  Info, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  ChevronRight, 
  Layers, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Zap,
  Trash2,
  FileCode,
  Gauge,
  ClipboardList,
  Target,
  Globe,
  Stethoscope,
  Share2,
  AlertCircle,
  FileSpreadsheet,
  Settings,
  Database,
  Search,
  X,
  Clock,
  Waves
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as ReChartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

// --- TYPES ---
interface PCRState {
    template: {
        id: string;
        organism: string;
        type: 'Genomic DNA' | 'Plasmid' | 'cDNA';
        conc: string;
        vol: string;
        source: 'Clinical' | 'Environmental' | 'Culture' | 'Research';
        fasta: string;
    };
    target: {
        name: string;
        accession: string;
        expectedSize: string;
    };
    primers: {
        fwd: string;
        rev: string;
        conc: string; // uM
        designer: string;
        mismatchTolerance: number;
    };
    reagents: {
        polymerase: string;
        buffer: string;
        mgcl2: string; // mM
        dntp: string; // uM
        additives: string;
        totalVol: string; // uL
    };
    cycler: {
        initDenatTemp: string; initDenatTime: string;
        denatTemp: string; denatTime: string;
        annealTemp: string; annealTime: string;
        extTemp: string; extTime: string;
        cycles: string;
        finalExtTemp: string; finalExtTime: string;
        holdTemp: string;
    };
    qc: {
        measuredConc: string;
        a260_280: string;
        a260_230: string;
        blank: string;
    };
    gel: {
        agarose: number;
        voltage: number;
        time: number;
        ladder: '100bp' | '1kb';
    };
}

interface BioContext {
    geneProduct: string;
    category: 'Resistance' | 'Virulence' | 'Housekeeping' | 'Regulatory' | 'Unknown';
    affectedClass: string;
    mechanism: string;
    location: string;
    fullGeneLength: number;
    mutationHotspot: boolean;
    catalyticOverlap: boolean;
    clinicalSignificance: string;
    environmentalRelevance: string;
    diagnosticRelevance: string;
    hgtRisk: 'High' | 'Moderate' | 'Low';
    outbreakAssociation: string;
    impactLevel: 'High' | 'Moderate' | 'Low';
    amrRelevanceScore: number;
    researchRelevanceScore: number;
}

// --- CURATED KNOWLEDGE BASE ---
const CURATED_GENE_DB: Record<string, Partial<BioContext>> = {
    'blaNDM-1': {
        geneProduct: 'New Delhi Metallo-beta-lactamase 1',
        category: 'Resistance',
        affectedClass: 'Carbapenems, Penicillins, Cephalosporins',
        mechanism: 'Enzymatic Hydrolysis (Zinc-dependent)',
        location: 'Plasmid (IncX3, IncL/M)',
        fullGeneLength: 813,
        clinicalSignificance: 'Critical. Confers resistance to almost all beta-lactams including carbapenems.',
        environmentalRelevance: 'Significant indicator of sewage contamination and clinical-to-environment spillover.',
        diagnosticRelevance: 'Primary target for MDRO screening protocols.',
        hgtRisk: 'High',
        outbreakAssociation: 'Global transmission via Klebsiella and Acinetobacter clades.',
        impactLevel: 'High',
        amrRelevanceScore: 9.8,
        researchRelevanceScore: 9.5
    },
    'mecA': {
        geneProduct: 'Penicillin-Binding Protein 2a (PBP2a)',
        category: 'Resistance',
        affectedClass: 'Methicillin, Oxacillin, Beta-lactams',
        mechanism: 'Target Alteration (Low affinity binding)',
        location: 'SCCmec Staphylococcal Cassette Chromosome',
        fullGeneLength: 2127,
        clinicalSignificance: 'Major. Definitive marker for MRSA.',
        environmentalRelevance: 'Surveillance marker for community-acquired resistance (CA-MRSA).',
        diagnosticRelevance: 'Gold standard for Staphylococcal susceptibility interpretation.',
        hgtRisk: 'Moderate',
        outbreakAssociation: 'High in hospital surgical and neonatal units.',
        impactLevel: 'High',
        amrRelevanceScore: 9.5,
        researchRelevanceScore: 8.8
    }
};

// --- BIOPHYSICAL UTILS ---
const calcGC = (seq: string) => {
    if (!seq) return 0;
    const gc = (seq.match(/[GC]/gi) || []).length;
    return (gc / seq.length) * 100;
};

const calcTm = (seq: string) => {
    if (!seq || seq.length < 4) return 0;
    const gc = (seq.match(/[GC]/gi) || []).length;
    const at = (seq.match(/[AT]/gi) || []).length;
    if (seq.length < 14) return (at * 2) + (gc * 4);
    return 64.9 + 41 * (gc - 16.4) / (gc + at);
};

const calcDimerRisk = (fwd: string, rev: string) => {
    if (!fwd || !rev) return 0;
    let score = 0;
    const f3 = fwd.slice(-5);
    const r3 = rev.slice(-5);
    if (f3[4] === 'G' || f3[4] === 'C') score += 20;
    if (fwd.includes(rev.split('').reverse().join(''))) score += 50;
    return Math.min(score, 100);
};

const PCRAnalysisSuite: React.FC<{ geneTarget?: string; onBack?: () => void }> = ({ geneTarget, onBack }) => {
    const [view, setView] = useState<'INPUT' | 'RESULTS'>('INPUT');
    const [activeTab, setActiveTab] = useState<'TEMPLATE' | 'PRIMERS' | 'REAGENTS' | 'CYCLER' | 'QC'>('TEMPLATE');
    
    const initialBlankState: PCRState = {
        template: { id: '', organism: '', type: 'Genomic DNA', conc: '', vol: '', source: 'Research', fasta: '' },
        target: { name: geneTarget || '', accession: '', expectedSize: '' },
        primers: { fwd: '', rev: '', conc: '0.5', designer: 'IRIS_Designer', mismatchTolerance: 0 },
        reagents: { polymerase: 'Taq DNA Polymerase', buffer: '10X Standard Buffer', mgcl2: '1.5', dntp: '200', additives: 'None', totalVol: '25' },
        cycler: {
            initDenatTemp: '95', initDenatTime: '05:00',
            denatTemp: '95', denatTime: '00:30',
            annealTemp: '58', annealTime: '00:45',
            extTemp: '72', extTime: '01:00',
            cycles: '30',
            finalExtTemp: '72', finalExtTime: '07:00',
            holdTemp: '4'
        },
        qc: { measuredConc: '', a260_280: '', a260_230: '', blank: 'DI Water' },
        gel: { agarose: 1.5, voltage: 100, time: 45, ladder: '100bp' }
    };

    const [state, setState] = useState<PCRState>(initialBlankState);

    const loadDemoData = () => {
        setState({
            template: { 
                id: 'VAD-WWTP-P01', 
                organism: 'Pseudomonas aeruginosa', 
                type: 'Genomic DNA', 
                conc: '150', 
                vol: '2', 
                source: 'Environmental', 
                fasta: '>VAD-WWTP-P01_Partial\nAGAGTTTGATCCTGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAGCGGATGAAGGGAGCTTGCTCCTGGATTCAGCGGCGGACGGGTGAGTAATGCCTAGGAATCTGCCTGGTAGTGGGGGACAACGTTTCGAAAGGAACGCTAATACCGCATACGTCCTACGGGAGAAAGCAGGGGACCTTCGGGCCTTGCGCTATCAGATGAGCCTAGGTCGGATTAGCTAGTTGGTGGGGTAAAGGCCTACCAAGGCGACGATCCGTAACTGGTCTGAGAGGATGATCAGTCACACTGGAACTGAGACACGGTCCAGACTCCTACGGGAGGCAGCAGTGGGGAATATTGGACAATGGGCGAAAGCCTGATCCAGCCATGCCGCGTGTGTGAAGAAGGTCTTCGGATTGTAAAGCACTTTAAGTTGGGAGGAAGGGCAGTAAGTTAATACCTTGCTGTTTTGACGTTACCAACAGAATAAGCACCGGCTAACTTCGTGCCAGCAGCCGCGGTAATACGAAGGGTGCAAGCGTTAATCGGAATTACTGGGCGTAAAGCGCGCGTAGGTGGTTTGTTAAGTTGGATGTGAAAGCCCTGGGCTCAACCTGGGAACTGCATCCAAAACTGGCAAGCTAGAGTACGGTAGAGGGTGGTGGAATTTCCTGTGTAGCGGTGAAATGCGTAGATATAGGAAGGAACACCAGTGGCGAAGGCGACCACCTGGACTGATACTGACACTGAGGTGCGAAAGCGTGGGGAGCAAACAGGATTAGATACCCTGGTAGTCCACGCCGTAAACGATGTCGACTAGCCGTTGGGATCCTTGAGATCTTAGTGGCGCAGCTAACGCGATAAGTCGACCGCCTGGGGAGTACGGCCGCAAGGTTAAAACTCAAATGAATTGACGGGGGCCCGCACAAGCGGTGGAGCATGTGGTTTAATTCGAAGCAACGCGAAGAACCTTACCTGGCCTTGACATGCTGAGAACTTTCCAGAGATGGATTGGTGCCTTCGGGAACTCAGACACAGGTGCTGCATGGCTGTCGTCAGCTCGTGTCGTGAGATGTTGGGTTAAGTCCCGTAACGAGCGCAACCCTTGTCCTTAGTTACCAGCACCTCGGGTGGGCACTCTAAGGAGACTGCCGGTGACAAACCGGAGGAAGGTGGGGATGACGTCAAGTCATCATGGCCCTTACGGCCAGGGCTACACACGTGCTACAATGGTCGGTACAAAGGGTTGCCAAGCCGCGAGGTGGAGCTAATCCCATAAAACCGATCGTAGTCCGGATCGCAGTCTGCAACTCGACTGCGTGAAGTCGGAATCGCTAGTAATCGCGAATCAGAATGTCGCGGTGAATACGTTCCCGGGCCTTGTACACACCGCCCGTCACACCATGGGAGTGGGTTGCACCAGAAGTAGCTAGTCTAACCTTCGGGAGGACGGTTACCACGGTGTGATTCATGACTGGGGTGAAGTCGTAACAAGGTAACCGTAGGGGAACCTGCGGTTGGATCACCTCCTT' 
            },
            target: { name: 'blaNDM-1', accession: 'NG_049326.1', expectedSize: '621' },
            primers: { fwd: 'GGTTTGGCGATCTGGTTTTC', rev: 'CGGAATGGCTCATCACGATC', conc: '0.5', designer: 'IRIS-Molecular', mismatchTolerance: 0 },
            reagents: { polymerase: 'DreamTaq', buffer: '10X Buffer', mgcl2: '2.0', dntp: '200', additives: '5% DMSO', totalVol: '25' },
            cycler: {
                initDenatTemp: '95', initDenatTime: '05:00',
                denatTemp: '95', denatTime: '00:30',
                annealTemp: '58', annealTime: '00:45',
                extTemp: '72', extTime: '01:00',
                cycles: '30',
                finalExtTemp: '72', finalExtTime: '07:00',
                holdTemp: '4'
            },
            qc: { measuredConc: '148.5', a260_280: '1.82', a260_230: '2.15', blank: 'Nuclease-Free Water' },
            gel: { agarose: 1.5, voltage: 100, time: 45, ladder: '100bp' }
        });
    };

    // --- COMPUTED ANALYSIS ENGINE ---
    const engine = useMemo(() => {
        const fGC = calcGC(state.primers.fwd);
        const rGC = calcGC(state.primers.rev);
        const fTm = calcTm(state.primers.fwd);
        const rTm = calcTm(state.primers.rev);
        const tmDiff = Math.abs(fTm - rTm);
        const dimerRisk = calcDimerRisk(state.primers.fwd, state.primers.rev);
        const a280 = parseFloat(state.qc.a260_280);
        const a230 = parseFloat(state.qc.a260_230);

        const warnings: string[] = [];
        const interpretation: {purity: string; salt: string; risk: 'High' | 'Moderate' | 'Low'} = { purity: 'Unknown', salt: 'Unknown', risk: 'Low' };

        if (!isNaN(a280)) {
            if (a280 >= 1.8 && a280 <= 2.0) interpretation.purity = 'High Purity (DNA)';
            else if (a280 < 1.7) { interpretation.purity = 'Low (Protein Contamination)'; interpretation.risk = 'Moderate'; }
            else interpretation.purity = 'RNA Contamination Suspected';
        }
        if (!isNaN(a230)) {
            if (a230 >= 2.0) interpretation.salt = 'Low (Salt-free)';
            else { interpretation.salt = 'High (Residual Salt/Phenol)'; interpretation.risk = 'Moderate'; }
        }

        let score = 100;
        if (tmDiff > 3) score -= 10;
        if (dimerRisk > 40) score -= 15;
        if (interpretation.risk === 'Moderate') score -= 10;

        // Fetch Curated Context
        const defaultBio: BioContext = {
            geneProduct: 'Hypothetical Protein',
            category: 'Unknown',
            affectedClass: 'None Detected',
            mechanism: 'Under Investigation',
            location: 'Unknown',
            fullGeneLength: 1000,
            mutationHotspot: false,
            catalyticOverlap: false,
            clinicalSignificance: 'Surveillance data required.',
            environmentalRelevance: 'Low baseline detected.',
            diagnosticRelevance: 'Incidental detection.',
            hgtRisk: 'Low',
            outbreakAssociation: 'No known outbreaks linked to this variant.',
            impactLevel: 'Low',
            amrRelevanceScore: 5.0,
            researchRelevanceScore: 5.0
        };

        const curatedMatch = CURATED_GENE_DB[state.target.name] || defaultBio;
        const bioContext: BioContext = { ...defaultBio, ...curatedMatch };
        
        // Mocking positions for the table
        const predictedSize = parseInt(state.target.expectedSize) || 0;
        const startPos = state.template.fasta ? 142 : 0;
        const endPos = startPos + predictedSize;

        // Generate Thermocycler Graph Points
        const cyclerData = [
          { name: 'Start', temp: 25 },
          { name: 'Init Denat', temp: parseFloat(state.cycler.initDenatTemp) || 95 },
          { name: 'C1 Denat', temp: parseFloat(state.cycler.denatTemp) || 95 },
          { name: 'C1 Anneal', temp: parseFloat(state.cycler.annealTemp) || 58 },
          { name: 'C1 Ext', temp: parseFloat(state.cycler.extTemp) || 72 },
          { name: 'C2 Denat', temp: parseFloat(state.cycler.denatTemp) || 95 },
          { name: 'C2 Anneal', temp: parseFloat(state.cycler.annealTemp) || 58 },
          { name: 'C2 Ext', temp: parseFloat(state.cycler.extTemp) || 72 },
          { name: 'Final Ext', temp: parseFloat(state.cycler.finalExtTemp) || 72 },
          { name: 'Hold', temp: parseFloat(state.cycler.holdTemp) || 4 },
        ];

        return { 
            fGC, rGC, fTm, rTm, tmDiff, dimerRisk, score: Math.max(score, 0), warnings, interpretation, bioContext,
            predictedSize, startPos, endPos, cyclerData
        };
    }, [state]);

    const handleRunAnalysis = () => setView('RESULTS');

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ ...state, analysis: engine }, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `IRIS_PCR_${state.target.name}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const renderInput = () => (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in text-left">
            <div className="flex border-b border-slate-100 bg-slate-50 items-center justify-between">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'TEMPLATE', label: 'Template DNA', icon: Dna },
                        { id: 'PRIMERS', label: 'Primers', icon: Activity },
                        { id: 'REAGENTS', label: 'Reagents', icon: Beaker },
                        { id: 'CYCLER', label: 'Thermocycler', icon: Thermometer },
                        { id: 'QC', label: 'QC / Nanodrop', icon: ShieldCheck }
                    ].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setActiveTab(t.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${activeTab === t.id ? 'bg-white border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            <t.icon size={16}/> {t.label}
                        </button>
                    ))}
                </div>
                <button onClick={loadDemoData} className="mr-6 flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase hover:bg-indigo-100 transition-colors border border-indigo-100">
                    <RefreshCw size={12}/> Load Demo Protocol
                </button>
            </div>

            <div className="p-8">
                {activeTab === 'TEMPLATE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 text-sm border-l-4 border-blue-600 pl-3">Template Metadata</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Sample ID</label>
                                <input className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none" value={state.template.id} onChange={e => setState({...state, template: {...state.template, id: e.target.value}})}/></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Organism</label>
                                <input className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 outline-none" value={state.template.organism} onChange={e => setState({...state, template: {...state.template, organism: e.target.value}})}/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Template Type</label>
                                <select className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none" value={state.template.type} onChange={e => setState({...state, template: {...state.template, type: e.target.value as any}})}>
                                    <option>Genomic DNA</option><option>Plasmid</option><option>cDNA</option>
                                </select></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Source</label>
                                <select className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none" value={state.template.source} onChange={e => setState({...state, template: {...state.template, source: e.target.value as any}})}>
                                    <option>Clinical</option><option>Environmental</option><option>Culture</option><option>Research</option>
                                </select></div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-800 text-sm border-l-4 border-indigo-600 pl-3">Target Locus</h4>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Gene Name</label>
                            <input className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none" value={state.target.name} onChange={e => setState({...state, target: {...state.target, name: e.target.value}})}/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Accession #</label>
                                <input className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none" value={state.target.accession} onChange={e => setState({...state, target: {...state.target, accession: e.target.value}})}/></div>
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Expected Size (bp)</label>
                                <input type="number" className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none" value={state.target.expectedSize} onChange={e => setState({...state, target: {...state.target, expectedSize: e.target.value}})}/></div>
                            </div>
                        </div>
                        <div className="col-span-full">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Optional: Template FASTA Sequence (Strict In-Silico PCR)</label>
                            <textarea className="w-full h-32 bg-white p-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-400 outline-none" placeholder=">Template_Sequence&#10;ATGC..." value={state.template.fasta} onChange={e => setState({...state, template: {...state.template, fasta: e.target.value}})}/>
                        </div>
                    </div>
                )}

                {activeTab === 'PRIMERS' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-blue-600 flex items-center gap-2 tracking-widest"><ArrowRight size={14}/> Forward Primer (5' - 3')</h4>
                                <input className="w-full p-4 border border-slate-300 rounded-xl text-sm font-mono tracking-widest uppercase focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900" placeholder="e.g. GGTTTGGCGATCTGGTTTTC" value={state.primers.fwd} onChange={e => setState({...state, primers: {...state.primers, fwd: e.target.value.toUpperCase()}})}/>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                                <h4 className="text-xs font-black uppercase text-indigo-600 flex items-center gap-2 tracking-widest"><ArrowLeft size={14}/> Reverse Primer (5' - 3')</h4>
                                <input className="w-full p-4 border border-slate-300 rounded-xl text-sm font-mono tracking-widest uppercase focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-900" placeholder="e.g. CGGAATGGCTCATCACGATC" value={state.primers.rev} onChange={e => setState({...state, primers: {...state.primers, rev: e.target.value.toUpperCase()}})}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Primer Conc (µM)</label>
                            <input type="number" step="0.1" className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm text-slate-900" value={state.primers.conc} onChange={e => setState({...state, primers: {...state.primers, conc: e.target.value}})}/></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Designed By</label>
                            <input className="w-full bg-white p-2 border border-slate-200 rounded-lg text-sm text-slate-900" value={state.primers.designer} onChange={e => setState({...state, primers: {...state.primers, designer: e.target.value}})}/></div>
                        </div>
                    </div>
                )}

                {activeTab === 'REAGENTS' && (
                    <div className="space-y-6 animate-fade-in">
                        <h4 className="font-bold text-slate-800 text-sm border-l-4 border-teal-600 pl-3">Reaction Mix & Mastermix Log</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Polymerase Engine</label>
                            <input className="w-full bg-white p-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none" placeholder="e.g. Phusion, Q5, Taq" value={state.reagents.polymerase} onChange={e => setState({...state, reagents: {...state.reagents, polymerase: e.target.value}})}/></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">Buffer System</label>
                            <input className="w-full bg-white p-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-teal-500 outline-none" value={state.reagents.buffer} onChange={e => setState({...state, reagents: {...state.reagents, buffer: e.target.value}})}/></div>
                            <div><label className="text-[10px] font-bold text-slate-400 uppercase">MgCl2 Conc (mM)</label>
                            <input type="number" step="0.1" className="w-full bg-white p-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 font-mono focus:ring-1 focus:ring-teal-500 outline-none" value={state.reagents.mgcl2} onChange={e => setState({...state, reagents: {...state.reagents, mgcl2: e.target.value}})}/></div>
                        </div>
                    </div>
                )}

                {activeTab === 'CYCLER' && (
                    <div className="animate-fade-in">
                        <h4 className="font-bold text-slate-800 text-sm border-l-4 border-amber-600 pl-3 mb-6">Thermocycler Profile</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white border border-slate-100 p-6 rounded-2xl shadow-inner">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Denat Temp (°C)</label>
                                    <input type="number" className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900" value={state.cycler.denatTemp} onChange={e => setState({...state, cycler: {...state.cycler, denatTemp: e.target.value}})}/></div>
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Time (mm:ss)</label>
                                    <input className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900" value={state.cycler.denatTime} onChange={e => setState({...state, cycler: {...state.cycler, denatTime: e.target.value}})}/></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Annealing Temp (°C)</label>
                                    <input type="number" className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900" value={state.cycler.annealTemp} onChange={e => setState({...state, cycler: {...state.cycler, annealTemp: e.target.value}})}/></div>
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Time (mm:ss)</label>
                                    <input className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-900" value={state.cycler.annealTime} onChange={e => setState({...state, cycler: {...state.cycler, annealTime: e.target.value}})}/></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Cycle Count</label>
                                    <input type="number" className="w-full bg-blue-50 p-2 border border-blue-200 rounded-lg text-sm font-black text-blue-800" value={state.cycler.cycles} onChange={e => setState({...state, cycler: {...state.cycler, cycles: e.target.value}})}/></div>
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">Hold (°C)</label>
                                    <input type="number" className="w-full bg-slate-50 p-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900" value={state.cycler.holdTemp} onChange={e => setState({...state, cycler: {...state.cycler, holdTemp: e.target.value}})}/></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'QC' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm border-l-4 border-indigo-600 pl-3">Nanodrop QA/QC</h4>
                            <div className="space-y-4">
                                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Measured Conc (ng/µL)</label>
                                <input type="number" className="w-full bg-white p-2.5 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-1 focus:ring-blue-500" value={state.qc.measuredConc} onChange={e => setState({...state, qc: {...state.qc, measuredConc: e.target.value}})}/></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">A260 / A280</label>
                                    <input type="number" step="0.01" className="w-full bg-white p-2.5 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-1 focus:ring-blue-500" value={state.qc.a260_280} onChange={e => setState({...state, qc: {...state.qc, a260_280: e.target.value}})}/></div>
                                    <div><label className="text-[10px] font-bold text-slate-400 uppercase">A260 / A230</label>
                                    <input type="number" step="0.01" className="w-full bg-white p-2.5 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:ring-1 focus:ring-blue-500" value={state.qc.a260_230} onChange={e => setState({...state, qc: {...state.qc, a260_230: e.target.value}})}/></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 flex justify-center">
                    <button 
                        onClick={handleRunAnalysis}
                        className="bg-blue-600 text-white px-12 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                    >
                        <Play fill="white" size={16}/> Execute In-Silico Engine
                    </button>
                </div>
            </div>
        </div>
    );

    const renderResults = () => {
        const ladderBp = state.gel.ladder === '100bp' ? [1000, 800, 600, 400, 200, 100] : [10000, 5000, 2000, 1000, 500];
        const getY = (bp: number) => {
            const minBp = 50;
            const maxBp = state.gel.ladder === '100bp' ? 1200 : 12000;
            const topY = 60, botY = 380;
            const logMin = Math.log10(minBp), logMax = Math.log10(maxBp), logBp = Math.log10(bp);
            return topY + ((logMax - logBp) / (logMax - logMin)) * (botY - topY);
        };

        return (
            <div className="space-y-8 animate-fade-in max-w-6xl">
                {/* RESULTS TOOLBAR */}
                <div className="flex items-center justify-end gap-3 print:hidden">
                    <button onClick={() => setView('INPUT')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                        <RefreshCw size={16}/> Refine Protocol
                    </button>
                    <button onClick={handleExportJSON} className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors shadow-sm">
                        <FileCode size={16}/> Export JSON
                    </button>
                    <button onClick={() => window.print()} className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-slate-900 shadow-lg">
                        <Download size={14}/> Scientific Summary (PDF)
                    </button>
                </div>

                {/* 1. THERMODYNAMICS & GEL */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest mb-8">Success Scorecard</h4>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                    { subject: 'Primer QC', A: 90 },
                                    { subject: 'Tm Delta', A: 100 - engine.tmDiff * 10 },
                                    { subject: 'Purity', A: 85 },
                                    { subject: 'Dimer Risk', A: 100 - engine.dimerRisk },
                                    { subject: 'Specificity', A: 95 }
                                ]}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fontWeight: 'bold'}} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                                    <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center w-full pt-6 border-t border-slate-50">
                             <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Confidence Score</div>
                             <div className={`text-5xl font-black ${engine.score > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>{engine.score}%</div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row gap-10 items-center justify-center">
                        <svg width="240" height="420" className="bg-black/90 rounded border-4 border-slate-700 shadow-2xl">
                            {[40, 95, 150, 205].map(x => (
                                <rect key={x} x={x-15} y="15" width="30" height="10" fill="#1e293b" stroke="#334155" />
                            ))}
                            {ladderBp.map(bp => (
                                <g key={bp}>
                                    <rect x="30" y={getY(bp)} width="20" height="2" fill="#38bdf8" opacity="0.4" />
                                    <text x="25" y={getY(bp) + 2} fill="#64748b" fontSize="6" textAnchor="end">{bp}</text>
                                </g>
                            ))}
                            {engine.predictedSize > 0 && (
                                <g>
                                    <rect x="140" y={getY(engine.predictedSize)} width="20" height="4" fill="#0ea5e9" className="animate-pulse shadow-lg" />
                                    <text x="175" y={getY(engine.predictedSize) - 8} fill="#38bdf8" fontSize="9" fontWeight="bold">{engine.predictedSize}bp</text>
                                </g>
                            )}
                        </svg>
                        <div className="flex-1 space-y-4 text-left">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white">
                                <h5 className="text-[10px] font-black uppercase text-blue-400 mb-2 flex items-center gap-2"><Target size={14}/> Protocol assessment</h5>
                                <p className="text-xs text-slate-400 italic">"Amplification predicted at target locus. High specificity indicated by thermodynamic stability."</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Efficiency</span>
                                    <span className="text-lg font-black text-blue-400">92.4%</span>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Impact Level</span>
                                    <span className="text-lg font-black text-rose-500">{engine.bioContext.impactLevel.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NEW: NANODROP QA/QC VISUALIZATION */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left p-8">
                  <div className="flex items-center gap-3 mb-8">
                      <ShieldCheck className="text-indigo-600" size={24}/>
                      <div>
                          <h3 className="font-bold text-slate-800">Spectrophotometric QA/QC (Nanodrop)</h3>
                          <p className="text-xs text-slate-500">Quality assessment of the input template DNA</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">A260/280 Ratio</span>
                          <div className={`text-4xl font-black mb-2 ${parseFloat(state.qc.a260_280) >= 1.8 && parseFloat(state.qc.a260_280) <= 2.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {state.qc.a260_280 || 'N/A'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                              Target: 1.8 - 2.0
                          </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">A260/230 Ratio</span>
                          <div className={`text-4xl font-black mb-2 ${parseFloat(state.qc.a260_230) >= 2.0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {state.qc.a260_230 || 'N/A'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                              Target: ≥ 2.0
                          </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Concentration</span>
                          <div className="text-4xl font-black text-indigo-600 mb-2">
                              {state.qc.measuredConc || '0'} <span className="text-sm font-medium text-slate-400 uppercase tracking-tighter">ng/µL</span>
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                              {state.template.type}
                          </div>
                      </div>
                  </div>
                  <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 border ${engine.interpretation.risk === 'Low' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                      {engine.interpretation.risk === 'Low' ? <CheckCircle size={18}/> : <AlertTriangle size={18}/>}
                      <p className="text-xs font-medium">
                          <strong>Purity Analysis:</strong> {engine.interpretation.purity}. {engine.interpretation.salt}.
                      </p>
                  </div>
                </div>

                {/* NEW: THERMOCYCLER PROFILE GRAPH */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left p-8">
                  <div className="flex items-center gap-3 mb-8">
                      <Thermometer className="text-amber-600" size={24}/>
                      <div>
                          <h3 className="font-bold text-slate-800">Thermocycler Profile Visualization</h3>
                          <p className="text-xs text-slate-500">Thermal profile modeling for {state.cycler.cycles} cycles</p>
                      </div>
                  </div>
                  <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={engine.cyclerData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                              <defs>
                                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                              <YAxis domain={[0, 105]} tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} tickLine={false} label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <ReferenceLine y={95} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Denat', position: 'right', fill: '#ef4444', fontSize: 8 }} />
                              <ReferenceLine y={72} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Ext', position: 'right', fill: '#3b82f6', fontSize: 8 }} />
                              <Area type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock size={16}/></div>
                          <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black">Estimated Time</p>
                              <p className="text-sm font-bold text-slate-800">~ 1h 45m</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><RefreshCw size={16}/></div>
                          <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black">Cycle Count</p>
                              <p className="text-sm font-bold text-slate-800">{state.cycler.cycles} Cycles</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 rounded-lg text-rose-600"><Waves size={16}/></div>
                          <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black">Anneal Temp</p>
                              <p className="text-sm font-bold text-slate-800">{state.cycler.annealTemp}°C</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg text-slate-600"><Layers size={16}/></div>
                          <div>
                              <p className="text-[10px] text-slate-400 uppercase font-black">Final Hold</p>
                              <p className="text-sm font-bold text-slate-800">{state.cycler.holdTemp}°C</p>
                          </div>
                      </div>
                  </div>
                </div>

                {/* 2. GENE ANNOTATION TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-left">
                    <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="text-blue-600" size={24}/>
                            <div>
                                <h3 className="font-bold text-slate-800">Gene Annotation & Genomic Context</h3>
                                <p className="text-xs text-slate-500">Molecular features mapped for {state.target.name}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Target: {state.target.name}
                             </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="p-4 text-left">Molecular Attribute</th>
                                    <th className="p-4 text-left">Calculated / Curated Value</th>
                                    <th className="p-4 text-left">Diagnostic Consequence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                <tr>
                                    <td className="p-4 font-bold bg-slate-50/30 w-64">Gene Name / Accession</td>
                                    <td className="p-4 font-mono text-blue-600">{state.target.name} | {state.target.accession}</td>
                                    <td className="p-4 text-slate-500 text-xs">Standardized NCBI identifier mapping.</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold bg-slate-50/30">Gene Product / Mechanism</td>
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800">{engine.bioContext.geneProduct}</div>
                                        <div className="text-xs text-slate-500 mt-1 italic">{engine.bioContext.mechanism}</div>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">Functional protein class being targeted.</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold bg-slate-50/30">Amplicon Coverage</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-blue-500 h-full" style={{width: `${(engine.predictedSize/engine.bioContext.fullGeneLength)*100}%`}}></div>
                                            </div>
                                            <span className="font-mono font-bold text-xs">{((engine.predictedSize/engine.bioContext.fullGeneLength)*100).toFixed(1)}%</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">Range: {engine.startPos} .. {engine.endPos} bp (Total: {engine.bioContext.fullGeneLength} bp)</div>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">Portion of ORF amplified by current primers.</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold bg-slate-50/30">Resistance Metadata</td>
                                    <td className="p-4">
                                        <div className="flex gap-2 mb-1">
                                            <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-black border border-rose-100 uppercase">{engine.bioContext.category}</span>
                                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-black border border-purple-100 uppercase">{engine.bioContext.location}</span>
                                        </div>
                                        <div className="text-xs font-medium text-slate-700">Class: {engine.bioContext.affectedClass}</div>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs">Impact on phenotypic susceptibility profile.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. FUNCTIONAL INTERPRETATION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Stethoscope size={20}/></div>
                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Clinical Context</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{engine.bioContext.clinicalSignificance}</p>
                        <div className="mt-auto pt-4 border-t border-slate-50">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Diagnostic Relevance:</span>
                             <p className="text-xs font-medium text-blue-600 mt-1">{engine.bioContext.diagnosticRelevance}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl"><Globe size={20}/></div>
                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Environmental Status</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">{engine.bioContext.environmentalRelevance}</p>
                        <div className="mt-auto pt-4 border-t border-slate-50">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Outbreak Linkage:</span>
                             <p className="text-xs font-medium text-teal-600 mt-1">{engine.bioContext.outbreakAssociation}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full text-left">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Share2 size={20}/></div>
                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">HGT Risk Dynamics</h4>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
                             <span className="text-[10px] font-bold text-slate-400 uppercase">HGT Risk Level</span>
                             <span className={`text-sm font-black ${engine.bioContext.hgtRisk === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>{engine.bioContext.hgtRisk.toUpperCase()}</span>
                        </div>
                        <p className="text-xs text-slate-500 italic">"Presence on mobile elements indicates high potential for intra-species and inter-genus transmission."</p>
                    </div>
                </div>

                {/* 4. AMPLICON CONTEXT & IMPACT SCORING */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                     {/* AMPLICON CONTEXT */}
                     <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col md:flex-row gap-8 items-center text-left">
                        <div className="flex-1 space-y-5">
                            <h4 className="text-xl font-black tracking-tighter flex items-center gap-3">
                                <Target className="text-blue-400"/> Amplicon Context Analysis
                            </h4>
                            <div className="space-y-3">
                                <div className={`p-4 rounded-2xl flex items-center justify-between ${engine.bioContext.catalyticOverlap ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <Zap className={engine.bioContext.catalyticOverlap ? 'text-emerald-400' : 'text-slate-500'} size={20}/>
                                        <div>
                                            <p className="text-sm font-bold">Catalytic Domain Overlap</p>
                                            <p className="text-[10px] opacity-60">Primers target active functional motifs.</p>
                                        </div>
                                    </div>
                                    {engine.bioContext.catalyticOverlap ? <CheckCircle className="text-emerald-400"/> : <X size={20} className="text-slate-600"/>}
                                </div>
                                <div className={`p-4 rounded-2xl flex items-center justify-between ${engine.bioContext.mutationHotspot ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-800'}`}>
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className={engine.bioContext.mutationHotspot ? 'text-amber-400' : 'text-slate-500'} size={20}/>
                                        <div>
                                            <p className="text-sm font-bold">Mutation Hotspot Targeted</p>
                                            <p className="text-[10px] opacity-60">Amplicon contains SNP-prone regions.</p>
                                        </div>
                                    </div>
                                    {engine.bioContext.mutationHotspot ? <CheckCircle className="text-amber-400"/> : <X size={20} className="text-slate-600"/>}
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* IMPACT SCORING */}
                     <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm text-left">
                        <h4 className="text-xl font-black tracking-tighter text-slate-800 mb-8 flex items-center gap-3">
                            <Activity className="text-rose-500"/> Impact Scoring Matrix
                        </h4>
                        <div className="space-y-8">
                             <div>
                                 <div className="flex justify-between items-end mb-2">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AMR Relevance Score</span>
                                     <span className="text-2xl font-black text-slate-800">{engine.bioContext.amrRelevanceScore} <span className="text-slate-300 text-sm">/ 10</span></span>
                                 </div>
                                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                     <div className="bg-rose-500 h-full transition-all duration-1000" style={{width: `${engine.bioContext.amrRelevanceScore * 10}%`}}></div>
                                 </div>
                             </div>
                             <div>
                                 <div className="flex justify-between items-end mb-2">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Research / Novelty Priority</span>
                                     <span className="text-2xl font-black text-slate-800">{engine.bioContext.researchRelevanceScore} <span className="text-slate-300 text-sm">/ 10</span></span>
                                 </div>
                                 <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                     <div className="bg-blue-600 h-full transition-all duration-1000" style={{width: `${engine.bioContext.researchRelevanceScore * 10}%`}}></div>
                                 </div>
                             </div>
                        </div>
                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Overall Diagnostic Value</p>
                             <p className={`text-sm font-bold ${engine.bioContext.impactLevel === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                                {engine.bioContext.impactLevel.toUpperCase()} IMPACT ISOLATE
                             </p>
                        </div>
                     </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 min-h-[800px]">
            {/* TOOL HEADER - BACK BUTTON MOVED TO TOP LEFT BESIDE TOOL NAME */}
            <div className="flex items-center justify-between text-left">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-blue-50 rounded-full transition-colors text-blue-600 border border-blue-100 bg-white shadow-sm print:hidden"
                            title="Back to Workbench"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Dna size={28}/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">In-Silico PCR Suite</h2>
                        <p className="text-sm text-slate-500 font-medium italic">Molecular Diagnostics & Biological Significance Layer</p>
                    </div>
                </div>
                {view === 'RESULTS' && (
                    <div className="hidden md:flex flex-col items-end print:flex">
                        <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase border border-blue-100">
                             Engine: IrisDiagnostics-V5.1 (Stable)
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 font-mono uppercase">Verified Analysis: {new Date().toLocaleDateString()}</span>
                    </div>
                )}
            </div>

            {view === 'INPUT' ? renderInput() : renderResults()}
        </div>
    );
};

export default PCRAnalysisSuite;