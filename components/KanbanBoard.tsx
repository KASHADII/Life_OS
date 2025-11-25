import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, Calendar, Tag, Wand2 } from 'lucide-react';
import { Task, TaskStatus, AppState, Category } from '../types';
import GlassCard from './GlassCard';
import { v4 as uuidv4 } from 'uuid';
import { breakdownTask } from '../services/geminiService';

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const COLUMNS: TaskStatus[] = ['Todo', 'In Progress', 'Blocked', 'Completed'];

const CATEGORY_COLORS: Record<Category, string> = {
  'DSA': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'WebDev': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'ML': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Personal': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Internship': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, setTasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Category>('Personal');
  const [aiLoading, setAiLoading] = useState(false);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle,
      category: newTaskCategory,
      status: 'Todo',
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setIsModalOpen(false);
  };

  const handleAiBreakdown = async () => {
      if(!newTaskTitle) return;
      setAiLoading(true);
      const subtasks = await breakdownTask(newTaskTitle);
      
      const newTasks: Task[] = subtasks.map(st => ({
          id: uuidv4(),
          title: st,
          category: newTaskCategory,
          status: 'Todo',
          createdAt: new Date().toISOString(),
          description: `Subtask of: ${newTaskTitle}`
      }));

      // Add parent task too
      const parentTask: Task = {
          id: uuidv4(),
          title: newTaskTitle,
          category: newTaskCategory,
          status: 'Todo',
          createdAt: new Date().toISOString()
      };

      setTasks(prev => [...prev, parentTask, ...newTasks]);
      setNewTaskTitle('');
      setAiLoading(false);
      setIsModalOpen(false);
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-display font-bold text-white">Task Board</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors shadow-lg shadow-purple-900/50 font-medium"
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[1000px] h-full">
          {COLUMNS.map(col => (
            <div 
              key={col} 
              className="flex-1 flex flex-col min-w-[280px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-semibold text-glass-muted uppercase tracking-wider text-xs">{col}</h3>
                <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
                  {tasks.filter(t => t.status === col).length}
                </span>
              </div>
              
              <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/10">
                <div className="space-y-3">
                  <AnimatePresence>
                    {tasks.filter(t => t.status === col).map(task => (
                      <motion.div
                        key={task.id}
                        layoutId={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e as any, task.id)}
                        className="bg-slate-800/50 p-4 rounded-xl border border-white/10 cursor-grab active:cursor-grabbing hover:border-purple-500/50 hover:shadow-lg transition-all group relative"
                      >
                         <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] px-2 py-1 rounded-md border ${CATEGORY_COLORS[task.category]}`}>
                                {task.category}
                            </span>
                            <button className="text-glass-muted opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">
                                <MoreHorizontal size={16} />
                            </button>
                         </div>
                         <h4 className="text-white font-medium text-sm leading-snug mb-3">{task.title}</h4>
                         {task.description && <p className="text-xs text-glass-muted mb-3">{task.description}</p>}
                         <div className="flex items-center gap-3 text-xs text-glass-muted">
                            {task.dueDate && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <GlassCard className="w-full max-w-md mx-4 bg-[#0f172a]">
              <h3 className="text-xl font-bold mb-4">Add New Task</h3>
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 mb-4 focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(Object.keys(CATEGORY_COLORS) as Category[]).map(cat => (
                    <button
                        key={cat}
                        onClick={() => setNewTaskCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            newTaskCategory === cat ? CATEGORY_COLORS[cat] : 'border-white/10 text-glass-muted hover:bg-white/5'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
              </div>
              <div className="flex gap-3">
                 <button 
                    onClick={addTask}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-xl transition-colors font-medium"
                 >
                    Add Task
                 </button>
                 <button
                    onClick={handleAiBreakdown}
                    disabled={aiLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white py-2 rounded-xl transition-opacity font-medium flex items-center justify-center gap-2"
                 >
                    {aiLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                           <Wand2 size={16} /> AI Breakdown
                        </>
                    )}
                 </button>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-glass-muted hover:text-white">
                  ✕
              </button>
           </GlassCard>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
