#!/bin/bash
# usage: tools/publish.sh "commit message"   (run from repo root)
set -e
if grep -rlc "1HE-501\|1V-501\|1T-501\|1P-501\|14R-102\|Mondel" --include=*.html --include=*.js --include=*.yml --include=*.css --include=*.txt --include=*.json . ; then echo "CONFIDENTIAL TAG FOUND - aborting"; exit 1; fi
python3 tools/build_guide_index.py >/dev/null; python3 tools/seo_stamp.py >/dev/null
git add -A
git commit -q -m "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01JVd2ivVy77LhcdSgavngA6"
git pull -q --rebase origin main || (git checkout --theirs assets/data/solvent-facts.json assets/data/site-search.json 2>/dev/null; python3 tools/build_guide_index.py >/dev/null; git add -A; GIT_EDITOR=true git rebase --continue)
git push -q origin main
git log --oneline -1
