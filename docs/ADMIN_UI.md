# Admin UI integration

The RustPress admin dashboard lives in a separate repository,
[`rustpress-net/rustpress-core-admin-ui`](https://github.com/rustpress-net/rustpress-core-admin-ui)
(React + TypeScript + Vite). This document describes how it integrates
with the core server at build and runtime.

## Distribution model

For v1.0 RustPress ships the admin UI as **a pre-built directory of static
files served from disk** by the core binary. This is a deliberate choice:

- **Two artifacts in one release bundle.** Every official release tarball
  contains the `rustpress` binary plus an `admin-ui/` directory of built
  static files. Users get the dashboard out of the box.
- **No build-time dependency on Node.** Anyone consuming a release (or the
  `cargo install` path once we publish to crates.io) does not need
  `node`/`npm` installed.
- **Replaceable at deployment time.** Sites that want a customised admin UI
  can replace the directory or point at a different one via env var
  without rebuilding the binary.

Binary-embedding (e.g. `rust-embed` / `include_dir!`) was considered but
deferred to a future minor release. The disk model is operationally
simpler for the first cut: hot-replace the UI without redeploying, debug
without the build cycle, and let air-gapped enterprise installs ship
their own audited admin bundle.

## Build flow (CI)

`.github/workflows/release.yml` runs the following steps for every
release:

1. Read `ADMIN_UI_VERSION` (a file at the root of `rustpress-core-base`)
   to determine which admin-ui git ref to consume. The release input
   `admin_ui_ref` can override this for ad-hoc builds.
2. Clone `rustpress-net/rustpress-core-admin-ui` at that ref into
   `./admin-ui/`.
3. Run `npm ci && npm run build` to produce `admin-ui/dist/`.
4. Compile the Rust binary on each target platform.
5. Assemble `release/` containing the binary + `admin-ui/` (the built
   dist, not the source).
6. Package into the per-platform archive.

## Runtime resolution

`crates/rustpress-server/src/routes.rs::admin_routes()` mounts the admin
UI at `/admin`. The directory served is, in order of precedence:

1. `$ADMIN_UI_PATH` if the env var is set.
2. `./admin-ui/dist` relative to the working directory (the layout in
   release archives).

The route uses a SPA fallback handler: any request that doesn't match a
file falls back to `index.html` so the React Router can take over.

## Local development

When developing the admin UI side-by-side with the server:

```bash
# Terminal A — server
cargo run --bin rustpress

# Terminal B — admin UI dev server (proxies /api to localhost:3080)
cd ../rustpress-core-admin-ui
npm install
npm run dev
```

Visit `http://localhost:5173/admin/` for the Vite dev server with HMR.
The Vite proxy honors `VITE_API_URL`; the server's `/admin` mount is
only used in production builds.

## Version pinning

`ADMIN_UI_VERSION` is the source of truth for which admin-ui tag the
release pipeline consumes. Currently:

```
v1.0.0-alpha.1
```

Bump this file in lockstep with the admin-ui tag whenever the API
contract between server and UI changes. A mismatched admin UI against an
older server will degrade gracefully (404s on unimplemented endpoints)
but won't be supported.

## Docker

The Dockerfile builds the admin UI in a Node stage, then `COPY --from=node`
into the runtime image alongside the Rust binary. The same disk
resolution rules apply inside the container; `/app/admin-ui/dist` is the
in-container path.

## Future direction

For a post-1.0 release we plan to add binary embedding behind a feature
flag (likely `--features bundled-admin`) so single-binary distribution
becomes a first-class option for users who don't want to manage a static
asset directory. The disk mode remains the default and supported path.
