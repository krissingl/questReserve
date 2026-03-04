---
name: close-session
description: Write the end-of-session summary to the session log and mark the session complete in the index
disable-model-invocation: true
tools: Read, Bash
---

Close the current session — write the final summary to the session log and update the session index.

**Arguments:** Summary of review findings and dispositions (provided by the orchestrator)

---

## Steps

1. Read `sessions/state.json` to get the session file path, phase, committed tickets, files changed, and flagged decision count.

2. Append the end-of-session summary to the session log using Bash `>>`:

   ```
   ## Session Summary
   Phase: <phase-number>
   Tickets committed: #N, #N, #N
   Files changed: <list>
   Flagged decisions: <count> | None
   Review outcome: <summary from arguments>
   ```

3. Update `sessions/index.md` — find the current session's `in_progress` entry and mark it `complete` with a brief outcome note.

4. Report: `Session YYYY-MM-DD_NNN closed.`

## Rules

- Never use the Edit tool on session log files — always Bash >> for appending.
- Never close a session that has uncommitted tickets in sessions/state.json.
- If sessions/state.json is missing, halt and report.
