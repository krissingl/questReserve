#!/usr/bin/env bash
set -euo pipefail

YES=0
if [[ "${1:-}" == "--yes" ]]; then
  YES=1
  shift
fi

PLAN_FILE="${1:?Usage: create-tickets.sh [--yes] <path-to-ticket-plan.md>}"
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"

GITHUB_TOKEN=$(grep '^GITHUB_TOKEN=' "$ENV_FILE" | cut -d '=' -f2)
GITHUB_OWNER=$(grep '^GITHUB_OWNER=' "$ENV_FILE" | cut -d '=' -f2)
GITHUB_REPO=$(grep '^GITHUB_REPO='  "$ENV_FILE" | cut -d '=' -f2)

if [[ -z "$GITHUB_TOKEN" || -z "$GITHUB_OWNER" || -z "$GITHUB_REPO" ]]; then
  echo "ERROR: Missing credentials in .env" >&2; exit 1
fi

declare -a TITLES
declare -a BODIES

current_title=""
current_body=""
in_ticket=0

while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ ^##\ Ticket\ [0-9]+\ of\ [0-9]+ ]]; then
    if [[ $in_ticket -eq 1 && -n "$current_title" ]]; then
      TITLES+=("$current_title")
      BODIES+=("$(echo "$current_body" | sed 's/[[:space:]]*$//')")
    fi
    current_title=""
    current_body=""
    in_ticket=1
  elif [[ $in_ticket -eq 1 ]]; then
    if [[ "$line" =~ ^\*\*Title:\*\*\ (.+)$ ]]; then
      current_title="${BASH_REMATCH[1]}"
    elif [[ "$line" == "---" ]]; then
      if [[ -n "$current_title" ]]; then
        TITLES+=("$current_title")
        BODIES+=("$(echo "$current_body" | sed 's/[[:space:]]*$//')")
      fi
      current_title=""
      current_body=""
      in_ticket=0
    elif [[ -n "$current_title" ]]; then
      current_body+="$line"$'\n'
    fi
  fi
done < "$PLAN_FILE"

if [[ $in_ticket -eq 1 && -n "$current_title" ]]; then
  TITLES+=("$current_title")
  BODIES+=("$(echo "$current_body" | sed 's/[[:space:]]*$//')")
fi

TOTAL="${#TITLES[@]}"

if [[ $TOTAL -eq 0 ]]; then
  echo "ERROR: No tickets found in plan file." >&2; exit 1
fi

echo "Found $TOTAL ticket(s) to create:"
for i in "${!TITLES[@]}"; do
  echo "  $((i+1)). ${TITLES[$i]}"
done
echo ""
if [[ $YES -eq 0 ]]; then
  read -rp "Proceed? [y/N] " confirm
  if [[ "${confirm,,}" != "y" ]]; then
    echo "Aborted."; exit 0
  fi
fi

created=0
for i in "${!TITLES[@]}"; do
  title="${TITLES[$i]}"
  body="${BODIES[$i]}"

  cat > /tmp/gh_payload.json << EOF
{
  "title": $(printf '%s' "$title" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(d)))"),
  "body": $(printf '%s' "$body" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>process.stdout.write(JSON.stringify(d)))")
}
EOF

  http_code=$(curl -s -o /tmp/gh_response.json -w "%{http_code}" \
    -X POST \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary @/tmp/gh_payload.json \
    "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues")

  if [[ "$http_code" != "201" ]]; then
    echo ""
    echo "ERROR: Ticket $((i+1)) failed with HTTP $http_code"
    echo "Response: $(cat /tmp/gh_response.json)"
    echo "Created $created/$TOTAL before failure."
    exit 1
  fi

  issue_number=$(grep -o '"number": *[0-9]*' /tmp/gh_response.json | head -1 | grep -o '[0-9]*')
  created=$((created + 1))
  echo "Created $created/$TOTAL: #$issue_number — $title"
done

echo ""
echo "Batch complete. $TOTAL/$TOTAL tickets created."
