/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Delete, 
  Divide, 
  Minus, 
  Plus, 
  X, 
  Percent, 
  RotateCcw, 
  Equal,
  Moon,
  Sun
} from 'lucide-react';

type Operation = '+' | '-' | '*' | '/' | null;

export default function App() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [isNewInput, setIsNewInput] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const calculate = useCallback((a: number, b: number, op: Operation): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  }, []);

  const handleNumber = (num: string) => {
    if (isNewInput) {
      setDisplay(num);
      setIsNewInput(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (isNewInput) {
      setDisplay('0.');
      setIsNewInput(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: Operation) => {
    const current = parseFloat(display);
    
    if (prevValue === null) {
      setPrevValue(current);
    } else if (operation) {
      const result = calculate(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(String(result));
    }
    
    setOperation(op);
    setIsNewInput(true);
  };

  const handleEqual = () => {
    if (prevValue === null || !operation) return;
    
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operation);
    
    setHistory(prev => [`${prevValue} ${operation} ${current} = ${result}`, ...prev].slice(0, 5));
    setDisplay(String(result));
    setPrevValue(null);
    setOperation(null);
    setIsNewInput(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setIsNewInput(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay(String(current / 100));
  };

  const handleToggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (e.key === '.') handleDecimal();
      if (e.key === '+') handleOperation('+');
      if (e.key === '-') handleOperation('-');
      if (e.key === '*') handleOperation('*');
      if (e.key === '/') handleOperation('/');
      if (e.key === 'Enter' || e.key === '=') handleEqual();
      if (e.key === 'Escape') handleClear();
      if (e.key === 'Backspace') handleBackspace();
      if (e.key === '%') handlePercent();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, prevValue, operation, isNewInput, handleNumber, handleOperation, handleEqual, handleClear, handleBackspace, handlePercent]);

  const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "default" 
  }: { 
    children: React.ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: "default" | "operator" | "action" | "accent";
  }) => {
    const variants = {
      default: isDarkMode ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm",
      operator: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20",
      action: isDarkMode ? "bg-zinc-700 text-zinc-300 hover:bg-zinc-600" : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300",
      accent: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
        className={`h-16 w-full rounded-2xl flex items-center justify-center text-xl font-medium transition-colors duration-200 ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <div className={`w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
        
        {/* Header / Mode Toggle */}
        <div className="px-8 pt-8 flex justify-between items-center">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className={`text-xs font-mono uppercase tracking-widest ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
            Prism v1.0
          </div>
        </div>

        {/* Display Area */}
        <div className="px-8 py-10 flex flex-col items-end justify-end min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={history[0] || 'empty'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm font-mono mb-2 h-5 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
            >
              {operation ? `${prevValue} ${operation}` : history[0]?.split('=')[0]}
            </motion.div>
          </AnimatePresence>
          
          <motion.div 
            layout
            className={`text-6xl font-light tracking-tighter truncate w-full text-right ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}
          >
            {display}
          </motion.div>
        </div>

        {/* Keypad */}
        <div className={`p-6 grid grid-cols-4 gap-3 ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-50/50'}`}>
          <Button variant="action" onClick={handleClear}><RotateCcw size={22} /></Button>
          <Button variant="action" onClick={handleToggleSign}>+/-</Button>
          <Button variant="action" onClick={handlePercent}><Percent size={20} /></Button>
          <Button variant="operator" onClick={() => handleOperation('/')}><Divide size={22} /></Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button variant="operator" onClick={() => handleOperation('*')}><X size={22} /></Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button variant="operator" onClick={() => handleOperation('-')}><Minus size={22} /></Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button variant="operator" onClick={() => handleOperation('+')}><Plus size={22} /></Button>

          <Button onClick={() => handleNumber('0')} className="col-span-1">0</Button>
          <Button onClick={handleDecimal}>.</Button>
          <Button variant="action" onClick={handleBackspace}><Delete size={22} /></Button>
          <Button variant="accent" onClick={handleEqual}><Equal size={24} /></Button>
        </div>

        {/* Footer / History Preview */}
        <div className={`px-8 py-4 border-t flex justify-center gap-4 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-100'}`}>
          {history.length > 0 && (
            <div className={`text-[10px] font-mono uppercase tracking-tighter ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>
              Recent: {history[0].split('=')[1].trim()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
