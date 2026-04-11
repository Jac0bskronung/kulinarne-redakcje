import { motion } from 'framer-motion';
import { Home, Heart, Cpu } from 'lucide-react';

const tabs = [
  { id: 'housing', label: 'Mieszkanie', icon: Home, color: '#10B981' },
  { id: 'living', label: 'Koszty Życia', icon: Heart, color: '#F43F5E' },
  { id: 'ai-news', label: 'Wiadomości AI', icon: Cpu, color: '#3B82F6' },
];

export const TabNavigation = ({ activeTab, onTabChange }) => {
  const activeIndex = tabs.findIndex(t => t.id === activeTab);
  const activeColor = tabs[activeIndex]?.color || '#10B981';

  return (
    <div role="tablist" aria-label="Nawigacja zakładek" className="relative flex gap-1 p-1 rounded-xl bg-[#0B0E14]/80 border border-white/5" data-testid="tab-navigation">
      {/* Sliding background indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg"
        style={{ backgroundColor: `${activeColor}10`, border: `1px solid ${activeColor}30` }}
        animate={{
          left: `calc(${activeIndex * (100 / tabs.length)}% + 4px)`,
          width: `calc(${100 / tabs.length}% - 8px)`,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className="relative z-10 flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-lg transition-colors duration-300 cursor-pointer"
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon
              className="w-4 h-4 transition-colors duration-300"
              style={{ color: isActive ? tab.color : '#475569' }}
              strokeWidth={1.5}
            />
            <span
              className="text-sm font-medium transition-colors duration-300 hidden sm:inline"
              style={{ color: isActive ? tab.color : '#94A3B8' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
