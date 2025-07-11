
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { PlayerState, EnemyState, ProjectileState, Vector2D, PowerUp as PowerUpState, PowerUpType, EnemyType, MeleeAttackState, WeaponType } from '../types';
import { 
  PLAYER_SIZE, ENEMY_SIZE, PLAYER_SPEED, ENEMY_SPEED, 
  ENEMY_SPAWN_INTERVAL, INITIAL_PLAYER_LIVES, PLAYER_INVINCIBILITY_DURATION,
  POWER_UP_SIZE, MAX_PLAYER_LIVES, HEALTH_DROP_CHANCE, DOUBLE_SHOT_DROP_CHANCE, DOUBLE_SHOT_DURATION,
  POWER_UP_LIFESPAN, SCORE_PER_STAGE, ENEMY_SPAWN_INTERVAL_REDUCTION_PER_STAGE,
  MIN_ENEMY_SPAWN_INTERVAL, ENEMY_SPEED_INCREASE_PER_STAGE, SQUARE_ENEMY_SPAWN_CHANCE,
  NORMAL_ENEMY_HP, SQUARE_ENEMY_HP, MELEE_COOLDOWN, MELEE_DURATION, MELEE_RANGE, MELEE_ARC_ANGLE, MELEE_DAMAGE,
  XP_PER_NORMAL_ENEMY, XP_PER_SQUARE_ENEMY, BASE_XP_TO_LEVEL_UP, XP_INCREMENT_PER_LEVEL, FIRE_RATE_BONUS_PER_LEVEL,
  WEAPONS
} from '../constants';
import Player from './Player';
import Enemy from './Enemy';
import Projectile from './Projectile';
import PowerUp from './PowerUp';
import MeleeAttack from './MeleeAttack';

interface GameContainerProps {
  onGameOver: (score: number) => void;
  weapon: WeaponType;
}

// Helper to normalize angle differences
const getAngleDiff = (a1: number, a2: number) => {
    let diff = a1 - a2;
    while (diff < -180) diff += 360;
    while (diff > 180) diff += 360;
    return diff;
};

