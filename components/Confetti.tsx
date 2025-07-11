
import React from 'react';

const CONFETTI_COUNT = 150;
const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800'];

const Confetti: React.FC = () => {
  const confettiPieces = Array.from({ length: CONFETTI_COUNT }).map((_, index) => {
    const animationDuration = 3 + Math.random() * 2;
    const animationDelay = Math.random() * 0.5;

    const style: React.CSSProperties = {
      '--random-angle': `${Math.random() * 360}deg`,
      '--random-radius': `${25 + Math.random() * 50}vw`,
      width: `${Math.round(Math.random() * 6 + 4)}px`,
      height: `${Math.round(Math.random() * 8 + 8)}px`,
      backgroundColor: colors[index % colors.length],
      animation: `confetti-burst ${animationDuration}s ${animationDelay}s cubic-bezier(0.1, 1, 0.7, 1) forwards`,
    } as React.CSSProperties;
    
    return <div key={index} className="absolute" style={style} />;
  });

  return (
    <>
      <style>
        {`
          @keyframes confetti-burst {
            0% {
              transform: translate(-50%, -50%) rotate(0deg) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(calc(cos(var(--random-angle)) * var(--random-radius) - 50%), calc(sin(var(--random-angle)) * var(--random-radius) - 50% + 100vh)) rotate(1080deg) scale(0);
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div className="absolute top-1/4 left-1/2 w-0 h-0 pointer-events-none z-50">
        {confettiPieces}
      </div>
    </>
  );
};

export default React.memo(Confetti);