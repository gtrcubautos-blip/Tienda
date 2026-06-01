---
name: GitHub push procedure
description: How to push this repo to GitHub from the agent env, and the constraints that force a force-push.
---

# Pushing to GitHub (repo `gtrcubautos-blip/Tienda`, branch `main`)

The user wants important changes pushed to GitHub automatically when work finishes.

## Constraints (why the obvious path fails)
- The agent shell has **no GitHub OAuth** — Replit's Git UI holds it, the shell does not.
- `git fetch`/`merge` write to `.git/objects`, which is **blocked at the filesystem level** in this env. So you cannot integrate remote commits; a clean (non-force) push that needs the remote's commits is impossible.
- `git push` itself is NOT blocked and reaches GitHub fine — it just needs auth.

## Procedure that works
1. Ensure a `GITHUB_TOKEN` secret exists (classic PAT with **`repo`** scope — without write scope GitHub returns `403 Permission denied`). Request via `requestEnvVar` if missing.
2. Working tree is auto-committed by Replit checkpoints, so HEAD is usually current — verify with `git --no-optional-locks status -sb`.
3. Force-push using a credential helper that reads the token from env (never put the token in the URL or print it):

```bash
GIT_TERMINAL_PROMPT=0 GIT_ASKPASS= git \
  -c credential.helper= \
  -c 'credential.helper=!f() { echo username=x-access-token; echo "password=$GITHUB_TOKEN"; }; f' \
  push --force https://github.com/gtrcubautos-blip/Tienda.git main:main 2>&1 \
  | sed -E 's/(ghp|github_pat)_[A-Za-z0-9_]+/\1_***REDACTED***/g'
```

**Why force:** local `main` diverged (ahead many / behind 1) and the behind-commit can't be merged due to the `.git/objects` block. User has approved overwriting the minor remote commit.

## Security
- Never print the token; the helper references `$GITHUB_TOKEN` (single-quoted so the outer shell doesn't expand it). The `sed` redaction is defense-in-depth.
