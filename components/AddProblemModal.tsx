import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Link as LinkIcon, Calendar, Tag, Layers, AlignLeft, Hash } from 'lucide-react';
import { DSAProblem, SRSStage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { SRS_INTERVALS } from '../constants';
import { addDays } from 'date-fns';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problem: DSAProblem) => void;
}

const AddProblemModal: React.FC<AddProblemModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    difficulty: '' as 'Easy' | 'Medium' | 'Hard' | '',
    learnedOn: new Date().toISOString().split('T')[0],
    notes: '',
    currentTopic: '',
    topics: [] as string[],
    stage: 1 as number,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Problem name is required';
    
    if (!formData.link.trim()) {
      newErrors.link = 'Link is required';
    } else {
      try {
        new URL(formData.link);
      } catch (_) {
        newErrors.link = 'Please enter a valid URL';
      }
    }

    if (formData.topics.length === 0) newErrors.topics = 'Add at least one topic';
    if (!formData.difficulty) newErrors.difficulty = 'Select a difficulty';
    if (!formData.learnedOn) newErrors.learnedOn = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!validate()) {
      setIsSubmitting(false);
      // Shake animation trigger could go here
      return;
    }

    // Calculate Next Review based on Learned On date + Stage interval
    // Defaulting to Stage 1 logic if newly added
    const learnedDate = new Date(formData.learnedOn);
    const interval = SRS_INTERVALS[formData.stage as SRSStage] || 1;
    const nextReview = addDays(learnedDate, interval).toISOString();

    const newProblem: DSAProblem = {
      id: uuidv4(),
      title: formData.title,
      link: formData.link,
      topic: formData.topics,
      difficulty: formData.difficulty as 'Easy' | 'Medium' | 'Hard',
      learnedOn: learnedDate.toISOString(),
      lastReviewed: learnedDate.toISOString(), // Assuming learned today means reviewed today
      nextReview: nextReview,
      stage: formData.stage as SRSStage,
      status: formData.stage >= 5 ? 'Mastered' : 'Learning',
      notes: formData.notes
    };

    // Simulate small delay for effect
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onSave(newProblem);
    resetForm();
    setIsSubmitting(false);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
      difficulty: '',
      learnedOn: new Date().toISOString().split('T')[0],
      notes: '',
      currentTopic: '',
      topics: [],
      stage: 1,
    });
    setErrors({});
  };

  const addTopic = (e: React.KeyboardEvent | React.MouseEvent) => {
    // Return early if it's a keydown event that isn't 'Enter'
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    
    e.preventDefault();
    
    const topic = formData.currentTopic.trim();
    if (topic && !formData.topics.includes(topic)) {
      setFormData(prev => ({ 
        ...prev, 
        topics: [...prev.topics, topic], 
        currentTopic: '' 
      }));
      if (errors.topics) setErrors(prev => ({ ...prev, topics: '' }));
    }
  };

  const removeTopic = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topicToRemove)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-display font-bold text-white">Add New DSA Problem</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-glass-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
              
              {/* Row 1: Title & Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Problem Name <span className="text-pink-400">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => {
                        setFormData({...formData, title: e.target.value});
                        if(errors.title) setErrors({...errors, title: ''});
                      }}
                      placeholder="e.g. Reverse Linked List"
                      className={`w-full bg-white/5 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-3 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all`}
                    />
                    <Hash size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                  </div>
                  {errors.title && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Problem Link <span className="text-pink-400">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.link}
                      onChange={e => {
                        setFormData({...formData, link: e.target.value});
                        if(errors.link) setErrors({...errors, link: ''});
                      }}
                      placeholder="https://leetcode.com/..."
                      className={`w-full bg-white/5 border ${errors.link ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-3 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all`}
                    />
                    <LinkIcon size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                  </div>
                  {errors.link && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.link}</p>}
                </div>
              </div>

              {/* Row 2: Difficulty & Learned On & Stage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-glass-muted ml-1">Difficulty <span className="text-pink-400">*</span></label>
                    <select
                      value={formData.difficulty}
                      onChange={e => {
                         setFormData({...formData, difficulty: e.target.value as any});
                         if(errors.difficulty) setErrors({...errors, difficulty: ''});
                      }}
                      className={`w-full bg-white/5 border ${errors.difficulty ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer`}
                    >
                        <option value="" disabled className="bg-slate-900 text-gray-500">Select...</option>
                        <option value="Easy" className="bg-slate-900 text-green-400">Easy</option>
                        <option value="Medium" className="bg-slate-900 text-yellow-400">Medium</option>
                        <option value="Hard" className="bg-slate-900 text-red-400">Hard</option>
                    </select>
                    {errors.difficulty && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.difficulty}</p>}
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-glass-muted ml-1">Learned On <span className="text-pink-400">*</span></label>
                    <div className="relative">
                        <input
                            type="date"
                            value={formData.learnedOn}
                            onChange={e => setFormData({...formData, learnedOn: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500/50 invert-calendar"
                            style={{ colorScheme: 'dark' }}
                        />
                        <Calendar size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-glass-muted ml-1">Initial Stage</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.stage}
                            onChange={e => setFormData({...formData, stage: parseInt(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-purple-500/50"
                        />
                        <Layers size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                    </div>
                 </div>
              </div>

              {/* Row 3: Topics */}
              <div className="space-y-1.5">
                 <label className="text-xs font-medium text-glass-muted ml-1">Topics <span className="text-pink-400">*</span></label>
                 <div className={`bg-white/5 border ${errors.topics ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-2 flex flex-wrap gap-2 min-h-[50px] focus-within:border-purple-500/50 transition-colors`}>
                    {formData.topics.map(topic => (
                        <span key={topic} className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                            {topic}
                            <button onClick={() => removeTopic(topic)} className="hover:text-white"><X size={12} /></button>
                        </span>
                    ))}
                    <div className="flex-1 flex items-center min-w-[100px]">
                        <Tag size={14} className="text-glass-muted mr-2 ml-1" />
                        <input 
                            type="text"
                            value={formData.currentTopic}
                            onChange={e => setFormData({...formData, currentTopic: e.target.value})}
                            onKeyDown={addTopic}
                            placeholder="Type & Press Enter..."
                            className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-white/20"
                        />
                    </div>
                 </div>
                 {errors.topics && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.topics}</p>}
              </div>

              {/* Row 4: Summary/Notes */}
              <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Solution Summary / Notes</label>
                  <div className="relative">
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        placeholder="Key approach, time complexity, or concepts used..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                    />
                    <AlignLeft size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                  </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
               <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-glass-muted hover:text-white hover:bg-white/5 transition-colors"
               >
                  Cancel
               </button>
               <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
               >
                  {isSubmitting ? 'Saving...' : <><Plus size={16} /> Add Problem</>}
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddProblemModal;