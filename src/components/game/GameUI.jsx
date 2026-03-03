import React from 'react';
import MenuScreen from './screens/MenuScreen';
import PlayingHUD from './screens/PlayingHUD';
import PausedScreen from './screens/PausedScreen';
import GameOverScreen from './screens/GameOverScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import SkinsScreen from './screens/SkinsScreen';

export default function GameUI({
  uiState,
  onPlay,
  onPause,
  onMenu,
  onLeft,
  onRight,
  onShowLeaderboard,
  onShowSkins,
  onSelectSkin,
  skins,
  onUiClick,
}) {
  const { screen } = uiState;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {screen === 'menu' && (
        <MenuScreen
          onPlay={onPlay}
          onShowLeaderboard={onShowLeaderboard}
          onShowSkins={onShowSkins}
          onClickSound={onUiClick}
        />
      )}

      {(screen === 'playing' || screen === 'falling') && (
        <PlayingHUD
          distance={uiState.distance}
          balance={uiState.balance}
          lean={uiState.lean}
          onPause={onPause}
          onLeft={onLeft}
          onRight={onRight}
        />
      )}

      {screen === 'paused' && (
        <PausedScreen
          onResume={onPause}
          onMenu={onMenu}
          onClickSound={onUiClick}
        />
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          distance={uiState.distance}
          bestScore={uiState.bestScore}
          fallType={uiState.fallType}
          onRestart={onPlay}
          onMenu={onMenu}
          onClickSound={onUiClick}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          leaderboard={uiState.leaderboard}
          onBack={onMenu}
          onClickSound={onUiClick}
        />
      )}

      {screen === 'skins' && (
        <SkinsScreen
          skins={skins}
          selectedSkin={uiState.selectedSkin}
          bestScore={uiState.bestScore}
          onSelectSkin={onSelectSkin}
          onBack={onMenu}
          onClickSound={onUiClick}
        />
      )}
    </div>
  );
}