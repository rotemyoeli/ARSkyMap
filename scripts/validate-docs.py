#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
root=Path(__file__).resolve().parents[1]
required=['CLAUDE.md','RUN_STATE.yaml','WORK_QUEUE.yaml','.claude/settings.json','DOCS/00_README_AND_AUTHORITY.md','DOCS/02_AUTONOMOUS_DEVELOPMENT_MASTER_PLAN.md','DOCS/03_PROJECT_SKILLS_STRATEGY_AND_REGISTRY.md','DOCS/04_COUNCIL_CHARTER_AND_REVIEW_PROTOCOL.md','DOCS/05_CLAUDE_DESIGN_UX_UI_PACKAGE.md','DOCS/06_TEST_VERIFICATION_SCREENSHOT_EVIDENCE_PLAN.md','DOCS/07_RELEASE_GATES_AND_DEFINITION_OF_DONE.md']
missing=[x for x in required if not (root/x).exists()]
if missing: print('MISSING:', *missing, sep='\n'); sys.exit(2)
json.load(open(root/'.claude/settings.json', encoding='utf-8'))
names=[]
for p in (root/'.claude/skills').glob('*/SKILL.md'):
    t=p.read_text(encoding='utf-8'); m=re.search(r'^name:\s*(.+)$', t, re.M)
    if not m: print('missing skill name',p); sys.exit(2)
    names.append(m.group(1).strip())
if len(names)!=len(set(names)): print('duplicate skill names'); sys.exit(2)
print(f'PASS: {len(required)} required files, {len(names)} unique skills')
