"use client";

import { useEffect, useRef, useState } from "react";
import GameOverScreen from "@/components/game-over-screen";
import { Button } from "@/components/ui/button";

const GRAVITY = 0.3;
const FLAP_STRENGTH = -10;
const OBSTACLE_GAP = 150;
const OBSTACLE_WIDTH = 60;
const OBSTACLE_INTERVAL = 2000; // ms
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

export default function Game({ onGameOver }: { onGameOver?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [started, setStarted] = useState(false);
  // Dialog state removed; game over handled by gameOver state

  const kite = {
    x: 80,
    y: CANVAS_HEIGHT / 2,
    width: 40,
    height: 40,
    vy: 0,
  };

  const resetGame = () => {
    kite.x = 80;
    kite.y = CANVAS_HEIGHT / 2;
    kite.vy = 0;
    obstacles.length = 0;
    setScore(0);
    setGameOver(false);
    setStarted(false);
  };

  const obstacles: { x: number; height: number }[] = [];

  const spawnObstacle = () => {
    const height = Math.random() * (CANVAS_HEIGHT - OBSTACLE_GAP - 100) + 50;
    obstacles.push({ x: CANVAS_WIDTH, height });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let obstacleTimer = 0;

    const gameLoop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      obstacleTimer += delta;
      if (!started) return;

      // Update kite
      kite.vy += GRAVITY;
      kite.y += kite.vy;

      // Spawn obstacles
      if (obstacleTimer > OBSTACLE_INTERVAL) {
        spawnObstacle();
        obstacleTimer = 0;
      }

      // Update obstacles
      obstacles.forEach((obs) => (obs.x -= 3));
      if (obstacles.length && obstacles[0].x < -OBSTACLE_WIDTH) {
        obstacles.shift();
        setScore((s) => s + 1);
      }

      // Collision detection
      obstacles.forEach((obs) => {
        const topRect = {
          x: obs.x,
          y: 0,
          width: OBSTACLE_WIDTH,
          height: obs.height,
        };
        const bottomRect = {
          x: obs.x,
          y: obs.height + OBSTACLE_GAP,
          width: OBSTACLE_WIDTH,
          height: CANVAS_HEIGHT - (obs.height + OBSTACLE_GAP),
        };
        if (rectIntersect(kite, topRect) || rectIntersect(kite, bottomRect)) {
          setGameOver(true);
          setStarted(false);
          setHighScore((prev) => Math.max(prev, score));
          setTotalScore((prev) => prev + score);
          setGamesPlayed((prev) => prev + 1);
        }
      });

      // Ground collision
      if (kite.y + kite.height > CANVAS_HEIGHT || kite.y < 0) {
        setGameOver(true);
        setStarted(false);
        setHighScore((prev) => Math.max(prev, score));
        setTotalScore((prev) => prev + score);
        setGamesPlayed((prev) => prev + 1);
      }

      // Draw
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      // Background
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw obstacles
      ctx.fillStyle = "#8B4513";
      obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, 0, OBSTACLE_WIDTH, obs.height);
        ctx.fillRect(obs.x, obs.height + OBSTACLE_GAP, OBSTACLE_WIDTH, CANVAS_HEIGHT - (obs.height + OBSTACLE_GAP));
      });

      // Draw kite
      ctx.fillStyle = "#FF4500";
      ctx.fillRect(kite.x, kite.y, kite.width, kite.height);

      // Draw score
      ctx.fillStyle = "#000";
      ctx.font = "20px Arial";
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#FFF";
        ctx.font = "30px Arial";
        ctx.fillText("Game Over", CANVAS_WIDTH / 2 - 80, CANVAS_HEIGHT / 2);
        ctx.font = "20px Arial";
        ctx.fillText(`Final Score: ${score}`, CANVAS_WIDTH / 2 - 70, CANVAS_HEIGHT / 2 + 30);
      }
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        kite.vy = FLAP_STRENGTH;
      }
    };

    const handleCanvasClick = () => {
      if (!started) setStarted(true);
      kite.vy = FLAP_STRENGTH;
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [obstacles, gameOver, score]);

  const rectIntersect = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border-2 border-black" />
      <p className="mt-4 text-xl">Score: {score}</p>
      <p className="mt-2 text-lg">High Score: {highScore}</p>
      <p className="mt-1 text-sm">
        Average Score: {gamesPlayed > 0 ? (totalScore / gamesPlayed).toFixed(2) : "0.00"}
      </p>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over</DialogTitle>
            <DialogDescription>Would you like to play again or quit?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-4">
            <Button onClick={() => { resetGame(); setShowDialog(false); }}>Play Again</Button>
            <Button variant="outline" onClick={() => { onGameOver?.(); setShowDialog(false); }}>Quit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
