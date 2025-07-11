
import React from 'react';
import { PlayerState } from '../types';

const Player: React.FC<PlayerState> = ({ position, radius, angle, isInvincible }) => {
  const size = radius * 2.5; // Make sprite slightly larger than hitbox for better visuals
  return (
    <div
      className={`absolute transition-opacity duration-150 ${isInvincible ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
      style={{
        left: position.x - size / 2,
        top: position.y - size / 2,
        width: size,
        height: size,
        transform: `rotate(${angle}deg)`,
      }}
    >
      <svg viewBox="-25 -25 50 50" className="w-full h-full">
        {/* Rifle */}
        <rect x="0" y="-3" width="22" height="6" rx="2" fill="#334155" /> {/* Gun Body */}
        <rect x="22" y="-1.5" width="3" height="3" rx="1" fill="#475569" /> {/* Gun Tip */}
        
        {/* Body */}
        <circle cx="-8" cy="0" r="10" fill="#16a34a" stroke="#14532d" strokeWidth="1" />
        
        {/* Head */}
        <circle cx="-8" cy="0" r="7" fill="#15803d" />
      </svg>
    </div>
  );
};

export default React.memo(Player);