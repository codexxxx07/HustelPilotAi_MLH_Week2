import { Link } from 'react-router-dom';
import {
  Zap, Shield, DollarSign, Cpu, Lock, RefreshCw,
  CheckCircle, AlertTriangle, Scale, ArrowRight
} from 'lucide-react';
import { Button, ClayCard, IconTile, Badge } from '../components/ui';

const benefits = [
  {
    icon: Lock,
    tone: 'accent',
    title: 'Privacy by design',
    description: 'When you run Ollama locally, your proposals, client details and financial data never leave your device. There are no calls to third-party AI providers in that workflow.',
    caveat: 'Applies to local inference only. A remote endpoint sends data to that server.',
  },
  {
    icon: DollarSign,
    tone: 'mint',
    title: 'No per-request AI charges',
    description: 'A local model removes per-generation costs from cloud providers. You pay for hardware and electricity — not for every proposal you write.',
    caveat: 'Setup, hardware, power and time are real costs. Local models need meaningful RAM (≥8GB recommended).',
  },
  {
    icon: Cpu,
    tone: 'lav',
    title: 'Swap any compatible model',
    description: 'The AI layer is model-agnostic. Move from Llama 3.2 to Mistral, Phi-3, Gemma 2 or any Ollama-compatible model without changing the app.',
    caveat: 'Models differ in capability. Not all produce equally professional business output.',
  },
  {
    icon: RefreshCw,
    tone: 'peach',
    title: 'Works without AI',
    description: 'Every core workflow — invoicing, editing, saving, exporting — works with no AI. Templates cover you when Ollama is offline.',
    caveat: 'Template output needs more editing; AI drafts usually need less manual work.',
  },
];

const tradeoffs = [
  { pro: true, text: 'No monthly AI subscription for local usage' },
  { pro: true, text: 'Client data stays on your device (local mode)' },
  { pro: true, text: 'Model can be replaced without an app redesign' },
  { pro: true, text: 'Core features work fully offline' },
  { pro: false, text: 'Requires Ollama install + a 2–8GB model download' },
  { pro: false, text: 'Output quality depends on the selected model' },
  { pro: false, text: 'Hardware limits which models run well' },
  { pro: false, text: 'Open-weight ≠ fully open-source (check each license)' },
];

const stack = [
  { tech: 'React 19', role: 'UI framework' },
  { tech: 'Vite', role: 'Build tool' },
  { tech: 'Tailwind CSS v4', role: 'Styling' },
  { tech: 'React Router v7', role: 'Routing' },
  { tech: 'Ollama', role: 'AI runtime' },
  { tech: 'Llama 3.2', role: 'Default model' },
  { tech: 'localStorage', role: 'Data storage' },
  { tech: 'MIT License', role: 'App license' },
];

