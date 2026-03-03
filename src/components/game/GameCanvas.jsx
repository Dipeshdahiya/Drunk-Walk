import React, { useRef, useEffect, useCallback, useState } from 'react';
import { createGameState, initEnvironment, updateGame, updateFalling, pressLeft, pressRight, getSkins } from './gameEngine';
import { render } from './gameRenderer';
import GameUI from './GameUI';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const stateRef = useRef(createGameState());
  const animRef = useRef(null);
  const menuWobbleRef = useRef(0);
  const bgMusicRef = useRef(null); // in-game background music
  const menuMusicRef = useRef(null); // menu background music
  const milestoneVoiceRef = useRef(null);
  const gameOverSfxRef = useRef(null);
  const hitSfxRef = useRef(null);
  const clickSfxRef = useRef(null);
  const lastMilestoneRef = useRef(0);
  const [uiState, setUiState] = useState({
    screen: 'menu',
    distance: 0,
    bestScore: stateRef.current.bestScore,
    balance: 0.5,
    lean: 0,
    leaderboard: stateRef.current.leaderboard,
    selectedSkin: stateRef.current.selectedSkin,
    fallType: null,
  });

  const syncUI = useCallback(() => {
    const s = stateRef.current;
    setUiState({
      screen: s.screen,
      distance: Math.floor(s.distance),
      bestScore: s.bestScore,
      balance: s.balance,
      lean: s.player.lean,
      leaderboard: s.leaderboard,
      selectedSkin: s.selectedSkin,
      fallType: s.fallType,
    });
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    initEnvironment(stateRef.current, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const gameLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const state = stateRef.current;

    const dt = state.lastTime ? (timestamp - state.lastTime) / 1000 : 0.016;
    state.lastTime = timestamp;

    menuWobbleRef.current += dt * 2;

    if (state.screen === 'playing') {
      updateGame(state, dt, canvas.width, canvas.height);
    } else if (state.screen === 'falling') {
      updateFalling(state, dt);
    }

    // React to game events (for sounds) and then clear the flag.
    if (state.lastEvent === 'hitObstacle') {
      if (!hitSfxRef.current) {
        hitSfxRef.current = new Audio('audio/hit.mp3');
        hitSfxRef.current.volume = 0.7;
      }
      hitSfxRef.current.currentTime = 0;
      hitSfxRef.current.play().catch(() => {});
      state.lastEvent = null;
    } else if (state.lastEvent === 'gameover') {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
      if (!gameOverSfxRef.current) {
        gameOverSfxRef.current = new Audio('audio/gameover.mp3');
        gameOverSfxRef.current.volume = 0.8;
      }
      gameOverSfxRef.current.currentTime = 0;
      gameOverSfxRef.current.play().catch(() => {});
      state.lastEvent = null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    render(ctx, state, canvas.width, canvas.height, menuWobbleRef.current);

    syncUI();
    animRef.current = requestAnimationFrame(gameLoop);
  }, [syncUI]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [gameLoop]);
  // Distance milestones voice feedback
  useEffect(() => {
    const distance = uiState.distance;
    const milestoneStep = 100;
    if (distance <= 0) return;
    const milestone = Math.floor(distance / milestoneStep) * milestoneStep;
    if (milestone > 0 && milestone !== lastMilestoneRef.current) {
      lastMilestoneRef.current = milestone;
      if (!milestoneVoiceRef.current) {
        // Hook up your own audio files in /public/audio for these to play.
        milestoneVoiceRef.current = new Audio('audio/voice-milestone.mp3');
        milestoneVoiceRef.current.volume = 0.7;
      }
      milestoneVoiceRef.current.currentTime = 0;
      milestoneVoiceRef.current.play().catch(() => {});
    }
  }, [uiState.distance]);

  // Menu vs in-game background music
  useEffect(() => {
    // Lazily create audio elements on first use.
    if (!menuMusicRef.current) {
      menuMusicRef.current = new Audio('audio/menu-music.mp3');
      menuMusicRef.current.loop = true;
      menuMusicRef.current.volume = 0.4;
    }
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('audio/game-music.mp3');
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.4;
    }

    if (uiState.screen === 'menu') {
      // Prefer menu music on the main menu.
      menuMusicRef.current
        .play()
        .catch(() => {
          // Autoplay might be blocked; ignore.
        });
      bgMusicRef.current.pause();
    } else {
      menuMusicRef.current.pause();
    }
  }, [uiState.screen]);

  // Ensure menu music starts as soon as the user interacts at least once.
  useEffect(() => {
    if (!menuMusicRef.current) return;

    const handleFirstInteraction = () => {
      if (stateRef.current.screen === 'menu') {
        menuMusicRef.current
          .play()
          .catch(() => {
            // Still blocked? Then the browser requires a direct button click; nothing more we can do.
          });
      }
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = stateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (state.screen === 'playing') pressLeft(state);
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (state.screen === 'playing') pressRight(state);
      }
      if (e.key === 'Escape') {
        if (state.screen === 'playing') {
          state.screen = 'paused';
          syncUI();
        } else if (state.screen === 'paused') {
          state.screen = 'playing';
          syncUI();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [syncUI]);

  const handlePlay = useCallback(() => {
    const canvas = canvasRef.current;
    const state = createGameState();
    state.selectedSkin = stateRef.current.selectedSkin;
    state.player.skinId = state.selectedSkin;
    state.leaderboard = stateRef.current.leaderboard;
    state.bestScore = stateRef.current.bestScore;
    stateRef.current = state;
    if (canvas) initEnvironment(state, canvas.width, canvas.height);
    state.screen = 'playing';
    // Switch from menu music to in-game music on play.
    if (menuMusicRef.current) {
      menuMusicRef.current.pause();
    }
    bgMusicRef.current
      .play()
      .catch(() => {
        // Autoplay might be blocked; ignore errors.
      });
    syncUI();
  }, [syncUI]);

  const handlePause = useCallback(() => {
    const state = stateRef.current;
    if (state.screen === 'playing') {
      state.screen = 'paused';
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    } else if (state.screen === 'paused') {
      state.screen = 'playing';
      if (bgMusicRef.current) {
        bgMusicRef.current.play().catch(() => {});
      }
    }
    syncUI();
  }, [syncUI]);

  const handleMenu = useCallback(() => {
    stateRef.current.screen = 'menu';
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
    }
    syncUI();
  }, [syncUI]);

  const handleLeft = useCallback(() => {
    pressLeft(stateRef.current);
  }, []);

  const handleRight = useCallback(() => {
    pressRight(stateRef.current);
  }, []);

  const handleShowLeaderboard = useCallback(() => {
    stateRef.current.screen = 'leaderboard';
    syncUI();
  }, [syncUI]);

  const handleShowSkins = useCallback(() => {
    stateRef.current.screen = 'skins';
    syncUI();
  }, [syncUI]);

  const handleSelectSkin = useCallback((skinId) => {
    stateRef.current.selectedSkin = skinId;
    stateRef.current.player.skinId = skinId;
    localStorage.setItem('drunkwalk_skin', skinId);
    syncUI();
  }, [syncUI]);

  const handleUiClick = useCallback(() => {
    if (!clickSfxRef.current) {
      clickSfxRef.current = new Audio('audio/click.mp3');
      clickSfxRef.current.volume = 0.7;
    }
    clickSfxRef.current.currentTime = 0;
    clickSfxRef.current.play().catch(() => {});
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none" style={{ touchAction: 'none' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <GameUI
        uiState={uiState}
        onPlay={handlePlay}
        onPause={handlePause}
        onMenu={handleMenu}
        onLeft={handleLeft}
        onRight={handleRight}
        onShowLeaderboard={handleShowLeaderboard}
        onShowSkins={handleShowSkins}
        onSelectSkin={handleSelectSkin}
        skins={getSkins(uiState.bestScore)}
        onUiClick={handleUiClick}
      />
    </div>
  );
}