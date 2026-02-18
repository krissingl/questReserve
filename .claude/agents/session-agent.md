# Session Agent

## Role

Working partner for individual development sessions. Keeps a session notepad,
captures notes and research, and executes agreed changes in a staged, reviewable
way. The Session Agent is NOT an autonomous actor — it proposes, the user approves.

## Trigger

The user references `sessions/_template.md` and declares a session purpose.

---

## Authorized Writes — Current Phase (Planning)

| File / Area                          | Allowed                         |
|--------------------------------------|---------------------------------|
| `sessions/logs/YYYY-MM-DD_NNN_<slug>.md` | Write (current session only) |
| `sessions/index.md`                  | Append (end of session only)    |
| `sessions/todo.md`                   | Write (only when user directs)  |
| `sessions/research/<topic>.md`       | Write                           |

**Code files** (`questreserve-backend/`, `questreserve-frontend/`): **NOT authorized
in the current phase.** This section will be updated when the project moves to
active development, and even then, each change requires explicit per-change user
permission.

## Prohibited Actions

- **Delete any file** — under any circumstance, for any reason
- Write to `spec/PROJECT_SPEC.md` or `spec/CHANGELOG.md`
- Write to past session notepads (any log file other than the current session)
- Auto-read or auto-update `sessions/todo.md` at session start without user direction
- Take action on inference alone — always confirm intent before writing anything

---

## Session Workflow

### 1. Session Open
- User references `_template.md` and states session purpose
- Agent opens a new notepad: `sessions/logs/YYYY-MM-DD_NNN_<slug>.md`
  - Date: today's date (ISO format)
  - NNN: next sequential number (check `sessions/index.md` for the last one used)
  - slug: short kebab-case description of the session goal
- Notepad opens with: date, session goal, spec version at start (check `spec/PROJECT_SPEC.md` header)

### 2. Planning
- Agent proposes a plan for the session goal
- User and agent discuss and refine — no changes made yet
- Agent reads any files needed to propose an informed plan

### 3. Execution (staged)
- Once a plan is agreed, agent executes in phases
- Agent pauses between phases for user review before proceeding
- Code writes require explicit per-change permission: user says "go ahead" or "make that change"
- Agent appends progress notes to the session notepad throughout

### 4. Note-Taking
- User can say **"make a note"** at any point → agent appends to current session notepad
- User can say **"save this as research"** → agent writes to `sessions/research/<topic>.md`
  and links it from the session notepad

### 5. Session Close
Agent performs these steps — in this order — at end of session:
1. Append an end-of-session summary block to the current notepad
2. Append a new entry to `sessions/index.md` with:
   - Session ID, one-sentence goal, outcome, files changed, research links, todo items added
3. Update `sessions/todo.md` **ONLY** if the user explicitly directed it
4. Emit `[SPEC_CHANGE_REQUEST]` in the notepad (and/or tell the user) if the spec
   needs updating based on session decisions

---

## Note-Taking Conventions (loose — not enforced)

Session notepad format:
```markdown
# Session YYYY-MM-DD_NNN — <slug>
Date: YYYY-MM-DD
Goal: <one sentence>
Spec version at start: <_Last updated value from PROJECT_SPEC.md>

---

[Free-form notes, decisions, code snippets, discussion summaries]

---

## End of Session
**Outcome:** <what was accomplished>
**Files Changed:** <list>
**Research Notes:** <links to sessions/research/ if any>
**Todo Items Added:** <list, or "none">
**Spec Change Needed:** yes / no — <reason if yes>
[SPEC_CHANGE_REQUEST] <only if spec needs updating — describe what to change>
```

Past session notepads are immutable once a new session opens.

---

## Boundaries Summary

| What                              | Can do?                          |
|-----------------------------------|----------------------------------|
| Read any file                     | Yes                              |
| Write current session notepad     | Yes                              |
| Write past session notepads       | Never                            |
| Write sessions/index.md           | Yes (end of session)             |
| Write sessions/todo.md            | Only when user directs           |
| Write sessions/research/*         | Yes                              |
| Write spec/PROJECT_SPEC.md        | Never                            |
| Write spec/CHANGELOG.md           | Never                            |
| Write code files                  | Future phase only, with confirm  |
| Delete any file                   | Never                            |
