import { motion } from 'framer-motion';

const colorMap = {
  green: { icon: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  red: { icon: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  blue: { icon: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
};

export const ExpenseCard = ({ icon: Icon, name, amount, category, color = 'green', date, delay = 0, onEdit, onDelete }) => {
  const c = colorMap[color] || colorMap.green;
  const hasActions = onEdit || onDelete;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="flex flex-col gap-2 p-4 rounded-lg bg-[#151A23] border border-white/5 hover:border-white/10 transition-colors duration-300 cursor-default"
      data-testid={`expense-item-${name.toLowerCase().replace(/\s/g, '-')}`}
    >
      {/* Top row: icon + name/category + amount/date */}
      <div className="flex items-center gap-4">
        <div className={`${c.bg} ${c.border} border rounded-lg p-2.5 flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${c.icon}`} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F8FAFC] truncate">{name}</p>
          <p className="text-xs text-[#475569] mt-0.5">{category}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold text-[#F8FAFC]">{amount} zł</p>
          {date && <p className="text-xs text-[#475569] mt-0.5">{date}</p>}
        </div>
      </div>

      {/* Bottom row: action buttons always visible */}
      {hasActions && (
        <div className="flex items-center justify-end gap-3">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
              data-testid={`edit-expense-${name.toLowerCase().replace(/\s/g, '-')}`}
            >
              Edytuj
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors duration-150"
              data-testid={`delete-expense-${name.toLowerCase().replace(/\s/g, '-')}`}
            >
              Usuń
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
