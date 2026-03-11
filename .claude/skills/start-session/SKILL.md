---
name: start-session
description: Open a new session — creates the session log file, initializes state.json, and returns the session reference. Invoke when the user says "start a session", "open a session", "start a new session", or similar. Also invoked by the orchestrator agent at the start of a phase.
tools: Read, Bash
---

Open a new session for the orchestrator.

**Arguments:** `<phase-number> | <session-goal>`

Example: `5 | Implement phase 5 authentication tickets`

---

## Steps

1. Read `sessions/index.md` to find the current highest session number. The next session number is highest + 1, zero-padded to three digits (e.g. `014`).

2. Derive the slug from the session goal: lowercase, spaces to hyphens, max 5 words.
   Example: `Implement phase 5 authentication tickets` → `phase-5-auth-tickets`

3. Build the session file path:
   `sessions/logs/YYYY-MM-DD_NNN_<slug>.md`
   Use today's date in ISO format (YYYY-MM-DD).

4. Create the session log file:
   ```bash
   cat > sessions/logs/YYYY-MM-DD_NNN_<slug>.md << 'EOF'
   # Session YYYY-MM-DD_NNN — <slug>
   Date: YYYY-MM-DD
   Goal: <session-goal>
   Phase: <phase-number>
   EOF
   ```

5. Initialize `sessions/state.json`:
   ```bash
   cat > sessions/state.json << 'EOF'
   {
     "session": {
       "id": "NNN",
       "file": "sessions/logs/YYYY-MM-DD_NNN_<slug>.md",
       "date": "YYYY-MM-DD"
     },
     "phase": "<phase-number>",
     "tickets": [],
     "current_ticket": null,
     "files_changed": [],
     "flagged_decisions": []
   }
   EOF
   ```

6. Append a new entry to `sessions/index.md`:
   ```
   | YYYY-MM-DD_NNN | <session-goal> | in_progress | — |
   ```

7. Report back:
   ```
   Session YYYY-MM-DD_NNN opened.
   Log: sessions/logs/YYYY-MM-DD_NNN_<slug>.md
   ```

## Rules

- Never overwrite an existing `sessions/state.json` without confirming with the user first.
- Never use the Edit tool on session log files — always Bash.
- If `sessions/index.md` is empty or has no numbered entries, start at `001`.
