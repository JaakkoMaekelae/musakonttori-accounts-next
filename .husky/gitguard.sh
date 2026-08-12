#!/bin/sh
# Git Guardrails — sourced by all Husky hooks
# Blocks: --no-verify, force-push, restore (warn), reset (warn)

# Check if hook is being bypassed via --no-verify (Husky sets HUSKY=0)
if [ "$HUSKY" = "0" ]; then
  echo ""
  echo "🚫 VIRHE: --no-verify on estetty!"
  echo "   Hookit on ajettava. Korjaa virheet, älä ohita niitä."
  echo ""
  exit 1
fi

# Detect if git command arguments included --no-verify
# (Husky passes original args via HUSKY_GIT_PARAMS or we check process tree)
if echo "$HUSKY_GIT_PARAMS" | grep -q "no-verify" 2>/dev/null; then
  echo ""
  echo "🚫 VIRHE: --no-verify on estetty!"
  echo "   Korjaa hook-virheet, älä ohita niitä."
  echo ""
  exit 1
fi

# For pre-push: block force push ($2 is remote, stdin has refs)
# Force push sends "+refs/heads/..." on stdin
if [ "$(basename "$0")" = "pre-push" ]; then
  while read -r local_ref local_sha remote_ref remote_sha; do
    if echo "$local_ref" | grep -q "^+"; then
      echo ""
      echo "🚫 VIRHE: Force push on estetty!"
      echo "   Local ref: $local_ref"
      echo "   Remote ref: $remote_ref"
      echo "   Käytä git revert tai rebase + normaali push."
      echo ""
      exit 1
    fi
  done
fi
