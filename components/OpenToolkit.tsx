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
  FlaskConical,
  Disc,
  GitMerge
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
import PlasmidMapper from './PlasmidMapper';
import MetabolicPathwayMapper from './MetabolicPathwayMapper';
import ProteinDockingViewer from './ProteinDockingViewer';
import { GeneExpression } from '../types';

type ToolModule = 'HUB' | 'QC' | 'AST' | 'PHYLO' | 'PCR' | 'PLASMID' | 'METABOLIC' | 'DOCKING';
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
  const [ngsFiles, setNgsFiles] = useState<File[]>([]);
  
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

  const loadSampleASTData = () => {
    if (astMode === 'DISK') {
        const sampleDiskData: ASTEntry[] = [
            { id: 1, mechanism: 'Cell Wall Synthesis Inhibitors', classification: 'Penicillins', antibiotic: 'Penicillin G', abbr: 'P', concValue: '10', concUnit: 'units', zone: 15, result: 'R' },
            { id: 2, mechanism: 'DNA/RNA Synthesis Inhibitors', classification: 'Fluoroquinolones', antibiotic: 'Ciprofloxacin', abbr: 'CIP', concValue: '5', concUnit: 'mcg', zone: 28, result: 'S' },
            { id: 3, mechanism: 'Protein Synthesis Inhibitors', classification: 'Aminoglycosides', antibiotic: 'Gentamicin', abbr: 'CN', concValue: '10', concUnit: 'mcg', zone: 13, result: 'I' },
            { id: 4, mechanism: 'Cell Wall Synthesis Inhibitors', classification: 'Carbapenems', antibiotic: 'Meropenem', abbr: 'MEM', concValue: '10', concUnit: 'mcg', zone: 25, result: 'S' },
            { id: 5, mechanism: 'Metabolic & Membrane Agents', classification: 'Glycopeptides', antibiotic: 'Vancomycin', abbr: 'VA', concValue: '30', concUnit: 'mcg', zone: 10, result: 'R' }, // S. aureus context usually
            { id: 6, mechanism: 'Protein Synthesis Inhibitors', classification: 'Tetracyclines', antibiotic: 'Tetracycline', abbr: 'TE', concValue: '30', concUnit: 'mcg', zone: 16, result: 'I' },
            { id: 7, mechanism: 'Cell Wall Synthesis Inhibitors', classification: 'Cephalosporins (3rd, 4th & 5th Gen)', antibiotic: 'Ceftazidime', abbr: 'CAZ', concValue: '30', concUnit: 'mcg', zone: 14, result: 'R' },
            { id: 8, mechanism: 'Protein Synthesis Inhibitors', classification: 'Aminoglycosides', antibiotic: 'Amikacin', abbr: 'AK', concValue: '30', concUnit: 'mcg', zone: 22, result: 'S' },
            { id: 9, mechanism: 'Metabolic & Membrane Agents', classification: 'Urinary Tract Agents', antibiotic: 'Nitrofurantoin', abbr: 'F', concValue: '300', concUnit: 'mcg', zone: 19, result: 'S' },
            { id: 10, mechanism: 'Metabolic & Membrane Agents', classification: 'Folate Pathway', antibiotic: 'Trimethoprim-Sulfamethoxazole', abbr: 'SXT', concValue: '1.25/23.75', concUnit: 'mcg', zone: 9, result: 'R' },
        ];
        setAstEntries(sampleDiskData);
    } else {
        const sampleMicData: MICEntry[] = [
             { id: 101, antibiotic: 'Ciprofloxacin', micValue: 0.25, breakPointS: 1, breakPointR: 4, result: 'S' },
             { id: 102, antibiotic: 'Gentamicin', micValue: 8, breakPointS: 4, breakPointR: 16, result: 'I' },
             { id: 103, antibiotic: 'Meropenem', micValue: 32, breakPointS: 2, breakPointR: 8, result: 'R' },
             { id: 104, antibiotic: 'Colistin', micValue: 0.5, breakPointS: 2, breakPointR: 4, result: 'S' },
             { id: 105, antibiotic: 'Ceftazidime', micValue: 64, breakPointS: 8, breakPointR: 32, result: 'R' },
             { id: 106, antibiotic: 'Tetracycline', micValue: 8, breakPointS: 4, breakPointR: 16, result: 'I' },
             { id: 107, antibiotic: 'Amikacin', micValue: 2, breakPointS: 16, breakPointR: 64, result: 'S' },
             { id: 108, antibiotic: 'Imipenem', micValue: 0.5, breakPointS: 2, breakPointR: 8, result: 'S' },
             { id: 109, antibiotic: 'Piperacillin-Tazobactam', micValue: 128, breakPointS: 16, breakPointR: 128, result: 'R' },
             { id: 110, antibiotic: 'Levofloxacin', micValue: 4, breakPointS: 2, breakPointR: 8, result: 'I' },
        ];
        setMicEntries(sampleMicData);
    }
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

        <div onClick={() => setActiveModule('PLASMID')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4 group-hover:scale-110 transition-transform"><Disc size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Plasmid Map Visualizer</h3>
          <p className="text-sm text-slate-500 mb-4">Design circular plasmid maps, annotate resistance genes, and visualize restriction sites.</p>
          <div className="flex items-center text-pink-600 text-sm font-medium">Launch Tool <ChevronRight size={16} /></div>
        </div>

        <div onClick={() => setActiveModule('METABOLIC')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform"><GitMerge size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Metabolic Pathway Mapper</h3>
          <p className="text-sm text-slate-500 mb-4">Link RNA-seq differential expression to metabolic flux changes (e.g. Vancomycin resistance).</p>
          <div className="flex items-center text-orange-600 text-sm font-medium">Launch Tool <ChevronRight size={16} /></div>
        </div>

        <div onClick={() => setActiveModule('DOCKING')} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer">
          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform"><Box size={24} /></div>
          <h3 className="font-bold text-slate-800 text-lg mb-2">Protein Docking Viewer</h3>
          <p className="text-sm text-slate-500 mb-4">Visualize antibiotic binding pockets and steric hindrance mechanisms (e.g. GyrA D87N).</p>
          <div className="flex items-center text-cyan-600 text-sm font-medium">Launch Tool <ChevronRight size={16} /></div>
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
                <button onClick={() => { setNgsType('NONE'); setQcStatus('IDLE'); setNgsFiles([]); setOrganismName(''); }} className="text-xs hover:text-white/80">Change Type</button>
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
                        <div className="flex justify-between items-center">
                             <h3 className="font-bold text-slate-800">2. Upload Reads</h3>
                             <button 
                                onClick={() => {
                                    setOrganismName('Pseudomonas aeruginosa');
                                    setNgsFiles([
                                        new File([""], "SRR123456_1.fastq"),
                                        new File([""], "SRR123456_2.fastq")
                                    ]);
                                }}
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 flex items-center gap-1"
                             >
                                <Play size={12}/> Load Sample
                             </button>
                        </div>
                        
                        {ngsType === 'RNA' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <label className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center h-32 relative">
                                    <input type="file" multiple className="hidden" onChange={(e) => { if(e.target.files) setNgsFiles([...ngsFiles, ...Array.from(e.target.files)]) }} />
                                    <FileCode className="mx-auto text-blue-400 mb-2"/>
                                    <span className="text-xs font-bold text-slate-600 block">Control Samples</span>
                                    <span className="text-xs text-slate-400">(Replicates 1-3)</span>
                                </label>
                                <label className="border border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center h-32 relative">
                                    <input type="file" multiple className="hidden" onChange={(e) => { if(e.target.files) setNgsFiles([...ngsFiles, ...Array.from(e.target.files)]) }} />
                                    <FileCode className="mx-auto text-rose-400 mb-2"/>
                                    <span className="text-xs font-bold text-slate-600 block">Treated Samples</span>
                                    <span className="text-xs text-slate-400">(Replicates 1-3)</span>
                                </label>
                            </div>
                        ) : (
                            <label className="border-2 border-dashed border-slate-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 relative">
                                <input 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setNgsFiles(Array.from(e.target.files));
                                        }
                                    }} 
                                />
                                {ngsFiles.length > 0 ? (
                                    <div className="text-center animate-fade-in">
                                        <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                        <span className="text-sm font-bold text-slate-700 block">{ngsFiles.length} Files Selected</span>
                                        <span className="text-xs text-slate-400 max-w-[200px] truncate block mx-auto">{ngsFiles[0].name}{ngsFiles.length > 1 ? ` +${ngsFiles.length - 1} more` : ''}</span>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <UploadCloud className="mx-auto text-slate-400 mb-2" size={32}/>
                                        <span className="text-sm font-medium text-slate-600 block">Upload FASTQ Files</span>
                                        <span className="text-xs text-slate-400 block mt-1">Drag & drop or click to browse</span>
                                    </div>
                                )}
                            </label>
                        )}
                        
                        {/* Show selected file count for RNA too if files exist */}
                        {ngsType === 'RNA' && ngsFiles.length > 0 && (
                             <div className="text-xs text-center text-green-600 font-bold bg-green-50 p-2 rounded">
                                {ngsFiles.length} FASTQ files ready for alignment
                             </div>
                        )}

                        <button 
                          onClick={runQCPipeline} 
                          disabled={ngsFiles.length === 0 && !organismName} // Simple validation
                          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
       <div className="flex items-center space-x-4 mb-2">
         <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
           <ArrowLeft size={20} />
         </button>
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Advanced AST Calculator</h2>
            <p className="text-slate-500">CLSI M100 Breakpoint Interpretation</p>
         </div>
       </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setAstMode('DISK')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${astMode === 'DISK' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}>Disk Diffusion</button>
             <button onClick={() => setAstMode('MIC')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${astMode === 'MIC' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}>MIC Value</button>
          </div>
          <button onClick={loadSampleASTData} className="text-xs bg-teal-50 text-teal-600 px-3 py-1 rounded-full font-bold hover:bg-teal-100 flex items-center gap-1">
             <Play size={12}/> Load Demo Data
          </button>
        </div>

        {astMode === 'DISK' ? (
           <div>
              {/* Table for Disk */}
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                       <tr>
                          <th className="p-3">Antibiotic</th>
                          <th className="p-3">Potency</th>
                          <th className="p-3">Zone (mm)</th>
                          <th className="p-3">Interpretation</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {astEntries.map(entry => (
                          <tr key={entry.id}>
                             <td className="p-3 font-medium text-slate-800">{entry.antibiotic}</td>
                             <td className="p-3 text-slate-500">{entry.concValue} {entry.concUnit}</td>
                             <td className="p-3">
                                <input 
                                  type="number" 
                                  className="border border-slate-300 rounded w-20 p-1"
                                  value={entry.zone}
                                  onChange={(e) => updateEntry(entry.id, 'zone', e.target.value)}
                                />
                             </td>
                             <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                   entry.result === 'R' ? 'bg-red-100 text-red-700' :
                                   entry.result === 'I' ? 'bg-yellow-100 text-yellow-700' :
                                   'bg-green-100 text-green-700'
                                }`}>{entry.result}</span>
                             </td>
                          </tr>
                       ))}
                       {astEntries.length === 0 && (
                          <tr><td colSpan={4} className="p-4 text-center text-slate-400">No entries. Load demo data or add antibiotics.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        ) : (
           <div>
              {/* Table for MIC */}
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                       <tr>
                          <th className="p-3">Antibiotic</th>
                          <th className="p-3">MIC (µg/mL)</th>
                          <th className="p-3">Breakpoints (S/R)</th>
                          <th className="p-3">Result</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {micEntries.map(entry => (
                          <tr key={entry.id}>
                             <td className="p-3 font-medium text-slate-800">{entry.antibiotic}</td>
                             <td className="p-3 font-mono">{entry.micValue}</td>
                             <td className="p-3 text-slate-500">≤{entry.breakPointS} / ≥{entry.breakPointR}</td>
                             <td className="p-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                   entry.result === 'R' ? 'bg-red-100 text-red-700' :
                                   entry.result === 'I' ? 'bg-yellow-100 text-yellow-700' :
                                   'bg-green-100 text-green-700'
                                }`}>{entry.result}</span>
                             </td>
                          </tr>
                       ))}
                       {micEntries.length === 0 && (
                          <tr><td colSpan={4} className="p-4 text-center text-slate-400">No MIC data. Load demo data.</td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
       {activeModule === 'HUB' && renderHub()}
       {activeModule === 'QC' && renderNGS()}
       {activeModule === 'AST' && renderAST()}
       {activeModule === 'PHYLO' && <PhylogenyAnalysis onBack={() => setActiveModule('HUB')} />}
       {activeModule === 'PCR' && (
         <div className="animate-fade-in space-y-4">
             <div className="flex items-center space-x-4 mb-2">
                 <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                 <ArrowLeft size={20} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800">In-Silico PCR</h2>
                    <p className="text-slate-500">Primer Thermodynamics & Amplification Simulation</p>
                 </div>
             </div>
             {pcrState.view === 'FORM' ? (
                 <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-4xl">
                     {/* PCR FORM */}
                     <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Name</label>
                             <input className="w-full border p-2 rounded text-sm" value={pcrState.geneName} onChange={e => setPcrState({...pcrState, geneName: e.target.value})} placeholder="e.g. blaNDM-1"/>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handlePcrLoadDemo} className="text-xs bg-purple-50 text-purple-600 px-3 py-2 rounded-lg font-bold hover:bg-purple-100 flex items-center gap-1">
                                <Play size={14}/> Load Template
                            </button>
                        </div>
                     </div>
                     <div className="mb-4">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Sequence (5' to 3')</label>
                         <textarea className="w-full border p-2 rounded text-xs font-mono h-24" value={pcrState.template} onChange={e => setPcrState({...pcrState, template: e.target.value})} />
                     </div>
                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Forward Primer</label>
                             <input className="w-full border p-2 rounded text-xs font-mono" value={pcrState.fwdPrimer} onChange={e => setPcrState({...pcrState, fwdPrimer: e.target.value})} />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reverse Primer</label>
                             <input className="w-full border p-2 rounded text-xs font-mono" value={pcrState.revPrimer} onChange={e => setPcrState({...pcrState, revPrimer: e.target.value})} />
                        </div>
                     </div>
                     <button onClick={runPCRSimulation} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700">Run PCR</button>
                 </div>
             ) : (
                 <div className="space-y-4">
                    <button onClick={() => setPcrState({...pcrState, view: 'FORM'})} className="text-sm text-slate-500 hover:text-purple-600">Modify Reaction</button>
                    {pcrResult && <PCRAnalysisSuite customProtocol={pcrResult} customQC={{conc: pcrState.nanodropConc, a260_280: pcrState.nanodrop260_280, a260_230: pcrState.nanodrop260_230}} />}
                 </div>
             )}
         </div>
       )}
       {activeModule === 'PLASMID' && (
           <div className="animate-fade-in space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                 <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                   <ArrowLeft size={20} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800">Plasmid Mapper</h2>
                    <p className="text-slate-500">Circular Map Visualization & Annotation</p>
                 </div>
              </div>
              <PlasmidMapper />
           </div>
       )}
       {activeModule === 'METABOLIC' && (
           <div className="animate-fade-in space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                 <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                   <ArrowLeft size={20} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800">Metabolic Pathway Mapper</h2>
                    <p className="text-slate-500">Omics Integration</p>
                 </div>
              </div>
              <MetabolicPathwayMapper />
           </div>
       )}
       {activeModule === 'DOCKING' && (
           <div className="animate-fade-in space-y-4">
              <div className="flex items-center space-x-4 mb-2">
                 <button onClick={() => setActiveModule('HUB')} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
                   <ArrowLeft size={20} />
                 </button>
                 <div>
                    <h2 className="text-2xl font-bold text-slate-800">Protein Docking Viewer</h2>
                    <p className="text-slate-500">Structural Basis of Resistance</p>
                 </div>
              </div>
              <ProteinDockingViewer />
           </div>
       )}
    </div>
  );
};

export default OpenToolkit;