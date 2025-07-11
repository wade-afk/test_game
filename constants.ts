
import { WeaponType } from './types';

export const PLAYER_SIZE = 20; // radius
export const ENEMY_SIZE = 15;  // radius
export const POWER_UP_SIZE = 12; // radius

export const PLAYER_SPEED = 0.25; // pixels per ms
export const ENEMY_SPEED = 0.07; // pixels per ms

export const ENEMY_SPAWN_INTERVAL = 800; // ms

export const INITIAL_PLAYER_LIVES = 3;
export const MAX_PLAYER_LIVES = 5;
export const PLAYER_INVINCIBILITY_DURATION = 2000; // ms

export const HEALTH_DROP_CHANCE = 0.03;
export const DOUBLE_SHOT_DROP_CHANCE = 0.01;
export const DOUBLE_SHOT_DURATION = 10000; // ms (10 seconds)

export const SQUARE_ENEMY_SPAWN_CHANCE = 0.2;
export const NORMAL_ENEMY_HP = 1;
export const SQUARE_ENEMY_HP = 3;

export const POWER_UP_LIFESPAN = 10000; // ms (10 seconds)

export const SCORE_PER_STAGE = 250;
export const ENEMY_SPAWN_INTERVAL_REDUCTION_PER_STAGE = 50; // ms
export const MIN_ENEMY_SPAWN_INTERVAL = 250; // ms
export const ENEMY_SPEED_INCREASE_PER_STAGE = 0.007; // pixels per ms

// --- MELEE & LEVELING CONSTANTS ---
export const MELEE_COOLDOWN = 1500; // ms
export const MELEE_DURATION = 150; // ms
export const MELEE_RANGE = 75; // pixels
export const MELEE_ARC_ANGLE = 90; // degrees
export const MELEE_DAMAGE = 3;

export const XP_PER_NORMAL_ENEMY = 10;
export const XP_PER_SQUARE_ENEMY = 20;
export const BASE_XP_TO_LEVEL_UP = 400;
export const XP_INCREMENT_PER_LEVEL = 200;
export const FIRE_RATE_BONUS_PER_LEVEL = 0.07; // 7% faster fire rate per level

// --- WEAPON CONSTANTS ---
interface WeaponData {
  name: string;
  description: string;
  cooldown: number; // ms
  damage: number;
  projectileSpeed: number; // pixels per ms
  projectilesPerShot: number;
  spreadAngle: number; // degrees
  color: string;
  projectileSize: number; // radius
}

export const WEAPONS: { [key in WeaponType]: WeaponData } = {
  [WeaponType.PISTOL]: {
    name: 'Pistol',
    description: 'Balanced, all-purpose sidearm.',
    cooldown: 250,
    damage: 1,
    projectileSpeed: 0.6,
    projectilesPerShot: 1,
    spreadAngle: 0,
    color: '#fde047', // yellow-300
    projectileSize: 3,
  },
  [WeaponType.SHOTGUN]: {
    name: 'Shotgun',
    description: 'Devastating at close range.',
    cooldown: 800,
    damage: 1,
    projectileSpeed: 0.5,
    projectilesPerShot: 6,
    spreadAngle: 5, // spread for each pellet
    color: '#fb923c', // orange-400
    projectileSize: 2.5,
  },
  [WeaponType.MACHINE_GUN]: {
    name: 'Machine Gun',
    description: 'High fire rate, low accuracy.',
    cooldown: 80,
    damage: 0.7,
    projectileSpeed: 0.7,
    projectilesPerShot: 1,
    spreadAngle: 4, // random spread
    color: '#60a5fa', // blue-400
    projectileSize: 2.5,
  },
  [WeaponType.SNIPER]: {
    name: 'Sniper Rifle',
    description: 'Slow, but powerful and precise.',
    cooldown: 1200,
    damage: 4,
    projectileSpeed: 1.2,
    projectilesPerShot: 1,
    spreadAngle: 0,
    color: '#f472b6', // pink-400
    projectileSize: 3,
  },
};