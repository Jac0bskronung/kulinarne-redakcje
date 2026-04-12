import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TabNavigation } from './TabNavigation';
import { HousingExpenses } from './HousingExpenses';
import { AiNews } from './AiNews';
import { RemontBudget } from './RemontBudget';
import { TabTransition } from './TabTransition';
import { Calendar, Bell } from 'lucide-react';

const tabContent = {
  'housing': HousingExpenses,
  'ai-news': AiNews,
  'remont': RemontBudget,
};

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('housing');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);
  const timeoutRef = useRef(null);

  const handleTabChange = useCallback((newTab) => {
    if (newTab === activeTab || isLoading) return;
    setPendingTab(newTab);
    setIsLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveTab(newTab);
      setIsLoading(false);
      setPendingTab(null);
    }, 1200);
  }, [activeTab, isLoading]);

  const ActiveComponent = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-[#0B0E14] relative" data-testid="dashboard-container">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Glass Header */}
      <header className="glass-header sticky top-0 z-50" data-testid="main-header">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="bg-[#1E2532] border border-white/10 rounded-lg p-1.5">
                <svg width="28" height="28" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 45 L15 12 L38 32 Z" />
                  <path d="M78 45 L85 12 L62 32 Z" />
                  <ellipse cx="50" cy="52" rx="32" ry="30" />
                  <ellipse cx="38" cy="47" rx="5" ry="5.5" fill="#1E2532" />
                  <ellipse cx="62" cy="47" rx="5" ry="5.5" fill="#1E2532" />
                  <circle cx="40" cy="45.5" r="1.5" fill="white" />
                  <circle cx="64" cy="45.5" r="1.5" fill="white" />
                  <ellipse cx="50" cy="57" rx="3" ry="2" fill="#1E2532" />
                  <path d="M47 59 Q50 63 50 62" stroke="#1E2532" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                  <path d="M53 59 Q50 63 50 62" stroke="#1E2532" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-[#F8FAFC]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  FinPulse
                </h1>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#475569]">
                  Panel Finansowy
                </p>
              </div>
            </motion.div>

            {/* Center: Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:block"
            >
              <TabNavigation activeTab={pendingTab || activeTab} onTabChange={handleTabChange} />
            </motion.div>

            {/* Right: Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <button
                className="p-2.5 rounded-lg bg-[#1E2532]/50 border border-white/5 hover:border-white/15 transition-all duration-300 hover:bg-[#1E2532]"
                data-testid="calendar-button"
              >
                <Calendar className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
              </button>
              <button
                className="p-2.5 rounded-lg bg-[#1E2532]/50 border border-white/5 hover:border-white/15 transition-all duration-300 hover:bg-[#1E2532] relative"
                data-testid="notifications-button"
              >
                <Bell className="w-4 h-4 text-[#94A3B8]" strokeWidth={1.5} />
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 pulse-dot" />
              </button>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center ml-1 cursor-pointer" data-testid="user-avatar">
                <span className="text-xs font-bold text-white">MK</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden sticky top-16 z-40 px-4 py-3 glass-header" data-testid="mobile-tab-nav">
        <TabNavigation activeTab={pendingTab || activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Tab Transition Overlay */}
      <AnimatePresence>
        {isLoading && (
          <TabTransition key="transition" tab={pendingTab || activeTab} />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 relative z-10">
        <AnimatePresence mode="wait">
          <ActiveComponent key={activeTab} />
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12" data-testid="main-footer">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 flex items-center justify-between">
          <p className="text-xs text-[#475569]">
            FinPulse v1.0 &mdash; Panel Finansowy
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-[#475569]">System aktywny</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
