import { generateMetadata } from "@/lib/farcaster-embed";
import Game from "@/components/game";
import LandingPage from "@/components/landing-page";
import { useState } from "react";

export { generateMetadata };

export default function Home() {
  const [started, setStarted] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handlePlay = () => {
    setStarted(true);
  };

  const handleNewGame = () => {
    setResetKey((k) => k + 1);
    setStarted(true);
  };

  const handleGameOver = () => {
    setStarted(false);
  };

  return (
    <>
      {!started ? (
        <LandingPage onPlay={handlePlay} onNewGame={handleNewGame} />
      ) : (
        <Game key={resetKey} onGameOver={handleGameOver} />
      )}
    </>
  );
}
