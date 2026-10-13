import { Link } from 'react-router-dom';
import {
  Zap, Shield, DollarSign, Cpu, Lock, RefreshCw,
  CheckCircle, AlertTriangle, ExternalLink, Scale
} from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    title: 'Privacy by Design',
    description: 'When you run Ollama locally, your business proposals, client details, and financial data never leave your device. There are no API calls to third-party AI providers for that workflow.',
    caveat: 'This applies only to local inference. If you configure a remote endpoint, data is sent to that server.',
  },
  {
    icon: DollarSign,
    title: 'No Per-Request AI Charges',
    description: 'Running a local model eliminates per-generation costs from cloud AI providers. You pay for hardware and electricity — not for every proposal you write.',
    caveat: 'Setup, hardware, power, and time have real costs. Local models also require meaningful RAM (≥8GB recommended).',
  },
  {
    icon: Cpu,
    title: 'Swap Any Compatible Model',
    description: 'HustlePilot AI\'s AI layer is designed to be model-agnostic. You can switch from Llama 3.2 to Mistral, Phi-3, Gemma 2, or any Ollama-compatible model without changing the application.',
    caveat: 'Different models have different capabilities. Not all models produce equally professional output for business documents.',
  },
  {
    icon: RefreshCw,
    title: 'Works Without AI',
    description: 'Every core workflow — invoicing, editing, saving, exporting — functions without AI. Templates are available when Ollama is offline. You\'re never locked out of your own data.',
    caveat: 'Template output requires more user editing. AI-generated drafts typically need less manual work.',
  },
];

const tradeoffs = [
  { pro: true, text: 'No monthly AI subscription fee for local usage' },
  { pro: true, text: 'Client data stays on your device (local mode)' },
  { pro: true, text: 'Model can be replaced without app redesign' },
  { pro: true, text: 'Core features work fully offline' },
  { pro: false, text: 'Requires Ollama install + model download (2–8GB)' },
  { pro: false, text: 'Output quality depends on the selected model' },
  { pro: false, text: 'Hardware requirements limit which models run well' },
  { pro: false, text: 'Open-weight ≠ fully open-source (check each model\'s license)' },
];

export default function About() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">About HustlePilot AI</h1>
            <p className="text-slate-400 text-sm">Less Admin. More Earning.</p>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed max-w-3xl">
          HustlePilot AI is an open-source productivity tool built for freelancers, independent developers, designers, 
          and small business owners. It uses open-weight AI models to reduce the time spent on proposals, estimates, 
          invoices, and client communications — letting you focus on doing the work, not documenting it.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-10 p-6 bg-[#1e293b]/40 border border-[#334155] rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-3">Why We Built This</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-3">
          Freelancers spend a meaningful portion of unpaid time on business administration — writing proposals from scratch, 
          calculating project estimates, formatting invoices, and drafting professional responses to clients.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mb-3">
          AI can genuinely help with these tasks. But most AI-assisted tools require cloud accounts, send your data to 
          third-party servers, and charge per use. For a freelancer working locally with sensitive client information, 
          this creates privacy and cost concerns.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed">
          HustlePilot AI demonstrates that open-weight models can handle real business document generation locally — 
          giving users meaningful control without sacrificing the quality of output.
        </p>
      </section>

      {/* Open AI Benefits */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-2">Why Open-Weight AI Matters Here</h2>
        <p className="text-slate-500 text-sm mb-6">
          We use Ollama to run models like Llama 3.2 locally. Here's what that actually means for you.
        </p>
        <div className="space-y-4">
          {benefits.map(({ icon: Icon, title, description, caveat }) => (
            <div key={title} className="p-5 bg-[#1e293b]/40 border border-[#334155] rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={17} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-2">{description}</p>
                  <div className="flex items-start gap-2 p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                    <AlertTriangle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-400/80">{caveat}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trade-offs */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-2">Honest Trade-offs</h2>
        <p className="text-slate-500 text-sm mb-5">
          We don't claim open-weight models are universally better than closed models. Here's an honest comparison.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {tradeoffs.map(({ pro, text }) => (
            <div key={text} className={`flex items-start gap-3 p-3 rounded-lg border ${
              pro ? 'bg-green-500/5 border-green-500/10' : 'bg-slate-500/5 border-slate-700'
            }`}>
              {pro
                ? <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                : <AlertTriangle size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
              }
              <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Model info */}
      <section className="mb-10 p-5 bg-[#1e293b]/40 border border-[#334155] rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Scale size={15} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-white">Model Licensing Note</h2>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed">
          HustlePilot AI supports any Ollama-compatible model. The default recommendation is <strong className="text-slate-200">Llama 3.2</strong> by Meta, 
          which is released under the <a href="https://llama.meta.com/llama3/license/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Llama 3 Community License</a>.
          This license permits use in applications with up to 700M monthly active users, but is not OSI-certified open source.
        </p>
        <p className="text-slate-400 text-sm leading-relaxed mt-2">
          "Open-weight" means the model weights are publicly available. "Open-source" means the training code, data, and weights are all public. 
          Llama 3.2 is open-weight, not fully open-source. Check each model's license before commercial deployment.
        </p>
      </section>

      {/* Stack */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-white mb-4">Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { tech: 'React 19', role: 'UI Framework' },
            { tech: 'Vite', role: 'Build Tool' },
            { tech: 'Tailwind CSS v4', role: 'Styling' },
            { tech: 'React Router v7', role: 'Routing' },
            { tech: 'Ollama', role: 'AI Runtime' },
            { tech: 'Llama 3.2', role: 'Default Model' },
            { tech: 'localStorage', role: 'Data Storage' },
            { tech: 'MIT License', role: 'App License' },
          ].map(({ tech, role }) => (
            <div key={tech} className="p-3 bg-[#1e293b]/40 border border-[#334155] rounded-lg">
              <p className="text-sm font-semibold text-white">{tech}</p>
              <p className="text-xs text-slate-500 mt-0.5">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="text-center py-8 bg-[#1e293b]/30 border border-[#334155] rounded-2xl">
        <h2 className="text-lg font-bold text-white mb-3">Ready to try it?</h2>
        <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
          No account needed. Start with a proposal or invoice. Install Ollama later for AI features.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Zap size={14} /> Open Dashboard
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 px-5 py-2.5 border border-[#334155] hover:border-[#475569] text-slate-300 text-sm font-medium rounded-xl transition-colors"
          >
            Configure AI
          </Link>
        </div>
      </section>
    </div>
  );
}
