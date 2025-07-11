
import React from 'react';
import { GameStatus, WeaponType } from '../types';
import Confetti from './Confetti';
import { WEAPONS } from '../constants';

interface HUDProps {
  status: GameStatus;
  score: number;
  highScore: number;
  onStartGame: () => void;
  onReturnToMenu: () => void;
  isNewHighScore: boolean;
  onWeaponSelect: (weapon: WeaponType) => void;
  selectedWeapon: WeaponType;
}

const HUD: React.FC<HUDProps> = ({ status, score, highScore, onStartGame, onReturnToMenu, isNewHighScore, onWeaponSelect, selectedWeapon }) => {
  const isVisible = status === GameStatus.Start || status === GameStatus.GameOver;

  if (!isVisible) {
    return null;
  }

  const title = status === GameStatus.Start ? 'WASD Shooter' : 'Game Over';
  const buttonText = status === GameStatus.Start ? 'Start Game' : 'Restart Game';

  return (
    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm p-4">
      {status === GameStatus.GameOver && isNewHighScore && <Confetti />}
      <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-wider text-cyan-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">{title}</h1>
      
      {status === GameStatus.GameOver && (
        <div className="text-center mb-8">
            <p className="text-3xl mb-2">Your Score: {score}</p>
            <p className="text-xl text-yellow-400">High Score: {highScore}</p>
        </div>
      )}

      {status === GameStatus.Start && (
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-3 text-cyan-200">Select Your Primary Weapon</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {(Object.keys(WEAPONS) as WeaponType[]).filter(key => key !== WeaponType.PISTOL).map((key) => {
                    const weapon = WEAPONS[key];
                    const isSelected = selectedWeapon === key;
                    return (
                        <button
                            key={key}
                            onClick={() => onWeaponSelect(key)}
                            className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${isSelected ? 'bg-cyan-500 border-cyan-300 scale-105' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500'}`}
                        >
                            <h3 className={`font-bold text-xl ${isSelected ? 'text-black' : 'text-white'}`}>{weapon.name}</h3>
                            <p className={`text-sm ${isSelected ? 'text-gray-900' : 'text-gray-300'}`}>{weapon.description}</p>
                        </button>
                    )
                })}
            </div>
        </div>
      )}

      <button
        onClick={status === GameStatus.Start ? onStartGame : onReturnToMenu}
        className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-2xl rounded-lg shadow-lg transition-transform transform hover:scale-105"
      >
        {buttonText}
      </button>

      {status === GameStatus.Start && (
        <div className="text-center text-sm text-gray-400 mt-8 max-w-xl bg-gray-900 bg-opacity-50 p-3 rounded-lg">
            <p><span className="font-mono bg-gray-700 px-2 py-1 rounded">WASD</span> Move | <span className="font-mono bg-gray-700 px-2 py-1 rounded">Mouse</span> Aim | <span className="font-mono bg-gray-700 px-2 py-1 rounded">Click</span> Shoot</p>
            <p className="mt-1"><span className="font-mono bg-gray-700 px-2 py-1 rounded">F</span> Melee | <span className="font-mono bg-gray-700 px-2 py-1 rounded">E</span> Swap Weapon</p>
        </div>
      )}
    </div>
  );
};

export default HUD;