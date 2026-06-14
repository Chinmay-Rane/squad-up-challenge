// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Rolldown's WASM binary uses Rust's Rayon thread pool for parallel module
// transforms. When the host machine has many CPUs, Rayon spawns more pthreads
// than the fixed-size SharedArrayBuffer queue in @emnapi/core can handle,
// causing "RangeError: Invalid atomic access index". Setting RAYON_NUM_THREADS=1
// forces single-threaded mode. Set at module-load time so it applies regardless
// of how the platform invokes the build (npm script vs direct vite call).
process.env.RAYON_NUM_THREADS = "1";
process.env.ROLLDOWN_NUM_THREADS = "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
