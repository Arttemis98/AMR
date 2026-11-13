export enum AppView {
  DASHBOARD = 'DASHBOARD',
  SUBMISSION = 'SUBMISSION',
  MY_REPORTS = 'MY_REPORTS',
  ANALYSIS_SUITE = 'ANALYSIS_SUITE', // Viewing specific reports
  OPEN_TOOLS = 'OPEN_TOOLS',          // Independent analysis tools
  AI_CONSULTANT = 'AI_CONSULTANT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isLoading?: boolean;
}

export type SampleSource = 'CLINICAL' | 'WWTP' | 'RIVER' | 'SOIL' | 'LIVESTOCK';
export type DataType = 'AST_ONLY' | 'PCR' | 'WGS' | 'RNA_SEQ';
export type ReportStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AMRReport {
  id: string;
  authorId?: string;
  location: {
    state: string;
    city: string;
    siteName: string;
  };
  latitude?: string;
  longitude?: string;
  date: string;
  source: SampleSource;
  dataType: DataType;
  organism: string;
  resistanceFlag: 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
  submittedBy?: string;
  submittedByInstitute?: string;
  standard?: string;
  fileName?: string;
  filePath?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  status?: ReportStatus;
}

export type ThemePreference = 'light' | 'dark';

export interface UserProfile {
  uid?: string;
  name: string;
  designation: string;
  institute: string;
  address: string;
  email: string;
  mobile: string;
  orcid: string;
  avatarInitials: string;
  themePreference?: ThemePreference;
}

// Chart Data Types
export interface SamplePoint {
  stage: string;
  cfuPerMl: number;
  description: string;
}

// Analysis Types
export interface AntibioticData {
  antibiotic: string;
  Control?: number; // Zone size mm
  Treated?: number; // Optional for clinical
  Breakpoint?: number;
  // Dashboard Chart specific fields
  zoneBeforeChlorine?: number;
  zoneAfterChlorine?: number;
  class?: string;
}

export interface GeneExpression {
  gene: string;
  log2FoldChange: number;
  pvalue: number;
  significance: 'UP' | 'DOWN' | 'NS';
  function?: string;
}

export interface EnrichmentTerm {
  term: string;
  count: number;
  pvalue: number;
}

export interface BlastHit {
  accession: string;
  organism: string;
  identity: number;
  eValue: number;
  score: number;
}