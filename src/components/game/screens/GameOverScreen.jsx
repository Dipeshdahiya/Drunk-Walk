import React from 'react';
import { motion } from 'framer-motion';

const FALL_MESSAGES = {
  faceplant: '🤦 FACEPLANT!',
  spin: '🌀 SPIN OUT!',
  slide: '🛝 SLIIIDE!',
};

export default function GameOverScreen({ distance, bestScore, fallType, onRestart, onMenu, onClickSound }) {
  const isNewBest = distance >= bestScore && distance > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto px-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, delay: 0.1 }}
        className="text-center"
      >
        {/* Fall type */}
        <p className="text-2xl mb-2">
          {FALL_MESSAGES[fallType] || '💀 WASTED!'}
        </p>

        <h2
          className="text-5xl font-black mb-6"
          style={{
            color: '#ff6b35',
            textShadow: '0 3px 0 rgba(0,0,0,0.5)',
          }}
        >
          GAME OVER
        </h2>

        {/* Score card */}
        <div
          className="rounded-2xl p-6 mb-6 mx-auto max-w-xs"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Distance</p>
          <p className="text-4xl font-black text-white tabular-nums">
            {distance}<span className="text-lg text-gray-400 ml-1">m</span>
          </p>

          <div className="w-full h-px bg-white/10 my-4" />

          <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Best</p>
          <p className="text-2xl font-bold text-yellow-400 tabular-nums">
            {bestScore}<span className="text-sm text-gray-400 ml-1">m</span>
          </p>

          {isNewBest && (
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="mt-3 text-sm font-bold text-yellow-400 uppercase tracking-wider"
            >
              ⭐ NEW RECORD! ⭐
            </motion.p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <button
            onClick={() => {
              onClickSound?.();
              onRestart();
            }}
            className="w-full py-4 rounded-2xl text-xl font-black uppercase transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #ffdd44, #ff6b35)',
              color: '#1a1a2e',
              boxShadow: '0 5px 0 #cc5500, 0 7px 20px rgba(255,107,53,0.3)',
            }}
          >
            🔄 PLAY AGAIN
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
            🏠 MENU
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}