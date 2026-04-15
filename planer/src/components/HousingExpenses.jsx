import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Landmark,
  Wifi,
  Droplets,
  Flame,
  Zap,
  ShoppingCart,
  Circle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { TabSkeleton } from './TabSkeleton';

// ─── Icon mapping ──────────────────────────────────────────────
const ICON_MAP = {
  Building2,
  Landmark,
  Wifi,
  Droplets,
  Flame,
  Zap,
  ShoppingCart,
  Circle,
};

const PALETTE = [
  '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899',
  '#34D399', '#60A5FA', '#FBBF24', '#A78BFA', '#F9A8D4',
  '#047857', '#1D4ED8', '#D97706', '#6D28D9', '#BE185D',
];

const MONTHS_SHORT = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const MONTHS_FULL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];

const getCurrentYearMonth = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatYearMonthShort = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const idx = parseInt(m, 10) - 1;
  const yy = y.slice(-2);
  return `${MONTHS_SHORT[idx]} ${yy}`;
};

const formatYearMonthFull = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const idx = parseInt(m, 10) - 1;
  return `${MONTHS_FULL[idx]} ${y}`;
};

const fmt = (n) =>
  Number(n || 0).toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ─── Custom chart tooltip ──────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
  return (
    <div
      style={{
        background: '#0B0E14',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 10px',
        fontSize: '0.75rem',
      }}
    >
      <div style={{ color: '#F8FAFC', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.fill, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span>{p.dataKey}</span>
          <span style={{ color: '#F8FAFC' }}>{fmt(p.value)} zł</span>
        </div>
      ))}
      <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)', color: '#10B981', fontWeight: 600 }}>
        Suma: {fmt(total)} zł
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────
export const HousingExpenses = () => {
  const {
    fetchFixedCostCategories,
    fetchMonthlySnapshots,
    saveMonthlySnapshot,
    deleteMonthlySnapshot,
    addFixedCostCategory,
    error: loadError,
  } = useSupabase();

  const [categories, setCategories] = useState(null); // null = not loaded
  const [snapshots, setSnapshots] = useState([]); // all rows from housing_monthly_costs
  const [amounts, setAmounts] = useState({}); // { category_name: '1234' }
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Add category modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Circle');
  const [addingSaving, setAddingSaving] = useState(false);

  const currentYm = getCurrentYearMonth();

  // ─── Load data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const [cats, snaps] = await Promise.all([
      fetchFixedCostCategories(),
      fetchMonthlySnapshots(),
    ]);
    setCategories(cats);
    setSnapshots(snaps);

    // Prefill amounts: current month if exists, else latest snapshot
    const byMonth = {};
    snaps.forEach((s) => {
      if (!byMonth[s.year_month]) byMonth[s.year_month] = [];
      byMonth[s.year_month].push(s);
    });

    let prefill = {};
    if (byMonth[currentYm]) {
      byMonth[currentYm].forEach((s) => {
        prefill[s.category_name] = String(s.amount);
      });
    } else {
      const monthKeys = Object.keys(byMonth).sort();
      if (monthKeys.length > 0) {
        const latest = monthKeys[monthKeys.length - 1];
        byMonth[latest].forEach((s) => {
          prefill[s.category_name] = String(s.amount);
        });
      }
    }
    setAmounts(prefill);
  }, [fetchFixedCostCategories, fetchMonthlySnapshots, currentYm]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Derived: sum of fixed costs ─────────────────────────────
  const totalFixed = useMemo(() => {
    return Object.values(amounts).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  }, [amounts]);

  // ─── Derived: months map ─────────────────────────────────────
  const monthsMap = useMemo(() => {
    const map = {};
    snapshots.forEach((s) => {
      if (!map[s.year_month]) map[s.year_month] = {};
      map[s.year_month][s.category_name] = Number(s.amount) || 0;
    });
    return map;
  }, [snapshots]);

  const sortedMonthsAsc = useMemo(() => Object.keys(monthsMap).sort(), [monthsMap]);
  const sortedMonthsDesc = useMemo(() => [...sortedMonthsAsc].reverse(), [sortedMonthsAsc]);

  // ─── Chart data ──────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (!categories) return [];
    return sortedMonthsAsc.map((ym) => {
      const row = { name: formatYearMonthShort(ym) };
      categories.forEach((cat) => {
        row[cat.name] = monthsMap[ym][cat.name] || 0;
      });
      return row;
    });
  }, [sortedMonthsAsc, categories, monthsMap]);

  // ─── Handlers ────────────────────────────────────────────────
  const handleAmountChange = (name, value) => {
    setAmounts((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!categories) return;
    setSaving(true);
    setFeedback(null);
    const costs = categories
      .map((cat) => ({
        category_name: cat.name,
        amount: parseFloat(amounts[cat.name]) || 0,
      }))
      .filter((c) => c.amount > 0);

    const result = await saveMonthlySnapshot(currentYm, costs);
    if (result === null) {
      setFeedback({ type: 'error', msg: 'Nie udało się zapisać miesiąca' });
    } else {
      setFeedback({ type: 'ok', msg: `Zapisano ${formatYearMonthFull(currentYm)}` });
      const snaps = await fetchMonthlySnapshots();
      setSnapshots(snaps);
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleDeleteMonth = async (ym) => {
    const ok = await deleteMonthlySnapshot(ym);
    if (ok) {
      const snaps = await fetchMonthlySnapshots();
      setSnapshots(snaps);
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setAddingSaving(true);
    const result = await addFixedCostCategory(trimmed, newCatIcon);
    if (result) {
      const cats = await fetchFixedCostCategories();
      setCategories(cats);
      setShowAddModal(false);
      setNewCatName('');
      setNewCatIcon('Circle');
      setFeedback({ type: 'ok', msg: `Dodano kategorię „${trimmed}"` });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'error', msg: 'Nie udało się dodać kategorii' });
      setTimeout(() => setFeedback(null), 2500);
    }
    setAddingSaving(false);
  };

  // ─── Render ──────────────────────────────────────────────────
  if (categories === null) return <TabSkeleton />;
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
      {/* Feedback banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`px-4 py-3 rounded-lg text-sm border ${
              feedback.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {feedback.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Section 1: Koszty stałe ─────────────────────────── */}
      <section className="space-y-4" data-testid="fixed-costs-section">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Koszty stałe</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-sm text-[#475569]">Wpisz miesięczne kwoty</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-200 text-xs font-medium"
                data-testid="add-category-btn"
              >
                <Plus className="w-3 h-3" />
                Dodaj nowy koszt stały
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {categories.map((cat, i) => {
            const Icon = ICON_MAP[cat.icon_key] || Circle;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-3 bg-[#151A23] border border-white/5 rounded-xl px-3 py-3"
                data-testid={`fixed-cost-tile-${cat.name}`}
              >
                <div
                  className="flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ background: '#0D2D1E', width: 40, height: 40 }}
                >
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span
                  className="flex-1 uppercase font-semibold"
                  style={{ fontSize: '10px', letterSpacing: '0.15em', color: '#475569' }}
                >
                  {cat.name}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amounts[cat.name] ?? ''}
                  onChange={(e) => handleAmountChange(cat.name, e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="text-xl font-bold text-white bg-transparent border-0 outline-none text-right w-24 focus:ring-0"
                  data-testid={`fixed-cost-input-${cat.name}`}
                />
                <span className="text-sm flex-shrink-0" style={{ color: '#475569' }}>
                  zł
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Sum footer */}
        <div className="flex items-center justify-between px-3 py-3 border-t border-white/5">
          <span className="text-sm text-[#94A3B8]">Suma kosztów stałych</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-emerald-400" data-testid="fixed-costs-total">
              {fmt(totalFixed)}
            </span>
            <span className="text-sm text-[#475569]">zł</span>
          </div>
        </div>
      </section>

      {/* ─── Section 2: Historia miesięczna ─────────────────── */}
      <section
        className="bg-[#151A23] border border-white/5 rounded-xl overflow-hidden"
        data-testid="monthly-history-section"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4">
          <button
            type="button"
            onClick={() => setHistoryOpen((p) => !p)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
            data-testid="history-toggle-btn"
          >
            <div
              className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ background: '#0D2D1E', width: 40, height: 40 }}
            >
              <Calendar className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-white">Historia miesięczna</div>
              <div className="text-xs" style={{ color: '#475569' }}>
                {sortedMonthsAsc.length} {sortedMonthsAsc.length === 1 ? 'miesiąc zapisany' : 'miesięcy zapisanych'}
              </div>
            </div>
            {historyOpen ? (
              <ChevronUp className="w-5 h-5 text-[#475569] flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#475569] flex-shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-[#0B0E14] text-xs font-semibold transition-colors flex-shrink-0"
            data-testid="save-month-btn"
          >
            {saving ? 'Zapisuję...' : `Zapisz ${formatYearMonthFull(currentYm)}`}
          </button>
        </div>

        {/* Collapsible content */}
        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              key="history-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4 space-y-5 border-t border-white/5 pt-4">
                {/* Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Suma miesięczna</h3>
                  {chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-xs text-[#475569]">
                      Brak danych do wykresu
                    </div>
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis
                            dataKey="name"
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="#475569"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                          {categories.map((cat, idx) => (
                            <Bar
                              key={cat.id}
                              dataKey={cat.name}
                              stackId="costs"
                              fill={PALETTE[idx % PALETTE.length]}
                              radius={idx === categories.length - 1 ? [4, 4, 0, 0] : 0}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                    {categories.map((cat, idx) => (
                      <div key={cat.id} className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                        />
                        <span className="text-xs" style={{ color: '#94A3B8' }}>
                          {cat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved months list */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Zapisane miesiące</h3>
                    <button
                      type="button"
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                      data-testid="compare-months-btn"
                    >
                      Porównaj miesiące
                    </button>
                  </div>

                  {sortedMonthsDesc.length === 0 ? (
                    <div className="text-xs text-[#475569] py-4 text-center">
                      Brak zapisanych miesięcy. Kliknij „Zapisz {formatYearMonthFull(currentYm)}", aby utworzyć pierwszy snapshot.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sortedMonthsDesc.map((ym, idx) => {
                        const monthObj = monthsMap[ym];
                        const entries = Object.entries(monthObj);
                        const total = entries.reduce((s, [, v]) => s + (Number(v) || 0), 0);
                        const prevYm = sortedMonthsDesc[idx + 1];
                        let changePct = null;
                        if (prevYm) {
                          const prevTotal = Object.values(monthsMap[prevYm]).reduce(
                            (s, v) => s + (Number(v) || 0),
                            0
                          );
                          if (prevTotal > 0) {
                            changePct = ((total - prevTotal) / prevTotal) * 100;
                          }
                        }

                        const firstFour = entries.slice(0, 4);
                        const extras = entries.length - 4;

                        return (
                          <div
                            key={ym}
                            className="bg-[#0B0E14] border border-white/5 rounded-xl p-4 flex justify-between gap-4"
                            data-testid={`month-card-${ym}`}
                          >
                            {/* Left */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-white mb-2">
                                {formatYearMonthFull(ym)}
                              </div>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                {firstFour.map(([name, amt]) => (
                                  <div key={name} className="text-xs truncate">
                                    <span style={{ color: '#475569' }}>{name}: </span>
                                    <span style={{ color: '#94A3B8' }}>{fmt(amt)}</span>
                                  </div>
                                ))}
                              </div>
                              {extras > 0 && (
                                <div className="text-xs mt-1" style={{ color: '#475569' }}>
                                  +{extras} więcej
                                </div>
                              )}
                            </div>

                            {/* Right */}
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-emerald-400">
                                  {fmt(total)} zł
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMonth(ym)}
                                  className="text-[#475569] hover:text-rose-400 transition-colors"
                                  aria-label={`Usuń ${ym}`}
                                  data-testid={`delete-month-${ym}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {changePct !== null && (
                                <div
                                  className={`flex items-center gap-1 text-xs ${
                                    changePct <= 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {changePct <= 0 ? (
                                    <ArrowDownRight className="w-3 h-3" />
                                  ) : (
                                    <ArrowUpRight className="w-3 h-3" />
                                  )}
                                  <span>
                                    {changePct > 0 ? '+' : ''}
                                    {changePct.toFixed(1)}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── Add Category Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            {/* Dialog */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div
                className="pointer-events-auto w-full max-w-sm bg-[#151A23] border border-white/10 rounded-2xl p-6 shadow-2xl"
                data-testid="add-category-modal"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-semibold text-white">Nowy koszt stały</h3>
                    <p className="text-xs text-[#475569] mt-0.5">Dodaj kategorię do Kosztów stałych</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 rounded-lg text-[#475569] hover:text-white hover:bg-white/5 transition-colors"
                    data-testid="add-category-modal-close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Name input */}
                <div className="space-y-1.5 mb-4">
                  <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                    Nazwa kategorii
                  </label>
                  <input
                    type="text"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    placeholder="np. Parking, Abonament..."
                    maxLength={40}
                    className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#475569] outline-none focus:border-emerald-500/50 transition-colors"
                    data-testid="add-category-name-input"
                    autoFocus
                  />
                </div>

                {/* Icon picker */}
                <div className="space-y-1.5 mb-6">
                  <label className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                    Ikona
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(ICON_MAP).map(([key, IconComponent]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewCatIcon(key)}
                        className={`flex items-center justify-center rounded-xl h-10 border transition-all duration-150 ${
                          newCatIcon === key
                            ? 'bg-emerald-500/20 border-emerald-500/50'
                            : 'bg-[#0B0E14] border-white/5 hover:border-white/15'
                        }`}
                        data-testid={`icon-option-${key}`}
                        title={key}
                      >
                        <IconComponent
                          className="w-4 h-4"
                          style={{ color: newCatIcon === key ? '#10B981' : '#475569' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-[#94A3B8] hover:bg-white/5 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingSaving || !newCatName.trim()}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-sm font-semibold text-[#0B0E14] transition-colors"
                    data-testid="add-category-submit"
                  >
                    {addingSaving ? 'Dodaję...' : 'Dodaj'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
