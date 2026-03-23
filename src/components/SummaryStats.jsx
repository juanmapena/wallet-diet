import { motion } from 'framer-motion';
import { DollarSign, TrendingDown, Wallet } from 'lucide-react';

export default function SummaryStats({ data, monthlyIncome }) {
  const totalExpenses = data.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
  const totalPaid = data.filter(r => r.status === 'paid').reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
  const totalPending = totalExpenses - totalPaid;
  
  // Saldo Disponible: Ingresos Mensuales - Todos los gastos registrados
  const saldoActual = monthlyIncome - totalExpenses;

  const cards = [
    { 
      title: 'Ingresos del Mes', 
      amount: monthlyIncome, 
      icon: <Wallet size={24} />, 
      color: 'var(--accent-green)', 
      startBg: 'rgba(16, 185, 129, 0.1)' 
    },
    { 
      title: 'Gastos Totales', 
      amount: totalExpenses, 
      icon: <TrendingDown size={24} />, 
      color: 'var(--accent-red)', 
      startBg: 'rgba(239, 68, 68, 0.1)' 
    },
    { 
      title: 'Saldo Disponible', 
      amount: saldoActual, 
      icon: <DollarSign size={24} />, 
      color: saldoActual < 0 ? 'var(--accent-red)' : 'var(--accent-cyan)', 
      startBg: saldoActual < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)' 
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
      {cards.map((card, idx) => (
        <motion.div 
          key={card.title}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
          className="glass-card" 
          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}
        >
          <div style={{ 
            width: 56, height: 56, borderRadius: 14, 
            background: card.startBg, border: `1px solid ${card.color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color,
            boxShadow: `0 0 15px ${card.color}20`
          }}>
            {card.icon}
          </div>
          <div>
            <p style={{ margin: '0 0 4px 0', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              {card.title}
            </p>
            <h2 style={{ margin: 0, fontSize: '2.25rem', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)', color: card.color === 'var(--accent-red)' && card.title === 'Saldo Disponible' ? card.color : 'inherit' }}>
              ${card.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </motion.div>
      ))}
      
      {/* Mini warning if there are pending debts */}
      {totalPending > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ gridColumn: '1 / -1', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 20px', borderRadius: '8px', borderLeft: '4px solid var(--accent-red)', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '0.5rem' }}
        >
          ⚠️ Tienes <strong>${totalPending.toFixed(2)}</strong> pendientes de pago.
        </motion.div>
      )}
    </div>
  );
}
