import { useState, useEffect } from 'react';
import {
  MessageSquare, Sparkles, Loader2, AlertCircle,
  Copy, Save, Trash2, X, Plus, RefreshCw, CheckCircle
} from 'lucide-react';
import { communicationStorage } from '../services/storage';
import { generateCommunication, fallbackTemplates, checkOllamaAvailability } from '../services/ai';

const PURPOSES = [
  'Project inquiry response',
  'Proposal submission message',
  'Project update email',
  'Payment reminder',
  'Deadline extension request',
  'Scope change discussion',
  'Revision feedback response',
  'Project completion message',
];

const TONES = ['Professional', 'Friendly', 'Formal', 'Direct', 'Empathetic'];
const RELATIONSHIPS = ['New potential client', 'Existing client', 'Long-term client', 'Internal team'];

const EMPTY_FORM = {
  purpose: PURPOSES[0],
  context: '',
  tone: 'Professional',
  relationship: 'Existing client',
  originalMessage: '',
};

function CommCard({ comm, onDelete }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(comm.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-[#1e293b]/60 border border-[#334155] rounded-xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 border-b border-[#1e293b]">
        <div>
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {comm.purpose}
          </span>
          <p className="text-xs text-slate-500 mt-1.5">{new Date(comm.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleCopy} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors" title="Copy">
            {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
          <button onClick={() => onDelete(comm.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{comm.content}</p>
      </div>
    </div>
  );
}

export default function Communications() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);
  const [aiMode, setAiMode] = useState(true);
  const [saved, setSaved] = useState([]);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('compose');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const load = () => setSaved(communicationStorage.getAll());
  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!form.context.trim()) { setError('Please provide context for the message.'); return; }
    setError('');
    setLoading(true);
    try {
      let result;
      if (aiMode) {
        const status = await checkOllamaAvailability();
        if (!status.available) {
          result = fallbackTemplates.communication(form);
          setAiMode(false);
        } else {
          result = await generateCommunication(form);
        }
      } else {
        result = fallbackTemplates.communication(form);
      }
      setContent(result);
      setGenerated(true);
    } catch (e) {
      setError(`AI error: ${e.message}. Using template.`);
      setContent(fallbackTemplates.communication(form));
      setGenerated(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!content.trim()) return;
    communicationStorage.save({ purpose: form.purpose, context: form.context, content, aiMode });
    load();
    setTab('saved');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setContent('');
    setGenerated(false);
    setError('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Client Communications</h1>
          <p className="text-slate-400 text-sm">Draft professional messages for any client situation.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('compose')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'compose' ? 'bg-[#1e293b] text-white border border-[#334155]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Compose
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'saved' ? 'bg-[#1e293b] text-white border border-[#334155]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Saved ({saved.length})
          </button>
        </div>
      </div>

      {tab === 'saved' ? (
        <div className="space-y-3">
          {saved.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No saved drafts yet. Generate a message in the Compose tab.</p>
            </div>
          ) : saved.map(c => (
            <CommCard
              key={c.id}
              comm={c}
              onDelete={(id) => { communicationStorage.delete(id); load(); }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Message Purpose</label>
                <select
                  value={form.purpose}
                  onChange={e => set('purpose', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                >
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Context *</label>
                <textarea
                  value={form.context}
                  onChange={e => set('context', e.target.value)}
                  placeholder="Briefly describe the situation: project name, what happened, what you need..."
                  rows={4}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tone</label>
                  <select
                    value={form.tone}
                    onChange={e => set('tone', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Relationship</label>
                  <select
                    value={form.relationship}
                    onChange={e => set('relationship', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Original Message (optional)</label>
                <textarea
                  value={form.originalMessage}
                  onChange={e => set('originalMessage', e.target.value)}
                  placeholder="Paste the message you're responding to..."
                  rows={3}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              {/* AI Toggle */}
              <div className="flex items-center gap-3 p-3 bg-[#1e293b]/60 rounded-lg border border-[#334155]">
                <Sparkles size={15} className={aiMode ? 'text-amber-400' : 'text-slate-600'} />
                <span className="text-xs text-slate-400 flex-1">
                  {aiMode ? 'Using Ollama AI' : 'Using template fallback'}
                </span>
                <button
                  onClick={() => setAiMode(!aiMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${aiMode ? 'bg-amber-600' : 'bg-[#334155]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${aiMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle size={14} className="text-amber-400 mt-0.5" />
                  <p className="text-xs text-amber-300">{error}</p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Drafting...</>
                ) : (
                  <><Sparkles size={15} /> {generated ? 'Regenerate' : 'Draft Message'}</>
                )}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-3 space-y-4">
            {generated ? (
              <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#334155]">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-amber-400" />
                    <span className="text-sm font-semibold text-white">Drafted Message</span>
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      {aiMode ? '✦ AI' : '⚠ Template'}
                    </span>
                  </div>
                  <button onClick={handleReset} className="p-1.5 text-slate-500 hover:text-slate-300">
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="p-5">
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={14}
                    className="w-full bg-[#0f172a]/60 border border-[#334155] rounded-lg px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 resize-none leading-relaxed"
                  />
                  <p className="text-xs text-slate-600 mt-2">
                    ⚠ Review and edit before sending. Messages are never sent automatically.
                  </p>
                </div>
                <div className="flex justify-between items-center px-5 pb-4">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 border border-[#334155] hover:border-[#475569] rounded-xl transition-colors"
                  >
                    {copied ? <><CheckCircle size={14} className="text-green-400" /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    <Save size={14} /> Save Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1e293b]/20 border border-[#334155] border-dashed rounded-xl p-12 text-center">
                <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Fill in the details on the left and click "Draft Message" to generate a professional email or message.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
