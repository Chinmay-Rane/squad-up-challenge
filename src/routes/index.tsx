import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, Trophy, Settings } from "lucide-react";
import logoUrl from "@/assets/squadup_logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sound Queue — Squad-Up e-Sports" },
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
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Red top stripe */}
      <div className="h-1 bg-[#d01741]" />

      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <img src={logoUrl} alt="Squad-Up e-Sports" className="h-10 w-auto" />
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild className="text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/leaderboard">
              <Trophy className="size-4" /> Leaderboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild className="text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/admin">
              <Settings className="size-4" /> Admin
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-[#d01741]/30 bg-[#0a0a0a]">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 size-16 rounded-full bg-[#d01741]/10 border border-[#d01741]/30 flex items-center justify-center">
              <Headphones className="size-8 text-[#d01741]" />
            </div>
            <CardTitle className="text-2xl text-white">Sound Queue</CardTitle>
            <CardDescription className="text-white/60">
              10 rounds. 5 levels. Guess the sound.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Player name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                onKeyDown={(e) => e.key === "Enter" && start()}
                autoFocus
                maxLength={32}
                className="bg-black border-white/20 text-white placeholder:text-white/30 focus-visible:ring-[#d01741] focus-visible:border-[#d01741]"
              />
            </div>
            <Button
              onClick={start}
              disabled={!name.trim()}
              className="w-full bg-[#d01741] hover:bg-[#b8132f] text-white border-0"
              size="lg"
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
