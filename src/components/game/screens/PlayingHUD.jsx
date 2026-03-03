import React, { useCallback } from 'react';
import { Pause } from 'lucide-react';

export default function PlayingHUD({ distance, balance, lean, onPause, onLeft, onRight }) {
  // Prevent default touch behavior to avoid scrolling
  const preventTouch = useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
      {/* Top HUD */}
      <div className="flex items-start justify-between p-4 pointer-events-auto">
        {/* Distance */}
        <div
          className="px-4 py-2 rounded-xl"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p className="text-xs text-gray-400 uppercase tracking-wider">Distance</p>
          <p className="text-2xl font-black text-white tabular-nums">
            {distance}<span className="text-sm text-gray-400 ml-1">m</span>
          </p>
        </div>

        {/* Pause */}
        <button
          onClick={onPause}
          className="p-3 rounded-xl transition-all active:scale-90"
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Pause className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Balance Meter */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48">
        <div
          className="relative h-3 rounded-full overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {/* Center zone */}
          <div
            className="absolute top-0 h-full opacity-30"
            style={{
              left: '35%',
              width: '30%',
              background: '#4ade80',
            }}
          />
          {/* Indicator */}
          <div
            className="absolute top-0 h-full w-3 rounded-full transition-all duration-75"
            style={{
              left: `${Math.max(0, Math.min(100, balance * 100)) - 3}%`,
              background: Math.abs(balance - 0.5) > 0.3 ? '#ef4444' : Math.abs(balance - 0.5) > 0.15 ? '#fbbf24' : '#4ade80',
              boxShadow: `0 0 8px ${Math.abs(balance - 0.5) > 0.3 ? '#ef4444' : '#4ade80'}`,
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-end px-6 pb-8 pointer-events-auto">
        <button
          onPointerDown={(e) => { e.preventDefault(); onLeft(); }}
          onTouchStart={preventTouch}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full active:scale-90 transition-transform"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(255,100,100,0.9), rgba(200,50,50,0.8))',
            boxShadow: '0 6px 0 rgba(150,30,30,0.8), 0 8px 25px rgba(255,80,80,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
            border: '2px solid rgba(255,150,150,0.4)',
          }}
        >
          <span className="text-3xl font-black text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            ←
          </span>
        </button>

        <button
          onPointerDown={(e) => { e.preventDefault(); onRight(); }}
          onTouchStart={preventTouch}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full active:scale-90 transition-transform"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(100,150,255,0.9), rgba(50,80,200,0.8))',
            boxShadow: '0 6px 0 rgba(30,50,150,0.8), 0 8px 25px rgba(80,120,255,0.3), inset 0 2px 4px rgba(255,255,255,0.2)',
            border: '2px solid rgba(150,180,255,0.4)',
          }}
        >
          <span className="text-3xl font-black text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            →
          </span>
        </button>
      </div>
    </div>
  );
}