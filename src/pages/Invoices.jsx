import { useState, useEffect } from 'react';
import {
  Plus, Receipt, Trash2, Copy, Edit3, Printer,
  Save, CheckCircle, AlertTriangle, Send, FileText,
  Search, Eye, Pencil, Wallet
} from 'lucide-react';
import { invoiceStorage } from '../services/storage';
import {
  Button, ClayCard, IconTile, Field, Input, Textarea, Select,
  Badge, Modal, ModalHeader, EmptyState, PageHeader, Segmented, PrintPortal
} from '../components/ui';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];
const STATUSES = ['draft', 'sent', 'paid', 'overdue'];

function genInvoiceNumber() {
  return `INV-${Date.now().toString().slice(-6)}`;
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount || 0);
}

function calcInvoice(items, taxRate) {
  const subtotal = items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.unitPrice) || 0), 0);
  const tax = subtotal * ((parseFloat(taxRate) || 0) / 100);
  return { subtotal, tax, total: subtotal + tax };
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FileText, tone: 'neutral' },
  sent: { label: 'Sent', icon: Send, tone: 'accent' },
  paid: { label: 'Paid', icon: CheckCircle, tone: 'success' },
  overdue: { label: 'Overdue', icon: AlertTriangle, tone: 'danger' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  return (
    <Badge tone={cfg.tone} className="gap-1 capitalize">
      <cfg.icon size={11} /> {cfg.label}
    </Badge>
  );
}

const EMPTY_ITEM = { description: '', qty: '1', unitPrice: '' };
const EMPTY_INVOICE = {
  invoiceNumber: genInvoiceNumber(),
  businessName: '', businessEmail: '', businessAddress: '',
  clientName: '', clientEmail: '', clientAddress: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'USD',
  taxRate: '',
  paymentInstructions: '',
  notes: '',
  items: [{ ...EMPTY_ITEM }],
  status: 'draft',
};

