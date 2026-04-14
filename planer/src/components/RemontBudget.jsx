import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { TabSkeleton } from './TabSkeleton';
import {
  Hammer, Plus, X, Pencil, Trash2, ChevronRight,
  Wallet, Snowflake, PiggyBank, CircleDollarSign,
  ExternalLink, Check, AlertTriangle, Send, Loader2,
  Lightbulb, Link2, ArrowRight, Bookmark,
} from 'lucide-react';
import { budgetParser } from '@/lib/budgetParser';

const STATUS_CONFIG = {
  inspiration: { label: 'Inspiracja', emoji: '\u{1F4A1}', bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  planned:     { label: 'Planowany',  emoji: '\u{1F4CB}', bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/30' },
  realized:    { label: 'Kupiony',    emoji: '\u{2705}',   bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  needs_review:{ label: 'Weryfikacja',emoji: '\u{26A0}\u{FE0F}',  bg: 'bg-rose-500/15',   text: 'text-rose-400',   border: 'border-rose-500/30' },
};

const STATUS_TABS = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'inspiration', label: 'Inspiracje' },
  { id: 'planned', label: 'Planowane' },
  { id: 'realized', label: 'Zrealizowane' },
  { id: 'needs_review', label: 'Do weryfikacji' },
];

const NEXT_STATUS = {
  inspiration: 'planned',
  planned: 'realized',
  needs_review: 'planned',
};

const fmt = (n) => {
  if (n == null) return '0';
  return Number(n).toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// ─── Budget Fear Bar ───────────────────────────────────────────
const FearBar = ({ budget, spent, frozen, onEditBudget }) => {
  const free = Math.max(0, budget - spent - frozen);
  const pctSpent  = budget > 0 ? (spent / budget) * 100 : 0;
  const pctFrozen = budget > 0 ? (frozen / budget) * 100 : 0;
  const pctFree   = budget > 0 ? (free / budget) * 100 : 0;
  const isFear    = budget > 0 && pctFree < 10;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(budget));

  const save = () => {
    const val = parseInt(draft, 10);
    if (val > 0) onEditBudget(val);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
      data-testid="fear-bar-section"
    >
      {/* Progress bar */}
      <div className={`expense-card p-5 ${isFear ? 'fear-pulse' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.15em] text-[#475569] font-medium">Pasek budżetu</p>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                className="w-32 bg-[#0B0E14] border border-amber-500/30 rounded px-2 py-1 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500"
                autoFocus
                data-testid="budget-edit-input"
              />
              <button onClick={save} className="text-amber-400 hover:text-amber-300 text-xs font-medium" data-testid="budget-edit-save">OK</button>
              <button onClick={() => setEditing(false)} className="text-[#475569] hover:text-[#94A3B8] text-xs" data-testid="budget-edit-cancel">Anuluj</button>
            </div>
          ) : (
            <button
              onClick={() => { setDraft(String(budget)); setEditing(true); }}
              className="text-amber-400 text-sm font-semibold hover:underline cursor-pointer"
              data-testid="budget-total-clickable"
            >
              Budżet: {fmt(budget)} zł
            </button>
          )}
        </div>

        <div className="w-full h-4 rounded-full bg-[#0B0E14] overflow-hidden flex" data-testid="budget-progress-bar">
          <motion.div
            className="h-full bg-rose-500"
            initial={{ width: 0 }}
            animate={{ width: `${pctSpent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${pctFrozen}%` }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          />
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pctFree}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile icon={CircleDollarSign} label="Całkowity budżet" value={fmt(budget)} color="amber" delay={0} />
        <StatTile icon={Wallet}            label="Wydane"          value={fmt(spent)}  color="rose"  delay={0.05} />
        <StatTile icon={Snowflake}         label="Zamrożone"       value={fmt(frozen)} color="amber-warn" delay={0.1} />
        <StatTile icon={PiggyBank}         label="Wolne"           value={fmt(free)}   color="emerald" delay={0.15} />
      </div>
    </motion.div>
  );
};

const TILE_COLORS = {
  amber:      { text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   glow: 'stat-glow-amber' },
  rose:       { text: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    glow: 'stat-glow-red' },
  'amber-warn':{ text: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   glow: 'stat-glow-amber' },
  emerald:    { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'stat-glow-green' },
};

const StatTile = ({ icon: Icon, label, value, color, delay }) => {
  const c = TILE_COLORS[color] || TILE_COLORS.amber;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`expense-card ${c.glow} p-5 flex flex-col gap-3`}
      data-testid={`remont-stat-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className={`${c.bg} ${c.border} border rounded-lg p-2.5 self-start`}>
        <Icon className={`w-4 h-4 ${c.text}`} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-[#475569] font-medium mb-1.5">{label}</p>
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${c.text}`}>
          {value}<span className="text-sm font-normal text-[#475569] ml-1">zł</span>
        </p>
      </div>
    </motion.div>
  );
};

// ─── Status Badge ──────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.planned;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${cfg.bg} ${cfg.text} ${cfg.border} border`} data-testid={`status-badge-${status}`}>
      {cfg.emoji} {cfg.label}
    </span>
  );
};

// ─── Lifecycle Indicator ──────────────────────────────────────
const LIFECYCLE_STEPS = [
  { status: 'inspiration', emoji: '\u{1F4A1}', label: 'Inspiracja' },
  { status: 'planned',     emoji: '\u{1F4CB}', label: 'Planowany' },
  { status: 'realized',    emoji: '\u{2705}',   label: 'Kupiony' },
];

const LifecycleIndicator = ({ currentStatus }) => {
  const currentIdx = LIFECYCLE_STEPS.findIndex(s => s.status === currentStatus);
  return (
    <div className="flex items-center gap-0.5 text-[10px]">
      {LIFECYCLE_STEPS.map((step, idx) => {
        const isActive = idx <= currentIdx && currentIdx >= 0;
        const isCurrent = step.status === currentStatus;
        return (
          <span key={step.status} className="flex items-center gap-0.5">
            {idx > 0 && <ArrowRight className={`w-2.5 h-2.5 ${isActive ? 'text-amber-500/60' : 'text-[#475569]/40'}`} />}
            <span className={`${isCurrent ? 'text-amber-400 font-semibold' : isActive ? 'text-[#94A3B8]' : 'text-[#475569]/50'}`}>
              {step.emoji}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ─── Item Row ──────────────────────────────────────────────────
const ItemRow = ({ item, rooms, expenseTypes, onEdit, onDelete, onStatusChange, isHighlighted }) => {
  const room = rooms.find(r => r.id === item.room_id);
  const type = expenseTypes.find(t => t.id === item.expense_type_id);
  const amount = item.status === 'realized' && item.final_amount != null ? item.final_amount : item.estimated_amount;
  const nextStatus = NEXT_STATUS[item.status];
  const nextLabel = nextStatus ? STATUS_CONFIG[nextStatus]?.label : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{
        opacity: 1,
        x: 0,
        backgroundColor: isHighlighted ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0,0,0,0)',
      }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="flex items-center gap-4 p-4 rounded-lg bg-[#151A23] border border-white/5 hover:border-amber-500/20 transition-colors duration-300 group"
      data-testid={`remont-item-${item.id}`}
    >
      {/* Room icon */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 flex-shrink-0 text-lg">
        {room?.icon || '\u{1F3E0}'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F8FAFC] truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {room && <span className="text-xs text-[#475569]">{room.icon} {room.name}</span>}
          {type && <span className="text-xs text-[#475569]">&middot; {type.icon} {type.name}</span>}
          {item.source_url && (
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
              onClick={(e) => e.stopPropagation()}
            >
              <Link2 className="w-3 h-3" />
              {(() => { try { return new URL(item.source_url).hostname.replace(/^www\./, ''); } catch { return 'link'; } })()}
            </a>
          )}
        </div>
        {/* Lifecycle indicator */}
        {item.status !== 'needs_review' && (
          <div className="mt-1">
            <LifecycleIndicator currentStatus={item.status} />
          </div>
        )}
      </div>

      {/* Status badge */}
      <StatusBadge status={item.status} />

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-[#F8FAFC]">{fmt(amount)} zł</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
        {nextStatus && (
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(item); }}
            className="relative p-1.5 rounded hover:bg-amber-500/10 text-amber-400 group/advance"
            title={`Przenie\u015B do: ${nextLabel}`}
            data-testid={`status-advance-${item.id}`}
          >
            <ChevronRight className="w-4 h-4" />
            {/* Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded text-[10px] font-medium bg-[#0B0E14] border border-white/10 text-[#F8FAFC] whitespace-nowrap opacity-0 group-hover/advance:opacity-100 transition-opacity pointer-events-none">
              Przenie\u015B do: {nextLabel}
            </span>
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(item); }}
          className="p-1.5 rounded hover:bg-blue-500/10 text-blue-400"
          title="Edytuj"
          data-testid={`edit-item-${item.id}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          className="p-1.5 rounded hover:bg-rose-500/10 text-rose-400"
          title="Usu\u0144"
          data-testid={`delete-item-${item.id}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

// ─── Item Form Modal ───────────────────────────────────────────
const ItemFormModal = ({ isOpen, onClose, onSave, rooms, expenseTypes, editingItem }) => {
  const isEdit = !!editingItem;
  const [form, setForm] = useState({
    name: '', estimated_amount: '', room_id: '', expense_type_id: '',
    status: 'planned', source_url: '', notes: '',
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || '',
        estimated_amount: editingItem.estimated_amount || '',
        room_id: editingItem.room_id || '',
        expense_type_id: editingItem.expense_type_id || '',
        status: editingItem.status || 'planned',
        source_url: editingItem.source_url || '',
        notes: editingItem.notes || '',
      });
    } else {
      setForm({ name: '', estimated_amount: '', room_id: rooms[0]?.id || '', expense_type_id: expenseTypes[0]?.id || '', status: 'planned', source_url: '', notes: '' });
    }
  }, [editingItem, isOpen, rooms, expenseTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.estimated_amount) return;
    onSave({
      ...form,
      estimated_amount: parseFloat(form.estimated_amount),
      room_id: form.room_id || null,
      expense_type_id: form.expense_type_id || null,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg bg-[#151A23] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          data-testid="item-form-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">
              {isEdit ? 'Edytuj wydatek' : 'Nowy wydatek'}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 text-[#475569]" data-testid="close-modal-btn">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4" data-testid="item-form">
            {/* Name */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Nazwa *</label>
              <input
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500/50"
                placeholder="np. Płytki łazienkowe"
                required
                data-testid="input-name"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Kwota (zł) *</label>
              <input
                type="number"
                value={form.estimated_amount}
                onChange={(e) => setForm(p => ({ ...p, estimated_amount: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500/50"
                placeholder="0"
                min="0"
                step="0.01"
                required
                data-testid="input-amount"
              />
            </div>

            {/* Room & Type row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Pomieszczenie</label>
                <select
                  value={form.room_id}
                  onChange={(e) => setForm(p => ({ ...p, room_id: e.target.value }))}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  data-testid="select-room"
                >
                  <option value="">-- Wybierz --</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Typ wydatku</label>
                <select
                  value={form.expense_type_id}
                  onChange={(e) => setForm(p => ({ ...p, expense_type_id: e.target.value }))}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  data-testid="select-expense-type"
                >
                  <option value="">-- Wybierz --</option>
                  {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500"
                data-testid="select-status"
              >
                <option value="planned">Planowany</option>
                <option value="realized">Zrealizowany</option>
                <option value="inspiration">Inspiracja</option>
                <option value="needs_review">Do weryfikacji</option>
              </select>
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Link (opcjonalnie)</label>
              <input
                value={form.source_url}
                onChange={(e) => setForm(p => ({ ...p, source_url: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500/50"
                placeholder="https://..."
                data-testid="input-url"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Notatki (opcjonalnie)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500/50 resize-none"
                placeholder="Dodatkowe informacje..."
                data-testid="input-notes"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-semibold text-sm transition-colors duration-200"
              data-testid="submit-item-btn"
            >
              {isEdit ? 'Zapisz zmiany' : 'Dodaj wydatek'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Final Amount Popup ────────────────────────────────────────
const FinalAmountPopup = ({ isOpen, onClose, onConfirm, item }) => {
  const [finalAmount, setFinalAmount] = useState('');

  useEffect(() => {
    if (item) setFinalAmount(String(item.estimated_amount || ''));
  }, [item]);

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#151A23] border border-white/10 rounded-xl shadow-2xl p-5"
          data-testid="final-amount-popup"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">Ostateczna kwota</h3>
          <p className="text-sm text-[#94A3B8] mb-4">
            Podaj finalną kwotę za <span className="text-amber-400 font-medium">{item.name}</span>:
          </p>
          <input
            type="number"
            value={finalAmount}
            onChange={(e) => setFinalAmount(e.target.value)}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500 mb-4"
            autoFocus
            min="0"
            step="0.01"
            data-testid="final-amount-input"
          />
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-[#94A3B8] text-sm hover:bg-white/5 transition-colors"
              data-testid="final-amount-cancel"
            >
              Anuluj
            </button>
            <button
              onClick={() => { onConfirm(parseFloat(finalAmount) || item.estimated_amount); }}
              className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-semibold text-sm transition-colors"
              data-testid="final-amount-confirm"
            >
              Potwierdź
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Estimated Amount Popup (inspiration → planned) ───────────
const EstimatedAmountPopup = ({ isOpen, onClose, onConfirm, item }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (item) setAmount('');
  }, [item]);

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#151A23] border border-white/10 rounded-xl shadow-2xl p-5"
          data-testid="estimated-amount-popup"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">Szacowana kwota</h3>
          <p className="text-sm text-[#94A3B8] mb-4">
            Podaj szacowan{'\u0105'} kwot{'\u0119'} za <span className="text-violet-400 font-medium">{item.name}</span> aby zaplanowa{'\u0107'}:
          </p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-violet-500 mb-4"
            autoFocus
            min="0"
            step="0.01"
            placeholder="Kwota w z\u0142"
            data-testid="estimated-amount-input"
          />
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-[#94A3B8] text-sm hover:bg-white/5 transition-colors"
              data-testid="estimated-amount-cancel"
            >
              Anuluj
            </button>
            <button
              onClick={() => { onConfirm(parseFloat(amount) || 0); }}
              disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 py-2 rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
              data-testid="estimated-amount-confirm"
            >
              Zaplanuj
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Inspiration Shelf ────────────────────────────────────────
const InspirationShelf = ({ items, rooms, expenseTypes, onPlan, onDelete }) => {
  const inspirations = items.filter(i => i.status === 'inspiration');

  if (inspirations.length === 0) return null;

  const withLink = inspirations.filter(i => i.source_url);
  const totalEstimated = inspirations.reduce((s, i) => s + (i.estimated_amount ?? 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="expense-card p-6 border-violet-500/20"
      data-testid="inspiration-shelf"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-2.5">
            <Bookmark className="w-5 h-5 text-violet-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Schowek na inspiracje</h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-[#94A3B8]">{inspirations.length} inspiracji</span>
              {withLink.length > 0 && (
                <span className="text-xs text-violet-400">{withLink.length} z linkiem</span>
              )}
              {totalEstimated > 0 && (
                <span className="text-xs text-[#94A3B8]">{'\u2248'} {fmt(totalEstimated)} z{'\u0142'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {inspirations.map(item => {
            const room = rooms.find(r => r.id === item.room_id);
            const type = expenseTypes.find(t => t.id === item.expense_type_id);
            let domain = null;
            if (item.source_url) {
              try { domain = new URL(item.source_url).hostname.replace(/^www\./, ''); } catch { domain = 'link'; }
            }

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-lg bg-[#0B0E14] border border-violet-500/15 hover:border-violet-500/30 p-4 flex flex-col gap-3 transition-colors duration-200"
                data-testid={`inspiration-card-${item.id}`}
              >
                {/* Name */}
                <p className="text-sm font-medium text-[#F8FAFC] truncate">{item.name}</p>

                {/* URL link */}
                {domain && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 truncate"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {domain}
                  </a>
                )}

                {/* Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {room && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {room.icon} {room.name}
                    </span>
                  )}
                  {type && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {type.icon} {type.name}
                    </span>
                  )}
                </div>

                {/* Amount */}
                {item.estimated_amount != null && item.estimated_amount > 0 && (
                  <p className="text-xs text-[#94A3B8]">{'\u2248'} {fmt(item.estimated_amount)} z{'\u0142'}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  <button
                    onClick={() => onPlan(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 text-xs font-medium transition-colors border border-violet-500/20"
                    data-testid={`plan-inspiration-${item.id}`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    Zaplanuj
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400/60 hover:text-rose-400 text-xs transition-colors"
                    data-testid={`delete-inspiration-${item.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Delete Confirmation ───────────────────────────────────────
const DeleteConfirm = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#151A23] border border-white/10 rounded-xl shadow-2xl p-5"
          data-testid="delete-confirm-popup"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Usunąć?</h3>
          </div>
          <p className="text-sm text-[#94A3B8] mb-5">
            Czy na pewno chcesz usunąć <span className="text-[#F8FAFC] font-medium">{itemName}</span>? Tej akcji nie można cofnąć.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-[#94A3B8] text-sm hover:bg-white/5 transition-colors" data-testid="delete-cancel-btn">Anuluj</button>
            <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-colors" data-testid="delete-confirm-btn">Usuń</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Bot Input ────────────────────────────────────────────────
const BotInput = ({ rooms, expenseTypes, keywordHints, onItemAdded }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'warning', message: string }

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const parsed = budgetParser(trimmed, rooms, expenseTypes, keywordHints);
      const created = await onItemAdded({
        name: parsed.name,
        estimated_amount: parsed.estimated_amount,
        room_id: parsed.room_id,
        expense_type_id: parsed.expense_type_id,
        status: parsed.status,
        confidence: parsed.confidence,
        source_text: parsed.source_text,
        source_url: parsed.source_url,
      });

      if (created) {
        const room = rooms.find(r => r.id === parsed.room_id);
        const type = expenseTypes.find(t => t.id === parsed.expense_type_id);

        if (parsed.source_url) {
          setToast({ type: 'success', message: `Dodano inspirację: ${parsed.name}` });
        } else if (parsed.confidence >= 0.65) {
          const parts = [`Dodano: ${parsed.name}`];
          if (parsed.estimated_amount != null) parts.push(`${fmt(parsed.estimated_amount)} zł`);
          if (room) parts.push(`${room.icon} ${room.name}`);
          if (type) parts.push(`${type.icon} ${type.name}`);
          setToast({ type: 'success', message: parts.join(' — ') });
        } else {
          const parts = [`Dodano do weryfikacji: ${parsed.name}`];
          if (parsed.estimated_amount == null) parts.push('brak kwoty');
          setToast({ type: 'warning', message: parts.join(' — ') });
        }
        setText('');
      }
    } finally {
      setSending(false);
    }
  };

  // Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-2"
      data-testid="bot-input-section"
    >
      <div className="expense-card p-4">
        <p className="text-xs uppercase tracking-[0.15em] text-[#475569] font-medium mb-3">Szybkie dodawanie</p>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Wpisz wydatek, np. 'Płytki łazienka 1500' lub wklej link do inspiracji"
            className="flex-1 bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500/50"
            disabled={sending}
            data-testid="bot-text-input"
          />
          <button
            onClick={handleSubmit}
            disabled={sending || !text.trim()}
            className="px-4 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0E14] font-semibold text-sm transition-colors duration-200 flex items-center gap-2"
            data-testid="bot-send-btn"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-lg px-4 py-3 text-sm font-medium border ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
            data-testid="bot-toast"
          >
            {toast.type === 'success' ? '\u2705 ' : '\u26A0\uFE0F '}{toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ─── MAIN COMPONENT ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
export const RemontBudget = () => {
  const {
    fetchBudgetConfig, updateBudgetConfig,
    fetchRooms, fetchExpenseTypes, fetchKeywordHints,
    fetchItems, createItem, updateItem, deleteItem,
    ensureAuth,
  } = useSupabase();

  const [isLoading, setIsLoading] = useState(true);
  const [budgetConfig, setBudgetConfig] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [keywordHints, setKeywordHints] = useState([]);
  const [items, setItems] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [statusChangeItem, setStatusChangeItem] = useState(null);
  const [estimatedAmountItem, setEstimatedAmountItem] = useState(null);
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  // ─── Load data ──────
  const loadAll = useCallback(async () => {
    await ensureAuth();
    const [cfg, r, et, kh, it] = await Promise.all([
      fetchBudgetConfig(), fetchRooms(), fetchExpenseTypes(), fetchKeywordHints(), fetchItems(),
    ]);
    setBudgetConfig(cfg);
    setRooms(r);
    setExpenseTypes(et);
    setKeywordHints(kh);
    setItems(it);
    setIsLoading(false);
  }, [ensureAuth, fetchBudgetConfig, fetchRooms, fetchExpenseTypes, fetchKeywordHints, fetchItems]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Computed values ──────
  const budget = budgetConfig?.total_budget || 0;

  const spent = useMemo(() =>
    items.filter(i => i.status === 'realized').reduce((s, i) => s + (i.final_amount ?? i.estimated_amount ?? 0), 0)
  , [items]);

  const frozen = useMemo(() =>
    items.filter(i => i.status === 'planned').reduce((s, i) => s + (i.estimated_amount ?? 0), 0)
  , [items]);

  // ─── Filtered items ──────
  const filtered = useMemo(() => {
    let list = items;
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter);
    if (roomFilter !== 'all') list = list.filter(i => i.room_id === roomFilter);
    if (typeFilter !== 'all') list = list.filter(i => i.expense_type_id === typeFilter);
    return list;
  }, [items, statusFilter, roomFilter, typeFilter]);

  // ─── Handlers ──────
  const handleBotAdd = async (itemData) => {
    const created = await createItem(itemData);
    if (created) setItems(prev => [created, ...prev]);
    return created;
  };

  const handleEditBudget = async (val) => {
    await updateBudgetConfig(val, budgetConfig?.id);
    setBudgetConfig(prev => ({ ...prev, total_budget: val }));
  };

  const handleSaveItem = async (formData) => {
    if (editingItem) {
      const updated = await updateItem(editingItem.id, formData);
      if (updated) setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i));
    } else {
      const created = await createItem(formData);
      if (created) setItems(prev => [created, ...prev]);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const ok = await deleteItem(deletingItem.id);
    if (ok) setItems(prev => prev.filter(i => i.id !== deletingItem.id));
    setDeletingItem(null);
  };

  const handleStatusChange = (item) => {
    const next = NEXT_STATUS[item.status];
    if (!next) return;
    // planned → realized needs final amount popup
    if (item.status === 'planned' && next === 'realized') {
      setStatusChangeItem(item);
    } else if (item.status === 'inspiration' && next === 'planned' && item.estimated_amount == null) {
      // inspiration → planned needs estimated amount if missing
      setEstimatedAmountItem(item);
    } else {
      // Direct status change
      advanceStatus(item, next, null);
    }
  };

  // Plan inspiration (from shelf or list)
  const handlePlanInspiration = (item) => {
    if (item.estimated_amount == null) {
      setEstimatedAmountItem(item);
    } else {
      advanceStatus(item, 'planned', null);
    }
  };

  const advanceStatus = async (item, newStatus, finalAmount) => {
    const changes = { status: newStatus };
    if (finalAmount != null) changes.final_amount = finalAmount;
    const updated = await updateItem(item.id, changes);
    if (updated) {
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
      // Flash highlight
      setHighlightedItemId(updated.id);
      setTimeout(() => setHighlightedItemId(null), 1500);
    }
  };

  const handleFinalAmountConfirm = (amount) => {
    if (statusChangeItem) {
      advanceStatus(statusChangeItem, 'realized', amount);
    }
    setStatusChangeItem(null);
  };

  const handleEstimatedAmountConfirm = async (amount) => {
    if (estimatedAmountItem) {
      const changes = { status: 'planned', estimated_amount: amount };
      const updated = await updateItem(estimatedAmountItem.id, changes);
      if (updated) {
        setItems(prev => prev.map(i => i.id === estimatedAmountItem.id ? updated : i));
        setHighlightedItemId(updated.id);
        setTimeout(() => setHighlightedItemId(null), 1500);
      }
    }
    setEstimatedAmountItem(null);
  };

  if (isLoading) return <TabSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], exit: { duration: 0.12 } }}
      className="space-y-6"
      data-testid="remont-budget-tab"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full bg-amber-500" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Remont
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">Budżet wykończenia mieszkania</p>
        </div>
      </div>
      <div className="accent-line-amber" />

      {/* Bot Input */}
      <BotInput
        rooms={rooms}
        expenseTypes={expenseTypes}
        keywordHints={keywordHints}
        onItemAdded={handleBotAdd}
      />

      {/* A) Fear Bar */}
      <FearBar budget={budget} spent={spent} frozen={frozen} onEditBudget={handleEditBudget} />

      {/* B) Items list */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="expense-card p-6"
        data-testid="items-list-section"
      >
        {/* List header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Lista wydatków</h3>
            <p className="text-xs text-[#475569]">{filtered.length} z {items.length} pozycji</p>
          </div>
          <button
            onClick={() => { setEditingItem(null); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0B0E14] font-semibold text-sm transition-colors duration-200"
            data-testid="add-item-btn"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* Room filter */}
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500"
            data-testid="filter-room"
          >
            <option value="all">Wszystkie pokoje</option>
            {rooms.map(r => <option key={r.id} value={r.id}>{r.icon} {r.name}</option>)}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-amber-500"
            data-testid="filter-type"
          >
            <option value="all">Wszystkie typy</option>
            {expenseTypes.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </select>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1" data-testid="status-filter-tabs">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-200 ${
                statusFilter === tab.id
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-[#475569] hover:text-[#94A3B8] hover:bg-white/5 border border-transparent'
              }`}
              data-testid={`status-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Hammer className="w-10 h-10 text-[#475569] mx-auto mb-3" />
                <p className="text-sm text-[#94A3B8]">Brak wydatków do wyświetlenia</p>
              </motion.div>
            ) : (
              filtered.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  rooms={rooms}
                  expenseTypes={expenseTypes}
                  onEdit={(it) => { setEditingItem(it); setShowForm(true); }}
                  onDelete={(it) => setDeletingItem(it)}
                  onStatusChange={handleStatusChange}
                  isHighlighted={highlightedItemId === item.id}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* B2) Inspiration Shelf */}
      <InspirationShelf
        items={items}
        rooms={rooms}
        expenseTypes={expenseTypes}
        onPlan={handlePlanInspiration}
        onDelete={(it) => setDeletingItem(it)}
      />

      {/* C) Quick-add / Edit Modal */}
      <ItemFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingItem(null); }}
        onSave={handleSaveItem}
        rooms={rooms}
        expenseTypes={expenseTypes}
        editingItem={editingItem}
      />

      {/* Final amount popup (planned → realized) */}
      <FinalAmountPopup
        isOpen={!!statusChangeItem}
        onClose={() => setStatusChangeItem(null)}
        onConfirm={handleFinalAmountConfirm}
        item={statusChangeItem}
      />

      {/* Estimated amount popup (inspiration → planned) */}
      <EstimatedAmountPopup
        isOpen={!!estimatedAmountItem}
        onClose={() => setEstimatedAmountItem(null)}
        onConfirm={handleEstimatedAmountConfirm}
        item={estimatedAmountItem}
      />

      {/* Delete confirmation */}
      <DeleteConfirm
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingItem?.name}
      />
    </motion.div>
  );
};
