import { useState, useEffect } from 'react';
import {
  Plus, FileText, Trash2, Copy, Edit3, Sparkles,
  AlertCircle, Loader2, ChevronDown, ChevronUp,
  Save, Printer, Search, CheckCircle
} from 'lucide-react';
import { proposalStorage } from '../services/storage';
import { generateProposal, fallbackTemplates, checkOllamaAvailability } from '../services/ai';
import {
  Button, ClayCard, IconTile, Field, Input, Textarea, Select,
  Badge, Modal, ModalHeader, EmptyState, PageHeader, Toggle, PrintPortal
} from '../components/ui';

const TONES = ['Professional', 'Friendly', 'Formal', 'Concise', 'Enthusiastic'];
const EMPTY_FORM = {
  clientName: '', projectTitle: '', projectDescription: '',
  servicesIncluded: '', estimatedBudget: '', deliveryTimeline: '',
  tone: 'Professional', additionalRequirements: '',
};

function MarkdownPreview({ content }) {
  const html = content
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^---$/gm, '<hr />')
    .replace(/\[REQUIRED: (.+?)\]/g, '<mark>[REQUIRED: $1]</mark>')
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
    .join('\n');

  return <div className="prose-document text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

function ProposalCard({ proposal, onEdit, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (!printing) return;
    const id = requestAnimationFrame(() => {
      window.print();
      setPrinting(false);
    });
    return () => cancelAnimationFrame(id);
  }, [printing]);

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ClayCard flat className="overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            <IconTile icon={FileText} tone="accent" size="sm" className="flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-ink text-sm truncate">
                {proposal.title || proposal.projectTitle || 'Untitled proposal'}
              </h3>
              <p className="text-xs text-muted mt-1">
                {proposal.clientName && `For ${proposal.clientName} · `}
                {new Date(proposal.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" iconOnly size="sm" onClick={() => onEdit(proposal)} title="Edit" aria-label="Edit proposal">
              <Edit3 size={15} />
            </Button>
            <Button variant="ghost" iconOnly size="sm" onClick={() => onDuplicate(proposal.id)} title="Duplicate" aria-label="Duplicate proposal">
              <Copy size={15} />
            </Button>
            <Button variant="ghost" iconOnly size="sm" onClick={() => onDelete(proposal.id)} title="Delete" aria-label="Delete proposal">
              <Trash2 size={15} className="text-danger" />
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accentink hover:underline"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? 'Hide preview' : 'Preview'}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-line p-5 bg-app/50">
          <div className="clay-sunken p-5 max-h-[26rem] overflow-y-auto">
            <MarkdownPreview content={proposal.content || ''} />
          </div>
          <div className="flex gap-2.5 mt-4">
            <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <CheckCircle size={13} className="text-[var(--c-success)]" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPrinting(true)} className="gap-1.5">
              <Printer size={13} /> Print / PDF
            </Button>
          </div>
        </div>
      )}

      {printing && (
        <PrintPortal>
          <div className="bg-white text-[#111827] p-2">
            <p className="text-2xl font-bold mb-1">{proposal.title || proposal.projectTitle || 'Proposal'}</p>
            {proposal.clientName && <p className="text-sm text-[#4b5563] mb-6">Prepared for {proposal.clientName}</p>}
            <MarkdownPreview content={proposal.content || ''} />
          </div>
        </PrintPortal>
      )}
    </ClayCard>
  );
}

function ProposalForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial?.formData || EMPTY_FORM);
  const [content, setContent] = useState(initial?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMode, setAiMode] = useState(true);
  const [generated, setGenerated] = useState(!!initial?.content);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleGenerate = async () => {
    if (!form.projectTitle || !form.projectDescription) {
      setError('Project title and description are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      let result;
      if (aiMode) {
        const status = await checkOllamaAvailability();
        if (!status.available) {
          setAiMode(false);
          result = fallbackTemplates.proposal(form);
        } else {
          result = await generateProposal(form);
        }
      } else {
        result = fallbackTemplates.proposal(form);
      }
      setContent(result);
      setGenerated(true);
    } catch (e) {
      setError(`AI error: ${e.message}. Falling back to template.`);
      setContent(fallbackTemplates.proposal(form));
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!content.trim()) { setError('Generate content before saving.'); return; }
    const saved = proposalStorage.save({
      ...(initial || {}),
      title: form.projectTitle,
      clientName: form.clientName,
      projectTitle: form.projectTitle,
      content,
      formData: form,
    });
    onSaved(saved);
    onClose();
  };

  return (
    <Modal onClose={onClose} size="xl">
      <ModalHeader icon={FileText} title={initial ? 'Edit proposal' : 'New proposal'} onClose={onClose} />

      <div className="p-5 sm:p-7 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client / company name">
            <Input
              value={form.clientName}
              onChange={e => set('clientName', e.target.value)}
              placeholder="Acme Corp"
            />
          </Field>
          <Field label="Project title" required>
            <Input
              value={form.projectTitle}
              onChange={e => set('projectTitle', e.target.value)}
              placeholder="E-commerce website redesign"
            />
          </Field>
        </div>

        <Field label="Project description" required>
          <Textarea
            value={form.projectDescription}
            onChange={e => set('projectDescription', e.target.value)}
            placeholder="Describe the project, its goals, and what the client wants to achieve…"
            rows={3}
          />
        </Field>

        <Field label="Services included" hint="Comma separated — e.g. UI design, Frontend development, SEO">
          <Input
            value={form.servicesIncluded}
            onChange={e => set('servicesIncluded', e.target.value)}
            placeholder="UI design, Frontend development, SEO optimization"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Estimated budget">
            <Input
              value={form.estimatedBudget}
              onChange={e => set('estimatedBudget', e.target.value)}
              placeholder="$5,000 – $8,000"
            />
          </Field>
          <Field label="Timeline">
            <Input
              value={form.deliveryTimeline}
              onChange={e => set('deliveryTimeline', e.target.value)}
              placeholder="6 weeks"
            />
          </Field>
          <Field label="Tone">
            <Select value={form.tone} onChange={e => set('tone', e.target.value)}>
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Additional requirements">
          <Textarea
            value={form.additionalRequirements}
            onChange={e => set('additionalRequirements', e.target.value)}
            placeholder="Any special requirements, constraints or context…"
            rows={2}
          />
        </Field>

        <div className="clay-sunken flex items-center gap-3 p-4">
          <Sparkles size={16} className={aiMode ? 'text-accent' : 'text-muted'} />
          <span className="text-xs text-muted flex-1">
            {aiMode ? 'Using Ollama AI — requires a local model running.' : 'Using the built-in template (no AI).'}
          </span>
          <Toggle checked={aiMode} onChange={setAiMode} label="Toggle AI generation" />
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-[14px]" style={{ background: 'var(--c-warning-soft)' }}>
            <AlertCircle size={15} className="text-[var(--c-warning)] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-inkbody">{error}</p>
          </div>
        )}

        <Button variant="primary" block onClick={handleGenerate} disabled={loading} className="gap-2">
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Generating with AI…</>
          ) : (
            <><Sparkles size={15} /> {generated ? 'Regenerate proposal' : 'Generate proposal'}</>
          )}
        </Button>

        {generated && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="field-label mb-0">Generated proposal</label>
              <Badge tone={aiMode ? 'accent' : 'warning'}>
                {aiMode ? <><Sparkles size={11} /> AI generated</> : 'Template · review before use'}
              </Badge>
            </div>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={16}
              className="font-mono text-xs"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 px-5 sm:px-7 py-4 border-t border-line">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave} disabled={!content.trim()} className="gap-2">
          <Save size={14} /> Save proposal
        </Button>
      </div>
    </Modal>
  );
}

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProposal, setEditProposal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => setProposals(proposalStorage.getAll());
  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    proposalStorage.delete(id);
    load();
    setDeleteId(null);
  };

  const handleDuplicate = (id) => {
    proposalStorage.duplicate(id);
    load();
  };

  const filtered = proposals.filter(p =>
    !search || (p.title + p.clientName + p.projectTitle).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 sm:p-7 max-w-5xl mx-auto">
      <PageHeader
        title="Proposals"
        subtitle={`${proposals.length} saved proposal${proposals.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="primary" onClick={() => { setEditProposal(null); setShowForm(true); }} className="gap-1.5">
            <Plus size={15} /> New proposal
          </Button>
        }
      />

      {proposals.length > 0 && (
        <div className="relative mb-5">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <Input
            className="pl-11"
            placeholder="Search proposals…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <ClayCard flat>
          <EmptyState
            icon={FileText}
            title={proposals.length === 0 ? 'No proposals yet' : 'No results found'}
            description={proposals.length === 0
              ? 'Create your first AI-powered proposal. Add the project details and let HustlePilot draft it for you.'
              : 'Try a different search term.'}
            action={proposals.length === 0 && (
              <Button variant="primary" onClick={() => setShowForm(true)} className="gap-1.5">
                <Plus size={15} /> Create first proposal
              </Button>
            )}
          />
        </ClayCard>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <ProposalCard
              key={p.id}
              proposal={p}
              onEdit={(p) => { setEditProposal(p); setShowForm(true); }}
              onDelete={setDeleteId}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProposalForm
          initial={editProposal}
          onClose={() => { setShowForm(false); setEditProposal(null); }}
          onSaved={load}
        />
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} size="sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <IconTile icon={Trash2} tone="danger" size="sm" />
              <h3 className="text-ink font-semibold">Delete proposal?</h3>
            </div>
            <p className="text-muted text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
