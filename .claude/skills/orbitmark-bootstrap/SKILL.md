---
name: orbitmark-bootstrap
description: Initialize or validate the OrbitMark repository, environment, autonomous controls, state, work queue, and generated skills registry. Use at first setup and after changing skills or repository structure.
---


# OrbitMark Bootstrap
## Inputs
Repository root, controlled DOCS, `.claude/`, approved defaults.
## Procedure
1. Read authority documents and current repository without editing product scope.
2. Run `scripts/bootstrap_project.sh` and capture the environment report.
3. Validate monorepo paths, tool versions, Git state, settings JSON, hooks, agents, skills, scripts and CI YAML.
4. Regenerate `DOCS/PROJECT_SKILLS.md` from all skill frontmatter and confirm one-to-one coverage.
5. Initialize/validate `RUN_STATE.yaml`, `WORK_QUEUE.yaml`, blockers and evidence directories.
6. Run P0 fast/full gates, including a test that destructive commands are denied.
7. Produce `artifacts/evidence/P0/bootstrap/<run-id>/` and update state.
## Completion
G-P0 recommendation exists; no protected action occurred; all failures are recorded.
