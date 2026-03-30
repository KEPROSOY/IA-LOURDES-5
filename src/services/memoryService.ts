import { Message, UserType } from '../types';

const STORAGE_KEY_HISTORY = 'lourdes_chat_history';
const STORAGE_KEY_COUNT = 'lourdes_question_count';
const STORAGE_KEY_LAST_DATE = 'lourdes_last_date';
const STORAGE_KEY_USER_TYPE = 'lourdes_user_type';
const STORAGE_KEY_NOTES = 'lourdes_notes';

export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

export const memoryService = {
  // Aquí guardo lo que hablamos para que Lourdes no se olvide de ti
  saveHistory: (messages: Message[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages));
    } catch (e) {
      console.error('Oops, no pude guardar el historial:', e);
    }
  },

  loadHistory: (): Message[] => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  },

  clearHistory: () => {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  },

  // Gestión de apuntes (notas)
  saveNotes: (notes: Note[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
    } catch (e) {
      console.error('No pude guardar tus apuntes:', e);
    }
  },

  loadNotes: (): Note[] => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTES);
    return saved ? JSON.parse(saved) : [];
  },

  // Control de límites diarios (para cuidar nuestra cuota de Google)
  getDailyCount: (): number => {
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem(STORAGE_KEY_LAST_DATE);

    if (lastDate !== today) {
      localStorage.setItem(STORAGE_KEY_LAST_DATE, today);
      localStorage.setItem(STORAGE_KEY_COUNT, '0');
      return 0;
    }

    const count = localStorage.getItem(STORAGE_KEY_COUNT);
    return count ? parseInt(count, 10) : 0;
  },

  incrementDailyCount: () => {
    const current = memoryService.getDailyCount();
    localStorage.setItem(STORAGE_KEY_COUNT, (current + 1).toString());
  },

  // Personalización del usuario
  getUserType: (): UserType => {
    return (localStorage.getItem(STORAGE_KEY_USER_TYPE) as UserType) || 'estudiante';
  },

  setUserType: (type: UserType) => {
    localStorage.setItem(STORAGE_KEY_USER_TYPE, type);
  }
};
