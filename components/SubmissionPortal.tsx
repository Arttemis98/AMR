import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, ChevronRight, MapPin, FlaskConical, Dna, PlayCircle, Eye, X, FileSpreadsheet } from 'lucide-react';
import { DataType, SampleSource } from '../types';

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

const SubmissionPortal: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
     state: '',
     city: '',
     sourceType: '' as SampleSource | '',
     dataType: '' as DataType | '',
     file: null as File | null
  });

  const getCities = (state: string) => {
    return CITIES[state] || CITIES["Other"];
  };

  const loadDemoData = () => {
    setFormData({
      state: 'Gujarat',
      city: 'Vadodara',
      sourceType: 'WWTP',
      dataType: 'AST_ONLY',
      file: new File(["Antibiotic,Zone,Conc\nCip,12,5mcg"], "ast_vadodara_wwtp_2024.csv", { type: "text/csv" })
    });
    // Do not auto-advance, let user see the filled data, but maybe scroll or highlight "Next"
  };

  const handleSubmit = () => {
      setShowSuccess(true);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, file: e.dataTransfer.files[0] });
    }
  };

  const renderStep1 = () => (
     <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">1. Sample Origin & Metadata</h3>
            <button 
              onClick={loadDemoData} 
              className="text-xs flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <PlayCircle size={14} className="mr-1"/> Load Sample Data
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State / Union Territory</label>
              <select 
                 className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                 value={formData.state}
                 onChange={e => setFormData({...formData, state: e.target.value, city: ''})}
              >
                 <option value="">Select State</option>
                 {INDIAN_STATES.map(s => (
                   <option key={s} value={s}>{s}</option>
                 ))}
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City / District</label>
              <select 
                 className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                 value={formData.city}
                 onChange={e => setFormData({...formData, city: e.target.value})}
                 disabled={!formData.state}
              >
                 <option value="">{formData.state ? 'Select City' : 'Select State first'}</option>
                 {formData.state && getCities(formData.state).map(c => (
                    <option key={c} value={c}>{c}</option>
                 ))}
                 <option value="Other">Other / Rural District</option>
              </select>
           </div>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Sample Source</label>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {(['CLINICAL', 'WWTP', 'RIVER', 'SOIL', 'LIVESTOCK'] as SampleSource[]).map((src) => (
                 <button
                    key={src}
                    onClick={() => setFormData({...formData, sourceType: src})}
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
        <div className="flex justify-end pt-4">
           <button 
             onClick={() => setStep(2)}
             disabled={!formData.state || !formData.city || !formData.sourceType}
             className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
           >
              Next Step <ChevronRight size={16} className="ml-2"/>
           </button>
        </div>
     </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">2. Analysis Type & Data Upload</h3>
          <button 
            onClick={() => setShowPreview(true)}
            className="text-xs flex items-center text-slate-600 hover:text-blue-600 bg-slate-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
          >
             <Eye size={14} className="mr-1"/> View Sample Template
          </button>
       </div>

       <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Data Category</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div 
               onClick={() => setFormData({...formData, dataType: 'AST_ONLY'})}
               className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.dataType === 'AST_ONLY' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
             >
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><FlaskConical size={20}/></div>
                   <h4 className="font-semibold text-slate-800">Phenotypic (AST)</h4>
                </div>
                <p className="text-xs text-slate-500">Zone of inhibition (Kirby-Bauer) or MIC data (VITEK/MicroScan).</p>
             </div>
             
             <div 
               onClick={() => setFormData({...formData, dataType: 'PCR'})}
               className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.dataType === 'PCR' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
             >
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Dna size={20}/></div>
                   <h4 className="font-semibold text-slate-800">Molecular (PCR)</h4>
                </div>
                <p className="text-xs text-slate-500">Presence/Absence of specific resistance genes (e.g., blaNDM, mcr-1).</p>
             </div>

             <div 
               onClick={() => setFormData({...formData, dataType: 'RNA_SEQ'})}
               className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${formData.dataType === 'RNA_SEQ' || formData.dataType === 'WGS' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
             >
                <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Dna size={20}/></div>
                   <h4 className="font-semibold text-slate-800">Genomic (NGS)</h4>
                </div>
                <p className="text-xs text-slate-500">Whole Genome Sequencing (WGS) or Transcriptomics (RNA-seq).</p>
             </div>
          </div>
       </div>

       {formData.dataType && (
          <div 
            className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
             <UploadCloud size={40} className="text-slate-400 mb-4"/>
             {formData.file ? (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                   <CheckCircle size={20} />
                   <span className="font-medium">{formData.file.name}</span>
                </div>
             ) : (
                <>
                   <p className="font-medium text-slate-700">Drag & Drop data file here</p>
                   <p className="text-xs text-slate-400 mt-1">Supports .csv, .xlsx, .fastq, .fasta</p>
                </>
             )}
          </div>
       )}

       <div className="flex justify-between pt-4">
          <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 px-4">Back</button>
          <button 
             onClick={handleSubmit}
             disabled={!formData.dataType || !formData.file} // Require file and type
             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium shadow-lg shadow-green-200 transition-colors"
           >
              Submit Report
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
                    <FileSpreadsheet size={18} className="text-green-600"/> Sample CSV Format
                 </h3>
                 <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <div className="bg-slate-50 p-4 rounded border border-slate-200 font-mono text-xs text-slate-600 overflow-x-auto">
                 <p className="mb-2 text-slate-400">// For AST Data</p>
                 <p>Antibiotic,Concentration,Zone_mm,Interpretation</p>
                 <p>Ciprofloxacin,5mcg,12,R</p>
                 <p>Gentamicin,10mcg,18,S</p>
                 <p>Meropenem,10mcg,22,S</p>
                 <br/>
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
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl max-w-md w-full p-8 shadow-2xl animate-fade-in text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                 <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Submission Received</h3>
              <p className="text-slate-500 mb-6">
                 Thank you for contributing to IRIS. Your data from <strong>{formData.city}, {formData.state}</strong> has been securely uploaded.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                 <p className="text-sm text-blue-800 font-medium mb-1">Status:</p>
                 <p className="text-xs text-blue-600">
                    • Validation Check: <span className="text-green-600 font-bold">Passed</span><br/>
                    • Analysis Pipeline: <span className="text-blue-600 font-bold animate-pulse">Running...</span>
                 </p>
              </div>
              <p className="text-xs text-slate-400 mb-6">A full PDF report will be generated shortly.</p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => { setShowSuccess(false); onComplete(); }} 
                   className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                 >
                    Return Home
                 </button>
                 <button 
                   onClick={() => alert("Report generation simulated. Download started.")}
                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                 >
                    <FileText size={16}/> View Report
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default SubmissionPortal;