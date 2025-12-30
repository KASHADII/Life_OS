import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, Clock, ExternalLink, Lightbulb, PlayCircle, RefreshCcw, Plus, CheckCircle2, Trash2 } from 'lucide-react';
import { DateTime } from 'luxon';
import { DSAProblem, SRSStage, AppState } from '../types';
import GlassCard from './GlassCard';
import { SRS_INTERVALS } from '../constants';
import { getDSAHint } from '../services/geminiService';
import AddProblemModal from './AddProblemModal';

interface DSATrackerProps {
  problems: DSAProblem[];
  setProblems: React.Dispatch<React.SetStateAction<DSAProblem[]>>;
}

const DSATracker: React.FC<DSATrackerProps> = ({ problems, setProblems }) => {
  const [filter, setFilter] = useState<'Due' | 'All' | 'Mastered'>('Due');
  const [activeHintId, setActiveHintId] = useState<string | null>(null);
  const [hintContent, setHintContent] = useState<string>('');
  const [loadingHint, setLoadingHint] = useState(false);
  
  // Add Problem State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const getFilteredProblems = () => {
    const zone = 'Asia/Kolkata';
    const now = DateTime.now().setZone(zone).startOf('day');
    if (filter === 'Mastered') return problems.filter(p => p.status === 'Mastered');
    if (filter === 'Due') return problems.filter(p => {
      const next = DateTime.fromISO(p.nextReview, { zone }).startOf('day');
      return p.status !== 'Mastered' && next <= now;
    });
    return problems;
  };

  const handleReview = (id: string, success: boolean) => {
    setProblems(prev => prev.map(p => {
        if (p.id !== id) return p;

        if (success) {
            const zone = 'Asia/Kolkata';
            const now = DateTime.now().setZone(zone);
            const nextStage = Math.min(p.stage + 1, 5) as SRSStage;
            const isMastered = nextStage === 5 && p.stage === 5; // Simplified mastery logic
            return {
                ...p,
                lastReviewed: now.toISO(),
                nextReview: now.plus({ days: SRS_INTERVALS[nextStage] }).toISO(),
                stage: nextStage,
                status: isMastered ? 'Mastered' : 'Learning'
            };
        } else {
            const zone = 'Asia/Kolkata';
            const now = DateTime.now().setZone(zone);
            // Reset if failed
            return {
                ...p,
                stage: 1,
                lastReviewed: now.toISO(),
                nextReview: now.plus({ days: 1 }).toISO(),
            };
        }
    }));
  };

  const fetchHint = async (problem: DSAProblem) => {
      if (activeHintId === problem.id) {
          setActiveHintId(null);
          return;
      }
      setActiveHintId(problem.id);
      setLoadingHint(true);
      const hint = await getDSAHint(problem.title, problem.topic);
      setHintContent(hint);
      setLoadingHint(false);
  };

  const handleAddProblem = (newProblem: DSAProblem) => {
    setProblems(prev => [...prev, newProblem]);
    
    // Check if the new problem is due today, if so switch to Due filter or All to show it
    const zone = 'Asia/Kolkata';
    const now = DateTime.now().setZone(zone);
    const next = DateTime.fromISO(newProblem.nextReview, { zone });
    const isDue = next <= now;
    if (isDue && filter === 'Mastered') setFilter('Due');

    // Show Toast
    setToast({ message: 'DSA problem added successfully!', visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const deleteProblem = (id: string) => {
    setProblems(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
            <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-8 left-1/2 z-[150] flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl shadow-xl"
            >
                <div className="bg-emerald-500 text-white rounded-full p-1">
                    <CheckCircle2 size={16} />
                </div>
                <span className="text-emerald-100 font-medium text-sm">{toast.message}</span>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
         <div>
            <h2 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                <Brain className="text-pink-400" /> Spaced Repetition
            </h2>
            <p className="text-glass-muted text-sm mt-1">Review problems at optimal intervals to never forget.</p>
         </div>
         
         <div className="flex items-center gap-4">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {['Due', 'All', 'Mastered'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            filter === f 
                            ? 'bg-pink-500/20 text-pink-300 shadow-lg' 
                            : 'text-glass-muted hover:text-white'
                        }`}
                    >
                        {f}
                    </button>
                ))}
             </div>

             <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl backdrop-blur-md shadow-lg transition-all group"
             >
                <Plus size={18} className="text-pink-300 group-hover:text-white transition-colors" />
                <span className="font-medium hidden sm:inline">Add Problem</span>
             </motion.button>
         </div>
      </div>

      <div className="grid gap-4">
        {getFilteredProblems().length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <Brain size={48} className="mx-auto text-glass-muted mb-4 opacity-50" />
                <p className="text-lg text-white font-medium">No problems found</p>
                <p className="text-sm text-glass-muted mt-1">Time to add some new challenges!</p>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-6 px-6 py-2 bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 rounded-xl text-sm font-medium transition-colors"
                >
                    Add Your First Problem
                </button>
            </div>
        ) : (
            getFilteredProblems().map(problem => (
                <GlassCard key={problem.id} className="group relative overflow-visible">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                    problem.difficulty === 'Easy' ? 'border-green-500/30 text-green-400 bg-green-500/10' :
                                    problem.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                    'border-red-500/30 text-red-400 bg-red-500/10'
                                }`}>
                                    {problem.difficulty}
                                </span>
                                <div className="flex gap-2">
                                    {problem.topic.map(t => (
                                        <span key={t} className="text-xs text-glass-muted bg-white/5 px-2 py-0.5 rounded">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                {problem.title}
                                {problem.link && (
                                    <a href={problem.link} target="_blank" rel="noreferrer" className="text-glass-muted hover:text-blue-400 transition-colors">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </h3>
                            {problem.notes && (
                                <p className="text-xs text-glass-muted mt-1 line-clamp-1 opacity-70 italic">"{problem.notes}"</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-glass-muted">
                                <span className="flex items-center gap-1">
                                    <Clock size={12} /> Next Review: {DateTime.fromISO(problem.nextReview).setZone('Asia/Kolkata').toFormat('MMM d')}
                                </span>
                                <span className="flex items-center gap-1">
                                    <RefreshCcw size={12} /> Stage: {problem.stage}/5
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                             <button
                                onClick={() => deleteProblem(problem.id)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                                title="Delete problem"
                             >
                                <Trash2 size={18} />
                             </button>

                             <button 
                                onClick={() => fetchHint(problem)}
                                className="p-2 rounded-lg bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 transition-colors"
                                title="Get AI Hint"
                             >
                                <Lightbulb size={20} />
                             </button>
                             
                             <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

                             <button 
                                onClick={() => handleReview(problem.id, false)}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium"
                             >
                                Forgot
                             </button>
                             <button 
                                onClick={() => handleReview(problem.id, true)}
                                className="px-4 py-2 rounded-lg bg-green-500/10 text-green-300 hover:bg-green-500/20 border border-green-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                             >
                                <Check size={16} /> Reviewed
                             </button>
                        </div>
                    </div>

                    {/* AI Hint Section */}
                    {activeHintId === problem.id && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-4 p-4 bg-indigo-900/30 rounded-xl border border-indigo-500/20 text-sm text-indigo-100"
                        >
                            {loadingHint ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce" />
                                    <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce delay-75" />
                                    <div className="w-3 h-3 rounded-full bg-indigo-400 animate-bounce delay-150" />
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                                    <p>{hintContent}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </GlassCard>
            ))
        )}
      </div>

      <AddProblemModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProblem}
      />
    </div>
  );
};

export default DSATracker;