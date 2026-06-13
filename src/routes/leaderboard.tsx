import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLap, formatGap } from "@/lib/quiz-helpers";
import { Home, Loader2, Headphones, Car, Target, Trophy } from "lucide-react";
import logoUrl from "@/assets/squadup_logo.png";

const searchSchema = z.object({ tab: z.enum(["quiz", "racing", "aimlabs"]).optional() });

export const Route = createFileRoute("/leaderboard")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Leaderboard — Squad-Up e-Sports" }] }),
  component: Leaderboard,
});

type QuizRow = { id: string; player_name: string; score: number; created_at: string };
type RacingRow = { id: string; player_name: string; lap_time_ms: number; created_at: string };
type AimRow = { id: string; player_name: string; score: number; created_at: string };

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇</span>;
  if (rank === 2) return <span>🥈</span>;
  if (rank === 3) return <span>🥉</span>;
  return <span className="text-muted-foreground">{rank}</span>;
}

function QuizLeaderboard({ rows }: { rows: QuizRow[] }) {
  return (
    <Card className="flex flex-col border-[#d01741]/30 bg-[#0a0a0a]">
      <CardHeader className="pb-3 border-b border-[#d01741]/20">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Headphones className="size-5 text-[#d01741]" />
          Sound Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#d01741]/10 hover:bg-transparent">
              <TableHead className="w-10 text-[#d01741]/70 text-xs uppercase tracking-wider">#</TableHead>
              <TableHead className="text-[#d01741]/70 text-xs uppercase tracking-wider">Player</TableHead>
              <TableHead className="text-right text-[#d01741]/70 text-xs uppercase tracking-wider">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  No scores yet
                </TableCell>
              </TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={r.id} className="border-b border-white/5 hover:bg-[#d01741]/5 transition-colors">
                <TableCell className="font-bold font-mono text-base w-10">
                  <RankBadge rank={i + 1} />
                </TableCell>
                <TableCell className="font-medium text-white">{r.player_name}</TableCell>
                <TableCell className="text-right font-semibold text-[#d01741]">
                  {r.score}<span className="text-muted-foreground font-normal text-xs"> /10</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RacingLeaderboard({ rows }: { rows: RacingRow[] }) {
  return (
    <Card className="flex flex-col border-[#d01741]/30 bg-[#0a0a0a]">
      <CardHeader className="pb-3 border-b border-[#d01741]/20">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Car className="size-5 text-[#d01741]" />
          Racing Sim — Best Lap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#d01741]/10 hover:bg-transparent">
              <TableHead className="w-10 text-[#d01741]/70 text-xs uppercase tracking-wider">#</TableHead>
              <TableHead className="text-[#d01741]/70 text-xs uppercase tracking-wider">Driver</TableHead>
              <TableHead className="text-right text-[#d01741]/70 text-xs uppercase tracking-wider">Lap time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  No times yet
                </TableCell>
              </TableRow>
            ) : rows.map((r, i) => {
              const leader = rows[0].lap_time_ms;
              return (
                <TableRow key={r.id} className="border-b border-white/5 hover:bg-[#d01741]/5 transition-colors">
                  <TableCell className="font-bold font-mono text-base w-10">
                    <RankBadge rank={i + 1} />
                  </TableCell>
                  <TableCell className="font-medium text-white">{r.player_name}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {i === 0 ? (
                      <span className="text-[#d01741]">{formatLap(r.lap_time_ms)}</span>
                    ) : (
                      <span className="text-muted-foreground">{formatGap(r.lap_time_ms - leader)}</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AimLabsLeaderboard({ rows }: { rows: AimRow[] }) {
  return (
    <Card className="flex flex-col border-[#d01741]/30 bg-[#0a0a0a]">
      <CardHeader className="pb-3 border-b border-[#d01741]/20">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Target className="size-5 text-[#d01741]" />
          Aimlabs
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#d01741]/10 hover:bg-transparent">
              <TableHead className="w-10 text-[#d01741]/70 text-xs uppercase tracking-wider">#</TableHead>
              <TableHead className="text-[#d01741]/70 text-xs uppercase tracking-wider">Player</TableHead>
              <TableHead className="text-right text-[#d01741]/70 text-xs uppercase tracking-wider">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                  No scores yet
                </TableCell>
              </TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={r.id} className="border-b border-white/5 hover:bg-[#d01741]/5 transition-colors">
                <TableCell className="font-bold font-mono text-base w-10">
                  <RankBadge rank={i + 1} />
                </TableCell>
                <TableCell className="font-medium text-white">{r.player_name}</TableCell>
                <TableCell className="text-right font-mono font-semibold text-[#d01741]">
                  {r.score.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizRow[]>([]);
  const [racing, setRacing] = useState<RacingRow[]>([]);
  const [aim, setAim] = useState<AimRow[]>([]);

  useEffect(() => {
    (async () => {
      const [q, r, a] = await Promise.all([
        supabase.from("quiz_scores").select("*").order("score", { ascending: false }).order("created_at", { ascending: true }).limit(100),
        supabase.from("racing_times").select("*").order("lap_time_ms", { ascending: true }).limit(100),
        supabase.from("aimlabs_scores").select("*").order("score", { ascending: false }).limit(100),
      ]);
      setQuiz((q.data ?? []) as QuizRow[]);
      setRacing((r.data ?? []) as RacingRow[]);
      setAim((a.data ?? []) as AimRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky header */}
      <header className="border-b border-[#d01741]/30 bg-black/95 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Squad-Up e-Sports" className="h-12 w-auto" />
            <div className="flex items-center gap-2 text-xl font-bold tracking-wide">
              <Trophy className="size-5 text-[#d01741]" />
              <span className="hidden sm:inline">Leaderboards</span>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-[#d01741]/40 text-white hover:bg-[#d01741]/10 hover:border-[#d01741] bg-transparent"
          >
            <Link to="/"><Home className="size-4" /> Home</Link>
          </Button>
        </div>
      </header>

      {/* Red accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#d01741] to-transparent" />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="size-10 animate-spin text-[#d01741]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <QuizLeaderboard rows={quiz} />
            <RacingLeaderboard rows={racing} />
            <AimLabsLeaderboard rows={aim} />
          </div>
        )}
      </main>
    </div>
  );
}
