import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, LogOut, User, Lock, Edit3, Sun, Moon, CalendarDays, Users } from 'lucide-react';
import DataGrid from './components/DataGrid';
import SummaryStats from './components/SummaryStats';
import SharedExpenses from './components/SharedExpenses';
import CategoryChart from './components/CategoryChart';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

const getCurrentMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('gravity_theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStr());
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'shared'
  
  // Data states
  const [data, setData] = useState([]);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [incomeCurrency, setIncomeCurrency] = useState('ARS');
  const [customCategories, setCustomCategories] = useState([]);
  const [sharedGroups, setSharedGroups] = useState([]);
  const [dolarBlueRate, setDolarBlueRate] = useState(null);
  const [euroRate, setEuroRate] = useState(null);

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Edit Income State
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState('');

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gravity_theme', theme);
  }, [theme]);

  // Fetch Dolar Blue Rate & Euro Rate
  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.venta) setDolarBlueRate(resData.venta);
      })
      .catch(err => console.error("Error fetching Dolar Blue:", err));

    fetch('https://dolarapi.com/v1/cotizaciones/eur')
      .then(res => res.json())
      .then(resData => {
        if (resData && resData.venta) setEuroRate(resData.venta);
      })
      .catch(err => console.error("Error fetching Euro:", err));
  }, []);

  // Load data when user OR month changes
  useEffect(() => {
    if (currentUser && selectedMonth) {
      const savedData = localStorage.getItem(`gravity_finance_data_${currentUser}_${selectedMonth}`);
      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (e) {
          setData([]);
        }
      } else {
        setData([]);
      }

      const savedIncome = localStorage.getItem(`gravity_finance_income_${currentUser}_${selectedMonth}`);
      if (savedIncome) {
        setMonthlyIncome(Number(savedIncome) || 0);
      } else {
        setMonthlyIncome(0);
      }
      
      const savedIncomeCur = localStorage.getItem(`gravity_income_currency_${currentUser}_${selectedMonth}`);
      if (savedIncomeCur) setIncomeCurrency(savedIncomeCur);
      else setIncomeCurrency('ARS');

      const savedCategories = localStorage.getItem(`gravity_finance_categories_${currentUser}`);
      if (savedCategories) {
        try {
          setCustomCategories(JSON.parse(savedCategories));
        } catch (e) {
          setCustomCategories([]);
        }
      } else {
        setCustomCategories([]);
      }

      const savedGroups = localStorage.getItem(`gravity_finance_groups_${currentUser}`);
      if (savedGroups) {
        try {
          setSharedGroups(JSON.parse(savedGroups));
        } catch (e) {
          setSharedGroups([]);
        }
      } else {
        setSharedGroups([]);
      }
    }
  }, [currentUser, selectedMonth]);

  // Auto-save data on change
  useEffect(() => {
    if (currentUser && selectedMonth) {
      localStorage.setItem(`gravity_finance_data_${currentUser}_${selectedMonth}`, JSON.stringify(data));
      localStorage.setItem(`gravity_finance_income_${currentUser}_${selectedMonth}`, monthlyIncome.toString());
      localStorage.setItem(`gravity_income_currency_${currentUser}_${selectedMonth}`, incomeCurrency);
    }
  }, [data, monthlyIncome, incomeCurrency, currentUser, selectedMonth]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`gravity_finance_categories_${currentUser}`, JSON.stringify(customCategories));
      localStorage.setItem(`gravity_finance_groups_${currentUser}`, JSON.stringify(sharedGroups));
    }
  }, [customCategories, sharedGroups, currentUser]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setLoginError('Por favor ingresa usuario y contraseña.');
      return;
    }
    const users = JSON.parse(localStorage.getItem('gravity_auth') || '{}');
    if (users[username]) {
      if (users[username] === password) {
        setCurrentUser(username);
        setLoginError('');
      } else {
        setLoginError('Contraseña incorrecta.');
      }
    } else {
      users[username] = password;
      localStorage.setItem('gravity_auth', JSON.stringify(users));
      setCurrentUser(username);
      setLoginError('');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsername('');
    setPassword('');
    setData([]);
    setCustomCategories([]);
  };

  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    setMonthlyIncome(Number(tempIncome) || 0);
    setIsEditingIncome(false);
  };

  if (!currentUser) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <AnimatedBackground />
        
        <button className="btn heavy-glass" onClick={toggleTheme} style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="heavy-glass" 
          style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', zIndex: 10 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              style={{ 
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 1.5rem',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
              }}>
              <Wallet size={32} />
            </motion.div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Mis Finanzas</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>Gestión inteligente, sin estrés</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                className="input-glass" 
                placeholder="Nombre de usuario" 
                style={{ paddingLeft: '44px', paddingTop: '14px', paddingBottom: '14px' }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="input-glass" 
                placeholder="Contraseña" 
                style={{ paddingLeft: '44px', paddingTop: '14px', paddingBottom: '14px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <AnimatePresence>
              {loginError && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ color: 'var(--accent-red)', margin: 0, fontSize: '0.875rem', textAlign: 'center' }}>
                  {loginError}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button whileTap={{ scale: 0.95 }} type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '14px', fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px' }}>
              Ingresar a mi Billetera
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Dashboard calculations needed for sidebar
  const totalExpenses = data.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);

  // Helper for nice month display
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const [y, m] = selectedMonth.split('-');

  return (
    <div className="app-container">
      <header className="glass header">
        <div className="header-brand animate-fade-in">
          <div style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-green))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.4)'
          }}>
            <Wallet size={24} />
          </div>
          <div>
            <h1 style={{ marginTop: '0', marginBottom: '2px', fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', fontWeight: 700 }}>
              Mis Finanzas
            </h1>
            <p className="header-tagline">Hola, <strong style={{color: 'var(--accent-cyan)'}}>{currentUser}</strong></p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="btn" title="Activar/Desactivar Modo Oscuro">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="btn" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--accent-red)' }}>
            <LogOut size={16} /> <span style={{ '@media (max-width: 600px)': { display: 'none' } }}>Salir</span>
          </button>
        </div>
      </header>
      
      <main className="main-content">
        {activeTab === 'personal' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={`personal-${selectedMonth}`}
          >
            {/* Controls Bar: Income and Month Selector */}
            <div className="glass-card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: '1 1 min-content' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>Tus Ingresos Mensuales</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Define con cuánto dinero cuentas este mes.</p>
              
              <div style={{ marginTop: '0.75rem' }}>
                {isEditingIncome ? (
                  <form onSubmit={handleIncomeSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <select className="input-glass" value={incomeCurrency} onChange={e => setIncomeCurrency(e.target.value)} style={{ padding: '12px', width: '90px', borderRadius: '12px' }}>
                      <option value="ARS">ARS</option>
                      {dolarBlueRate && <option value="USD">USD</option>}
                      {euroRate && <option value="EUR">EUR</option>}
                    </select>
                    <input 
                      type="number" 
                      className="input-glass" 
                      value={tempIncome} 
                      autoFocus
                      onChange={(e) => setTempIncome(e.target.value)} 
                      placeholder="Por ej: 1500"
                      style={{ width: '150px' }}
                    />
                    <button type="submit" className="btn btn-primary">Guardar</button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem, 5vw, 2rem)', color: 'var(--accent-green)', letterSpacing: '-0.03em' }}>
                      {incomeCurrency === 'USD' ? 'U$D' : incomeCurrency === 'EUR' ? '€' : '$'} {monthlyIncome.toLocaleString()}
                    </h2>
                    <button onClick={() => { setTempIncome(monthlyIncome); setIsEditingIncome(true); }} className="btn" style={{ padding: '8px', borderRadius: '50%' }}>
                      <Edit3 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Month Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-panel)', padding: '10px 16px', borderRadius: '16px', border: '1px solid var(--border-color)', minWidth: '180px' }}>
              <CalendarDays size={22} color="var(--accent-cyan)" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Mes Actual</span>
                <input 
                  type="month" 
                  value={selectedMonth}
                  onChange={(e) => {
                    if (e.target.value) setSelectedMonth(e.target.value);
                  }}
                  style={{ 
                    background: 'transparent', border: 'none', color: 'var(--text-primary)', 
                    fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, outline: 'none', cursor: 'pointer',
                    marginTop: '2px', padding: 0
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <SummaryStats data={data} monthlyIncome={monthlyIncome} incomeCurrency={incomeCurrency} dolarBlueRate={dolarBlueRate} euroRate={euroRate} />
            <DataGrid 
              data={data} 
              setData={setData} 
              selectedMonth={selectedMonth} 
              customCategories={customCategories}
              setCustomCategories={setCustomCategories}
              dolarBlueRate={dolarBlueRate}
              euroRate={euroRate}
            />
          </div>

          </motion.div>
        )}

        {activeTab === 'shared' && (
          <SharedExpenses 
            groups={sharedGroups} 
            setGroups={setSharedGroups} 
            currentUser={currentUser}
            dolarBlueRate={dolarBlueRate}
            euroRate={euroRate}
          />
        )}

        {activeTab === 'stats' && (
          <CategoryChart 
            data={data}
            customCategories={customCategories}
            dolarBlueRate={dolarBlueRate}
            euroRate={euroRate}
          />
        )}
      </main>

      {currentUser && (
        <nav className="bottom-nav">
          <button 
            className={`nav-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <Wallet size={24} />
            <span>Personal</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            <Users size={24} />
            <span>Compartidos</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            <span>Estadísticas</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
