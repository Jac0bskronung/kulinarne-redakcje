import { motion } from 'framer-motion';

const tabConfig = {
  housing: {
    color: '#10B981',
    colorRgb: '16, 185, 129',
    label: 'Mieszkanie',
    sublabel: 'Wydatki na mieszkanie',
  },
  living: {
    color: '#F43F5E',
    colorRgb: '244, 63, 94',
    label: 'Koszty Życia',
    sublabel: 'Wydatki codzienne',
  },
  'ai-news': {
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    label: 'Wiadomości AI',
    sublabel: 'Świat sztucznej inteligencji',
  },
};

/* Inline SVG cat logo - simple minimalist white cat silhouette */
const CatLogo = ({ size = 64 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg">
    {/* Ears */}
    <path d="M22 45 L15 12 L38 32 Z" />
    <path d="M78 45 L85 12 L62 32 Z" />
    {/* Head */}
    <ellipse cx="50" cy="52" rx="32" ry="30" />
    {/* Eyes */}
    <ellipse cx="38" cy="47" rx="5" ry="5.5" fill="#0B0E14" />
    <ellipse cx="62" cy="47" rx="5" ry="5.5" fill="#0B0E14" />
    {/* Eye shine */}
    <circle cx="40" cy="45.5" r="1.5" fill="white" />
    <circle cx="64" cy="45.5" r="1.5" fill="white" />
    {/* Nose */}
    <ellipse cx="50" cy="57" rx="3" ry="2" fill="#0B0E14" />
    {/* Mouth */}
    <path d="M47 59 Q50 63 50 62" stroke="#0B0E14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M53 59 Q50 63 50 62" stroke="#0B0E14" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    {/* Whiskers */}
    <line x1="18" y1="52" x2="33" y2="55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="18" y1="58" x2="33" y2="58" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="82" y1="52" x2="67" y2="55" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    <line x1="82" y1="58" x2="67" y2="58" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
  </svg>
);

export const TabTransition = ({ tab = 'housing' }) => {
  const config = tabConfig[tab] || tabConfig.housing;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0B0E14' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      data-testid="tab-transition-splash"
    >
      {/* Animated glow orb - main effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '500px',
          height: '500px',
          background: `radial-gradient(ellipse at center, rgba(${config.colorRgb}, 0.35) 0%, rgba(${config.colorRgb}, 0.15) 30%, rgba(${config.colorRgb}, 0.05) 55%, transparent 75%)`,
          filter: 'blur(40px)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1, 1.1],
          opacity: [0, 0.8, 1, 0.9],
          y: [40, -10, 0, 5],
          x: [0, 10, -5, 0],
        }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
          times: [0, 0.4, 0.7, 1],
        }}
      />

      {/* Secondary pulse ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '300px',
          height: '300px',
          background: `radial-gradient(circle, rgba(${config.colorRgb}, 0.2) 0%, transparent 70%)`,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1.5, 2],
          opacity: [0.6, 0.2, 0],
        }}
        transition={{
          duration: 1,
          delay: 0.2,
          ease: 'easeOut',
        }}
      />

      {/* Inner bright core */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '180px',
          height: '180px',
          background: `radial-gradient(circle, rgba(${config.colorRgb}, 0.5) 0%, rgba(${config.colorRgb}, 0.1) 50%, transparent 75%)`,
        }}
        initial={{ scale: 0 }}
        animate={{
          scale: [0, 1.3, 1],
          opacity: [0, 1, 0.7],
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      {/* Cat Logo */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-5"
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <CatLogo size={72} />
        </motion.div>

        {/* App name */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            FinPulse
          </h2>
          <motion.p
            className="text-sm mt-1 tracking-wide"
            style={{ color: config.color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1] }}
            transition={{ duration: 0.8, delay: 0.45 }}
          >
            {config.sublabel}
          </motion.p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-1.5 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: config.color }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Noise overlay */}
      <div className="noise-overlay" />
    </motion.div>
  );
};
