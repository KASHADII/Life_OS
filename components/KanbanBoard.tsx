import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { Task } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, setTasks }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: uuidv4(),
      title: newTaskTitle.trim(),
      category: 'Personal',
      status: 'Todo',
      createdAt: new Date().toISOString(),
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? { ...t, status: t.status === 'Completed' ? 'Todo' : 'Completed' }
          : t
      )
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const clearAll = () => {
    setTasks([]);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === 'Completed' ? 1 : -1;
  });

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-2xl mx-auto">
      <div className="flex flex-col gap-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-bold text-white">Daily Checklist</h2>
            <p className="text-glass-muted text-sm mt-1">
              Add tasks, tick them off, and clear the list at the end of the day.
            </p>
          </div>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
          <input
            type="text"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task for today..."
            className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-base"
          />
          <button
            onClick={addTask}
            className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            disabled={!newTaskTitle.trim()}
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {sortedTasks.length === 0 ? (
          <p className="text-sm text-glass-muted italic">No tasks yet. Add your first task above.</p>
        ) : (
          <ul className="space-y-2.5">
            {sortedTasks.map(task => {
              const isCompleted = task.status === 'Completed';
              return (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3.5 bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 group"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3.5 flex-1 text-left"
                  >
                    <span className="text-purple-300 shrink-0">
                      {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                    </span>
                    <span
                      className={`text-base ${
                        isCompleted
                          ? 'line-through text-glass-muted'
                          : 'text-white'
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-100 shadow-sm transition-all"
                    aria-label="Delete task"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
