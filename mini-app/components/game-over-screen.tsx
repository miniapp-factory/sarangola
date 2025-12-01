"use client";

import { Button } from "@/components/ui/button";

export default function GameOverScreen({
  finalScore,
  highScore,
  averageScore,
  onRestart,
}: {
  finalScore: number;
  highScore: number;
  averageScore: number;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Game Over</h1>
      <p className="text-2xl mb-2">Final Score: {finalScore}</p>
      <p className="text-xl mb-2">High Score: {highScore}</p>
      <p className="text-lg mb-6">Average Score: {averageScore.toFixed(2)}</p>
      <Button onClick={onRestart}>Play Again</Button>
    </div>
  );
}
