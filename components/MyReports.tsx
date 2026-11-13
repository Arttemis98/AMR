import React, { useEffect, useState } from 'react';
import { AMRReport, UserProfile } from '../types';
import { MapPin, Calendar, Activity, ChevronRight, Dna, Trash2, Download, AlertCircle } from 'lucide-react';
import { deleteUserReport, subscribeUserReports } from '../services/irisFirestore';

interface MyReportsProps {
  user: UserProfile;
  uid: string;
  onSelectReport: (report: AMRReport) => void;
}

const MyReports: React.FC<MyReportsProps> = ({ user, uid, onSelectReport }) => {
  const [reports, setReports] = useState<AMRReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!uid) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserReports(
      uid,
      (items) => {
        setReports(items);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [uid]);

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;
    const headers = ['ID', 'Date', 'State', 'City', 'Site', 'Source', 'DataType', 'Organism', 'RiskFlag', 'Visibility', 'Summary'];
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const rows = reports.map((r) => [
      r.id,
      r.date,
      r.location.state,
      r.location.city,
      r.location.siteName,
      r.source,
      r.dataType,
      r.organism,
      r.resistanceFlag,
      r.visibility || 'PUBLIC',
      r.summary,
    ].map(escapeCsv).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iris_my_reports_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string, filePath?: string) => {
    setDeleteError('');
    try {
      await deleteUserReport(id, filePath);
    } catch (err) {
      console.error('Failed to delete report:', err);
      setDeleteError(err instanceof Error ? err.message : 'Unable to delete report. Please try again.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">My Submissions</h3>
        <p className="text-slate-500 text-sm">
          Tracking history for <strong>{user.name}</strong>. You have submitted <strong>{reports.length}</strong> {reports.length === 1 ? 'report' : 'reports'} to the IRIS repository.
        </p>
      </div>

      {deleteError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-2 text-rose-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{deleteError}</span>
          </div>
          <button onClick={() => setDeleteError('')} className="text-xs font-semibold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Report History</div>
          <button
            onClick={handleDownloadCSV}
            disabled={reports.length === 0}
            className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1 disabled:opacity-40"
          >
            <Download size={14} /> Download CSV
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading your submitted reports...</div>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      report.resistanceFlag === 'HIGH'
                        ? 'bg-rose-100 text-rose-600'
                        : report.resistanceFlag === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 flex-wrap">
                        <span>{report.organism}</span>
                        <span className="text-xs font-normal text-slate-400">({report.id})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            report.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : report.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {report.status || 'PENDING'}
                        </span>
                        {report.visibility === 'PRIVATE' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">PRIVATE</span>
                        )}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin size={10} /> {report.location.city}, {report.location.state}</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {report.date}</span>
                        <span className="flex items-center gap-1"><Dna size={10} /> {report.dataType}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 italic">"{report.summary}"</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3 shrink-0">
                    <div>
                      <div className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-block ${
                        report.resistanceFlag === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-100'
                          : report.resistanceFlag === 'MEDIUM'
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-100'
                          : 'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {report.resistanceFlag} RISK
                      </div>
                      <div className="flex items-center text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        View Analysis <ChevronRight size={14} />
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {confirmDeleteId === report.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(report.id, report.filePath)}
                            className="text-[11px] bg-rose-600 text-white px-2 py-1 rounded font-semibold hover:bg-rose-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[11px] bg-slate-200 text-slate-700 px-2 py-1 rounded font-semibold hover:bg-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(report.id)}
                          className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Delete report"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No reports submitted yet. Go to &quot;Submit Data&quot; to publish your first surveillance dataset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;