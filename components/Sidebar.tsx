import React from 'react';
import { LayoutDashboard, KanbanSquare, BrainCircuit, Settings, BookOpen, LogOut } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'kanban', label: 'Tasks', icon: KanbanSquare },
    { id: 'dsa', label: 'DSA Review', icon: BrainCircuit },
    { id: 'topics', label: 'Topic Reviewer', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed left-4 top-4 bottom-4 w-20 md:w-64 glass-panel rounded-3xl flex flex-col items-center md:items-start py-8 z-50 transition-all duration-300">
      <div className="px-0 md:px-8 mb-12 flex items-center justify-center md:justify-start w-full">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
           <span className="text-xl font-bold text-white">A</span>
        </div>
        <span className="hidden md:block ml-4 font-display font-bold text-xl tracking-tight text-white/90">Life OS</span>
      </div>

      <nav className="flex-1 w-full px-2 md:px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center justify-center md:justify-start p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                  : 'text-glass-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
              <Icon className={`w-6 h-6 md:mr-3 ${isActive ? 'text-purple-300' : ''}`} />
              <span className={`hidden md:block font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="w-full px-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 hidden md:block">
            <p className="text-xs text-glass-muted mb-2">Pro Status</p>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 w-[75%]" />
            </div>
            <p className="text-xs font-semibold text-white">Internship Ready</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
