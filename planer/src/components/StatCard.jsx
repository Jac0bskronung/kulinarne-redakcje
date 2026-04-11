import { motion } from 'framer-motion';

const colorMap = {
  green: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    glow: 'stat-glow-green',
    border: 'border-emerald-500/20',
  },
  red: {
    text: 'text-rose-400',
    bg: 'bg-rose-500/10',
    glow: 'stat-glow-red',
    border: 'border-rose-500/20',
  },
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    glow: 'stat-glow-blue',
    border: 'border-blue-500/20',
  },
};

export const StatCard = ({ icon: Icon, label, value, suffix = 'zł', color = 'green', trend, delay = 0 }) => {
  const c = colorMap[color] || colorMap.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`expense-card ${c.glow} p-5 flex flex-col gap-3`}
      data-testid={`stat-card-${label.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-center justify-between">
        <div className={`${c.bg} ${c.border} border rounded-lg p-2.5`}>
          <Icon className={`w-4 h-4 ${c.text}`} strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-[#475569] font-medium mb-1.5">
          {label}
        </p>
        <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${c.text}`}>
          {value}
          <span className="text-sm font-normal text-[#475569] ml-1">{suffix}</span>
        </p>
      </div>
    </motion.div>
  );
};
