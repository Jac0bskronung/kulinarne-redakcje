import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Zap, Shield, TrendingUp, Plus, X, Check, Wifi, Droplets, Flame, ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { StatCard } from './StatCard';
import { ExpenseCard } from './ExpenseCard';
import { TabSkeleton } from './TabSkeleton';

const EMPTY_MONTHLY_DATA = [];
const EMPTY_PIE_DATA = [];

const PIE_COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5', '#059669', '#047857', '#065F46'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="value">{payload[0].value} zł</p>
      </div>
    );
  }
  return null;
};

// ─── Month helpers ────────────────────────────────────────────
const MONTHS_PL = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];

const todayYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const prevYM = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
};

const nextYM = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
};

const labelYM = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_PL[m - 1]} ${y}`;
};

// ─── Category icon map ────────────────────────────────────────
const CATEGORY_ICONS = {
  'Czynsz': Building2,
  'Rata kredytu': CreditCard,
  'Internet': Wifi,
  'Ciepła woda': Droplets,
  'Gaz': Flame,
  'Prąd': Zap,
  'Zakupy spożywcze': ShoppingCart,
};

// ─── Fixed Cost Tile ──────────────────────────────────────────
const FixedCostTile = ({ name, currentAmount, prevAmount, onSave, delay }) => {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [saving, setSaving] = useState(false);

  const Icon = CATEGORY_ICONS[name] || Building2;

  const trend = (prevAmount != null && currentAmount != null && prevAmount > 0)
    ? ((currentAmount - prevAmount) / prevAmount * 100)
    : null;

  const startEdit = () => {
    setInputVal(currentAmount != null ? String(currentAmount) : '');
    setEditing(true);
  };

  const handleSave = async () => {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    try { await onSave(val); } finally { setSaving(false); }
    setEditing(false);
  };

  const fmt = (n) => Number(n).toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delay || 0 }}
      className="expense-card p-4"
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-emerald-400" />
        </div>
        {trend != null ? (
          <span className={`text-xs font-semibold ${trend > 0 ? 'text-red-400' : trend < 0 ? 'text-emerald-400' : 'text-[#475569]'}`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[10px] text-[#334155]">brak danych</span>
        )}
      </div>

      {/* Category label */}
      <p className="text-[11px] text-[#475569] uppercase tracking-wider mb-1.5 truncate">{name}</p>

      {/* Value / edit */}
      {editing ? (
        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
          <input
            autoFocus
            type="number"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 min-w-0 bg-[#0B0E14] border border-emerald-500/50 rounded-md px-2 py-1.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="0"
            min="0"
            step="0.01"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-2.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] disabled:opacity-40 flex-shrink-0"
          >
            {saving ? '…' : <Check className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setEditing(false)} className="px-2 py-1.5 rounded-md border border-white/10 text-[#475569] hover:bg-white/5 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button onClick={startEdit} className="text-left w-full group flex items-end gap-2">
          <span className={`text-2xl font-bold leading-none ${currentAmount != null ? 'text-emerald-400' : 'text-[#334155]'}`}>
            {currentAmount != null ? `${fmt(currentAmount)} zł` : '— zł'}
          </span>
          <Pencil className="w-3 h-3 text-[#334155] group-hover:text-[#475569] mb-0.5 transition-colors flex-shrink-0" />
        </button>
      )}
    </motion.div>
  );
};

// ─── Expense Form Modal ────────────────────────────────────────
const getToday = () => new Date().toISOString().split('T')[0];

const ExpenseFormModal = ({ isOpen, onClose, onSave, editingExpense, categories, onAddCategory }) => {
  const isEdit = !!editingExpense;

  const [form, setForm] = useState({
    description: '',
    amount: '',
    subcategory: '',
    date: getToday(),
  });
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        description: editingExpense.title || '',
        amount: editingExpense.amount != null ? String(editingExpense.amount) : '',
        subcategory: editingExpense.note || '',
        date: editingExpense.date ? editingExpense.date.split('T')[0] : getToday(),
      });
    } else {
      setForm({ description: '', amount: '', subcategory: '', date: getToday() });
    }
    setShowCustomInput(false);
    setCustomInput('');
  }, [editingExpense, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    onSave({
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      subcategory: form.subcategory.trim(),
      date: form.date,
    });
  };

  const handleAddCustom = async () => {
    const name = customInput.trim();
    if (!name) return;
    setSavingCustom(true);
    try {
      await onAddCategory(name);
      setForm(p => ({ ...p, subcategory: name }));
      setShowCustomInput(false);
      setCustomInput('');
    } finally {
      setSavingCustom(false);
    }
  };

  // Group categories by group_name
  const groups = categories.reduce((acc, cat) => {
    const g = cat.group_name || 'Inne';
    if (!acc[g]) acc[g] = [];
    acc[g].push(cat);
    return acc;
  }, {});

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
          className="relative w-full max-w-md bg-[#151A23] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          data-testid="expense-form-modal"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 flex-shrink-0">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">
              {isEdit ? 'Edytuj wydatek' : 'Nowy wydatek'}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/5 text-[#475569]"
              data-testid="close-expense-modal-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form — scrollable */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto" data-testid="expense-form">
            {/* Description */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Nazwa *</label>
              <input
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50"
                placeholder="np. Czynsz za styczeń"
                required
                data-testid="input-expense-description"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Kwota (zł) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50"
                placeholder="0"
                min="0"
                step="0.01"
                required
                data-testid="input-expense-amount"
              />
            </div>

            {/* Category selector */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-2 uppercase tracking-wider">Kategoria</label>
              {Object.entries(groups).map(([groupName, cats]) => (
                <div key={groupName} className="mb-3">
                  <p className="text-[10px] text-[#475569] uppercase tracking-widest mb-1.5">{groupName}</p>
                  <div className="flex flex-wrap gap-2">
                    {cats.map(cat => {
                      const selected = form.subcategory === cat.name;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, subcategory: selected ? '' : cat.name }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                            selected
                              ? 'bg-emerald-500 text-[#0B0E14]'
                              : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 inline mr-1" />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Add custom category */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Dodaj własną kategorię
                </button>
              ) : (
                <div className="mt-2 flex gap-2">
                  <input
                    autoFocus
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } if (e.key === 'Escape') setShowCustomInput(false); }}
                    className="flex-1 bg-[#0B0E14] border border-emerald-500/40 rounded-lg px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Nazwa kategorii"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    disabled={savingCustom || !customInput.trim()}
                    className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] text-xs font-semibold disabled:opacity-40 transition-colors"
                  >
                    {savingCustom ? '...' : 'Dodaj'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-2 py-2 rounded-lg border border-white/10 text-[#475569] hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-[#94A3B8] mb-1.5 uppercase tracking-wider">Data *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500/50"
                required
                data-testid="input-expense-date"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-[#94A3B8] text-sm hover:bg-white/5 transition-colors"
                data-testid="cancel-expense-btn"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] font-semibold text-sm transition-colors duration-200"
                data-testid="submit-expense-btn"
              >
                {isEdit ? 'Zapisz zmiany' : 'Dodaj wydatek'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Delete Confirm Dialog ─────────────────────────────────────
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, expenseName }) => {
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
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm bg-[#151A23] border border-white/10 rounded-xl shadow-2xl p-5"
          data-testid="delete-confirm-dialog"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">Usuń wydatek</h3>
          <p className="text-sm text-[#94A3B8] mb-5">
            Czy na pewno chcesz usunąć <span className="text-rose-400 font-medium">{expenseName}</span>? Tej operacji nie można cofnąć.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-white/10 text-[#94A3B8] text-sm hover:bg-white/5 transition-colors"
              data-testid="delete-cancel-btn"
            >
              Anuluj
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm transition-colors"
              data-testid="delete-confirm-btn"
            >
              Usuń
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main Component ────────────────────────────────────────────
export const HousingExpenses = () => {
  const {
    fetchHousingExpenses, createHousingExpense, updateHousingExpense, deleteHousingExpense,
    fetchHousingCategories, createHousingCategory,
    fetchMonthlyHousingCosts, upsertMonthlyHousingCost,
    loading, error: loadError,
  } = useSupabase();

  const [rawExpenses, setRawExpenses] = useState(null);
  const [monthlyData, setMonthlyData] = useState(EMPTY_MONTHLY_DATA);
  const [pieData, setPieData] = useState(EMPTY_PIE_DATA);

  const [categories, setCategories] = useState([]);

  // Monthly fixed costs state
  const [selectedYM, setSelectedYM] = useState(todayYearMonth);
  const [monthlyCosts, setMonthlyCosts] = useState({});  // { 'YYYY-MM': { categoryName: amount } }

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, expense: null });
  const [crudError, setCrudError] = useState(null);

  const buildCharts = useCallback((data) => {
    // Monthly trend
    const grouped = {};
    data.forEach((exp) => {
      const date = new Date(exp.date).toLocaleDateString('pl-PL', { month: 'short' });
      if (!grouped[date]) grouped[date] = { name: date, kwota: 0 };
      grouped[date].kwota += exp.amount;
    });
    setMonthlyData(Object.values(grouped).slice(-6));

    // Pie chart by subcategory
    const categoryMap = {};
    data.forEach((exp, idx) => {
      const key = exp.subcategory || 'Inne';
      if (!categoryMap[key]) {
        categoryMap[key] = { name: key, value: 0, color: PIE_COLORS[Object.keys(categoryMap).length % PIE_COLORS.length] };
      }
      categoryMap[key].value += exp.amount;
    });
    setPieData(Object.values(categoryMap));
  }, []);

  const loadData = useCallback(async () => {
    const cur = selectedYM;
    const prev = prevYM(cur);
    const [expData, catData, costsData] = await Promise.all([
      fetchHousingExpenses(),
      fetchHousingCategories(),
      fetchMonthlyHousingCosts([cur, prev]),
    ]);
    setRawExpenses(expData || []);
    setCategories(catData || []);
    // Index costs by year_month → category_name → amount
    const indexed = {};
    for (const row of (costsData || [])) {
      if (!indexed[row.year_month]) indexed[row.year_month] = {};
      indexed[row.year_month][row.category_name] = row.amount;
    }
    setMonthlyCosts(indexed);
    if (expData && expData.length > 0) buildCharts(expData);
  }, [fetchHousingExpenses, fetchHousingCategories, fetchMonthlyHousingCosts, buildCharts, selectedYM]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayExpenses = (rawExpenses || []).map((exp) => ({
    id: exp.id,
    _raw: exp,
    icon: Building2,
    name: exp.title,
    amount: exp.amount.toString(),
    category: exp.note,
    date: new Date(exp.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
  }));

  const expenses = rawExpenses || [];
  const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const avg = expenses.length > 0 ? Math.round(total / expenses.length) : 0;
  const maxExpense = expenses.reduce((max, e) => (e.amount > (max?.amount || 0) ? e : max), null);
  const maxLabel = maxExpense ? `zł (${maxExpense.title || maxExpense.name})` : 'zł';

  const fmt = (n) => Number(n).toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // CRUD handlers
  const handleSaveMonthlyCost = async (categoryName, amount) => {
    await upsertMonthlyHousingCost(categoryName, amount, selectedYM);
    setMonthlyCosts(prev => ({
      ...prev,
      [selectedYM]: { ...(prev[selectedYM] || {}), [categoryName]: amount },
    }));
  };

  const handleAddCategory = async (name) => {
    const newCat = await createHousingCategory(name);
    if (newCat) setCategories(prev => [...prev, newCat]);
  };

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (expRaw) => {
    setEditingExpense(expRaw);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setCrudError(null);
    try {
      if (editingExpense && editingExpense.id) {
        const updated = await updateHousingExpense(editingExpense.id, formData);
        if (updated) {
          const newList = (rawExpenses || []).map(e => e.id === updated.id ? updated : e);
          setRawExpenses(newList);
          buildCharts(newList);
        }
      } else {
        const created = await createHousingExpense(formData);
        if (created) {
          const newList = [created, ...(rawExpenses || [])];
          setRawExpenses(newList);
          buildCharts(newList);
        }
      }
      setModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      setCrudError(err.message || 'Nie udało się zapisać wydatku');
    }
  };

  const handleDeleteRequest = (expRaw) => {
    setDeleteDialog({ open: true, expense: expRaw });
  };

  const handleDeleteConfirm = async () => {
    const exp = deleteDialog.expense;
    if (!exp || !exp.id) { setDeleteDialog({ open: false, expense: null }); return; }
    setCrudError(null);
    try {
      await deleteHousingExpense(exp.id);
      const newList = (rawExpenses || []).filter(e => e.id !== exp.id);
      setRawExpenses(newList);
      if (newList.length > 0) buildCharts(newList);
      else {
        setMonthlyData(EMPTY_MONTHLY_DATA);
        setPieData(EMPTY_PIE_DATA);
      }
    } catch (err) {
      setCrudError(err.message || 'Nie udało się usunąć wydatku');
    }
    setDeleteDialog({ open: false, expense: null });
  };

  if (loading && rawExpenses === null) return <TabSkeleton />;
  if (loadError) return <div className="text-red-400 p-6">Błąd ładowania danych: {loadError}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], exit: { duration: 0.12 } }}
      className="space-y-6"
      data-testid="housing-expenses-tab"
    >
      {/* CRUD error banner */}
      {crudError && (
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <span>{crudError}</span>
          <button onClick={() => setCrudError(null)} className="ml-3 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-emerald-500" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
              Wydatki na Mieszkanie
            </h2>
            <p className="text-sm text-[#94A3B8] mt-0.5">{labelYM(selectedYM)}</p>
          </div>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B0E14] font-semibold text-xs transition-colors duration-200"
          data-testid="add-expense-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          Dodaj wydatek
        </button>
      </div>
      <div className="accent-line-green" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Suma miesięczna" value={fmt(total)} color="green" delay={0} />
        <StatCard icon={TrendingUp} label="Śr. wydatek" value={fmt(avg)} color="green" delay={0.05} />
        <StatCard icon={Zap} label="Najwyższy koszt" value={maxExpense ? fmt(maxExpense.amount) : '0'} color="green" suffix={maxLabel} delay={0.1} />
        <StatCard icon={Shield} label="Liczba wydatków" value={String(expenses.length)} color="green" delay={0.15} />
      </div>

      {/* ── Koszty Stałe ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="expense-card p-5"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-[#F8FAFC]">Koszty Stałe</h3>
            <p className="text-xs text-[#475569] mt-0.5">Kliknij kwotę aby wpisać lub zmienić wartość</p>
          </div>
          {/* Month navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedYM(ym => prevYM(ym))}
              className="p-1.5 rounded-lg border border-white/10 text-[#475569] hover:bg-white/5 hover:text-[#94A3B8] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[#94A3B8] px-2 min-w-[110px] text-center">
              {labelYM(selectedYM)}
            </span>
            <button
              onClick={() => setSelectedYM(ym => nextYM(ym))}
              disabled={selectedYM >= todayYearMonth()}
              className="p-1.5 rounded-lg border border-white/10 text-[#475569] hover:bg-white/5 hover:text-[#94A3B8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tiles grid */}
        {categories.length === 0 ? (
          <p className="text-sm text-[#334155] text-center py-4">Ładowanie kategorii…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <FixedCostTile
                key={cat.id}
                name={cat.name}
                currentAmount={monthlyCosts[selectedYM]?.[cat.name] ?? null}
                prevAmount={monthlyCosts[prevYM(selectedYM)]?.[cat.name] ?? null}
                onSave={(amount) => handleSaveMonthlyCost(cat.name, amount)}
                delay={i * 0.04}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Charts & Expenses grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 expense-card p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Trend wydatków</h3>
          <p className="text-xs text-[#475569] mb-4">Ostatnie 6 miesięcy</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="kwota" stroke="#10B981" strokeWidth={2} fill="url(#greenGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="expense-card p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Rozkład kosztów</h3>
          <p className="text-xs text-[#475569] mb-4">Procentowy udział</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1E2532',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[#94A3B8]">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Expense List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="expense-card p-6"
      >
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Lista wydatków</h3>
        <p className="text-xs text-[#475569] mb-4">Bieżący miesiąc</p>
        <div className="space-y-2">
          {displayExpenses.length === 0 ? (
            <div className="text-center py-10 text-[#475569]">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Brak wydatków. Dodaj pierwszy wydatek przyciskiem powyżej.</p>
            </div>
          ) : (
            displayExpenses.map((expense, i) => (
              <ExpenseCard
                key={expense.id ?? expense.name}
                icon={expense.icon}
                name={expense.name}
                amount={expense.amount}
                category={expense.category}
                color="green"
                date={expense.date}
                delay={i * 0.05}
                onEdit={() => handleOpenEdit(expense._raw)}
                onDelete={() => handleDeleteRequest(expense._raw)}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <ExpenseFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null); }}
        onSave={handleSave}
        editingExpense={editingExpense}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, expense: null })}
        onConfirm={handleDeleteConfirm}
        expenseName={deleteDialog.expense?.description || ''}
      />
    </motion.div>
  );
};
