import { Link } from 'react-router-dom';
import {
  Zap, FileText, Calculator, Receipt, MessageSquare,
  ArrowRight, Shield, DollarSign, Cpu, Lock,
  ChevronRight, Star
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'AI Proposal Generator',
    description: 'Turn a project brief into a polished client proposal in minutes. Edit every word before sending.',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Calculator,
    title: 'Project Cost Estimator',
    description: 'Calculate accurate project estimates with transparent arithmetic. AI helps identify risks and assumptions.',
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Receipt,
    title: 'Invoice Generator',
    description: 'Create professional invoices with automatic calculations. Track status from Draft to Paid.',
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Client Communication',
    description: 'Draft professional messages for any client situation. Payment reminders, updates, proposals — all in your voice.',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/20',
  },
];

const whyOpen = [
  { icon: Lock, title: 'Privacy First', description: 'Generate documents locally. Your client data never leaves your device.' },
  { icon: DollarSign, title: 'No Per-Request Fees', description: 'Run a local model and avoid AI provider charges for every generation.' },
  { icon: Cpu, title: 'Swap Any Model', description: 'Replace the underlying model without redesigning the application.' },
  { icon: Shield, title: 'Works Offline', description: 'Invoices, editing, and documents work without any internet connection.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-[#1e293b] px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#0f172a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm tracking-tight">HustlePilot AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">About</Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Open App <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
          <Cpu size={12} />
          Powered by Open-Weight AI Models via Ollama
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          Less Admin.<br />
          <span className="text-blue-400">More Earning.</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          HustlePilot AI is a business assistant built for freelancers, indie developers, and small business owners.
          Write proposals, estimate projects, generate invoices, and communicate professionally — without the repetitive grind.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20"
          >
            Start for Free <ArrowRight size={16} />
          </Link>
          <Link
            to="/about"
            className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white border border-[#1e293b] hover:border-[#334155] rounded-xl transition-colors text-sm"
          >
            Why Open Source AI? <ChevronRight size={14} />
          </Link>
        </div>
        <p className="text-xs text-slate-600 mt-6">No account required. All data stored locally on your device.</p>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Everything a freelancer needs</h2>
          <p className="text-slate-400 text-sm">Four tools that cover 90% of your business admin work.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, description, color, border }) => (
            <div
              key={title}
              className={`p-5 rounded-xl bg-gradient-to-br ${color} border ${border} hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#1e293b] flex items-center justify-center mb-4">
                <Icon size={18} className="text-slate-300" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-2">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Open AI */}
      <section className="px-6 py-16 border-t border-[#1e293b]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">Built on Open-Weight AI</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              HustlePilot AI uses Ollama to run models like Llama 3.2 locally.
              Your documents stay on your device. You control the model.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyOpen.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-5 rounded-xl bg-[#1e293b]/40 border border-[#334155]">
                <Icon size={20} className="text-blue-400 mb-3" />
                <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 border-t border-[#1e293b]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to reclaim your time?</h2>
          <p className="text-slate-400 text-sm mb-8">
            Start with a proposal, estimate, or invoice — no signup, no subscription, no cloud.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200"
          >
            Open HustlePilot AI <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-500" />
            <span className="text-sm text-slate-500">HustlePilot AI — Open-source friendly. Built for freelancers.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <Link to="/about" className="hover:text-slate-400 transition-colors">About</Link>
            <Link to="/settings" className="hover:text-slate-400 transition-colors">Settings</Link>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
