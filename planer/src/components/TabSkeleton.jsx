import { motion } from 'framer-motion';

const tabColors = {
  housing: { bar: 'bg-emerald-500', glow: 'bg-emerald-500/8', ring: 'border-emerald-500/20' },
  living: { bar: 'bg-rose-500', glow: 'bg-rose-500/8', ring: 'border-rose-500/20' },
  'ai-news': { bar: 'bg-blue-500', glow: 'bg-blue-500/8', ring: 'border-blue-500/20' },
};

const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded-lg ${className}`} />
);

export const TabSkeleton = ({ tab = 'housing' }) => {
  const color = tabColors[tab] || tabColors.housing;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="space-y-6"
      data-testid="tab-loading-skeleton"
    >
      {/* Top progress bar - most visible element */}
      <div className="relative h-[2px] w-full rounded-full overflow-hidden bg-[#1E2532]">
        <motion.div
          className={`absolute inset-y-0 left-0 ${color.bar} rounded-full`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Header skeleton - appears immediately */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2, delay: 0.02 }}
      >
        <div className={`w-1 h-8 rounded-full ${color.bar}`} />
        <div className="space-y-2.5">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-3.5 w-24" />
        </div>
      </motion.div>

      {/* Accent line */}
      <motion.div
        className={`h-px ${color.bar} opacity-30`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.3, delay: 0.02 }}
        style={{ transformOrigin: 'left' }}
      />

      {/* Stat cards skeleton - appear fast */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.04 }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#151A23] border border-white/5 rounded-lg p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="w-9 h-9" />
              <SkeletonBlock className="w-10 h-4" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-8 w-28" />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts skeleton */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.08 }}
      >
        <div className="lg:col-span-2 bg-[#151A23] border border-white/5 rounded-lg p-6">
          <SkeletonBlock className="h-5 w-36 mb-2" />
          <SkeletonBlock className="h-3 w-28 mb-6" />
          <div className="flex items-end gap-3 h-48">
            {[40, 65, 50, 80, 55, 70].map((h, i) => (
              <motion.div
                key={i}
                className={`flex-1 rounded-t-sm ${color.glow} border-t ${color.ring}`}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#151A23] border border-white/5 rounded-lg p-6">
          <SkeletonBlock className="h-5 w-32 mb-2" />
          <SkeletonBlock className="h-3 w-24 mb-6" />
          <div className="flex items-center justify-center h-40">
            <motion.div
              className={`w-32 h-32 rounded-full border-[10px] ${color.ring}`}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </motion.div>

      {/* List skeleton */}
      <motion.div
        className="bg-[#151A23] border border-white/5 rounded-lg p-6 space-y-3"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.12 }}
      >
        <SkeletonBlock className="h-5 w-32 mb-1" />
        <SkeletonBlock className="h-3 w-24 mb-4" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-3 rounded-lg bg-[#0B0E14]/50"
          >
            <SkeletonBlock className="w-9 h-9 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-3.5 w-32" />
              <SkeletonBlock className="h-2.5 w-20" />
            </div>
            <div className="text-right space-y-2">
              <SkeletonBlock className="h-3.5 w-16" />
              <SkeletonBlock className="h-2.5 w-12" />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};
