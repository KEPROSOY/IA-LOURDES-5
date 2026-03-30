import React, { useState } from 'react';
import { X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Element {
  symbol: string;
  name: string;
  number: number;
  category: string;
  weight: string;
}

const elements: Element[] = [
  { number: 1, symbol: 'H', name: 'Hidrógeno', category: 'nonmetal', weight: '1.008' },
  { number: 2, symbol: 'He', name: 'Helio', category: 'noble-gas', weight: '4.0026' },
  { number: 3, symbol: 'Li', name: 'Litio', category: 'alkali-metal', weight: '6.94' },
  { number: 4, symbol: 'Be', name: 'Berilio', category: 'alkaline-earth', weight: '9.0122' },
  { number: 5, symbol: 'B', name: 'Boro', category: 'metalloid', weight: '10.81' },
  { number: 6, symbol: 'C', name: 'Carbono', category: 'nonmetal', weight: '12.011' },
  { number: 7, symbol: 'N', name: 'Nitrógeno', category: 'nonmetal', weight: '14.007' },
  { number: 8, symbol: 'O', name: 'Oxígeno', category: 'nonmetal', weight: '15.999' },
  { number: 9, symbol: 'F', name: 'Flúor', category: 'halogen', weight: '18.998' },
  { number: 10, symbol: 'Ne', name: 'Neón', category: 'noble-gas', weight: '20.180' },
  { number: 11, symbol: 'Na', name: 'Sodio', category: 'alkali-metal', weight: '22.990' },
  { number: 12, symbol: 'Mg', name: 'Magnesio', category: 'alkaline-earth', weight: '24.305' },
  { number: 13, symbol: 'Al', name: 'Aluminio', category: 'post-transition', weight: '26.982' },
  { number: 14, symbol: 'Si', name: 'Silicio', category: 'metalloid', weight: '28.085' },
  { number: 15, symbol: 'P', name: 'Fósforo', category: 'nonmetal', weight: '30.974' },
  { number: 16, symbol: 'S', name: 'Azufre', category: 'nonmetal', weight: '32.06' },
  { number: 17, symbol: 'Cl', name: 'Cloro', category: 'halogen', weight: '35.45' },
  { number: 18, symbol: 'Ar', name: 'Argón', category: 'noble-gas', weight: '39.948' },
  { number: 19, symbol: 'K', name: 'Potasio', category: 'alkali-metal', weight: '39.098' },
  { number: 20, symbol: 'Ca', name: 'Calcio', category: 'alkaline-earth', weight: '40.078' },
  { number: 21, symbol: 'Sc', name: 'Escandio', category: 'transition-metal', weight: '44.956' },
  { number: 22, symbol: 'Ti', name: 'Titanio', category: 'transition-metal', weight: '47.867' },
  { number: 23, symbol: 'V', name: 'Vanadio', category: 'transition-metal', weight: '50.942' },
  { number: 24, symbol: 'Cr', name: 'Cromo', category: 'transition-metal', weight: '51.996' },
  { number: 25, symbol: 'Mn', name: 'Manganeso', category: 'transition-metal', weight: '54.938' },
  { number: 26, symbol: 'Fe', name: 'Hierro', category: 'transition-metal', weight: '55.845' },
  { number: 27, symbol: 'Co', name: 'Cobalto', category: 'transition-metal', weight: '58.933' },
  { number: 28, symbol: 'Ni', name: 'Níquel', category: 'transition-metal', weight: '58.693' },
  { number: 29, symbol: 'Cu', name: 'Cobre', category: 'transition-metal', weight: '63.546' },
  { number: 30, symbol: 'Zn', name: 'Zinc', category: 'transition-metal', weight: '65.38' },
  { number: 47, symbol: 'Ag', name: 'Plata', category: 'transition-metal', weight: '107.87' },
  { number: 79, symbol: 'Au', name: 'Oro', category: 'transition-metal', weight: '196.97' },
  { number: 80, symbol: 'Hg', name: 'Mercurio', category: 'transition-metal', weight: '200.59' },
  { number: 82, symbol: 'Pb', name: 'Plomo', category: 'post-transition', weight: '207.2' },
  { number: 92, symbol: 'U', name: 'Uranio', category: 'actinide', weight: '238.03' },
];

const categoryColors: Record<string, string> = {
  'nonmetal': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'noble-gas': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'alkali-metal': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'alkaline-earth': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'metalloid': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'halogen': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  'post-transition': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'transition-metal': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  'actinide': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export const PeriodicTable: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [selected, setSelected] = useState<Element | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tabla Periódica Interactiva</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona un elemento para ver detalles</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {elements.map((el) => (
              <button
                key={el.number}
                onClick={() => setSelected(el)}
                className={`p-3 rounded-2xl border transition-all hover:scale-105 flex flex-col items-center justify-center gap-1 ${
                  selected?.number === el.number 
                    ? 'border-blue-500 ring-2 ring-blue-500/20' 
                    : 'border-gray-100 dark:border-gray-800'
                } ${categoryColors[el.category] || 'bg-gray-50 text-gray-800'}`}
              >
                <span className="text-xs font-bold opacity-70">{el.number}</span>
                <span className="text-2xl font-black">{el.symbol}</span>
                <span className="text-[10px] truncate w-full text-center">{el.name}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="p-6 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-800 flex items-start gap-4"
            >
              <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border-2 border-blue-500/30 ${categoryColors[selected.category]}`}>
                <span className="text-sm font-bold">{selected.number}</span>
                <span className="text-3xl font-black">{selected.symbol}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500 text-white">
                    {selected.category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Info size={14} />
                    <span>Peso atómico: <strong>{selected.weight}</strong></span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="text-blue-500 hover:text-blue-600 font-medium text-sm"
              >
                Cerrar detalle
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
