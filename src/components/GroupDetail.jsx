import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, Plus, X, Receipt, Calculator } from 'lucide-react';

export default function GroupDetail({ group, updateGroup, onBack, currentUser, dolarBlueRate, euroRate }) {
  const [newMemberName, setNewMemberName] = useState('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [viewCurrency, setViewCurrency] = useState('ARS');
  
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: currentUser,
    splitType: 'equal',
    currency: 'ARS'
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    if (group.members.includes(newMemberName)) return; // No duplicates
    
    updateGroup({
      ...group,
      members: [...group.members, newMemberName]
    });
    setNewMemberName('');
  };

  const handleRemoveMember = (member) => {
    if (member === currentUser) {
      alert("No puedes eliminarte a ti mismo del grupo.");
      return;
    }
    // Check if member is involved in any expenses (paidBy)
    const hasPaid = group.expenses.some(exp => exp.paidBy === member);
    if (hasPaid) {
      alert("No puedes eliminar a un miembro que ha pagado gastos.");
      return;
    }
    
    updateGroup({
      ...group,
      members: group.members.filter(m => m !== member)
    });
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.description) return;

    let finalAmount = expenseForm.amount;
    let finalDescription = expenseForm.description;
    
    if (expenseForm.currency === 'USD' && dolarBlueRate) {
      finalAmount = (Number(expenseForm.amount) * dolarBlueRate).toFixed(2);
      finalDescription = `${expenseForm.description} (U$D ${expenseForm.amount} x $${dolarBlueRate})`;
    } else if (expenseForm.currency === 'EUR' && euroRate) {
      finalAmount = (Number(expenseForm.amount) * euroRate).toFixed(2);
      finalDescription = `${expenseForm.description} (€ ${expenseForm.amount} x $${euroRate.toFixed(2)})`;
    }

    const newExpense = {
      id: `exp_${Date.now()}`,
      description: finalDescription,
      amount: Number(finalAmount),
      paidBy: expenseForm.paidBy,
      date: new Date().toISOString(),
      splitType: expenseForm.splitType,
      involved: group.members // for equal split, everyone is involved
    };

    updateGroup({
      ...group,
      expenses: [...group.expenses, newExpense]
    });

    setExpenseForm({ description: '', amount: '', paidBy: currentUser, splitType: 'equal', currency: 'ARS' });
    setIsAddingExpense(false);
  };

  // Calculate balances
  // Positive = owes money (debt)
  // Negative = owed money (credit)
  // Wait, let's follow Tricount: Positive = they owe YOU (or they are owed).
  // Let's use: balance = (Amount Paid) - (Share of Expenses).
  // If balance > 0 => They are owed money (Te deben).
  // If balance < 0 => They owe money (Debes).
  
  const balances = {};
  group.members.forEach(m => balances[m] = 0);

  group.expenses.forEach(exp => {
    // Add to the person who paid
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += exp.amount;
    }
    
    // Subtract from everyone involved
    const splitAmount = exp.amount / exp.involved.length;
    exp.involved.forEach(m => {
      if (balances[m] !== undefined) {
        balances[m] -= splitAmount;
      }
    });
  });

  // Get initials for avatar
  const getInitials = (name) => {
    return name.substring(0, 2).toUpperCase();
  };

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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="group-detail-view"
    >
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <button onClick={onBack} className="btn" style={{ padding: '8px 12px', marginBottom: '1rem', background: 'var(--bg-panel)', borderRadius: '12px' }}>
          <ArrowLeft size={18} /> Volver
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.75rem', color: 'var(--text-primary)' }}>{group.name}</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Resumen y Saldos</p>
          </div>
          <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-panel)', padding: '4px', borderRadius: '12px' }}>
            <button className={`btn ${viewCurrency === 'ARS' ? 'btn-primary' : ''}`} onClick={() => setViewCurrency('ARS')} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>ARS</button>
            <button className={`btn ${viewCurrency === 'USD' ? 'btn-primary' : ''}`} onClick={() => setViewCurrency('USD')} disabled={!dolarBlueRate} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, opacity: dolarBlueRate ? 1 : 0.5 }}>USD</button>
            <button className={`btn ${viewCurrency === 'EUR' ? 'btn-primary' : ''}`} onClick={() => setViewCurrency('EUR')} disabled={!euroRate} style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, opacity: euroRate ? 1 : 0.5 }}>EUR</button>
          </div>
        </div>

        {/* Member Balances Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {group.members.map(member => {
            const bal = balances[member];
            const isMe = member === currentUser;
            const isPositive = bal > 0.01;
            const isNegative = bal < -0.01;
            
            let cardBg = 'var(--bg-panel)';
            let borderColor = 'var(--border-color)';
            let textColor = 'var(--text-primary)';
            let statusText = 'Al día';

            if (isPositive) {
              cardBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.1))';
              borderColor = 'rgba(16, 185, 129, 0.3)';
              textColor = 'var(--accent-green)';
              statusText = isMe ? 'Te deben' : 'Le deben';
            } else if (isNegative) {
              cardBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(249, 115, 22, 0.1))';
              borderColor = 'rgba(239, 68, 68, 0.3)';
              textColor = 'var(--accent-red)';
              statusText = isMe ? 'Estás debiendo' : 'Debe';
            }

            return (
              <div key={member} style={{ background: cardBg, border: `1px solid ${borderColor}`, padding: '1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-card)', border: `2px solid ${textColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: textColor }}>
                  {getInitials(member)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{member} {isMe && '(Tú)'}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{statusText}</p>
                  {(isPositive || isNegative) && (
                    <strong style={{ margin: 0, fontSize: '1.1rem', color: textColor }}>
                      {getCurrencySymbol()} {Math.abs(getConvertedValue(bal)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Member Form */}
        <div style={{ background: 'var(--bg-panel)', padding: '1rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem' }}>Miembros del Grupo</h4>
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Nombre del amigo" 
              value={newMemberName} 
              onChange={e => setNewMemberName(e.target.value)} 
              style={{ flex: 1, padding: '10px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', borderRadius: '10px' }}>
              <UserPlus size={18} />
            </button>
          </form>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            {group.members.map(m => (
              <div key={m} style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid var(--border-color)' }}>
                {m}
                {m !== currentUser && <button type="button" onClick={() => handleRemoveMember(m)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 0 }}><X size={14} /></button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}><Receipt size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Gastos del Grupo</h3>
          <button onClick={() => setIsAddingExpense(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontWeight: 600 }}>
            <Plus size={18} /> Añadir Gasto
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {group.expenses.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Aún no hay gastos en este grupo.
            </div>
          ) : (
            group.expenses.map(exp => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-panel)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }} title={`Pagado por ${exp.paidBy}`}>
                    {getInitials(exp.paidBy)}
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '1rem' }}>{exp.description}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{exp.paidBy} pagó • Div en {exp.involved.length}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {getCurrencySymbol()} {getConvertedValue(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddingExpense && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="modal-content heavy-glass"
              style={{ width: '90%', maxWidth: '400px', padding: '1.5rem', borderRadius: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Nuevo Gasto Compartido</h3>
                <button className="btn" type="button" onClick={() => setIsAddingExpense(false)} style={{ padding: '8px' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label>¿Qué es? (Descripción)</label>
                  <input type="text" required className="input-glass" placeholder="Ej: Cena, Nafta" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} style={{ padding: '12px' }} />
                </div>

                <div className="form-group">
                  <label>¿Cuánto y en qué moneda?</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      className="input-glass" 
                      value={expenseForm.currency} 
                      onChange={e => setExpenseForm({...expenseForm, currency: e.target.value})} 
                      style={{ padding: '12px', width: '90px' }}
                      disabled={!dolarBlueRate && !euroRate}
                    >
                      <option value="ARS">ARS</option>
                      {dolarBlueRate && <option value="USD">USD</option>}
                      {euroRate && <option value="EUR">EUR</option>}
                    </select>
                    <input 
                      type="number" 
                      required 
                      className="input-glass" 
                      placeholder={expenseForm.currency !== 'ARS' ? "Ej: 100" : "Ej: 15000"} 
                      value={expenseForm.amount} 
                      onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} 
                      style={{ padding: '12px', flex: 1 }} 
                    />
                  </div>
                  {expenseForm.currency === 'USD' && dolarBlueRate && (
                    <small style={{ color: 'var(--accent-cyan)', display: 'block', marginTop: '4px' }}>
                      ≈ ${(Number(expenseForm.amount || 0) * dolarBlueRate).toLocaleString()} ARS
                    </small>
                  )}
                  {expenseForm.currency === 'EUR' && euroRate && (
                    <small style={{ color: 'var(--accent-cyan)', display: 'block', marginTop: '4px' }}>
                      ≈ ${(Number(expenseForm.amount || 0) * euroRate).toLocaleString()} ARS
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label>¿Quién pagó?</label>
                  <select className="input-glass" value={expenseForm.paidBy} onChange={e => setExpenseForm({...expenseForm, paidBy: e.target.value})} style={{ padding: '12px' }}>
                    {group.members.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>¿Cómo se divide?</label>
                  <select className="input-glass" value={expenseForm.splitType} onChange={e => setExpenseForm({...expenseForm, splitType: e.target.value})} style={{ padding: '12px' }}>
                    <option value="equal">Partes iguales (entre todos)</option>
                    {/* Más opciones se pueden agregar aquí: por porcentajes, montos exactos */}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn" onClick={() => setIsAddingExpense(false)} style={{ flex: 1, padding: '14px', background: 'var(--bg-panel)', borderRadius: '12px' }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 600 }}>Añadir</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
