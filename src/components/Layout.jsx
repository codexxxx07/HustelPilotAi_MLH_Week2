import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Calculator, Receipt,
  MessageSquare, FolderOpen, Settings, Info,
  Menu, X, Zap, ChevronRight
} from 'lucide-react';
import { checkOllamaAvailability } from '../services/ai';

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

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiStatus, setAiStatus] = useState('checking'); // checking | online | offline
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    checkOllamaAvailability().then(result => {
      setAiStatus(result.available ? 'online' : 'offline');
    });
    const interval = setInterval(() => {
      checkOllamaAvailability().then(result => {
        setAiStatus(result.available ? 'online' : 'offline');
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
        bg-[#0d1526] border-r border-[#1e293b]
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e293b]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">HustlePilot AI</div>
            <div className="text-xs text-slate-500">Less Admin. More Earning.</div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* AI Status Badge */}
        <div className="px-4 py-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e293b]/60">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              aiStatus === 'online' ? 'bg-green-500' :
              aiStatus === 'checking' ? 'bg-yellow-500 animate-pulse' :
              'bg-slate-500'
            }`} />
            <div className="text-xs text-slate-400">
              AI: {aiStatus === 'online' ? (
                <span className="text-green-400 font-medium">Ollama Connected</span>
              ) : aiStatus === 'checking' ? (
                <span className="text-yellow-400">Checking...</span>
              ) : (
                <span className="text-slate-500">Offline (Fallback Mode)</span>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
                }
              `}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="px-3 py-4 border-t border-[#1e293b] space-y-1">
          {bottomNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e293b]'
                }
              `}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#0d1526]">
          <button
            className="p-2 text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-white">HustlePilot AI</span>
          </div>
          <div className="w-8" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
