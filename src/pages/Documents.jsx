import { useState, useEffect } from 'react';
import {
  FolderOpen, Search, FileText, Receipt, MessageSquare,
  Calculator, Trash2, Download, Database, CheckCircle, ArrowUpDown
} from 'lucide-react';
import { proposalStorage, invoiceStorage, communicationStorage, estimateStorage, backupStorage } from '../services/storage';
import {
  Button, ClayCard, IconTile, Badge, EmptyState, PageHeader,
  Modal, Input, Select
} from '../components/ui';

const TYPE_CONFIG = {
  proposal: { label: 'Proposal', icon: FileText, tone: 'accent' },
  invoice: { label: 'Invoice', icon: Receipt, tone: 'mint' },
  communication: { label: 'Message', icon: MessageSquare, tone: 'peach' },
  estimate: { label: 'Estimate', icon: Calculator, tone: 'lav' },
};

function DocRow({ doc, onDelete }) {
  const cfg = TYPE_CONFIG[doc.docType] || TYPE_CONFIG.proposal;
  const title = doc.title || doc.projectTitle || doc.projectDescription?.slice(0, 60) || doc.purpose || 'Untitled';
  const sub = doc.clientName || doc.invoiceNumber || doc.context?.slice(0, 50) || '';

  return (
    <div className="flex items-center gap-4 py-4 border-b border-line last:border-0">
      <IconTile icon={cfg.icon} tone={cfg.tone} size="sm" className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink font-medium truncate">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge tone={cfg.tone} className="hidden sm:inline-flex">{cfg.label}</Badge>
          {sub && <p className="text-xs text-muted truncate">{sub}</p>}
        </div>
      </div>
      <p className="text-xs text-muted flex-shrink-0 hidden sm:block">{new Date(doc.updatedAt).toLocaleDateString()}</p>
      <Button variant="ghost" iconOnly size="sm" onClick={() => onDelete(doc.id, doc.docType)} aria-label="Delete document" title="Delete">
        <Trash2 size={15} className="text-danger" />
      </Button>
    </div>
  );
}

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [exportMsg, setExportMsg] = useState('');

  const load = () => {
    const all = [
      ...proposalStorage.getAll().map(d => ({ ...d, docType: 'proposal' })),
      ...invoiceStorage.getAll().map(d => ({ ...d, docType: 'invoice' })),
      ...communicationStorage.getAll().map(d => ({ ...d, docType: 'communication' })),
      ...estimateStorage.getAll().map(d => ({ ...d, docType: 'estimate' })),
    ];
    setDocs(all);
  };

  useEffect(() => { load(); }, []);

  const docTitle = d => (d.title || d.projectTitle || d.projectDescription || d.purpose || '').toString();

  const filtered = docs
    .filter(d => {
      const matchType = typeFilter === 'all' || d.docType === typeFilter;
      const sub = d.clientName || d.invoiceNumber || '';
      const matchSearch = !search || (docTitle(d) + sub).toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return docTitle(a).localeCompare(docTitle(b));
      if (sortBy === 'type') return a.docType.localeCompare(b.docType);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
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
    <div className="p-5 sm:p-7 max-w-5xl mx-auto">
      <PageHeader
        title="Documents"
        subtitle={`${docs.length} saved document${docs.length !== 1 ? 's' : ''} across every tool`}
        actions={
          <Button variant="secondary" onClick={handleExport} className="gap-2">
            <Download size={15} /> Export backup
          </Button>
        }
      />

      {exportMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-[14px] mb-5" style={{ background: 'var(--c-success-soft)' }}>
          <CheckCircle size={15} className="text-[var(--c-success)]" />
          <p className="text-xs text-inkbody font-medium">{exportMsg}</p>
        </div>
      )}

      <div className="clay-sunken flex items-start gap-3.5 p-4 mb-6">
        <Database size={17} className="text-muted mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted leading-relaxed">
          All documents live in this browser's <strong className="text-inkbody">local storage</strong>. They are not encrypted or
          synced to any server. Clearing browser data or switching devices removes them — use “Export backup” to keep a copy.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'proposal', 'invoice', 'communication', 'estimate'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                typeFilter === type ? 'border-transparent text-ink' : 'border-line text-muted hover:text-ink'
              }`}
              style={typeFilter === type ? { background: 'var(--c-surface)', boxShadow: 'var(--clay-soft)' } : undefined}
            >
              {type === 'all' ? `All (${counts.all})` : `${TYPE_CONFIG[type].label}s (${counts[type]})`}
            </button>
          ))}
        </div>
        <div className="flex gap-3 lg:ml-auto w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <Input className="pl-11" placeholder="Search documents…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <Select className="pl-9 w-36" value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort documents">
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </Select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <ClayCard flat>
          <EmptyState
            icon={FolderOpen}
            title={docs.length === 0 ? 'No documents yet' : 'No results found'}
            description={docs.length === 0
              ? 'Proposals, invoices, estimates and message drafts all collect here automatically.'
              : 'Try adjusting your search or filters.'}
          />
        </ClayCard>
      ) : (
        <ClayCard flat className="px-5 py-1">
          {filtered.map(doc => (
            <DocRow
              key={`${doc.docType}-${doc.id}`}
              doc={doc}
              onDelete={(id, type) => setDeleteInfo({ id, type })}
            />
          ))}
        </ClayCard>
      )}

      {deleteInfo && (
        <Modal onClose={() => setDeleteInfo(null)} size="sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <IconTile icon={Trash2} tone="danger" size="sm" />
              <h3 className="text-ink font-semibold">Delete document?</h3>
            </div>
            <p className="text-muted text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteInfo(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteInfo.id, deleteInfo.type)}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
