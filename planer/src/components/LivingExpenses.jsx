import { motion } from 'framer-motion';
import { ShoppingCart, Bus, Film, Coffee, Shirt, Dumbbell, TrendingDown, Wallet } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { StatCard } from './StatCard';
import { ExpenseCard } from './ExpenseCard';
import { TabSkeleton } from './TabSkeleton';

// Fallback demo data (jeśli Supabase niedostępny)
const DEFAULT_MONTHLY_DATA = [
  { name: 'Wrz', kwota: 2200 },
  { name: 'Paź', kwota: 2600 },
  { name: 'Lis', kwota: 2400 },
  { name: 'Gru', kwota: 3100 },
  { name: 'Sty', kwota: 2300 },
  { name: 'Lut', kwota: 2450 },
];

const DEFAULT_CATEGORY_DATA = [
  { name: 'Jedzenie', kwota: 950 },
  { name: 'Transport', kwota: 380 },
  { name: 'Rozrywka', kwota: 420 },
  { name: 'Ubrania', kwota: 300 },
  { name: 'Sport', kwota: 200 },
  { name: 'Kawa/Resty.', kwota: 200 },
];

const DEFAULT_EXPENSES = [
  { icon: ShoppingCart, name: 'Zakupy spożywcze', amount: '620', category: 'Jedzenie', date: '03.02' },
  { icon: Coffee, name: 'Restauracje / kawiarnie', amount: '330', category: 'Jedzenie', date: '08.02' },
  { icon: Bus, name: 'Bilet miesięczny', amount: '180', category: 'Transport', date: '01.02' },
  { icon: Bus, name: 'Uber / Bolt', amount: '200', category: 'Transport', date: '12.02' },
  { icon: Film, name: 'Kino / Netflix / Spotify', amount: '120', category: 'Rozrywka', date: '05.02' },
  { icon: Film, name: 'Wyjścia ze znajomymi', amount: '300', category: 'Rozrywka', date: '14.02' },
  { icon: Shirt, name: 'Odzież', amount: '300', category: 'Ubrania', date: '10.02' },
  { icon: Dumbbell, name: 'Siłownia', amount: '200', category: 'Sport', date: '01.02' },
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

export const LivingExpenses = () => {
  const { fetchLivingExpenses, loading, error } = useSupabase();
  const [monthlyData, setMonthlyData] = useState(DEFAULT_MONTHLY_DATA);
  const [categoryData, setCategoryData] = useState(DEFAULT_CATEGORY_DATA);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchLivingExpenses();
      if (data && data.length > 0) {
        // Transform Supabase data to monthly chart
        const grouped = {};
        data.forEach((exp) => {
          const date = new Date(exp.date).toLocaleDateString('pl-PL', { month: 'short' });
          if (!grouped[date]) grouped[date] = { name: date, kwota: 0 };
          grouped[date].kwota += exp.amount;
        });
        setMonthlyData(Object.values(grouped).slice(-6));

        // Kategorie dla bar chart
        const categoryMap = {};
        data.forEach((exp) => {
          if (!categoryMap[exp.category]) {
            categoryMap[exp.category] = { name: exp.category, kwota: 0 };
          }
          categoryMap[exp.category].kwota += exp.amount;
        });
        setCategoryData(Object.values(categoryMap));

        // Lista wydatków
        setExpenses(
          data.map((exp) => ({
            icon: ShoppingCart,
            name: exp.description,
            amount: exp.amount.toString(),
            category: exp.category,
            date: new Date(exp.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
          }))
        );
      }
    };
    loadData();
  }, []);

  if (loading) return <TabSkeleton />;
  if (error) return <div className="text-red-400 p-6">Błąd ładowania danych: {error}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], exit: { duration: 0.12 } }}
      className="space-y-6"
      data-testid="living-expenses-tab"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full bg-rose-500" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Koszty Życia
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">Luty 2026</p>
        </div>
      </div>
      <div className="accent-line-red" />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Suma miesięczna" value="2 450" color="red" trend={-3.8} delay={0} />
        <StatCard icon={TrendingDown} label="Średnia / 6 mies." value="2 510" color="red" delay={0.05} />
        <StatCard icon={ShoppingCart} label="Jedzenie" value="950" color="red" suffix="zł" delay={0.1} />
        <StatCard icon={Film} label="Rozrywka" value="420" color="red" delay={0.15} />
      </div>

      {/* Charts grid */}
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
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="kwota" stroke="#F43F5E" strokeWidth={2} fill="url(#redGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="expense-card p-6"
        >
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1">Kategorie</h3>
          <p className="text-xs text-[#475569] mb-4">Wydatki wg kategorii</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} width={70} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="kwota" fill="#F43F5E" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
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
              key={`${expense.name}-${i}`}
              {...expense}
              color="red"
              delay={i * 0.05}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
