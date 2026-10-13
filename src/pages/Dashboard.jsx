import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Receipt, TrendingUp, Clock, Plus, Calculator,
  AlertCircle, ChevronRight, BarChart2, DollarSign,
  CheckCircle, AlertTriangle, MessageSquare, Sparkles
} from 'lucide-react';
import { proposalStorage, invoiceStorage, communicationStorage, estimateStorage } from '../services/storage';
import { ClayCard, IconTile, Button, Badge, PageHeader } from '../components/ui';

const TYPE_META = {
  proposal: { label: 'Proposal', icon: FileText, tone: 'accent' },
  invoice: { label: 'Invoice', icon: Receipt, tone: 'mint' },
  communication: { label: 'Message', icon: MessageSquare, tone: 'peach' },
  estimate: { label: 'Estimate', icon: Calculator, tone: 'lav' },
};

const STATUS_TONE = {
  draft: 'neutral',
  sent: 'accent',
  paid: 'success',
  overdue: 'danger',
};

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
}

function StatCard({ icon, tone, label, value, sub }) {
  return (
    <ClayCard interactive className="p-5">
      <div className="flex items-start justify-between mb-4">
        <IconTile icon={icon} tone={tone} size="sm" />
      </div>
      <div className="text-2xl font-bold text-ink leading-none">{value}</div>
      <div className="text-sm text-muted mt-2">{label}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </ClayCard>
  );
}

function RecentRow({ title, type, date, status }) {
  const meta = TYPE_META[type] || TYPE_META.proposal;
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-line last:border-0">
      <IconTile icon={meta.icon} tone={meta.tone} size="sm" className="flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink font-medium truncate">{title}</p>
        <p className="text-xs text-muted mt-0.5">{meta.label} · {new Date(date).toLocaleDateString()}</p>
      </div>
      {status && <Badge tone={STATUS_TONE[status] || 'neutral'} className="flex-shrink-0 capitalize">{status}</Badge>}
    </div>
  );
}

const QUICK_ACTIONS = [
  { to: '/proposals', icon: FileText, label: 'New proposal', tone: 'accent' },
  { to: '/invoices', icon: Receipt, label: 'New invoice', tone: 'mint' },
  { to: '/estimator', icon: TrendingUp, label: 'Estimate project', tone: 'lav' },
  { to: '/communications', icon: MessageSquare, label: 'Draft message', tone: 'peach' },
];

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
    .slice(0, 6);

  const isEmpty = proposals.length === 0 && invoices.length === 0 && communications.length === 0 && estimates.length === 0;

  return (
    <div className="p-5 sm:p-7 max-w-6xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Your business at a glance — built from the documents you've saved."
        actions={
          <Button as={Link} to="/proposals" variant="primary" size="sm" className="gap-1.5">
            <Plus size={15} /> New proposal
          </Button>
        }
      />

      {isEmpty ? (
        <ClayCard className="p-8 sm:p-12 text-center mb-8">
          <IconTile icon={Sparkles} tone="accent" size="lg" className="mx-auto mb-6" />
          <h2 className="text-xl font-bold text-ink mb-2">Welcome to HustlePilot AI</h2>
          <p className="text-muted text-sm max-w-md mx-auto mb-8 leading-relaxed">
            This workspace fills up as you work. Create a proposal, invoice or estimate and your real
            numbers and recent activity will appear here.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { to: '/proposals', icon: FileText, tone: 'accent', title: 'Write a proposal', desc: 'Draft and save client proposals' },
              { to: '/invoices', icon: Receipt, tone: 'mint', title: 'Create an invoice', desc: 'Bill with automatic totals' },
              { to: '/estimator', icon: Calculator, tone: 'lav', title: 'Estimate a project', desc: 'Cost it out with clear math' },
            ].map(({ to, icon, tone, title, desc }) => (
              <Link key={to} to={to} className="clay-panel clay-interactive p-5 text-left flex flex-col gap-3">
                <IconTile icon={icon} tone={tone} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </ClayCard>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={FileText} tone="accent" label="Proposals" value={proposals.length} />
            <StatCard icon={Receipt} tone="mint" label="Invoices" value={invoices.length} />
            <StatCard
              icon={DollarSign}
              tone="lav"
              label="Total invoiced"
              value={formatCurrency(totalInvoiced)}
              sub={`${formatCurrency(totalPaid)} paid`}
            />
            <StatCard
              icon={overdueCount > 0 ? AlertTriangle : CheckCircle}
              tone={overdueCount > 0 ? 'danger' : 'mint'}
              label="Outstanding"
              value={formatCurrency(totalOutstanding)}
              sub={overdueCount > 0 ? `${overdueCount} overdue` : 'All current'}
            />
          </div>

          {overdueCount > 0 && (
            <div className="flex items-start gap-3.5 p-4 mb-6 rounded-[20px] border border-[var(--c-line2)]" style={{ background: 'var(--c-danger-soft)' }}>
              <AlertCircle size={18} className="text-[var(--c-danger)] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--c-danger)]">Overdue invoices</p>
                <p className="text-xs text-inkbody mt-0.5">
                  {overdueCount} {overdueCount === 1 ? 'invoice needs' : 'invoices need'} follow-up.{' '}
                  <Link to="/invoices" className="underline underline-offset-2 font-medium">View invoices</Link>
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {recentDocs.length > 0 && (
        <ClayCard flat className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-line">
            <div className="flex items-center gap-3">
              <IconTile icon={Clock} tone="neutral" size="sm" />
              <h2 className="text-sm font-semibold text-ink">Recent documents</h2>
            </div>
            <Link to="/documents" className="text-xs font-medium text-accentink hover:underline flex items-center gap-1">
              View all <ChevronRight size={13} />
            </Link>
          </div>
          <div className="px-5">
            {recentDocs.map(doc => (
              <RecentRow
                key={doc.id}
                title={doc.title || doc.projectTitle || doc.subject || doc.projectDescription || 'Untitled'}
                type={doc.docType}
                date={doc.updatedAt}
                status={doc.status}
              />
            ))}
          </div>
        </ClayCard>
      )}

      {!isEmpty && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-ink mb-3">Quick actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {QUICK_ACTIONS.map(({ to, icon: Icon, label, tone }) => (
              <Link key={to} to={to} className="clay-panel clay-interactive p-4 flex items-center gap-3">
                <IconTile icon={Icon} tone={tone} size="sm" className="flex-shrink-0" />
                <span className="text-sm font-medium text-ink">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="mt-6 flex justify-center">
          <Button as={Link} to="/documents" variant="ghost" size="sm" className="gap-1.5">
            <BarChart2 size={15} /> Browse all documents
          </Button>
        </div>
      )}
    </div>
  );
}
