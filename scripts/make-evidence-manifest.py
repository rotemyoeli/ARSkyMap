#!/usr/bin/env python3
"""Generate a template-conformant, hashed evidence manifest for a work-package run.

Fills the gap noted by the planning council (QA-1 / RT-2): capture-evidence.sh emits
only SHA256SUMS, but DOCS/06 and stop-evidence-check.sh require a manifest.json that
hashes every artifact. Also emits a machine-readable environment.json (QA-2).

Usage:
  python scripts/make-evidence-manifest.py <phase> <work_package> <run_id> [extra_path ...]

Writes <run_dir>/environment.json, <run_dir>/manifest.json and <run_dir>/SHA256SUMS,
hashing every file in the run dir plus any extra repository artifacts listed.
"""
from pathlib import Path
import hashlib, json, os, platform, shutil, subprocess, sys

root = Path(__file__).resolve().parents[1]


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def tool_version(*cmd) -> str:
    exe = shutil.which(cmd[0])
    if not exe:
        return "absent"
    try:
        out = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        return (out.stdout or out.stderr).strip().splitlines()[0] if (out.stdout or out.stderr) else ""
    except Exception as e:  # noqa: BLE001
        return f"error: {e}"


def git(*args) -> str:
    try:
        return subprocess.run(["git", *args], capture_output=True, text=True, cwd=root).stdout.strip()
    except Exception:  # noqa: BLE001
        return ""


def main() -> int:
    if len(sys.argv) < 4:
        print(__doc__)
        return 2
    phase, wp, run_id = sys.argv[1], sys.argv[2], sys.argv[3]
    extras = [root / p for p in sys.argv[4:]]
    run_dir = root / "artifacts" / "evidence" / phase / wp / run_id
    run_dir.mkdir(parents=True, exist_ok=True)

    environment = {
        "run_id": run_id,
        "os": platform.platform(),
        "git": tool_version("git", "--version"),
        "python": platform.python_version(),
        "node": tool_version("node", "--version"),
        "pnpm": tool_version("pnpm", "--version"),
        "claude": tool_version("claude", "--version"),
        "gh": tool_version("gh", "--version"),
    }
    (run_dir / "environment.json").write_text(json.dumps(environment, indent=2) + "\n", encoding="utf-8", newline="\n")

    # Collect artifacts: everything in the run dir (except the manifest/sums we write) + extras.
    artifact_paths = sorted(
        p for p in run_dir.rglob("*")
        if p.is_file() and p.name not in {"manifest.json", "SHA256SUMS"}
    )
    for e in extras:
        if e.is_file() and e not in artifact_paths:
            artifact_paths.append(e)

    artifacts = [{"path": str(p.relative_to(root)).replace("\\", "/"), "sha256": sha256(p), "bytes": p.stat().st_size}
                 for p in artifact_paths]

    manifest = {
        "run_id": run_id,
        "phase": phase,
        "work_package": wp,
        "commit": git("rev-parse", "HEAD") or "UNCOMMITTED",
        "branch": git("rev-parse", "--abbrev-ref", "HEAD"),
        "environment": environment,
        "requirements": ["GOV-P0-1", "GOV-P0-2", "GOV-P0-3", "GOV-P0-4", "GOV-P0-5", "GOV-P0-6", "GOV-P0-7"],
        "commands": [
            "scripts/bootstrap_project.sh",
            "scripts/validate-docs.py",
            "scripts/generate-skills-registry.py + git diff --exit-code DOCS/PROJECT_SKILLS.md",
            "scripts/guard-destructive-selftest.sh",
            "scripts/quality-gate.sh fast",
        ],
        "artifacts": artifacts,
        "council": {"planning": "planning-council-findings.json", "independent": "council-findings.json"},
        "gate": {"gate": "G-P0", "record": "DOCS/gates/GATE_G-P0.md"},
        "result": os.environ.get("ORBITMARK_RESULT", "PENDING"),
    }
    (run_dir / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8", newline="\n")

    sums = run_dir / "SHA256SUMS"
    lines = {f"{a['sha256']}  {a['path']}" for a in artifacts}
    # include the manifest itself (it is excluded from the artifacts list); environment.json
    # is already in the run dir and therefore already listed.
    mf = run_dir / "manifest.json"
    lines.add(f"{sha256(mf)}  {str(mf.relative_to(root)).replace(chr(92), '/')}")
    # LF terminators so `sha256sum -c` works on Linux CI (Windows host would emit CRLF).
    sums.write_text("\n".join(sorted(lines)) + "\n", encoding="utf-8", newline="\n")

    print(f"wrote {run_dir/'manifest.json'} with {len(artifacts)} artifacts")
    print(f"wrote {run_dir/'environment.json'} and {sums}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
