import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  FlaskConical, 
  Atom, 
  Beaker, 
  History, 
  Settings, 
  User, 
  Bot,
  Loader2,
  Trash2,
  AlertCircle,
  Info,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  GraduationCap,
  Microscope,
  Plus,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// Servicios modulares
import { aiService } from './services/aiService';
import { memoryService, Note } from './services/memoryService';
import { formatter } from './utils/formatter';
import { Message, UserType } from './types';
import { PeriodicTable } from './components/PeriodicTable';
import { Notes } from './components/Notes';

// Configuración básica
const MAX_FREE_QUESTIONS = 500;
const STORAGE_KEY_THEME = 'lourdes_theme';
const STORAGE_KEY_ONLINE = 'lourdes_online';

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [userType, setUserType] = useState<UserType>('estudiante');
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [showPeriodicTable, setShowPeriodicTable] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && apiKey.length > 10) {
      setIsApiKeyMissing(false);
    } else {
      setIsApiKeyMissing(true);
    }
    
    setQuestionCount(memoryService.getDailyCount());
    setMessages(memoryService.loadHistory());
    setUserType(memoryService.getUserType());

    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme === 'dark') setIsDarkMode(true);

    const savedOnline = localStorage.getItem(STORAGE_KEY_ONLINE);
    if (savedOnline === 'false') setIsOnline(false);
  }, []);

  // Apply theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  // Save online state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ONLINE, isOnline.toString());
  }, [isOnline]);

  // Save state to memoryService
  useEffect(() => {
    memoryService.saveHistory(messages);
  }, [messages]);

  useEffect(() => {
    memoryService.setUserType(userType);
  }, [userType]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    const cleanInput = formatter.cleanInput(input);
    if (!cleanInput || isLoading) return;

    if (!isOnline) {
      setError('Lourdes está en modo offline. Activa el modo online para enviar preguntas.');
      return;
    }

    if (questionCount >= MAX_FREE_QUESTIONS) {
      setError('Has alcanzado el límite de 500 preguntas gratuitas.');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: cleanInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Logs reales para depuración (esto ayuda mucho a un humano)
    console.log(`[Lourdes] Enviando mensaje como ${userType}:`, cleanInput);

    try {
      // Usamos el servicio modular de IA
      const responseText = await aiService.sendMessage(cleanInput, messages, userType);

      const aiResponse: Message = {
        role: 'model',
        content: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Actualizamos el contador diario
      memoryService.incrementDailyCount();
      setQuestionCount(memoryService.getDailyCount());
      
    } catch (err: any) {
      console.error('[Lourdes] Error fatal en handleSendMessage:', err);
      setError('Hubo un error crítico al procesar tu pregunta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveToNotes = (content: string) => {
    const notes = memoryService.loadNotes();
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Nota de Lourdes',
      content: content,
      date: new Date().toLocaleDateString(),
    };
    memoryService.saveNotes([newNote, ...notes]);
    setShowNotes(true);
  };

  const clearHistory = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar el historial de chat?')) {
      setMessages([]);
      memoryService.clearHistory();
    }
  };

  return (
    <div className={cn(
      "flex h-screen bg-[#F8F9FA] dark:bg-[#0F1113] text-[#1A1C1E] dark:text-[#E2E2E6] font-sans overflow-hidden transition-colors duration-300",
      isDarkMode && "dark"
    )}>
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1A1C1E] border-r border-gray-200 dark:border-gray-800 p-4 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <FlaskConical size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight dark:text-white">Lourdes AI</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <button 
            onClick={() => { setShowNotes(true); setIsSidebarOpen(false); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <Bot size={20} />
            <span>Mis apuntes</span>
          </button>
          
          <div className="pt-4 pb-2 px-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">¿Cómo me ves?</span>
          </div>
          
          <button 
            onClick={() => { setUserType('estudiante'); setIsSidebarOpen(false); }}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl transition-all",
              userType === 'estudiante' 
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <GraduationCap size={20} />
            <span>Estudiante</span>
          </button>

          <button 
            onClick={() => { setUserType('investigador'); setIsSidebarOpen(false); }}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl transition-all",
              userType === 'investigador' 
                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" 
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            )}
          >
            <Microscope size={20} />
            <span>Investigador</span>
          </button>

          <div className="pt-4 pb-2 px-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Herramientas</span>
          </div>

          <button 
            onClick={() => { setShowPeriodicTable(true); setIsSidebarOpen(false); }}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Atom size={20} />
            <span>Tabla Periódica</span>
          </button>

          <div className="pt-4 pb-2 px-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</span>
          </div>

          <button 
            onClick={clearHistory}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <Trash2 size={20} />
            <span>Borrar historial</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uso Diario</span>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{questionCount}/{MAX_FREE_QUESTIONS}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${(questionCount / MAX_FREE_QUESTIONS) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Límite de 500 preguntas diarias</p>
          </div>
          
          <button className="flex items-center gap-3 w-full p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Settings size={20} />
            <span>Configuración</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#1A1C1E] border-b border-gray-200 dark:border-gray-800 z-10 transition-colors">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block p-2 bg-blue-600 rounded-lg text-white">
              <FlaskConical size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-lg dark:text-white">Lourdes AI</h2>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                )} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isOnline ? "En línea" : "Fuera de línea"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online/Offline Toggle */}
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={cn(
                "p-2 rounded-lg transition-all",
                isOnline ? "text-green-600 bg-green-50 dark:bg-green-900/20" : "text-gray-400 bg-gray-100 dark:bg-gray-800"
              )}
              title={isOnline ? "Cambiar a modo offline" : "Cambiar a modo online"}
            >
              {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={clearHistory}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Borrar historial"
            >
              <Trash2 size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
              BK
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-[#F8F9FA] dark:bg-[#0F1113]"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-8">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20"
              >
                <FlaskConical size={40} />
              </motion.div>
              <div>
                <h3 className="text-3xl font-bold mb-3 dark:text-white tracking-tight">¡Hola! Soy Lourdes</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Tu asistente experta en química. ¿En qué experimento o duda te puedo ayudar hoy?
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {[
                  "¿Qué es el enlace covalente?",
                  "Explícame la tabla periódica",
                  "¿Cómo se balancea una ecuación?",
                  "Dime curiosidades del Oro"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    disabled={!isOnline}
                    className="p-4 text-left bg-white dark:bg-[#1A1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group disabled:opacity-50"
                  >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.timestamp + idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 max-w-3xl",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold",
                    msg.role === 'user' ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300" : "bg-blue-600 text-white"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={cn(
                      "p-4 rounded-2xl shadow-sm",
                      msg.role === 'user' 
                        ? "bg-blue-600 text-white rounded-tr-none" 
                        : "bg-white dark:bg-[#1A1C1E] border border-gray-100 dark:border-gray-800 text-[#1A1C1E] dark:text-[#E2E2E6] rounded-tl-none"
                    )}>
                      <div className={cn(
                        "prose prose-sm max-w-none",
                        msg.role === 'user' ? "prose-invert" : "prose-slate dark:prose-invert"
                      )}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === 'model' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                          <button 
                            onClick={() => saveToNotes(msg.content)}
                            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded-lg transition-colors"
                          >
                            <Plus size={12} />
                            Guardar en apuntes
                          </button>
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] text-gray-400 px-1",
                      msg.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {formatter.formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {isLoading && (
            <div className="flex gap-4 mr-auto max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-[#1A1C1E] border border-gray-100 dark:border-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Lourdes está revisando sus notas...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="flex flex-col gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <p className="text-sm">{error}</p>
              </div>
              <button 
                onClick={() => handleSendMessage()}
                className="text-xs font-bold uppercase tracking-wider bg-red-100 dark:bg-red-900/40 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60 transition-all w-fit"
              >
                Reintentar
              </button>
            </div>
          )}
          {isApiKeyMissing && (
            <div className="flex flex-col gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/30 max-w-3xl mx-auto">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} />
                <p className="text-sm">
                  No se detectó la clave API de Gemini. Por favor, asegúrate de configurarla en el panel de secretos de AI Studio.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Scroll to bottom button */}
        {messages.length > 3 && (
          <button 
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
            className="fixed bottom-32 right-8 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg text-gray-500 hover:text-blue-600 transition-all z-20"
          >
            <Plus className="rotate-45" size={20} />
          </button>
        )}

        {/* Input Area */}
        <div className="p-6 bg-white dark:bg-[#1A1C1E] border-t border-gray-200 dark:border-gray-800 transition-colors">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSendMessage(e);
                }
              }}
              placeholder={isOnline ? "Pregúntale a Lourdes sobre química..." : "Modo offline activado..."}
              disabled={isLoading || questionCount >= MAX_FREE_QUESTIONS || !isOnline}
              className="w-full p-4 pr-14 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 text-[#1A1C1E] dark:text-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || questionCount >= MAX_FREE_QUESTIONS || !isOnline}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold">
            <span className="flex items-center gap-1"><Beaker size={10} /> Laboratorio Digital</span>
            <span className="flex items-center gap-1"><Atom size={10} /> 500 Consultas Diarias</span>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showPeriodicTable && (
          <PeriodicTable onClose={() => setShowPeriodicTable(false)} />
        )}
        {showNotes && (
          <Notes onClose={() => setShowNotes(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
