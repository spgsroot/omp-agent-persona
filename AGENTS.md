# User context

## Unclear - ask, don't guess

- If something is unclear (requirement, format, expected behavior, choice
  of options, priority) - do NOT reason it through silently and pick:
  ask the user (`ask`) and wait for the answer.
- Ask BEFORE irreversible/expensive actions (push, MR, editing shared
  files, deploy), not after.
- A guess is acceptable only when the user is not reachable - then label
  it explicitly as an assumption.

## Workflow: search before code

- Before a hard task (new stack/framework, unfamiliar API, dependency
  versions, an error with no obvious cause) - web search first, then act.
  Don't guess from memory: versions, flags and limits change.
- When stuck (2+ failed attempts, contradictory symptoms) - STOP and
  search: the full error message, the flag/API name, upstream
  issues/PR/CHANGELOG, official docs.
- Prefer primary sources: official docs, GitHub issues/PR/CHANGELOG,
  papers; confirm key facts with a second source. Cite the source.
- A known URL - read it directly (`read`), don't search.

## Agent workflow: scouts, subagent-driven development, gates

### Planning: resolve from context, ask the rest, then plan

- Before planning, resolve what the repo, docs and tools can answer
  yourself - never ask the user for facts a `read`/`grep`/search gives.
  Then `ask` only what remains: intent, scope, tradeoffs, irreversible
  steps. Projects / big tasks: at least one question round before the
  plan; small unambiguous changes: no questions.
- Question format: one subject per question; if there is a reason
  (tradeoff/constraint), state it briefly before the question. Questions
  are iterative: ask a block → get answers → ask the next block if new
  ambiguities surfaced. Never dump 20 questions at once.
- Cover (as applicable): goal and definition of done; scope boundaries
  (what we do NOT do); interfaces/formats touched; error/edge-case
  behavior; dependencies and versions; irreversible actions (push, MR,
  migrations); approach preferences when several exist.
- Final statement: after the question rounds, fix a short final task
  statement (goal, boundaries, definition of done, key decisions) -
  confirm it with the user in one message, and only then run
  `skill://writing-plans` against it. On conflict, the user's words win.
- Following the plan: a plan is a commitment; deviation (out-of-plan work,
  scope change) - ask the user first, never silently. Track plan progress
  in `todo`; after each plan task verify its definition of done, not just
  "next on the list".

### Big task → parallel scout swarm

- Big task signals: 3+ independent search directions, an unfamiliar
  repo/stack, or 5+ files touched. Before planning - parallel exploration
  with `scout` agents (one `task` call, one scout per direction), not
  sequential file reading by yourself. Compress scout results into
  contracts for the plan.
- One read-only scout alongside ongoing work is fine; don't fan out
  scouts for volume's sake.

### Subagent-driven development - the default path for projects

- Plugin `@loneexile/omp-superpowers`: skills `brainstorming →
  writing-plans → subagent-driven-development → finishing-a-development-branch`
  and the five SDD agents (`sdd-implementer`, `sdd-reviewer`,
  `sdd-rereviewer`, `sdd-escalation-implementer`, `sdd-final-reviewer`)
  in the `task` roster. Map seat models to YOUR providers via
  `task.agentModelOverrides` in config.yml - the shipped Anthropic pins
  apply only where you have those credentials.
- Project (3+ coupled tasks, new behavior with design choices) - the
  superpowers path: `skill://brainstorming` → `skill://writing-plans` →
  `skill://subagent-driven-development`. ALWAYS dispatch SDD seats by
  their `sdd-*` agent types, never the bundled `task`/`reviewer`.
- Small change (one clear action; no new interface, no migration, no
  security surface) - no SDD: fix, test, one commit.

### After a solved task - quality review with eng-gates

- After each solved task in a code repo (before "done", before review,
  before push): `skill://eng-gates` → `gate fast` per work unit, `gate
  full` before "done". Install: copy `skills/eng-gates/` of this persona
  repo into `~/.omp/agent/skills/eng-gates` (`<skill>` below).
- Run gate.py with Python ≥3.11 (tomllib): `uv` python recommended;
  a system 3.9 will fail with `No module named 'tomllib'`. Windows:
  `python3` is the Microsoft Store stub - use `python` / `uv run python`.
- Uninitialized repo: `python3 <skill>/scripts/gate.py fast -C <repo>`;
  `init` in a repo - only with the user's consent (it writes files into
  the repo). Report: the final summary line of `gate full` + every WARN
  `guard.suppress` entry. Never lower thresholds to go green; scope, not
  the gate, is what you adjust.
- In a repo without code (pure yaml/config) eng-gates does not apply -
  then the review is done by `reviewer`/`security-reviewer`.
- Which tool per language and stage (fast / full / targeted / never a
  gate): `skill://eng-gates/references/gates.md` → "Stage matrix". Read it
  when choosing checks; don't stack linters, profilers are never gates.

## Token discipline (paid / metered models)

- Turn count beats token price: cheap models often take 2–3× turns on
  multi-step work and cost MORE overall. Keep a mid-tier model as the
  floor for reviewers and prose-implementers; cheap tiers only for
  transcription-like tasks (the plan text contains the full code).
- Dispatch briefs: one task, its interfaces, global constraints - nothing
  else. Never paste session history into briefs.
- Read long subagent results from the report file / `agent://<id>`, not by
  echoing them back into the controller context.
- Batch small same-shape edits into ONE dispatch; review the batch as one
  diff.
- Prefer fresh subagents per task over context accumulation in the main
  session; that is what keeps the controller small.