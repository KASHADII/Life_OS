import React, { useState, useEffect } from 'react';
import { AppState, View } from './types';
import { INITIAL_STATE } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import DSATracker from './components/DSATracker';
import Settings from './components/Settings';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from './services/database';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isBooting, setIsBooting] = useState(true);

  // Initial Load (Boot Sequence)
  useEffect(() => {
    const initSystem = async () => {
      const data = await db.connect();
      setState(data);
      setIsBooting(false);
    };
    initSystem();
  }, []);

  // Auto-Save Effect
  useEffect(() => {
    if (!isBooting) {
      db.save(state);
    }
  }, [state, isBooting]);

  const updateSettings = (newSettings: Partial<AppState['userSettings']>) => {
    setState(prev => ({
        ...prev,
        userSettings: { ...prev.userSettings, ...newSettings }
    }));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard state={state} />;
      case 'kanban':
        return <KanbanBoard tasks={state.tasks} setTasks={(tasks) => setState(prev => ({...prev, tasks: typeof tasks === 'function' ? tasks(prev.tasks) : tasks}))} />;
      case 'dsa':
        return <DSATracker problems={state.problems} setProblems={(probs) => setState(prev => ({...prev, problems: typeof probs === 'function' ? probs(prev.problems) : probs}))} />;
      case 'settings':
        return <Settings state={state} updateSettings={updateSettings} />;
      default:
        return <Dashboard state={state} />;
    }
  };

  if (isBooting) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden text-white">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
         
         <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="z-10 flex flex-col items-center"
         >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
                <span className="text-3xl font-bold text-white">A</span>
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight mb-2">Aditya's Life OS</h1>
            
            <div className="flex items-center gap-2 text-glass-muted text-sm mt-4">
               <Loader2 className="animate-spin" size={16} />
               <span>Initializing System...</span>
            </div>
         </motion.div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-purple-500/30 ${state.userSettings.theme === 'light' ? 'bg-slate-100 text-slate-900' : ''}`}>
        
        {/* Background Ambient Mesh Gradients */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-float" />
        </div>

        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

        <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10 h-screen overflow-y-auto relative z-10 scroll-smooth custom-scrollbar">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </main>
    </div>
  );
};

export default App;