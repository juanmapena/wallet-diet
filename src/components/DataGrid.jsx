import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

const CATEGORIES = [
  { id: 'food', emoji: '🍔', label: 'Comida' },
  { id: 'transport', emoji: '🚗', label: 'Transporte' },
  { id: 'services', emoji: '💡', label: 'Servicios' },
  { id: 'entertainment', emoji: '🎬', label: 'Ocio' },
  { id: 'health', emoji: '🏥', label: 'Salud' },
  { id: 'shopping', emoji: '🛍️', label: 'Compras' },
  { id: 'invertions', emoji: '📈', label: 'Inversiones' },
  { id: 'other', emoji: '📦', label: 'Otros' }
];

export default function DataGrid({ data, setData, selectedMonth, customCategories = [], setCustomCategories, dolarBlueRate, euroRate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '', person: 'Yo', description: '', category: 'other', amount: '', status: 'unpaid', currency: 'ARS'
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ emoji: '✨', label: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const allCategories = [...CATEGORIES, ...customCategories];

  const handleCellChange = (id, field, value) => {
    setData(data.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const deleteRow = (id) => {
    setData(data.filter(row => row.id !== id));
  };

  const openAddModal = () => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dateValue = selectedMonth === currentMonthStr ? now.toISOString().split('T')[0] : `${selectedMonth}-01`;

    setFormData({
      date: dateValue, person: 'Yo', description: '', category: 'other', amount: '', status: 'unpaid', currency: 'ARS'
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    
    let finalAmount = formData.amount;
    let finalDescription = formData.description;
    
    if (formData.currency === 'USD' && dolarBlueRate) {
      finalAmount = (Number(formData.amount) * dolarBlueRate).toFixed(2);
      finalDescription = `${formData.description} (U$D ${formData.amount} x $${dolarBlueRate})`;
    } else if (formData.currency === 'EUR' && euroRate) {
      finalAmount = (Number(formData.amount) * euroRate).toFixed(2);
      finalDescription = `${formData.description} (€ ${formData.amount} x $${euroRate.toFixed(2)})`;
    }

    const newRow = {
      id: Date.now().toString(),
      ...formData,
      amount: finalAmount,
      description: finalDescription
    };
    setData([...data, newRow]);
    setIsModalOpen(false);
    setIsAddingCategory(false);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!newCategory.label.trim()) return;
    const catId = `custom_${Date.now()}`;
    const newCat = { id: catId, emoji: newCategory.emoji || '📦', label: newCategory.label };
    setCustomCategories([...customCategories, newCat]);
    setFormData({ ...formData, category: catId });
    setNewCategory({ emoji: '✨', label: '' });
    setIsAddingCategory(false);
    setShowEmojiPicker(false);
  };

  const getStatusColor = (status) => {
    return status === 'paid' ? 'var(--accent-green)' : 'var(--accent-red)';
  };

  return (
    <div className="glass-card" style={{ padding: 'clamp(1rem, 2vw, 1.5rem)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Transacciones y Gastos</h3>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="btn btn-primary animate-fade-in"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', fontWeight: 600 }}
        >
          <Plus size={18} /> Añadir Fila
        </motion.button>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="transactions-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Persona</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Descripción</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Categoría</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Monto</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                  className="table-row"
                >
                  <td data-label="Fecha" style={{ padding: '12px' }}>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => handleCellChange(row.id, 'date', e.target.value)}
                      className="td-input text-bold"
                    />
                  </td>
                  <td data-label="Persona" style={{ padding: '12px' }}>
                    <input
                      type="text"
                      value={row.person}
                      onChange={(e) => handleCellChange(row.id, 'person', e.target.value)}
                      placeholder="Ej: Yo, Juan"
                      className="td-input"
                    />
                  </td>
                  <td data-label="Descripción" style={{ padding: '12px' }}>
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleCellChange(row.id, 'description', e.target.value)}
                      placeholder="Descripción del gasto"
                      className="td-input text-bold"
                    />
                  </td>
                  <td data-label="Categoría" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-panel)', padding: '4px 12px', borderRadius: '12px', width: 'fit-content' }}>
                      <select
                        value={row.category}
                        onChange={(e) => handleCellChange(row.id, 'category', e.target.value)}
                        className="select-input"
                      >
                        {allCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td data-label="Monto" style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-secondary)', marginRight: '4px' }}>$</span>
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleCellChange(row.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        className="td-input text-bold"
                        style={{ width: '80px', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </td>
                  <td data-label="Estado" style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleCellChange(row.id, 'status', row.status === 'paid' ? 'unpaid' : 'paid')}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: row.status === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: getStatusColor(row.status),
                        border: `1px solid ${getStatusColor(row.status)}40`,
                        width: '110px'
                      }}
                    >
                      {row.status === 'paid' ? '✓ Pagado' : '○ Pendiente'}
                    </button>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }} className="actions-cell">
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="btn"
                      style={{ padding: '8px', color: 'var(--accent-red)' }}
                      title="Eliminar fila"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {data.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1.5rem', background: 'var(--bg-panel)', borderRadius: '50%' }}>
                      <Plus size={32} opacity={0.5} />
                    </div>
                    No hay transacciones guardadas. Presiona "Añadir Fila".
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE ADD ROW MODAL (Rendered at root via Portal to avoid clipping) */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="modal-overlay">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="modal-content heavy-glass"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>Nueva Transacción</h3>
                  <button className="btn" type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSaveModal} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label>Fecha del Gasto</label>
                    <input type="date" required className="input-glass" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ padding: '12px' }} />
                  </div>

                  <div className="form-group">
                    <label>Persona (Quién pagó)</label>
                    <input type="text" required placeholder="Ej: Yo, Juan, María" className="input-glass" value={formData.person} onChange={e => setFormData({ ...formData, person: e.target.value })} style={{ padding: '12px' }} />
                  </div>

                  <div className="form-group">
                    <label>Descripción del Gasto</label>
                    <input type="text" required placeholder="Ej: Supermercado, Alquiler" className="input-glass" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ padding: '12px' }} />
                  </div>

                  <div className="form-group">
                    <label>Categoría</label>
                    {isAddingCategory ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                          <button 
                            type="button" 
                            className="input-glass" 
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            style={{ width: '60px', height: '44px', padding: 0, textAlign: 'center', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                          >
                            {newCategory.emoji}
                          </button>
                          {showEmojiPicker && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 3000, marginTop: '5px' }}>
                              <EmojiPicker 
                                onEmojiClick={(emojiObj) => {
                                  setNewCategory({...newCategory, emoji: emojiObj.emoji});
                                  setShowEmojiPicker(false);
                                }}
                                theme="auto"
                                searchDisabled={true}
                                width={280}
                                height={350}
                              />
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          className="input-glass"
                          placeholder="Nombre (ej: Gimnasio)"
                          value={newCategory.label}
                          onChange={e => setNewCategory({ ...newCategory, label: e.target.value })}
                          style={{ flex: 1, padding: '12px' }}
                        />
                        <button type="button" onClick={handleSaveCategory} className="btn btn-primary" style={{ padding: '12px', borderRadius: '12px', fontWeight: 600 }}>Guardar</button>
                        <button type="button" onClick={() => setIsAddingCategory(false)} className="btn" style={{ padding: '12px', background: 'var(--bg-panel)', borderRadius: '12px' }}><X size={18} /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select className="input-glass" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ flex: 1, padding: '12px' }}>
                          {allCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                          ))}
                        </select>
                        <button type="button" onClick={() => setIsAddingCategory(true)} className="btn" style={{ padding: '0 16px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }} title="Nueva Categoría">
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Monto a Pagar</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          className="input-glass" 
                          value={formData.currency} 
                          onChange={e => setFormData({ ...formData, currency: e.target.value })} 
                          style={{ padding: '12px', width: '90px' }}
                          disabled={!dolarBlueRate && !euroRate}
                        >
                          <option value="ARS">ARS</option>
                          {dolarBlueRate && <option value="USD">USD</option>}
                          {euroRate && <option value="EUR">EUR</option>}
                        </select>
                        <input type="number" step="any" required placeholder={formData.currency !== 'ARS' ? "Ej: 100" : "Ej: 1500.50"} className="input-glass" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} style={{ padding: '12px', flex: 1 }} />
                      </div>
                      
                      {formData.currency === 'USD' && dolarBlueRate && (
                        <small style={{ color: 'var(--accent-cyan)', display: 'block', marginTop: '4px' }}>
                          ≈ ${(Number(formData.amount || 0) * dolarBlueRate).toLocaleString()} ARS (Blue: ${dolarBlueRate})
                        </small>
                      )}
                      
                      {formData.currency === 'EUR' && euroRate && (
                        <small style={{ color: 'var(--accent-cyan)', display: 'block', marginTop: '4px' }}>
                          ≈ ${(Number(formData.amount || 0) * euroRate).toLocaleString()} ARS (Euro: ${euroRate.toFixed(2)})
                        </small>
                      )}
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Estado</label>
                      <select className="input-glass" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ padding: '12px' }}>
                        <option value="unpaid">○ Pendiente</option>
                        <option value="paid">✓ Pagado</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontWeight: 600 }}>Guardar Fila</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
