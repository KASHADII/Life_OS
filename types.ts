export type Category = 'DSA' | 'WebDev' | 'ML' | 'Personal' | 'Internship';

export type TaskStatus = 'Todo' | 'In Progress' | 'Completed' | 'Blocked';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
}

export type SRSStage = 1 | 2 | 3 | 4 | 5;

export interface DSAProblem {
  id: string;
  title: string;
  link: string;
  topic: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  learnedOn: string;
  lastReviewed?: string;
  nextReview: string;
  stage: SRSStage;
  status: 'To Learn' | 'Learning' | 'Mastered';
  notes?: string;
}

export interface AppState {
  tasks: Task[];
  problems: DSAProblem[];
  userSettings: {
    name: string;
    internshipDate: string;
    theme: 'dark' | 'light';
    accentColor: string;
  };
}

export type View = 'dashboard' | 'kanban' | 'dsa' | 'settings';
