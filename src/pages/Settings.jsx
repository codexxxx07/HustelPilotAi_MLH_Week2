import { useState } from 'react';
import {
  Settings as SettingsIcon, Cpu, Save, CheckCircle, AlertCircle,
  Loader2, Trash2, Download, Upload, RefreshCw, Palette, Sun, Moon, Database
} from 'lucide-react';
import { settingsStorage, backupStorage } from '../services/storage';
import { checkOllamaAvailability } from '../services/ai';
import { useTheme } from '../context/ThemeContext';
import {
  Button, ClayCard, Field, Input, Select, Badge,
  PageHeader, Toggle, SectionCard
} from '../components/ui';

const MODELS = ['llama3.2', 'llama3.1', 'mistral', 'phi3', 'gemma2', 'qwen2.5', 'codellama', 'deepseek-r1'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

export default function Settings() {
  const [settings, setSettings] = useState(settingsStorage.get());
  const [saved, setSaved] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [importError, setImportError] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const { isDark, setTheme } = useTheme();

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }));

  const handleSave = () => {
    settingsStorage.save(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCheckAI = async () => {
    setChecking(true);
    setAiStatus(null);
    const result = await checkOllamaAvailability();
    setAiStatus(result);
    setChecking(false);
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
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        backupStorage.importAll(data);
        setImportError('');
        alert('Data imported successfully. Refresh the page to see updates.');
      } catch (err) {
        setImportError(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    backupStorage.clearAll();
    setClearConfirm(false);
    alert('All data cleared. The page will reload.');
    window.location.reload();
  };

  return (
    <div className="p-5 sm:p-7 max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="Configure your AI, appearance and data." />

      <div className="space-y-6">
        {/* Appearance */}
        <SectionCard icon={Palette} tone="lav" title="Appearance" description="Light is the default for new visitors.">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted max-w-sm">
              Choose a theme. Your preference is saved to this browser and applied on every visit.
            </p>
            <div className="clay-segment flex-shrink-0">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
              ].map(({ value, label, icon: Icon }) => {
                const active = (isDark ? 'dark' : 'light') === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTheme(value)}
                    aria-pressed={active}
                    className={`clay-segment-btn ${active ? 'clay-segment-btn-active' : ''}`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                );
              })}
            </div>
          </div>
        </SectionCard>

        {/* Business Profile */}
        <SectionCard icon={SettingsIcon} title="Business profile" description="Used to prefill your documents.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Business / freelancer name">
              <Input value={settings.businessName || ''} onChange={e => set('businessName', e.target.value)} placeholder="Your name or company" />
            </Field>
            <Field label="Email address">
              <Input type="email" value={settings.businessEmail || ''} onChange={e => set('businessEmail', e.target.value)} placeholder="you@example.com" />
            </Field>
            <Field label="Default currency">
              <Select value={settings.currency || 'USD'} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
          </div>
        </SectionCard>

        {/* AI Configuration */}
        <SectionCard icon={Cpu} tone="accent" title="AI configuration" description="Connect a local Ollama server.">
          <div className="space-y-5">
            <div className="clay-sunken flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-ink">Enable AI features</p>
                <p className="text-xs text-muted mt-0.5">Everything still works without AI — basic workflows stay functional.</p>
              </div>
              <Toggle checked={!!settings.aiEnabled} onChange={v => set('aiEnabled', v)} label="Enable AI features" />
            </div>

            <Field label="Ollama server URL" hint="Default: http://localhost:11434 — change only for a custom port.">
              <Input className="font-mono" value={settings.ollamaUrl || 'http://localhost:11434'} onChange={e => set('ollamaUrl', e.target.value)} placeholder="http://localhost:11434" />
            </Field>

            <div>
              <span className="field-label">Model</span>
              <div className="flex gap-3">
                <Select className="flex-1" value={settings.ollamaModel || 'llama3.2'} onChange={e => set('ollamaModel', e.target.value)}>
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
                <Button variant="secondary" onClick={handleCheckAI} disabled={checking} className="gap-2 flex-shrink-0">
                  {checking ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                  Test
                </Button>
              </div>
            </div>

            {aiStatus && (
              <div className="flex items-start gap-3 p-4 rounded-[14px]" style={{ background: aiStatus.available ? 'var(--c-success-soft)' : 'var(--c-danger-soft)' }}>
                {aiStatus.available
                  ? <CheckCircle size={16} className="text-[var(--c-success)] mt-0.5 flex-shrink-0" />
                  : <AlertCircle size={16} className="text-[var(--c-danger)] mt-0.5 flex-shrink-0" />}
                <div>
                  {aiStatus.available ? (
                    <>
                      <p className="text-xs font-semibold text-ink">Ollama is running</p>
                      {aiStatus.models?.length > 0 && (
                        <p className="text-xs text-muted mt-1">
                          Available models: {aiStatus.models.slice(0, 5).join(', ')}{aiStatus.models.length > 5 ? ' +more' : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-ink">Ollama not reachable</p>
                      <p className="text-xs text-muted mt-1">{aiStatus.error}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="clay-panel p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Set up Ollama</p>
              <div className="space-y-2.5 text-xs text-muted">
                <div className="flex gap-2.5"><Badge tone="neutral" className="w-5 h-5 justify-center p-0 flex-shrink-0">1</Badge> Download Ollama from <code className="text-accentink">ollama.com</code></div>
                <div className="flex gap-2.5"><Badge tone="neutral" className="w-5 h-5 justify-center p-0 flex-shrink-0">2</Badge> Run <code className="clay-sunken px-1.5 py-0.5 text-inkbody">ollama pull llama3.2</code> in your terminal</div>
                <div className="flex gap-2.5"><Badge tone="neutral" className="w-5 h-5 justify-center p-0 flex-shrink-0">3</Badge> Ollama listens on <code className="clay-sunken px-1.5 py-0.5 text-inkbody">localhost:11434</code> by default</div>
                <div className="flex gap-2.5"><Badge tone="neutral" className="w-5 h-5 justify-center p-0 flex-shrink-0">4</Badge> Hit “Test” above to verify the connection</div>
              </div>
              <p className="text-xs text-muted mt-3 leading-relaxed">
                Budget hardware: <code className="text-inkbody">llama3.2</code> (2GB) or <code className="text-inkbody">phi3</code> (2.3GB). Best quality: <code className="text-inkbody">llama3.1:8b</code> (needs ≥8GB RAM).
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Data Management */}
        <SectionCard icon={Database} title="Data management" description="Everything lives in this browser.">
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-[14px]" style={{ background: 'var(--c-warning-soft)' }}>
              <AlertCircle size={15} className="text-[var(--c-warning)] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-inkbody/90 leading-relaxed">
                Data is stored in <strong>localStorage</strong> — unencrypted, not backed up automatically, and lost if you clear browser data or switch devices.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="secondary" onClick={handleExport} className="flex-1 gap-2">
                <Download size={15} /> Export backup (JSON)
              </Button>
              <Button as="label" variant="secondary" className="flex-1 gap-2 cursor-pointer">
                <Upload size={15} /> Import backup
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </Button>
            </div>

            {importError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-[14px]" style={{ background: 'var(--c-danger-soft)' }}>
                <AlertCircle size={15} className="text-[var(--c-danger)] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-inkbody">{importError}</p>
              </div>
            )}

            <div className="border-t border-line pt-5">
              <h3 className="text-xs font-semibold text-[var(--c-danger)] mb-3 uppercase tracking-wider">Danger zone</h3>
              {!clearConfirm ? (
                <Button variant="danger" onClick={() => setClearConfirm(true)} className="gap-2">
                  <Trash2 size={15} /> Delete all local data
                </Button>
              ) : (
                <div className="p-5 rounded-[20px] space-y-3" style={{ background: 'var(--c-danger-soft)' }}>
                  <p className="text-sm text-ink font-semibold">Are you sure? This cannot be undone.</p>
                  <p className="text-xs text-muted">All proposals, invoices, communications and estimates will be permanently deleted.</p>
                  <div className="flex gap-3 pt-1">
                    <Button variant="ghost" onClick={() => setClearConfirm(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleClearAll}>Yes, delete everything</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end sticky bottom-4">
          <ClayCard className="p-2">
            <Button variant="primary" onClick={handleSave} className="gap-2">
              {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save settings</>}
            </Button>
          </ClayCard>
        </div>
      </div>
    </div>
  );
}
