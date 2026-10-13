import { useState, useEffect } from 'react';
import {
  Plus, Receipt, Trash2, Copy, Edit3, Printer,
  X, Save, ChevronDown, CheckCircle, Clock, AlertTriangle,
  Send, FileText
} from 'lucide-react';
import { invoiceStorage } from '../services/storage';

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
  draft: { label: 'Draft', icon: FileText, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  sent: { label: 'Sent', icon: Send, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  paid: { label: 'Paid', icon: CheckCircle, bg: 'bg-green-500/10 text-green-400 border-green-500/20' },
  overdue: { label: 'Overdue', icon: AlertTriangle, bg: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

function StatusBadge({ status, small = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${cfg.bg}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

const EMPTY_ITEM = { description: '', qty: '1', unitPrice: '' };
const EMPTY_INVOICE = {
  invoiceNumber: genInvoiceNumber(),
  businessName: '',
  businessEmail: '',
  businessAddress: '',
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'USD',
  taxRate: '',
  paymentInstructions: '',
  notes: '',
  items: [{ ...EMPTY_ITEM }],
  status: 'draft',
};

function InvoiceForm({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_INVOICE,
    invoiceNumber: genInvoiceNumber(),
    ...(initial || {}),
    items: initial?.items?.length ? initial.items : [{ ...EMPTY_ITEM }],
  }));

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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 overflow-y-auto p-4">
      <div className="w-full max-w-3xl bg-[#0f172a] border border-[#334155] rounded-2xl my-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              {initial ? 'Edit Invoice' : 'New Invoice'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invoice Number + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Invoice Number</label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={e => set('invoiceNumber', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              >
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Issue Date</label>
              <input type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
            </div>
          </div>

          {/* Business / Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">From</p>
              {[
                { key: 'businessName', placeholder: 'Your Name / Company' },
                { key: 'businessEmail', placeholder: 'your@email.com' },
                { key: 'businessAddress', placeholder: 'Address (optional)' },
              ].map(({ key, placeholder }) => (
                <input key={key} type="text" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" />
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bill To</p>
              {[
                { key: 'clientName', placeholder: 'Client Name / Company' },
                { key: 'clientEmail', placeholder: 'client@email.com' },
                { key: 'clientAddress', placeholder: 'Client Address (optional)' },
              ].map(({ key, placeholder }) => (
                <input key={key} type="text" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
                  className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50" />
              ))}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line Items</label>
              <select
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
                className="bg-[#1e293b] border border-[#334155] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-2">
                <span className="col-span-6 text-xs text-slate-500">Description</span>
                <span className="col-span-2 text-xs text-slate-500 text-center">Qty</span>
                <span className="col-span-3 text-xs text-slate-500">Unit Price</span>
                <span className="col-span-1" />
              </div>
              {form.items.map((item, i) => {
                const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitPrice) || 0);
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      value={item.description}
                      onChange={e => setItem(i, 'description', e.target.value)}
                      placeholder={`Service or item ${i + 1}`}
                      className="col-span-6 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <input
                      type="number"
                      value={item.qty}
                      onChange={e => setItem(i, 'qty', e.target.value)}
                      min="0"
                      className="col-span-2 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-emerald-500/50"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => setItem(i, 'unitPrice', e.target.value)}
                      placeholder="0.00"
                      min="0"
                      className="col-span-3 bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button onClick={() => removeItem(i)} className="col-span-1 p-1.5 text-slate-600 hover:text-red-400 flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                    {lineTotal > 0 && (
                      <div className="col-span-12 text-right text-xs text-slate-500 -mt-1 pr-8">
                        = {formatCurrency(lineTotal, form.currency)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={13} /> Add Line Item
            </button>
          </div>

          {/* Tax + Totals */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Tax Rate (%)</label>
              <input
                type="number"
                value={form.taxRate}
                onChange={e => set('taxRate', e.target.value)}
                placeholder="0"
                min="0" max="100"
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span><span className="text-slate-300">{formatCurrency(subtotal, form.currency)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tax ({form.taxRate}%)</span><span className="text-slate-300">{formatCurrency(tax, form.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold border-t border-[#334155] pt-1.5">
                <span className="text-slate-200">Total</span><span className="text-white">{formatCurrency(total, form.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment + Notes */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Instructions</label>
              <textarea
                value={form.paymentInstructions}
                onChange={e => set('paymentInstructions', e.target.value)}
                placeholder="Bank transfer to: Account 1234... / PayPal: email@example.com"
                rows={2}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Thank you for your business!"
                rows={2}
                className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-[#1e293b]">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 border border-[#334155] hover:border-[#475569] hover:text-slate-200 rounded-xl transition-colors"
            >
              <Printer size={14} /> Print / PDF
            </button>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save size={14} /> Save Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvoiceCard({ invoice, onEdit, onDelete, onDuplicate, onStatusChange }) {
  return (
    <div className="bg-[#1e293b]/60 border border-[#334155] rounded-xl p-4 hover:border-[#475569] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-500">{invoice.invoiceNumber}</span>
            <StatusBadge status={invoice.status} />
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {invoice.clientName || 'Unnamed Client'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {invoice.issueDate && `Issued ${invoice.issueDate}`}
            {invoice.dueDate && ` · Due ${invoice.dueDate}`}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-white">{formatCurrency(invoice.total, invoice.currency)}</p>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <button onClick={() => onEdit(invoice)} className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors" title="Edit">
              <Edit3 size={13} />
            </button>
            <button onClick={() => onDuplicate(invoice.id)} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors" title="Duplicate">
              <Copy size={13} />
            </button>
            <button onClick={() => onDelete(invoice.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
      {/* Quick status change */}
      <div className="mt-3 flex gap-1.5 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => onStatusChange(invoice.id, s)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              invoice.status === s
                ? STATUS_CONFIG[s].bg
                : 'border-[#334155] text-slate-600 hover:text-slate-400'
            }`}
          >
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>
    </div>
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Invoices</h1>
          <p className="text-slate-400 text-sm">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditInvoice(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus size={15} /> New Invoice
        </button>
      </div>

      {/* Summary */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Invoiced', value: formatCurrency(totals.all), color: 'text-white' },
            { label: 'Paid', value: formatCurrency(totals.paid), color: 'text-green-400' },
            { label: 'Outstanding', value: formatCurrency(totals.outstanding), color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#1e293b]/40 border border-[#334155] rounded-xl p-4 text-center">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by client or invoice number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
          />
          <div className="flex gap-2">
            {['all', ...STATUSES].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  filterStatus === s
                    ? 'bg-[#1e293b] border-[#475569] text-white'
                    : 'border-[#1e293b] text-slate-500 hover:text-slate-300'
                }`}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-[#1e293b] flex items-center justify-center mx-auto mb-5">
            <Receipt size={24} className="text-slate-600" />
          </div>
          <h2 className="text-white font-semibold mb-2">
            {invoices.length === 0 ? 'No invoices yet' : 'No matching invoices'}
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            {invoices.length === 0
              ? 'Create a professional invoice with automatic calculations. No AI required.'
              : 'Try adjusting your filters.'}
          </p>
          {invoices.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors mx-auto"
            >
              <Plus size={15} /> Create First Invoice
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-white font-semibold mb-2">Delete Invoice?</h3>
            <p className="text-slate-400 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
              <button onClick={() => { invoiceStorage.delete(deleteId); load(); setDeleteId(null); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
