import { Link } from 'react-router-dom';
import {
  Zap, FileText, Calculator, Receipt, MessageSquare,
  ArrowRight, Shield, DollarSign, Cpu, Lock,
  Sparkles, Check
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { Button, ClayCard, IconTile, Badge } from '../components/ui';

const tools = [
  {
    icon: FileText,
    tone: 'accent',
    title: 'AI Proposal Generator',
    description: 'Turn a rough project brief into a structured, client-ready proposal. Edit every word before you send it.',
    meta: 'Draft in minutes',
    span: 'lg:col-span-3',
  },
  {
    icon: Calculator,
    tone: 'lav',
    title: 'Project Cost Estimator',
    description: 'Transparent arithmetic for rates, hours and contingency — AI flags risks and assumptions.',
    meta: 'Accurate math',
    span: 'lg:col-span-3',
  },
  {
    icon: Receipt,
    tone: 'mint',
    title: 'Invoice Generator',
    description: 'Professional invoices with automatic totals, tax and status tracking.',
    meta: 'Draft to paid',
    span: 'lg:col-span-2',
  },
  {
    icon: MessageSquare,
    tone: 'peach',
    title: 'Client Communication',
    description: 'Draft payment reminders, updates and replies that sound like you.',
    meta: 'Your voice',
    span: 'lg:col-span-4',
  },
];

const principles = [
  {
    icon: Lock,
    title: 'Privacy first',
    description: 'Run the model locally and your client data never leaves your machine.',
  },
  {
    icon: DollarSign,
    title: 'No per-request fees',
    description: 'Local inference means no metered AI bill for every document you write.',
  },
  {
    icon: Cpu,
    title: 'Swap any model',
    description: 'Move between Llama, Mistral, Phi or Gemma without touching the app.',
  },
  {
    icon: Shield,
    title: 'Works offline',
    description: 'Invoices, estimates and editing keep working with no connection at all.',
  },
];

function SkeletonWindow() {
  return (
    <ClayCard className="p-3 sm:p-4 overflow-hidden">
      <div className="flex items-center gap-2 px-2 pb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-line2)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-line2)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[var(--c-line2)]" />
        <span className="ml-3 h-2.5 w-32 rounded-full bg-[var(--c-line)]" />
      </div>
      <div className="rounded-[20px] bg-app/60 p-3 sm:p-4 flex gap-3">
        {/* rail */}
        <div className="hidden sm:flex flex-col gap-2.5 w-36 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="clay-tile w-8 h-8 text-white" style={{ backgroundImage: 'linear-gradient(165deg, var(--c-accent-hi), var(--c-accent))', borderColor: 'transparent' }}>
              <Zap size={14} />
            </span>
            <span className="h-2.5 w-20 rounded-full bg-[var(--c-line2)]" />
          </div>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl ${i === 1 ? 'bg-[var(--c-accent-soft)]' : ''}`}>
              <span className="w-4 h-4 rounded-md bg-[var(--c-line2)]" />
              <span className="h-2 rounded-full bg-[var(--c-line2)]" style={{ width: `${60 + (i % 3) * 14}%` }} />
            </div>
          ))}
        </div>
        {/* content */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="h-3 w-28 rounded-full bg-[var(--c-line2)]" />
            <span className="h-7 w-20 rounded-full bg-[var(--c-accent-soft)]" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="clay-card-flat p-3 space-y-2">
                <span className="block w-7 h-7 rounded-lg bg-[var(--c-accent-soft)]" />
                <span className="block h-3 w-3/4 rounded-full bg-[var(--c-line2)]" />
                <span className="block h-2 w-1/2 rounded-full bg-[var(--c-line)]" />
              </div>
            ))}
          </div>
          <div className="clay-card-flat p-3 space-y-2.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-[var(--c-line)]" />
                <span className="h-2.5 rounded-full bg-[var(--c-line2)] flex-1" style={{ maxWidth: `${70 - i * 12}%` }} />
                <span className="h-2.5 w-10 rounded-full bg-[var(--c-line)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-3 hidden sm:flex items-center gap-2 clay-card px-3 py-2 animate-float">
        <Sparkles size={14} className="text-accent" />
        <span className="text-xs font-medium text-ink">AI drafting…</span>
      </div>
    </ClayCard>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen text-inkbody overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-20 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto clay-card-flat px-4 sm:px-5 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="clay-tile w-9 h-9 text-white" style={{ backgroundImage: 'linear-gradient(165deg, var(--c-accent-hi), var(--c-accent))', borderColor: 'transparent' }}>
              <Zap size={16} />
            </span>
            <span className="font-display font-bold text-ink text-sm tracking-tight">HustlePilot AI</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/about" className="hidden sm:block text-sm text-muted hover:text-ink transition-colors px-3">About</Link>
            <ThemeToggle />
            <Button as={Link} to="/dashboard" variant="primary" size="sm" className="gap-1.5">
              Open App <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <Badge tone="accent" className="mb-6">
              <Cpu size={12} /> Powered by open-weight models via Ollama
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-bold text-ink leading-[1.05] mb-6">
              Less Admin.
              <br />
              <span className="text-accent">More Earning.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
              A business assistant for freelancers, indie developers and small studio owners. Write proposals,
              estimate projects, invoice clients and reply professionally — without the repetitive busywork.
            </p>
            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Button as={Link} to="/dashboard" variant="primary" size="lg" className="gap-2">
                Start for free <ArrowRight size={16} />
              </Button>
              <Button as={Link} to="/about" variant="secondary" size="lg">
                Why open-weight AI?
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-7 text-xs text-muted">
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--c-success)]" /> No account</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--c-success)]" /> Stored locally</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--c-success)]" /> MIT licensed</span>
            </div>
          </div>

          <div className="relative">
            <SkeletonWindow />
          </div>
        </div>
      </section>

      {/* Tools — bento */}
      <section className="px-4 sm:px-6 py-16 border-t border-line">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">Everything the admin side of freelancing needs</h2>
            <p className="text-muted text-sm sm:text-base">
              Four focused tools that cover the documents you'd otherwise write from scratch.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
            {tools.map(({ icon: Icon, tone, title, description, meta, span }) => (
              <ClayCard key={title} interactive className={`${span} p-6 flex flex-col`}>
                <div className="flex items-start justify-between mb-5">
                  <IconTile icon={Icon} tone={tone} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{meta}</span>
                </div>
                <h3 className="font-semibold text-ink text-base mb-2">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{description}</p>
              </ClayCard>
            ))}
          </div>
        </div>
      </section>

      {/* Why local AI */}
      <section className="px-4 sm:px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <ClayCard className="p-7 sm:p-10">
            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <Badge tone="lav" className="mb-4"><Lock size={12} /> Your data, your device</Badge>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">Built on open-weight AI</h2>
                <p className="text-muted text-sm sm:text-base leading-relaxed">
                  HustlePilot AI talks to Ollama, so it can run models like Llama 3.2 directly on your machine.
                  Your proposals and client details stay where you work, and you choose the model.
                </p>
                <Button as={Link} to="/about" variant="secondary" size="sm" className="mt-6 gap-1.5">
                  Read the honest trade-offs <ArrowRight size={14} />
                </Button>
              </div>
              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
                {principles.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="clay-panel p-5">
                    <Icon size={19} className="text-accent mb-3" />
                    <h3 className="font-semibold text-ink text-sm mb-1.5">{title}</h3>
                    <p className="text-muted text-xs leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </ClayCard>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center clay-card p-10 sm:p-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-4">Ready to reclaim your time?</h2>
          <p className="text-muted text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Start with a proposal, estimate or invoice. No signup, no subscription, no cloud required.
          </p>
          <Button as={Link} to="/dashboard" variant="primary" size="lg" className="gap-2 mx-auto">
            Open HustlePilot AI <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 pb-10">
        <div className="max-w-6xl mx-auto border-t border-line pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="clay-tile w-8 h-8 text-white" style={{ backgroundImage: 'linear-gradient(165deg, var(--c-accent-hi), var(--c-accent))', borderColor: 'transparent' }}>
              <Zap size={14} />
            </span>
            <span className="text-sm text-muted">HustlePilot AI — built for freelancers</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted">
            <Link to="/about" className="hover:text-ink transition-colors">About</Link>
            <Link to="/settings" className="hover:text-ink transition-colors">Settings</Link>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
