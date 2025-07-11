
import React from 'react';
import { Vector2D } from '../types';
import { MELEE_RANGE, MELEE_ARC_ANGLE, MELEE_DURATION } from '../constants';

interface MeleeAttackProps {
  id: string;
  angle: number;
  startTime: number;
  playerPosition: Vector2D;
}

const MeleeAttack: React.FC<MeleeAttackProps> = ({ angle, playerPosition }) => {
  const arcPath = () => {
    const startAngle = -MELEE_ARC_ANGLE / 2;
    const endAngle = MELEE_ARC_ANGLE / 2;

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(0, 0, MELEE_RANGE, endAngle);
    const end = polarToCartesian(0, 0, MELEE_RANGE, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
      'M', 0, 0,
      'L', start.x, start.y,
      'A', MELEE_RANGE, MELEE_RANGE, 0, largeArcFlag, 0, end.x, end.y,
      'L', 0, 0,
    ].join(' ');

    return d;
  };
  
  return (
    <div
      className="absolute"
      style={{
        left: playerPosition.x,
        top: playerPosition.y,
        transform: `rotate(${angle}deg)`,
        animation: `melee-fade ${MELEE_DURATION}ms ease-out forwards`,
      }}
    >
      <style>
        {`
          @keyframes melee-fade {
            0% { opacity: 0.8; transform: rotate(${angle}deg) scale(0.8); }
            50% { opacity: 1; transform: rotate(${angle}deg) scale(1.1); }
            100% { opacity: 0; transform: rotate(${angle}deg) scale(1.2); }
          }
        `}
      </style>
      <svg
        viewBox={`-${MELEE_RANGE + 10} -${MELEE_RANGE + 10} ${(MELEE_RANGE + 10) * 2} ${(MELEE_RANGE + 10) * 2}`}
        className="overflow-visible"
        style={{ width: (MELEE_RANGE + 10) * 2, height: (MELEE_RANGE + 10) * 2, transform: 'translate(-50%, -50%)' }}
      >
        <path d={arcPath()} fill="rgba(255, 255, 255, 0.5)" stroke="rgba(200, 255, 255, 0.8)" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default React.memo(MeleeAttack);