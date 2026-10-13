import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Local className joiner (not exported to keep Fast Refresh happy).
const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ *
 *  Print portal
 *  Renders a clean, shadow-free document straight onto <body> so print/PDF
 *  output never includes the app chrome or claymorphism decorations.
 * ------------------------------------------------------------------ */
export function PrintPortal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div id="print-portal" className="print-only print-area">
      {children}
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ *
 *  Button
 * ------------------------------------------------------------------ */
export function Button({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  block = false,
  className = '',
  as: As = 'button',
  type = 'button',
  children,
  ...props
}) {
  const classes = cx(
    'btn',
    `btn-${variant}`,
    size === 'sm' && 'btn-sm',
    size === 'lg' && 'btn-lg',
    iconOnly && 'btn-icon',
    block && 'btn-block',
    className,
  );

  if (As === 'button') {
    return (
      <button type={type} className={classes} {...props}>
        {children}
      </button>
    );
  }
  return (
    <As className={classes} {...props}>
      {children}
    </As>
  );
}

/* ------------------------------------------------------------------ *
 *  Surfaces
 * ------------------------------------------------------------------ */
export function ClayCard({ as: As = 'div', interactive = false, flat = false, className = '', children, ...props }) {
  return (
    <As
      className={cx(flat ? 'clay-card-flat' : 'clay-card', interactive && 'clay-interactive', className)}
      {...props}
    >
      {children}
    </As>
  );
}

export function Panel({ className = '', children, ...props }) {
  return (
    <div className={cx('clay-panel', className)} {...props}>
      {children}
    </div>
  );
}

export function Sunken({ className = '', children, ...props }) {
  return (
    <div className={cx('clay-sunken', className)} {...props}>
      {children}
    </div>
  );
}

export function IconTile({ icon: Icon, size = 'md', tone = 'neutral', className = '' }) {
  const dims = size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 19;
  const toneClass = {
    neutral: '',
    accent: 'tile-accent',
    mint: 'tile-mint',
    peach: 'tile-peach',
    lav: 'tile-lav',
    danger: 'tile-danger',
  }[tone] || '';
  return (
    <span className={cx('clay-tile', toneClass, dims, className)}>
      <Icon size={iconSize} />
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Badge
 * ------------------------------------------------------------------ */
export function Badge({ tone = 'neutral', className = '', children, ...props }) {
  return (
    <span className={cx('clay-badge', `badge-${tone}`, className)} {...props}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 *  Form controls
 * ------------------------------------------------------------------ */
export function Field({ label, hint, error, htmlFor, required, className = '', children }) {
  return (
    <div className={className}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-hint text-danger mt-1.5">{error}</p>
      ) : hint ? (
        <p className="field-hint mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className = '', ...props }) {
  return <input className={cx('field', className)} {...props} />;
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={cx('field', className)} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={cx('field', className)} {...props}>
      {children}
    </select>
  );
}

/* ------------------------------------------------------------------ *
 *  Toggle (switch)
 * ------------------------------------------------------------------ */
export function Toggle({ checked, onChange, tone = 'accent', label, disabled = false, className = '' }) {
  const toneClass = { accent: '', mint: 'switch-mint', peach: 'switch-peach' }[tone] || '';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx('switch', toneClass, checked && 'switch-on', disabled && 'opacity-50 cursor-not-allowed', className)}
    >
      <span className="switch-knob" />
    </button>
  );
}

/* ------------------------------------------------------------------ *
 *  Segmented control
 * ------------------------------------------------------------------ */
export function Segmented({ options, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={cx('clay-segment', className)}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cx('clay-segment-btn', active && 'clay-segment-btn-active')}
          >
            {opt.icon && <opt.icon size={14} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Modal
 * ------------------------------------------------------------------ */
export function Modal({ onClose, children, size = 'md', className = '', labelledBy }) {
  const panelRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  }[size] || 'max-w-2xl';

  return (
    <div className="clay-modal-root fixed inset-0 z-50 overflow-y-auto">
      <div className="clay-overlay" onClick={onClose} aria-hidden="true" />
      <div className="relative flex min-h-full items-start justify-center p-4 sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy || titleId}
          className={cx('clay-modal w-full my-2 sm:my-6 animate-fade-in', maxW, className)}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({ icon: Icon, tone = 'accent', title, onClose, id }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-5 border-b border-line">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <IconTile icon={Icon} tone={tone} size="sm" />}
        <h2 id={id} className="text-base font-semibold text-ink truncate">{title}</h2>
      </div>
      <Button variant="ghost" iconOnly size="sm" onClick={onClose} aria-label="Close dialog">
        <X size={18} />
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Page layout helpers
 * ------------------------------------------------------------------ */
export function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={cx('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-7', className)}>
      <div>
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

export function SectionCard({ icon: Icon, tone = 'neutral', title, description, actions, children, className = '', bodyClassName = '' }) {
  return (
    <ClayCard flat className={className}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && <IconTile icon={Icon} tone={tone} size="sm" />}
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink truncate">{title}</h2>
            {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <div className={cx('p-5', bodyClassName)}>{children}</div>
    </ClayCard>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={cx('text-center py-14 px-6', className)}>
      <IconTile icon={Icon} tone="accent" size="lg" className="mx-auto mb-5" />
      <h3 className="text-ink font-semibold">{title}</h3>
      {description && <p className="text-muted text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
