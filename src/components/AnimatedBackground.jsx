import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  const floatingElements = [
    { emoji: '💸', left: 10, duration: 25, delay: 0, size: 40 },
    { emoji: '🪙', left: 25, duration: 22, delay: 5, size: 30 },
    { emoji: '📈', left: 45, duration: 28, delay: 2, size: 45 },
    { emoji: '💰', left: 60, duration: 20, delay: 8, size: 35 },
    { emoji: '💳', left: 75, duration: 26, delay: 1, size: 50 },
    { emoji: '🏦', left: 90, duration: 30, delay: 6, size: 38 },
    { emoji: '🚀', left: 15, duration: 18, delay: 12, size: 32 },
    { emoji: '💎', left: 85, duration: 24, delay: 10, size: 42 },
  ];

  return (
    <div className="stripe-bg">
      <motion.div 
        className="stripe-blob blob-1"
        animate={{ x: [0, 100, -50, 0], y: [0, -100, 50, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="stripe-blob blob-2"
        animate={{ x: [0, -150, 50, 0], y: [0, 100, -100, 0], scale: [1, 1.3, 0.8, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div 
        className="stripe-blob blob-3"
        animate={{ x: [0, 80, -80, 0], y: [0, 80, -50, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Floating Fun Emojis */}
      {floatingElements.map((el, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: `${el.left}%`,
            fontSize: `${el.size}px`,
            opacity: 0.25,
            zIndex: 0,
            pointerEvents: 'none'
          }}
          animate={{
            y: ['0vh', '-120vh'],
            rotate: [0, 360],
            x: [`${el.left}%`, `${el.left + 10}%`]
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {el.emoji}
        </motion.div>
      ))}

      <div className="stripe-noise"></div>
    </div>
  );
}
