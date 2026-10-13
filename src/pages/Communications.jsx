import { useState, useEffect } from 'react';
import {
  MessageSquare, Sparkles, Loader2, AlertCircle,
  Copy, Save, Trash2, RefreshCw, CheckCircle, PenLine, Inbox
} from 'lucide-react';
import { communicationStorage } from '../services/storage';
import { generateCommunication, fallbackTemplates, checkOllamaAvailability } from '../services/ai';
import {
  Button, ClayCard, IconTile, Field, Textarea, Select,
  Badge, EmptyState, PageHeader, Segmented, Toggle
} from '../components/ui';

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
    <ClayCard flat className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-5 border-b border-line">
        <div className="flex items-start gap-3.5 min-w-0">
          <IconTile icon={MessageSquare} tone="peach" size="sm" className="flex-shrink-0" />
          <div className="min-w-0">
            <Badge tone="peach">{comm.purpose}</Badge>
            <p className="text-xs text-muted mt-2">{new Date(comm.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" iconOnly size="sm" onClick={handleCopy} title="Copy" aria-label="Copy message">
            {copied ? <CheckCircle size={15} className="text-[var(--c-success)]" /> : <Copy size={15} />}
          </Button>
          <Button variant="ghost" iconOnly size="sm" onClick={() => onDelete(comm.id)} title="Delete" aria-label="Delete draft">
            <Trash2 size={15} className="text-danger" />
          </Button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-inkbody leading-relaxed whitespace-pre-wrap">{comm.content}</p>
      </div>
    </ClayCard>
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
    <div className="p-5 sm:p-7 max-w-5xl mx-auto">
      <PageHeader
        title="Client communications"
        subtitle="Draft professional messages for any client situation in your voice."
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'compose', label: 'Compose', icon: PenLine },
              { value: 'saved', label: `Saved (${saved.length})`, icon: Inbox },
            ]}
          />
        }
      />

      {tab === 'saved' ? (
        <div className="space-y-4">
          {saved.length === 0 ? (
            <ClayCard flat>
              <EmptyState
                icon={MessageSquare}
                title="No saved drafts yet"
                description="Generate a message in the Compose tab and save it to keep it handy."
                action={<Button variant="secondary" onClick={() => setTab('compose')}>Go to compose</Button>}
              />
            </ClayCard>
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
          <div className="lg:col-span-2">
            <ClayCard flat className="p-5 space-y-4">
              <Field label="Message purpose">
                <Select value={form.purpose} onChange={e => set('purpose', e.target.value)}>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </Select>
              </Field>

              <Field label="Context" required>
                <Textarea
                  value={form.context}
                  onChange={e => set('context', e.target.value)}
                  placeholder="Briefly describe the situation: project name, what happened, what you need…"
                  rows={4}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tone">
                  <Select value={form.tone} onChange={e => set('tone', e.target.value)}>
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Relationship">
                  <Select value={form.relationship} onChange={e => set('relationship', e.target.value)}>
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Original message (optional)">
                <Textarea
                  value={form.originalMessage}
                  onChange={e => set('originalMessage', e.target.value)}
                  placeholder="Paste the message you're responding to…"
                  rows={3}
                />
              </Field>

              <div className="clay-sunken flex items-center gap-3 p-4">
                <Sparkles size={16} className={aiMode ? 'text-[var(--c-peach)]' : 'text-muted'} />
                <span className="text-xs text-muted flex-1">
                  {aiMode ? 'Using Ollama AI' : 'Using template fallback'}
                </span>
                <Toggle checked={aiMode} onChange={setAiMode} tone="peach" label="Toggle AI drafting" />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-[14px]" style={{ background: 'var(--c-warning-soft)' }}>
                  <AlertCircle size={15} className="text-[var(--c-warning)] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-inkbody">{error}</p>
                </div>
              )}

              <Button variant="peach" block onClick={handleGenerate} disabled={loading} className="gap-2">
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Drafting…</>
                ) : (
                  <><Sparkles size={15} /> {generated ? 'Regenerate' : 'Draft message'}</>
                )}
              </Button>
            </ClayCard>
          </div>

          <div className="lg:col-span-3">
            {generated ? (
              <ClayCard flat className="overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                  <div className="flex items-center gap-3">
                    <IconTile icon={MessageSquare} tone="peach" size="sm" />
                    <span className="text-sm font-semibold text-ink">Drafted message</span>
                    <Badge tone={aiMode ? 'accent' : 'warning'}>{aiMode ? 'AI' : 'Template'}</Badge>
                  </div>
                  <Button variant="ghost" iconOnly size="sm" onClick={handleReset} aria-label="Reset draft">
                    <RefreshCw size={15} />
                  </Button>
                </div>
                <div className="p-5">
                  <Textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={14}
                    className="leading-relaxed"
                  />
                  <p className="text-xs text-muted mt-2.5 flex items-center gap-1.5">
                    <AlertCircle size={12} /> Review and edit before sending. Messages are never sent automatically.
                  </p>
                </div>
                <div className="flex justify-between items-center px-5 py-4 border-t border-line">
                  <Button variant="secondary" onClick={handleCopy} className="gap-2">
                    {copied ? <><CheckCircle size={15} className="text-[var(--c-success)]" /> Copied!</> : <><Copy size={15} /> Copy</>}
                  </Button>
                  <Button variant="peach" onClick={handleSave} className="gap-2">
                    <Save size={15} /> Save draft
                  </Button>
                </div>
              </ClayCard>
            ) : (
              <ClayCard flat className="border-dashed h-full">
                <EmptyState
                  icon={MessageSquare}
                  title="Nothing drafted yet"
                  description="Fill in the details on the left and click “Draft message” to generate a professional email or reply."
                />
              </ClayCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
