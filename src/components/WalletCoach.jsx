import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Sparkles } from 'lucide-react';

export default function WalletCoach({ data, monthlyIncome, incomeCurrency = 'ARS', dolarBlueRate, euroRate }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Solo mostramos bienvenida si está vacío
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: '¡Hola! Soy tu Inteligencia Artificial Financiera. Puedo analizar tus gastos del mes y aconsejarte de forma privada. Pregúntame, por ejemplo: "¿Me puedo comprar unas zapatillas de $50k hoy?"'
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateTotalExpenses = () => {
    return data.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;

    const userText = inputVal.trim();
    const newMessages = [...messages, { id: Date.now().toString(), role: 'user', text: userText }];
    setMessages(newMessages);
    setInputVal('');
    setIsLoading(true);

    // Context preparation
    const totalExp = calculateTotalExpenses();
    const balance = monthlyIncome - totalExp;
    
    const expByCategory = {};
    data.forEach(r => {
      const amt = Number(r.amount) || 0;
      if (amt > 0) {
        expByCategory[r.category] = (expByCategory[r.category] || 0) + amt;
      }
    });

    const categoriesStr = Object.entries(expByCategory).map(([cat, val]) => `${cat}: $${val}`).join(', ');

    const contextData = {
      monthlyIncome,
      incomeCurrency,
      totalExp,
      balance,
      categoriesStr,
      dolarBlueRate,
      euroRate
    };

    try {
      // LLAMADA AL BACKEND DE NETLIFY en vez de la API de Google
      const payloadMessages = newMessages.filter(m => m.id !== 'welcome');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: payloadMessages,
          contextData: contextData
        })
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        throw new Error(resData.error || 'Error conectando con el servidor Coach');
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: resData.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err_' + Date.now().toString(), role: 'model', text: `Oops, hubo un error de conexión con mi servidor: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', maxWidth: '600px', margin: '0 auto' }}
    >
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Wallet Coach</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)' }}>● Servidor Protegido</span>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ 
                background: isUser ? 'var(--accent-cyan)' : 'var(--bg-panel)',
                color: isUser ? '#fff' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: isUser ? '16px 16px 0 16px' : '16px 16px 16px 0',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                border: isUser ? 'none' : '1px solid var(--border-color)',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            <div style={{ background: 'var(--bg-panel)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', border: '1px solid var(--border-color)', display: 'flex', gap: '4px' }}>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>●</motion.span>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>●</motion.span>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>●</motion.span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Pregúntame algo sobre tus gastos..."
          className="input-glass"
          disabled={isLoading}
          style={{ flex: 1, padding: '14px 18px', borderRadius: '20px' }}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isLoading || !inputVal.trim()}
          style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
}
