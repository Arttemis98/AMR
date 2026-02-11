import React, { useState } from 'react';
import { 
  Microscope, 
  Dna, 
  Activity, 
  Network, 
  CheckCircle, 
  AlertCircle,
  Play,
  Settings,
  Download,
  UploadCloud,
  ChevronRight,
  BarChart2, 
  Trash2,
  Plus,
  FileText,
  Search,
  Layers,
  Cpu,
  ArrowLeft,
  FileCode,
  Box,
  Thermometer,
  RotateCcw,
  AlertTriangle,
  FlaskConical
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  ReferenceLine,
  Legend
} from 'recharts';
import AdvancedNGSAnalytics from './AdvancedNGSAnalytics';
import GeneMechanismTable from './GeneMechanismTable';
import CoOccurrenceNetwork from './CoOccurrenceNetwork';
import PCRAnalysisSuite, { PCRProtocol, QCData } from './PCRAnalysisSuite';
import PhylogenyAnalysis from './PhylogenyAnalysis';
import { GeneExpression } from '../types';

type ToolModule = 'HUB' | 'QC' | 'AST' | 'PHYLO' | 'PCR';
type NGSType = 'NONE' | 'WGS' | 'RNA' | '16S';
type ASTMode = 'DISK' | 'MIC';

// --- DATABASE CONSTANTS ---
const ANTIBIOTIC_DB = [
  {
    name: 'Cell Wall Synthesis Inhibitors',
    classes: [
      {
        name: 'Penicillins (Natural & Aminopenicillins)',
        antibiotics: [
          { name: 'Penicillin G', defaultAbbr: 'P', defaultConc: '10', defaultUnit: 'units', breakpointR: 28, breakpointS: 29 },
          { name: 'Ampicillin', defaultAbbr: 'AMP', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 17 },
          { name: 'Amoxicillin', defaultAbbr: 'AMX', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 18 }
        ]
      },
      {
        name: 'Beta-lactam / Inhibitor Combinations',
        antibiotics: [
          { name: 'Amoxicillin-Clavulanate', defaultAbbr: 'AMC', defaultConc: '20/10', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 18 },
          { name: 'Piperacillin-Tazobactam', defaultAbbr: 'TZP', defaultConc: '100/10', defaultUnit: 'mcg', breakpointR: 17, breakpointS: 21 },
          { name: 'Ticarcillin-Clavulanate', defaultAbbr: 'TIM', defaultConc: '75/10', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 20 },
          { name: 'Ampicillin-Sulbactam', defaultAbbr: 'SAM', defaultConc: '10/10', defaultUnit: 'mcg', breakpointR: 11, breakpointS: 15 }
        ]
      },
      {
        name: 'Anti-Pseudomonal Penicillins',
        antibiotics: [
          { name: 'Piperacillin', defaultAbbr: 'PIP', defaultConc: '100', defaultUnit: 'mcg', breakpointR: 17, breakpointS: 21 },
          { name: 'Ticarcillin', defaultAbbr: 'TIC', defaultConc: '75', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 20 },
          { name: 'Carbenicillin', defaultAbbr: 'CB', defaultConc: '100', defaultUnit: 'mcg', breakpointR: 17, breakpointS: 23 }
        ]
      },
      {
        name: 'Cephalosporins (1st & 2nd Gen)',
        antibiotics: [
          { name: 'Cefazolin', defaultAbbr: 'KZ', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 19, breakpointS: 23 },
          { name: 'Cephalothin', defaultAbbr: 'KF', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 18 },
          { name: 'Cefuroxime', defaultAbbr: 'CXM', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 18 },
          { name: 'Cefoxitin', defaultAbbr: 'FOX', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 18 }
        ]
      },
      {
        name: 'Cephalosporins (3rd, 4th & 5th Gen)',
        antibiotics: [
          { name: 'Ceftazidime', defaultAbbr: 'CAZ', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 17, breakpointS: 21 },
          { name: 'Cefotaxime', defaultAbbr: 'CTX', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 22, breakpointS: 26 },
          { name: 'Ceftriaxone', defaultAbbr: 'CRO', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 19, breakpointS: 23 },
          { name: 'Cefepime', defaultAbbr: 'FEP', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 18 },
          { name: 'Ceftaroline', defaultAbbr: 'CPT', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 19, breakpointS: 24 }
        ]
      },
      {
        name: 'Carbapenems',
        antibiotics: [
          { name: 'Imipenem', defaultAbbr: 'IPM', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 19, breakpointS: 23 },
          { name: 'Meropenem', defaultAbbr: 'MEM', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 19, breakpointS: 23 },
          { name: 'Ertapenem', defaultAbbr: 'ETP', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 18, breakpointS: 22 },
          { name: 'Doripenem', defaultAbbr: 'DOR', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 19, breakpointS: 23 }
        ]
      },
      {
        name: 'Monobactams',
        antibiotics: [
          { name: 'Aztreonam', defaultAbbr: 'ATM', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 17, breakpointS: 21 }
        ]
      }
    ]
  },
  {
    name: 'Protein Synthesis Inhibitors',
    classes: [
      {
        name: 'Aminoglycosides',
        antibiotics: [
          { name: 'Gentamicin', defaultAbbr: 'CN', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 15 },
          { name: 'Amikacin', defaultAbbr: 'AK', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 17 },
          { name: 'Tobramycin', defaultAbbr: 'TOB', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 15 },
          { name: 'Netilmicin', defaultAbbr: 'NET', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 15 },
          { name: 'Kanamycin', defaultAbbr: 'K', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 18 },
          { name: 'Streptomycin', defaultAbbr: 'S', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 11, breakpointS: 15 }
        ]
      },
      {
        name: 'Tetracyclines',
        antibiotics: [
          { name: 'Tetracycline', defaultAbbr: 'TE', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 19 },
          { name: 'Doxycycline', defaultAbbr: 'DO', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 16 },
          { name: 'Minocycline', defaultAbbr: 'MIN', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 19 }
        ]
      },
      {
        name: 'Macrolides & Lincosamides',
        antibiotics: [
          { name: 'Erythromycin', defaultAbbr: 'E', defaultConc: '15', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 23 },
          { name: 'Azithromycin', defaultAbbr: 'AZM', defaultConc: '15', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 18 },
          { name: 'Clarithromycin', defaultAbbr: 'CLR', defaultConc: '15', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 18 },
          { name: 'Clindamycin', defaultAbbr: 'DA', defaultConc: '2', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 21 }
        ]
      },
      {
        name: 'Phenicols',
        antibiotics: [
          { name: 'Chloramphenicol', defaultAbbr: 'C', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 18 }
        ]
      },
      {
        name: 'Oxazolidinones',
        antibiotics: [
          { name: 'Linezolid', defaultAbbr: 'LZD', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 20, breakpointS: 21 }
        ]
      }
    ]
  },
  {
    name: 'DNA/RNA Synthesis Inhibitors',
    classes: [
      {
        name: 'Fluoroquinolones',
        antibiotics: [
          { name: 'Ciprofloxacin', defaultAbbr: 'CIP', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 15, breakpointS: 21 },
          { name: 'Levofloxacin', defaultAbbr: 'LEV', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 13, breakpointS: 17 },
          { name: 'Moxifloxacin', defaultAbbr: 'MXF', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 18 },
          { name: 'Norfloxacin', defaultAbbr: 'NOR', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 17 },
          { name: 'Ofloxacin', defaultAbbr: 'OFX', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 16 },
          { name: 'Gatifloxacin', defaultAbbr: 'GAT', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 18 }
        ]
      },
      {
        name: 'Ansamycins',
        antibiotics: [
          { name: 'Rifampin', defaultAbbr: 'RA', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 16, breakpointS: 20 }
        ]
      }
    ]
  },
  {
    name: 'Metabolic & Membrane Agents',
    classes: [
      {
        name: 'Folate Pathway',
        antibiotics: [
          { name: 'Trimethoprim-Sulfamethoxazole', defaultAbbr: 'SXT', defaultConc: '1.25/23.75', defaultUnit: 'mcg', breakpointR: 10, breakpointS: 16 },
          { name: 'Trimethoprim', defaultAbbr: 'TMP', defaultConc: '5', defaultUnit: 'mcg', breakpointR: 10, breakpointS: 16 }
        ]
      },
      {
        name: 'Polymyxins (Cell Membrane)',
        antibiotics: [
          { name: 'Colistin', defaultAbbr: 'CL', defaultConc: '10', defaultUnit: 'mcg', breakpointR: 10, breakpointS: 11 },
          { name: 'Polymyxin B', defaultAbbr: 'PB', defaultConc: '300', defaultUnit: 'units', breakpointR: 11, breakpointS: 12 }
        ]
      },
      {
        name: 'Urinary Tract Agents',
        antibiotics: [
          { name: 'Nitrofurantoin', defaultAbbr: 'F', defaultConc: '300', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 17 },
          { name: 'Fosfomycin', defaultAbbr: 'FOS', defaultConc: '200', defaultUnit: 'mcg', breakpointR: 12, breakpointS: 16 }
        ]
      },
      {
        name: 'Glycopeptides',
        antibiotics: [
          { name: 'Vancomycin', defaultAbbr: 'VA', defaultConc: '30', defaultUnit: 'mcg', breakpointR: 14, breakpointS: 15 } // Note: Disk test unreliable for Vancomycin-S. aureus, mostly used for screening.
        ]
      }
    ]
  }
];

