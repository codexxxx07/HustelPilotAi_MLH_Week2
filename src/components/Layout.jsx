import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Calculator, Receipt,
  MessageSquare, FolderOpen, Settings, Info,
  Menu, X, Zap, ArrowUpRight
} from 'lucide-react';
import { checkOllamaAvailability } from '../services/ai';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/proposals', icon: FileText, label: 'Proposals' },
  { to: '/estimator', icon: Calculator, label: 'Estimator' },
  { to: '/invoices', icon: Receipt, label: 'Invoices' },
  { to: '/communications', icon: MessageSquare, label: 'Communications' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
];

const bottomNavItems = [
  { to: '/about', icon: Info, label: 'About' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function AiStatusPill({ status }) {
  const config = {
    checking: { dot: 'bg-[var(--c-warning)] animate-pulse-soft', text: 'Checking…', tone: 'text-muted' },
    online: { dot: 'bg-[var(--c-success)]', text: 'Ollama connected', tone: 'text-[var(--c-success)]' },
    offline: { dot: 'bg-[var(--c-muted)]', text: 'Offline · fallback', tone: 'text-muted' },
  }[status] || {};

  return (
    <div className="clay-sunken flex items-center gap-2.5 px-3.5 py-2.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
      <span className={`text-xs font-medium ${config.tone}`}>{config.text}</span>
    </div>
  );
}

function Brand({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="clay-tile w-10 h-10 text-white"
        style={{
          backgroundImage: 'linear-gradient(165deg, var(--c-accent-hi), var(--c-accent))',
          borderColor: 'transparent',
        }}
      >
        <Zap size={18} />
      </span>
      <div className="leading-tight">
        <div className="font-display font-bold text-ink text-[15px] tracking-tight">HustlePilot AI</div>
        {!compact && <div className="text-[11px] text-muted">Less Admin. More Earning.</div>}
      </div>
    </div>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking');
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const run = () => checkOllamaAvailability().then(r => setAiStatus(r.available ? 'online' : 'offline'));
    run();
    const interval = setInterval(run, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-app overflow-hidden">
      {sidebarOpen && (
        <div
          className="clay-overlay fixed inset-0 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-[17.5rem] flex flex-col
          bg-surface border-r border-line
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <Brand />
          <button
            type="button"
            className="lg:hidden clay-tile w-9 h-9 text-inkbody"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-4 pb-4">
          <AiStatusPill status={aiStatus} />
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto pb-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-line space-y-1.5">
          {bottomNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="pt-2">
            <ThemeToggle showLabel />
          </div>
          <Link
            to="/"
            className="nav-link text-muted"
          >
            <ArrowUpRight size={18} />
            <span>Back to site</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between gap-3 px-4 py-3 border-b border-line bg-surface/85 backdrop-blur-md">
          <button
            type="button"
            className="clay-tile w-10 h-10 text-inkbody"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
          <Brand compact />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
