import React from 'react';
import { motion } from 'framer-motion';

export default function LeaderboardScreen({ leaderboard, onBack, onClickSound }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center pointer-events-auto pt-8 px-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
    >
      <h2
        className="text-3xl font-black mb-6"
        style={{
          color: '#ffdd44',
          textShadow: '2px 2px 0 #ff6b35',
        }}
      >
        🏆 LEADERBOARD
      </h2>

      <div className="w-full max-w-sm flex-1 overflow-y-auto mb-6">
        {leaderboard.length === 0 ? (
          <p className="text-gray-500 text-center mt-12 text-lg">
            No scores yet. Play a game!
          </p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  background: i === 0
                    ? 'linear-gradient(135deg, rgba(255,221,68,0.15), rgba(255,107,53,0.15))'
                    : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i === 0 ? 'rgba(255,221,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <span
                  className="text-lg font-black w-8 text-center"
                  style={{
                    color: i === 0 ? '#ffdd44' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#666',
                  }}
                >
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className="flex-1">
                  <p className="text-white font-bold tabular-nums">
                    {entry.score}<span className="text-gray-400 text-sm ml-1">m</span>
                  </p>
                </div>
                <p className="text-gray-500 text-xs">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => {
          onClickSound?.();
          onBack();
        }}
        className="w-full max-w-xs py-3 rounded-2xl text-lg font-bold uppercase mb-8 transition-all active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.1)',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.2)',
        }}
      >
        ← BACK
      </button>
    </motion.div>
  );
}