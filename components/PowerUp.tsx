
import React from 'react';
import { PowerUp as PowerUpState, PowerUpType } from '../types';

const PowerUp: React.FC<PowerUpState> = ({ position, radius, type }) => {
  const size = radius * 2;

  const style = {
    left: position.x - radius,
    top: position.y - radius,
    width: size,
    height: size,
  };

  const content = () => {
    switch (type) {
      case PowerUpType.HEALTH:
        return (
          <div className="w-full h-full flex items-center justify-center text-red-500 text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]">
            ♥
          </div>
        );
      case PowerUpType.DOUBLE_SHOT:
        return (
           <div className="w-full h-full flex items-center justify-center text-yellow-400 text-lg font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]">
            x2
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="absolute rounded-full animate-bounce bg-black bg-opacity-30 backdrop-blur-sm border-2 border-white border-opacity-50"
      style={{
        ...style,
        animation: 'bounce 1s infinite, fadeOut 10s forwards'
      }}
    >
      <style>
        {`
          @keyframes fadeOut {
            0%, 80% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}
      </style>
      {content()}
    </div>
  );
};

export default React.memo(PowerUp);