const GameContainer: React.FC<GameContainerProps> = ({ onGameOver, weapon }) => {
  const [player, setPlayer] = useState<PlayerState>({
    id: 'player',
    position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    radius: PLAYER_SIZE,
    angle: 0,
    lives: INITIAL_PLAYER_LIVES,
    isInvincible: false,
    isDoubleShotActive: false,
    level: 1,
    xp: 0,
    xpToNextLevel: BASE_XP_TO_LEVEL_UP,
    weapon: weapon,
  });
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [projectiles, setProjectiles] = useState<ProjectileState[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpState[]>([]);
  const [meleeAttack, setMeleeAttack] = useState<MeleeAttackState | null>(null);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [mousePosition, setMousePosition] = useState<Vector2D>({ x: 0, y: 0 });
  
  const keysPressed = useKeyboardInput();
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Timers and State Refs
  const lastShotTimeRef = useRef(0);
  const lastEnemySpawnTimeRef = useRef(0);
  const lastMeleeTimeRef = useRef(0);
  const invincibilityEndTimeRef = useRef(0);
  const doubleShotEndTimeRef = useRef(0);
  const primaryWeaponRef = useRef<WeaponType>(weapon);
  const eKeyPressedRef = useRef(false);

  // Update stage based on score
  useEffect(() => {
    const newStage = Math.floor(score / SCORE_PER_STAGE) + 1;
    if (newStage > stage) {
      setStage(newStage);
    }
  }, [score, stage]);

  // Mouse/Keyboard handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleMouseDown = (e: MouseEvent) => e.button === 0 && keysPressed.add('mousedown');
    const handleMouseUp = (e: MouseEvent) => e.button === 0 && keysPressed.delete('mousedown');
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [keysPressed]);


  const gameLoopCallback = useCallback((deltaTime: number) => {
    if (!gameAreaRef.current) return;
    const { width, height } = gameAreaRef.current.getBoundingClientRect();
    const now = Date.now();

    // --- DIFFFULTY & STAT SCALING ---
    const weaponData = WEAPONS[player.weapon];
    const fireRateBonus = 1 + (player.level - 1) * FIRE_RATE_BONUS_PER_LEVEL;
    const currentCooldown = weaponData.cooldown / fireRateBonus;
    const currentEnemySpawnInterval = Math.max(MIN_ENEMY_SPAWN_INTERVAL, ENEMY_SPAWN_INTERVAL - (stage - 1) * ENEMY_SPAWN_INTERVAL_REDUCTION_PER_STAGE);
    const currentEnemySpeed = ENEMY_SPEED + (stage - 1) * ENEMY_SPEED_INCREASE_PER_STAGE;
    
    // --- TIMEOUTS & LIFESPAN ---
    if (player.isInvincible && now > invincibilityEndTimeRef.current) setPlayer(p => ({ ...p, isInvincible: false }));
    if (player.isDoubleShotActive && now > doubleShotEndTimeRef.current) setPlayer(p => ({ ...p, isDoubleShotActive: false }));
    setPowerUps(prev => prev.filter(p => now < p.spawnTime + POWER_UP_LIFESPAN));
    if (meleeAttack && now > meleeAttack.startTime + MELEE_DURATION) setMeleeAttack(null);

    // --- PLAYER MOVEMENT ---
    setPlayer(p => {
      let moveVector = { x: 0, y: 0 };
      if (keysPressed.has('w')) moveVector.y -= 1;
      if (keysPressed.has('s')) moveVector.y += 1;
      if (keysPressed.has('a')) moveVector.x -= 1;
      if (keysPressed.has('d')) moveVector.x += 1;

      const len = Math.sqrt(moveVector.x ** 2 + moveVector.y ** 2);
      if (len > 0) {
        moveVector.x /= len;
        moveVector.y /= len;
      }
      
      const moveDistance = PLAYER_SPEED * deltaTime;
      let newX = p.position.x + moveVector.x * moveDistance;
      let newY = p.position.y + moveVector.y * moveDistance;
      newX = Math.max(p.radius, Math.min(width - p.radius, newX));
      newY = Math.max(p.radius, Math.min(height - p.radius, newY));

      const dx = mousePosition.x - newX;
      const dy = mousePosition.y - newY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      return { ...p, position: { x: newX, y: newY }, angle };
    });

    // --- WEAPON SWAP LOGIC ---
    if (keysPressed.has('e')) {
        if (!eKeyPressedRef.current) {
            eKeyPressedRef.current = true;
            setPlayer(p => {
                const newWeapon = p.weapon === WeaponType.PISTOL ? primaryWeaponRef.current : WeaponType.PISTOL;
                return { ...p, weapon: newWeapon };
            });
        }
    } else {
        eKeyPressedRef.current = false;
    }

    // --- SHOOTING & MELEE LOGIC ---
    if (keysPressed.has('mousedown') && now - lastShotTimeRef.current > currentCooldown) {
      lastShotTimeRef.current = now;
      const newProjectiles: ProjectileState[] = [];
      
      const shotCount = player.isDoubleShotActive ? weaponData.projectilesPerShot * 2 : weaponData.projectilesPerShot;

      for (let i = 0; i < shotCount; i++) {
        const dx = mousePosition.x - player.position.x;
        const dy = mousePosition.y - player.position.y;
        const angleRad = Math.atan2(dy, dx);
        
        let spread = 0;
        if (weaponData.projectilesPerShot > 1) { // Shotgun spread
            spread = (i - (weaponData.projectilesPerShot - 1) / 2) * (weaponData.spreadAngle * Math.PI / 180);
        } else if (weaponData.spreadAngle > 0) { // Machine gun spread
            spread = (Math.random() - 0.5) * 2 * (weaponData.spreadAngle * Math.PI / 180);
        }

        const finalAngle = angleRad + spread;
        const velocity = { x: Math.cos(finalAngle) * weaponData.projectileSpeed, y: Math.sin(finalAngle) * weaponData.projectileSpeed };

        let startPos = { ...player.position };
        if (player.isDoubleShotActive && weaponData.projectilesPerShot === 1) {
            // Give double shot a slight offset for single-shot weapons
            const perp = { x: -velocity.y, y: velocity.x };
            const spreadAmount = 8 / weaponData.projectileSpeed;
            startPos = { 
                x: player.position.x + (i % 2 === 0 ? 1 : -1) * perp.x * spreadAmount, 
                y: player.position.y + (i % 2 === 0 ? 1 : -1) * perp.y * spreadAmount
            };
        }

        newProjectiles.push({
          id: `proj_${now}_${i}`,
          position: startPos,
          velocity,
          radius: weaponData.projectileSize,
          damage: weaponData.damage,
          color: weaponData.color,
          weaponType: player.weapon,
        });
      }
      setProjectiles(prev => [...prev, ...newProjectiles]);
    }
    
    if (keysPressed.has('f') && now - lastMeleeTimeRef.current > MELEE_COOLDOWN) {
        lastMeleeTimeRef.current = now;
        setMeleeAttack({ id: `melee_${now}`, angle: player.angle, startTime: now });
    }

    // --- UPDATE PROJECTILE POSITIONS ---
    setProjectiles(prev => 
      prev.map(p => ({ ...p, position: { x: p.position.x + p.velocity.x * deltaTime, y: p.position.y + p.velocity.y * deltaTime } }))
          .filter(p => p.position.x > 0 && p.position.x < width && p.position.y > 0 && p.position.y < height)
    );

    // --- CALCULATE NEXT ENEMY STATE (MOVEMENT & SPAWNING) ---
    // First, move existing enemies
    let nextEnemies = enemies.map(e => {
        const dx = player.position.x - e.position.x;
        const dy = player.position.y - e.position.y;
        const distSq = dx * dx + dy * dy;
        if (distSq > 1) {
            const len = Math.sqrt(distSq);
            const moveDistance = currentEnemySpeed * deltaTime;
            return { ...e, position: { x: e.position.x + (dx / len) * moveDistance, y: e.position.y + (dy / len) * moveDistance } };
        }
        return e;
    });

    // Second, spawn new enemies and add them to the list
    if (now - lastEnemySpawnTimeRef.current > currentEnemySpawnInterval) {
      lastEnemySpawnTimeRef.current = now;
      const side = Math.floor(Math.random() * 4);
      let pos: Vector2D;
      switch(side) {
        case 0: pos = { x: Math.random() * width, y: -ENEMY_SIZE }; break;
        case 1: pos = { x: Math.random() * width, y: height + ENEMY_SIZE }; break;
        case 2: pos = { x: -ENEMY_SIZE, y: Math.random() * height }; break;
        default: pos = { x: width + ENEMY_SIZE, y: Math.random() * height }; break;
      }
      const type = Math.random() < SQUARE_ENEMY_SPAWN_CHANCE ? EnemyType.SQUARE : EnemyType.NORMAL;
      const newEnemy: EnemyState = { id: `enemy_${now}`, position: pos, radius: ENEMY_SIZE, type, hp: type === EnemyType.SQUARE ? SQUARE_ENEMY_HP : NORMAL_ENEMY_HP };
      nextEnemies.push(newEnemy);
    }
    
    // --- COLLISION DETECTION & GAME STATE UPDATES ---
    const hitProjectiles = new Set<string>();
    const newlySpawnedPowerUps: PowerUpState[] = [];
    let enemiesAfterProcessing = [...nextEnemies]; // Work with the moved/spawned enemies
    const destroyedEnemyIndices = new Set<number>();
    let newScore = score;
    let newXp = player.xp;

    // Check melee hits
    if (meleeAttack) {
        enemiesAfterProcessing = enemiesAfterProcessing.map((enemy, index) => {
            if (destroyedEnemyIndices.has(index)) return enemy;

            const dx = enemy.position.x - player.position.x;
            const dy = enemy.position.y - player.position.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < MELEE_RANGE + enemy.radius) {
                const enemyAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                const angleDiff = Math.abs(getAngleDiff(player.angle, enemyAngle));
                if (angleDiff <= MELEE_ARC_ANGLE / 2) {
                     const newHp = enemy.hp - MELEE_DAMAGE;
                     if (newHp <= 0) destroyedEnemyIndices.add(index);
                     return { ...enemy, hp: newHp };
                }
            }
            return enemy;
        });
    }

    // Check projectile hits
    projectiles.forEach(p => {
        if (hitProjectiles.has(p.id)) return;
        
        for (let i = 0; i < enemiesAfterProcessing.length; i++) {
            if (destroyedEnemyIndices.has(i)) continue;
            
            const enemy = enemiesAfterProcessing[i];
            const dx = p.position.x - enemy.position.x;
            const dy = p.position.y - enemy.position.y;
            
            if ((dx * dx + dy * dy) < (p.radius + enemy.radius) ** 2) {
                hitProjectiles.add(p.id);
                const newHp = enemy.hp - p.damage;
                enemiesAfterProcessing[i] = { ...enemy, hp: newHp };
                if (newHp <= 0) {
                    destroyedEnemyIndices.add(i);
                }
                break; // Projectile hits one enemy and is destroyed
            }
        }
    });

    // Process destroyed enemies and determine final enemy list for this frame
    const finalEnemies = enemiesAfterProcessing.filter((enemy, index) => {
        if (destroyedEnemyIndices.has(index)) {
            newScore += (enemy.type === EnemyType.NORMAL ? 1 : 2) * 10;
            newXp += (enemy.type === EnemyType.NORMAL ? XP_PER_NORMAL_ENEMY : XP_PER_SQUARE_ENEMY);
            
            const dropRoll = Math.random();
            if (dropRoll < DOUBLE_SHOT_DROP_CHANCE) {
                newlySpawnedPowerUps.push({ id: `powerup_${now}_${enemy.id}`, position: enemy.position, radius: POWER_UP_SIZE, type: PowerUpType.DOUBLE_SHOT, spawnTime: now });
            } else if (dropRoll < DOUBLE_SHOT_DROP_CHANCE + HEALTH_DROP_CHANCE) {
                newlySpawnedPowerUps.push({ id: `powerup_${now}_${enemy.id}`, position: enemy.position, radius: POWER_UP_SIZE, type: PowerUpType.HEALTH, spawnTime: now });
            }
            return false;
        }
        return true;
    });

    // Update game state based on this frame's events
    if (newScore !== score) setScore(newScore);
    
    if (newXp !== player.xp) {
        setPlayer(p => {
            let currentXp = newXp;
            let currentLevel = p.level;
            let currentXpToNext = p.xpToNextLevel;
            while (currentXp >= currentXpToNext) {
                currentLevel++;
                currentXp -= currentXpToNext;
                currentXpToNext = BASE_XP_TO_LEVEL_UP + (currentLevel - 1) * XP_INCREMENT_PER_LEVEL;
            }
            return { ...p, xp: currentXp, level: currentLevel, xpToNextLevel: currentXpToNext };
        });
    }

    // Commit the final list of enemies for this frame
    setEnemies(finalEnemies);
    setProjectiles(prev => prev.filter(p => !hitProjectiles.has(p.id)));
    if (newlySpawnedPowerUps.length > 0) setPowerUps(prev => [...prev, ...newlySpawnedPowerUps]);
    
    // --- PLAYER vs POWER-UPS COLLISION ---
    const collectedPowerUpIds = new Set<string>();
    powerUps.forEach(powerUp => {
      if (Math.hypot(player.position.x - powerUp.position.x, player.position.y - powerUp.position.y) < player.radius + powerUp.radius) {
        collectedPowerUpIds.add(powerUp.id);
        if (powerUp.type === PowerUpType.HEALTH) setPlayer(p => ({ ...p, lives: Math.min(p.lives + 1, MAX_PLAYER_LIVES) }));
        if (powerUp.type === PowerUpType.DOUBLE_SHOT) {
            setPlayer(p => ({ ...p, isDoubleShotActive: true }));
            doubleShotEndTimeRef.current = now + DOUBLE_SHOT_DURATION;
        }
      }
    });
    if (collectedPowerUpIds.size > 0) setPowerUps(prev => prev.filter(p => !collectedPowerUpIds.has(p.id)));

    // --- PLAYER vs ENEMIES COLLISION ---
    if (!player.isInvincible && finalEnemies.some(e => Math.hypot(player.position.x - e.position.x, player.position.y - e.position.y) < player.radius + e.radius)) {
      const newLives = player.lives - 1;
      if (newLives <= 0) {
        onGameOver(score); // Use the score from the beginning of the frame for fairness
        return;
      }
      invincibilityEndTimeRef.current = now + PLAYER_INVINCIBILITY_DURATION;
      setPlayer(p => ({ ...p, lives: newLives, isInvincible: true }));
    }

  }, [player, keysPressed, mousePosition, onGameOver, score, enemies, projectiles, powerUps, stage, meleeAttack]);

  useGameLoop(gameLoopCallback);

  return (
    <div 
      ref={gameAreaRef} 
      className="relative w-full h-full overflow-hidden bg-gray-900"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
        {/* HUD */}
        <div className="absolute top-4 left-4 text-white text-lg font-bold z-10 flex flex-col items-start gap-2">
            <div className="flex items-center gap-4">
                <span>Score: {score}</span>
                <span className="text-green-400">Stage: {stage}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-cyan-400">Lv. {player.level}</span>
                <div className="w-40 h-4 bg-gray-700 rounded-full overflow-hidden border border-gray-500">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{width: `${(player.xp / player.xpToNextLevel) * 100}%`}}></div>
                </div>
            </div>
             {player.isDoubleShotActive && (
                <span className="text-yellow-400 text-sm font-bold animate-pulse px-2 py-1 rounded-md bg-black bg-opacity-40 border border-yellow-500">
                    DOUBLE SHOT
                </span>
            )}
        </div>
        <div className="absolute top-4 right-4 text-white text-2xl font-bold z-10 flex items-center gap-2">
            <span className="text-red-500 text-3xl">♥</span>
            <span>{player.lives}</span>
        </div>

        {/* Game Objects */}
        <Player {...player} />
        {meleeAttack && <MeleeAttack {...meleeAttack} playerPosition={player.position} />}
        {enemies.map(enemy => <Enemy key={enemy.id} {...enemy} maxHp={enemy.type === EnemyType.SQUARE ? SQUARE_ENEMY_HP : NORMAL_ENEMY_HP} />)}
        {projectiles.map( projectile => <Projectile key={projectile.id} {...projectile} />)}
        {powerUps.map(powerUp => <PowerUp key={powerUp.id} {...powerUp} />)}
    </div>
  );
};

export default GameContainer;