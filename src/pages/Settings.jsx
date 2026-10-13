import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Cpu, Globe, Key, Save,
  CheckCircle, AlertCircle, Loader2, Trash2, Download,
  Upload, AlertTriangle, RefreshCw
} from 'lucide-react';
import { settingsStorage, backupStorage } from '../services/storage';
import { checkOllamaAvailability } from '../services/ai';

const MODELS = ['llama3.2', 'llama3.1', 'mistral', 'phi3', 'gemma2', 'qwen2.5', 'codellama', 'deepseek-r1'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

export default function Settings() {
  const [settings, setSettings] = useState(settingsStorage.get());
  const [saved, setSaved] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [importError, setImportError] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);

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
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400 text-sm">Configure your AI, preferences, and data management.</p>
      </div>

      <div className="space-y-6">
        {/* Business Profile */}
        <section className="bg-[#1e293b]/40 border border-[#334155] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155] flex items-center gap-2">
            <SettingsIcon size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Business Profile</h2>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Business / Freelancer Name</label>
              <input
                type="text"
                value={settings.businessName || ''}
                onChange={e => set('businessName', e.target.value)}
                placeholder="Your name or company"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={settings.businessEmail || ''}
                onChange={e => set('businessEmail', e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Default Currency</label>
              <select
                value={settings.currency || 'USD'}
                onChange={e => set('currency', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* AI Configuration */}
        <section className="bg-[#1e293b]/40 border border-[#334155] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155] flex items-center gap-2">
            <Cpu size={16} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-white">AI Configuration</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* AI Enable Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#0f172a]/40 rounded-lg border border-[#334155]">
              <div>
                <p className="text-sm font-medium text-white">Enable AI Features</p>
                <p className="text-xs text-slate-500 mt-0.5">All features work without AI; basic workflows remain functional when disabled.</p>
              </div>
              <button
                onClick={() => set('aiEnabled', !settings.aiEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings.aiEnabled ? 'bg-blue-600' : 'bg-[#334155]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Ollama Server URL</label>
              <input
                type="text"
                value={settings.ollamaUrl || 'http://localhost:11434'}
                onChange={e => set('ollamaUrl', e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-xs text-slate-600 mt-1">Default: http://localhost:11434 · Change only if Ollama runs on a custom port.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
              <div className="flex gap-2">
                <select
                  value={settings.ollamaModel || 'llama3.2'}
                  onChange={e => set('ollamaModel', e.target.value)}
                  className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <button
                  onClick={handleCheckAI}
                  disabled={checking}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1e293b] border border-[#334155] hover:border-[#475569] text-sm text-slate-300 rounded-lg transition-colors"
                >
                  {checking ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Test
                </button>
              </div>
            </div>

            {/* Status */}
            {aiStatus && (
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                aiStatus.available
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                {aiStatus.available
                  ? <CheckCircle size={15} className="text-green-400 mt-0.5 flex-shrink-0" />
                  : <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
                }
                <div>
                  {aiStatus.available ? (
                    <>
                      <p className="text-xs font-medium text-green-300">Ollama is running</p>
                      {aiStatus.models?.length > 0 && (
                        <p className="text-xs text-green-400/70 mt-0.5">
                          Available models: {aiStatus.models.slice(0, 5).join(', ')}
                          {aiStatus.models.length > 5 ? ' +more' : ''}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-medium text-red-300">Ollama not reachable</p>
                      <p className="text-xs text-red-400/70 mt-0.5">{aiStatus.error}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Setup guide */}
            <div className="p-4 bg-[#0f172a]/40 rounded-lg border border-[#334155]">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Setup Ollama</p>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex gap-2"><span className="text-slate-400 font-mono">1.</span> Download Ollama from <code className="text-blue-400">ollama.com</code></div>
                <div className="flex gap-2"><span className="text-slate-400 font-mono">2.</span> Run <code className="bg-[#1e293b] px-1.5 py-0.5 rounded text-slate-300">ollama pull llama3.2</code> in your terminal</div>
                <div className="flex gap-2"><span className="text-slate-400 font-mono">3.</span> Ollama runs at <code className="bg-[#1e293b] px-1.5 py-0.5 rounded text-slate-300">localhost:11434</code> by default</div>
                <div className="flex gap-2"><span className="text-slate-400 font-mono">4.</span> Click "Test" above to verify the connection</div>
              </div>
              <p className="text-xs text-slate-600 mt-3">
                Recommended for budget hardware: <code className="text-slate-400">llama3.2</code> (2GB) or <code className="text-slate-400">phi3</code> (2.3GB).
                For best quality: <code className="text-slate-400">llama3.1:8b</code> (requires ≥8GB RAM).
              </p>
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-[#1e293b]/40 border border-[#334155] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#334155] flex items-center gap-2">
            <Download size={16} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Data Management</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
              <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-400/80 leading-relaxed">
                All data is stored in your browser's <strong>localStorage</strong>. It is not encrypted, not backed up automatically, and will be lost if you clear browser data or use a different device.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e293b] border border-[#334155] hover:border-[#475569] text-slate-200 text-sm font-medium rounded-xl transition-colors"
              >
                <Download size={14} /> Export Backup (JSON)
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e293b] border border-[#334155] hover:border-[#475569] text-slate-200 text-sm font-medium rounded-xl transition-colors cursor-pointer">
                <Upload size={14} /> Import Backup
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            {importError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle size={14} className="text-red-400 mt-0.5" />
                <p className="text-xs text-red-300">{importError}</p>
              </div>
            )}

            <div className="border-t border-[#334155] pt-4">
              <h3 className="text-xs font-semibold text-red-400 mb-2">Danger Zone</h3>
              {!clearConfirm ? (
                <button
                  onClick={() => setClearConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <Trash2 size={14} /> Delete All Local Data
                </button>
              ) : (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                  <p className="text-sm text-red-300 font-medium">Are you sure? This cannot be undone.</p>
                  <p className="text-xs text-red-400/70">All proposals, invoices, communications, and estimates will be permanently deleted.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setClearConfirm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button onClick={handleClearAll} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">
                      Yes, Delete Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
