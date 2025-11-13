'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer,
  Heart,
  Trophy,
  Zap,
  HelpCircle,
  Pause,
  Play,
  Bug,
} from "lucide-react";
import Link from "next/link";
import { MazeEngine, type MazeConfig } from "@/lib/maze-engine";
import { SoundManager } from "@/lib/sound-manager";
import { GameOverModal } from "@/components/game-over-modal";
import { SafetyTipModal } from "@/components/safety-tip-modal";
import { MobileGameControls } from "@/components/mobile-game-controls";
import { GameInstructions } from "@/components/game-instructions";
import { DebugOverlay } from "@/components/debug-overlay";
import { FinalScoreModal } from "@/components/final-score-modal";
import { ToastNotification } from "@/components/toast-notification";

interface GameState {
  maze: string[][];
  playerPos: { x: number; y: number };
  exitPos: { x: number; y: number };
  collectibles: Array<{ x: number; y: number; type: string; collected: boolean; powerUp?: boolean }>;
  obstacles: Array<{ x: number; y: number; type: string }>;
  score: number;
  time: number;
  health: number;
  gameStatus: "playing" | "won" | "lost" | "paused";
  collectedItems: number;
  combo: number;
  lastMoveTime: number;
  powerUpActive: boolean;
  powerUpTimeLeft: number;
  debugInfo?: any;
  mistakes: number;
  gameStartTime: number;
  inputDisabled: boolean;
}

const GRID_SIZE = 12;
const CELL_SIZE = 40;

const config = {
  hazardPenalty: { health: 15, time: 5 },
  lethalHazards: new Set(["lava"]),
  timeValue: 10,
  itemValue: 50,
  healthValue: 200,
  mistakePenalty: 25,
  topLimit: 50,
  toastDuration: 3000,
  autoSaveScoreIfClosed: true,
  hazardTypes: new Set(["fire", "broken", "lava", "danger"]),
};

export default function GamePage() {
  // refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const timerRef = useRef<number | undefined>(undefined);
  const ariaLivePoliteRef = useRef<HTMLDivElement | null>(null);
  const ariaLiveAssertiveRef = useRef<HTMLDivElement | null>(null);

  // engines/managers as refs (created on mount)
  const mazeEngineRef = useRef<MazeEngine | null>(null);
  const soundManagerRef = useRef<SoundManager | null>(null);

  // state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showSafetyTip, setShowSafetyTip] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [finalScoreData, setFinalScoreData] = useState<any>(null);

  // initialize maze engine and sound manager on mount
  useEffect(() => {
    // determine debug mode from URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const isDebugMode = urlParams.get("debug") === "true";
      setDebugMode(isDebugMode);

      // create MazeEngine
      const mazeConfig: Partial<MazeConfig> = {
        debugMode: isDebugMode,
        allowDiagonal: false,
        obstacleCost: 10,
        maxRepairIterations: 50,
        mutateGridByDefault: true,
      };
      mazeEngineRef.current = new MazeEngine(GRID_SIZE, mazeConfig);

      // create sound manager
      soundManagerRef.current = new SoundManager();
      soundManagerRef.current.setEnabled(soundEnabled);
    } catch {
      // fallback safe initialization
      mazeEngineRef.current = new MazeEngine(GRID_SIZE, { debugMode: false });
      soundManagerRef.current = new SoundManager();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // sync sound manager when soundEnabled changes
  useEffect(() => {
    if (soundManagerRef.current) soundManagerRef.current.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const announceForAccessibility = useCallback((text: string, assertive = false) => {
    const targetRef = assertive ? ariaLiveAssertiveRef : ariaLivePoliteRef;
    if (targetRef.current) {
      targetRef.current.textContent = text;
      setTimeout(() => {
        if (targetRef.current) targetRef.current.textContent = "";
      }, 1000);
    }
  }, []);

  // Hazard collision handler
  const handleHazardCollision = useCallback(
    (playerPos: { x: number; y: number }, tile: any) => {
      if (!gameState) return false;

      const hazardType = tile.type || "fire";

      if (config.lethalHazards.has(hazardType)) {
        setGameState((prev) => (prev ? { ...prev, health: 0, gameStatus: "lost" } : prev));
        announceForAccessibility(`Game Over! You stepped on lethal ${hazardType}`, true);
        return true;
      }

      const healthPenalty = config.hazardPenalty.health;
      const timePenalty = config.hazardPenalty.time;

      setGameState((prev) => {
        if (!prev) return prev;
        const newHealth = Math.max(0, prev.health - healthPenalty);
        const newTime = prev.time + timePenalty;
        const newMistakes = prev.mistakes + 1;

        return {
          ...prev,
          health: newHealth,
          time: newTime,
          mistakes: newMistakes,
          gameStatus: newHealth <= 0 ? "lost" : prev.gameStatus,
        };
      });

      const warningMessage = `Warning: You stepped on ${hazardType.toUpperCase()} — Health -${healthPenalty} / Time -${timePenalty}s`;
      setToastMessage(warningMessage);
      announceForAccessibility(warningMessage);

      setTimeout(() => setToastMessage(null), config.toastDuration);

      if ("vibrate" in navigator) {
        try {
          navigator.vibrate?.(200);
        } catch {}
      }

      soundManagerRef.current?.playObstacleHit();
      return false;
    },
    [gameState, announceForAccessibility]
  );

  const computeFinalScore = useCallback(
    (result: { timeRemaining: number; itemsCollected: number; health: number; mistakes: number }) => {
      const base = Math.max(0, Math.round(result.timeRemaining * config.timeValue));
      const itemBonus = result.itemsCollected * config.itemValue;
      const healthBonus = Math.round((result.health / 100) * config.healthValue);
      const mistakePenalty = result.mistakes * config.mistakePenalty;
      return Math.max(0, base + itemBonus + healthBonus - mistakePenalty);
    },
    []
  );

  const handleExitReached = useCallback(
    (playerPos: { x: number; y: number }, exitPos: { x: number; y: number }) => {
      if (!gameState) return;

      // Stop input & timers
      setGameState((prev) => (prev ? { ...prev, inputDisabled: true, gameStatus: "won" } : prev));
      if (timerRef.current) clearInterval(timerRef.current);

      // Compute & save final score
      const timeRemaining = Math.max(0, 300 - gameState.time);
      const finalScore = computeFinalScore({
        timeRemaining,
        itemsCollected: gameState.collectedItems,
        health: gameState.health,
        mistakes: gameState.mistakes,
      });

      const scoreData = {
        finalScore,
        timeRemaining,
        itemsCollected: gameState.collectedItems,
        health: gameState.health,
        mistakes: gameState.mistakes,
        totalTime: gameState.time,
      };

      try {
        localStorage.setItem("lastFinalScore", JSON.stringify(scoreData));
      } catch {}

      // Feedback
      announceForAccessibility(`Congratulations! You escaped! Final score: ${finalScore}`, true);
      soundManagerRef.current?.playCollect();

      // Save final to state & show modal
      setFinalScoreData(scoreData);
      setShowFinalScore(true);

      // Optionally redirect to landing after a short delay (commented out)
      // setTimeout(() => (window.location.href = "/"), 1500);
    },
    [gameState, computeFinalScore, announceForAccessibility]
  );

  const initializeGame = useCallback(() => {
    if (!mazeEngineRef.current) {
      mazeEngineRef.current = new MazeEngine(GRID_SIZE, { debugMode, allowDiagonal: false });
    }

    const result = mazeEngineRef.current.generateMaze();
    const { maze, playerPos, exitPos, collectibles, obstacles, debugInfo } = result;

    setGameState({
      maze,
      playerPos,
      exitPos,
      collectibles,
      obstacles,
      score: 1000,
      time: 0,
      health: 100,
      gameStatus: "playing",
      collectedItems: 0,
      combo: 0,
      lastMoveTime: Date.now(),
      powerUpActive: false,
      powerUpTimeLeft: 0,
      debugInfo,
      mistakes: 0,
      gameStartTime: Date.now(),
      inputDisabled: false,
    });

    setShowGameOver(false);
    setShowSafetyTip(null);
    setShowFinalScore(false);
    setFinalScoreData(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setGameState((prev) => {
        if (!prev || prev.gameStatus !== "playing") return prev;
        return { ...prev, time: prev.time + 1 };
      });
    }, 1000);
  }, [debugMode]);

  const toggleDebugMode = useCallback(() => {
    setDebugMode((prev) => !prev);
    if (mazeEngineRef.current) mazeEngineRef.current.config.debugMode = !debugMode;
  }, [debugMode]);

  const togglePause = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gameStatus: prev.gameStatus === "paused" ? "playing" : "paused",
      };
    });
  }, []);

  const movePlayer = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!gameState || gameState.gameStatus !== "playing" || gameState.inputDisabled) return;

      setGameState((prev) => {
        if (!prev) return prev;

        const { x, y } = prev.playerPos;
        let newX = x;
        let newY = y;

        switch (direction) {
          case "up":
            newY = Math.max(0, y - 1);
            break;
          case "down":
            newY = Math.min(GRID_SIZE - 1, y + 1);
            break;
          case "left":
            newX = Math.max(0, x - 1);
            break;
          case "right":
            newX = Math.min(GRID_SIZE - 1, x + 1);
            break;
        }

        if (prev.maze[newY][newX] === "#") {
          return prev;
        }

        if (newX === prev.exitPos.x && newY === prev.exitPos.y) {
          setTimeout(() => handleExitReached({ x: newX, y: newY }, prev.exitPos), 100);
          return { ...prev, playerPos: { x: newX, y: newY } };
        }

        soundManagerRef.current?.playMove();

        const hitObstacle = prev.obstacles.find((obs) => obs.x === newX && obs.y === newY);
        let newHealth = prev.health;
        let newScore = prev.score;
        let newCombo = prev.combo;

        if (hitObstacle && !prev.powerUpActive) {
          const isHazard = config.hazardTypes.has(hitObstacle.type);
          if (isHazard) {
            const shouldBlock = handleHazardCollision({ x: newX, y: newY }, hitObstacle);
            if (shouldBlock) return prev;
          } else {
            newHealth = Math.max(0, prev.health - 10);
            newScore = Math.max(0, prev.score - 50);
            newCombo = 0;
            soundManagerRef.current?.playObstacleHit();
          }
        } else if (hitObstacle && prev.powerUpActive) {
          newScore += 25;
        }

        const updatedCollectibles = prev.collectibles.map((item) => {
          if (item.x === newX && item.y === newY && !item.collected) {
            newScore += 100 + newCombo * 10;
            newCombo += 1;
            soundManagerRef.current?.playCollect();
            setTimeout(() => setShowSafetyTip(item.type), 100);
            if (newCombo >= 3) {
              return { ...item, collected: true, powerUp: true };
            }
            return { ...item, collected: true };
          }
          return item;
        });

        const collectedCount = updatedCollectibles.filter((item) => item.collected).length;

        let newPowerUpActive = prev.powerUpActive;
        let newPowerUpTimeLeft = prev.powerUpTimeLeft;

        if (newCombo >= 3 && !prev.powerUpActive) {
          newPowerUpActive = true;
          newPowerUpTimeLeft = 10;
        }

        return {
          ...prev,
          playerPos: { x: newX, y: newY },
          collectibles: updatedCollectibles,
          health: newHealth,
          score: newScore,
          collectedItems: collectedCount,
          combo: newCombo,
          lastMoveTime: Date.now(),
          powerUpActive: newPowerUpActive,
          powerUpTimeLeft: newPowerUpTimeLeft,
        };
      });
    },
    [gameState, handleHazardCollision, handleExitReached]
  );

  // keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState?.inputDisabled) return;

      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.key.toLowerCase() === "d" && e.ctrlKey) {
        e.preventDefault();
        toggleDebugMode();
        return;
      }

      if (gameState?.gameStatus !== "playing") return;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          e.preventDefault();
          movePlayer("up");
          break;
        case "arrowdown":
        case "s":
          e.preventDefault();
          movePlayer("down");
          break;
        case "arrowleft":
        case "a":
          e.preventDefault();
          movePlayer("left");
          break;
        case "arrowright":
        case "d":
          e.preventDefault();
          movePlayer("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [movePlayer, togglePause, toggleDebugMode, gameState]);

  // storage/leaderboard & custom events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "leaderboard_last_update") {
        window.dispatchEvent(new CustomEvent("leaderboard:updated"));
      }
    };

    const handleLeaderboardUpdate = () => {
      // placeholder; add behavior if needed
      console.log("[v0] Leaderboard updated");
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("leaderboard:updated", handleLeaderboardUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("leaderboard:updated", handleLeaderboardUpdate);
    };
  }, []);

  useEffect(() => {
    const handleMazeRepaired = (event: Event) => {
      // event assumed to be CustomEvent with detail.message
      const detail = (event as CustomEvent).detail;
      const message = detail?.message ?? "Maze repaired";
      setToastMessage(message);
      setTimeout(() => setToastMessage(null), 4000);
    };

    window.addEventListener("maze-repaired", handleMazeRepaired as EventListener);
    return () => {
      window.removeEventListener("maze-repaired", handleMazeRepaired as EventListener);
    };
  }, []);

  // canvas drawing
  useEffect(() => {
    if (!gameState || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(1, (canvas.parentElement?.clientWidth || 480) / (GRID_SIZE * CELL_SIZE));
    ctx.save();
    ctx.scale(scale, scale);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = gameState.maze[y][x];
        const posX = x * CELL_SIZE;
        const posY = y * CELL_SIZE;

        if (cell === "#") {
          ctx.fillStyle = "#374151";
          ctx.fillRect(posX, posY, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = "#4B5563";
          ctx.strokeRect(posX, posY, CELL_SIZE, CELL_SIZE);
        } else {
          ctx.fillStyle = "#1F2937";
          ctx.fillRect(posX, posY, CELL_SIZE, CELL_SIZE);
          ctx.strokeStyle = "#374151";
          ctx.strokeRect(posX, posY, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    const exitX = gameState.exitPos.x * CELL_SIZE;
    const exitY = gameState.exitPos.y * CELL_SIZE;
    ctx.fillStyle = "#10B981";
    ctx.fillRect(exitX + 5, exitY + 5, CELL_SIZE - 10, CELL_SIZE - 10);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🚨", exitX + CELL_SIZE / 2, exitY + CELL_SIZE / 2 + 7);

    gameState.obstacles.forEach((obstacle) => {
      const obsX = obstacle.x * CELL_SIZE;
      const obsY = obstacle.y * CELL_SIZE;
      ctx.globalAlpha = gameState.powerUpActive ? 0.5 : 1.0;
      ctx.fillStyle = "#DC2626";
      ctx.fillRect(obsX + 8, obsY + 8, CELL_SIZE - 16, CELL_SIZE - 16);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";

      let emoji = "🔥";
      if (obstacle.type === "stairs") emoji = "🚧";
      if (obstacle.type === "door") emoji = "🚪";

      ctx.fillText(emoji, obsX + CELL_SIZE / 2, obsY + CELL_SIZE / 2 + 5);
      ctx.globalAlpha = 1.0;
    });

    gameState.collectibles.forEach((item) => {
      if (!item.collected) {
        const itemX = item.x * CELL_SIZE;
        const itemY = item.y * CELL_SIZE;
        const pulse = Math.sin(Date.now() * 0.005) * 0.1 + 0.9;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = "#F59E0B";
        ctx.fillRect(itemX + 6, itemY + 6, CELL_SIZE - 12, CELL_SIZE - 12);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";

        let emoji = "🧯";
        if (item.type === "firstaid") emoji = "💊";
        if (item.type === "flashlight") emoji = "🔦";
        if (item.type === "phone") emoji = "📱";

        ctx.fillText(emoji, itemX + CELL_SIZE / 2, itemY + CELL_SIZE / 2 + 4);
        ctx.globalAlpha = 1.0;
      }
    });

    const playerX = gameState.playerPos.x * CELL_SIZE;
    const playerY = gameState.playerPos.y * CELL_SIZE;

    if (gameState.powerUpActive) {
      ctx.shadowColor = "#3B82F6";
      ctx.shadowBlur = 10;
    }

    ctx.fillStyle = gameState.powerUpActive ? "#60A5FA" : "#3B82F6";
    ctx.fillRect(playerX + 4, playerY + 4, CELL_SIZE - 8, CELL_SIZE - 8);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🚶‍♂️", playerX + CELL_SIZE / 2, playerY + CELL_SIZE / 2 + 6);

    ctx.shadowBlur = 0;

    if (gameState.gameStatus === "paused") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", (GRID_SIZE * CELL_SIZE) / 2, (GRID_SIZE * CELL_SIZE) / 2);
      ctx.font = "14px Arial";
      ctx.fillText("Press SPACE to resume", (GRID_SIZE * CELL_SIZE) / 2, (GRID_SIZE * CELL_SIZE) / 2 + 30);
    }

    ctx.restore();
  }, [gameState]);

  // initialize game on mount
  useEffect(() => {
    initializeGame();

    // expose GameAPI
    (window as any).GameAPI = {
      endGame: (reason: string) => {
        setGameState((prev) => (prev ? { ...prev, gameStatus: reason === "won" ? "won" : "lost" } : prev));
        if (reason === "won") {
          setShowFinalScore(true);
        } else {
          setShowGameOver(true);
        }
      },
      saveScore: ({ name }: { name: string }) => {
        if (finalScoreData) {
          console.log("[v0] Saving score for:", name, finalScoreData);
        }
      },
      loadLeaderboard: () => {
        try {
          const stored = localStorage.getItem("disaster-maze-leaderboard");
          return stored ? JSON.parse(stored) : [];
        } catch {
          return [];
        }
      },
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Generating maze...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div ref={ariaLivePoliteRef} className="sr-only" aria-live="polite" />
      <div ref={ariaLiveAssertiveRef} className="sr-only" aria-live="assertive" />

      {toastMessage && (
        <ToastNotification message={toastMessage} onDismiss={() => setToastMessage(null)} type="warning" />
      )}

      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Home className="h-5 w-5" />
              <span className="font-semibold hidden sm:inline">Back to Home</span>
              <span className="font-semibold sm:hidden">Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInstructions(true)}>
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Help</span>
              </Button>
              <Button
                variant={debugMode ? "default" : "outline"}
                size="sm"
                onClick={toggleDebugMode}
                title="Toggle Debug Mode (Ctrl+D)"
              >
                <Bug className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Debug</span>
              </Button>
              <Button variant="outline" size="sm" onClick={togglePause} disabled={gameState.inputDisabled}>
                {gameState?.gameStatus === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span className="hidden sm:ml-2 sm:inline">
                  {gameState?.gameStatus === "paused" ? "Resume" : "Pause"}
                </span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={initializeGame}>
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">New Game</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="grid grid-cols-1 gap-4">
              <Card className="game-stats--rect">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Game Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="text-sm">Score</span>
                        </div>
                        <Badge variant="secondary">{gameState.score}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-accent" />
                          <span className="text-sm">Time</span>
                        </div>
                        <Badge variant="outline">{formatTime(gameState.time)}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Items</span>
                        <Badge>
                          {gameState.collectedItems}/{gameState.collectibles.length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mistakes</span>
                        <Badge variant="destructive">{gameState.mistakes}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-destructive" />
                            <span className="text-xs">Health</span>
                          </div>
                          <span className="text-xs">{gameState.health}%</span>
                        </div>
                        <Progress value={gameState.health} className="h-2" />
                      </div>

                      {gameState.combo > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-chart-4" />
                            <span className="text-xs">Combo</span>
                          </div>
                          <Badge variant="secondary" className="animate-pulse text-xs">
                            {gameState.combo}x
                          </Badge>
                        </div>
                      )}

                      {gameState.powerUpActive && (
                        <div className="p-2 bg-primary/10 rounded border border-primary/20">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3 text-primary animate-pulse" />
                              <span className="text-xs font-medium">Power-Up!</span>
                            </div>
                            <Badge className="animate-pulse text-xs">{gameState.powerUpTimeLeft}s</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Pass through obstacles!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="lg:hidden">
                <MobileGameControls
                  onMove={movePlayer}
                  disabled={gameState.gameStatus !== "playing" || gameState.inputDisabled}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg lg:text-xl">Disaster Escape Maze</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Navigate to the green exit 🚨 while collecting safety items!
                  {debugMode && <span className="ml-2 text-primary font-medium">[DEBUG MODE]</span>}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={GRID_SIZE * CELL_SIZE}
                      height={GRID_SIZE * CELL_SIZE}
                      className="border border-border rounded-lg bg-secondary/20 max-w-full h-auto touch-none"
                      style={{ imageRendering: "pixelated" }}
                    />
                    {debugMode && gameState?.debugInfo && (
                      <DebugOverlay debugInfo={gameState.debugInfo} gridSize={GRID_SIZE} cellSize={CELL_SIZE} />
                    )}
                    {gameState?.gameStatus === "paused" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="text-center text-white">
                          <Pause className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-semibold">Game Paused</p>
                          <p className="text-sm">Press SPACE to resume</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Use arrow keys or WASD to move • SPACE to pause • ESC to pause
                    {debugMode && <span className="ml-2">• Ctrl+D to toggle debug</span>}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showGameOver && (
        <GameOverModal gameState={gameState} onRestart={initializeGame} onHome={() => (window.location.href = "/")} />
      )}

      {showSafetyTip && <SafetyTipModal collectibleType={showSafetyTip} onClose={() => setShowSafetyTip(null)} />}

      {showInstructions && <GameInstructions onClose={() => setShowInstructions(false)} />}

      {showFinalScore && finalScoreData && (
        <FinalScoreModal
          scoreData={finalScoreData}
          onRestart={initializeGame}
          onHome={() => (window.location.href = "/")}
          onClose={() => setShowFinalScore(false)}
        />
      )}
    </div>
  );
}
