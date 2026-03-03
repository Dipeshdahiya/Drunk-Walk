import React from 'react';
import { motion } from 'framer-motion';

const SKIN_EMOJIS = {
  default: '🍺',
  zombie: '🧟',
  businessman: '💼',
  ninja: '🥷',
  pirate: '🏴‍☠️',
  astronaut: '🧑‍🚀',
};

export default function SkinsScreen({ skins, selectedSkin, bestScore, onSelectSkin, onBack, onClickSound }) {
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
          color: '#6b5ce7',
          textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
        }}
      >
        👤 SKINS
      </h2>

      <p className="text-sm text-purple-200 mb-2">
        Best distance: <span className="font-bold">{bestScore ?? 0} m</span>
      </p>

      <div className="w-full max-w-sm flex-1 overflow-y-auto mb-4">
        <div className="grid grid-cols-2 gap-3">
          {skins.map((skin, i) => {
            const isSelected = selectedSkin === skin.id;
            const isUnlocked = skin.unlocked !== false;
            return (
              <motion.button
                key={skin.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', damping: 12 }}
                onClick={() => {
                  if (!isUnlocked) return;
                  onClickSound?.();
                  onSelectSkin(skin.id);
                }}
                className="flex flex-col items-center p-4 rounded-2xl transition-all active:scale-95"
                style={{
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: isUnlocked ? 1 : 0.5,
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(107,92,231,0.3), rgba(74,60,184,0.3))'
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isSelected ? '#6b5ce7' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: isSelected ? '0 0 20px rgba(107,92,231,0.3)' : 'none',
                }}
              >
                <span className="text-3xl mb-2">{SKIN_EMOJIS[skin.id] || '👤'}</span>
                <span className="text-white font-bold text-sm">{skin.name}</span>
                {isSelected && isUnlocked && (
                  <span className="text-xs text-purple-300 mt-1 uppercase tracking-wider">Equipped</span>
                )}
                {!isUnlocked && (
                  <span className="text-xs text-red-200 mt-1 text-center">
                    Reach {skin.unlockAt ?? 0} m to unlock
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
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