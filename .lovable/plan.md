# Sound Queue Quiz Game + Event Leaderboards

Two-portal app for an event. No login — player just types a name on the quiz. Admin portal manages the audio bank and the two manual leaderboards.

## Player portal

### `/` — name entry
Enter player name → Start Game. Links to `/leaderboard`.

### `/play` — quiz
- **10 questions**, one randomized audio per level across 5 levels (Easy → Medium → Hard → Very Hard → Impossible). Each level has its own bank of 30+ clips. The game cycles through all 5 levels twice to reach 10 questions.
- Per question: auto-play once on load, **Replay** button, optional **Show hint** button, **Done** button.
- **Done** reveals the answer + **Correct** / **Wrong** buttons (player self-marks).
- After level 10: final score saved to the Quiz leaderboard, navigates to `/leaderboard`.

### `/leaderboard` — 3 sections (tabs)
1. **Quiz** — auto-populated from gameplay. Columns: rank, player name, score (X/10), date. Sorted by score desc.
2. **Racing Simulator – Top Lap** — manually entered by admin. F1-style display:
   - Leader row shows full time (e.g. `1:23.456`).
   - Every other row shows gap to leader (e.g. `+0.024`, `+0.187`), sorted ascending by time.
3. **Aimlabs Score** — manually entered by admin. Columns: rank, name, score. Sorted by score desc.

## Admin portal

`/admin` — no auth (event-only, as requested). Tabs:

1. **Audios** — upload form (file, level dropdown, answer text, optional hint) + table grouped by level showing counts ("Easy: 28/30") with delete per row.
2. **Racing Times** — form (name, lap time as `M:SS.mmm` or ms) + table with delete.
3. **Aimlabs Scores** — form (name, score number) + table with delete.

## Technical details

**Backend:** Lovable Cloud — Storage for audio + Postgres for everything else.

**Schema**
- `audios` — `id, level (enum easy|medium|hard|very_hard|impossible), answer, hint, storage_path, created_at`
- `quiz_scores` — `id, player_name, score (0-10), created_at`
- `racing_times` — `id, player_name, lap_time_ms (int), created_at`
- `aimlabs_scores` — `id, player_name, score (int), created_at`
- Storage bucket `quiz-audio` (public, so player streams via public URL).
- RLS: public read + public insert/delete on all four tables (intentional given no-auth requirement — flagged as a trade-off; the admin page is just "obscure URL" protection).

**Routes (TanStack file-based)**
- `src/routes/index.tsx`, `src/routes/play.tsx`, `src/routes/leaderboard.tsx`, `src/routes/admin.tsx`

**Server functions (`src/lib/quiz.functions.ts`)**
- `getRandomQuizSet()` — 2 random audios per level (10 total) with public URLs, shuffled
- `submitQuizScore({ name, score })`
- `getLeaderboards()` — returns `{ quiz, racing, aimlabs }`
- `listAudios()`, `uploadAudio()`, `deleteAudio()`
- `addRacingTime()`, `deleteRacingTime()`
- `addAimlabsScore()`, `deleteAimlabsScore()`

**UI**
- shadcn Card / Button / Input / Select / Table / Tabs / Progress / Badge.
- Native `<audio>` with custom controls.
- Level shown as colored badge escalating Easy→Impossible.
- Racing leaderboard formats `lap_time_ms` → `M:SS.mmm` for leader, `+S.mmm` for the rest.
- Progress indicator shows "Question 3 / 10" with level badge.

**Out of scope (ask if needed):** admin password, audio waveform, per-question timer, editing existing leaderboard rows (only add/delete).