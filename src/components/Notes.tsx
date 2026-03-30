import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { memoryService, Note } from '../services/memoryService';

export const Notes: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '' });

  useEffect(() => {
    setNotes(memoryService.loadNotes());
  }, []);

  const handleSave = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      date: new Date().toLocaleDateString(),
    };

    const updated = [note, ...notes];
    setNotes(updated);
    memoryService.saveNotes(updated);
    setNewNote({ title: '', content: '' });
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    memoryService.saveNotes(updated);
  };

  const handleUpdate = () => {
    if (!editing) return;
    const updated = notes.map(n => n.id === editing.id ? editing : n);
    setNotes(updated);
    memoryService.saveNotes(updated);
    setEditing(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 flex flex-col"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
            <FileText size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mis Apuntes</h2>
        </div>
        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('¿Borrar todos los apuntes?')) {
                  setNotes([]);
                  memoryService.saveNotes([]);
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Borrar todo"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* New Note Form */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-3">
          <input
            type="text"
            placeholder="Título del apunte..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <textarea
            placeholder="Escribe algo importante..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-600 dark:text-gray-400 placeholder:text-gray-400 resize-none min-h-[100px]"
          />
          <button
            onClick={handleSave}
            disabled={!newNote.title.trim() || !newNote.content.trim()}
            className="w-full py-2 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Guardar Apunte
          </button>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Tus notas guardadas</h3>
          {notes.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic text-sm">
              No tienes apuntes guardados todavía.
            </div>
          ) : (
            notes.map((note) => (
              <motion.div
                layout
                key={note.id}
                className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900/30 transition-all group"
              >
                {editing?.id === note.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editing.title}
                      onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-900 dark:text-white"
                    />
                    <textarea
                      value={editing.content}
                      onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                      className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-600 dark:text-gray-400 resize-none min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleUpdate} className="flex-1 py-2 rounded-lg bg-green-500 text-white text-xs font-bold">Guardar</button>
                      <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">{note.title}</h4>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditing(note)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded-lg"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(note.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-3 text-[10px] text-gray-400 font-medium">{note.date}</div>
                  </>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