/* ---------------- Printable / preview document ---------------- */
function InvoiceDocument({ invoice }) {
  const { subtotal, tax, total } = calcInvoice(invoice.items, invoice.taxRate);
  const cur = invoice.currency || 'USD';

  return (
    <div className="bg-white text-[#111827] p-8 sm:p-10">
      <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-[#e5e7eb]">
        <div>
          <p className="text-xl font-bold text-[#111827]">{invoice.businessName || 'Your business'}</p>
          {invoice.businessEmail && <p className="text-sm text-[#4b5563] mt-1">{invoice.businessEmail}</p>}
          {invoice.businessAddress && <p className="text-sm text-[#4b5563] whitespace-pre-line">{invoice.businessAddress}</p>}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tracking-tight text-[#111827]">INVOICE</p>
          <p className="text-sm text-[#4b5563] mt-1 font-mono">{invoice.invoiceNumber}</p>
          <p className="text-xs text-[#6b7280] mt-1 capitalize">{invoice.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1.5">Billed to</p>
          <p className="text-sm font-medium text-[#111827]">{invoice.clientName || '—'}</p>
          {invoice.clientEmail && <p className="text-sm text-[#4b5563]">{invoice.clientEmail}</p>}
          {invoice.clientAddress && <p className="text-sm text-[#4b5563] whitespace-pre-line">{invoice.clientAddress}</p>}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1.5">Issue date</p>
          <p className="text-sm text-[#111827]">{invoice.issueDate || '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1.5">Due date</p>
          <p className="text-sm text-[#111827]">{invoice.dueDate || '—'}</p>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#d1d5db] text-left">
            <th className="py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Description</th>
            <th className="py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] text-center">Qty</th>
            <th className="py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] text-right">Unit price</th>
            <th className="py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => {
            const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
            return (
              <tr key={i} className="border-b border-[#f3f4f6]">
                <td className="py-3 text-sm text-[#111827]">{item.description || '—'}</td>
                <td className="py-3 text-sm text-[#4b5563] text-center">{item.qty}</td>
                <td className="py-3 text-sm text-[#4b5563] text-right">{formatCurrency(item.unitPrice, cur)}</td>
                <td className="py-3 text-sm text-[#111827] text-right">{formatCurrency(lineTotal, cur)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-end mt-6">
        <div className="w-full sm:w-72 space-y-2">
          <div className="flex justify-between text-sm text-[#4b5563]">
            <span>Subtotal</span><span className="text-[#111827]">{formatCurrency(subtotal, cur)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm text-[#4b5563]">
              <span>Tax ({invoice.taxRate}%)</span><span className="text-[#111827]">{formatCurrency(tax, cur)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-[#d1d5db] pt-2.5">
            <span className="text-[#111827]">Total</span>
            <span className="text-[#111827]">{formatCurrency(total, cur)}</span>
          </div>
        </div>
      </div>

      {(invoice.paymentInstructions || invoice.notes) && (
        <div className="mt-8 pt-6 border-t border-[#e5e7eb] space-y-4">
          {invoice.paymentInstructions && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">Payment instructions</p>
              <p className="text-sm text-[#4b5563] whitespace-pre-line">{invoice.paymentInstructions}</p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] mb-1">Notes</p>
              <p className="text-sm text-[#4b5563] whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Form + preview modal ---------------- */
function InvoiceForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_INVOICE,
    invoiceNumber: genInvoiceNumber(),
    ...(initial || {}),
    items: initial?.items?.length ? initial.items : [{ ...EMPTY_ITEM }],
  }));
  const [tab, setTab] = useState('edit');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => {
    const items = [...form.items];
    items[i] = { ...items[i], [k]: v };
    setForm(f => ({ ...f, items }));
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => {
    if (form.items.length === 1) return;
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  };

  const { subtotal, tax, total } = calcInvoice(form.items, form.taxRate);

  const handleSave = () => {
    const saved = invoiceStorage.save({ ...form, subtotal, tax, total });
    onSaved(saved);
    onClose();
  };

  const handlePrint = () => window.print();

  return (
    <Modal onClose={onClose} size="2xl">
      <div className="no-print">
        <ModalHeader icon={Receipt} tone="mint" title={initial ? 'Edit invoice' : 'New invoice'} onClose={onClose} />
        <div className="px-5 sm:px-7 pt-5">
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'edit', label: 'Edit', icon: Pencil },
              { value: 'preview', label: 'Preview', icon: Eye },
            ]}
          />
        </div>
      </div>

      {tab === 'edit' ? (
        <div className="no-print p-5 sm:p-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Invoice number">
              <Input className="font-mono" value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} />
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Issue date">
              <Input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} />
            </Field>
            <Field label="Due date">
              <Input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">From</p>
              <Input value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Your name / company" />
              <Input value={form.businessEmail} onChange={e => set('businessEmail', e.target.value)} placeholder="your@email.com" />
              <Input value={form.businessAddress} onChange={e => set('businessAddress', e.target.value)} placeholder="Address (optional)" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Bill to</p>
              <Input value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="Client name / company" />
              <Input value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="client@email.com" />
              <Input value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} placeholder="Client address (optional)" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Line items</p>
              <Select className="w-28 py-1.5 text-xs" value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>

            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-12 gap-3 px-1">
                <span className="col-span-6 text-xs text-muted">Description</span>
                <span className="col-span-2 text-xs text-muted text-center">Qty</span>
                <span className="col-span-3 text-xs text-muted">Unit price</span>
                <span className="col-span-1" />
              </div>
              {form.items.map((item, i) => {
                const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div key={i} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 sm:col-span-6">
                      <Input value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder={`Service or item ${i + 1}`} />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <Input type="number" min="0" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} className="text-center" />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <Input type="number" min="0" value={item.unitPrice} onChange={e => setItem(i, 'unitPrice', e.target.value)} placeholder="0.00" />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        iconOnly
                        size="sm"
                        onClick={() => removeItem(i)}
                        disabled={form.items.length === 1}
                        aria-label="Remove line item"
                      >
                        <Trash2 size={15} className="text-danger" />
                      </Button>
                    </div>
                    {lineTotal > 0 && (
                      <div className="col-span-12 text-right text-xs text-muted -mt-1.5">
                        Line total: {formatCurrency(lineTotal, form.currency)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button variant="ghost" size="sm" onClick={addItem} className="mt-3 gap-1.5">
              <Plus size={14} /> Add line item
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <Field label="Tax rate (%)">
              <Input type="number" min="0" max="100" value={form.taxRate} onChange={e => set('taxRate', e.target.value)} placeholder="0" />
            </Field>
            <div className="clay-sunken p-4 space-y-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span><span className="text-ink">{formatCurrency(subtotal, form.currency)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm text-muted">
                  <span>Tax ({form.taxRate}%)</span><span className="text-ink">{formatCurrency(tax, form.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-line pt-2">
                <span className="text-ink">Total</span><span className="text-ink">{formatCurrency(total, form.currency)}</span>
              </div>
            </div>
          </div>

          <Field label="Payment instructions">
            <Textarea value={form.paymentInstructions} onChange={e => set('paymentInstructions', e.target.value)} placeholder="Bank transfer to: Account 1234… / PayPal: email@example.com" rows={2} />
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Thank you for your business!" rows={2} />
          </Field>
        </div>
      ) : (
        <div className="p-5 sm:p-7">
          <div className="clay-sunken overflow-hidden">
            <InvoiceDocument invoice={form} />
          </div>
        </div>
      )}

      <div className="no-print flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-7 py-4 border-t border-line">
        <Button variant="secondary" onClick={handlePrint} className="gap-2">
          <Printer size={14} /> Print / PDF
        </Button>
        <div className="flex gap-3 sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="mint" onClick={handleSave} className="gap-2">
            <Save size={14} /> Save invoice
          </Button>
        </div>
      </div>

      {/* Clean document for print/PDF output, regardless of active tab */}
      <PrintPortal>
        <InvoiceDocument invoice={form} />
      </PrintPortal>
    </Modal>
  );
}

/* ---------------- List card ---------------- */
function InvoiceCard({ invoice, onEdit, onDelete, onDuplicate, onStatusChange }) {
  return (
    <ClayCard flat className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <IconTile icon={Receipt} tone="mint" size="sm" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs text-muted">{invoice.invoiceNumber}</span>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm font-semibold text-ink truncate">{invoice.clientName || 'Unnamed client'}</p>
            <p className="text-xs text-muted mt-0.5">
              {invoice.issueDate && `Issued ${invoice.issueDate}`}
              {invoice.dueDate && ` · Due ${invoice.dueDate}`}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-ink">{formatCurrency(invoice.total, invoice.currency)}</p>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <Button variant="ghost" iconOnly size="sm" onClick={() => onEdit(invoice)} title="Edit" aria-label="Edit invoice">
              <Edit3 size={14} />
            </Button>
            <Button variant="ghost" iconOnly size="sm" onClick={() => onDuplicate(invoice.id)} title="Duplicate" aria-label="Duplicate invoice">
              <Copy size={14} />
            </Button>
            <Button variant="ghost" iconOnly size="sm" onClick={() => onDelete(invoice.id)} title="Delete" aria-label="Delete invoice">
              <Trash2 size={14} className="text-danger" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-1.5 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onStatusChange(invoice.id, s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              invoice.status === s
                ? 'border-transparent text-ink'
                : 'border-line text-muted hover:text-ink'
            }`}
            style={invoice.status === s ? { background: 'var(--c-surface2)' } : undefined}
          >
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </ClayCard>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => setInvoices(invoiceStorage.getAll());
  useEffect(() => { load(); }, []);

  const filtered = invoices.filter(inv => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchSearch = !search || (inv.clientName + inv.invoiceNumber).toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totals = {
    all: invoices.reduce((s, i) => s + (i.total || 0), 0),
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
    outstanding: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + (i.total || 0), 0),
  };

  return (
    <div className="p-5 sm:p-7 max-w-5xl mx-auto">
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="mint" onClick={() => { setEditInvoice(null); setShowForm(true); }} className="gap-1.5">
            <Plus size={15} /> New invoice
          </Button>
        }
      />

      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total invoiced', value: formatCurrency(totals.all), icon: Wallet, tone: 'accent' },
            { label: 'Paid', value: formatCurrency(totals.paid), icon: CheckCircle, tone: 'mint' },
            { label: 'Outstanding', value: formatCurrency(totals.outstanding), icon: AlertTriangle, tone: 'peach' },
          ].map(({ label, value, icon, tone }) => (
            <ClayCard key={label} flat className="p-4 flex items-center gap-3.5">
              <IconTile icon={icon} tone={tone} size="sm" />
              <div>
                <p className="text-base font-bold text-ink">{value}</p>
                <p className="text-xs text-muted">{label}</p>
              </div>
            </ClayCard>
          ))}
        </div>
      )}

      {invoices.length > 0 && (
        <div className="flex flex-col gap-3 mb-5">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <Input className="pl-11" placeholder="Search by client or invoice number…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', ...STATUSES].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  filterStatus === s ? 'border-transparent text-ink' : 'border-line text-muted hover:text-ink'
                }`}
                style={filterStatus === s ? { background: 'var(--c-surface)', boxShadow: 'var(--clay-soft)' } : undefined}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <ClayCard flat>
          <EmptyState
            icon={Receipt}
            title={invoices.length === 0 ? 'No invoices yet' : 'No matching invoices'}
            description={invoices.length === 0
              ? 'Create a professional invoice with automatic totals and tax. No AI required.'
              : 'Try adjusting your search or filters.'}
            action={invoices.length === 0 && (
              <Button variant="mint" onClick={() => setShowForm(true)} className="gap-1.5">
                <Plus size={15} /> Create first invoice
              </Button>
            )}
          />
        </ClayCard>
      ) : (
        <div className="space-y-4">
          {filtered.map(inv => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              onEdit={(inv) => { setEditInvoice(inv); setShowForm(true); }}
              onDelete={setDeleteId}
              onDuplicate={(id) => { invoiceStorage.duplicate(id); load(); }}
              onStatusChange={(id, status) => { invoiceStorage.updateStatus(id, status); load(); }}
            />
          ))}
        </div>
      )}

      {showForm && (
        <InvoiceForm
          initial={editInvoice}
          onClose={() => { setShowForm(false); setEditInvoice(null); }}
          onSaved={load}
        />
      )}

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)} size="sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <IconTile icon={Trash2} tone="danger" size="sm" />
              <h3 className="text-ink font-semibold">Delete invoice?</h3>
            </div>
            <p className="text-muted text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => { invoiceStorage.delete(deleteId); load(); setDeleteId(null); }}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
