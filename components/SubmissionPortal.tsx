import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  ChevronRight,
  MapPin,
  FlaskConical,
  Dna,
  PlayCircle,
  Eye,
  X,
  FileSpreadsheet,
  Calendar,
  Thermometer,
  Droplets,
  Activity,
  Globe,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { AMRReport, DataType, SampleSource, UserProfile } from '../types';
import { createReport, validateReportFile } from '../services/irisFirestore';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const CITIES: Record<string, string[]> = {
  "Gujarat": ["Ahmedabad", "Vadodara", "Surat", "Rajkot", "Anand", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Solapur", "Kolhapur"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Ghaziabad", "Prayagraj"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Other": ["Capital City", "District Headquarters", "Rural District"]
};

const CLINICAL_SAMPLES = ["Blood Culture", "Urine", "Sputum / Respiratory", "Wound Swab", "Stool", "CSF", "Tissue Biopsy"];
const STANDARDS = ["CLSI M100 (2024)", "CLSI M100 (2023)", "EUCAST v14.0", "WHO-NET Standard", "Internal Protocol"];

interface SubmissionPortalProps {
  uid: string;
  userProfile: UserProfile;
  emailVerified: boolean;
  onComplete: () => void;
  onViewReport: (report: AMRReport) => void;
}

const SubmissionPortal: React.FC<SubmissionPortalProps> = ({
  uid,
  userProfile,
  emailVerified,
  onComplete,
  onViewReport,
}) => {
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<AMRReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    state: '',
    city: '',
    siteName: '',
    latitude: '',
    longitude: '',
    collectionDate: '',
    sourceType: '' as SampleSource | '',
    ph: '',
    temperature: '',
    cod: '',
    clinicalSampleType: '',
    dataType: '' as DataType | '',
    standard: 'CLSI M100 (2024)',
    organism: '',
    resistanceFlag: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
    summary: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    file: null as File | null,
  });

  const getCities = (state: string) => {
    return CITIES[state] || CITIES["Other"];
  };

  const loadDemoData = () => {
    setFormData({
      state: 'Gujarat',
      city: 'Vadodara',
      siteName: 'Municipal WWTP Unit A',
      latitude: '22.3072',
      longitude: '73.1812',
      collectionDate: '2024-05-12',
      sourceType: 'WWTP',
      ph: '7.4',
      temperature: '28.5',
      cod: '450',
      clinicalSampleType: '',
      dataType: 'AST_ONLY',
      standard: 'CLSI M100 (2024)',
      organism: 'P. aeruginosa',
      resistanceFlag: 'HIGH',
      summary: 'Chlorine-induced multidrug resistance profile observed post-treatment.',
      visibility: 'PUBLIC',
      file: new File(["Antibiotic,Zone,Conc\nCiprofloxacin,12,5mcg"], "ast_vadodara_wwtp_2024.csv", { type: "text/csv" })
    });
  };

  const handleSubmit = async () => {
    if (!formData.sourceType || !formData.dataType) return;
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const created = await createReport(uid, userProfile, {
        state: formData.state,
        city: formData.city,
        siteName: formData.siteName || `${formData.city} Facility`,
        latitude: formData.latitude,
        longitude: formData.longitude,
        date: formData.collectionDate,
        source: formData.sourceType,
        dataType: formData.dataType,
        standard: formData.standard,
        organism: formData.organism || 'Unclassified isolate',
        resistanceFlag: formData.resistanceFlag,
        summary: formData.summary || `${formData.dataType} surveillance data submitted from ${formData.city}.`,
        fileName: formData.file?.name,
        file: formData.file,
        clinicalSampleType: formData.clinicalSampleType,
        ph: formData.ph,
        temperature: formData.temperature,
        cod: formData.cod,
        visibility: formData.visibility,
      });
      setSubmittedReport(created);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save surveillance report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectedFile = (file: File) => {
    try {
      validateReportFile(file);
      setSubmitError('');
      setFormData((prev) => ({ ...prev, file }));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Invalid file selected.');
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const isEnvironmental = ['WWTP', 'RIVER', 'SOIL'].includes(formData.sourceType);
  const isClinical = formData.sourceType === 'CLINICAL' || formData.sourceType === 'LIVESTOCK';

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">1. Sample Origin & Metadata</h3>
        <button
          type="button"
          onClick={loadDemoData}
          className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
        >
          <PlayCircle size={14} className="mr-1" /> Load Sample Data
        </button>
      </div>

      {/* ROW 1: Geography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">State / Union Territory <span className="text-red-500">*</span></label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={formData.state}
            onChange={e => setFormData({ ...formData, state: e.target.value, city: '' })}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">City / District <span className="text-red-500">*</span></label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            disabled={!formData.state}
          >
            <option value="">{formData.state ? 'Select City' : 'Select State first'}</option>
            {formData.state && getCities(formData.state).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Other">Other / Rural District</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Site / Facility Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <Building2 className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              maxLength={120}
              placeholder="e.g. Civil Hospital / WWTP"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ROW 2: Date & GPS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Collection Date <span className="text-red-500">*</span></label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={formData.collectionDate}
              onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Latitude (Optional)</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="number"
              placeholder="e.g. 22.3072"
              step="0.0001"
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Longitude (Optional)</label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="number"
              placeholder="e.g. 73.1812"
              step="0.0001"
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ROW 3: Sample Source */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Sample Source <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['CLINICAL', 'WWTP', 'RIVER', 'SOIL', 'LIVESTOCK'] as SampleSource[]).map((src) => (
            <button
              type="button"
              key={src}
              onClick={() => setFormData({ ...formData, sourceType: src })}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                formData.sourceType === src
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-slate-200 hover:border-blue-300 text-slate-600 bg-white'
              }`}
            >
              {src === 'WWTP' ? 'Wastewater' : src.charAt(0) + src.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* DYNAMIC METADATA FIELDS */}
      {formData.sourceType && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            {isEnvironmental ? <Droplets size={14} /> : <Activity size={14} />}
            {isEnvironmental ? 'Environmental Parameters' : 'Clinical Specifics'}
          </h4>

          {isEnvironmental && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">pH Level</label>
                <div className="relative">
                  <FlaskConical className="absolute left-3 top-2 text-slate-400" size={14} />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="7.0"
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Temperature (°C)</label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-2 text-slate-400" size={14} />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="25.0"
                    className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">COD (mg/L)</label>
                <input
                  type="number"
                  placeholder="Chemical Oxygen Demand"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 shadow-sm"
                  value={formData.cod}
                  onChange={(e) => setFormData({ ...formData, cod: e.target.value })}
                />
              </div>
            </div>
          )}

          {isClinical && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Specimen Type</label>
              <select
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm bg-white text-slate-900 focus:ring-1 focus:ring-blue-500 shadow-sm"
                value={formData.clinicalSampleType}
                onChange={(e) => setFormData({ ...formData, clinicalSampleType: e.target.value })}
              >
                <option value="">Select Specimen...</option>
                {CLINICAL_SAMPLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={!formData.state || !formData.city || !formData.sourceType || !formData.collectionDate}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
        >
          Next Step <ChevronRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">2. Analysis Type, Organism & Data Upload</h3>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="text-xs flex items-center text-slate-600 hover:text-blue-600 bg-slate-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
        >
          <Eye size={14} className="mr-1" /> View Sample Template
        </button>
      </div>

      {submitError && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Organism <span className="text-red-500">*</span></label>
          <input
            type="text"
            maxLength={120}
            placeholder="e.g. P. aeruginosa"
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.organism}
            onChange={(e) => setFormData({ ...formData, organism: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Risk Flag</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.resistanceFlag}
            onChange={(e) => setFormData({ ...formData, resistanceFlag: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' })}
          >
            <option value="LOW">LOW (Routine Surveillance)</option>
            <option value="MEDIUM">MEDIUM (Emerging Resistance)</option>
            <option value="HIGH">HIGH (Critical MDR / Alert)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Dashboard Visibility</label>
          <select
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={formData.visibility}
            onChange={(e) => setFormData({ ...formData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}
          >
            <option value="PUBLIC">Public (National Grid)</option>
            <option value="PRIVATE">Private (Only Me)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Findings Summary <span className="text-red-500">*</span></label>
        <input
          type="text"
          maxLength={500}
          placeholder="Brief interpretation (e.g. Carbapenem-resistant isolate with blaNDM-1)"
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-sm"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-slate-700">Methodology / Standard</label>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Compliance</span>
        </div>
        <select
          className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 mb-4 shadow-sm"
          value={formData.standard}
          onChange={(e) => setFormData({ ...formData, standard: e.target.value })}
        >
          {STANDARDS.map(std => <option key={std} value={std}>{std}</option>)}
        </select>

        <label className="block text-sm font-medium text-slate-700 mb-2">Data Category <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setFormData({ ...formData, dataType: 'AST_ONLY' })}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.dataType === 'AST_ONLY' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><FlaskConical size={20} /></div>
              <h4 className="font-semibold text-slate-800">Phenotypic (AST)</h4>
            </div>
            <p className="text-xs text-slate-500">Zone of inhibition (Kirby-Bauer) or MIC data (VITEK/MicroScan).</p>
          </div>

          <div
            onClick={() => setFormData({ ...formData, dataType: 'PCR' })}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.dataType === 'PCR' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Dna size={20} /></div>
              <h4 className="font-semibold text-slate-800">Molecular (PCR)</h4>
            </div>
            <p className="text-xs text-slate-500">Presence/Absence of specific resistance genes (e.g., blaNDM, mcr-1).</p>
          </div>

          <div
            onClick={() => setFormData({ ...formData, dataType: 'RNA_SEQ' })}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.dataType === 'RNA_SEQ' || formData.dataType === 'WGS' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Dna size={20} /></div>
              <h4 className="font-semibold text-slate-800">Genomic (NGS)</h4>
            </div>
            <p className="text-xs text-slate-500">Whole Genome Sequencing (WGS) or Transcriptomics (RNA-seq).</p>
          </div>
        </div>
      </div>

      {formData.dataType && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.txt,.fasta,.fastq,.gz,.pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <UploadCloud size={40} className="text-slate-400 mb-4" />
          {formData.file ? (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <CheckCircle size={20} />
              <span className="font-medium">{formData.file.name}</span>
            </div>
          ) : (
            <>
              <p className="font-medium text-slate-700">Click or Drag &amp; Drop data file here</p>
              <p className="text-xs text-slate-400 mt-1">Supports .csv, .xlsx, .txt, .fasta, .fastq, .gz, .pdf (max 25 MB)</p>
            </>
          )}
        </div>
      )}

      {!emailVerified && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          Please verify your email address (check the banner at the top) before submitting reports to the national database.
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button type="button" onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 px-4">Back</button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!emailVerified || isSubmitting || !formData.dataType || !formData.organism.trim() || !formData.summary.trim()}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium shadow-lg shadow-green-200 transition-colors"
        >
          {isSubmitting ? 'Saving to IRIS...' : 'Submit Report'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 relative">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Submit Surveillance Data</h2>
            <p className="text-slate-500">Contribute to the National IRIS Repository</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-green-600" /> Sample CSV Format
              </h3>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs text-slate-600 overflow-x-auto">
              <p className="mb-2 text-slate-400">// For AST Data</p>
              <p>Antibiotic,Concentration,Zone_mm,Interpretation</p>
              <p>Ciprofloxacin,5mcg,12,R</p>
              <p>Gentamicin,10mcg,18,S</p>
              <p>Meropenem,10mcg,22,S</p>
              <br />
              <p className="mb-2 text-slate-400">// For PCR Data</p>
              <p>SampleID,Gene,Result,Ct_Value</p>
              <p>S-001,blaNDM-1,Positive,24.5</p>
              <p>S-001,mcr-1,Negative,-</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {submittedReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl animate-fade-in text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Submission Saved</h3>
            <p className="text-slate-500 mb-6">
              Your surveillance report (<strong>{submittedReport.id}</strong>) from <strong>{submittedReport.location.city}, {submittedReport.location.state}</strong> is stored in IRIS with status <strong>PENDING</strong> review before public listing.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-left bg-slate-50 p-3 rounded-lg mb-4">
              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold">{submittedReport.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Standard</span>
                <span className="font-semibold">{(submittedReport.standard || 'CLSI').split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Organism</span>
                <span className="font-semibold italic">{submittedReport.organism}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Visibility</span>
                <span className="font-semibold">{submittedReport.visibility}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSubmittedReport(null); onComplete(); }}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Return Home
              </button>
              <button
                onClick={() => {
                  const target = submittedReport;
                  setSubmittedReport(null);
                  onViewReport(target);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <FileText size={16} /> View Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionPortal;