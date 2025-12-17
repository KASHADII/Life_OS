import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Code2, Flame, Trophy } from 'lucide-react';
import { DateTime, Interval } from 'luxon';
import GlassCard from './GlassCard';
import { AppState } from '../types';
import { getMotivationalQuote } from '../services/geminiService';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [quote, setQuote] = useState<string>("Loading motivation...");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    getMotivationalQuote().then(setQuote);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const zone = 'Asia/Kolkata';

      const target = DateTime.fromISO(state.userSettings.internshipDate, { zone }).endOf('day');
      const now = DateTime.now().setZone(zone);

      if (now >= target) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const duration = Interval.fromDateTimes(now, target).toDuration([
        'days',
        'hours',
        'minutes',
        'seconds',
      ]);

      const days = Math.floor(duration.days || 0);
      const hours = Math.floor(duration.hours || 0);
      const minutes = Math.floor(duration.minutes || 0) % 60;
      const seconds = Math.floor(duration.seconds || 0) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.userSettings.internshipDate]);

  const tasksCompleted = state.tasks.filter(t => t.status === 'Completed').length;
  const problemsMastered = state.problems.filter(p => p.status === 'Mastered').length;
  const problemsDue = state.problems.filter(p => new Date(p.nextReview) <= new Date()).length;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200 text-glow">
            Good Evening, {state.userSettings.name}
          </h1>
          <p className="text-glass-muted mt-2 text-lg max-w-2xl italic">"{quote}"</p>
        </div>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Countdown Timer */}
        <div className="col-span-1 md:col-span-8">
           <GlassCard className="h-full min-h-[200px] flex items-center justify-between relative overflow-hidden bg-gradient-to-r from-blue-900/40 to-purple-900/40">
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
             
             <div className="z-10 w-full">
               <h2 className="text-glass-muted uppercase tracking-wider text-sm font-semibold mb-6">Internship Countdown</h2>
               <div className="flex justify-start gap-8 md:gap-16">
                  {[
                    { val: timeLeft.days, label: 'Days' },
                    { val: timeLeft.hours, label: 'Hours' },
                    { val: timeLeft.minutes, label: 'Minutes' },
                    { val: timeLeft.seconds, label: 'Seconds' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-5xl md:text-7xl font-bold font-display tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 drop-shadow-sm">
                        {String(item.val).padStart(2, '0')}
                      </span>
                      <span className="text-sm md:text-base text-glass-muted font-medium mt-2">{item.label}</span>
                    </div>
                  ))}
               </div>
             </div>
           </GlassCard>
        </div>

        {/* Quick Stats Column */}
        <div className="col-span-1 md:col-span-4 grid grid-rows-2 gap-6">
           <GlassCard hoverEffect className="flex items-center gap-4 bg-emerald-500/5 border-emerald-500/20">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-300">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">{tasksCompleted}</h3>
                <p className="text-sm text-glass-muted">Tasks Completed</p>
              </div>
           </GlassCard>
           
           <GlassCard hoverEffect className="flex items-center gap-4 bg-amber-500/5 border-amber-500/20">
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300">
                <Flame size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">{problemsDue}</h3>
                <p className="text-sm text-glass-muted">DSA Reviews Due</p>
              </div>
           </GlassCard>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Code2 className="text-blue-400" /> Recent DSA Progress
            </h3>
            <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/5 text-white/70">
              {problemsMastered} Mastered
            </span>
          </div>
          <div className="space-y-4">
            {state.problems.slice(0, 3).map((problem) => (
              <div key={problem.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    problem.difficulty === 'Easy' ? 'bg-green-400' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="font-medium text-white group-hover:text-blue-200 transition-colors">{problem.title}</p>
                    <p className="text-xs text-glass-muted">{problem.topic.join(', ')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                    problem.status === 'Mastered' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {problem.status}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/30">
           <h3 className="text-xl font-semibold flex items-center gap-2 mb-6">
              <Trophy className="text-yellow-400" /> Study Streak
           </h3>
           <div className="flex flex-col items-center justify-center py-4">
              <div className="relative">
                 <svg className="w-32 h-32 transform -rotate-90">
                   <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/10" />
                   <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="351.86" strokeDashoffset="100" className="text-yellow-400" strokeLinecap="round" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">12</span>
                    <span className="text-xs text-glass-muted uppercase tracking-wider">Days</span>
                 </div>
              </div>
              <p className="mt-6 text-center text-sm text-glass-muted">
                 You're in the top 5% of students this week! Keep pushing.
              </p>
           </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