interface ASTEntry {
  id: number;
  mechanism: string;
  classification: string;
  antibiotic: string;
  abbr: string;
  concValue: string;
  concUnit: string;
  zone: number;
  result: 'R' | 'I' | 'S';
}

interface MICEntry {
  id: number;
  antibiotic: string;
  micValue: number;
  breakPointS: number; // MIC <= S
  breakPointR: number; // MIC >= R
  result: 'R' | 'I' | 'S';
}

interface PCRState {
  view: 'FORM' | 'RESULTS';
  geneName: string;
  template: string;
  fwdPrimer: string;
  revPrimer: string;
  denatTemp: number;
  denatTime: string;
  annealTemp: number;
  annealTime: string;
  extendTemp: number;
  extendTime: string;
  cycles: number;
  nanodropConc: number;
  nanodrop260_280: number;
  nanodrop260_230: number;
}

const OpenToolkit: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ToolModule>('HUB');
  
  // NGS State
  const [ngsType, setNgsType] = useState<NGSType>('NONE');
  const [qcProgress, setQcProgress] = useState(0);
  const [qcStatus, setQcStatus] = useState<'IDLE' | 'RUNNING' | 'DONE'>('IDLE');
  const [organismName, setOrganismName] = useState('');
  
  // AST State
  const [astMode, setAstMode] = useState<ASTMode>('DISK');
  const [astEntries, setAstEntries] = useState<ASTEntry[]>([]);
  const [micEntries, setMicEntries] = useState<MICEntry[]>([]);
  const [selectedMech, setSelectedMech] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  // MIC Input State
  const [micInput, setMicInput] = useState({ antibiotic: '', value: '', bpS: '', bpR: '' });

  // Phylogeny State
  const [phyloFile, setPhyloFile] = useState<File | null>(null);
  const [phyloStatus, setPhyloStatus] = useState<'IDLE' | 'RUNNING' | 'DONE'>('IDLE');

  // PCR State
  const [pcrState, setPcrState] = useState<PCRState>({
    view: 'FORM',
    geneName: '',
    template: '',
    fwdPrimer: '',
    revPrimer: '',
    denatTemp: 95,
    denatTime: '0:30',
    annealTemp: 55,
    annealTime: '0:45',
    extendTemp: 72,
    extendTime: '1:00',
    cycles: 30,
    nanodropConc: 145.2,
    nanodrop260_280: 1.85,
    nanodrop260_230: 2.10
  });
  const [pcrResult, setPcrResult] = useState<PCRProtocol | null>(null);


  // --- MOCK DATA ---
  const QC_DATA = Array.from({ length: 150 }, (_, i) => ({ pos: i + 1, score: 30 + Math.random() * 10 - (i > 130 ? Math.random() * 15 : 0) }));
  
  // MOCK RNA-SEQ Data for Pipeline
  const MOCK_RNA_DATA: GeneExpression[] = [
    { gene: 'mexA', log2FoldChange: 2.5, pvalue: 0.0001, significance: 'UP', function: 'Efflux Pump' },
    { gene: 'mexB', log2FoldChange: 2.8, pvalue: 0.00001, significance: 'UP', function: 'Efflux Pump' },
    { gene: 'oprM', log2FoldChange: 2.1, pvalue: 0.002, significance: 'UP', function: 'Outer Membrane Protein' },
    { gene: 'recA', log2FoldChange: 3.2, pvalue: 0.000001, significance: 'UP', function: 'SOS Response' },
    { gene: 'ompF', log2FoldChange: -2.3, pvalue: 0.001, significance: 'DOWN', function: 'Porin' },
    { gene: 'lexA', log2FoldChange: 1.5, pvalue: 0.01, significance: 'UP', function: 'SOS Repressor' },
    ...Array.from({ length: 100 }, (_, i) => ({
      gene: `gene_${i}`,
      log2FoldChange: (Math.random() * 6) - 3,
      pvalue: Math.random(),
      significance: 'NS' as const
    }))
  ];

  // --- HANDLERS ---
  const handleDownloadPDF = (reportType: string) => {
     alert(`Generating ${reportType} PDF Report... Download will start shortly.`);
  };

  const runQCPipeline = () => {
    if (!organismName) {
       alert("Please enter a target organism name.");
       return;
    }
    setQcStatus('RUNNING');
    setQcProgress(0);
    const interval = setInterval(() => {
      setQcProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setQcStatus('DONE');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const interpretZone = (ab: any, zone: number): 'R' | 'I' | 'S' => {
     if (zone <= ab.breakpointR) return 'R';
     if (zone >= ab.breakpointS) return 'S';
     return 'I';
  };

  const addAntibiotic = (mechName: string, className: string, abName: string) => {
     const mech = ANTIBIOTIC_DB.find(m => m.name === mechName);
     const cls = mech?.classes.find(c => c.name === className);
     const ab = cls?.antibiotics.find(a => a.name === abName);
     if (ab) {
       setAstEntries([...astEntries, {
         id: Date.now(),
         mechanism: mechName,
         classification: className,
         antibiotic: abName,
         abbr: ab.defaultAbbr,
         concValue: ab.defaultConc,
         concUnit: ab.defaultUnit,
         zone: 0,
         result: 'R'
       }]);
     }
  };

  const updateEntry = (id: number, field: keyof ASTEntry, value: any) => {
    setAstEntries(prev => prev.map(entry => {
       if (entry.id !== id) return entry;
       const updated = { ...entry, [field]: value };
       if (field === 'zone') {
          const mech = ANTIBIOTIC_DB.find(m => m.name === entry.mechanism);
          const cls = mech?.classes.find(c => c.name === entry.classification);
          const ab = cls?.antibiotics.find(a => a.name === entry.antibiotic);
          if (ab) updated.result = interpretZone(ab, Number(value));
       }
       return updated;
    }));
  };

  const addMicEntry = () => {
      if(!micInput.antibiotic || !micInput.value || !micInput.bpS || !micInput.bpR) return;
      const val = Number(micInput.value);
      const s = Number(micInput.bpS);
      const r = Number(micInput.bpR);
      
      let res: 'R'|'I'|'S' = 'I';
      if(val <= s) res = 'S';
      else if(val >= r) res = 'R';

      setMicEntries([...micEntries, {
          id: Date.now(),
          antibiotic: micInput.antibiotic,
          micValue: val,
          breakPointS: s,
          breakPointR: r,
          result: res
      }]);
      setMicInput({ antibiotic: '', value: '', bpS: '', bpR: '' });
  };

  const handlePcrLoadDemo = () => {
    // blaNDM-1 partial sequence and primers
    setPcrState(prev => ({
        ...prev,
        geneName: 'blaNDM-1',
        fwdPrimer: 'GGTTTGGCGATCTGGTTTTC',
        revPrimer: 'CGGAATGGCTCATCACGATC',
        annealTemp: 58,
        template: `ATGGAATTGCCCAATATTATGCACCCGGTCGCGTGGTGTCACGCTCATCACAATGGCACA
AAAATCGCCGTCGCAGAAAGGGTCTGGTTTGGCGATCTGGTTTTCCGTCAGCCAGAAATT
GCTCAACTGAAACAGCGGCTTTTATCGCAACAGCCGCAGGCGTTTTGGCTCTGCCCCGAT
GGCCTGGTTGTCGTGGTGTCGCAAAACCGCGCCAGCACGCGGATTTTCCAGGGCGTCAGC
GCACCGGCGGCGTTAGTAGTGATGCGGCGCGAGCACGGTATGCACCGGTTCGCCGCCTTT
CCTGCTCAGGATGGCAGCGTGCTATGGTCGCGGCAACAGCGTGCCGATTCGCCGCTGGCG
TTGATCGCAACACACCCCGATGCGTCCAAACCGTTCGACGTGCCGGTCATCGCGCTTGAC
GATGCTGCGGCTTCAATCAGGCTTGGCGGGGAAGCGGCTTTTGTGGCGTGCGGGGCGGCG
AAACGGCTGCACGATAAAAGCACCGGCATAGCGGTCGCGGGTGCGCCAATGCTATGGCAG
ATCGGTCAGCACGCACTCTCGACACGCGCAGCGGCGCAAAATATTAAACGCGGCATTATT
GCAGCCACAAGCTGGCAATACGGTCGCACCGTTGTCGCGCCAAGCATCCCAATGGTAAAA
GGGAAAATGCTCGTGGTGTATGCACTCGCACCGGAGGTCGATCCCAACAACAGCAAGTTG
GATCTCAGCCAGGCGTCGCAAGGCGAAGGTATGACGATTGCCCAATTGGGTGCGCAAACA
CGTAACGCAGTTCAGCAGAACTATTTTCGCAACACGCCGGCGCCGTTGAGAATTTATCAG
CCCTTACCGGTTGATCGTGATGAGCCATTCCGCCGTCTGCTGAATGTGGCGAAAGCCGGC
GTAGCGCAAGCCAGCACGCGCCAACCGCTAGGC`,
        nanodropConc: 152.4,
        nanodrop260_280: 1.84,
        nanodrop260_230: 2.15
    }));
  };

  const reverseComplement = (seq: string) => {
      const complement: Record<string, string> = { 'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C' };
      return seq.toUpperCase().split('').reverse().map(b => complement[b] || b).join('');
  };

  const runPCRSimulation = () => {
      const { template, fwdPrimer, revPrimer, geneName, cycles, denatTemp, denatTime, annealTemp, annealTime, extendTemp, extendTime } = pcrState;
      const cleanTemplate = template.toUpperCase().replace(/\s/g, '');
      const cleanFwd = fwdPrimer.toUpperCase().replace(/\s/g, '');
      const cleanRev = revPrimer.toUpperCase().replace(/\s/g, '');
      const revComp = reverseComplement(cleanRev);

      const fwdIndex = cleanTemplate.indexOf(cleanFwd);
      const revIndex = cleanTemplate.indexOf(revComp);

      let productSize = 0;
      if (fwdIndex !== -1 && revIndex !== -1 && revIndex > fwdIndex) {
          productSize = (revIndex + cleanRev.length) - fwdIndex;
      }

      const cyclingProfile = [
          { step: 'Init Denat', temp: denatTemp, time: '5:00', stage: 'Hold' },
          { step: 'Denature', temp: denatTemp, time: denatTime, stage: 'Cycle' },
          { step: 'Anneal', temp: annealTemp, time: annealTime, stage: 'Cycle' },
          { step: 'Extend', temp: extendTemp, time: extendTime, stage: 'Cycle' },
          { step: 'Final Ext', temp: extendTemp, time: '7:00', stage: 'Hold' },
          { step: 'Hold', temp: 4, time: '∞', stage: 'Hold' },
      ];

      setPcrResult({
          targetName: geneName,
          productSize,
          fwdPrimer: cleanFwd,
          revPrimer: cleanRev,
          tm: annealTemp,
          cycles,
          cyclingProfile
      });

      setPcrState(prev => ({ ...prev, view: 'RESULTS' }));
  };
  
  const loadExamplePhylo = () => {
      setPhyloStatus('RUNNING');
      setTimeout(() => setPhyloStatus('DONE'), 2000);
  };

  const runPhyloAnalysis = () => {
      setPhyloStatus('RUNNING');
      setTimeout(() => setPhyloStatus('DONE'), 2000);
  };


  // --- RENDERERS ---

  const renderHub = () => (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Research Tools</h2>
        <p className="text-slate-500">Professional-grade bioinformatics and statistical tools for every researcher.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div onClick={() => setActiveModule('QC')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform"><Dna size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">NGS Analysis Pipeline</h3>
          <p className="text-sm text-slate-500 mb-4">WGS, RNA-seq, or 16S. Includes QC, Assembly, Variant Calling, and Differential Expression.</p>
          <div className="flex items-center text-blue-600 text-sm font-medium">Launch Pipeline <ChevronRight size={16} /></div>
        </div>

        <div onClick={() => setActiveModule('AST')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 mb-4 group-hover:scale-110 transition-transform"><Microscope size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Advanced AST Calculator</h3>
          <p className="text-sm text-slate-500 mb-4">Comprehensive CLSI M100 breakpoint analysis with unit conversion and PDF reports.</p>
          <div className="flex items-center text-teal-600 text-sm font-medium">Launch Tool <ChevronRight size={16} /></div>
        </div>

        <div onClick={() => setActiveModule('PHYLO')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform"><Network size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Phylogeny & MSA</h3>
          <p className="text-sm text-slate-500 mb-4">Construct Maximum Likelihood trees, view distance matrices, and analyze alignments.</p>
          <div className="flex items-center text-rose-600 text-sm font-medium">Launch Tool <ChevronRight size={16} /></div>
        </div>

        <div onClick={() => setActiveModule('PCR')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform"><Layers size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">In-Silico PCR Simulator</h3>
          <p className="text-sm text-slate-500 mb-4">Simulate PCR amplification, check primer thermodynamics, and view virtual agarose gels.</p>
          <div className="flex items-center text-purple-600 text-sm font-medium">Launch Tool <ChevronRight size={16} /></div>
        </div>
      </div>
    </div>
  );

  const renderNGS = () => (
    <div className="animate-fade-in space-y-6">
       <div className="flex items-center space-x-4 mb-2">
         <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
           <ArrowLeft size={20} />
         </button>
         <div>
            <h2 className="text-2xl font-bold text-slate-800">NGS Analysis Pipeline</h2>
            <p className="text-slate-500">Configure sequencing workflow</p>
         </div>
       </div>

       {ngsType === 'NONE' ? (
          <div className="grid grid-cols-3 gap-6 mt-8">
             <button onClick={() => setNgsType('WGS')} className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center">
                <Dna className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800">Whole Genome (WGS)</h3>
                <p className="text-xs text-slate-500 mt-2">Assembly, Annotation, SNP Calling, Pathogen ID</p>
             </button>
             <button onClick={() => setNgsType('RNA')} className="p-8 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-center">
                <Activity className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800">Transcriptomics (RNA-seq)</h3>
                <p className="text-xs text-slate-500 mt-2">Expression Quantification, Volcano Plots, Enrichment</p>
             </button>
             <button onClick={() => setNgsType('16S')} className="p-8 bg-white border border-slate-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all text-center">
                <Layers className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold text-slate-800">Metagenomics (16S)</h3>
                <p className="text-xs text-slate-500 mt-2">Taxonomy Abundance, Diversity Indices, OTU Clustering</p>
             </button>
          </div>
       ) : (
          <div className="space-y-6">
             {/* Config Header */}
             <div className="bg-slate-800 text-white p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">{ngsType} PIPELINE</span>
                   <span className="text-sm font-medium">Target Organism: {organismName || "Not specified"}</span>
                </div>
                <button onClick={() => { setNgsType('NONE'); setQcStatus('IDLE'); }} className="text-xs hover:text-white/80">Change Type</button>
             </div>

             {qcStatus === 'IDLE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800">1. Study Metadata</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Organism</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Pseudomonas aeruginosa" 
                              className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900"
                              value={organismName}
                              onChange={e => setOrganismName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sequencing Platform</label>
                            <select className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900">
                                <option>Illumina NovaSeq (PE150)</option>
                                <option>Illumina MiSeq (PE250)</option>
                                <option>Oxford Nanopore MinION</option>
                                <option>PacBio HiFi</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800">2. Upload Reads</h3>
                        {ngsType === 'RNA' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer">
                                    <FileCode className="mx-auto text-blue-400 mb-2"/>
                                    <span className="text-xs font-bold text-slate-600 block">Control Samples</span>
                                    <span className="text-xs text-slate-400">(Replicates 1-3)</span>
                                </div>
                                <div className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer">
                                    <FileCode className="mx-auto text-rose-400 mb-2"/>
                                    <span className="text-xs font-bold text-slate-600 block">Treated Samples</span>
                                    <span className="text-xs text-slate-400">(Replicates 1-3)</span>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                                <UploadCloud className="text-slate-400 mb-2"/>
                                <span className="text-sm font-medium text-slate-600">Upload FASTQ Files</span>
                            </div>
                        )}
                        <button 
                          onClick={runQCPipeline} 
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2"
                        >
                           <Play size={16}/> Start Analysis Pipeline
                        </button>
                    </div>
                </div>
             )}

             {qcStatus === 'RUNNING' && (
                <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                   <Cpu className="mx-auto text-blue-600 animate-pulse mb-4" size={48} />
                   <h3 className="font-bold text-slate-800">Processing Sequence Data...</h3>
                   <p className="text-slate-500 text-sm mb-6">Trimming Adaptors, Aligning to Reference, Calling Variants...</p>
                   <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full transition-all duration-100" style={{width: `${qcProgress}%`}}></div>
                   </div>
                </div>
             )}

             {qcStatus === 'DONE' && (
                <div className="space-y-6 animate-fade-in">
                   {/* QC Stats */}
                   <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Sequence Quality Distribution (FastQC)</h3>
                      <div className="h-48"><ResponsiveContainer><LineChart data={QC_DATA}><Line type="monotone" dataKey="score" stroke="#10b981" dot={false} strokeWidth={2} /><XAxis hide /><YAxis domain={[0,45]} label={{ value: 'Phred Score', angle: -90, position: 'insideLeft' }} /><Tooltip/><ReferenceArea y1={28} y2={45} fill="green" fillOpacity={0.05}/></LineChart></ResponsiveContainer></div>
                   </div>
                   
                   {/* WGS Advanced Analysis */}
                   {ngsType === 'WGS' && (
                       <AdvancedNGSAnalytics dataType="WGS" />
                   )}

                   {/* RNA-SEQ Advanced Analysis */}
                   {ngsType === 'RNA' && (
                       <div className="flex flex-col gap-6">
                           {/* 1. Volcano Plot */}
                           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                               <h3 className="font-bold text-slate-800 mb-4">Differential Expression (Volcano Plot)</h3>
                               <div className="h-96">
                                  <ResponsiveContainer>
                                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                          <CartesianGrid strokeDasharray="3 3" />
                                          <XAxis type="number" dataKey="log2FoldChange" name="Log2 Fold Change" label={{ value: 'Log2 Fold Change', position: 'bottom', offset: 0 }} />
                                          <YAxis type="number" dataKey="pvalue" name="p-value" tickFormatter={() => ""} label={{ value: '-Log10(P)', angle: -90, position: 'insideLeft' }}/>
                                          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={() => null} />
                                          <ReferenceLine x={0} stroke="#cbd5e1" />
                                          <Scatter data={MOCK_RNA_DATA} fill="#8884d8">
                                              {MOCK_RNA_DATA.map((entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.significance === 'UP' ? '#ef4444' : entry.significance === 'DOWN' ? '#3b82f6' : '#cbd5e1'} />
                                              ))}
                                          </Scatter>
                                      </ScatterChart>
                                  </ResponsiveContainer>
                               </div>
                               <div className="flex justify-center gap-6 mt-4 text-xs font-medium text-slate-600">
                                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Upregulated (Resistance)</div>
                                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Downregulated</div>
                                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-300 rounded-full"></div> Not Significant</div>
                               </div>
                           </div>

                           {/* 2. Heatmap & Enrichment */}
                           <AdvancedNGSAnalytics dataType="RNA_SEQ" />

                           {/* 3. Gene Mechanism Table */}
                           <GeneMechanismTable data={MOCK_RNA_DATA} />

                           {/* 4. Network */}
                           <CoOccurrenceNetwork />
                       </div>
                   )}
                   
                   <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button onClick={() => handleDownloadPDF(`${ngsType} Analysis`)} className="bg-slate-900 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 shadow-md">
                         <Download size={16}/> Download Detailed Report
                      </button>
                   </div>
                </div>
             )}
          </div>
       )}
    </div>
  );

  const renderAST = () => (
     <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Advanced Antibiogram Calculator</h2>
                <p className="text-slate-500">Phenotypic susceptibility analysis & interpretation</p>
            </div>
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
              <button 
                onClick={() => setAstMode('DISK')} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${astMode === 'DISK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Disk Diffusion (Zone)
              </button>
              <button 
                onClick={() => setAstMode('MIC')} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${astMode === 'MIC' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MIC (Dilution)
              </button>
          </div>
        </div>

        {astMode === 'DISK' && (
            <>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm" value={selectedMech} onChange={e => { setSelectedMech(e.target.value); setSelectedClass(''); }}>
                        <option value="">1. Select Mechanism</option>
                        {ANTIBIOTIC_DB.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                    </select>
                    <select className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} disabled={!selectedMech}>
                        <option value="">2. Select Class</option>
                        {selectedMech && ANTIBIOTIC_DB.find(m => m.name === selectedMech)?.classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                    <select className="p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm" onChange={e => { if(e.target.value) { addAntibiotic(selectedMech, selectedClass, e.target.value); e.target.value=''; } }} disabled={!selectedClass}>
                        <option value="">3. Add Antibiotic (+)</option>
                        {selectedClass && ANTIBIOTIC_DB.find(m => m.name === selectedMech)?.classes.find(c => c.name === selectedClass)?.antibiotics.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                    </select>
                </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="p-4">Antibiotic</th>
                            <th className="p-4">Concentration</th>
                            <th className="p-4">Zone (mm)</th>
                            <th className="p-4">Interpretation</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {astEntries.map(entry => (
                            <tr key={entry.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-900">{entry.antibiotic} <span className="text-slate-400 text-xs ml-1">({entry.abbr})</span></td>
                            <td className="p-4">
                                <div className="flex items-center">
                                    <input type="text" value={entry.concValue} onChange={e => updateEntry(entry.id, 'concValue', e.target.value)} className="w-12 border rounded-l p-1 text-center bg-white text-slate-900 text-sm" />
                                    <select value={entry.concUnit} onChange={e => updateEntry(entry.id, 'concUnit', e.target.value)} className="border-y border-r rounded-r p-1 bg-slate-50 text-slate-600 text-xs h-[30px]">
                                        <option>mcg</option><option>mg</option><option>g</option><option>units</option>
                                    </select>
                                </div>
                            </td>
                            <td className="p-4">
                                <input type="number" value={entry.zone || ''} onChange={e => updateEntry(entry.id, 'zone', e.target.value)} className="w-20 border border-slate-300 rounded p-1.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500" placeholder="0" />
                            </td>
                            <td className="p-4">
                                {entry.zone > 0 && (
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.result === 'R' ? 'bg-red-100 text-red-800' : entry.result === 'S' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {entry.result === 'R' ? 'RESISTANT' : entry.result === 'S' ? 'SUSCEPTIBLE' : 'INTERMEDIATE'}
                                    </span>
                                )}
                            </td>
                            <td className="p-4 text-right"><button onClick={() => setAstEntries(prev => prev.filter(e => e.id !== entry.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button></td>
                            </tr>
                        ))}
                        {astEntries.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Add antibiotics to begin analysis</td></tr>}
                    </tbody>
                </table>
                </div>

                {astEntries.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-blue-600"/> Phenotypic Profile (Zone of Inhibition)
                        </h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={astEntries} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="antibiotic" 
                                        tick={({ x, y, payload }) => (
                                            <g transform={`translate(${x},${y})`}>
                                                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)" fontSize={12}>
                                                    {payload.value}
                                                </text>
                                            </g>
                                        )} 
                                    />
                                    <YAxis label={{ value: 'Zone (mm)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
                                                        <p className="font-bold mb-1">{data.antibiotic}</p>
                                                        <p>Zone: <strong>{data.zone} mm</strong></p>
                                                        <p>Result: <span className={data.result === 'R' ? 'text-red-600' : data.result === 'S' ? 'text-green-600' : 'text-amber-600'}>
                                                            {data.result === 'R' ? 'Resistant' : data.result === 'S' ? 'Susceptible' : 'Intermediate'}
                                                        </span></p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="zone" name="Zone of Inhibition" radius={[4, 4, 0, 0]}>
                                        {astEntries.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.result === 'R' ? '#f43f5e' : entry.result === 'S' ? '#10b981' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4 text-xs font-bold text-slate-600">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Susceptible</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Intermediate</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Resistant</div>
                        </div>
                    </div>
                )}
            </>
        )}

        {astMode === 'MIC' && (
            <div className="animate-fade-in space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-indigo-700">
                        <FlaskConical size={20} />
                        <h3 className="font-bold">Minimum Inhibitory Concentration (MIC) Calculator</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Antibiotic</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Vancomycin" 
                                className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900"
                                value={micInput.antibiotic}
                                onChange={(e) => setMicInput({...micInput, antibiotic: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">MIC (µg/mL)</label>
                            <input 
                                type="number" 
                                placeholder="Value" 
                                className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-slate-900"
                                value={micInput.value}
                                onChange={(e) => setMicInput({...micInput, value: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Breakpoints</label>
                            <div className="flex gap-1">
                                <input 
                                    type="number" 
                                    placeholder="S ≤" 
                                    className="w-1/2 border border-slate-300 rounded p-2 text-xs bg-white text-slate-900"
                                    value={micInput.bpS}
                                    onChange={(e) => setMicInput({...micInput, bpS: e.target.value})}
                                    title="Susceptible Breakpoint"
                                />
                                <input 
                                    type="number" 
                                    placeholder="R ≥" 
                                    className="w-1/2 border border-slate-300 rounded p-2 text-xs bg-white text-slate-900"
                                    value={micInput.bpR}
                                    onChange={(e) => setMicInput({...micInput, bpR: e.target.value})}
                                    title="Resistant Breakpoint"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={addMicEntry}
                            disabled={!micInput.antibiotic || !micInput.value}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-bold h-[38px]"
                        >
                            Add Entry
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-indigo-50 text-indigo-900 font-semibold border-b border-indigo-100">
                            <tr>
                                <th className="p-4">Antibiotic</th>
                                <th className="p-4">MIC Value (µg/mL)</th>
                                <th className="p-4">Breakpoints (S / R)</th>
                                <th className="p-4">Interpretation</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {micEntries.map(entry => (
                                <tr key={entry.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{entry.antibiotic}</td>
                                    <td className="p-4 font-mono">{entry.micValue}</td>
                                    <td className="p-4 text-xs text-slate-500">≤ {entry.breakPointS} / ≥ {entry.breakPointR}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${entry.result === 'R' ? 'bg-red-100 text-red-800' : entry.result === 'S' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {entry.result === 'R' ? 'RESISTANT' : entry.result === 'S' ? 'SUSCEPTIBLE' : 'INTERMEDIATE'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => setMicEntries(prev => prev.filter(e => e.id !== entry.id))} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                            {micEntries.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400">Add MIC data points to visualize</td></tr>}
                        </tbody>
                    </table>
                </div>

                {micEntries.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">MIC Profile</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={micEntries} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="antibiotic" tick={{fontSize: 12}} />
                                    <YAxis label={{ value: 'MIC (µg/mL)', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
                                                        <p className="font-bold mb-1">{data.antibiotic}</p>
                                                        <p>MIC: <strong>{data.micValue} µg/mL</strong></p>
                                                        <p>Interpretation: {data.result}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="micValue" name="MIC Value" radius={[4, 4, 0, 0]}>
                                        {micEntries.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.result === 'R' ? '#f43f5e' : entry.result === 'S' ? '#10b981' : '#f59e0b'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end mt-4 rounded-b-xl">
           <button onClick={() => handleDownloadPDF(astMode === 'DISK' ? 'Antibiogram' : 'MIC Report')} disabled={astEntries.length === 0 && micEntries.length === 0} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50">
              <Download size={16} /> <span>Download Report</span>
           </button>
        </div>
     </div>
  );

  const renderPhylo = () => (
     <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Phylogenetic Analysis</h2>
                <p className="text-slate-500">Maximum Likelihood Tree Construction & Distance Matrix</p>
            </div>
          </div>
          <button 
             onClick={loadExamplePhylo}
             className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors flex items-center"
          >
             <Play size={12} className="mr-1" /> Load Example Data
          </button>
        </div>

        {phyloStatus === 'IDLE' && (
           <div className="bg-white p-8 rounded-xl border-2 border-dashed border-slate-300 text-center cursor-pointer hover:bg-slate-50" onClick={() => document.getElementById('phylo-input')?.click()}>
              <input type="file" id="phylo-input" className="hidden" onChange={(e) => { if(e.target.files?.[0]) { setPhyloFile(e.target.files[0]); runPhyloAnalysis(); } }} />
              <Network className="mx-auto text-rose-400 mb-4" size={48}/>
              <h3 className="text-lg font-bold text-slate-700">Upload FASTA Sequences</h3>
              <p className="text-slate-500 text-sm">Supports .fasta, .aln, .phy</p>
           </div>
        )}

        {phyloStatus === 'RUNNING' && (
           <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
              <Network className="mx-auto text-rose-600 animate-pulse mb-4" size={48} />
              <h3 className="font-bold text-slate-800">Constructing Tree...</h3>
              <p className="text-slate-500 text-sm">Aligning Sequences (MUSCLE) -> Calculating Distances -> Bootstrapping</p>
           </div>
        )}

        {phyloStatus === 'DONE' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Phylogenetic Tree (ML, 1000 Boots)</h3>
                 <div className="h-64 flex items-center justify-center border border-slate-100 bg-slate-50 rounded">
                    <svg width="300" height="200">
                       <path d="M20 100 H50 M50 50 H100 M50 150 H100 M100 20 H150 M100 80 H150 M100 120 H150 M100 180 H150" stroke="#475569" strokeWidth="2" fill="none"/>
                       <circle cx="150" cy="20" r="3" fill="#2563eb"/><text x="160" y="24" fontSize="10">Sample_01 (You)</text>
                       <circle cx="150" cy="80" r="3" fill="#64748b"/><text x="160" y="84" fontSize="10">P. aeruginosa PAO1</text>
                       <circle cx="150" cy="120" r="3" fill="#64748b"/><text x="160" y="124" fontSize="10">P. putida</text>
                       <circle cx="150" cy="180" r="3" fill="#64748b"/><text x="160" y="184" fontSize="10">E. coli K12</text>
                    </svg>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 mb-4">Distance Matrix</h3>
                 <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left">
                       <thead><tr className="border-b"><th className="p-2">Seq</th><th className="p-2">Sample_01</th><th className="p-2">PAO1</th><th className="p-2">Putida</th></tr></thead>
                       <tbody>
                          <tr><td className="p-2 font-bold">Sample_01</td><td className="p-2 bg-slate-100">0.00</td><td className="p-2">0.02</td><td className="p-2">0.15</td></tr>
                          <tr><td className="p-2 font-bold">PAO1</td><td className="p-2">0.02</td><td className="p-2 bg-slate-100">0.00</td><td className="p-2">0.14</td></tr>
                          <tr><td className="p-2 font-bold">Putida</td><td className="p-2">0.15</td><td className="p-2">0.14</td><td className="p-2 bg-slate-100">0.00</td></tr>
                       </tbody>
                    </table>
                 </div>
                 <button onClick={() => handleDownloadPDF('Phylogeny Analysis')} className="mt-4 w-full py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-900">Download Analysis</button>
              </div>
           </div>
        )}
     </div>
  );

  const renderPCR = () => (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center space-x-4 mb-2">
        <button onClick={() => {
            if (pcrState.view === 'RESULTS') {
                setPcrState(prev => ({ ...prev, view: 'FORM' }));
            } else {
                setActiveModule('HUB');
            }
        }} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
           <ArrowLeft size={20} />
        </button>
        <div>
           <h2 className="text-2xl font-bold text-slate-800">In-Silico PCR Simulator</h2>
           <p className="text-slate-500">Design primers, validate specificity, and simulate gel electrophoresis.</p>
        </div>
      </div>

      {pcrState.view === 'FORM' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* 1. Sequence Input */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800">1. Template & Primers</h3>
                      <button onClick={handlePcrLoadDemo} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-bold hover:bg-blue-100">Load Demo (blaNDM-1)</button>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Gene Name</label>
                         <input 
                           type="text" 
                           value={pcrState.geneName} 
                           onChange={e => setPcrState({...pcrState, geneName: e.target.value})}
                           className="w-full border border-slate-300 rounded p-2 text-sm"
                           placeholder="e.g. blaNDM-1"
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Sequence (5' -&gt; 3')</label>
                         <textarea 
                           value={pcrState.template} 
                           onChange={e => setPcrState({...pcrState, template: e.target.value})}
                           className="w-full h-32 border border-slate-300 rounded p-2 text-xs font-mono"
                           placeholder="Paste DNA sequence..."
                         />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Forward Primer</label>
                            <input 
                               type="text" 
                               value={pcrState.fwdPrimer} 
                               onChange={e => setPcrState({...pcrState, fwdPrimer: e.target.value})}
                               className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                               placeholder="Sequence..."
                            />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reverse Primer</label>
                            <input 
                               type="text" 
                               value={pcrState.revPrimer} 
                               onChange={e => setPcrState({...pcrState, revPrimer: e.target.value})}
                               className="w-full border border-slate-300 rounded p-2 text-xs font-mono"
                               placeholder="Sequence..."
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* 2. Cycling Conditions */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4">2. Thermocycler Profile</h3>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="p-3 bg-red-50 rounded border border-red-100">
                          <label className="block text-[10px] font-bold text-red-800 uppercase mb-1">Denature</label>
                          <div className="flex gap-1">
                             <input type="number" value={pcrState.denatTemp} onChange={e => setPcrState({...pcrState, denatTemp: Number(e.target.value)})} className="w-12 text-sm border p-1 rounded" />
                             <span className="text-xs self-center">°C</span>
                          </div>
                          <input type="text" value={pcrState.denatTime} onChange={e => setPcrState({...pcrState, denatTime: e.target.value})} className="w-full mt-2 text-xs border p-1 rounded" placeholder="Time"/>
                       </div>
                       <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
                          <label className="block text-[10px] font-bold text-yellow-800 uppercase mb-1">Anneal</label>
                          <div className="flex gap-1">
                             <input type="number" value={pcrState.annealTemp} onChange={e => setPcrState({...pcrState, annealTemp: Number(e.target.value)})} className="w-12 text-sm border p-1 rounded" />
                             <span className="text-xs self-center">°C</span>
                          </div>
                          <input type="text" value={pcrState.annealTime} onChange={e => setPcrState({...pcrState, annealTime: e.target.value})} className="w-full mt-2 text-xs border p-1 rounded" placeholder="Time"/>
                       </div>
                       <div className="p-3 bg-green-50 rounded border border-green-100">
                          <label className="block text-[10px] font-bold text-green-800 uppercase mb-1">Extend</label>
                          <div className="flex gap-1">
                             <input type="number" value={pcrState.extendTemp} onChange={e => setPcrState({...pcrState, extendTemp: Number(e.target.value)})} className="w-12 text-sm border p-1 rounded" />
                             <span className="text-xs self-center">°C</span>
                          </div>
                          <input type="text" value={pcrState.extendTime} onChange={e => setPcrState({...pcrState, extendTime: e.target.value})} className="w-full mt-2 text-xs border p-1 rounded" placeholder="Time"/>
                       </div>
                       <div className="p-3 bg-slate-50 rounded border border-slate-100 flex flex-col justify-center">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cycles</label>
                          <input type="number" value={pcrState.cycles} onChange={e => setPcrState({...pcrState, cycles: Number(e.target.value)})} className="w-full text-sm border p-1 rounded" />
                       </div>
                   </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* 3. Sample QC Simulation */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-800 mb-4">3. Sample QC (Nanodrop)</h3>
                   <div className="space-y-4">
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">Conc. (ng/µL)</label>
                         <input type="number" value={pcrState.nanodropConc} onChange={e => setPcrState({...pcrState, nanodropConc: Number(e.target.value)})} className="w-full border p-2 rounded text-sm"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">260/280 Ratio</label>
                         <input type="number" step="0.01" value={pcrState.nanodrop260_280} onChange={e => setPcrState({...pcrState, nanodrop260_280: Number(e.target.value)})} className="w-full border p-2 rounded text-sm"/>
                      </div>
                      <div>
                         <label className="block text-xs font-bold text-slate-500 mb-1">260/230 Ratio</label>
                         <input type="number" step="0.01" value={pcrState.nanodrop260_230} onChange={e => setPcrState({...pcrState, nanodrop260_230: Number(e.target.value)})} className="w-full border p-2 rounded text-sm"/>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={runPCRSimulation} 
                  disabled={!pcrState.template || !pcrState.fwdPrimer || !pcrState.revPrimer}
                  className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center"
                >
                   <span>Run Simulation</span>
                   <span className="text-xs font-normal opacity-80 mt-1">Check Amplification & Specificity</span>
                </button>
            </div>
        </div>
      )}

      {pcrState.view === 'RESULTS' && pcrResult && (
          <PCRAnalysisSuite 
             customProtocol={pcrResult}
             customQC={{
                 conc: pcrState.nanodropConc,
                 a260_280: pcrState.nanodrop260_280,
                 a260_230: pcrState.nanodrop260_230
             }}
          />
      )}
    </div>
  );

  return (
    <div className="min-h-[600px]">
      {activeModule === 'HUB' && renderHub()}
      {activeModule === 'QC' && renderNGS()}
      {activeModule === 'AST' && renderAST()}
      {activeModule === 'PHYLO' && <PhylogenyAnalysis onBack={() => setActiveModule('HUB')} />}
      {activeModule === 'PCR' && renderPCR()}
    </div>
  );
};

export default OpenToolkit;