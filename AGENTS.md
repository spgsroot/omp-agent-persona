# User context

## Unclear — ask, don't guess

- If something is unclear (requirement, format, expected behavior, choice
  of options, priority) — do NOT reason it through silently and pick:
  ask the user (`ask`) and wait for the answer.
- Ask BEFORE irreversible/expensive actions (push, MR, editing shared
  files, deploy), not after.
- A guess is acceptable only when the user is not reachable — then label
  it explicitly as an assumption.

## Workflow: search before code

- Before a hard task (new stack/framework, unfamiliar API, dependency
  versions, an error with no obvious cause) — web search first, then act.
  Don't guess from memory: versions, flags and limits change.
- When stuck (2+ failed attempts, contradictory symptoms) — STOP and
  search: the full error message, the flag/API name, upstream
  issues/PR/CHANGELOG, official docs.
- Prefer primary sources: official docs, GitHub issues/PR/CHANGELOG,
  papers; confirm key facts with a second source. Cite the source.
- A known URL — read it directly (`read`), don't search.

## Agent workflow: scouts, subagent-driven development, gates

### Big task → parallel scout swarm

- Big task signals: 3+ independent search directions, an unfamiliar
  repo/stack, or 5+ files touched. Before planning — parallel exploration
  with `scout` agents (one `task` call, one scout per direction), not
  sequential file reading by yourself. Compress scout results into
  contracts for the plan.
- One read-only scout alongside ongoing work is fine; don't fan out
  scouts for volume's sake.

### Subagent-driven development — the default path for projects

- Plugin `@loneexile/omp-superpowers`: skills `brainstorming →
  writing-plans → subagent-driven-development → finishing-a-development-branch`
  and the five SDD agents (`sdd-implementer`, `sdd-reviewer`,
  `sdd-rereviewer`, `sdd-escalation-implementer`, `sdd-final-reviewer`)
  in the `task` roster. Map seat models to YOUR providers via
  `task.agentModelOverrides` in config.yml — the shipped Anthropic pins
  apply only where you have those credentials.
- Project (3+ coupled tasks, new behavior with design choices) — the
  superpowers path: `skill://brainstorming` → `skill://writing-plans` →
  `skill://subagent-driven-development`. ALWAYS dispatch SDD seats by
  their `sdd-*` agent types, never the bundled `task`/`reviewer`.
- Small change (one clear action; no new interface, no migration, no
  security surface) — no SDD: fix, test, one commit.

### After a solved task — quality review with eng-gates

- After each solved task in a code repo (before "done", before review,
  before push): `skill://eng-gates` → `gate fast` per work unit, `gate
  full` before "done". Skill lives in `skills/eng-gates/` of this
  persona repo (copy into `~/.omp/agent/skills/eng-gates` to install).
- Run gate.py with Python ≥3.11 (tomllib): `uv` python recommended;
  a system 3.9 will fail with `No module named 'tomllib'`.
- Uninitialized repo: `python3 <skill>/scripts/gate.py -C <repo>`;
  `init` in a repo — only with the user's consent (it writes files into
  the repo). Report: the final summary line of `gate full` + every WARN
  `guard.suppress` entry. Never lower thresholds to go green; scope, not
  the gate, is what you adjust.
- In a repo without code (pure yaml/config) eng-gates does not apply —
  then the review is done by `reviewer`/`security-reviewer`.

## Token discipline (paid / metered models)

- Turn count beats token price: cheap models often take 2–3× turns on
  multi-step work and cost MORE overall. Keep a mid-tier model as the
  floor for reviewers and prose-implementers; cheap tiers only for
  transcription-like tasks (the plan text contains the full code).
- Dispatch briefs: one task, its interfaces, global constraints — nothing
  else. Never paste session history into briefs.
- Read long subagent results from the report file / `agent://<id>`, not by
  echoing them back into the controller context.
- Batch small same-shape edits into ONE dispatch; review the batch as one
  diff.
- Prefer fresh subagents per task over context accumulation in the main
  session; that is what keeps the controller small.