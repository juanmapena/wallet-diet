import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Trash2, ArrowLeft, Receipt, DollarSign } from 'lucide-react';
import GroupDetail from './GroupDetail';

export default function SharedExpenses({ groups, setGroups, currentUser, dolarBlueRate, euroRate }) {
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const activeGroup = groups.find(g => g.id === activeGroupId);

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    const newGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName,
      members: [currentUser], // Creator is automatically a member
      expenses: []
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setIsCreatingGroup(false);
  };

  const handleDeleteGroup = (id, e) => {
    e.stopPropagation();
    if(window.confirm('¿Seguro que quieres eliminar este grupo de gastos compartidos?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const updateGroup = (updatedGroup) => {
    setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  };

  if (activeGroup) {
    return (
      <GroupDetail 
        group={activeGroup} 
        updateGroup={updateGroup} 
        onBack={() => setActiveGroupId(null)} 
        currentUser={currentUser} 
        dolarBlueRate={dolarBlueRate}
        euroRate={euroRate}
      />
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      key="shared-expenses-home"
    >
      <div className="glass-card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={24} color="var(--accent-cyan)" /> Gastos Compartidos
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Crea grupos para salidas, viajes o convivencia y divide los gastos fácilmente.
        </p>

        {isCreatingGroup ? (
          <form onSubmit={handleCreateGroup} style={{ marginTop: '1.5rem', display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="input-glass" 
              placeholder="Nombre del grupo (ej: Viaje a la costa)" 
              value={newGroupName} 
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ flex: 1 }}
              autoFocus
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 600 }}>Crear</button>
            <button type="button" className="btn" onClick={() => setIsCreatingGroup(false)} style={{ background: 'var(--bg-panel)' }}>Cancelar</button>
          </form>
        ) : (
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreatingGroup(true)}
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px', fontWeight: 600 }}
          >
            <Plus size={18} /> Nuevo Grupo
          </motion.button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {groups.map((group, idx) => {
            const totalExpenses = group.expenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
            
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass-card group-card"
                onClick={() => setActiveGroupId(group.id)}
                style={{ cursor: 'pointer', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              >
                <div style={{ position: 'absolute', top: 15, right: 15 }}>
                  <button onClick={(e) => handleDeleteGroup(group.id, e)} className="btn" style={{ padding: '6px', color: 'var(--text-secondary)' }} title="Eliminar grupo">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', paddingRight: '30px' }}>{group.name}</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={16} /> {group.members.length} {group.members.length === 1 ? 'Persona' : 'Personas'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Receipt size={16} /> {group.expenses.length} Gastos
                  </div>
                </div>

                <div style={{ background: 'var(--bg-panel)', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Grupo:</span>
                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {groups.length === 0 && !isCreatingGroup && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ background: 'var(--bg-panel)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Users size={32} opacity={0.5} />
            </div>
            No tienes grupos compartidos todavía. <br/>¡Crea uno para empezar a dividir gastos!
          </div>
        )}
      </div>
    </motion.div>
  );
}
