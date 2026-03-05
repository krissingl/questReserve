---
name: update-spec
description: Update spec/PROJECT_SPEC.md with an authorized change and append a paired entry to spec/CHANGELOG.md
disable-model-invocation: true
tools: Read, Edit
---

Update `spec/PROJECT_SPEC.md` with the change described below, then immediately append a paired entry to `spec/CHANGELOG.md`. These two writes are atomic — always perform both or neither.

**Requested change:** $ARGUMENTS

---

## Rules

### Files
- Write to `spec/PROJECT_SPEC.md` and `spec/CHANGELOG.md` only. Read any other file for context. Never write anywhere else.

### Spec update rules
- **Supersede, never delete.** Replace outdated content in place. If content must be removed, replace it with a brief note explaining what changed and why — never silently erase.
- **Preserve section order.** Maintain these top-level sections in this exact order unless explicitly told otherwise:
  ```
  ## Vision
  ## Domain Model
  ## Architecture
  ### Backend
  ### Frontend
  ### Database
  ## API Contracts
  ## Feature Roadmap
  ## Open Questions
  ## Constraints & Non-Goals
  ```
- **Update timestamp and status.** On every write, update the `_Last updated` date and Status tag at the top of `PROJECT_SPEC.md`.
- **No changelog section in PROJECT_SPEC.md.** All history lives in `spec/CHANGELOG.md`.
- Make changes surgical and targeted. Preserve surrounding content unless explicitly instructed otherwise.

### Changelog rules
- Append to the bottom of `spec/CHANGELOG.md`. Never edit or reorder existing entries.
- Every entry must follow this exact format:
  ```
  ## [YYYY-MM-DD HH:MM] — <short summary>
  - Triggered by: user direct
  - Changed: <what section changed and why>
  ```
  Use 24-hour time. Be specific but concise.

---

## Workflow

1. Read `spec/PROJECT_SPEC.md` and `spec/CHANGELOG.md` in full.
2. Read any other files needed to understand the requested change.
3. Identify exactly which section(s) need to change.
4. Write the targeted update to `PROJECT_SPEC.md`. Update the `_Last updated` timestamp and Status tag.
5. Immediately append a changelog entry to `spec/CHANGELOG.md`.
6. Report what changed in both files.

---

## Quality checks before finishing

- [ ] Both files were written (spec + changelog)
- [ ] No existing changelog entries were modified
- [ ] No files outside `spec/` were written to
- [ ] Changelog entry follows the exact required format
- [ ] `_Last updated` and Status tag were updated in `PROJECT_SPEC.md`
- [ ] Section order in `PROJECT_SPEC.md` was preserved (unless explicitly changed)
- [ ] Removed content was replaced with an explanatory note, not silently erased
