#!/usr/bin/env python3
from pathlib import Path
import re, sys
root=Path(__file__).resolve().parents[1]
entries=[]
for p in sorted((root/'.claude/skills').glob('*/SKILL.md')):
    txt=p.read_text(encoding='utf-8')
    m=re.search(r'^---\s*(.*?)\s*---', txt, re.S|re.M)
    fm=m.group(1) if m else ''
    name=re.search(r'^name:\s*(.+)$', fm, re.M)
    desc=re.search(r'^description:\s*(.+)$', fm, re.M)
    entries.append((name.group(1).strip() if name else p.parent.name, desc.group(1).strip() if desc else ''))
out=root/'DOCS/PROJECT_SKILLS.md'
lines=['# Project Skills Registry (Generated)','',f'Generated from {len(entries)} on-disk project skills.','', '| Skill | Status | Description |','|---|---|---|']
for name,desc in entries: lines.append(f'| `{name}` | ACTIVE | {desc.replace("|","/")} |')
lines += ['', '## Validation', '- Source of truth: `.claude/skills/**/SKILL.md`.', '- Regenerate after every skill change.', '- CI fails on missing/duplicate skill names.']
out.write_text('\n'.join(lines)+'\n', encoding='utf-8')
print(f'wrote {out} with {len(entries)} skills')
