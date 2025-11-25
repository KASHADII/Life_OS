import React from 'react';
import { AppState } from '../types';
import GlassCard from './GlassCard';
import { Moon, Sun, User, Calendar } from 'lucide-react';

interface SettingsProps {
  state: AppState;
  updateSettings: (newSettings: Partial<AppState['userSettings']>) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, updateSettings }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-display font-bold text-white">Settings</h2>

      <GlassCard className="space-y-6">
        <h3 className="text-xl font-semibold border-b border-white/10 pb-4">Profile & Goals</h3>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm text-glass-muted mb-2">Display Name</label>
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <User className="text-glass-muted" size={20} />
                    <input 
                        type="text" 
                        value={state.userSettings.name}
                        onChange={(e) => updateSettings({ name: e.target.value })}
                        className="bg-transparent border-none focus:outline-none text-white w-full"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm text-glass-muted mb-2">Internship Target Date</label>
                <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                    <Calendar className="text-glass-muted" size={20} />
                    <input 
                        type="date" 
                        value={state.userSettings.internshipDate}
                        onChange={(e) => updateSettings({ internshipDate: e.target.value })}
                        className="bg-transparent border-none focus:outline-none text-white w-full invert-calendar"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
         <h3 className="text-xl font-semibold border-b border-white/10 pb-4">Appearance</h3>
         
         <div className="flex items-center justify-between">
            <span className="text-glass-muted">Theme Mode</span>
            <div className="flex bg-white/5 p-1 rounded-xl">
                <button 
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`p-2 rounded-lg transition-all ${state.userSettings.theme === 'light' ? 'bg-white text-black' : 'text-glass-muted'}`}
                >
                    <Sun size={20} />
                </button>
                <button 
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`p-2 rounded-lg transition-all ${state.userSettings.theme === 'dark' ? 'bg-slate-700 text-white' : 'text-glass-muted'}`}
                >
                    <Moon size={20} />
                </button>
            </div>
         </div>
      </GlassCard>
      
      <div className="text-center text-xs text-glass-muted pt-8">
        Aditya's Life OS v1.0.0
      </div>
    </div>
  );
};

export default Settings;
