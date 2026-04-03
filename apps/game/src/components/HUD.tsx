import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function HUD() {
  const gamePhase = useGameStore((s) => s.gamePhase);
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const wave = useGameStore((s) => s.wave);
  const timeUntilWave = useGameStore((s) => s.timeUntilWave);
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
      {announcement && (
        <div style={announcementStyle} key={wave}>
          {announcement}
        </div>
      )}
      {(gamePhase === 'title' || gamePhase === 'demo') && (
        <div style={{ ...centerStyle, backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
          <h1 style={titleStyle}>TIDE SURVIVAL</h1>
          <p style={subtitleStyle}>Collect shells. Dodge the tide.</p>
          <p style={promptStyle}>Press SPACE to start</p>
          <p style={hintStyle}>WASD / Arrow Keys to move</p>
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
                fontSize: timeUntilWave <= 3 ? 40 : 28,
                color: timeUntilWave <= 3 ? '#FF4444' : '#FFFFFF',
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
          <span style={{ color: '#66BBFF' }}>TIDE INCOMING</span>
          <span>Score: {score}</span>
        </div>
      )}

      {gamePhase === 'gameOver' && (
        <div style={centerStyle}>
          <h1 style={{ ...titleStyle, color: '#FF4444' }}>GAME OVER</h1>
          <p style={{ fontSize: 32, color: '#FFFFFF', margin: '8px 0' }}>
            Score: {score}
          </p>
          <p style={{ fontSize: 22, color: '#BBBBBB', margin: '4px 0' }}>
            Wave {wave}
          </p>
          {score >= highScore && score > 0 && (
            <p style={{ fontSize: 22, color: '#FFD700', margin: '8px 0' }}>
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
  fontFamily: "'Courier New', Courier, monospace",
  textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 52,
  margin: 0,
  color: '#FF6B35',
  letterSpacing: 4,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: 20,
  color: '#DDDDDD',
  margin: '8px 0',
};

const promptStyle: React.CSSProperties = {
  fontSize: 22,
  color: '#CCCCCC',
  marginTop: 16,
};

const hintStyle: React.CSSProperties = {
  fontSize: 14,
  color: '#888888',
  marginTop: 4,
};

const highScoreStyle: React.CSSProperties = {
  fontSize: 18,
  color: '#FFD700',
  marginTop: 12,
};

const topBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 24px',
  fontSize: 22,
  fontFamily: "'Courier New', Courier, monospace",
  color: '#FFFFFF',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
};

const announcementStyle: React.CSSProperties = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: 48,
  fontWeight: 'bold',
  fontFamily: "'Courier New', Courier, monospace",
  color: '#FFFFFF',
  textShadow: '3px 3px 8px rgba(0,0,0,0.9)',
  pointerEvents: 'none',
  animation: 'waveAnnounce 2.5s ease-out forwards',
  whiteSpace: 'nowrap',
};

const timerContainerStyle: React.CSSProperties = {
  position: 'absolute',
  top: 56,
  width: '100%',
  textAlign: 'center',
  fontFamily: "'Courier New', Courier, monospace",
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
};
