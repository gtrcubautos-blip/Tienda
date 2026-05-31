---
name: Publish detection vs .gitignore
description: Why "could not find run command" happens at publish time in this artifact monorepo, and the build-time PORT pitfall in vite.config.
---

# "Could not find run command" at publish (artifact monorepo)

Publish DETECTION runs before any build and applies `.gitignore` to the committed
git tree. If `.gitignore` matches `.replit-artifact/`, `artifact.toml`, or
`artifacts/`, the per-artifact `artifact.toml` (which holds the production run/build
config) is invisible to detection → the repl is treated as legacy → "could not find
run command". This happens even if the toml files are already git-tracked.

**Why:** the deployment config for each artifact lives in
`artifacts/<name>/.replit-artifact/artifact.toml`. `.replit`'s `deployment.run` is
ignored in artifact mode. A hardened `.gitignore` that adds `.replit-artifact/`
silently breaks publishing.

**How to apply:** never gitignore `.replit-artifact/` (or `artifact.toml`/`artifacts/`).
Verify with `git check-ignore -v --no-index artifacts/*/.replit-artifact/artifact.toml`
— it must report NO matches. Note: a failed publish-DETECTION produces no "failed"
build in `listDeploymentBuilds` (only successful past builds show), so an all-success
build history alongside a publish error points at detection, not the build.

# Vite build must not hard-require PORT

`vite build` (static production build) does NOT get the runtime `[services.env]`
PORT/BASE_PATH from artifact.toml. A `vite.config.ts` that throws on missing
`process.env.PORT` at module top level fails the production build. Require PORT only
when `command === "serve"` (use the `defineConfig(({command}) => ...)` function form);
default BASE_PATH to "/". Dev/preview still get PORT from the workflow.
