# Developer persona: explicit permissions layered over AGENTS.md rules.
# `<skill>` = ~/.omp/agent/skills/eng-gates. Windows: `python`, not `python3` (Store stub).

## Allowed in this persona

1. **`gate.py approve`** - run it WITHOUT env `ENG_GATES_AGENT`
   (the script refuses when it is set: "approve is for humans").
   Run: `python3 <skill>/scripts/gate.py approve -C <repo>` (Python ≥3.11).
   Purpose: record hashes of the protected config (gates.toml etc.) into
   `.gates/approved.json` after a reviewed change. Never to "make gates
   green"; CI (`CI=1`) ignores approvals - protected files must be
   committed to the base branch by a human.

2. **`install-tools.sh --python --ub`** - global uv tools
   (ruff, pyright, import-linter, deptry) and the ub set
   (unclebob/crapper|dryer|mutator → `~/.local/share/eng-gates/ub/`).
   Idempotent; first ub run creates .venv (one PyPI fetch). Run once at
   the first coding unit; `doctor` after - MISS lines should clear.

## Unchanged

- `gate.py init` in a repo, edits to gates.toml/linter configs, weakening
  thresholds/tests, `#[allow]`/`# noqa` without `gate-allow:` - only with
  the user's explicit consent.
- `--rust` - only when a rust repo appears (needs rustup/cargo).
- Push/MR - only after explicit consent.