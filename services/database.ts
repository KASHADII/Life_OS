import { AppState } from '../types';
import { INITIAL_STATE } from '../constants';
import { loadAppState, saveAppState, clearAppState } from '../supabaseClient';

const DB_KEY = 'adityas-life-os-db-v1';

export const db = {
  connect: async (): Promise<AppState> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const remoteState = await loadAppState();
      const baseState = remoteState ?? INITIAL_STATE;

      // Deep merge with INITIAL_STATE to ensure structure integrity
      // This prevents crashes if you add new features/fields later
      return {
        ...INITIAL_STATE,
        ...baseState,
        userSettings: {
          ...INITIAL_STATE.userSettings,
          ...baseState.userSettings,
        }
      };
    } catch (err) {
      console.error("Database Load Error:", err);
      return INITIAL_STATE;
    }
  },

  save: (state: AppState): void => {
    try {
      void saveAppState(state);
    } catch (err) {
      console.error("Database Save Error:", err);
    }
  },

  clear: (): void => {
    void clearAppState();
    window.location.reload();
  }
};