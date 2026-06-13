import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatLap, formatGap } from "@/lib/quiz-helpers";
import { Home, Loader2, Trophy } from "lucide-react";

const searchSchema = z.object({ tab: z.enum(["quiz", "racing", "aimlabs"]).optional() });

export const Route = createFileRoute("/leaderboard")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Leaderboard — Sound Queue Event" }] }),
  component: Leaderboard,
});

type QuizRow = { id: string; player_name: string; score: number; created_at: string };
type RacingRow = { id: string; player_name: string; lap_time_ms: number; created_at: string };
type AimRow = { id: string; player_name: string; score: number; created_at: string };

function Leaderboard() {
  const { tab } = Route.useSearch();
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="size-6 text-yellow-500" /> Leaderboard
          </h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/"><Home className="size-4" /> Home</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <Tabs defaultValue={tab ?? "quiz"}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quiz">Sound Quiz</TabsTrigger>
              <TabsTrigger value="racing">Racing Sim</TabsTrigger>
              <TabsTrigger value="aimlabs">Aimlabs</TabsTrigger>
            </TabsList>

            <TabsContent value="quiz">
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quiz.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No scores yet</TableCell></TableRow>
                    ) : quiz.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{i + 1}</TableCell>
                        <TableCell>{r.player_name}</TableCell>
                        <TableCell className="text-right font-semibold">{r.score} / 10</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="racing">
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Lap time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {racing.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No times yet</TableCell></TableRow>
                    ) : racing.map((r, i) => {
                      const leader = racing[0].lap_time_ms;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-mono">{i + 1}</TableCell>
                          <TableCell>{r.player_name}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            {i === 0 ? formatLap(r.lap_time_ms) : (
                              <span className="text-muted-foreground">{formatGap(r.lap_time_ms - leader)}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="aimlabs">
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aim.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No scores yet</TableCell></TableRow>
                    ) : aim.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{i + 1}</TableCell>
                        <TableCell>{r.player_name}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">{r.score.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
