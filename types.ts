
export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  radius: number;
}

export enum PowerUpType {
  HEALTH = 'HEALTH',
  DOUBLE_SHOT = 'DOUBLE_SHOT',
}

export interface PowerUp extends GameObject {
  type: PowerUpType;
  spawnTime: number;
}

export enum WeaponType {
  PISTOL = 'PISTOL',
  SHOTGUN = 'SHOTGUN',
  MACHINE_GUN = 'MACHINE_GUN',
  SNIPER = 'SNIPER',
}

export interface PlayerState extends GameObject {
  angle: number;
  lives: number;
  isInvincible: boolean;
  isDoubleShotActive: boolean;
  level: number;
  xp: number;
  xpToNextLevel: number;
  weapon: WeaponType;
}

export interface MeleeAttackState {
  id: string;
  angle: number;
  startTime: number;
}

export enum EnemyType {
  NORMAL,
  SQUARE,
}

export interface EnemyState extends GameObject {
  type: EnemyType;
  hp: number;
}

export interface ProjectileState extends GameObject {
  velocity: Vector2D;
  damage: number;
  color: string;
  weaponType: WeaponType;
}

export enum GameStatus {
  Start,
  Playing,
  GameOver,
}