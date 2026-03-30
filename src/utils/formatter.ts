export const formatter = {
  // Formateo de fechas
  formatTimestamp: (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toLocaleDateString() === now.toLocaleDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  },

  // Limpieza de texto por si acaso
  cleanInput: (input: string): string => {
    return input.trim();
  }
};
