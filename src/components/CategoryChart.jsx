import { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const DEFAULT_CATEGORIES = [
  { id: 'food', emoji: '🍔', label: 'Comida' },
  { id: 'transport', emoji: '🚗', label: 'Transporte' },
  { id: 'services', emoji: '💡', label: 'Servicios' },
  { id: 'entertainment', emoji: '🎬', label: 'Ocio' },
  { id: 'health', emoji: '🏥', label: 'Salud' },
  { id: 'shopping', emoji: '🛍️', label: 'Compras' },
  { id: 'invertions', emoji: '📈', label: 'Inversiones' },
  { id: 'other', emoji: '📦', label: 'Otros' }
];

const COLORS = [
  '#10B981', '#8B5CF6', '#3B82F6', '#F59E0B', '#EF4444', '#14B8A6', '#EC4899', '#6366F1'
];

export default function CategoryChart({ data, customCategories = [], dolarBlueRate, euroRate }) {
  const [viewCurrency, setViewCurrency] = useState('ARS');
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const expensesByCategory = {};
  let rawTotalExpenses = 0;

  data.forEach(row => {
    const amount = Number(row.amount) || 0;
    if (amount > 0) {
      if (!expensesByCategory[row.category]) {
        expensesByCategory[row.category] = 0;
      }
      expensesByCategory[row.category] += amount;
      rawTotalExpenses += amount;
    }
  });

  const getConvertedValue = (val) => {
    if (viewCurrency === 'USD' && dolarBlueRate) return val / dolarBlueRate;
    if (viewCurrency === 'EUR' && euroRate) return val / euroRate;
    return val;
  };

  const getCurrencySymbol = () => {
    if (viewCurrency === 'USD') return 'U$D';
    if (viewCurrency === 'EUR') return '€';
    return '$';
  };

  const chartData = Object.keys(expensesByCategory).map((catId, index) => {
    const categoryDef = allCategories.find(c => c.id === catId) || { id: catId, emoji: '💡', label: catId };
    return {
      name: categoryDef.label,
      emoji: categoryDef.emoji,
      value: getConvertedValue(expensesByCategory[catId]),
      rawAmount: expensesByCategory[catId],
      color: COLORS[index % COLORS.length]
    };
  }).sort((a, b) => b.value - a.value);

  const totalConverted = getConvertedValue(rawTotalExpenses);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ paddingBottom: '3rem' }}
    >
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Tus gastos</h2>
          <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-panel)', padding: '4px', borderRadius: '12px' }}>
            <button className={`btn ${viewCurrency === 'ARS' ? 'btn-primary' : ''}`} onClick={() => setViewCurrency('ARS')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>ARS</button>
            <button className={`btn ${viewCurrency === 'USD' ? 'btn-primary' : ''}`} onClick={() => setViewCurrency('USD')} disabled={!dolarBlueRate} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, opacity: dolarBlueRate ? 1 : 0.5 }}>USD</button>
            <button className={`btn ${viewCurrency === 'EUR' ? 'btn-primary' : ''}`} onClick={() => setViewCurrency('EUR')} disabled={!euroRate} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, opacity: euroRate ? 1 : 0.5 }}>EUR</button>
          </div>
        </div>
        
        {chartData.length > 0 ? (
          <>
            <div style={{ height: '300px', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' 
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  {getCurrencySymbol()} {totalConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total General</span>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chartData.map((item, i) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-panel)', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: 44, height: 44, borderRadius: '50%', background: `${item.color}20`,
                      color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', border: `2px solid ${item.color}40`
                    }}>
                      {item.emoji}
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600 }}>{item.name}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{getCurrencySymbol()} {item.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {((item.rawAmount / rawTotalExpenses) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <p>No hay gastos registrados en este mes.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
