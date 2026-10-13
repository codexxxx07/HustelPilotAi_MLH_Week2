import { useState, useEffect } from 'react';
import {
  Calculator, Sparkles, AlertCircle, Loader2,
  Save, Info, ChevronDown, ChevronUp, Trash2, FolderOpen
} from 'lucide-react';
import { estimateStorage } from '../services/storage';
import { analyzeProjectForEstimate, checkOllamaAvailability } from '../services/ai';
import {
  Button, ClayCard, IconTile, Field, Input, Textarea, Select,
  EmptyState, PageHeader, Segmented
} from '../components/ui';

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
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

function calcEstimate(form) {
  const hours = parseFloat(form.estimatedHours) || 0;
  const rate = parseFloat(form.hourlyRate) || 0;
  const fixed = parseFloat(form.fixedPrice) || 0;
  const extras = parseFloat(form.additionalExpenses) || 0;

  const labor = form.pricingPreference === 'hourly' ? hours * rate : fixed;

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
  const rows = [];
  if (form.pricingPreference === 'hourly') rows.push([`${calc.hours}h × ${fmt(parseFloat(form.hourlyRate) || 0)}/hr`, fmt(calc.labor)]);
  else rows.push(['Fixed project fee', fmt(calc.labor)]);
  if (calc.additionalExpenses > 0) rows.push(['Additional expenses', fmt(calc.additionalExpenses)]);
  rows.push([`Contingency (${calc.contingencyRate.toFixed(0)}% · ${form.complexity})`, fmt(calc.contingency)]);

  return (
    <div className="space-y-4">
      <ClayCard flat className="overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center gap-3">
          <IconTile icon={Calculator} tone="lav" size="sm" />
          <h3 className="text-sm font-semibold text-ink">Estimate breakdown</h3>
        </div>
        <div className="p-5 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 text-sm">
              <span className="text-muted">{label}</span>
              <span className="text-ink font-medium whitespace-nowrap">{value}</span>
            </div>
          ))}
          <div className="h-px bg-line" />
          <div className="flex items-center justify-between">
            <span className="text-ink font-semibold">Estimated total</span>
            <span className="text-2xl font-bold text-ink">{fmt(calc.total)}</span>
          </div>
        </div>
        <div className="px-5 py-3.5 border-t border-line" style={{ background: 'var(--c-warning-soft)' }}>
          <p className="text-xs text-inkbody/90 flex items-start gap-2">
            <Info size={13} className="text-[var(--c-warning)] mt-0.5 flex-shrink-0" />
            A suggested estimate, not a guaranteed market price. Adjust for your actual situation before quoting.
          </p>
        </div>
      </ClayCard>

      {aiInsights && (
        <ClayCard flat className="overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 border-b border-line"
            onClick={() => setShowInsights(s => !s)}
          >
            <div className="flex items-center gap-3">
              <IconTile icon={Sparkles} tone="accent" size="sm" />
              <span className="text-sm font-semibold text-ink">AI project analysis</span>
            </div>
            {showInsights ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
          </button>
          {showInsights && (
            <div className="p-5">
              <div className="clay-sunken p-4 text-xs text-inkbody leading-relaxed whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {aiInsights}
              </div>
            </div>
          )}
        </ClayCard>
      )}
    </div>
  );
}

