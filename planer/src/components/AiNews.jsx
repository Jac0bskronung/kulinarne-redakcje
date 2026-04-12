import { motion } from 'framer-motion';
import { Cpu, ExternalLink, TrendingUp, Sparkles, Bot, Brain } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { TabSkeleton } from './TabSkeleton';

const accentColors = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  green: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  purple: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', dot: 'bg-pink-400' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
};

const accentKeys = Object.keys(accentColors);

// Strip HTML tags from a string
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

// Assign a consistent accent color based on source name
function sourceAccent(source) {
  if (!source) return 'blue';
  const map = {
    'TLDR AI': 'blue',
    'Simon Willison': 'green',
    'VentureBeat AI': 'purple',
    'The Verge AI': 'amber',
    'Ars Technica AI': 'pink',
    'TechCrunch AI': 'cyan',
  };
  if (map[source]) return map[source];
  // Hash-based fallback
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
  return accentKeys[Math.abs(hash) % accentKeys.length];
}

const FeaturedNewsCard = ({ item, delay }) => {
  const c = accentColors[item.accent] || accentColors.blue;
  const openLink = () => { if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer'); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="expense-card overflow-hidden group cursor-pointer"
      onClick={openLink}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') openLink(); }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded ${c.bg} ${c.text} ${c.border} border`}>
            {item.category}
          </span>
        </div>
        <h3 className="text-base font-semibold text-[#F8FAFC] mb-2 group-hover:text-blue-400 transition-colors duration-300 leading-snug">
          {item.title}
        </h3>
        <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-4">
          {item.summary}
        </p>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
          <button
            className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-blue-400 transition-colors"
            onClick={(e) => { e.stopPropagation(); openLink(); }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Czytaj więcej
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CompactNewsCard = ({ item, delay }) => {
  const c = accentColors[item.accent] || accentColors.blue;
  const openLink = () => { if (item.link) window.open(item.link, '_blank', 'noopener,noreferrer'); };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="flex gap-4 p-4 rounded-lg bg-[#151A23] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer group"
      onClick={openLink}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') openLink(); }}
    >
      <div className={`w-1 rounded-full flex-shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${c.text}`}>
            {item.category}
          </span>
        </div>
        <h4 className="text-sm font-medium text-[#F8FAFC] group-hover:text-blue-400 transition-colors duration-300 leading-snug mb-1">
          {item.title}
        </h4>
        {item.summary && (
          <p className="text-xs text-[#94A3B8] line-clamp-2">{item.summary}</p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-[#475569] group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
    </motion.div>
  );
};

export const AiNews = () => {
  const { fetchAiNews } = useSupabase();
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      const data = await fetchAiNews();
      if (data && data.length > 0) {
        setNewsItems(
          data.map((item, idx) => {
            const plainSummary = stripHtml(item.summary);
            return {
              id: idx,
              title: item.title || 'Bez tytułu',
              summary: plainSummary,
              category: item.source || 'AI',
              link: item.link || '#',
              accent: sourceAccent(item.source),
              hasSummary: plainSummary.length > 0,
            };
          })
        );
      }
      setIsLoading(false);
    };
    loadNews();
  }, [fetchAiNews]);

  // Split: first 2 items with non-empty summary are featured, rest are compact
  const { featured, compact } = useMemo(() => {
    const feat = [];
    const comp = [];
    for (const item of newsItems) {
      if (feat.length < 2 && item.hasSummary) {
        feat.push(item);
      } else {
        comp.push(item);
      }
    }
    return { featured: feat, compact: comp };
  }, [newsItems]);

  // Dynamic stats: count unique sources + totals
  const stats = useMemo(() => {
    const sourceCounts = {};
    for (const item of newsItems) {
      const src = item.category || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
    // Pick top 3 sources by count
    const sorted = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]);
    const topSources = sorted.slice(0, 3).map(([name, count]) => ({ name, count }));
    return { total: newsItems.length, topSources, sourceCount: sorted.length };
  }, [newsItems]);

  if (isLoading) return <TabSkeleton />;

  if (newsItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <Cpu className="w-12 h-12 text-[#475569] mb-4" />
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-2">Brak wiadomości AI</h3>
        <p className="text-sm text-[#94A3B8]">Dane pojawią się po uruchomieniu digestu.</p>
      </motion.div>
    );
  }

  const statIcons = [TrendingUp, Bot, Brain, Sparkles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(4px)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], exit: { duration: 0.12 } }}
      className="space-y-6"
      data-testid="ai-news-tab"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-1 h-8 rounded-full bg-blue-500" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F8FAFC]">
            Wiadomości AI
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">Najnowsze ze świata sztucznej inteligencji</p>
        </div>
      </div>
      <div className="accent-line-blue" />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="expense-card stat-glow-blue p-4 flex items-center gap-3"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <TrendingUp className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-[#475569] uppercase tracking-wider">Razem</p>
            <p className="text-lg font-bold text-blue-400">{stats.total}</p>
          </div>
        </motion.div>
        {stats.topSources.map((src, i) => {
          const Icon = statIcons[(i + 1) % statIcons.length];
          return (
            <motion.div
              key={src.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * (i + 1) }}
              className="expense-card stat-glow-blue p-4 flex items-center gap-3"
            >
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
                <Icon className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-[#475569] uppercase tracking-wider truncate max-w-[80px]">{src.name}</p>
                <p className="text-lg font-bold text-blue-400">{src.count}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Featured News (items with summaries) */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featured.map((item, i) => (
            <FeaturedNewsCard key={item.id} item={item} delay={0.2 + i * 0.1} />
          ))}
        </div>
      )}

      {/* Compact News */}
      {compact.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="expense-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">Więcej wiadomości</h3>
              <p className="text-xs text-[#475569]">{stats.sourceCount} źródeł</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />
              <span className="text-xs text-blue-400 font-medium">Na żywo</span>
            </div>
          </div>
          <div className="space-y-2">
            {compact.map((item, i) => (
              <CompactNewsCard key={item.id} item={item} delay={0.4 + i * 0.05} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
