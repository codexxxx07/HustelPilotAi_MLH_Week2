import { useState, useEffect } from 'react';
import {
  FolderOpen, Search, FileText, Receipt, MessageSquare,
  Calculator, Trash2, Download, AlertCircle, Filter,
  ChevronRight, Info, Database
} from 'lucide-react';
import { proposalStorage, invoiceStorage, communicationStorage, estimateStorage, backupStorage } from '../services/storage';

const TYPE_CONFIG = {
  proposal: { label: 'Proposal', icon: FileText, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  invoice: { label: 'Invoice', icon: Receipt, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  communication: { label: 'Message', icon: MessageSquare, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  estimate: { label: 'Estimate', icon: Calculator, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.proposal;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${cfg.color}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

function DocItem({ doc, onDelete }) {
  const title = doc.title || doc.projectTitle || doc.projectDescription?.slice(0, 50) || doc.purpose || 'Untitled';
  const sub = doc.clientName || doc.invoiceNumber || doc.context?.slice(0, 40) || '';

  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#1e293b] last:border-0 group">
      <TypeBadge type={doc.docType} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate">{title}</p>
        {sub && <p className="text-xs text-slate-500 truncate mt-0.5">{sub}</p>}
      </div>
      <p className="text-xs text-slate-600 flex-shrink-0">{new Date(doc.updatedAt).toLocaleDateString()}</p>
      <button
        onClick={() => onDelete(doc.id, doc.docType)}
        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [exportMsg, setExportMsg] = useState('');

  const load = () => {
    const all = [
      ...proposalStorage.getAll().map(d => ({ ...d, docType: 'proposal' })),
      ...invoiceStorage.getAll().map(d => ({ ...d, docType: 'invoice' })),
      ...communicationStorage.getAll().map(d => ({ ...d, docType: 'communication' })),
      ...estimateStorage.getAll().map(d => ({ ...d, docType: 'estimate' })),
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    setDocs(all);
  };

  useEffect(() => { load(); }, []);

  const filtered = docs.filter(d => {
    const matchType = typeFilter === 'all' || d.docType === typeFilter;
    const title = d.title || d.projectTitle || d.projectDescription || d.purpose || '';
    const sub = d.clientName || d.invoiceNumber || '';
    const matchSearch = !search || (title + sub).toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const handleDelete = (id, type) => {
    const storages = { proposal: proposalStorage, invoice: invoiceStorage, communication: communicationStorage, estimate: estimateStorage };
    storages[type]?.delete(id);
    load();
    setDeleteInfo(null);
  };

  const handleExport = () => {
    const data = backupStorage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hustlepilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg('Backup downloaded.');
    setTimeout(() => setExportMsg(''), 3000);
  };

  const counts = {
    all: docs.length,
    proposal: docs.filter(d => d.docType === 'proposal').length,
    invoice: docs.filter(d => d.docType === 'invoice').length,
    communication: docs.filter(d => d.docType === 'communication').length,
    estimate: docs.filter(d => d.docType === 'estimate').length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
          <p className="text-slate-400 text-sm">{docs.length} saved document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 border border-[#334155] hover:border-[#475569] rounded-xl transition-colors"
        >
          <Download size={14} /> Export Backup
        </button>
      </div>

      {exportMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg mb-4">
          <AlertCircle size={14} className="text-green-400" />
          <p className="text-xs text-green-300">{exportMsg}</p>
        </div>
      )}

      {/* Storage notice */}
      <div className="flex items-start gap-3 p-4 bg-[#1e293b]/40 border border-[#334155] rounded-xl mb-5">
        <Database size={15} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          All documents are stored in your browser's local storage. They are <strong className="text-slate-400">not encrypted</strong> and are <strong className="text-slate-400">not synchronized</strong> to any server. 
          Clearing browser data or switching devices will remove your documents. Use "Export Backup" to save a local copy.
        </p>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {['all', 'proposal', 'invoice', 'communication', 'estimate'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              typeFilter === type
                ? 'bg-[#1e293b] border-[#475569] text-white'
                : 'border-[#1e293b] text-slate-500 hover:text-slate-300'
            }`}
          >
            {type === 'all' ? `All (${counts.all})` : `${TYPE_CONFIG[type].label}s (${counts[type]})`}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      </div>

      {/* Document List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center mx-auto mb-5">
            <FolderOpen size={24} className="text-slate-600" />
          </div>
          <h2 className="text-white font-semibold mb-2">
            {docs.length === 0 ? 'No documents yet' : 'No results found'}
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {docs.length === 0
              ? 'Create proposals, invoices, estimates, and communication drafts — they\'ll all appear here.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl px-5 py-2">
          {filtered.map(doc => (
            <DocItem
              key={doc.id}
              doc={doc}
              onDelete={(id, type) => setDeleteInfo({ id, type })}
            />
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-white font-semibold mb-2">Delete Document?</h3>
            <p className="text-slate-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteInfo(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button
                onClick={() => handleDelete(deleteInfo.id, deleteInfo.type)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
