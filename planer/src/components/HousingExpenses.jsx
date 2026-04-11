import { motion } from 'framer-motion';
import { Building2, Wifi, Droplets, Zap, Flame, Shield, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { StatCard } from './StatCard';
import { ExpenseCard } from './ExpenseCard';
import { TabSkeleton } from './TabSkeleton';

// Fallback demo data (jeśli Supabase niedostępny)
const DEFAULT_MONTHLY_DATA = [
  { name: 'Wrz', kwota: 2800 },
  { name: 'Paź', kwota: 3100 },
  { name: 'Lis', kwota: 3400 },
  { name: 'Gru', kwota: 3200 },
  { name: 'Sty', kwota: 2950 },
  { name: 'Lut', kwota: 3150 },
];

const DEFAULT_PIE_DATA = [
  { name: 'Czynsz', value: 1800, color: '#10B981' },
  { name: 'Media', value: 450, color: '#34D399' },
  { name: 'Internet', value: 80, color: '#6EE7B7' },
  { name: 'Prąd', value: 320, color: '#A7F3D0' },
  { name: 'Gaz', value: 280, color: '#D1FAE5' },
  { name: 'Ubezp.', value: 220, color: '#059669' },
];

const DEFAULT_EXPENSES = [
  { icon: Building2, name: 'Czynsz', amount: '1 800', category: 'Opłata stała', date: '01.02' },
  { icon: Droplets, name: 'Woda i ścieki', amount: '180', category: 'Media', date: '05.02' },
  { icon: Zap, name: 'Energia elektryczna', amount: '320', category: 'Media', date: '10.02' },
  { icon: Flame, name: 'Ogrzewanie / gaz', amount: '280', category: 'Media', date: '10.02' },
  { icon: Wifi, name: 'Internet', amount: '80', category: 'Telekomunikacja', date: '15.02' },
  { icon: Shield, name: 'Ubezpieczenie', amount: '220', category: 'Polisa', date: '01.02' },
];

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

export const HousingExpenses = () => {
  const { fetchHousingExpenses, loading, error } = useSupabase();
  const [monthlyData, setMonthlyData] = useState(DEFAULT_MONTHLY_DATA);
  const [pieData, setPieData] = useState(DEFAULT_PIE_DATA);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchHousingExpenses();
      if (data && data.length > 0) {
        // Transform Supabase data to chart format
        const grouped = {};
        data.forEach((exp) => {
          const date = new Date(exp.date).toLocaleDateString('pl-PL', { month: 'short' });
          if (!grouped[date]) grouped[date] = { name: date, kwota: 0 };
          grouped[date].kwota += exp.amount;
        });
        setMonthlyData(Object.values(grouped).slice(-6));

        // Kategorie dla pie chart
        const categoryMap = {};
        data.forEach((exp) => {
          if (!categoryMap[exp.subcategory]) {
            categoryMap[exp.subcategory] = { name: exp.subcategory, value: 0, color: '#10B981' };
          }
          categoryMap[exp.subcategory].value += exp.amount;
        });
        setPieData(Object.values(categoryMap));

        // Lista wydatków
        setExpenses(
          data.map((exp) => ({
            icon: Building2,
            name: exp.description,
            amount: exp.amount.toString(),
            category: exp.subcategory,
            date: new Date(exp.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
          }))
        );
      }
    };
    loadData();
  }, [fetchHousingExpenses]);

  if (loading) return <TabSkeleton />;
  if (error) return <div className="text-red-400 p-6">Błąd ładowania danych: {error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], exit: { duration: 0.12 } }}
      className="space-y-6"
      data-testid="housing-expenses-tab"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full bg-emerald-500" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Wydatki na Mieszkanie
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">Luty 2026</p>
        </div>
      </div>
      <div className="accent-line-green" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Suma miesięczna" value="3 150" color="green" trend={5.2} delay={0} />
        <StatCard icon={TrendingUp} label="Średnia / 6 mies." value="3 100" color="green" delay={0.05} />
        <StatCard icon={Zap} label="Najwyższy koszt" value="1 800" color="green" suffix="zł (Czynsz)" delay={0.1} />
        <StatCard icon={Shield} label="Ubezpieczenie" value="220" color="green" delay={0.15} />
      </div>

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
          {expenses.map((expense, i) => (
            <ExpenseCard
              key={expense.name}
              {...expense}
              color="green"
              delay={i * 0.05}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
