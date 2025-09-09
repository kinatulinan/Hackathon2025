"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// Game constants
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 650;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const MOVE_SPEED = 5;

// Character types
const FIREBOY = "fireboy";
const WATERGIRL = "watergirl";

// Game states
const GAME_STATES = {
  MENU: "menu",
  LEVEL_SELECT: "level_select",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "game_over",
  VICTORY: "victory",
  LEVEL_COMPLETE: "level_complete",
  GAME_COMPLETE: "game_complete",
};

// Level difficulties
const LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

// Level configurations
const LEVEL_CONFIGS = {
  [LEVELS.EASY]: {
    timeLimit: 30, // 30 seconds
    timeShardsRequired: 3,
    platforms: [
      { id: 1, x: 200, y: 500, width: 150, height: 20, type: "normal" },
      { id: 2, x: 400, y: 400, width: 120, height: 20, type: "normal" },
      { id: 3, x: 600, y: 300, width: 100, height: 20, type: "normal" },
      { id: 4, x: 800, y: 450, width: 120, height: 20, type: "normal" },
      { id: 5, x: 950, y: 350, width: 100, height: 20, type: "normal" },
      { id: 6, x: 1050, y: 250, width: 80, height: 20, type: "normal" },
      {
        id: 7,
        x: 100,
        y: 350,
        width: 80,
        height: 20,
        type: "moving",
        moveRange: 100,
        moveSpeed: 0.5,
      },
    ],
    timeShards: [],
    hazards: [],
    hasBoss: false,
    powerUps: [
      {
        id: 101,
        x: 320,
        y: 420,
        width: 40,
        height: 40,
        type: "time",
        collected: false,
      },
    ],
  },
  [LEVELS.MEDIUM]: {
    timeLimit: 30, // 30 seconds
    timeShardsRequired: 4,
    platforms: [
      { id: 1, x: 200, y: 500, width: 150, height: 20, type: "normal" },
      { id: 2, x: 400, y: 400, width: 120, height: 20, type: "normal" },
      { id: 3, x: 600, y: 300, width: 100, height: 20, type: "normal" },
      { id: 4, x: 800, y: 450, width: 120, height: 20, type: "normal" },
      { id: 5, x: 950, y: 350, width: 100, height: 20, type: "normal" },
      { id: 6, x: 1050, y: 250, width: 80, height: 20, type: "normal" },
      { id: 7, x: 350, y: 300, width: 80, height: 20, type: "normal" },
      { id: 8, x: 500, y: 200, width: 100, height: 20, type: "normal" },
      {
        id: 9,
        x: 100,
        y: 350,
        width: 80,
        height: 20,
        type: "moving",
        moveRange: 120,
        moveSpeed: 0.8,
      },
      {
        id: 10,
        x: 650,
        y: 150,
        width: 80,
        height: 20,
        type: "moving",
        moveRange: 80,
        moveSpeed: 1.0,
      },
    ],
    timeShards: [],
    hazards: [
      { id: 1, x: 300, y: 520, width: 50, height: 30, type: "water" },
      { id: 2, x: 700, y: 520, width: 50, height: 30, type: "fire" },
      { id: 3, x: 900, y: 520, width: 50, height: 30, type: "water" },
    ],
    hasBoss: false,
    powerUps: [
      {
        id: 201,
        x: 360,
        y: 340,
        width: 40,
        height: 40,
        type: "time",
        collected: false,
      },
    ],
  },
  [LEVELS.HARD]: {
    timeLimit: 30, // 30 seconds
    timeShardsRequired: 5,
    platforms: [
      { id: 1, x: 200, y: 500, width: 150, height: 20, type: "normal" },
      { id: 2, x: 400, y: 400, width: 120, height: 20, type: "normal" },
      { id: 3, x: 600, y: 300, width: 100, height: 20, type: "normal" },
      { id: 4, x: 800, y: 450, width: 120, height: 20, type: "normal" },
      { id: 5, x: 950, y: 350, width: 100, height: 20, type: "normal" },
      { id: 6, x: 1050, y: 250, width: 80, height: 20, type: "normal" },
      { id: 7, x: 350, y: 300, width: 80, height: 20, type: "normal" },
      { id: 8, x: 500, y: 200, width: 100, height: 20, type: "normal" },
      { id: 9, x: 750, y: 200, width: 80, height: 20, type: "normal" },
      { id: 10, x: 200, y: 350, width: 100, height: 20, type: "normal" },
      {
        id: 11,
        x: 100,
        y: 250,
        width: 80,
        height: 20,
        type: "moving",
        moveRange: 150,
        moveSpeed: 1.2,
      },
      {
        id: 12,
        x: 400,
        y: 150,
        width: 80,
        height: 20,
        type: "moving",
        moveRange: 100,
        moveSpeed: 1.5,
      },
      {
        id: 13,
        x: 800,
        y: 100,
        width: 80,
        height: 20,
        type: "moving",
        moveRange: 120,
        moveSpeed: 0.8,
      },
    ],
    timeShards: [],
    hazards: [
      { id: 1, x: 300, y: 520, width: 50, height: 30, type: "water" },
      { id: 2, x: 500, y: 520, width: 50, height: 30, type: "fire" },
      { id: 3, x: 700, y: 520, width: 50, height: 30, type: "water" },
      { id: 4, x: 900, y: 520, width: 50, height: 30, type: "fire" },
      { id: 5, x: 400, y: 520, width: 50, height: 30, type: "water" },
      { id: 6, x: 600, y: 520, width: 50, height: 30, type: "fire" },
    ],
    hasBoss: true,
    boss: {
      x: 600,
      y: 150,
      width: 100,
      height: 120,
      health: 3,
      maxHealth: 3,
      vx: 0,
      vy: 0,
      moveSpeed: 1.5,
      attackCooldown: 0,
      attackRange: 200,
      lastAttackTime: 0,
      direction: 1,
    },
    powerUps: [
      {
        id: 1,
        x: 300,
        y: 400,
        width: 40,
        height: 40,
        type: "freeze",
        collected: false,
      },
      {
        id: 2,
        x: 500,
        y: 300,
        width: 40,
        height: 40,
        type: "slow",
        collected: false,
      },
      {
        id: 3,
        x: 700,
        y: 200,
        width: 40,
        height: 40,
        type: "burn",
        collected: false,
      },
      {
        id: 301,
        x: 850,
        y: 260,
        width: 40,
        height: 40,
        type: "time",
        collected: false,
      },
    ],
  },
};

