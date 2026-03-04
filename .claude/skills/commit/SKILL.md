---
name: commit
description: Stage specified files and create a git commit using the ticket title as the message
disable-model-invocation: true
tools: Bash
---

Stage the specified files and commit them using the ticket title as the commit message.

**Arguments:** `<ticket-title> | <space-separated file paths>`

Example: `P5:Add user authentication endpoint | src/api/auth.ts src/services/auth.service.ts`

---

## Steps

1. Parse the arguments:
   - `ticket-title`: the full ticket title (e.g. `P5:Add user authentication endpoint`)
   - `files`: space-separated list of file paths to stage

2. Stage only the specified files — never `git add -A` or `git add .`:
   ```bash
   git add <file1> <file2> ...
   ```

3. Commit using the ticket title as the message:
   ```bash
   git commit -m "P5:Add user authentication endpoint"
   ```

4. Report the result:
   - On success: output the commit hash and message.
   - On failure: halt immediately and report the full error. Do not retry.

## Rules

- Never use `--no-verify` or any flag that bypasses hooks.
- Never amend an existing commit.
- Never push — commits are local only unless the user explicitly requests a push.
- If the file list is empty, halt and report before staging anything.
- A failed commit is a hard stop — report it to the orchestrator and wait for user instruction.
