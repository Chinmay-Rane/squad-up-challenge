import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, Trophy, Settings } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sound Queue — Quiz Game" },
      { name: "description", content: "Guess the sound. 10 rounds, 5 levels, one winner." },
    ],
  }),
  component: Home,
});

function Home() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const start = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    sessionStorage.setItem("playerName", trimmed);
    navigate({ to: "/play" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
      <header className="flex justify-end p-4 gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/leaderboard">
            <Trophy className="size-4" /> Leaderboard
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin">
            <Settings className="size-4" /> Admin
          </Link>
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 size-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Headphones className="size-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Sound Queue</CardTitle>
            <CardDescription>
              10 rounds. 5 levels. Guess the sound.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Player name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                onKeyDown={(e) => e.key === "Enter" && start()}
                autoFocus
                maxLength={32}
              />
            </div>
            <Button onClick={start} disabled={!name.trim()} className="w-full" size="lg">
              Start Game
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
