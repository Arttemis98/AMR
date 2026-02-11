import React from 'react';
import { ArrowUp, ArrowDown, Info, Activity } from 'lucide-react';
import { GeneExpression } from '../types';

interface GeneFunction {
  product: string;
  mechanism: string;
  clinicalImpact: string;
}

const GENE_DATABASE: Record<string, GeneFunction> = {
  'mexA': {
    product: 'Membrane Fusion Protein (MFP)',
    mechanism: 'Connects inner membrane transporter (MexB) to outer pore (OprM), assembling the efflux pump.',
    clinicalImpact: 'Increases resistance to Fluoroquinolones (Cip) and Beta-lactams.'
  },
  'mexB': {
    product: 'RND Efflux Transporter',
    mechanism: 'Uses proton motive force to actively pump antibiotics out of the bacterial cell.',
    clinicalImpact: 'High-level resistance to multiple drug classes (MDR phenotype).'
  },
  'recA': {
    product: 'Recombinase A',
    mechanism: 'Triggers SOS response due to DNA damage (e.g., Chlorine stress). Promotes error-prone repair.',
    clinicalImpact: 'Facilitates Horizontal Gene Transfer (HGT) of resistance plasmids.'
  },
  'ompF': {
    product: 'Outer Membrane Porin',
    mechanism: 'Passive diffusion channel for small molecules.',
    clinicalImpact: 'Downregulation reduces permeability, preventing antibiotics entry.'
  },
  'lexA': {
    product: 'SOS Repressor',
    mechanism: 'Regulates SOS response; cleavage allows expression of repair genes.',
    clinicalImpact: 'Global regulator of stress response and mutagenesis.'
  }
};

const GeneMechanismTable: React.FC<{ data: GeneExpression[] }> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6 animate-fade-in">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Activity size={18} className="text-blue-600" />
        <h3 className="font-bold text-slate-800">Mechanistic Interpretation (Functional Genomics)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">Gene Target</th>
              <th className="p-4">Regulation</th>
              <th className="p-4">Biological Product</th>
              <th className="p-4 w-1/3">Mechanism of Action</th>
              <th className="p-4 w-1/4">Clinical Consequence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.filter(g => g.significance !== 'NS').map((gene) => {
              const info = GENE_DATABASE[gene.gene] || { 
                product: 'Unknown Protein', 
                mechanism: 'Mechanism under investigation', 
                clinicalImpact: 'Significance to be determined' 
              };
              return (
                <tr key={gene.gene} className="hover:bg-slate-50 group transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-700">{gene.gene}</td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full w-fit ${
                      gene.significance === 'UP' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {gene.significance === 'UP' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>}
                      {Math.abs(gene.log2FoldChange).toFixed(1)}x
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">{info.product}</td>
                  <td className="p-4 text-slate-600 italic">{info.mechanism}</td>
                  <td className="p-4 text-slate-800 font-medium border-l border-slate-100">{info.clinicalImpact}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default GeneMechanismTable;