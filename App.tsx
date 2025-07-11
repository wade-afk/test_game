
import React, { useState, useCallback, useEffect } from 'react';
import { GameStatus, WeaponType } from './types';
import GameContainer from './components/GameContainer';
import HUD from './components/HUD';

const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponType>(WeaponType.SHOTGUN);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('wasd_shooter_highscore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const handleWeaponSelect = useCallback((weapon: WeaponType) => {
    setSelectedWeapon(weapon);
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setIsNewHighScore(false);
    setGameStatus(GameStatus.Playing);
  }, []);
  
  const returnToMenu = useCallback(() => {
    setGameStatus(GameStatus.Start);
  }, []);

  const gameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameStatus(GameStatus.GameOver);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('wasd_shooter_highscore', finalScore.toString());
      setIsNewHighScore(true);
    } else {
      setIsNewHighScore(false);
    }
  }, [highScore]);

  return (
    <main className="w-screen h-screen bg-gray-800 font-sans select-none overflow-hidden">
      {gameStatus === GameStatus.Playing ? (
        <GameContainer onGameOver={gameOver} weapon={selectedWeapon} />
      ) : (
        <HUD 
          status={gameStatus} 
          score={score} 
          highScore={highScore} 
          onStartGame={startGame}
          onReturnToMenu={returnToMenu}
          isNewHighScore={isNewHighScore}
          onWeaponSelect={handleWeaponSelect}
          selectedWeapon={selectedWeapon}
        />
      )}
    </main>
  );
};

export default App;