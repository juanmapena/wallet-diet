import { motion } from 'framer-motion';
import { Flame, Activity, CheckCircle } from 'lucide-react';

export default function DietMeter({ totalExpenses, monthlyIncome }) {
  // If no income is set, assume 100% is fine or just show 0
  const percentage = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  let statusColor = 'var(--accent-green)';
  let StatusIcon = CheckCircle;
  let message = 'Tus finanzas están saludables.';

  if (percentage >= 80) {
    statusColor = 'var(--accent-red)';
    StatusIcon = Flame;
    message = '¡Tu billetera está sudando! 🔥';
  } else if (percentage >= 60) {
    statusColor = '#f59e0b'; // warning orange
    StatusIcon = Activity;
    message = 'Cuidado, te acercas al límite.';
  }

  return (
    <div className="glass-card diet-meter-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          The Diet Meter
        </h3>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Termómetro de gastos mensuales.
        </p>
      </div>

      {/* Progress Bar Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: statusColor }}>
            {percentage.toFixed(0)}%
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', paddingBottom: '6px' }}>
            Consumido
          </span>
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '24px', 
          background: 'rgba(128, 128, 128, 0.15)', 
          borderRadius: '12px', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${clampedPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${statusColor}80, ${statusColor})`,
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Shimmer effect inside the bar */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                top: 0, bottom: 0, left: 0, width: '50%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transform: 'skewX(-20deg)'
              }}
            />
          </motion.div>
        </div>

        <motion.div 
          animate={{ scale: percentage >= 80 ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 1, repeat: percentage >= 80 ? Infinity : 0 }}
          style={{ 
            marginTop: '0.5rem',
            padding: '12px', 
            borderRadius: '8px', 
            background: `${statusColor}15`, 
            border: `1px solid ${statusColor}40`,
            color: statusColor,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
            fontSize: '0.9rem'
          }}
        >
          <StatusIcon size={18} />
          <span>{message}</span>
        </motion.div>
      </div>
    </div>
  );
}
