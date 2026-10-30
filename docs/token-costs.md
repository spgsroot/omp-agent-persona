# Token-cost analysis of the dev persona (for metered/home models)

Measured 2026-10-30 on the original corporate setup; byte/4 ≈ token
estimates. Purpose: where the tokens actually go when you pay per token.

## Static per-session costs (system prompt + context files)

| Consumer | ~tokens/session | Notes |
|---|---|---|
| Original AGENTS.md (corporate) | 4.6k | this public copy: **1.9k** |
| persona-dev-prompt.md | 0.6k | permissions appendix |
| Superpowers bootstrap (`<EXTREMELY_IMPORTANT>`) | 0.8k | injected every session by the plugin; re-armed after compaction |
| Skill descriptions in catalog (19 dev skills) | ~2k | name+description per skill, always in prompt |
| Tool schemas (omp built-ins) | fixed | not persona-controllable |

Static floor ≈ **5–6k tokens/session** with the trimmed AGENTS.md.
The original corporate setup was ≈ 8k+.

Levers:
- Trim AGENTS.md (done here: 4.6k → 1.9k).
- The bootstrap is plugin-owned; disabling the extension kills the SDD
  skill-discovery guidance too — not recommended for the dev persona.
- Skill descriptions: add names to `ignoredSkills` for skills you never
  use; each saves its description line (~100 tokens avg).

## Per-dispatch costs (the real driver)

| Consumer | ~tokens | Notes |
|---|---|---|
| sdd-implementer system prompt | 0.6k | fixed per seat |
| sdd-reviewer | 1.6k | fixed |
| sdd-rereviewer | 1.4k | fixed |
| sdd-escalation-implementer | 0.9k | fixed |
| sdd-final-reviewer | 1.4k | fixed |
| Dispatch brief (task text + interfaces) | 0.5–2k | **you control this** |
| Subagent working context (reads, tests output) | 5–50k+ | **you control this via scoping** |
| Controller context growth per task result | 0.1–1k | report-file contract keeps it low |

Multiplied by turn count. The upstream fork's measurement on a real fix
re-review: grok-4.6 seat 9.7 min / 4 turns; sonnet-5 50 s / 1 turn;
DeepSeek flash 100 s / 4 turns — same verdict. **Cheap-but-chatty models
lose money on multi-step work.**

## Levers ranked by impact

1. **Turn count (model choice per seat).** Map `task.agentModelOverrides`
   to YOUR models with a real thinking ladder. Floor for
   sdd-reviewer/sdd-implementer: a mid-tier model. rereviewer can run
   cheap+low (verdict-only work over a small diff). escalation/final —
   your strongest, they run once per plan/stuck task.
2. **Brief hygiene.** One task, its interfaces, global constraints.
   The upstream skill ships scripts (`task-brief`) that extract exactly
   one task's text — use them; never paste plan history.
3. **Report-file contract.** Implementers write full reports to a file and
   return ≤12 lines; the controller reads files/`agent://<id>` fields
   only when needed. Never echo full results into chat.
4. **Wave parallelism ≠ token savings.** Parallel waves save wall-clock,
   not tokens. Token savings come from fewer, well-scoped dispatches:
   batch small same-shape edits into one brief.
5. **Compaction.** omp auto-compacts at threshold; each compaction re-pays
   the static prompt + bootstrap (~1.4k). Long sessions with many small
   tasks lose more to compaction cycles than to the work itself — prefer
   finishing a task to a ledger line and starting fresh dispatches.
6. **`read.summarize`** (omp config): plain `read` summarizes large code
   files to declarations; the SDD seats set `readSummarize: false` because
   they edit what they read. Keep that — a reviewer that missed a hunk
   costs a re-review round (3–5× more than the saved tokens).

## Home-model mapping template

```yaml
task:
  agentModelOverrides:
    sdd-implementer: <your-mid-tier>:high,@task
    sdd-reviewer: <your-mid-tier>:high,@task
    sdd-rereviewer: <your-cheap-tier>:low,@task
    sdd-escalation-implementer: <your-strongest>:max,@slow
    sdd-final-reviewer: <your-strongest>:max,@slow
```

Use exact catalog ids (`omp models ls <provider>`) and only levels the
model offers — unsupported levels are silently clamped, collapsing the
ladder. An override replaces the whole model list, hence the `,@task` /
`,@slow` fallback suffix.