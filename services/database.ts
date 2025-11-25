import { AppState } from '../types';
import { INITIAL_STATE } from '../constants';

const DB_KEY = 'adityas-life-os-db-v1';

export const db = {
  /**
   * Simulates a database connection and fetching data.
   * Merges saved data with INITIAL_STATE to ensure new fields (if added later) exist.
   */
  connect: async (): Promise<AppState> => {
    // Simulate network/disk delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const serializedState = localStorage.getItem(DB_KEY);
      if (serializedState === null) {
        return INITIAL_STATE;
      }
      
      const savedState = JSON.parse(serializedState);
      
      // Deep merge with INITIAL_STATE to ensure structure integrity
      // This prevents crashes if you add new features/fields later
      return {
        ...INITIAL_STATE,
        ...savedState,
        userSettings: {
          ...INITIAL_STATE.userSettings,
          ...savedState.userSettings,
        }
      };
    } catch (err) {
      console.error("Database Load Error:", err);
      return INITIAL_STATE;
    }
  },

  /**
   * Saves the current state to the database.
   */
  save: (state: AppState): void => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(DB_KEY, serializedState);
    } catch (err) {
      console.error("Database Save Error:", err);
    }
  },

  /**
   * Clears the database (Factory Reset)
   */
  clear: (): void => {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }
};