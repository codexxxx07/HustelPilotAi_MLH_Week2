import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Receipt, TrendingUp, Clock, Plus,
  AlertCircle, ChevronRight, BarChart2, DollarSign,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { proposalStorage, invoiceStorage, communicationStorage, estimateStorage } from '../services/storage';

function StatCard({ icon: Icon, label, value, sub, color = 'blue', linkTo }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  };
  const card = (
    <div className="bg-[#1e293b]/60 border border-[#334155] rounded-xl p-5 hover:border-[#475569] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
        {linkTo && <ChevronRight size={16} className="text-slate-600" />}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
  return linkTo ? <Link to={linkTo}>{card}</Link> : card;
}

function EmptyState({ icon: Icon, title, description, linkTo, linkLabel }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="w-12 h-12 rounded-xl bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
        <Icon size={22} className="text-slate-600" />
      </div>
      <h3 className="text-slate-300 font-medium text-sm mb-1">{title}</h3>
      <p className="text-slate-500 text-xs mb-4 max-w-xs mx-auto">{description}</p>
      {linkTo && (
        <Link
          to={linkTo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-600/30 transition-colors"
        >
          <Plus size={13} /> {linkLabel}
        </Link>
      )}
    </div>
  );
}

function RecentItem({ title, type, date, status, statusColor }) {
  const typeColors = {
    proposal: 'bg-blue-500/10 text-blue-400',
    invoice: 'bg-emerald-500/10 text-emerald-400',
    communication: 'bg-amber-500/10 text-amber-400',
    estimate: 'bg-purple-500/10 text-purple-400',
  };
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#1e293b] last:border-0">
      <span className={`text-xs px-2 py-0.5 rounded font-medium ${typeColors[type] || typeColors.proposal}`}>
        {type}
      </span>
      <span className="text-sm text-slate-300 flex-1 truncate">{title}</span>
      {status && (
        <span className={`text-xs px-2 py-0.5 rounded border ${statusColor}`}>{status}</span>
      )}
      <span className="text-xs text-slate-600 flex-shrink-0">{new Date(date).toLocaleDateString()}</span>
    </div>
  );
}

function getStatusStyle(status) {
  const map = {
    draft: 'border-slate-500/30 text-slate-400',
    sent: 'border-blue-500/30 text-blue-400',
    paid: 'border-green-500/30 text-green-400',
    overdue: 'border-red-500/30 text-red-400',
  };
  return map[status] || map.draft;
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export default function Dashboard() {
  const [proposals, setProposals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [estimates, setEstimates] = useState([]);

  useEffect(() => {
    setProposals(proposalStorage.getAll());
    setInvoices(invoiceStorage.getAll());
    setCommunications(communicationStorage.getAll());
    setEstimates(estimateStorage.getAll());
  }, []);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalOutstanding = invoices
    .filter(i => ['sent', 'overdue'].includes(i.status))
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const recentDocs = [
    ...proposals.map(p => ({ ...p, docType: 'proposal' })),
    ...invoices.map(i => ({ ...i, docType: 'invoice' })),
    ...communications.map(c => ({ ...c, docType: 'communication' })),
    ...estimates.map(e => ({ ...e, docType: 'estimate' })),
  ]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 7);

  const isEmpty = proposals.length === 0 && invoices.length === 0 && communications.length === 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Your business overview at a glance.</p>
      </div>

      {isEmpty ? (
        <div className="bg-[#1e293b]/40 border border-[#334155] border-dashed rounded-2xl p-12 text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center mx-auto mb-5">
            <BarChart2 size={26} className="text-slate-600" />
          </div>
          <h2 className="text-white font-semibold mb-2">Welcome to HustlePilot AI</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Your dashboard will show real stats once you start creating proposals, invoices, and documents.
            Get started with one of the tools below.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/proposals" className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-600/30 transition-colors">
              <FileText size={15} /> New Proposal
            </Link>
            <Link to="/invoices" className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-600/30 transition-colors">
              <Receipt size={15} /> New Invoice
            </Link>
            <Link to="/estimator" className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 text-sm font-medium rounded-lg hover:bg-purple-600/30 transition-colors">
              <TrendingUp size={15} /> Estimate Project
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={FileText} label="Proposals" value={proposals.length} linkTo="/proposals" color="blue" />
            <StatCard icon={Receipt} label="Invoices" value={invoices.length} linkTo="/invoices" color="green" />
            <StatCard
              icon={DollarSign}
              label="Total Invoiced"
              value={formatCurrency(totalInvoiced)}
              sub={`${formatCurrency(totalPaid)} paid`}
              color="purple"
            />
            <StatCard
              icon={overdueCount > 0 ? AlertTriangle : CheckCircle}
              label="Outstanding"
              value={formatCurrency(totalOutstanding)}
              sub={overdueCount > 0 ? `${overdueCount} overdue` : 'All current'}
              color={overdueCount > 0 ? 'red' : 'green'}
              linkTo="/invoices"
            />
          </div>

          {overdueCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-300">Overdue Invoices</div>
                <div className="text-xs text-red-400/70 mt-0.5">
                  You have {overdueCount} overdue {overdueCount === 1 ? 'invoice' : 'invoices'}.{' '}
                  <Link to="/invoices" className="underline hover:text-red-300">View invoices →</Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recent Activity */}
      {recentDocs.length > 0 && (
        <div className="bg-[#1e293b]/40 border border-[#334155] rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155]">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-white">Recent Documents</h2>
            </div>
            <Link to="/documents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="px-5 pb-2">
            {recentDocs.map(doc => (
              <RecentItem
                key={doc.id}
                title={doc.title || doc.projectTitle || doc.subject || doc.projectDescription || 'Untitled'}
                type={doc.docType}
                date={doc.updatedAt}
                status={doc.status}
                statusColor={getStatusStyle(doc.status)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions (always shown) */}
      {!isEmpty && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/proposals', icon: FileText, label: 'New Proposal', color: 'text-blue-400' },
            { to: '/invoices', icon: Receipt, label: 'New Invoice', color: 'text-emerald-400' },
            { to: '/estimator', icon: TrendingUp, label: 'Estimate Project', color: 'text-purple-400' },
            { to: '/communications', icon: AlertCircle, label: 'Draft Message', color: 'text-amber-400' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2.5 p-3.5 bg-[#1e293b]/40 border border-[#334155] rounded-xl hover:border-[#475569] hover:bg-[#1e293b]/70 transition-all text-sm text-slate-300"
            >
              <Plus size={14} className="text-slate-500" />
              <Icon size={15} className={color} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
