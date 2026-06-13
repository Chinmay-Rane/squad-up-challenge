import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LEVELS, LEVEL_META, formatLap, parseLap, type Level } from "@/lib/quiz-helpers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Home, Trash2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Sound Queue" }] }),
  component: Admin,
});

type Audio = { id: string; level: Level; answer: string; hint: string | null; storage_path: string; created_at: string };
type Racing = { id: string; player_name: string; lap_time_ms: number; created_at: string };
type Aim = { id: string; player_name: string; score: number; created_at: string };

function Admin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Portal</h1>
          <Button asChild variant="outline" size="sm">
            <Link to="/"><Home className="size-4" /> Home</Link>
          </Button>
        </div>

        <Tabs defaultValue="audios">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="audios">Audios</TabsTrigger>
            <TabsTrigger value="racing">Racing Times</TabsTrigger>
            <TabsTrigger value="aimlabs">Aimlabs</TabsTrigger>
          </TabsList>
          <TabsContent value="audios"><AudiosPanel /></TabsContent>
          <TabsContent value="racing"><RacingPanel /></TabsContent>
          <TabsContent value="aimlabs"><AimPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AudiosPanel() {
  const [audios, setAudios] = useState<Audio[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("easy");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    const { data, error } = await supabase.from("audios").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setAudios((data ?? []) as Audio[]);
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const upload = async () => {
    if (!file || !answer.trim()) {
      toast.error("File and answer are required");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "mp3";
      const path = `${level}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("quiz-audio").upload(path, file, {
        contentType: file.type || "audio/mpeg",
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("audios").insert({
        level, answer: answer.trim(), hint: hint.trim() || null, storage_path: path,
      });
      if (insErr) throw insErr;
      toast.success("Audio added");
      setFile(null); setAnswer(""); setHint("");
      const fileInput = document.getElementById("audio-file") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const del = async (a: Audio) => {
    if (!confirm(`Delete "${a.answer}"?`)) return;
    await supabase.storage.from("quiz-audio").remove([a.storage_path]);
    const { error } = await supabase.from("audios").delete().eq("id", a.id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refresh(); }
  };

  const counts = LEVELS.map((l) => ({ l, n: audios.filter((a) => a.level === l).length }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Add audio</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio file</label>
              <Input id="audio-file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{LEVEL_META[l].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Answer</label>
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The sound is…" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hint (optional)</label>
            <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="A small clue" />
          </div>
          <Button onClick={upload} disabled={uploading || !file || !answer.trim()} className="w-full">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Upload
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {counts.map(({ l, n }) => (
          <Badge key={l} className={LEVEL_META[l].color}>{LEVEL_META[l].label}: {n}</Badge>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Hint</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {audios.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No audios yet</TableCell></TableRow>
                ) : audios.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><Badge className={LEVEL_META[a.level].color}>{LEVEL_META[a.level].label}</Badge></TableCell>
                    <TableCell className="font-medium">{a.answer}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.hint ?? "—"}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => del(a)}><Trash2 className="size-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RacingPanel() {
  const [rows, setRows] = useState<Racing[]>([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.from("racing_times").select("*").order("lap_time_ms", { ascending: true });
    setRows((data ?? []) as Racing[]);
  };
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    const ms = parseLap(time);
    if (!name.trim() || ms === null) {
      toast.error("Enter a name and a valid time like 1:23.456");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("racing_times").insert({ player_name: name.trim(), lap_time_ms: ms });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Time added");
    setName(""); setTime("");
    refresh();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this time?")) return;
    const { error } = await supabase.from("racing_times").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Add lap time</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Driver name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="1:23.456" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <Button onClick={add} disabled={busy} className="w-full">Add</Button>
        </CardContent>
      </Card>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Driver</TableHead><TableHead className="text-right">Time</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No times yet</TableCell></TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{i + 1}</TableCell>
                <TableCell>{r.player_name}</TableCell>
                <TableCell className="text-right font-mono">{formatLap(r.lap_time_ms)}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="size-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}

function AimPanel() {
  const [rows, setRows] = useState<Aim[]>([]);
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const { data } = await supabase.from("aimlabs_scores").select("*").order("score", { ascending: false });
    setRows((data ?? []) as Aim[]);
  };
  useEffect(() => { refresh(); }, []);

  const add = async () => {
    const n = parseInt(score, 10);
    if (!name.trim() || isNaN(n) || n < 0) {
      toast.error("Enter a name and a non-negative score");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("aimlabs_scores").insert({ player_name: name.trim(), score: n });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Score added");
    setName(""); setScore("");
    refresh();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this score?")) return;
    const { error } = await supabase.from("aimlabs_scores").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Add Aimlabs score</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input placeholder="Player name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input type="number" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} />
          </div>
          <Button onClick={add} disabled={busy} className="w-full">Add</Button>
        </CardContent>
      </Card>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Player</TableHead><TableHead className="text-right">Score</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No scores yet</TableCell></TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono">{i + 1}</TableCell>
                <TableCell>{r.player_name}</TableCell>
                <TableCell className="text-right font-mono">{r.score.toLocaleString()}</TableCell>
                <TableCell><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="size-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
