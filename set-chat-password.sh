#!/usr/bin/env bash
# Usage: ./set-chat-password.sh            (prompts)  | ./set-chat-password.sh --clear (lock: "opens soon")
set -euo pipefail; cd "$(dirname "$0")"
if [ "${1:-}" = "--clear" ]; then H=null; else read -rsp "Team chat password: " P; echo; [ -n "$P" ] || exit 1; H="\"$(printf %s "$P" | sha256sum | cut -d' ' -f1)\""; fi
printf '{"passwordHash": %s}\n' "$H" > chat-config.json
git add chat-config.json && git -c user.name=WellNest -c user.email=Machan1001@users.noreply.github.com commit -qm "Chat password updated" && git push -q && echo "Published. Live in about a minute."
