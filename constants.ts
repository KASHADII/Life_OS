import { AppState, Task, DSAProblem } from './types';
import { addDays, format } from 'date-fns';

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Complete System Design Video',
    category: 'WebDev',
    status: 'In Progress',
    createdAt: new Date().toISOString(),
    dueDate: addDays(new Date(), 1).toISOString(),
  },
  {
    id: '2',
    title: 'Solve LeetCode Daily',
    category: 'DSA',
    status: 'Todo',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Update Resume with new Project',
    category: 'Internship',
    status: 'Blocked',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Grocery Shopping',
    category: 'Personal',
    status: 'Completed',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_PROBLEMS: DSAProblem[] = [
  {
    id: '101',
    title: 'Two Sum',
    link: 'https://leetcode.com/problems/two-sum/',
    topic: ['Array', 'Hash Table'],
    difficulty: 'Easy',
    learnedOn: new Date().toISOString(),
    nextReview: new Date().toISOString(), // Due now
    stage: 1,
    status: 'Learning',
    notes: 'Use a hash map for O(n) time complexity.'
  },
  {
    id: '102',
    title: 'LRU Cache',
    link: 'https://leetcode.com/problems/lru-cache/',
    topic: ['Design', 'Hash Table', 'Linked List'],
    difficulty: 'Medium',
    learnedOn: addDays(new Date(), -5).toISOString(),
    lastReviewed: addDays(new Date(), -2).toISOString(),
    nextReview: addDays(new Date(), 1).toISOString(), // Future
    stage: 2,
    status: 'Learning',
  }
];

export const INITIAL_STATE: AppState = {
  tasks: INITIAL_TASKS,
  problems: INITIAL_PROBLEMS,
  userSettings: {
    name: 'Aditya',
    internshipDate: '2025-06-01', // Default target
    theme: 'dark',
    accentColor: 'violet'
  }
};

export const SRS_INTERVALS = {
  1: 1, // 1 day
  2: 3, // 3 days
  3: 7, // 7 days
  4: 14, // 14 days
  5: 30, // 30 days
};