export default function About() {
  return (
    <div className="p-5 sm:p-7 max-w-4xl mx-auto">
      <div className="flex items-start gap-4 mb-8">
        <span className="clay-tile w-14 h-14 text-white flex-shrink-0" style={{ backgroundImage: 'linear-gradient(165deg, var(--c-accent-hi), var(--c-accent))', borderColor: 'transparent' }}>
          <Zap size={26} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink">About HustlePilot AI</h1>
          <p className="text-muted text-sm mt-1">Less Admin. More Earning.</p>
        </div>
      </div>

      <p className="text-inkbody leading-relaxed max-w-3xl mb-8">
        HustlePilot AI is an open-source productivity tool for freelancers, independent developers, designers and small
        business owners. It uses open-weight AI models to cut the time spent on proposals, estimates, invoices and client
        communication — so you can focus on the work, not the paperwork.
      </p>

      {/* Mission */}
      <ClayCard className="p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-ink mb-4">Why we built this</h2>
        <div className="space-y-3 text-muted text-sm leading-relaxed">
          <p>
            Freelancers spend a meaningful slice of unpaid time on business admin — writing proposals from scratch,
            costing projects, formatting invoices and drafting professional replies.
          </p>
          <p>
            AI genuinely helps here. But most tools need a cloud account, ship your data to third-party servers and bill
            per use. For someone handling sensitive client information, that raises privacy and cost concerns.
          </p>
          <p>
            HustlePilot AI shows that open-weight models can handle real business documents locally — giving you control
            without sacrificing output quality.
          </p>
        </div>
      </ClayCard>

      {/* Benefits */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-ink mb-1.5">Why open-weight AI matters here</h2>
        <p className="text-muted text-sm mb-5">We use Ollama to run models like Llama 3.2 locally. Here's what that actually means.</p>
        <div className="space-y-4">
          {benefits.map(({ icon, tone, title, description, caveat }) => (
            <ClayCard flat key={title} className="p-5">
              <div className="flex items-start gap-4">
                <IconTile icon={icon} tone={tone} className="flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-ink text-sm mb-1.5">{title}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-3">{description}</p>
                  <div className="flex items-start gap-2.5 p-3 rounded-[14px]" style={{ background: 'var(--c-warning-soft)' }}>
                    <AlertTriangle size={13} className="text-[var(--c-warning)] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-inkbody/90">{caveat}</p>
                  </div>
                </div>
              </div>
            </ClayCard>
          ))}
        </div>
      </section>

      {/* Trade-offs */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-ink mb-1.5">Honest trade-offs</h2>
        <p className="text-muted text-sm mb-5">We don't claim open-weight models are universally better. Here's the real picture.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tradeoffs.map(({ pro, text }) => (
            <div
              key={text}
              className="flex items-start gap-3 p-3.5 rounded-[16px] border"
              style={pro
                ? { background: 'var(--c-success-soft)', borderColor: 'var(--c-mint-border)' }
                : { background: 'var(--c-surface2)', borderColor: 'var(--c-line)' }}
            >
              {pro
                ? <CheckCircle size={15} className="text-[var(--c-success)] mt-0.5 flex-shrink-0" />
                : <AlertTriangle size={15} className="text-muted mt-0.5 flex-shrink-0" />}
              <p className="text-xs text-inkbody leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Licensing */}
      <ClayCard flat className="p-5 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <IconTile icon={Scale} tone="neutral" size="sm" />
          <h2 className="text-sm font-semibold text-ink">Model licensing note</h2>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          HustlePilot AI supports any Ollama-compatible model. The default is <strong className="text-ink">Llama 3.2</strong> by Meta,
          released under the{' '}
          <a href="https://llama.meta.com/llama3/license/" target="_blank" rel="noopener noreferrer" className="text-accentink hover:underline">
            Llama 3 Community License
          </a>
          . It permits use in applications under 700M monthly active users but is not OSI-certified open source.
        </p>
        <p className="text-muted text-sm leading-relaxed mt-3">
          “Open-weight” means the weights are public. “Open-source” means training code, data and weights are all public.
          Llama 3.2 is open-weight, not fully open-source. Check each model's license before commercial deployment.
        </p>
      </ClayCard>

      {/* Stack */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-ink mb-4">Technology stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stack.map(({ tech, role }) => (
            <div key={tech} className="clay-panel p-4">
              <p className="text-sm font-semibold text-ink">{tech}</p>
              <p className="text-xs text-muted mt-1">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <ClayCard className="p-8 text-center">
        <Badge tone="accent" className="mb-4"><Shield size={12} /> Private by default</Badge>
        <h2 className="text-xl font-bold text-ink mb-3">Ready to try it?</h2>
        <p className="text-muted text-sm mb-6 max-w-md mx-auto">
          No account needed. Start with a proposal or invoice — install Ollama later for AI features.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Button as={Link} to="/dashboard" variant="primary" className="gap-2">
            <Zap size={15} /> Open dashboard
          </Button>
          <Button as={Link} to="/settings" variant="secondary" className="gap-2">
            Configure AI <ArrowRight size={15} />
          </Button>
        </div>
      </ClayCard>
    </div>
  );
}
