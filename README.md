# omp-agent-persona — Dev persona for Oh My Pi (omp)

Developer persona: SDD workflow (superpowers) + eng-gates quality gates,
without corporate context. For home use with any model providers you have.

This repo: https://github.com/spgsroot/omp-agent-persona

## What this is

- `persona-dev.yml` — config overlay (`omp --config persona-dev.yml`):
  trims the LLMOps skills from the catalog, keeps the SDD cycle.
- `persona-dev-prompt.md` — system-prompt appendix
  (`--append-system-prompt persona-dev-prompt.md`): explicit permissions
  for `gate.py approve` and `install-tools.sh --python --ub`.
- `AGENTS.md` — anonymized context file: workflow rules (scout swarm for
  big tasks, SDD path, eng-gates after each unit, ask-don't-guess,
  search-before-code). No corporate sections.
- `skills/eng-gates/` — deterministic quality gates (format, lint, types,
  tests, module boundaries, CRAP, duplication, mutation, benchmarks).
- `agents/` — reference copies of omp's bundled agents (scout, reviewer,
  security-reviewer, sonic, task) for customization.
- `scripts/omp-dev.sh` — launcher: `omp --config … --append-system-prompt …`.
- `docs/` — token-cost analysis (see below).

Layering note: omp loads a **user-global** context from `~/.omp/agent/AGENTS.md`
in every session, plus the **project-local** `AGENTS.md` from the cwd. This
repo's `AGENTS.md` is the project-local layer. On a clean home machine there
is no user-global file — either work inside this repo's checkout (or a
parent dir of your projects with this AGENTS.md), or copy it to
`~/.omp/agent/AGENTS.md` to make the workflow rules global.

## Install (any machine)

```bash
# 1. omp must be installed (https://github.com/can1357/oh-my-pi)
omp --version

# 2. superpowers plugin: the SDD agents and skills
omp plugin install @loneexile/omp-superpowers

# 3. this persona — copy or clone anywhere, then:
./scripts/omp-dev.sh            # or add to your shell as a function:
# omp-dev() { command /path/to/this/repo/scripts/omp-dev.sh "$@"; }

# 4. eng-gates tools (once, at first coding unit):
bash skills/eng-gates/scripts/install-tools.sh --python --ub
```

5. SDD infrastructure flags (in `~/.omp/agent/config.yml`): `task.enableLsp:
   true`, `astGrep.enabled: true` (activate lsp/ast_grep in sdd-*
   subagents), `task.enableEffort: true` (per-dispatch `effort: "hi"` for
   high-risk reviews), `task.showResolvedModelBadge: true` (see which model
   a seat actually ran). See AGENTS.md → "Tool matrix by stage".

Requirements: Python ≥3.11 for gate.py (tomllib); uv recommended.

## Verify it loaded

```bash
./scripts/omp-dev.sh -p --no-session 'List the agent type names your `task` tool offers, comma-separated'
# expect: sdd-*, reviewer, scout, security-reviewer, sonic, task, …
```

## Token-cost analysis (home, non-unlimited models)

Measured 2026-10-30 on the original setup; numbers are byte/4 estimates.
See `docs/token-costs.md` for details and levers.

| Consumer | ~tokens | When | Lever |
|---|---|---|---|
| AGENTS.md context | 4.6k → **1.9k** here | every session | this copy is already trimmed |
| Superpowers bootstrap | 0.8k | every session | off in LLMOps persona; keep for dev |
| Skill descriptions (19 dev skills) | ~1.3k | every session | inherent; skills load on demand only |
| sdd-* agent prompts | 0.6–1.6k each | per dispatch | fixed per seat; don't inflate briefs |
| Dispatch brief + subagent context | the real cost driver | per task | keep briefs one-task-sized; batch small same-shape edits |

The big lever is not the static prompt — it's **turn count × context**.
Cheap models take 2–3× turns on multi-step work and cost more overall
(measured upstream on a real re-review: 100s/4-turns flash vs 50s/1-turn
sonnet). Keep mid-tier models for reviewer seats and prose-implementers;
use cheap tiers only for transcription-like tasks.

## License

MIT for this repo's own files. eng-gates scripts are included as-is from
the local skill distribution. Superpowers plugin is upstream
(@loneexile/omp-superpowers, MIT) — not vendored here; installed via omp.