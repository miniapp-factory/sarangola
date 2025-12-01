"use client";

import { Button } from "@/components/ui/button";

export default function LandingPage({
  onPlay,
  onNewGame,
}: {
  onPlay: () => void;
  onNewGame: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-4xl font-bold">Sarangola Flappy</h1>
      <Button size="lg" onClick={onPlay}>
        Play
      </Button>
      <Button variant="outline" size="lg" onClick={onNewGame}>
        New Game
      </Button>
    </div>
  );
}