function SavedEstimateCard({ estimate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <ClayCard flat className="overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        <IconTile icon={Calculator} tone="lav" size="sm" className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">{estimate.projectDescription?.slice(0, 60) || 'Untitled estimate'}</p>
          <p className="text-xs text-muted mt-0.5">{estimate.projectCategory} · {new Date(estimate.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="text-right flex-shrink-0 hidden sm:block">
          <p className="text-base font-bold text-ink">{formatCurrency(estimate.calc?.total, estimate.currency || 'USD')}</p>
          <p className="text-xs text-muted">{estimate.complexity}</p>
        </div>
        <Button variant="ghost" iconOnly size="sm" onClick={() => setExpanded(!expanded)} aria-label="Toggle details">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
        <Button variant="ghost" iconOnly size="sm" onClick={() => onDelete(estimate.id)} aria-label="Delete estimate">
          <Trash2 size={15} className="text-danger" />
        </Button>
      </div>
      {expanded && estimate.calc && (
        <div className="border-t border-line p-5 space-y-2">
          {[
            ['Labor', formatCurrency(estimate.calc.labor, estimate.currency)],
            ['Expenses', formatCurrency(estimate.calc.additionalExpenses, estimate.currency)],
            ['Contingency', formatCurrency(estimate.calc.contingency, estimate.currency)],
            ['Total', formatCurrency(estimate.calc.total, estimate.currency)],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted">{label}</span>
              <span className="text-ink font-medium">{value}</span>
            </div>
          ))}
        </div>
      )}
    </ClayCard>
  );
}

export default function Estimator() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [calc, setCalc] = useState(null);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState([]);
  const [tab, setTab] = useState('estimator');

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
        setAiInsights('AI is currently unavailable. Start Ollama to get project analysis. The estimate below is still calculated with full accuracy.');
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
    if (!calc) { setError('Calculate the estimate first.'); return; }
    estimateStorage.save({ ...form, calc });
    loadSaved();
    setError('');
  };

  return (
    <div className="p-5 sm:p-7 max-w-5xl mx-auto">
      <PageHeader
        title="Project estimator"
        subtitle="Transparent arithmetic for your project. AI identifies risks and assumptions."
        actions={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'estimator', label: 'Estimator', icon: Calculator },
              { value: 'saved', label: `Saved (${saved.length})`, icon: FolderOpen },
            ]}
          />
        }
      />

      {tab === 'saved' ? (
        <div className="space-y-4">
          {saved.length === 0 ? (
            <ClayCard flat>
              <EmptyState
                icon={Calculator}
                title="No saved estimates yet"
                description="Calculate a project cost and save it to keep a record you can revisit."
                action={<Button variant="secondary" onClick={() => setTab('estimator')}>Go to estimator</Button>}
              />
            </ClayCard>
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
          <div className="lg:col-span-3">
            <ClayCard flat className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Project category">
                  <Select value={form.projectCategory} onChange={e => set('projectCategory', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
                <Field label="Complexity">
                  <Select value={form.complexity} onChange={e => set('complexity', e.target.value)}>
                    {COMPLEXITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Project description" required>
                <Textarea
                  value={form.projectDescription}
                  onChange={e => set('projectDescription', e.target.value)}
                  placeholder="Describe the scope, deliverables and any technical requirements…"
                  rows={4}
                />
              </Field>

              <Field label="Experience level">
                <Select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)}>
                  {['Junior (0-2 years)', 'Mid-level (3-5 years)', 'Senior (6-10 years)', 'Expert (10+ years)'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </Field>

              <div>
                <span className="field-label">Pricing preference</span>
                <Segmented
                  className="w-full"
                  value={form.pricingPreference}
                  onChange={v => set('pricingPreference', v)}
                  options={[
                    { value: 'hourly', label: 'Hourly rate' },
                    { value: 'fixed', label: 'Fixed price' },
                  ]}
                />
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {form.pricingPreference === 'hourly' ? (
                    <>
                      <Field label="Hourly rate">
                        <Input type="number" min="0" value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} placeholder="75" />
                      </Field>
                      <Field label="Estimated hours">
                        <Input type="number" min="0" value={form.estimatedHours} onChange={e => set('estimatedHours', e.target.value)} placeholder="40" />
                      </Field>
                    </>
                  ) : (
                    <Field label="Fixed price" className="col-span-2">
                      <Input type="number" min="0" value={form.fixedPrice} onChange={e => set('fixedPrice', e.target.value)} placeholder="5000" />
                    </Field>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Additional expenses">
                  <Input type="number" min="0" value={form.additionalExpenses} onChange={e => set('additionalExpenses', e.target.value)} placeholder="0" />
                </Field>
                <Field label="Currency">
                  <Select value={form.currency} onChange={e => set('currency', e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </Field>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-[14px]" style={{ background: 'var(--c-warning-soft)' }}>
                  <AlertCircle size={15} className="text-[var(--c-warning)] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-inkbody">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" onClick={handleCalculate} className="flex-1 gap-2">
                  <Calculator size={15} /> Calculate
                </Button>
                <Button variant="primary" onClick={handleAnalyze} disabled={loading} className="flex-1 gap-2">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {loading ? 'Analyzing…' : 'Calculate + AI analysis'}
                </Button>
              </div>
            </ClayCard>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {calc ? (
              <>
                <EstimateResult calc={calc} form={form} aiInsights={aiInsights} />
                <Button variant="secondary" block onClick={handleSave} className="gap-2">
                  <Save size={15} /> Save estimate
                </Button>
              </>
            ) : (
              <ClayCard flat className="border-dashed">
                <EmptyState
                  icon={Calculator}
                  title="No estimate yet"
                  description="Fill in the form and hit calculate to see a transparent cost breakdown."
                />
              </ClayCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
