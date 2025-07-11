
import React from 'react';
import { EnemyState, EnemyType } from '../types';

interface EnemyProps extends EnemyState {
  maxHp: number;
}

const Enemy: React.FC<EnemyProps> = ({ position, radius, type, hp, maxHp }) => {
  const size = radius * 2.5; // Make sprite slightly larger than hitbox
  const style = {
    left: position.x - size / 2,
    top: position.y - size / 2,
    width: size,
    height: size,
  };

  const healthPercentage = Math.max(0, (hp / maxHp) * 100);
  // Only show the health bar if the enemy isn't at full health and isn't dead.
  const showHealthBar = hp < maxHp && hp > 0;

  const EnemySprite = () => {
    if (type === EnemyType.SQUARE) {
      return (
        <svg viewBox="-25 -25 50 50" className="w-full h-full">
          <rect x="-18" y="-18" width="36" height="36" rx="4" fill="#5b21b6" stroke="#a78bfa" strokeWidth="2" />
          <rect x="-12" y="-12" width="24" height="24" rx="2" fill="#4c1d95" />
          <rect x="-5" y="-5" width="10" height="10" fill="#c4b5fd" className="animate-pulse" />
        </svg>
      );
    }
    // Normal enemy
    return (
       <svg viewBox="-20 -20 40 40" className="w-full h-full">
        <circle cx="0" cy="0" r="15" fill="#4a5568" stroke="#718096" strokeWidth="2" />
        <circle cx="0" cy="0" r="10" fill="#2d3748" />
        <circle cx="0" cy="0" r="5" fill="#ef4444" className="animate-pulse" />
      </svg>
    );
  };

  return (
    <div className="absolute" style={style}>
      {showHealthBar && (
        <div 
          className="absolute w-full flex justify-center"
          style={{ top: type === EnemyType.SQUARE ? '-12px' : '-8px' }}
        >
          <div className="w-10 h-1.5 bg-gray-800 bg-opacity-70 rounded-full border border-black/50 overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-200"
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
        </div>
      )}
      <EnemySprite />
    </div>
  );
};


export default React.memo(Enemy);