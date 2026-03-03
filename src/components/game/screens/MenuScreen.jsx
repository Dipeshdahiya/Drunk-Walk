import React from 'react';
import { motion } from 'framer-motion';

export default function MenuScreen({ onPlay, onShowLeaderboard, onShowSkins, onClickSound }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between pointer-events-auto py-8 px-4">
      {/* Title */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="text-center mt-4"
      >
        <h1
          className="text-5xl sm:text-7xl font-black tracking-tighter"
          style={{
            color: '#ffdd44',
            textShadow: '3px 3px 0 #ff6b35, 6px 6px 0 rgba(0,0,0,0.4)',
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            letterSpacing: '-2px',
          }}
        >
          DRUNK
        </h1>
        <h1
          className="text-5xl sm:text-7xl font-black tracking-tighter -mt-2"
          style={{
            color: '#ff6b35',
            textShadow: '3px 3px 0 #ffdd44, 6px 6px 0 rgba(0,0,0,0.4)',
            fontFamily: "'Arial Black', 'Impact', sans-serif",
            letterSpacing: '-2px',
          }}
        >
          WALK
        </h1>
        <p className="text-gray-400 text-sm mt-2 tracking-widest uppercase">
          Don't fall down!
        </p>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 14 }}
        className="flex flex-col gap-3 w-full max-w-xs mb-12"
      >
        <button
          onClick={() => {
            onClickSound?.();
            onPlay();
          }}
          className="w-full py-4 rounded-2xl text-xl font-black uppercase tracking-wide transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #ffdd44, #ff6b35)',
            color: '#1a1a2e',
            boxShadow: '0 6px 0 #cc5500, 0 8px 20px rgba(255,107,53,0.4)',
          }}
        >
          ▶ PLAY
        </button>
        <button
          onClick={() => {
            onClickSound?.();
            onShowLeaderboard();
          }}
          className="w-full py-3 rounded-2xl text-lg font-bold uppercase tracking-wide transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #4a9e4a, #2d8a4e)',
            color: '#fff',
            boxShadow: '0 4px 0 #1a5a2e, 0 6px 15px rgba(45,138,78,0.3)',
          }}
        >
          🏆 LEADERBOARD
        </button>
        <button
          onClick={() => {
            onClickSound?.();
            onShowSkins();
          }}
          className="w-full py-3 rounded-2xl text-lg font-bold uppercase tracking-wide transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6b5ce7, #4a3cb8)',
            color: '#fff',
            boxShadow: '0 4px 0 #3a2c98, 0 6px 15px rgba(107,92,231,0.3)',
          }}
        >
          👤 SKINS
        </button>
      </motion.div>
    </div>
  );
}