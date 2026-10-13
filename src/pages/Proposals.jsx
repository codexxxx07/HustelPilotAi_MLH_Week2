import { useState, useEffect, useRef } from 'react';
import {
  Plus, FileText, Trash2, Copy, Download, Edit3,
  Sparkles, AlertCircle, Loader2, ChevronDown, ChevronUp,
  X, Save, Printer
} from 'lucide-react';
import { proposalStorage } from '../services/storage';
import { generateProposal, fallbackTemplates, checkOllamaAvailability } from '../services/ai';

const TONES = ['Professional', 'Friendly', 'Formal', 'Concise', 'Enthusiastic'];
const EMPTY_FORM = {
  clientName: '', projectTitle: '', projectDescription: '',
  servicesIncluded: '', estimatedBudget: '', deliveryTimeline: '',
  tone: 'Professional', additionalRequirements: '',
};

function MarkdownPreview({ content }) {
  // Simple markdown to HTML renderer
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
    .replace(/\[REQUIRED: (.+?)\]/g, '<mark class="bg-amber-400/20 text-amber-300 px-1 rounded text-xs">[REQUIRED: $1]</mark>')
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
    .join('\n');

  return (
    <div
      className="prose-document text-sm leading-relaxed"
      style={{ color: '#e2e8f0' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ProposalCard({ proposal, onEdit, onDelete, onDuplicate }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#1e293b]/60 border border-[#334155] rounded-xl overflow-hidden hover:border-[#475569] transition-colors">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm truncate">
              {proposal.title || proposal.projectTitle || 'Untitled Proposal'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {proposal.clientName && `For ${proposal.clientName} · `}
              {new Date(proposal.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onEdit(proposal)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
              <Edit3 size={14} />
            </button>
            <button onClick={() => onDuplicate(proposal.id)} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors" title="Duplicate">
              <Copy size={14} />
            </button>
            <button onClick={() => onDelete(proposal.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Hide' : 'Preview'}
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[#334155] p-4 bg-[#0f172a]/40">
          <MarkdownPreview content={proposal.content || ''} />
          <div className="flex gap-2 mt-4 pt-4 border-t border-[#334155]">
            <button
              onClick={() => {
                navigator.clipboard.writeText(proposal.content || '');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 bg-[#1e293b] hover:bg-[#334155] rounded-lg transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 bg-[#1e293b] hover:bg-[#334155] rounded-lg transition-colors"
            >
              <Printer size={12} /> Print/PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProposalForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial?.formData || EMPTY_FORM);
  const [content, setContent] = useState(initial?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiMode, setAiMode] = useState(true);
  const [generated, setGenerated] = useState(!!initial?.content);
  const textareaRef = useRef(null);

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto p-4">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-[#334155] rounded-2xl my-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-blue-400" />
            <h2 className="text-base font-semibold text-white">
              {initial ? 'Edit Proposal' : 'New Proposal'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'clientName', label: 'Client / Company Name', placeholder: 'Acme Corp' },
              { key: 'projectTitle', label: 'Project Title *', placeholder: 'E-commerce Website Redesign' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Description *</label>
            <textarea
              value={form.projectDescription}
              onChange={e => set('projectDescription', e.target.value)}
              placeholder="Describe the project, its goals, and what the client wants to achieve..."
              rows={3}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Services Included</label>
            <input
              type="text"
              value={form.servicesIncluded}
              onChange={e => set('servicesIncluded', e.target.value)}
              placeholder="UI Design, Frontend Development, SEO Optimization"
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Estimated Budget</label>
              <input
                type="text"
                value={form.estimatedBudget}
                onChange={e => set('estimatedBudget', e.target.value)}
                placeholder="$5,000 – $8,000"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Timeline</label>
              <input
                type="text"
                value={form.deliveryTimeline}
                onChange={e => set('deliveryTimeline', e.target.value)}
                placeholder="6 weeks"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tone</label>
              <select
                value={form.tone}
                onChange={e => set('tone', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
              >
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Additional Requirements</label>
            <textarea
              value={form.additionalRequirements}
              onChange={e => set('additionalRequirements', e.target.value)}
              placeholder="Any special requirements, constraints, or context..."
              rows={2}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>

          {/* AI Toggle */}
          <div className="flex items-center gap-3 p-3 bg-[#1e293b]/60 rounded-lg border border-[#334155]">
            <Sparkles size={15} className={aiMode ? 'text-blue-400' : 'text-slate-600'} />
            <span className="text-xs text-slate-400 flex-1">
              {aiMode ? 'Using Ollama AI (requires local model)' : 'Using fallback template (no AI)'}
            </span>
            <button
              onClick={() => setAiMode(!aiMode)}
              className={`relative w-10 h-5 rounded-full transition-colors ${aiMode ? 'bg-blue-600' : 'bg-[#334155]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Generating with AI...</>
            ) : (
              <><Sparkles size={15} /> {generated ? 'Regenerate Proposal' : 'Generate Proposal'}</>
            )}
          </button>

          {/* Editable content */}
          {generated && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-400">Generated Proposal (editable)</label>
                <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                  {aiMode ? '✦ AI Generated' : '⚠ Template — Review before use'}
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={16}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#1e293b]">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Save size={14} /> Save Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Proposals</h1>
          <p className="text-slate-400 text-sm">{proposals.length} saved proposal{proposals.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditProposal(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={15} /> New Proposal
        </button>
      </div>

      {proposals.length > 0 && (
        <input
          type="text"
          placeholder="Search proposals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
        />
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center mx-auto mb-5">
            <FileText size={24} className="text-slate-600" />
          </div>
          <h2 className="text-white font-semibold mb-2">
            {proposals.length === 0 ? 'No proposals yet' : 'No results found'}
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            {proposals.length === 0
              ? 'Create your first AI-powered proposal. Fill in the project details and let HustlePilot AI draft it for you.'
              : 'Try a different search term.'}
          </p>
          {proposals.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors mx-auto"
            >
              <Plus size={15} /> Create First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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

      {/* Form Modal */}
      {showForm && (
        <ProposalForm
          initial={editProposal}
          onClose={() => { setShowForm(false); setEditProposal(null); }}
          onSaved={load}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-white font-semibold mb-2">Delete Proposal?</h3>
            <p className="text-slate-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
