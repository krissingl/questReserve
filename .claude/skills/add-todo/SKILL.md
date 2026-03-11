---
name: add-todo
description: Append an item to the project todo list at sessions/todo.md. Invoke when the user says "add a todo", "add to the todo list", "make a todo", or similar.
tools: Read, Bash
---

Append a new todo item to `sessions/todo.md`.

**Item to add:** $ARGUMENTS

---

## Steps

1. Read `sessions/state.json` to get the current session reference (`session.id` and `session.date`).
   Format the session ref as: `YYYY-MM-DD_NNN`

2. Append the item using Bash `>>`:

```bash
echo "- [ ] [YYYY-MM-DD_NNN] $ARGUMENTS" >> sessions/todo.md
```

3. Confirm to the orchestrator that the item was added.

## Rules

- Never edit existing entries in `sessions/todo.md`.
- Always include the session reference in brackets.
- If `sessions/state.json` is missing, use `[direct]` as the session reference.
