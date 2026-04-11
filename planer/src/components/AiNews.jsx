import { motion } from 'framer-motion';
import { Cpu, ExternalLink, Clock, Bookmark, TrendingUp, Sparkles, Bot, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { TabSkeleton } from './TabSkeleton';

// Fallback demo data (jeśli Supabase niedostępny)
const DEFAULT_NEWS_ITEMS = [
  {
    id: 1,
    title: 'GPT-5 wprowadza rewolucję w rozumowaniu',
    summary: 'OpenAI zaprezentowało GPT-5 z przełomowymi zdolnościami rozumowania wieloetapowego, osiągając wyniki przewyższające ludzkich ekspertów w testach naukowych.',
    category: 'LLM',
    time: '2 godz. temu',
    image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?w=400&h=250&fit=crop',
    accent: 'blue',
    hot: true,
  },
  {
    id: 2,
    title: 'Gemini 3 Pro - nowy standard multimodalności',
    summary: 'Google DeepMind pokazało Gemini 3 Pro z natywną obsługą wideo, audio i kodu w jednym modelu. Benchmark MMLU przebity o 12%.',
    category: 'Google AI',
    time: '5 godz. temu',
    image: 'https://images.unsplash.com/photo-1762279389042-9439bfb6c155?w=400&h=250&fit=crop',
    accent: 'green',
    hot: true,
  },
  {
    id: 3,
    title: 'Meta AI otwiera Llama 4 dla społeczności',
    summary: 'Meta udostępniła Llama 4 na licencji open-source z 400B parametrów. Model dostępny do pobrania i fine-tuningu bez ograniczeń komercyjnych.',
    category: 'Open Source',
    time: '8 godz. temu',
    image: null,
    accent: 'purple',
  },
  {
    id: 4,
    title: 'Anthropic Claude 4 Opus - bezpieczeństwo AI na nowym poziomie',
    summary: 'Anthropic zaprezentowało Claude 4 Opus z zaawansowanym systemem Constitutional AI 2.0, gwarantującym bezpieczne i etyczne odpowiedzi.',
    category: 'Bezpieczeństwo',
    time: '12 godz. temu',
    image: null,
    accent: 'amber',
  },
  {
    id: 5,
    title: 'Sora 2 generuje filmy kinowe w 4K',
    summary: 'OpenAI Sora 2 pozwala na generowanie spójnych filmów do 5 minut w rozdzielczości 4K. Branża filmowa reaguje z niepokojem i ekscytacją.',
    category: 'Generatywne',
    time: '1 dzień temu',
    image: null,
    accent: 'pink',
  },
  {
    id: 6,
    title: 'Roboty humanoidalne Figure 03 wchodzą do fabryk BMW',
    summary: 'Figure AI rozpoczęło wdrożenie robotów Figure 03 w fabrykach BMW w Niemczech. 200 jednostek pracuje na liniach montażowych 24/7.',
    category: 'Robotyka',
    time: '1 dzień temu',
    image: null,
    accent: 'cyan',
  },
];

const accentColors = {
  blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  green: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  purple: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-400' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-400' },
  pink: { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', dot: 'bg-pink-400' },
  cyan: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', dot: 'bg-cyan-400' },
};

const FeaturedNewsCard = ({ item, delay }) => {
  const c = accentColors[item.accent] || accentColors.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="expense-card overflow-hidden group cursor-pointer"
      data-testid={`news-featured-${item.id}`}
    >
      {item.image && (
        <div className="news-image-wrap h-44 relative">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
          {item.hot && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Hot</span>
            </div>
          )}
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-2 py-0.5 rounded ${c.bg} ${c.text} ${c.border} border`}>
            {item.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-[#475569]">
            <Clock className="w-3 h-3" />
            {item.time}
          </span>
        </div>
        <h3 className="text-base font-semibold text-[#F8FAFC] mb-2 group-hover:text-blue-400 transition-colors duration-300 leading-snug">
          {item.title}
        </h3>
        <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
          {item.summary}
        </p>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
          <button className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-blue-400 transition-colors" data-testid={`news-read-${item.id}`}>
            <ExternalLink className="w-3.5 h-3.5" />
            Czytaj więcej
          </button>
          <button className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-amber-400 transition-colors" data-testid={`news-save-${item.id}`}>
            <Bookmark className="w-3.5 h-3.5" />
            Zapisz
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const CompactNewsCard = ({ item, delay }) => {
  const c = accentColors[item.accent] || accentColors.blue;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: 4, transition: { duration: 0.2 } }}
      className="flex gap-4 p-4 rounded-lg bg-[#151A23] border border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer group"
      data-testid={`news-compact-${item.id}`}
    >
      <div className={`w-1 rounded-full flex-shrink-0 ${c.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${c.text}`}>
            {item.category}
          </span>
          <span className="text-[10px] text-[#475569]">{item.time}</span>
        </div>
        <h4 className="text-sm font-medium text-[#F8FAFC] group-hover:text-blue-400 transition-colors duration-300 leading-snug mb-1">
          {item.title}
        </h4>
        <p className="text-xs text-[#94A3B8] line-clamp-2">{item.summary}</p>
      </div>
    </motion.div>
  );
};

export const AiNews = () => {
  const { fetchAiNews, loading, error } = useSupabase();
  const [newsItems, setNewsItems] = useState(DEFAULT_NEWS_ITEMS);

  useEffect(() => {
    const loadNews = async () => {
      const data = await fetchAiNews();
      if (data && data.length > 0) {
        setNewsItems(
          data.map((item, idx) => ({
            id: item.id || idx,
            title: item.title,
            summary: item.summary,
            category: item.category,
            time: item.published_at ? `${new Date(item.published_at).toLocaleDateString('pl-PL')}` : 'niedawno',
            image: item.image_url || null,
            accent: item.accent || ['blue', 'green', 'purple', 'amber', 'pink', 'cyan'][idx % 6],
            hot: item.is_featured || false,
          }))
        );
      }
    };
    loadNews();
  }, [fetchAiNews]);

  if (loading) return <TabSkeleton />;
  if (error) return <div className="text-red-400 p-6">Błąd ładowania wiadomości: {error}</div>;

  const featured = newsItems.filter(n => n.image);
  const compact = newsItems.filter(n => !n.image);

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
            <p className="text-xs text-[#475569] uppercase tracking-wider">Dzisiaj</p>
            <p className="text-lg font-bold text-blue-400">12</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="expense-card stat-glow-blue p-4 flex items-center gap-3"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <Bot className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-[#475569] uppercase tracking-wider">LLM</p>
            <p className="text-lg font-bold text-blue-400">5</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="expense-card stat-glow-blue p-4 flex items-center gap-3"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <Brain className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-[#475569] uppercase tracking-wider">Robotyka</p>
            <p className="text-lg font-bold text-blue-400">3</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="expense-card stat-glow-blue p-4 flex items-center gap-3"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
            <Sparkles className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs text-[#475569] uppercase tracking-wider">Hot</p>
            <p className="text-lg font-bold text-blue-400">2</p>
          </div>
        </motion.div>
      </div>

      {/* Featured News (with images) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featured.map((item, i) => (
          <FeaturedNewsCard key={item.id} item={item} delay={0.2 + i * 0.1} />
        ))}
      </div>

      {/* Compact News */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="expense-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Więcej wiadomości</h3>
            <p className="text-xs text-[#475569]">Aktualizowane co godzinę</p>
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
    </motion.div>
  );
};
