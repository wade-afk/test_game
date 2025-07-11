
import React from 'react';
import { ProjectileState, WeaponType } from '../types';

const Projectile: React.FC<ProjectileState> = ({ position, radius, velocity, color, weaponType }) => {
  const isSniperShot = weaponType === WeaponType.SNIPER;

  if (isSniperShot) {
    const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);
    const width = radius * 5;
    const height = radius * 0.8;
    return (
      <div
        className="absolute rounded-sm"
        style={{
          left: position.x - width / 2,
          top: position.y - height / 2,
          width: width,
          height: height,
          backgroundColor: color,
          boxShadow: `0 0 8px 2px ${color}99`,
          transform: `rotate(${angle}deg)`,
          transformOrigin: 'center center',
        }}
      />
    );
  }

  return (
    <div
      className="absolute rounded-full"
      style={{
        left: position.x - radius,
        top: position.y - radius,
        width: radius * 2,
        height: radius * 2,
        backgroundColor: color,
        boxShadow: `0 0 8px 2px ${color}B3`,
      }}
    />
  );
};

export default React.memo(Projectile);