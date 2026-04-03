import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const ARCADE_FONT = "'Press Start 2P', cursive";

export function HUD() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const wave = useGameStore((s) => s.wave);
  const timeUntilWave = useGameStore((s) => s.timeUntilWave);
  const isNight = useGameStore((s) => s.isNight);
  const toggleDayNight = useGameStore((s) => s.toggleDayNight);
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    if (gamePhase !== 'playing' || wave <= 1) {
      return;
    }
    setAnnouncement(`Wave ${wave} incoming!`);
    const timer = setTimeout(() => setAnnouncement(null), 2500);
    return () => clearTimeout(timer);
  }, [wave, gamePhase]);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes waveAnnounce {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          25% { transform: translate(-50%, -50%) scale(1); }
          75% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        }
      `}</style>
      <button
        onClick={toggleDayNight}
        style={dayNightButtonStyle}
      >
        {isNight ? 'NIGHT' : 'DAY'}
      </button>
      {announcement && (
        <div style={announcementStyle} key={wave}>
          {announcement}
        </div>
      )}
      {(gamePhase === 'title' || gamePhase === 'demo') && (
        <div style={{ ...centerStyle, backgroundColor: 'rgba(0, 30, 60, 0.4)' }}>
          <h1 style={titleStyle}>TIDE SURVIVAL</h1>
          <p style={subtitleStyle}>Collect shells. Dodge the tide.</p>
          <p style={promptStyle}>Press SPACE to start</p>
          <p style={hintStyle}>WASD / Arrow Keys / Gamepad to move</p>
          <p style={hintStyle}>N to toggle day/night</p>
          {highScore > 0 && (
            <p style={highScoreStyle}>Best: {highScore}</p>
          )}
        </div>
      )}

      {gamePhase === 'playing' && (
        <>
          <div style={topBarStyle}>
            <span>Wave {wave}</span>
            <span>Score: {score}</span>
          </div>
          <div style={timerContainerStyle}>
            <span
              style={{
                fontSize: timeUntilWave <= 3 ? 28 : 18,
                color: timeUntilWave <= 3 ? '#FF4444' : '#FFF8E7',
                fontWeight: 'bold',
                transition: 'font-size 0.2s',
              }}
            >
              {Math.ceil(timeUntilWave)}
            </span>
          </div>
        </>
      )}

      {gamePhase === 'tideActive' && (
        <div style={topBarStyle}>
          <span style={{ color: '#00BCD4' }}>TIDE INCOMING</span>
          <span>Score: {score}</span>
        </div>
      )}

      {gamePhase === 'gameOver' && (
        <div style={centerStyle}>
          <h1 style={{ ...titleStyle, color: '#FF4444' }}>GAME OVER</h1>
          <p style={{ fontSize: 20, color: '#FFF8E7', margin: '12px 0', fontFamily: ARCADE_FONT, letterSpacing: 2 }}>
            Score: {score}
          </p>
          <p style={{ fontSize: 14, color: '#BBBBBB', margin: '6px 0', fontFamily: ARCADE_FONT, letterSpacing: 2 }}>
            Wave {wave}
          </p>
          {score >= highScore && score > 0 && (
            <p style={{ fontSize: 14, color: '#FFD700', margin: '10px 0', fontFamily: ARCADE_FONT, letterSpacing: 2 }}>
              New High Score!
            </p>
          )}
          <p style={{ ...promptStyle, marginTop: 24 }}>Press SPACE to retry</p>
        </div>
      )}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 10,
};

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  textAlign: 'center',
  fontFamily: ARCADE_FONT,
  textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 36,
  margin: 0,
  color: '#FF6B35',
  letterSpacing: 4,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#FFF8E7',
  margin: '12px 0',
  letterSpacing: 2,
};

const promptStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#FFF8E7',
  marginTop: 16,
  letterSpacing: 2,
};

const hintStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#AAA',
  marginTop: 6,
  letterSpacing: 1,
};

const highScoreStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#FFD700',
  marginTop: 12,
  letterSpacing: 2,
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 24px',
  fontSize: 14,
  fontFamily: ARCADE_FONT,
  color: '#FFF8E7',
  letterSpacing: 2,
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
};

const announcementStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: 28,
  fontWeight: 'bold',
  fontFamily: ARCADE_FONT,
  color: '#FFF8E7',
  letterSpacing: 2,
  textShadow: '3px 3px 8px rgba(0,0,0,0.9)',
  pointerEvents: 'none',
  animation: 'waveAnnounce 2.5s ease-out forwards',
  whiteSpace: 'nowrap',
};

const dayNightButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  padding: '8px 14px',
  fontFamily: ARCADE_FONT,
  fontSize: 10,
  letterSpacing: 2,
  color: '#FFF8E7',
  background: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 4,
  cursor: 'pointer',
  pointerEvents: 'auto',
  textShadow: '1px 1px 3px rgba(0,0,0,0.8)',
};

const timerContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 56,
  width: '100%',
  textAlign: 'center',
  fontFamily: ARCADE_FONT,
  letterSpacing: 2,
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
};
