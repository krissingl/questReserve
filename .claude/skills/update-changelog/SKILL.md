---
name: update-changelog
description: Append a standalone entry to spec/CHANGELOG.md without modifying spec/PROJECT_SPEC.md
disable-model-invocation: true
tools: Read, Edit
---

Append a new entry to `spec/CHANGELOG.md` for the change described below. Use this when logging something that does not require a spec edit (e.g., a process decision, a constraint clarification, a deferred item).

**Entry to log:** $ARGUMENTS

---

## Rules

- Append to the bottom of `spec/CHANGELOG.md` only. Never edit or reorder existing entries.
- Never write to `spec/PROJECT_SPEC.md` or any other file.
- Every entry must follow this exact format:
  ```
  ## [YYYY-MM-DD HH:MM] — <short summary>
  - Triggered by: user direct
  - Changed: <what was decided or noted and why>
  ```
  Use 24-hour time. Be specific but concise.

---

## Workflow

1. Read `spec/CHANGELOG.md` to confirm the current state.
2. Append the new entry at the bottom.
3. Confirm to the user what was appended.
