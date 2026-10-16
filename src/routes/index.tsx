import { createFileRoute } from "@tanstack/react-router";
import { Board } from "@/components/minmove/board.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Board />;
}