function App() {
  const bgmRef = useRef(null);
  const [gameState, setGameState] = useState(GAME_STATES.MENU);
  const [currentLevel, setCurrentLevel] = useState(LEVELS.EASY);
  const [timeShards, setTimeShards] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds real time
  const [keys, setKeys] = useState({});

  // Character states
  const [fireboy, setFireboy] = useState({
    x: 100,
    y: 585,
    vx: 0,
    vy: 0,
    onGround: false,
    width: 42,
    height: 54,
  });

  const [watergirl, setWatergirl] = useState({
    x: 150,
    y: 585,
    vx: 0,
    vy: 0,
    onGround: false,
    width: 42,
    height: 54,
  });

  // Time manipulation state
  const [timeSlowed, setTimeSlowed] = useState(false);
  const [gravityFlipped, setGravityFlipped] = useState(false);

  // Boss state
  const [boss, setBoss] = useState(null);
  const [powerUps, setPowerUps] = useState([]);
  const [bossEffects, setBossEffects] = useState({
    frozen: false,
    slowed: false,
    burning: false,
    effectDuration: 0,
  });

  // Game objects - will be initialized based on level
  const [platforms, setPlatforms] = useState([]);
  const [timeShardObjects, setTimeShardObjects] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [platformOffsets, setPlatformOffsets] = useState({});

  const [doors, setDoors] = useState([
    { id: 1, x: 1100, y: 380, width: 60, height: 100, type: "fire" },
    { id: 2, x: 1100, y: 280, width: 60, height: 100, type: "water" },
  ]);

  // Door platforms - always present
  const doorPlatforms = [
    {
      id: "fire-platform",
      x: 1100,
      y: 400,
      width: 60,
      height: 20,
      type: "door-platform",
    },
    {
      id: "water-platform",
      x: 1100,
      y: 300,
      width: 60,
      height: 20,
      type: "door-platform",
    },
  ];

  // Get next level
  const getNextLevel = (currentLevel) => {
    const levelOrder = [LEVELS.EASY, LEVELS.MEDIUM, LEVELS.HARD];
    const currentIndex = levelOrder.indexOf(currentLevel);
    return currentIndex < levelOrder.length - 1
      ? levelOrder[currentIndex + 1]
      : null;
  };

  // Initialize level based on current level
  const initializeLevel = (level) => {
    const config = LEVEL_CONFIGS[level];
    setPlatforms(config.platforms);
    setTimeShardObjects(config.timeShards);
    setHazards(config.hazards);
    setTimeLeft(config.timeLimit);
    setTimeShards(0);
    setBoss(config.hasBoss ? { ...config.boss } : null);
    setPowerUps(config.powerUps || []);
    setBossEffects({
      frozen: false,
      slowed: false,
      burning: false,
      effectDuration: 0,
    });
    console.log(
      `Level ${level} initialized with power-ups:`,
      config.powerUps || []
    );
  };

  // Handle keyboard input
  const handleKeyDown = useCallback(
    (e) => {
      // Handle pause/resume
      if (e.key === "Escape") {
        if (gameState === GAME_STATES.PLAYING) {
          setGameState(GAME_STATES.PAUSED);
        } else if (gameState === GAME_STATES.PAUSED) {
          setGameState(GAME_STATES.PLAYING);
        }
      }

      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    },
    [gameState]
  );

  const handleKeyUp = useCallback((e) => {
    setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Collision detection helper
  const checkCollision = (char, obj) => {
    return (
      char.x < obj.x + obj.width &&
      char.x + char.width > obj.x &&
      char.y < obj.y + obj.height &&
      char.y + char.height > obj.y
    );
  };

  // Check platform collision
  const checkPlatformCollision = (char) => {
    // Check level platforms
    for (const platform of platforms) {
      let platformX = platform.x;

      // Apply moving platform offset
      if (
        platform.type === "moving" &&
        platformOffsets[platform.id] !== undefined
      ) {
        const offset = platformOffsets[platform.id];
        platformX =
          platform.x +
          (offset > platform.moveRange
            ? platform.moveRange - (offset - platform.moveRange)
            : offset);
      }

      const platformWithOffset = { ...platform, x: platformX };

      if (checkCollision(char, platformWithOffset)) {
        // Check if character is above platform
        if (char.y + char.height <= platform.y + 10 && char.vy >= 0) {
          return {
            onGround: true,
            y: platform.y - char.height,
          };
        }
      }
    }

    // Check door platforms
    for (const platform of doorPlatforms) {
      if (checkCollision(char, platform)) {
        // Check if character is above platform
        if (char.y + char.height <= platform.y + 10 && char.vy >= 0) {
          return {
            onGround: true,
            y: platform.y - char.height,
          };
        }
      }
    }

    return { onGround: false };
  };

  // Check hazard collision
  const checkHazardCollision = (char, charType) => {
    for (const hazard of hazards) {
      if (checkCollision(char, hazard)) {
        if (
          (charType === "fireboy" && hazard.type === "water") ||
          (charType === "watergirl" && hazard.type === "fire")
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Check time shard collection
  const checkTimeShardCollection = (char) => {
    setTimeShardObjects((prev) =>
      prev.map((shard) => {
        if (!shard.collected && checkCollision(char, shard)) {
          setTimeShards((prev) => prev + 1);
          return { ...shard, collected: true };
        }
        return shard;
      })
    );
  };

  // Check door collision
  const checkDoorCollision = (char, charType) => {
    for (const door of doors) {
      const isColliding = checkCollision(char, door);
      if (isColliding && door.type === charType) {
        console.log(`${charType} door collision detected!`, { char, door });
        return true;
      }
      // Debug: Check if character is near the door
      if (
        char.x > 1050 &&
        char.x < 1200 &&
        char.y > door.y - 50 &&
        char.y < door.y + door.height + 50
      ) {
        console.log(`Character near ${charType} door:`, {
          charPos: { x: char.x, y: char.y },
          doorPos: {
            x: door.x,
            y: door.y,
            width: door.width,
            height: door.height,
          },
          isColliding,
        });
      }
    }
    return false;
  };

  // Check boss collision
  const checkBossCollision = (char) => {
    if (!boss) return false;
    return checkCollision(char, boss);
  };

  // Check power-up collection
  const checkPowerUpCollection = (char) => {
    setPowerUps((prev) =>
      prev.map((powerUp) => {
        if (!powerUp.collected) {
          const isColliding = checkCollision(char, powerUp);
          if (isColliding) {
            console.log(`Power-up ${powerUp.type} collected!`, {
              char,
              powerUp,
            });
            if (powerUp.type === "time") {
              // Add 5 seconds of real time
              setTimeLeft((prev) => prev + 5);
            } else {
              applyBossEffect(powerUp.type);
            }
            return { ...powerUp, collected: true };
          }
        }
        return powerUp;
      })
    );
  };

  // Apply boss effect
  const applyBossEffect = (effectType) => {
    console.log(`Applying boss effect: ${effectType}`);
    setBossEffects((prev) => {
      const newEffects = { ...prev };
      switch (effectType) {
        case "freeze":
          newEffects.frozen = true;
          newEffects.effectDuration = 300; // 5 seconds at 60fps
          console.log("Boss frozen for 5 seconds!");
          break;
        case "slow":
          newEffects.slowed = true;
          newEffects.effectDuration = 180; // 3 seconds at 60fps
          console.log("Boss slowed for 3 seconds!");
          break;
        case "burn":
          newEffects.burning = true;
          newEffects.effectDuration = 240; // 4 seconds at 60fps
          console.log("Boss burning for 4 seconds!");
          break;
      }
      return newEffects;
    });
  };

  // Update boss effects
  const updateBossEffects = () => {
    setBossEffects((prev) => {
      if (prev.effectDuration > 0) {
        return {
          ...prev,
          effectDuration: prev.effectDuration - 1,
        };
      } else {
        return {
          frozen: false,
          slowed: false,
          burning: false,
          effectDuration: 0,
        };
      }
    });
  };

  // Update boss AI
  const updateBossAI = () => {
    if (!boss) return;

    setBoss((prevBoss) => {
      if (!prevBoss) return prevBoss;

      // Skip movement if frozen
      if (bossEffects.frozen) {
        return prevBoss;
      }

      const newBoss = { ...prevBoss };
      const currentTime = Date.now();

      // Find nearest character
      const fireboyDistance = Math.sqrt(
        Math.pow(fireboy.x - prevBoss.x, 2) +
          Math.pow(fireboy.y - prevBoss.y, 2)
      );
      const watergirlDistance = Math.sqrt(
        Math.pow(watergirl.x - prevBoss.x, 2) +
          Math.pow(watergirl.y - prevBoss.y, 2)
      );

      const nearestChar =
        fireboyDistance < watergirlDistance ? fireboy : watergirl;
      const distance = Math.min(fireboyDistance, watergirlDistance);

      // Move towards nearest character
      if (distance > 50) {
        const moveSpeed = bossEffects.slowed
          ? prevBoss.moveSpeed * 0.3
          : prevBoss.moveSpeed;
        const dx = nearestChar.x - prevBoss.x;
        const dy = nearestChar.y - prevBoss.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);

        if (magnitude > 0) {
          newBoss.vx = (dx / magnitude) * moveSpeed;
          newBoss.vy = (dy / magnitude) * moveSpeed;
        }
      } else {
        newBoss.vx = 0;
        newBoss.vy = 0;
      }

      // Update position
      newBoss.x = Math.max(
        0,
        Math.min(GAME_WIDTH - newBoss.width, newBoss.x + newBoss.vx)
      );
      newBoss.y = Math.max(
        0,
        Math.min(GAME_HEIGHT - newBoss.height - 50, newBoss.y + newBoss.vy)
      );

      // Attack if in range and cooldown is ready
      if (
        distance < prevBoss.attackRange &&
        currentTime - prevBoss.lastAttackTime > 2000
      ) {
        newBoss.lastAttackTime = currentTime;
        // Trigger attack animation or effect here
      }

      // Update direction for sprite
      if (newBoss.vx !== 0) {
        newBoss.direction = newBoss.vx > 0 ? 1 : -1;
      }

      return newBoss;
    });
  };

  // Game loop
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const gameLoop = setInterval(() => {
      // Update time (decrease by 16ms worth of time each frame)
      if (!timeSlowed) {
        setTimeLeft((prev) => Math.max(0, prev - 0.016));
      }

      // Update moving platforms
      setPlatformOffsets((prev) => {
        const newOffsets = { ...prev };
        platforms.forEach((platform) => {
          if (platform.type === "moving") {
            if (!newOffsets[platform.id]) {
              newOffsets[platform.id] = 0;
            }
            newOffsets[platform.id] += platform.moveSpeed;
            if (newOffsets[platform.id] >= platform.moveRange * 2) {
              newOffsets[platform.id] = 0;
            }
          }
        });
        return newOffsets;
      });

      // Handle controls
      updateCharacter(fireboy, setFireboy, "fireboy");
      updateCharacter(watergirl, setWatergirl, "watergirl");

      // Check time shard collection
      checkTimeShardCollection(fireboy);
      checkTimeShardCollection(watergirl);

      // Check power-up collection
      checkPowerUpCollection(fireboy);
      checkPowerUpCollection(watergirl);

      // Update boss AI
      if (boss) {
        updateBossAI();
      }

      // Update boss effects
      updateBossEffects();

      // Check win/lose conditions
      if (timeLeft <= 0) {
        setGameState(GAME_STATES.GAME_OVER);
      }

      // Check if both characters reached their doors
      const linaAtDoor = checkDoorCollision(fireboy, "fire");
      const cmAtDoor = checkDoorCollision(watergirl, "water");
      const requiredShards = LEVEL_CONFIGS[currentLevel].timeShardsRequired;

      // Debug logging
      if (linaAtDoor || cmAtDoor) {
        console.log(
          `Door collision - Lina at fire door: ${linaAtDoor}, CM at water door: ${cmAtDoor}`
        );
        console.log(`Time shards: ${timeShards}/${requiredShards}`);
        console.log(
          `Lina position: (${fireboy.x}, ${fireboy.y}), CM position: (${watergirl.x}, ${watergirl.y})`
        );
      }

      // Proceed on door touch only (no shard requirement)
      if (linaAtDoor && cmAtDoor) {
        console.log("Level complete! Both characters reached their doors!");
        const nextLevel = getNextLevel(currentLevel);
        if (nextLevel) {
          console.log(`Proceeding to next level: ${nextLevel}`);
          setGameState(GAME_STATES.LEVEL_COMPLETE);
        } else {
          console.log("All levels completed! Game finished!");
          setGameState(GAME_STATES.GAME_COMPLETE);
        }
      }

      // Check boss collision (only on Hard level)
      if (
        (boss && checkBossCollision(fireboy)) ||
        checkBossCollision(watergirl)
      ) {
        setGameState(GAME_STATES.GAME_OVER);
      }
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [
    gameState,
    fireboy,
    watergirl,
    timeSlowed,
    timeLeft,
    timeShards,
    platforms,
    hazards,
    doors,
    timeShardObjects,
  ]);

  // Background music: autoplay on first PLAYING state, looped
  useEffect(() => {
    if (gameState === GAME_STATES.PLAYING && bgmRef.current) {
      const el = bgmRef.current;
      el.volume = 0.35;
      const play = el.play();
      if (play && typeof play.then === "function") {
        play.catch(() => {});
      }
    }
  }, [gameState]);

  const updateCharacter = (character, setCharacter, type) => {
    let newVx = character.vx;
    let newVy = character.vy;

    // Handle movement
    if (type === FIREBOY) {
      if (keys["a"]) newVx = -MOVE_SPEED;
      else if (keys["d"]) newVx = MOVE_SPEED;
      else newVx = 0;

      if (keys["w"] && character.onGround) {
        newVy = JUMP_FORCE;
      }

      // Time manipulation (Spacebar)
      if (keys[" "]) {
        setTimeSlowed(true);
      } else {
        setTimeSlowed(false);
      }
    } else if (type === WATERGIRL) {
      if (keys["arrowleft"]) newVx = -MOVE_SPEED;
      else if (keys["arrowright"]) newVx = MOVE_SPEED;
      else newVx = 0;

      if (keys["arrowup"] && character.onGround) {
        newVy = JUMP_FORCE;
      }

      // Gravity switch (Shift)
      if (keys["shift"]) {
        setGravityFlipped(true);
      } else {
        setGravityFlipped(false);
      }
    }

    // Apply gravity
    const gravity = gravityFlipped ? -GRAVITY : GRAVITY;
    newVy += gravity;

    // Update position
    const newX = Math.max(
      0,
      Math.min(GAME_WIDTH - character.width, character.x + newVx)
    );
    const newY = character.y + newVy;

    // Check platform collision
    const platformCollision = checkPlatformCollision({
      ...character,
      x: newX,
      y: newY,
    });

    // Check hazard collision
    const hazardCollision = checkHazardCollision(
      { ...character, x: newX, y: newY },
      type
    );

    // Check ground collision
    const onGround =
      newY >= GAME_HEIGHT - character.height - 50 || platformCollision.onGround;

    // Handle hazard collision (game over)
    if (hazardCollision) {
      setGameState(GAME_STATES.GAME_OVER);
      return;
    }

    setCharacter({
      ...character,
      x: newX,
      y: onGround
        ? platformCollision.onGround
          ? platformCollision.y
          : GAME_HEIGHT - character.height - 50
        : newY,
      vx: newVx,
      vy: onGround ? 0 : newVy,
      onGround,
    });
  };

  const startGame = (level = currentLevel) => {
    setCurrentLevel(level);
    initializeLevel(level);
    setGameState(GAME_STATES.PLAYING);
    setTimeSlowed(false);
    setGravityFlipped(false);
  };

  const resetGame = () => {
    setFireboy({
      x: 100,
      y: 585,
      vx: 0,
      vy: 0,
      onGround: false,
      width: 42,
      height: 54,
    });
    setWatergirl({
      x: 150,
      y: 585,
      vx: 0,
      vy: 0,
      onGround: false,
      width: 42,
      height: 54,
    });
    startGame();
  };

  const proceedToNextLevel = () => {
    const nextLevel = getNextLevel(currentLevel);
    if (nextLevel) {
      setFireboy({
        x: 100,
        y: 585,
        vx: 0,
        vy: 0,
        onGround: false,
        width: 42,
        height: 54,
      });
      setWatergirl({
        x: 150,
        y: 585,
        vx: 0,
        vy: 0,
        onGround: false,
        width: 42,
        height: 54,
      });
      startGame(nextLevel);
    } else {
      setGameState(GAME_STATES.GAME_COMPLETE);
    }
  };

  const returnToMenu = () => {
    setGameState(GAME_STATES.MENU);
    setCurrentLevel(LEVELS.EASY);
  };

  return (
    <div className="game-container">
      <audio ref={bgmRef} src={"./src/sprite/bgmusic.mp3"} loop />
      {gameState === GAME_STATES.MENU && (
        <div className="menu-screen">
          <h1 className="game-title">Jakiro</h1>
          <p className="game-subtitle">Elemental Clock Tower</p>
          <div className="controls-info">
            <h3>Controls:</h3>
            <div className="control-section">
              <h4>Lina (WASD):</h4>
              <p>W - Jump | A/D - Move | Space - Slow Time</p>
            </div>
            <div className="control-section">
              <h4>CM (Arrow Keys):</h4>
              <p>↑ - Jump | ←/→ - Move | Shift - Reverse Gravity</p>
            </div>
          </div>
          <button
            className="start-button"
            onClick={() => setGameState(GAME_STATES.LEVEL_SELECT)}
          >
            Select Level
          </button>
        </div>
      )}

      {gameState === GAME_STATES.LEVEL_SELECT && (
        <div className="level-select-screen">
          <h1>Select Difficulty</h1>
          <div className="level-buttons">
            <button
              className="level-button easy"
              onClick={() => startGame(LEVELS.EASY)}
            >
              <h3>Easy</h3>
              <p>60 seconds</p>
              <p>3 Time Shards</p>
              <p>No hazards</p>
            </button>
            <button
              className="level-button medium"
              onClick={() => startGame(LEVELS.MEDIUM)}
            >
              <h3>Medium</h3>
              <p>45 seconds</p>
              <p>4 Time Shards</p>
              <p>Some hazards</p>
            </button>
            <button
              className="level-button hard"
              onClick={() => startGame(LEVELS.HARD)}
            >
              <h3>Hard</h3>
              <p>30 seconds</p>
              <p>5 Time Shards</p>
              <p>Jakiro Boss!</p>
            </button>
          </div>
          <button
            className="back-button"
            onClick={() => setGameState(GAME_STATES.MENU)}
          >
            Back to Menu
          </button>
        </div>
      )}

      {gameState === GAME_STATES.PLAYING && (
        <div className="game-screen">
          <div className="hud">
            <div className="hud-item">
              <span>
                ⏰ {Math.floor(timeLeft)}:
                {Math.floor((timeLeft % 1) * 60)
                  .toString()
                  .padStart(2, "0")}
              </span>
            </div>
            <div className="hud-item">
              <span>
                💎 {timeShards}/{LEVEL_CONFIGS[currentLevel].timeShardsRequired}
              </span>
            </div>
            <div className="hud-item">
              <span>🎯 Level: {currentLevel.toUpperCase()}</span>
            </div>
            {boss && (
              <div className="hud-item">
                <span>
                  👹 Boss:{" "}
                  {bossEffects.frozen
                    ? "FROZEN"
                    : bossEffects.slowed
                    ? "SLOWED"
                    : bossEffects.burning
                    ? "BURNING"
                    : "ACTIVE"}
                  {bossEffects.effectDuration > 0 &&
                    ` (${Math.ceil(bossEffects.effectDuration / 60)}s)`}
                </span>
              </div>
            )}
            {powerUps.length > 0 && (
              <div className="hud-item">
                <span>
                  ⚡ Power-ups: {powerUps.filter((p) => !p.collected).length}{" "}
                  remaining
                </span>
              </div>
            )}
            <div className="hud-item">
              <span>🔥 Lina: {timeSlowed ? "TIME SLOWED" : "NORMAL"}</span>
            </div>
            <div className="hud-item">
              <span>
                💧 CM: {gravityFlipped ? "GRAVITY REVERSED" : "NORMAL"}
              </span>
            </div>
            <div className="hud-item">
              <span>ESC - Pause</span>
            </div>
          </div>

          <div
            className="game-world"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Ground */}
            <div
              className="ground"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "50px",
                background: "linear-gradient(45deg, #8B4513, #A0522D)",
              }}
            />

            {/* Lina */}
            <img
              src={"./src/sprite/lina.gif"}
              alt="Lina"
              className={`character lina ${timeSlowed ? "time-effect" : ""}`}
              style={{
                position: "absolute",
                left: fireboy.x,
                top: fireboy.y,
                width: fireboy.width,
                height: fireboy.height,
                transform: fireboy.vx < 0 ? "scaleX(-1)" : "scaleX(1)",
                transition: "transform 0.1s ease",
                pointerEvents: "none",
              }}
            />

            {/* CM */}
            <img
              src={"./src/sprite/cm.gif"}
              alt="CM"
              className={`character cm ${
                gravityFlipped ? "gravity-effect" : ""
              }`}
              style={{
                position: "absolute",
                left: watergirl.x,
                top: watergirl.y,
                width: watergirl.width,
                height: watergirl.height,
                transform: watergirl.vx < 0 ? "scaleX(-1)" : "scaleX(1)",
                transition: "transform 0.1s ease",
                pointerEvents: "none",
              }}
            />

            {/* Platforms */}
            {platforms.map((platform) => {
              let platformX = platform.x;

              // Apply moving platform offset
              if (
                platform.type === "moving" &&
                platformOffsets[platform.id] !== undefined
              ) {
                const offset = platformOffsets[platform.id];
                platformX =
                  platform.x +
                  (offset > platform.moveRange
                    ? platform.moveRange - (offset - platform.moveRange)
                    : offset);
              }

              return (
                <div
                  key={platform.id}
                  className={`platform ${
                    platform.type === "moving" ? "moving-platform" : ""
                  }`}
                  style={{
                    position: "absolute",
                    left: platformX,
                    top: platform.y,
                    width: platform.width,
                    height: platform.height,
                    background:
                      platform.type === "moving"
                        ? "linear-gradient(45deg, #4A90E2, #7BB3F0)"
                        : "linear-gradient(45deg, #8B4513, #A0522D)",
                    borderRadius: "5px",
                    border:
                      platform.type === "moving"
                        ? "2px solid #2E5BBA"
                        : "2px solid #654321",
                    boxShadow:
                      platform.type === "moving"
                        ? "0 2px 8px rgba(74, 144, 226, 0.4)"
                        : "0 2px 5px rgba(0, 0, 0, 0.3)",
                    transition:
                      platform.type === "moving" ? "none" : "all 0.1s ease",
                  }}
                />
              );
            })}

            {/* Door Platforms */}
            {doorPlatforms.map((platform) => (
              <div
                key={platform.id}
                className="platform door-platform"
                style={{
                  position: "absolute",
                  left: platform.x,
                  top: platform.y,
                  width: platform.width,
                  height: platform.height,
                  background: "linear-gradient(45deg, #8B4513, #A0522D)",
                  borderRadius: "5px",
                  border: "2px solid #654321",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
                }}
              />
            ))}

            {/* Time Shards */}
            {timeShardObjects.map(
              (shard) =>
                !shard.collected && (
                  <div
                    key={shard.id}
                    className="time-shard"
                    style={{
                      position: "absolute",
                      left: shard.x,
                      top: shard.y,
                      width: 20,
                      height: 20,
                      background: "radial-gradient(circle, #FFD700, #FFA500)",
                      borderRadius: "50%",
                      border: "2px solid #FF8C00",
                      boxShadow: "0 0 15px rgba(255, 215, 0, 0.8)",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )
            )}

            {/* Power-ups */}
            {powerUps.map(
              (powerUp) =>
                !powerUp.collected && (
                  <div
                    key={powerUp.id}
                    className={`power-up power-up-${powerUp.type}`}
                    style={{
                      position: "absolute",
                      left: powerUp.x,
                      top: powerUp.y,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background:
                        powerUp.type === "freeze"
                          ? "linear-gradient(45deg, #00BFFF, #87CEEB)"
                          : powerUp.type === "slow"
                          ? "linear-gradient(45deg, #9370DB, #BA55D3)"
                          : powerUp.type === "burn"
                          ? "linear-gradient(45deg, #FF4500, #FF6347)"
                          : "linear-gradient(45deg, #FFD700, #FFA500)",
                      border: `2px solid ${
                        powerUp.type === "freeze"
                          ? "#0000FF"
                          : powerUp.type === "slow"
                          ? "#800080"
                          : powerUp.type === "burn"
                          ? "#FF0000"
                          : "#DAA520"
                      }`,
                      boxShadow: `0 0 15px ${
                        powerUp.type === "freeze"
                          ? "rgba(0, 191, 255, 0.6)"
                          : powerUp.type === "slow"
                          ? "rgba(147, 112, 219, 0.6)"
                          : powerUp.type === "burn"
                          ? "rgba(255, 69, 0, 0.6)"
                          : "rgba(255, 215, 0, 0.6)"
                      }`,
                      animation:
                        "powerUpGlow 1.5s ease-in-out infinite alternate",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                      color: "white",
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
                      zIndex: 10,
                    }}
                  >
                    {powerUp.type === "freeze"
                      ? "❄"
                      : powerUp.type === "slow"
                      ? "🐌"
                      : powerUp.type === "burn"
                      ? "🔥"
                      : "+5s"}
                  </div>
                )
            )}

            {/* Hazards */}
            {hazards.map((hazard) => (
              <div
                key={hazard.id}
                className={`hazard hazard-${hazard.type}`}
                style={{
                  position: "absolute",
                  left: hazard.x,
                  top: hazard.y,
                  width: hazard.width,
                  height: hazard.height,
                  background:
                    hazard.type === "fire"
                      ? "linear-gradient(45deg, #FF4500, #FF6347)"
                      : "linear-gradient(45deg, #00BFFF, #1E90FF)",
                  borderRadius: "5px",
                  border: `2px solid ${
                    hazard.type === "fire" ? "#FF0000" : "#0000FF"
                  }`,
                  boxShadow: `0 0 10px ${
                    hazard.type === "fire"
                      ? "rgba(255, 69, 0, 0.6)"
                      : "rgba(0, 191, 255, 0.6)"
                  }`,
                  animation: "glow 1.5s ease-in-out infinite alternate",
                }}
              />
            ))}

            {/* Doors */}
            {doors.map((door) => (
              <div
                key={door.id}
                className={`door door-${door.type}`}
                style={{
                  position: "absolute",
                  left: door.x,
                  top: door.y,
                  width: door.width,
                  height: door.height,
                  background:
                    door.type === "fire"
                      ? "linear-gradient(180deg, #FF4500, #FF6347, #8B0000)"
                      : "linear-gradient(180deg, #00BFFF, #1E90FF, #000080)",
                  border: `3px solid ${
                    door.type === "fire" ? "#FF0000" : "#0000FF"
                  }`,
                  borderRadius: "10px",
                  boxShadow: `0 0 20px ${
                    door.type === "fire"
                      ? "rgba(255, 69, 0, 0.8)"
                      : "rgba(0, 191, 255, 0.8)"
                  }`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "white",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
                }}
              >
                {door.type === "fire" ? "FIRE" : "WATER"}
              </div>
            ))}

            {/* Boss */}
            {boss && (
              <div
                className={`boss ${bossEffects.frozen ? "frozen" : ""} ${
                  bossEffects.slowed ? "slowed" : ""
                } ${bossEffects.burning ? "burning" : ""}`}
                style={{
                  position: "absolute",
                  left: boss.x,
                  top: boss.y,
                  width: boss.width,
                  height: boss.height,
                  backgroundImage: "url('./src/sprite/jakiro.gif')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  border: bossEffects.frozen
                    ? "3px solid #00BFFF"
                    : bossEffects.burning
                    ? "3px solid #FF4500"
                    : "3px solid #FF0000",
                  borderRadius: "10px",
                  boxShadow: bossEffects.frozen
                    ? "0 0 20px rgba(0, 191, 255, 0.8)"
                    : bossEffects.burning
                    ? "0 0 20px rgba(255, 69, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.4)"
                    : "0 0 20px rgba(255, 0, 0, 0.8)",
                  animation: bossEffects.frozen
                    ? "bossFrozen 1s ease-in-out infinite alternate"
                    : bossEffects.burning
                    ? "bossBurning 0.5s ease-in-out infinite alternate"
                    : "bossGlow 2s ease-in-out infinite alternate",
                  transform: `scaleX(${boss.direction})`,
                  transition: "all 0.1s ease",
                  opacity: bossEffects.frozen ? 0.7 : 1,
                }}
              >
                {/* Boss Health Bar */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: 0,
                    width: "100%",
                    height: 6,
                    background: "rgba(0, 0, 0, 0.5)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(boss.health / boss.maxHealth) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #FF0000, #FF4500)",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Boss Effect Indicators */}
                {bossEffects.frozen && (
                  <div
                    style={{
                      position: "absolute",
                      top: -25,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "20px",
                      color: "#00BFFF",
                      textShadow: "0 0 10px rgba(0, 191, 255, 0.8)",
                    }}
                  >
                    ❄
                  </div>
                )}
                {bossEffects.slowed && (
                  <div
                    style={{
                      position: "absolute",
                      top: -25,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "20px",
                      color: "#9370DB",
                      textShadow: "0 0 10px rgba(147, 112, 219, 0.8)",
                    }}
                  >
                    🐌
                  </div>
                )}
                {bossEffects.burning && (
                  <div
                    style={{
                      position: "absolute",
                      top: -25,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "20px",
                      color: "#FF4500",
                      textShadow: "0 0 10px rgba(255, 69, 0, 0.8)",
                    }}
                  >
                    🔥
                  </div>
                )}
              </div>
            )}

            {/* Clock Tower Background Elements */}
            <div className="clock-tower-bg">
              <div className="gear gear-1" />
              <div className="gear gear-2" />
              <div className="pendulum" />
            </div>
          </div>
        </div>
      )}

      {gameState === GAME_STATES.PAUSED && (
        <div className="pause-screen">
          <h1>Game Paused</h1>
          <p>Press ESC to resume or click the button below</p>
          <button
            className="resume-button"
            onClick={() => setGameState(GAME_STATES.PLAYING)}
          >
            Resume Game
          </button>
          <button className="restart-button" onClick={resetGame}>
            Restart Game
          </button>
        </div>
      )}

      {gameState === GAME_STATES.GAME_OVER && (
        <div className="game-over-screen">
          <h1>Game Over!</h1>
          <p>The clock tower remains unstable.</p>
          <button className="restart-button" onClick={resetGame}>
            Try Again
          </button>
        </div>
      )}

      {gameState === GAME_STATES.LEVEL_COMPLETE && (
        <div className="level-complete-screen">
          <h1>Level Complete!</h1>
          <p>
            Great job! You've completed the {currentLevel.toUpperCase()} level!
          </p>
          <div className="level-complete-buttons">
            <button className="next-level-button" onClick={proceedToNextLevel}>
              Next Level
            </button>
            <button className="menu-button" onClick={returnToMenu}>
              Main Menu
            </button>
          </div>
        </div>
      )}

      {gameState === GAME_STATES.GAME_COMPLETE && (
        <div className="game-complete-screen">
          <h1> Congratulations! </h1>
          <p>
            You have escaped from Jakiro and successfully completed all levels!
          </p>
          <p>Firegirl and Watergirl worked together perfectly!</p>
          <p>
            Time mastery achieved across {Object.keys(LEVELS).length}{" "}
            challenging levels!
          </p>
          <div className="game-complete-buttons">
            <button className="restart-button" onClick={returnToMenu}>
              Return to Menu
            </button>
          </div>
        </div>
      )}

      {gameState === GAME_STATES.VICTORY && (
        <div className="victory-screen">
          <h1>Victory!</h1>
          <p>You've restored balance to the Elemental Clock Tower!</p>
          <button className="restart-button" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
