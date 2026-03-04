---
name: fetch-phase-tickets
description: Fetch all open GitHub tickets for a given phase and return them with full ticket data
disable-model-invocation: true
tools: Read, Bash
---

Fetch all open tickets for the specified phase from GitHub and return them in order.

**Phase identifier:** $ARGUMENTS  (e.g. `5` or `P5`)

---

## Steps

1. Read credentials from `.env`:
   ```bash
   GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' C:/Users/Kay/source/repos/questreserve/questReserve/.env | cut -d '=' -f2)
   GITHUB_OWNER=$(grep '^GITHUB_OWNER=' C:/Users/Kay/source/repos/questreserve/questReserve/.env | cut -d '=' -f2)
   GITHUB_REPO=$(grep '^GITHUB_REPO=' C:/Users/Kay/source/repos/questreserve/questReserve/.env | cut -d '=' -f2)
   ```

2. Normalize the phase identifier to the prefix format: `P<N>:` (e.g. `5` → `P5:`, `P5` → `P5:`).

3. Fetch all open issues (up to 100):
   ```bash
   curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues?state=open&per_page=100"
   ```

4. Filter the results client-side: keep only issues whose `title` starts with `P<N>:`.

5. Sort by issue number ascending.

6. Return a structured list for each ticket:
   - Issue number
   - Full title
   - Body (acceptance criteria)

   Format:
   ```
   Phase <N> tickets (<count> open):

   #<number> — <title>
   <body>

   #<number> — <title>
   <body>
   ...
   ```

## Rules

- If no tickets are found for the phase, report this clearly and halt.
- If the API call fails, halt and report the error before returning anything.
- Never filter out tickets based on content — return all open tickets matching the prefix.
