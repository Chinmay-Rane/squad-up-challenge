import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEVELS, LEVEL_META, QUESTIONS_PER_LEVEL, TOTAL_QUESTIONS, shuffle, type Level } from "@/lib/quiz-helpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Check, X, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/play")({
  head: () => ({ meta: [{ title: "Playing — Sound Queue" }] }),
  component: Play,
});

type Audio = {
  id: string;
  level: Level;
  answer: string;
  hint: string | null;
  storage_path: string;
};

type Question = Audio & { url: string };

function Play() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState<string>("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load name
  useEffect(() => {
    const n = sessionStorage.getItem("playerName");
    if (!n) {
      navigate({ to: "/" });
      return;
    }
    setPlayerName(n);
  }, [navigate]);

  // Build question set: 2 random per level, then sign URLs
  useEffect(() => {
    if (!playerName) return;
    (async () => {
      const { data, error } = await supabase.from("audios").select("*");
      if (error) {
        setLoadError(error.message);
        return;
      }
      const byLevel: Record<Level, Audio[]> = {
        easy: [], medium: [], hard: [], very_hard: [], impossible: [],
      };
      for (const a of data ?? []) byLevel[a.level as Level].push(a as Audio);

      const missing = LEVELS.filter((l) => byLevel[l].length < QUESTIONS_PER_LEVEL);
      if (missing.length) {
        setLoadError(
          `Not enough audios. Need at least ${QUESTIONS_PER_LEVEL} per level. Missing: ${missing.map((m) => LEVEL_META[m].label).join(", ")}`,
        );
        return;
      }

      // Pick 2 per level, in level order (easy → impossible), 2 of each in a row
      const picked: Audio[] = [];
      for (const l of LEVELS) {
        picked.push(...shuffle(byLevel[l]).slice(0, QUESTIONS_PER_LEVEL));
      }

      const paths = picked.map((p) => p.storage_path);
      const { data: signed, error: signErr } = await supabase.storage
        .from("quiz-audio")
        .createSignedUrls(paths, 60 * 60);
      if (signErr) {
        setLoadError(signErr.message);
        return;
      }
      const urlMap = new Map(signed!.map((s) => [s.path!, s.signedUrl]));
      setQuestions(picked.map((p) => ({ ...p, url: urlMap.get(p.storage_path) ?? "" })));
    })();
  }, [playerName]);

  const current = questions?.[idx];

  // Auto-play on each new question
  useEffect(() => {
    if (!current || !audioRef.current) return;
    audioRef.current.src = current.url;
    audioRef.current.load();
    audioRef.current.play().catch(() => {});
    setRevealed(false);
    setShowHint(false);
  }, [current]);

  const replay = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  const mark = async (correct: boolean) => {
    const newScore = score + (correct ? 1 : 0);
    setScore(newScore);
    if (idx + 1 >= TOTAL_QUESTIONS) {
      setSubmitting(true);
      const { error } = await supabase.from("quiz_scores").insert({
        player_name: playerName,
        score: newScore,
      });
      if (error) toast.error("Couldn't save score: " + error.message);
      navigate({ to: "/leaderboard", search: { tab: "quiz" } });
      return;
    }
    setIdx(idx + 1);
  };

  const progress = useMemo(() => ((idx + (revealed ? 1 : 0)) / TOTAL_QUESTIONS) * 100, [idx, revealed]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-lg font-semibold">Can't start the game</h2>
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/">Back home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const meta = LEVEL_META[current.level];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <audio ref={audioRef} preload="auto" />
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium">{playerName}</span>
          <span className="text-muted-foreground">Score: {score}</span>
        </div>

        <Progress value={progress} />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Question {idx + 1} / {TOTAL_QUESTIONS}</span>
          <Badge className={meta.color}>{meta.label}</Badge>
        </div>

        <Card>
          <CardHeader />
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={replay} variant="outline" className="flex-1" size="lg">
                <RotateCcw className="size-4" /> Replay
              </Button>
              <Button onClick={replay} className="flex-1" size="lg">
                <Play className="size-4" /> Play
              </Button>
            </div>

            {current.hint && !revealed && (
              showHint ? (
                <p className="text-sm bg-muted p-3 rounded-md">💡 {current.hint}</p>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowHint(true)} className="w-full">
                  <Lightbulb className="size-4" /> Show hint
                </Button>
              )
            )}

            {!revealed ? (
              <Button onClick={() => setRevealed(true)} size="lg" className="w-full" variant="secondary">
                Done — show answer
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-primary/10 border border-primary/20 rounded-md p-4 text-center">
                  <div className="text-xs uppercase text-muted-foreground mb-1">Answer</div>
                  <div className="text-xl font-semibold">{current.answer}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => mark(false)} variant="outline" size="lg" disabled={submitting}>
                    <X className="size-4" /> Wrong
                  </Button>
                  <Button onClick={() => mark(true)} size="lg" disabled={submitting}>
                    <Check className="size-4" /> Correct
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
