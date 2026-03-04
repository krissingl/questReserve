---
name: take-note
description: Append a timestamped note to the current session log
disable-model-invocation: true
tools: Read, Bash
---

Append a note to the current session log.

**Note content:** $ARGUMENTS

---

## Steps

1. Read `sessions/state.json` to get the current session file path (`session.file`).
2. Append the note to that file using Bash `>>` — never the Edit tool:

```bash
echo "" >> <session-file>
echo "**Note [HH:MM]:** $ARGUMENTS" >> <session-file>
```

Use the current time for `[HH:MM]` in 24-hour format.

3. Confirm to the orchestrator that the note was appended.

## Rules

- Never use the Edit tool on session log files. Always use Bash `>>`.
- Never write to any file other than the current session log.
- If `sessions/state.json` does not exist or `session.file` is missing, halt and report.
