import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Calendar, Tag, AlignLeft, Hash } from 'lucide-react';
import { TopicReview, SRSStage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { TOPIC_SRS_INTERVALS } from '../constants';
import { addDays } from 'date-fns';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topic: TopicReview) => void;
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    area: '',
    learnedOn: new Date().toISOString().split('T')[0],
    notes: '',
    currentTag: '',
    tags: [] as string[],
    stage: 1 as number,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Topic name is required';
    if (!formData.learnedOn) newErrors.learnedOn = 'Date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!validate()) {
      setIsSubmitting(false);
      return;
    }

    const learnedDate = new Date(formData.learnedOn);
    const interval = TOPIC_SRS_INTERVALS[formData.stage as SRSStage] || TOPIC_SRS_INTERVALS[1];
    const nextReview = addDays(learnedDate, interval).toISOString();

    const newTopic: TopicReview = {
      id: uuidv4(),
      title: formData.title,
      area: formData.area || undefined,
      tags: formData.tags.length ? formData.tags : undefined,
      learnedOn: learnedDate.toISOString(),
      lastReviewed: learnedDate.toISOString(),
      nextReview,
      stage: formData.stage as SRSStage,
      status: formData.stage >= 5 ? 'Mastered' : 'Learning',
      notes: formData.notes || undefined,
    };

    await new Promise(resolve => setTimeout(resolve, 400));

    onSave(newTopic);
    resetForm();
    setIsSubmitting(false);
    onClose();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      area: '',
      learnedOn: new Date().toISOString().split('T')[0],
      notes: '',
      currentTag: '',
      tags: [],
      stage: 1,
    });
    setErrors({});
  };

  const addTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();

    const tag = formData.currentTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        currentTag: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
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
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-display font-bold text-white">Add New Topic</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-glass-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Topic Name <span className="text-pink-400">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                      }}
                      placeholder="e.g. Operating Systems - Paging"
                      className={`w-full bg-white/5 border ${errors.title ? 'border-red-500/50' : 'border-white/10'} rounded-xl p-3 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all`}
                    />
                    <Hash size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                  </div>
                  {errors.title && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.title}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Area / Subject <span className="text-glass-muted text-[10px]"></span></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value })}
                      placeholder="e.g. OS, DBMS, System Design"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-3 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Learned On <span className="text-pink-400">*</span></label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.learnedOn}
                      onChange={e => setFormData({ ...formData, learnedOn: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, stage: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-3 text-white focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-glass-muted ml-1">Tags</label>
                  <div className={`bg-white/5 border border-white/10 rounded-xl p-2 flex flex-wrap gap-2 min-h-[50px] focus-within:border-purple-500/50 transition-colors`}>
                    {formData.tags.map(tag => (
                      <span key={tag} className="bg-purple-500/20 text-purple-200 border border-purple-500/30 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                      </span>
                    ))}
                    <div className="flex-1 flex items-center min-w-[100px]">
                      <Tag size={14} className="text-glass-muted mr-2 ml-1" />
                      <input
                        type="text"
                        value={formData.currentTag}
                        onChange={e => setFormData({ ...formData, currentTag: e.target.value })}
                        onKeyDown={addTag}
                        placeholder="Type & Press Enter..."
                        className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder-white/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-glass-muted ml-1">Notes</label>
                <div className="relative">
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Key points, formulas, or summary..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pl-10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 resize-none text-sm"
                  />
                  <AlignLeft size={16} className="absolute left-3 top-3.5 text-glass-muted" />
                </div>
              </div>
            </div>

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
                {isSubmitting ? 'Saving...' : <><Plus size={16} /> Add Topic</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTopicModal;
