import React from 'react';
import { motion } from 'framer-motion';

export default function PausedScreen({ onResume, onMenu, onClickSound }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <h2
        className="text-4xl font-black text-white mb-8"
        style={{ textShadow: '0 3px 6px rgba(0,0,0,0.5)' }}
      >
        PAUSED
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-xs px-4">
        <button
          onClick={() => {
            onClickSound?.();
            onResume();
          }}
          className="w-full py-3 rounded-2xl text-lg font-bold uppercase transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ffdd44, #ff6b35)',
            color: '#1a1a2e',
            boxShadow: '0 4px 0 #cc5500',
          }}
        >
          ▶ RESUME
        </button>
        <button
          onClick={() => {
            onClickSound?.();
            onMenu();
          }}
          className="w-full py-3 rounded-2xl text-lg font-bold uppercase transition-all active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          🏠 MAIN MENU
        </button>
      </div>
    </motion.div>
  );
}