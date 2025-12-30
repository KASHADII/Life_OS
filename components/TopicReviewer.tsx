import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, RefreshCcw, Plus, CheckCircle2, Trash2, Tag, NotebookPen } from 'lucide-react';
import { DateTime } from 'luxon';
import { TopicReview, SRSStage } from '../types';
import GlassCard from './GlassCard';
import { TOPIC_SRS_INTERVALS } from '../constants';
import AddTopicModal from './AddTopicModal';

interface TopicReviewerProps {
  topics: TopicReview[];
  setTopics: React.Dispatch<React.SetStateAction<TopicReview[]>>;
}

const TopicReviewer: React.FC<TopicReviewerProps> = ({ topics, setTopics }) => {
  const [filter, setFilter] = useState<'Due' | 'All' | 'Mastered'>('Due');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const [areaColors, setAreaColors] = useState<Record<string, 'blue' | 'green' | 'yellow' | 'pink'>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem('topicAreaColors');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('topicAreaColors', JSON.stringify(areaColors));
    } catch {
      // ignore
    }
  }, [areaColors]);

  const allAreas: string[] = Array.from(
    new Set<string>(
      topics.flatMap((t) => (t.area ? [t.area] : ([] as string[])))
    )
  ).sort((a, b) => a.localeCompare(b));

  const getAreaClasses = (area: string) => {
    const color = areaColors[area] || 'blue';
    switch (color) {
      case 'green':
        return 'bg-emerald-500/15 text-emerald-100 border border-emerald-500/30';
      case 'yellow':
        return 'bg-amber-500/15 text-amber-100 border border-amber-500/30';
      case 'pink':
        return 'bg-pink-500/15 text-pink-100 border border-pink-500/30';
      case 'blue':
      default:
        return 'bg-blue-500/15 text-blue-100 border border-blue-500/30';
    }
  };

  const getFilteredTopics = () => {
    const zone = 'Asia/Kolkata';
    const now = DateTime.now().setZone(zone).startOf('day');
    if (filter === 'Mastered') return topics.filter(t => t.status === 'Mastered');
    if (filter === 'Due') return topics.filter(t => {
      const next = DateTime.fromISO(t.nextReview, { zone }).startOf('day');
      return t.status !== 'Mastered' && next <= now;
    });
    return topics;
  };

  const handleReview = (id: string, success: boolean) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== id) return t;

      if (success) {
        const zone = 'Asia/Kolkata';
        const now = DateTime.now().setZone(zone);
        const nextStage = Math.min(t.stage + 1, 5) as SRSStage;
        const isMastered = nextStage === 5 && t.stage === 5;
        return {
          ...t,
          lastReviewed: now.toISO(),
          nextReview: now.plus({ days: TOPIC_SRS_INTERVALS[nextStage] }).toISO(),
          stage: nextStage,
          status: isMastered ? 'Mastered' : 'Learning'
        };
      } else {
        const zone = 'Asia/Kolkata';
        const now = DateTime.now().setZone(zone);
        return {
          ...t,
          stage: 1,
          lastReviewed: now.toISO(),
          nextReview: now.plus({ days: TOPIC_SRS_INTERVALS[1] }).toISO(),
          status: 'Learning',
        };
      }
    }));
  };

  const handleAddTopic = (newTopic: TopicReview) => {
    setTopics(prev => [...prev, newTopic]);

    const zone = 'Asia/Kolkata';
    const now = DateTime.now().setZone(zone);
    const next = DateTime.fromISO(newTopic.nextReview, { zone });
    const isDue = next <= now;
    if (isDue && filter === 'Mastered') setFilter('Due');

    setToast({ message: 'Topic added successfully!', visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const deleteTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6 relative">
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
            <BookOpen className="text-blue-400" /> Topic Reviewer
          </h2>
          <p className="text-glass-muted text-sm mt-1">Review any topic using a 5/15/30/45/60 day spaced repetition schedule.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {['Due', 'All', 'Mastered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-blue-500/20 text-blue-300 shadow-lg'
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
            <Plus size={18} className="text-blue-300 group-hover:text-white transition-colors" />
            <span className="font-medium hidden sm:inline">Add Topic</span>
          </motion.button>
        </div>
      </div>

      <div className="grid gap-4">
        {getFilteredTopics().length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <BookOpen size={48} className="mx-auto text-glass-muted mb-4 opacity-50" />
            <p className="text-lg text-white font-medium">No topics found</p>
            <p className="text-sm text-glass-muted mt-1">Start by adding topics you want to keep revisiting.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 px-6 py-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-xl text-sm font-medium transition-colors"
            >
              Add Your First Topic
            </button>
          </div>
        ) : (
          getFilteredTopics().map(topic => (
            <GlassCard key={topic.id} className="group relative overflow-visible">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {topic.area && (
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${getAreaClasses(topic.area)}`}
                      >
                        {topic.area}
                      </span>
                    )}
                    {topic.tags && topic.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs text-glass-muted bg-white/5 px-2 py-0.5 rounded flex items-center gap-1"
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {topic.title}
                  </h3>
                  {topic.notes && (
                    <p className="text-xs text-glass-muted mt-1 line-clamp-2 opacity-70 italic flex items-start gap-1">
                      <NotebookPen size={12} className="mt-0.5" />
                      {topic.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-glass-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> Next Review: {DateTime.fromISO(topic.nextReview).setZone('Asia/Kolkata').toFormat('MMM d')}
                    </span>
                    <span className="flex items-center gap-1">
                      <RefreshCcw size={12} /> Stage: {topic.stage}/5
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                    title="Delete topic"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

                  <button
                    onClick={() => handleReview(topic.id, false)}
                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 transition-colors text-sm font-medium"
                  >
                    Forgot
                  </button>
                  <button
                    onClick={() => handleReview(topic.id, true)}
                    className="px-4 py-2 rounded-lg bg-green-500/10 text-green-300 hover:bg-green-500/20 border border-green-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Check size={16} /> Reviewed
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddTopic}
        existingAreas={allAreas}
        areaColors={areaColors}
        onChangeAreaColor={(area, color) =>
          setAreaColors(prev => ({
            ...prev,
            [area]: color,
          }))
        }
      />
    </div>
  );
};

export default TopicReviewer;
