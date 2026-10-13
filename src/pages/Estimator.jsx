import { useState, useEffect } from 'react';
import {
  Calculator, Sparkles, AlertCircle, Loader2,
  Save, RefreshCw, Info, ChevronDown, ChevronUp, Trash2
} from 'lucide-react';
import { estimateStorage } from '../services/storage';
import { analyzeProjectForEstimate, checkOllamaAvailability } from '../services/ai';

const CATEGORIES = [
  'Web Development', 'Mobile App', 'UI/UX Design', 'Graphic Design',
  'SEO / Digital Marketing', 'Content Writing', 'Video Production',
  'Backend / API', 'Data Analysis', 'Consulting', 'Other',
];

const COMPLEXITIES = ['Simple', 'Moderate', 'Complex', 'Very Complex'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

const EMPTY_FORM = {
  projectCategory: 'Web Development',
  projectDescription: '',
  estimatedHours: '',
  pricingPreference: 'hourly',
  hourlyRate: '',
  fixedPrice: '',
  experienceLevel: 'Mid-level (3-5 years)',
  complexity: 'Moderate',
  additionalExpenses: '',
  currency: 'USD',
};

function formatCurrency(amount, currency) {
  if (!amount || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function calcEstimate(form) {
  const hours = parseFloat(form.estimatedHours) || 0;
  const rate = parseFloat(form.hourlyRate) || 0;
  const fixed = parseFloat(form.fixedPrice) || 0;
  const extras = parseFloat(form.additionalExpenses) || 0;

  let labor = 0;
  if (form.pricingPreference === 'hourly') {
    labor = hours * rate;
  } else {
    labor = fixed;
  }

  const complexityMultipliers = { Simple: 0.1, Moderate: 0.15, Complex: 0.2, 'Very Complex': 0.25 };
  const contingencyRate = complexityMultipliers[form.complexity] || 0.15;
  const contingency = labor * contingencyRate;
  const total = labor + extras + contingency;

  return {
    hours,
    labor,
    additionalExpenses: extras,
    contingency,
    contingencyRate: contingencyRate * 100,
    total,
  };
}

function EstimateResult({ calc, form, aiInsights }) {
  const [showInsights, setShowInsights] = useState(true);
  const fmt = (n) => formatCurrency(n, form.currency);

  return (
    <div className="space-y-4">
      {/* Numbers */}
      <div className="bg-[#1e293b]/60 border border-[#334155] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#334155] flex items-center gap-2">
          <Calculator size={15} className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Estimate Breakdown</h3>
        </div>
        <div className="p-5 space-y-2.5">
          {form.pricingPreference === 'hourly' && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{calc.hours}h × {fmt(parseFloat(form.hourlyRate) || 0)}/hr</span>
              <span className="text-white font-medium">{fmt(calc.labor)}</span>
            </div>
          )}
          {form.pricingPreference === 'fixed' && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Fixed project fee</span>
              <span className="text-white font-medium">{fmt(calc.labor)}</span>
            </div>
          )}
          {calc.additionalExpenses > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Additional expenses</span>
              <span className="text-white font-medium">{fmt(calc.additionalExpenses)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Contingency ({calc.contingencyRate.toFixed(0)}% for {form.complexity})</span>
            <span className="text-white font-medium">{fmt(calc.contingency)}</span>
          </div>
          <div className="h-px bg-[#334155] my-2" />
          <div className="flex justify-between">
            <span className="text-slate-300 font-semibold">Estimated Total</span>
            <span className="text-white font-bold text-lg">{fmt(calc.total)}</span>
          </div>
        </div>
        <div className="px-5 py-3 bg-amber-500/5 border-t border-amber-500/10">
          <p className="text-xs text-amber-300/70">
            ⚠ This is a suggested estimate, not a guaranteed market price. Adjust based on your actual situation before quoting.
          </p>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-5 py-3 border-b border-[#334155] hover:bg-[#1e293b]/60 transition-colors"
            onClick={() => setShowInsights(!showInsights)}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">AI Project Analysis</span>
              <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">✦ AI</span>
            </div>
            {showInsights ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </button>
          {showInsights && (
            <div className="p-5">
              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-mono bg-[#0f172a]/60 rounded-lg p-4 max-h-64 overflow-y-auto">
                {aiInsights}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SavedEstimateCard({ estimate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#1e293b]/60 border border-[#334155] rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{estimate.projectDescription?.slice(0, 60) || 'Untitled Estimate'}</p>
          <p className="text-xs text-slate-500 mt-0.5">{estimate.projectCategory} · {new Date(estimate.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-white">{formatCurrency(estimate.calc?.total, estimate.currency || 'USD')}</p>
          <p className="text-xs text-slate-500">{estimate.complexity}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-500 hover:text-slate-300">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <button onClick={() => onDelete(estimate.id)} className="p-1.5 text-slate-500 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>
      {expanded && estimate.calc && (
        <div className="border-t border-[#334155] p-4 space-y-1.5">
          {[
            ['Labor', formatCurrency(estimate.calc.labor, estimate.currency)],
            ['Expenses', formatCurrency(estimate.calc.additionalExpenses, estimate.currency)],
            ['Contingency', formatCurrency(estimate.calc.contingency, estimate.currency)],
            ['Total', formatCurrency(estimate.calc.total, estimate.currency)],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between text-xs">
              <span className="text-slate-400">{l}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Estimator() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [calc, setCalc] = useState(null);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState('estimator'); // estimator | saved

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const loadSaved = () => setSaved(estimateStorage.getAll());
  useEffect(() => { loadSaved(); }, []);

  const handleCalculate = () => {
    if (!form.projectDescription) { setError('Project description is required.'); return; }
    setError('');
    setCalc(calcEstimate(form));
  };

  const handleAnalyze = async () => {
    if (!form.projectDescription) { setError('Project description is required.'); return; }
    setError('');
    setLoading(true);
    try {
      const status = await checkOllamaAvailability();
      if (!status.available) {
        setAiInsights('AI is currently unavailable. Please start Ollama to get project analysis. The estimate above is calculated without AI assistance.');
      } else {
        const result = await analyzeProjectForEstimate(form);
        setAiInsights(result);
      }
      handleCalculate();
    } catch (e) {
      setError(`AI error: ${e.message}`);
      handleCalculate();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!calc) { setError('Calculate estimate first.'); return; }
    estimateStorage.save({ ...form, calc });
    loadSaved();
    setError('');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Project Estimator</h1>
          <p className="text-slate-400 text-sm">Calculate project costs with transparent arithmetic. AI helps identify risks.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('estimator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === 'estimator' ? 'bg-[#1e293b] text-white border border-[#334155]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Estimator
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
              <Calculator size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No saved estimates yet. Create one in the Estimator tab.</p>
            </div>
          ) : saved.map(e => (
            <SavedEstimateCard
              key={e.id}
              estimate={e}
              onDelete={(id) => { estimateStorage.delete(id); loadSaved(); }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Category</label>
                  <select
                    value={form.projectCategory}
                    onChange={e => set('projectCategory', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Complexity</label>
                  <select
                    value={form.complexity}
                    onChange={e => set('complexity', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {COMPLEXITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Project Description *</label>
                <textarea
                  value={form.projectDescription}
                  onChange={e => set('projectDescription', e.target.value)}
                  placeholder="Describe the project scope, deliverables, and any technical requirements..."
                  rows={4}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={e => set('experienceLevel', e.target.value)}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  {['Junior (0-2 years)', 'Mid-level (3-5 years)', 'Senior (6-10 years)', 'Expert (10+ years)'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Pricing Preference</label>
                <div className="flex gap-2 mb-3">
                  {['hourly', 'fixed'].map(p => (
                    <button
                      key={p}
                      onClick={() => set('pricingPreference', p)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        form.pricingPreference === p
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                          : 'bg-[#1e293b] border-[#334155] text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {p === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {form.pricingPreference === 'hourly' ? (
                    <>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Hourly Rate</label>
                        <input
                          type="number"
                          value={form.hourlyRate}
                          onChange={e => set('hourlyRate', e.target.value)}
                          placeholder="75"
                          min="0"
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Estimated Hours</label>
                        <input
                          type="number"
                          value={form.estimatedHours}
                          onChange={e => set('estimatedHours', e.target.value)}
                          placeholder="40"
                          min="0"
                          className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">Fixed Price</label>
                      <input
                        type="number"
                        value={form.fixedPrice}
                        onChange={e => set('fixedPrice', e.target.value)}
                        placeholder="5000"
                        min="0"
                        className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Additional Expenses</label>
                  <input
                    type="number"
                    value={form.additionalExpenses}
                    onChange={e => set('additionalExpenses', e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Currency</label>
                  <select
                    value={form.currency}
                    onChange={e => set('currency', e.target.value)}
                    className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle size={14} className="text-amber-400 mt-0.5" />
                  <p className="text-xs text-amber-300">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCalculate}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e293b] border border-[#334155] hover:border-[#475569] text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Calculator size={15} /> Calculate
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {loading ? 'Analyzing...' : 'Calculate + AI Analysis'}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {calc ? (
              <>
                <EstimateResult calc={calc} form={form} aiInsights={aiInsights} />
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1e293b] border border-[#334155] hover:border-[#475569] text-slate-200 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Save size={14} /> Save Estimate
                </button>
              </>
            ) : (
              <div className="bg-[#1e293b]/30 border border-[#334155] border-dashed rounded-xl p-10 text-center">
                <Calculator size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Fill in the form and click Calculate to see your estimate breakdown.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
